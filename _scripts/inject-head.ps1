<#
.SYNOPSIS
  슬라이드 HTML에 표준 헤드 슬롯(CSS·features script·pres-meta) 자동 주입.

.DESCRIPTION
  PB-MOD W18+W19. features.manifest.json을 SSOT로 사용:
    - loading_order 따라 features 로드 순서 결정
    - css_global + per-feature css 일괄 주입
    - pres-config.json features.{key}=false 토글 시 해당 feature 제외 (W19)
    - <!-- pres-meta: {...} --> 주석을 <head> 직전에 삽입

  주입 위치:
    1. CSS link / feature script — </head> 직전 (기존 manual link 다음)
    2. pres-meta 주석 — <html> 다음 줄 (anti-flicker 식별용)
    3. <script defer src="nav-data.js"></script> — features 다음

.PARAMETER SlideFile
  대상 슬라이드 HTML 파일. 절대경로 또는 작업 디렉터리 기준 상대경로.

.PARAMETER PresRoot
  PPT 프로젝트 루트 (pres-config.json 위치). 미지정 시 SlideFile의 부모 디렉터리.

.PARAMETER BuilderRoot
  PresentationBuilder 경로 (features.manifest.json SSOT).

.PARAMETER DryRun
  실제 파일 변경 없이 어떤 라인이 주입될지 콘솔에 표시.

.PARAMETER Force
  기존 헤드 슬롯이 있어도 강제 재주입.

.EXAMPLE
  .\inject-head.ps1 -SlideFile D:\projects\products\FooReport\01-1.html
  .\inject-head.ps1 -SlideFile FooReport\01-1.html -DryRun
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$SlideFile,
  [string]$PresRoot,
  [string]$BuilderRoot = "D:\projects\products\PresentationBuilder",
  [switch]$DryRun,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $SlideFile)) { throw "슬라이드 파일 없음: $SlideFile" }
$SlideFile = (Resolve-Path $SlideFile).Path
if (-not $PresRoot) { $PresRoot = Split-Path $SlideFile -Parent }

$featuresManPath = Join-Path $BuilderRoot '_core\features.manifest.json'
if (-not (Test-Path $featuresManPath)) { throw "features.manifest.json 없음: $featuresManPath" }
$featuresMan = Get-Content $featuresManPath -Raw -Encoding UTF8 | ConvertFrom-Json

# pres-config.json features.{key} 토글 읽기 (W19)
$cfgPath = Join-Path $PresRoot 'pres-config.json'
$presFeatures = $null
if (Test-Path $cfgPath) {
  $cfg = Get-Content $cfgPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($cfg.PSObject.Properties.Name -contains 'features') { $presFeatures = $cfg.features }
}

# core_version 추출
$coreManPath = Join-Path $PresRoot '_core\MANIFEST.json'
$coreVersion = 'unknown'
if (Test-Path $coreManPath) {
  $coreVersion = (Get-Content $coreManPath -Raw -Encoding UTF8 | ConvertFrom-Json).core_version
}

# 활성 features 결정 (loading_order × 토글 필터)
$activeIds = @()
foreach ($id in $featuresMan.loading_order) {
  $f = $featuresMan.features | Where-Object { $_.id -eq $id } | Select-Object -First 1
  if (-not $f) { continue }
  $enabled = $true
  if ($f.config_in_pres_config -and $presFeatures) {
    $cfgPath2 = $f.config_in_pres_config -split '\.'
    $val = $presFeatures
    foreach ($seg in ($cfgPath2 | Select-Object -Skip 1)) {
      if ($val.PSObject.Properties.Name -contains $seg) { $val = $val.$seg } else { $val = $null; break }
    }
    if ($val -is [bool] -and -not $val) { $enabled = $false }
  }
  if ($enabled) { $activeIds += $id }
}

