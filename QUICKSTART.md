# 5분 빠른 시작

PresentationBuilder로 새 발표 자료를 만드는 가장 짧은 경로.

---

## Step 1 — 새 프로젝트 부트스트랩 (10초)

```powershell
cd D:\git-deploy\PresentationBuilder
.\_scripts\new-presentation.ps1 -Name MyReport -Project kickoff -Org "회사명" -Duration 30
```

옵션:
| 인자 | 값 |
|------|-----|
| `-Name` | 새 폴더명. `D:\projects\products\<Name>` 으로 생성 |
| `-Project` | `kickoff` / `proposal` / `business-plan` / `interim` / `completion` / `education` / `ir-pitch` |
| `-Theme` | `navy` / `forest` / `charcoal` (선택 — 미지정 시 프로젝트 default) |
| `-Org` | 조직명 (선택) |
| `-Duration` | 분 단위 (선택 — 미지정 시 프로젝트 권장값) |

생성 결과:
```
D:\projects\products\MyReport\
├── _core/                          자산 사본 (Builder 동기 추적)
├── _input/                         ← 여기에 자료 채우기
│   ├── 01_documents/
│   ├── 02_images/
│   └── 03_data/
├── _governance/                    상속·인덱스
├── nav-data.js                     페이지 네비 데이터 (자동 생성됨)
├── pres-config.json                프로젝트 설정 + _meta.core_version_used
├── CLAUDE.md / CLAUDE_local.md     LLM 상속 진입점
└── README.md
```

## Step 2 — 자료 채우기 (5분)

`_input/` 의 각 폴더에 자료 분류:
- 텍스트 문서 → `_input/01_documents/` (.md 권장)
- 이미지 → `_input/02_images/`
- 데이터 → `_input/03_data/`

최소 한 개라도 있으면 됨. 없으면 LLM이 Phase 1에서 보완 질문.

## Step 3 — LLM 트리거 (대화 1회)

LLM(Claude / ChatGPT)에게 다음 중 하나 입력:

> 발표 만들어줘

또는

> `D:\projects\products\MyReport` 폴더에서 PresentationBuilder SKILL.md 따라 발표 자료 만들어줘

LLM 진행 (자동):
1. **Phase 0** — `_input/` 파일 목록·요약 (2분)
2. **Phase 1** — 7가지 질문 (한 블록으로) — 답변
3. **Phase 2** — 문서 5항목 분석 (What / Why / How / Impact / Risk)
4. **Phase 3** — TOC 확정 — `[📋 TOC 확인]` 보고 후 확인
5. **Phase 4** — 페이지·스크립트·뷰어 동시 생성
6. **Phase 5** — `index.html` + `site-actions.js` 갱신
7. **Phase 6** — 6 카테고리 품질 검증
8. **Phase 7** — 완료 보고

## Step 4 — 결과 확인

```powershell
# 브라우저에서 열기
start D:\projects\products\MyReport\index.html
```

또는 로컬 서버:
```powershell
cd D:\projects\products\MyReport
python -m http.server 8000
# http://localhost:8000 열기
```

## Step 5 — 자기 검증 (선택)

브라우저 콘솔 (F12):
```javascript
PresPageMeta.check()
// → [page-meta-check] OK · 8 features · core_version=2026.05.13 · layout=L02
```

PowerShell 자산 검증:
```powershell
D:\git-deploy\PresentationBuilder\_scripts\verify-manifest.ps1 -Target D:\projects\products\MyReport
# OK: 14  DRIFT: 0  MISSING: 0  EXTRA: 0  TOTAL: 14
```

## 슬라이드 추가 (선택)

새 슬라이드 HTML을 만들었으면 표준 헤드 슬롯 자동 주입:

```powershell
D:\git-deploy\PresentationBuilder\_scripts\inject-head.ps1 `
  -SlideFile D:\projects\products\MyReport\02-3.html
```

`-DryRun` 으로 어떤 라인이 주입될지 미리 확인 가능.

`pres-config.json` 의 `features.tip_memo: false` 등을 설정하면 해당 기능은 자동 제외됩니다.

## 다음 — 깊이 알기

- LLM 워크플로우 상세 → [`LLM-WORKFLOW.md`](./LLM-WORKFLOW.md)
- 사전 준비사항 / 트러블슈팅 → [`PREREQUISITES.md`](./PREREQUISITES.md)
- 7-Phase 방법론 전체 → [`_GUIDE/SKILL.md`](./_GUIDE/SKILL.md)
- 빌더 명세 → [`requirements/PRESENTATION-BUILDER-SPEC.md`](./requirements/PRESENTATION-BUILDER-SPEC.md)
