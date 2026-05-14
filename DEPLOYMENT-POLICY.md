# 배포 정책 (DEPLOYMENT-POLICY)

> PresentationBuilder 배포·재배포·자산 동기화 규칙. **자체완결 — 외부 헌법 의존 없음.**

---

## §1. 환경 선언 (필수)

PROJECT-GOVERNANCE §1에 따라 본 배포본은 다음 4종을 명시한다 (`CLAUDE.md` §1 참조):

| 키 | 값 | 근거 |
|----|-----|------|
| `ENV_STAGE` | `deploy` | 본 저장소는 배포본. dev SSOT는 `D:\projects\products\PresentationBuilder` |
| `NET_TYPE` | `INTERNET` | Google Fonts CDN 사용 (SKILL.md §4-1) |
| `CDN_ALLOWED` | `true` | Noto Sans KR — fonts.googleapis.com |
| `SELF_CONTAINED` | `true` | 모든 운영 스크립트가 `$PSScriptRoot` 기반 자체완결 |

> ⚠ **CLOSED 망(deploy-CLOSED) 배포 시 CDN 차단 규칙 적용** — §4 참조.

---

## §2. 자체완결 원칙 (Self-Contained)

본 배포본은 **단독으로 실행 가능**해야 한다. 외부 절대경로 의존 금지.

### 2.1 운영 스크립트 — `$PSScriptRoot` 기반

| 스크립트 | BuilderRoot 자동 감지 | OutputRoot 기본값 |
|---------|---------------------|------------------|
| `_scripts/new-presentation.ps1` | `Split-Path $PSScriptRoot -Parent` | `Split-Path $BuilderRoot -Parent` (형제 위치) |
| `_scripts/verify-manifest.ps1` | 동일 | — |
| `_scripts/inject-head.ps1` | 동일 | — |

### 2.2 사용자 오버라이드

자동 감지 결과를 바꾸려면:

```powershell
.\_scripts\new-presentation.ps1 -Name X -Project kickoff `
  -BuilderRoot "D:\custom\PresentationBuilder" `
  -OutputRoot "D:\custom\decks"
```

### 2.3 금지 사항

