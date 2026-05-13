# LLM 워크플로우 — PresentationBuilder 7-Phase 가이드

LLM(Claude / ChatGPT 등)에게 본 빌더로 발표를 만들도록 지시하는 방법.

---

## 큰 그림

```
[사전 준비]                  [LLM 7-Phase]              [산출물]
PREREQUISITES.md             SKILL.md 자동 발동         HTML 슬라이드 N장
QUICKSTART Step 1~2          7개 phase 순서 진행        script-text/*.md
                                                       index.html · viewer
```

---

## LLM 진입 방법 (3가지)

### A. Claude Code (권장)
1. Claude Code에서 새 PPT 프로젝트 폴더 열기 (`D:\projects\products\MyReport`)
2. 상위 `D:\projects\products\PresentationBuilder\_GUIDE\SKILL.md` 가 INHERITANCE 체인으로 자동 인식됨
3. `발표 만들어줘` 입력 → SKILL 발동

### B. ChatGPT / 일반 LLM 웹
1. 다음을 LLM에 컨텍스트 첨부:
   - `_GUIDE/SKILL.md` 전체 (~12K 토큰)
   - `_GUIDE/pres-config.template.json`
   - `_input/` 안 자료 (텍스트 추출)
2. 지시:
   > 첨부된 SKILL.md를 따라 발표 자료를 만들어주세요.
   > 입력 자료는 첨부와 같고, 결과는 HTML 파일 N개 + 스크립트 MD N개로 출력.

### C. LLM API 직접 호출
- 시스템 프롬프트에 `SKILL.md` 포함
- 멀티턴 대화로 Phase 1 인터뷰 진행 → Phase 4 생성

---

## 7 Phase 흐름 (요약)

| Phase | 이름 | LLM 동작 | 사용자 동작 |
|-------|------|---------|-----------|
| **0** | 사전 탐색 | `_input/` 파일 목록 · 요약 · `pres-config.json` 확인 | (없음 — 자동) |
| **1** | 요구사항 수집 | 7가지 질문을 한 블록으로 출력 | 키워드만 답해도 됨 |
| **2** | 심층 분석 | 각 문서를 What/Why/How/Impact/Risk 5항목으로 분해, 12 콘텐츠 유형 분류 | (없음 — 자동) |
| **3** | TOC 확정 | 표준 TOC + 시간 배분 → `[📋 TOC 확인]` 출력 | TOC 확인 또는 수정 |
| **4** | 파일 생성 | 페이지마다 HTML + 스크립트 MD + viewer 갱신 4종 동시 작성 | (대기) |
| **5** | 인덱스·네비 | `index.html` 목차 + `site-actions.js` PAGES + `nav-data.js` 갱신 | (대기) |
| **6** | 품질 검증 | 6 카테고리 체크리스트 자동 점검 | (대기) |
| **7** | 완료 보고 | 산출물 목록 + 권장 다음 단계 출력 | 브라우저로 결과 열기 |

상세는 [`_GUIDE/SKILL.md`](./_GUIDE/SKILL.md) 의 각 Phase 절 참조.

---

## Phase 1 — 7가지 질문 (한 번에)

LLM이 다음과 같이 출력합니다:

```
📋 발표 자료 생성 준비 — 7가지를 알려주세요.
키워드만 입력해도 됩니다.

① 발표 유형  → 착수보고 / 제안서 / 사업계획서 / 중간보고 / 완료보고 / 교육자료 / IR피치덱
② 조직·프로젝트명
③ 청중       → 임원 / 실무책임자 / 현업담당자 / 고객사 / 투자자 / 일반
④ 문체·분위기 → 공식·신뢰감 / 전문·간결 / 친근·설득 / 역동·자신감 / 학술·분석
⑤ 전문 용어  → 하 / 중 / 상
⑥ 총 발표 시간 (분)
⑦ 핵심 메시지 3개
```

7개 모두 답하면 가장 정확. 일부만 답해도 default로 진행됩니다.

---

## Phase 3 — TOC 확정 체크포인트

LLM이 TOC를 제시하면 **반드시 확인** 후 진행 (생성 후 변경은 비용 큼):

```
[📋 TOC 확인]
아래 목차로 생성합니다. 수정하시면 알려주세요.

총 32페이지 · 예상 30분 · 테마: navy
청중: 임원 · 분위기: 공식·신뢰감 · 전문도: 중

── Ⅰ. 사업 개요 (8페이지, 7.5분) ──
  01-1  추진 배경 및 목적         [L02]   60초
  01-2  사업 범위                 [L04]   60초
  ...

→ "확인합니다" 또는 수정 내용을 말씀해주세요.
```

수정 예시:
- "01-3 페이지 삭제"
- "Ⅱ 섹션을 5페이지로 늘려줘"
- "01-4 레이아웃을 L07(AS-IS/TO-BE)로 변경"

---

## Phase 4 — 4종 동시 생성 (헌법)

LLM이 페이지 1장을 만들 때 반드시 4종 산출물을 **동시에** 작성:

