<#
.SYNOPSIS
  PresentationBuilder/_core/ 자산 정합 검증 — MANIFEST.json sha256 vs 실 파일 비교.

.DESCRIPTION
  PB-MOD W7. 두 가지 모드:
    1. 자기 검증 (인자 없음)
       Builder/_core/MANIFEST.json의 sha256 vs 실 _core/ 파일을 비교.
       drift 자산을 보고.
    2. 외부 PPT 비교 (-Target <PPT 경로>)
       외부 PPT의 _core/ 자산 sha256을 Builder의 MANIFEST와 비교.
       어느 자산이 stale/drift/missing/extra인지 보고.

.PARAMETER Target
  검증할 PPT 경로. 미지정 시 PresentationBuilder 자체 검증.

.PARAMETER BuilderRoot
  PresentationBuilder 경로 (기본 D:\projects\products\PresentationBuilder).

.PARAMETER FailOnDrift
  drift 발견 시 종료 코드 1 반환 (CI 게이트용).

.EXAMPLE
  .\verify-manifest.ps1                                     # Builder 자기 검증
  .\verify-manifest.ps1 -Target D:\projects\products\FooReport
  .\verify-manifest.ps1 -Target D:\projects\products\Presentations -FailOnDrift
#>
[CmdletBinding()]
param(
  [string]$Target,
  [string]$BuilderRoot,
  [switch]$FailOnDrift
)

$ErrorActionPreference = 'Stop'

# PB-DEPLOY §2.1: 자체완결 — $PSScriptRoot 기반.
if (-not $BuilderRoot) { $BuilderRoot = Split-Path $PSScriptRoot -Parent }

$manifestPath = Join-Path $BuilderRoot '_core\MANIFEST.json'
if (-not (Test-Path $manifestPath)) {
  throw "MANIFEST.json 없음: $manifestPath"
}
$manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json

$mode = if ($Target) { 'external' } else { 'self' }
$checkRoot = if ($Target) { $Target } else { $BuilderRoot }

if (-not (Test-Path $checkRoot)) {
  throw "검증 대상 경로 없음: $checkRoot"
}

Write-Host ""
Write-Host "── 매니페스트 검증 ──────────────────────────"
Write-Host "  Mode         : $mode"
Write-Host "  Check root   : $checkRoot"
Write-Host "  Manifest     : $manifestPath"
Write-Host "  core_version : $($manifest.core_version)"
Write-Host "─────────────────────────────────────────────"

$results = @()
foreach ($a in $manifest.assets) {
  $relPath = $a.path -replace '/','\'
  $abs = Join-Path $checkRoot $relPath
  $status   = ''
  $actual   = ''
  $actSize  = 0
  if (-not (Test-Path $abs)) {
    $status = 'MISSING'
  } else {
    $actual  = (Get-FileHash $abs -Algorithm SHA256).Hash.ToLower()
    $actSize = (Get-Item $abs).Length
    if ($actual -eq $a.sha256) {
      $status = 'OK'
    } else {
      $status = 'DRIFT'
    }
  }
  $results += [pscustomobject]@{
    Status         = $status
    Path           = $a.path
    Expected_SHA   = $a.sha256.Substring(0,12) + '..'
    Actual_SHA     = if ($actual) { $actual.Substring(0,12) + '..' } else { '-' }
    Expected_Size  = $a.size
    Actual_Size    = $actSize
  }
}

# Extra 검출 — _core/ 안에 있으나 매니페스트에 없는 파일
$coreDir = Join-Path $checkRoot '_core'
$extras = @()
if (Test-Path $coreDir) {
  $expectedSet = $manifest.assets | ForEach-Object { ($_.path -replace '/','\').ToLower() }
  Get-ChildItem -Path $coreDir -Recurse -File | Where-Object { $_.Name -notin @('MANIFEST.json','features.manifest.json') } | ForEach-Object {
    $rel = $_.FullName.Substring($checkRoot.Length + 1).ToLower()
    if ($rel -notin $expectedSet) {
      $extras += [pscustomobject]@{
        Status = 'EXTRA'
        Path   = $rel -replace '\\','/'
        Size   = $_.Length
      }
    }
  }
}

# ── 보고 ────────────────────────────────────────────────────────────
$summary = [ordered]@{
  ok      = @($results | Where-Object Status -eq 'OK').Count
  drift   = @($results | Where-Object Status -eq 'DRIFT').Count
  missing = @($results | Where-Object Status -eq 'MISSING').Count
  extra   = @($extras).Count
  total   = @($results).Count
}

Write-Host ""
Write-Host "결과 요약:"
Write-Host ("  OK       : {0}" -f $summary.ok)        -ForegroundColor Green
Write-Host ("  DRIFT    : {0}" -f $summary.drift)     -ForegroundColor Yellow
Write-Host ("  MISSING  : {0}" -f $summary.missing)   -ForegroundColor Red
Write-Host ("  EXTRA    : {0}" -f $summary.extra)     -ForegroundColor DarkYellow
Write-Host ("  TOTAL    : {0}" -f $summary.total)

# 상세
if ($summary.drift -gt 0 -or $summary.missing -gt 0) {
  Write-Host ""
  Write-Host "── 문제 자산 상세 ───────────────────────────"
  $results | Where-Object { $_.Status -ne 'OK' } | Format-Table Status,Path,Expected_SHA,Actual_SHA,Expected_Size,Actual_Size -AutoSize | Out-String | Write-Host
}
if ($summary.extra -gt 0) {
  Write-Host ""
  Write-Host "── EXTRA (매니페스트 미등록) ────────────────"
  $extras | Format-Table Status,Path,Size -AutoSize | Out-String | Write-Host
}

# core_version_used 비교 (외부 모드 한정)
if ($mode -eq 'external') {
  $extCfg = Join-Path $checkRoot 'pres-config.json'
  if (Test-Path $extCfg) {
    $cfgObj = Get-Content $extCfg -Raw -Encoding UTF8 | ConvertFrom-Json
    $cv = $null
    if ($cfgObj.PSObject.Properties.Name -contains '_meta') { $cv = $cfgObj._meta.core_version_used }
    Write-Host ""
    Write-Host ("core_version_used: {0}  (Builder: {1})" -f $cv, $manifest.core_version)
    if ($cv -and $cv -ne $manifest.core_version) {
      Write-Host "→ Builder 갱신 가능. propagate-features.ps1 실행 권고." -ForegroundColor Yellow
    }
  } else {
    Write-Host ""
    Write-Host "pres-config.json 부재 — _meta.core_version_used 추적 불가" -ForegroundColor DarkGray
  }
}

# 종료 코드
$exit = 0
if ($FailOnDrift -and ($summary.drift -gt 0 -or $summary.missing -gt 0)) {
  $exit = 1
}
Write-Host ""
Write-Host ("종료 코드: {0}" -f $exit)
exit $exit