- 절대경로 하드코딩 (`D:\projects\products\...`) — `$PSScriptRoot` 사용
- `D:\aegis\` 등 외부 시스템 의존 (배포본은 AEGIS 없이도 동작)
- 사용자 자료(`_input/`, `script-text/*.md`, `TTS/audio/`) 커밋

---

## §3. 자산 동기화 정책

### 3.1 SSOT 계층

```
[개발 SSOT]                        [배포본]                       [PPT 인스턴스]
D:\projects\products\               D:\git-deploy\                 사용자 환경
  PresentationBuilder\         ──>    PresentationBuilder\    ──>    MyReport/
  (Anthropic 환경 변경)              (단방향 흡수)                 (new-presentation으로 생성)
                                                                  _core/MANIFEST 추적
```

### 3.2 방향 규칙

- **개발 SSOT → 배포본**: 단방향. 배포 시점에 수동 동기화 (cp + commit + push)
- **배포본 → PPT 인스턴스**: `new-presentation.ps1` 부트스트랩으로 1회 복제, 이후 `pres-config.json._meta.core_version_used` 추적
- **PPT 인스턴스 → 배포본**: ❌ 금지. 인스턴스 개선은 개발 SSOT에서 재현 후 흐름 다시 탐.

### 3.3 매니페스트 무결성

- `_core/MANIFEST.json` sha256은 배포 시점 14개 자산 기준 고정
- `_scripts/verify-manifest.ps1`로 drift 검출
- 매니페스트 갱신은 개발 SSOT에서만 발생 — 배포본은 결과 수령

---

## §4. CLOSED 망 대응 (deploy-CLOSED)

PROJECT-GOVERNANCE에 따라 `NET_TYPE: CLOSED` 환경에서는 CDN 차단:

### 4.1 폰트 로컬 호스팅 절차

```powershell
# 1. Noto Sans KR 자산 사전 다운로드
mkdir _core/fonts
# fonts.google.com에서 Noto Sans KR static woff2 5종 다운로드

# 2. _core/css/fonts.css 신규 생성
@'
@font-face { font-family:'Noto Sans KR'; font-weight:300; src:url('../fonts/NotoSansKR-Light.woff2') format('woff2'); }
@font-face { font-family:'Noto Sans KR'; font-weight:400; src:url('../fonts/NotoSansKR-Regular.woff2') format('woff2'); }
@font-face { font-family:'Noto Sans KR'; font-weight:500; src:url('../fonts/NotoSansKR-Medium.woff2') format('woff2'); }
@font-face { font-family:'Noto Sans KR'; font-weight:700; src:url('../fonts/NotoSansKR-Bold.woff2') format('woff2'); }
@font-face { font-family:'Noto Sans KR'; font-weight:800; src:url('../fonts/NotoSansKR-ExtraBold.woff2') format('woff2'); }
'@ | Set-Content _core/css/fonts.css -Encoding UTF8

# 3. SKILL.md §4-1 템플릿의 `<link href="https://fonts.googleapis.com/...">` 라인 제거
#    + page_head_slot_template의 css 배열에 _core/css/fonts.css 추가

# 4. inject-head.ps1로 모든 슬라이드 재주입
```

### 4.2 환경 전환 매트릭스

| 조합 | CDN | 폰트 소스 | 배포 |
|------|-----|----------|------|
| `deploy-INTERNET` (현재) | ✅ | Google Fonts CDN | OK |
| `deploy-CLOSED` | ❌ | `_core/fonts/*.woff2` | OK (사전 변환) |
| 변환 안 한 채 CLOSED 배포 | — | — | 🔴 **차단** (PROJECT-GOVERNANCE 위반) |

---

## §5. Git / GitHub 정책

### 5.1 Repository 구조

- **Upstream**: `https://github.com/aegissky/PresentationBuilder.git`
- **Branch**: `main` (default)
- **버전 태그**: `v<core_version>` 형식 (예: `v2026.05.13`)

### 5.2 Push 권한 / 흐름

```
개발자 (admin)
  ↓ commit (개발 SSOT)
D:\projects\products\PresentationBuilder
  ↓ cp + .gitignore 정리
D:\git-deploy\PresentationBuilder        ← 본 저장소
  ↓ git commit -m "core_version bump to YYYY.MM.DD"
  ↓ git tag v<core_version>
  ↓ git push origin main --tags
GitHub aegissky/PresentationBuilder
  ↓ git clone (외부 사용자)
사용자 환경
  ↓ new-presentation.ps1
새 PPT 프로젝트
```

### 5.3 .gitignore 정책

추적 제외:
- 사용자 자료: `_input/01_documents/*`, `_input/02_images/*`, `_input/03_data/*` (단 `.gitkeep` 유지)
- 생성 산출물: `script-text/*.md`, `TTS/audio/`, `TTS/wav/`, `TTS/mp3/`
- OS/IDE: `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`
- 동기화 메타: `.sync_baseline.json` (개발 환경 전용)

### 5.4 커밋 메시지 규칙

```
<type>: <subject>

- <변경 항목 1>
- <변경 항목 2>
- core_version bumped to YYYY.MM.DD
```

`type`: `feat` | `fix` | `docs` | `chore` | `deploy` | `refactor`

---

## §6. 사용자 onboarding (clone 직후)

```powershell
# 1. clone
git clone https://github.com/aegissky/PresentationBuilder.git
cd PresentationBuilder

# 2. 자체완결 검증
.\_scripts\verify-manifest.ps1
# 기대: OK 14 / DRIFT 0 / MISSING 0 / EXTRA 0 / TOTAL 14

# 3. 새 PPT 부트스트랩 (PresentationBuilder의 형제로 생성)
.\_scripts\new-presentation.ps1 -Name MyFirstReport -Project kickoff -Org "MyOrg"

# 4. AI 트리거
# Claude Code: cd ../MyFirstReport && claude → "발표 만들어줘"
```

상세: [`QUICKSTART.md`](QUICKSTART.md), [`LLM-WORKFLOW.md`](LLM-WORKFLOW.md), [`PREREQUISITES.md`](PREREQUISITES.md)

---

## §7. 버전 정책

- `_core/MANIFEST.json::core_version` = 배포본 버전 (날짜 형식 `YYYY.MM.DD`)
- 자산 1건이라도 변경되면 `_scripts/verify-manifest.ps1`이 drift 보고 → `core_version` bump 필수
- PPT 인스턴스의 `pres-config.json._meta.core_version_used`로 추적

### 호환성 약속

- **MAJOR (날짜 연 변경)**: 인스턴스 마이그레이션 가이드 동봉
- **MINOR (월 변경)**: 후방 호환 보장 — 기존 PPT 슬라이드 0건 수정
- **PATCH (일 변경)**: 버그 수정·문서 갱신 — 자산 sha256만 변경

---

## §8. 내부 규칙 매핑 (자체완결)

본 배포본은 [`INHERITANCE.md`](INHERITANCE.md) §1에 정의된 5종 내부 규칙으로 자기 충족적이다. 외부 헌법 디렉터리에 의존하지 **않는다**.

| 내부 규칙 | 정의 위치 | 강제 위치 |
|---------|---------|---------|
| `PB-SELF-CONTAINED` | [INHERITANCE.md §3](INHERITANCE.md) | `_scripts/*.ps1` `$PSScriptRoot` |
| `PB-MANIFEST-INTEGRITY` | 동일 | `_core/MANIFEST.json` + `verify-manifest.ps1` |
| `PB-PAGE-SCRIPT-SYNC` | 동일 | `_GUIDE/SKILL.md` Phase 4 |
| `PB-DEPLOY-POLICY` | 본 문서 §7 | 본 문서 전체 |
| `PB-PROMPT-STANDARD` | [PROMPT-STANDARDS.md](PROMPT-STANDARDS.md) | LLM 호출 표준 |

---

## §9. 변경 이력

| 일자 | 버전 | 변경 |
|------|------|------|
| 2026-05-13 | v2026.05.13 | 최초 배포 — 자체완결 원칙 도입 (`$PSScriptRoot` 기반 3 스크립트). 환경 선언 4종 추가. CLOSED 망 대응 §4 신설. |