# layout id 추출 (파일명 prefix L01_* 패턴 또는 알 수 없음)
$slideName = [System.IO.Path]::GetFileNameWithoutExtension($SlideFile)
$layoutId = if ($slideName -match '^(L\d{2}|L99)') { $Matches[1] } else { 'unknown' }

# 주입할 라인 준비
$cssLinks = @()
foreach ($cg in $featuresMan.css_global) { $cssLinks += "<link rel=""stylesheet"" href=""$($cg.path)"">" }
foreach ($id in $activeIds) {
  $f = $featuresMan.features | Where-Object { $_.id -eq $id } | Select-Object -First 1
  if ($f.css) { foreach ($c in $f.css) { $cssLinks += "<link rel=""stylesheet"" href=""$c"">" } }
}
$cssLinks = $cssLinks | Select-Object -Unique

$scriptTags = @()
foreach ($id in $activeIds) {
  $f = $featuresMan.features | Where-Object { $_.id -eq $id } | Select-Object -First 1
  $scriptTags += "<script defer src=""$($f.file)""></script>"
}
$scriptTags += "<script defer src=""nav-data.js""></script>"

$activeJson = '"' + ($activeIds -join '","') + '"'
$presMeta = "<!-- pres-meta: {""core_version"":""$coreVersion"",""layout"":""$layoutId"",""features"":[$activeJson]} -->"

# ── DryRun 출력 ────────────────────────────────────────────────────
if ($DryRun) {
  Write-Host ""
  Write-Host "── inject-head DryRun ───────────────────────"
  Write-Host "  Slide        : $SlideFile"
  Write-Host "  PresRoot     : $PresRoot"
  Write-Host "  core_version : $coreVersion"
  Write-Host "  layout_id    : $layoutId"
  Write-Host "  Active feats : $($activeIds -join ', ')"
  $disabled = $featuresMan.features | ForEach-Object { $_.id } | Where-Object { $_ -notin $activeIds }
  if ($disabled) { Write-Host "  Disabled     : $($disabled -join ', ')" }
  Write-Host ""
  Write-Host "── 주입 예정 라인 ───────────────────────────"
  Write-Host $presMeta
  $cssLinks | ForEach-Object { Write-Host $_ }
  $scriptTags | ForEach-Object { Write-Host $_ }
  exit 0
}

# ── 실제 주입 ──────────────────────────────────────────────────────
$html = Get-Content $SlideFile -Raw -Encoding UTF8

# 기존 pres-meta 라인 제거 (재주입 대비)
$html = [System.Text.RegularExpressions.Regex]::Replace($html, '<!-- pres-meta:.*?-->\s*', '', 'Singleline')

# 기존 _core/* link/script 제거 (재주입 대비)
if ($Force) {
  $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<link[^>]+_core/[^>]+>\s*', '')
  $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<script[^>]+_core/[^>]+></script>\s*', '')
  $html = [System.Text.RegularExpressions.Regex]::Replace($html, '<script[^>]+nav-data\.js[^>]*></script>\s*', '')
}

# pres-meta는 <head> 직전 (또는 <html> 다음)
if ($html -match '<head>') {
  $html = $html -replace '<head>', "$presMeta`r`n<head>"
} else {
  $html = $presMeta + "`r`n" + $html
}

# CSS·Script는 </head> 직전
$injection = ($cssLinks + $scriptTags) -join "`r`n"
if ($html -match '</head>') {
  $html = $html -replace '</head>', "$injection`r`n</head>"
} else {
  Write-Warning "</head> 미발견 — 주입 위치 모호. 파일 끝에 append."
  $html += "`r`n" + $injection
}

# UTF-8 BOM 저장 (PS 5.1 호환)
[System.IO.File]::WriteAllText($SlideFile, $html, [System.Text.UTF8Encoding]::new($true))

Write-Host ""
Write-Host "✅ 주입 완료: $SlideFile" -ForegroundColor Green
Write-Host "  features : $($activeIds.Count)/$($featuresMan.loading_order.Count) 활성"
Write-Host "  layout   : $layoutId · core_version: $coreVersion"