1. `01-1.html` — 슬라이드 HTML
2. `script-text/01-1.md` — 발표 스크립트 (⏱·🎯·💡 3섹션)
3. `script-text/viewer.html` 의 `SCRIPTS·MD[]` 갱신
4. `script-text/README.md` 표 행 추가 (누적 시간)

한 종이라도 누락되면 PRESENTATION-PAGE-SCRIPT-SYNC 헌법 위반.

본 빌더의 `inject-head.ps1` 을 사용하면 HTML의 표준 헤드 슬롯을 자동 주입할 수 있습니다:
```powershell
.\_scripts\inject-head.ps1 -SlideFile <slide>.html
```

---

## Phase 6 — 품질 검증 6 카테고리

### 구조 완결성
- [ ] 모든 페이지 PREV/NEXT 정확 연결 (첫=off / 마지막=off)
- [ ] `index.html` 목차 ↔ 실제 파일 일치
- [ ] `nav-data.js` PAGES ↔ TOC 일치
- [ ] `SCRIPTS` 배열 = 발표 흐름 순서
- [ ] `MD[pageId]` 수 = `SCRIPTS.length`

### 콘텐츠 품질
- [ ] 모든 페이지에 `bk-hd` 헤더
- [ ] 모든 페이지에 `data-eid` 속성 (편집 모드용)
- [ ] 모든 스크립트 MD에 ⏱·🎯·💡 3섹션
- [ ] 총 시간 ≈ 요청 시간 (±20%)
- [ ] 청중·톤·전문도 일관

### 기술 검증
- [ ] `anti-flicker` style 첫 번째
- [ ] 모드 복원 script 두 번째 (inline, sync)
- [ ] `_core/` 모든 모듈 로드 (8 JS defer + 4 CSS link)
- [ ] 테마 변수 3종 모두 선언
- [ ] `pres-config.json` 실제 값 채워짐
- [ ] `pres-meta` 주석 존재 + `PresPageMeta.check()` PASS

---

## 자주 묻는 시나리오

### Q1. 자료가 거의 없는데 발표를 만들 수 있나?
A. 가능. Phase 1에서 LLM이 핵심 메시지 3개·발표 유형만 받아도 표준 TOC + 자리표시자 본문으로 생성. 이후 사용자가 편집 모드로 채움.

### Q2. 한 번 만든 후 페이지 추가하려면?
A. 새 슬라이드 HTML 생성 → `inject-head.ps1` 로 헤드 자동 주입 → `nav-data.js` 의 PAGES 배열에 한 줄 추가 → `index.html` TOC에 링크 추가.

### Q3. 메모 기능이 필요 없는 보안 발표라면?
A. `pres-config.json` 에서 `features.tip_memo: false`. 이후 `inject-head.ps1` 가 `memo.js` + `mode-tip.css` 라인을 자동 제외.

### Q4. 다른 LLM(GPT-4 등)으로 같은 결과를 만들 수 있나?
A. 가능. `_GUIDE/SKILL.md` 전체 + `_input/` 자료를 컨텍스트로 제공하면 동일 7-Phase 진행. 단 일부 LLM은 `data-eid` 같은 마커 일관성이 떨어질 수 있어 Phase 6 검증이 더 중요.

### Q5. 슬라이드 파일 1개만 단독으로 다른 발표에 쓰려면?
A. HTML 한 장만 복사 + `_core/` 디렉터리 통째로 복사 + `nav-data.js` 새로 작성. 본 빌더의 `_scripts/new-presentation.ps1` 가 이 3단계를 자동화함.

### Q6. PPT(.pptx) 로 변환?
A. 본 빌더의 1차 출력은 HTML. PPT 변환은 외부 도구(예: `decktape`, `puppeteer` 으로 PDF → PPT) 별도. 향후 후속 작업.

---

## LLM에게 줄 수 있는 짧은 지시 예시

```
[발표 만들어줘]

조직: ACME Corp
유형: 제안서
청중: 고객사
시간: 25분
핵심 메시지: 안정성·자동화·30% 비용절감

_input/01_documents 에 RFP 응답 초안이 있어요. 분석해서 표준 TOC 만들고
Phase 3에서 확인받은 뒤 진행해주세요. 테마는 navy.
```

LLM은 이걸 받아 자동으로 Phase 0~2 진행 → Phase 3 TOC 확정 대기.

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| LLM이 SKILL.md를 못 찾음 | INHERITANCE 체인 미인식 | `SKILL.md` 전체를 직접 컨텍스트에 첨부 |
| 페이지 생성이 끊김 | 토큰 한계 | Phase 4를 섹션별로 분할 진행 |
| 레이아웃이 12 콘텐츠 유형과 안 맞음 | LLM의 유형 분류 실수 | Phase 2 분석 결과를 보고 직접 지정 (`이 페이지는 F 유형` 등) |
| 같은 페이지를 두 번 생성 | LLM 컨텍스트 누락 | TOC를 다시 보여주고 "이 페이지부터 이어서" 지시 |
| 스크립트 MD에 ⏱·🎯·💡 누락 | Phase 4 동시생성 규칙 미준수 | "PRESENTATION-PAGE-SCRIPT-SYNC 헌법대로 4종 동시 생성해주세요" 명시 |
