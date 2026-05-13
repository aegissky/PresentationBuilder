<#
.SYNOPSIS
  새 PPT 프로젝트 부트스트랩 — PresentationBuilder의 _core 자산 + 프로젝트 템플릿 골격 복제.

.DESCRIPTION
  PB-MOD W16. 새 PPT 폴더를 만들고 다음을 구성한다:
    1. _core/ 디렉터리 통째 복제 (CSS·JS·매니페스트)
    2. _templates/projects/<type>/manifest.json 읽어 sections·pages 가이드 적용
    3. pres-config.json 작성 (pres-config.template.json + 인자 채움)
    4. nav-data.js 골격 복제 (_templates/nav-data.template.js)
    5. _governance/ INDEX·INHERITANCE 표준 템플릿 작성
    6. README.md / CLAUDE.md / CLAUDE_local.md 자동 작성
    7. _input/ 빈 폴더 + 사용자 안내

.PARAMETER Name
  새 PPT 폴더 이름. <OutputRoot>\<Name> 으로 생성 (OutputRoot 기본 = BuilderRoot 부모).

.PARAMETER Project
  프로젝트 유형 — kickoff / proposal / business-plan / interim / completion / education / ir-pitch

.PARAMETER Theme
  테마 — navy / forest / charcoal. 미지정 시 프로젝트 매니페스트의 default_theme 사용.

.PARAMETER Org
  조직명 / 회사명 (선택).

.PARAMETER Duration
  총 발표 시간(분). 미지정 시 프로젝트 매니페스트의 duration_range 중간값 사용.

.PARAMETER BuilderRoot
  PresentationBuilder 루트 경로. 미지정 시 본 스크립트의 부모 디렉터리(자체완결, $PSScriptRoot 기반).

.PARAMETER OutputRoot
  새 PPT가 생성될 부모 디렉터리. 미지정 시 BuilderRoot의 부모(배포본의 형제 위치).

.EXAMPLE
  .\new-presentation.ps1 -Name FooReport -Project kickoff -Org "ACME" -Duration 30
  # → BuilderRoot 자동 감지 + 형제 위치에 FooReport 생성

.EXAMPLE
  .\new-presentation.ps1 -Name PitchDeck -Project ir-pitch -Theme charcoal -OutputRoot D:\presentations
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Name,
  [Parameter(Mandatory=$true)]
  [ValidateSet('kickoff','proposal','business-plan','interim','completion','education','ir-pitch')]
  [string]$Project,
  [ValidateSet('navy','forest','charcoal')]
  [string]$Theme,
  [string]$Org = "",
  [int]$Duration = 0,
  [string]$BuilderRoot,
  [string]$OutputRoot,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

# PB-DEPLOY §2.1: 자체완결 — $PSScriptRoot 기반 자동 감지.
if (-not $BuilderRoot) { $BuilderRoot = Split-Path $PSScriptRoot -Parent }
if (-not $OutputRoot)  { $OutputRoot  = Split-Path $BuilderRoot -Parent }
$Target = Join-Path $OutputRoot $Name

if (-not (Test-Path (Join-Path $BuilderRoot '_core'))) {
  throw "BuilderRoot에 _core 디렉터리 없음: $BuilderRoot (-BuilderRoot 명시 필요)"
}
if ($BuilderRoot -eq $Target) {
  throw "Builder 자체에 부트스트랩 금지 (self-bootstrap)."
}
if (Test-Path $Target) {
  if ($Force) {
    Write-Warning "기존 폴더 발견 + -Force → 덮어쓰기 진행: $Target"
  } else {
    throw "이미 존재: $Target  (덮어쓰려면 -Force)"
  }
}

# ── 프로젝트 매니페스트 로드 ────────────────────────────────────────────
$projManPath = Join-Path $BuilderRoot "_templates\projects\$Project\manifest.json"
if (-not (Test-Path $projManPath)) {
  throw "프로젝트 매니페스트 없음: $projManPath"
}
$projMan = Get-Content $projManPath -Raw -Encoding UTF8 | ConvertFrom-Json

