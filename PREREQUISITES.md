# 사전 준비사항

PresentationBuilder를 LLM과 함께 사용하기 위한 환경 점검.

---

## 1. 필수 도구

| 도구 | 버전 | 용도 | 설치 확인 |
|------|------|------|----------|
| **Windows 10/11** | 21H2+ | 운영체제 (PowerShell 5.1 포함) | `winver` |
| **PowerShell** | 5.1+ 또는 7.x | `_scripts/*.ps1` 실행 | `$PSVersionTable.PSVersion` |
| **모던 브라우저** | Chromium 110+ / Firefox 110+ / Safari 16+ | 슬라이드 렌더 + SPA 라우팅 + localStorage | 브라우저 정보 |
| **LLM CLI 또는 웹** | Claude Code / ChatGPT / Copilot 등 | 7-Phase 방법론 실행 | (각 도구 안내) |
| **Git** (선택) | 2.30+ | 버전 관리, 협업 | `git --version` |

PowerShell 실행 정책이 막혀 있으면:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 2. LLM 환경 — 권장 설정

LLM이 본 빌더의 SKILL.md를 인식하려면 다음 중 하나가 충족돼야 합니다:

### 옵션 A — Claude Code (권장)
1. `~/.claude/` 또는 프로젝트 루트 `.claude/` 에 PresentationBuilder 경로 인덱싱
2. Claude Code에서 `D:\git-deploy\PresentationBuilder` 디렉터리 열기
3. `_GUIDE/SKILL.md` 가 자동 인식 — 트리거 키워드(`발표 만들어줘`)로 발동

### 옵션 B — ChatGPT / 일반 LLM 웹
1. `_GUIDE/SKILL.md` 전체 내용을 LLM에 컨텍스트로 제공 (복사·붙여넣기)
2. `_GUIDE/pres-config.template.json` 도 함께 첨부
3. LLM에게 명시: "이 SKILL을 따라 발표를 만들어줘"

### 옵션 C — 로컬 LLM (Ollama, llama.cpp 등)
- 컨텍스트 길이가 32K 이상인 모델 권장 (SKILL.md만 ~12K, 자료 포함 시 더 큼)
- 멀티턴 대화 지원 필수 (Phase 1 인터뷰 → Phase 2~7 진행)

## 3. 디렉터리 구조 이해

```
PresentationBuilder/
├── _input/                       ← 여기에 자료 채움
│   ├── 01_documents/            (.md, .docx, .pdf, .txt)
│   ├── 02_images/               (.png, .jpg, .svg)
│   └── 03_data/                 (.csv, .xlsx, .json)
├── _core/                        자산 SSOT — 건드리지 말 것
├── _templates/                   레이아웃·프로젝트 골격 — 건드리지 말 것
├── _scripts/                     부트스트랩·검증 도구
├── _GUIDE/                       LLM 방법론
└── (생성된 슬라이드들)            01-1.html, 01-2.html, ...
```

## 4. 입력 자료 준비 — 체크리스트

발표를 만들기 전에 다음 중 최소 1개는 `_input/` 에 있어야 함:

- [ ] **요약 문서** — 발표할 내용의 핵심 1~2장 (.md 권장)
- [ ] **상세 자료** — 본문에 들어갈 텍스트·표·수치 자료
- [ ] **이미지** — 다이어그램·로고·스크린샷 (선택)
- [ ] **데이터** — KPI·통계 CSV 또는 JSON (선택)

자료가 부족해도 LLM이 Phase 1 인터뷰에서 보완 질문합니다.

## 5. 결정 사항 미리 정리 (선택)

LLM 인터뷰가 더 빠르고 정확하게 진행됩니다:

| 항목 | 예시 |
|------|------|
| 발표 유형 | 착수보고 / 제안서 / 사업계획서 / 중간보고 / 완료보고 / 교육자료 / IR피치덱 |
| 청중 | 임원 / 실무책임자 / 현업담당자 / 고객사 / 투자자 / 일반 |
| 분위기 | 공식·신뢰감 / 전문·간결 / 친근·설득 / 역동·자신감 / 학술·분석 |
| 전문 용어 | 하 / 중 / 상 |
| 발표 시간 | 10 / 20 / 30 / 45 / 60 / 90 분 |
| 테마 | navy(기본) / forest(녹색) / charcoal(중후) |
| 핵심 메시지 3개 | (자유 입력) |

## 6. 점검 명령

준비 완료 후 다음 명령으로 모든 자산이 정상인지 확인:

```powershell
cd D:\git-deploy\PresentationBuilder
.\_scripts\verify-manifest.ps1
```

기대 출력:
```
OK: 14   DRIFT: 0   MISSING: 0   EXTRA: 0   TOTAL: 14
종료 코드: 0
```

drift가 있으면 [`_core/MANIFEST.json`](_core/MANIFEST.json) 갱신이 필요합니다.

## 7. 흔한 함정

| 함정 | 증상 | 대처 |
|------|------|------|
| PowerShell 5.1에서 here-string 한글 깨짐 | 스크립트 실행 시 인코딩 오류 | 파일 UTF-8 BOM 저장 |
| 슬라이드 열면 화면 깜빡거림 | anti-flicker style 누락 | `inject-head.ps1` 다시 실행 |
| 메모·편집 기능 안 보임 | `_core/` 로드 실패 또는 `pres-config.features.{tip_memo,edit_mode}: false` | `verify-manifest.ps1` + 콘솔 `PresPageMeta.check()` |
| 페이지 네비 드롭다운이 비어 있음 | `nav-data.js` 미주입 또는 `window.PRES_NAV_DATA` 미정의 | `_templates/nav-data.template.js` 참조해 작성 |
| 브라우저 콘솔 fetch 실패 | `file://` 환경 한계 | 로컬 서버로 열기 (예: `python -m http.server 8000`) |

## 8. 다음 단계

준비가 끝났으면 → [`QUICKSTART.md`](./QUICKSTART.md)