if (-not $Theme)    { $Theme = $projMan.default_theme }
if ($Duration -le 0 -and $projMan.duration_range.Count -eq 2) {
  $Duration = [int](($projMan.duration_range[0] + $projMan.duration_range[1]) / 2)
}

Write-Host ""
Write-Host "── 부트스트랩 설정 ───────────────────────────"
Write-Host "  Name        : $Name"
Write-Host "  Project type: $Project ($($projMan.display_name))"
Write-Host "  Theme       : $Theme"
Write-Host "  Org         : $Org"
Write-Host "  Duration    : $Duration min"
Write-Host "  Target      : $Target"
Write-Host "──────────────────────────────────────────────"

# ── 1. 디렉터리 생성 ───────────────────────────────────────────────────
$null = New-Item -ItemType Directory -Path $Target -Force
$null = New-Item -ItemType Directory -Path (Join-Path $Target '_input\01_documents') -Force
$null = New-Item -ItemType Directory -Path (Join-Path $Target '_input\02_images')    -Force
$null = New-Item -ItemType Directory -Path (Join-Path $Target '_input\03_data')      -Force
$null = New-Item -ItemType Directory -Path (Join-Path $Target '_governance')          -Force
$null = New-Item -ItemType Directory -Path (Join-Path $Target 'script-text')          -Force
$null = New-Item -ItemType Directory -Path (Join-Path $Target 'TTS')                  -Force

# ── 2. _core 복제 ──────────────────────────────────────────────────────
Copy-Item -Path (Join-Path $BuilderRoot '_core') -Destination $Target -Recurse -Force

# ── 3. nav-data.js 골격 복제 ───────────────────────────────────────────
Copy-Item -Path (Join-Path $BuilderRoot '_templates\nav-data.template.js') -Destination (Join-Path $Target 'nav-data.js') -Force

# ── 4. pres-config.json 작성 ───────────────────────────────────────────
$cfgTplPath = Join-Path $BuilderRoot '_GUIDE\pres-config.template.json'
if (Test-Path $cfgTplPath) {
  $cfg = Get-Content $cfgTplPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $cfg.project.name  = $Name
  $cfg.project.org   = $Org
  $cfg.project.theme = $Theme
  $cfg.brief.type     = $projMan.display_name
  $cfg.brief.duration = $Duration
  $cfg.output.path    = $Target

  # _meta 추가 — core_version 추적 (Stage 4 매니페스트 연동)
  $coreManPath = Join-Path $Target '_core\MANIFEST.json'
  $coreVersion = $null
  if (Test-Path $coreManPath) {
    $coreVersion = (Get-Content $coreManPath -Raw -Encoding UTF8 | ConvertFrom-Json).core_version
  }
  $cfg | Add-Member -NotePropertyName '_meta' -NotePropertyValue ([pscustomobject]@{
    core_version_used = $coreVersion
    bootstrapped_at   = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    bootstrapped_by   = 'new-presentation.ps1'
    project_template  = $Project
  }) -Force

  $cfg | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $Target 'pres-config.json') -Encoding UTF8
}

# ── 5. _governance / INDEX·INHERITANCE ─────────────────────────────────
$today = (Get-Date).ToString('yyyy-MM-dd')
@"
---
type: GOVERNANCE_INDEX
project_code: $Name
created: $today
owner: admin
---

# $Name 거버넌스 인덱스

| 항목 | 값 |
|------|---|
| project_code | $Name |
| project_type | $Project |
| 기술 스택 | HTML / CSS / JS |
| 상태 | active |
| bootstrap | PresentationBuilder/_scripts/new-presentation.ps1 |
"@ | Set-Content (Join-Path $Target '_governance\INDEX.md') -Encoding UTF8

@"
---
type: INHERITANCE
project_code: $Name
created: $today
owner: admin
---

# $Name — AEGIS 상속 계약

## 상속 계층
- L0  D:\aegis\core\constitution\
- L1  D:\aegis\base\
- L2  $Target\

## 상속 선언
- 전역 헌법 전부 적용
- PresentationBuilder _core/ SSOT 추적 (core_version_used = pres-config.json._meta)
- _GUIDE/SKILL.md (PresentationBuilder) 트리거 키워드 자동 발동
"@ | Set-Content (Join-Path $Target '_governance\INHERITANCE.md') -Encoding UTF8

# ── 6. CLAUDE.md / CLAUDE_local.md ─────────────────────────────────────
@"
---
type: PROJECT_LOCAL
project_code: $Name
project_type: $Project
created: $today
owner: admin
aegis_root: D:\aegis
---

# $Name — 프로젝트 진입점

> SELECTIVE-SYNC 적용 — 미기재 항목은 상위 계층에서 탐색
> 탐색 순서: CLAUDE_local.md → D:\aegis\CLAUDE.md → ~/.claude/CLAUDE.md

## 프로젝트 개요
- 목적: $($projMan.display_name) 발표 자료
- 스택: HTML · CSS · JS · TTS
- 부트스트랩: PresentationBuilder/_scripts/new-presentation.ps1
- 빌더 자산: _core/ (PresentationBuilder SSOT 추적)

## 거버넌스
- _governance/INDEX.md
- _governance/INHERITANCE.md
"@ | Set-Content (Join-Path $Target 'CLAUDE.md') -Encoding UTF8

@"
# $Name — 프로젝트 로컬 오버라이드

(빈 파일 — 필요 시 항목 추가)
"@ | Set-Content (Join-Path $Target 'CLAUDE_local.md') -Encoding UTF8

# ── 7. _input/README.md ────────────────────────────────────────────────
@"
# 입력 자료 가이드

각 폴더에 자료를 분류해 넣은 뒤, AI에게 "발표 만들어줘" 트리거를 사용하세요.

| 폴더 | 용도 |
|------|------|
| 01_documents/ | 텍스트 문서 (.md, .docx, .pdf) |
| 02_images/    | 이미지 (.png, .jpg, .svg) |
| 03_data/      | 데이터 (.csv, .xlsx, .json) |

## 프로젝트 정보
- 유형: $Project ($($projMan.display_name))
- 예상 시간: $Duration 분
- 테마: $Theme

## 다음 단계
1. _input/ 에 자료 채움
2. PresentationBuilder/_GUIDE/SKILL.md 트리거 ("발표 만들어줘")
3. AI가 Phase 0~7 진행 → 슬라이드 N장 + 스크립트 MD 생성
"@ | Set-Content (Join-Path $Target '_input\README.md') -Encoding UTF8

# ── 8. README.md ───────────────────────────────────────────────────────
@"
# $Name

$($projMan.display_name) 발표 자료 — PresentationBuilder 기반.

- 부트스트랩: $today
- 프로젝트 유형: $Project
- 예상 시간: $Duration 분 · 테마: $Theme
- 자산 SSOT: D:\projects\products\PresentationBuilder\_core\

## 시작
1. _input/ 에 자료 넣기
2. AI에게 "발표 만들어줘"
3. 생성된 슬라이드 확인 → index.html 열기

## 자산 동기화
PresentationBuilder의 _core/ 자산이 갱신되면 propagate-features.ps1 실행:

    PresentationBuilder\_scripts\propagate-features.ps1 -Targets $Name
"@ | Set-Content (Join-Path $Target 'README.md') -Encoding UTF8

Write-Host ""
Write-Host "✅ 부트스트랩 완료: $Target" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:"
Write-Host "  1. $Target\_input\ 에 자료 넣기"
Write-Host "  2. AI에게 ""발표 만들어줘"" 트리거 (PresentationBuilder/_GUIDE/SKILL.md 발동)"
Write-Host "  3. 슬라이드 생성 완료 후 $Target\index.html 열기"
