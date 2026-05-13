# PresentationBuilder Master Skill
<!-- [INSTR 2026-04-30] 착수보고회 전체 방법론 → 범용 발표 시스템 자동 생성 스킬 -->

> **버전**: 2.0 · **기준 프로젝트**: D:/projects/products/Presentations (착수보고회)  
> **트리거**: "발표 만들어줘" / "프리젠테이션 생성" / "보고서 슬라이드" / "PresentationBuilder"  
> **원칙**: 분석 → 설계 → 생성 → 검증 4단계를 반드시 순서대로 실행. 단계 건너뜀 금지.

---

## 스킬 로드 시 필수 선행 읽기

이 스킬 실행 전, CLAUDE는 아래 파일들을 반드시 읽는다:

```
1. D:/projects/products/PresentationBuilder/requirements/PRESENTATION-BUILDER-SPEC.md
   → HTML 템플릿·CSS 변수·컴포넌트 전체 명세

2. D:/projects/products/PresentationBuilder/_GUIDE/pres-config.template.json
   → 설정 파일 구조

3. (존재하면) 출력 경로/pres-config.json
   → 사용자 프로젝트 설정
```

---

## Phase 0 — 사전 탐색 (2분 이내 완료)

```
[ ] _input/01_documents/ 파일 목록 + 내용 요약 (각 문서 핵심 200자)
[ ] _input/02_images/    이미지 목록 + 용도 추정
[ ] _input/03_data/      데이터 목록 + 수치 추출
[ ] pres-config.json 존재 확인
    → 있으면: 설정 로드 후 Phase 2 로 바로 진행
    → 없으면: Phase 1 인터뷰 진행
```

---

## Phase 1 — 요구사항 수집 (대화형 인터뷰)

### 1-1. 7문항 한 블록 출력 (절대 하나씩 물어보지 말 것)

```
📋 발표 자료 생성 준비 — 7가지를 알려주세요.
키워드만 입력해도 됩니다.

① 발표 유형
   착수보고 / 제안서 / 사업계획서 / 중간보고 / 완료보고 / 교육자료 / IR피치덱 / 기타

② 조직명 · 프로젝트명
   예) 웹케시 — 통합자금관리시스템 고도화

③ 청중
   임원(C-level) / 실무책임자 / 현업담당자 / 고객사 / 투자자 / 일반

④ 문체·분위기
   공식·신뢰감 / 전문·간결 / 친근·설득 / 역동·자신감 / 학술·분석

⑤ 전문 용어 수준
   하(누구나 이해) / 중(업계 용어 허용) / 상(기술 전문 용어 자유)

⑥ 총 발표 시간 (분)
   10 / 20 / 30 / 45 / 60 / 90

⑦ 핵심 메시지 3개
   예) "안정적 이전", "업무 자동화", "비용 절감 30%"

──────────────────────────────────────
선택 옵션:
  목차 구성이 있으면 붙여 넣어주세요 (없으면 자동 제안)
  테마: navy(기본) / forest(녹색) / charcoal(중후)
```

### 1-2. 인터뷰 응답 파싱 규칙

| 항목 | 기본값 (미입력 시) |
|------|-----------------|
| 발표 유형 | "보고서" |
| 청중 | "임원" |
| 분위기 | "공식·신뢰감" |
| 전문 용어 | "중" |
| 발표 시간 | 30분 |
| 테마 | "navy" |

---

## Phase 2 — 심층 분석 (가장 중요한 단계)

### 2-1. 문서 분석 프레임워크

입력 문서마다 아래 5개 항목을 추출:

```
[문서명 분석]
1. 핵심 주장 (What)   : 이 문서가 말하려는 단 하나의 결론
2. 근거·증거 (Why)    : 수치, 사례, 비교 데이터
3. 방법·수단 (How)    : 구체적 접근법, 단계, 기술
4. 영향·효과 (Impact) : 청중에게 미치는 가치, 변화
5. 리스크·전제 (Risk) : 전제 조건, 주의사항
```

### 2-2. 콘텐츠 유형 분류 (12종)

문서에서 추출한 각 내용을 아래 12종으로 분류:

| 유형 | 설명 | 최적 레이아웃 |
|------|------|-------------|
| **A. 배경·현황** | 왜 이 일을 하는가 | L02 (1단 본문) + .pcard |
| **B. 문제·한계** | 지금 무엇이 문제인가 | .g2/.g3 + .card.r (빨강 강조) |
| **C. 목표·목적** | 무엇을 달성하는가 | .pstrip 5칸 또는 .g3 |
| **D. 범위·구성** | 무엇을 어디까지 하는가 | .mx 매트릭스 또는 .g4 |
| **E. 비교·개선** | Before → After | .step-row (AS-IS / TO-BE) |
| **F. 수치·KPI** | 얼마나 좋아지는가 | .effect-card + .kpi + .pstrip |
| **G. 아키텍처** | 어떻게 구성되는가 | .g2/.g3 + 다이어그램 설명 |
| **H. 프로세스** | 어떤 순서로 진행하는가 | .flow-row + .card 단계 설명 |
| **I. 일정** | 언제까지 무엇을 하는가 | .gantt 또는 .timeline |
| **J. 조직·역할** | 누가 무엇을 담당하는가 | .g2/.g3 역할 카드 |
| **K. 시나리오** | 실제 어떻게 쓰이는가 | .scard 그리드 |
| **L. 마무리·약속** | 다음 행동을 요청한다 | L01 표지형 + .pstrip |

### 2-3. 청중별 강조 전략

| 청중 | 첫 페이지 패턴 | 강조 요소 | 마지막 페이지 |
|------|-------------|---------|-------------|
| **임원** | 결론 먼저 (L06 KPI) | 수치·ROI·리스크 | 의사결정 요청 |
| **실무책임자** | 현황·문제 (배경형) | 방법론·일정·역할 | 협조 요청 |
| **현업담당자** | 사용 시나리오 먼저 | 화면·프로세스·절차 | 교육·안내 |
| **고객사** | 가치·효과 먼저 | 차별점·사례·보증 | 계약·협력 제안 |
| **투자자** | 문제 크기 (시장) | 솔루션·팀·수익 | 투자 요청 금액 |

### 2-4. 분위기별 문체 규칙

| 분위기 | 문장 길이 | 주어 | 수동/능동 | 예시 표현 |
|--------|---------|------|---------|---------|
| **공식·신뢰감** | 중간(2~3줄) | 조직명 | 능동 | "~를 구현합니다", "~을 달성합니다" |
| **전문·간결** | 짧음(1~2줄) | 생략 가능 | 능동 | "→ 단계 축소", "✓ 자동화 완료" |
| **친근·설득** | 중간 | "우리", "함께" | 능동 | "~할 수 있습니다", "함께 만들어 갑시다" |
| **역동·자신감** | 짧음 | 생략 | 능동 강조 | "ZERO 수기 입력", "100% 자동화" |
| **학술·분석** | 길다(3~4줄) | 명사구 | 수동 허용 | "분석 결과 ~로 확인되었습니다" |

---

## Phase 3 — 구조 설계 (TOC 확정)

### 3-1. 발표 유형별 표준 TOC 패턴

#### 착수보고 (30~45분, 30~45페이지)
```
Cover (1)
├── Ⅰ. 사업 개요 (8~10페이지)
│   ├── 추진 배경 및 목적        [A + C 유형]
│   ├── 사업 범위                [D 유형]
│   ├── 기능 구성도              [D + G 유형]
│   ├── 기대 효과 (정량)         [F 유형]
│   └── 기대 효과 (정성)         [C + L 유형]
├── Ⅱ. 사업 수행 방안 (15~20페이지)
│   ├── 시스템 개요              [G 유형]
│   ├── 고도화 방향              [E 유형]
│   ├── 아키텍처·인프라           [G 유형]
│   ├── 연계 시스템              [G 유형]
│   ├── 주요 기능/서비스 (N페이지)[E + F 유형 반복]
│   └── 시연 시나리오            [K 유형]
├── Ⅲ. 사업 관리 방안 (6~8페이지)
│   ├── 추진 조직                [J 유형]
│   ├── 추진 일정                [H + I 유형]
│   └── 보고·소통 체계           [H 유형]
└── Closing (1)
```

#### 제안서 (20~30분, 20~30페이지)
```
Cover (1)
├── Ⅰ. 현황 및 문제점 (4~5페이지) [A + B 유형]
├── Ⅱ. 제안 개요 (3~4페이지)     [C + D 유형]
├── Ⅲ. 솔루션 상세 (8~10페이지)  [E + G + K 유형]
├── Ⅳ. 기대 효과 (2~3페이지)     [F 유형]
├── Ⅴ. 수행 계획 (3~4페이지)     [I + J 유형]
└── Ⅵ. 회사 소개 (2~3페이지)     [L 유형]
```

#### 사업계획서 (45~60분, 40~60페이지)
```
Cover (1)
├── Ⅰ. 사업 개요                [A + C 유형]
├── Ⅱ. 시장 분석                [A + F 유형]
├── Ⅲ. 제품·서비스              [D + G + K 유형]
├── Ⅳ. 사업 모델               [H + F 유형]
├── Ⅴ. 재무 계획               [I + F 유형]
└── Ⅵ. 팀 소개                 [J 유형]
```

#### 중간·완료보고 (15~20분, 15~20페이지)
```
Cover (1)
├── Ⅰ. 진행 현황 (3~4페이지)    [H + I 유형]
├── Ⅱ. 완료 사항 (4~6페이지)    [E + F 유형]
├── Ⅲ. 이슈·리스크 (2~3페이지)  [B 유형]
└── Ⅳ. 다음 단계 (2~3페이지)    [H + C 유형]
```

### 3-2. 페이지당 시간 배분 공식

```
총 발표 시간(초) ÷ 총 페이지 수 = 페이지당 기준 시간

기준 조정:
  표지·목차        기준 × 0.5
  단순 카드        기준 × 0.7 (최소 30초)
  2열 비교        기준 × 1.0
  상세 설명        기준 × 1.2
  핵심 메시지      기준 × 1.5 (최대 90초)
  시연 페이지      +30~60초 (실연 시간 별도)
```

### 3-3. TOC 확정 체크포인트

TOC 설계 후 반드시 사용자에게 확인:

```
**[📋 TOC 확인]**
아래 목차로 생성합니다. 수정하시면 알려주세요.

총 {N}페이지 · 예상 {M}분 · 테마: {theme}
청중: {audience} · 분위기: {tone} · 전문도: {difficulty}

── Ⅰ. {섹션 제목} ({n}페이지, {m}분) ──
  {pageId}  {페이지 제목}  [{레이아웃 유형}]  {예상 초}초

── Ⅱ. {섹션 제목} ({n}페이지, {m}분) ──
  ...

→ "확인합니다" 또는 수정 내용을 말씀해주세요.
```

---

## Phase 4 — 파일 생성 (4종 동시 작업 의무)

각 페이지 생성 시 아래 4종을 **반드시 동시에** 작성한다.  
어느 한 종이라도 누락되면 헌법 위반(PRESENTATION-PAGE-SCRIPT-SYNC).

### 4-1. HTML 페이지 생성 규칙

#### 필수 구조 (순서 고정)

```html
<!DOCTYPE html>
<html lang="ko" data-theme="{theme}">
<head>
<meta charset="UTF-8">

<!-- [1] Anti-flicker: 반드시 첫 번째 style 태그 -->
<style id="anti-flicker">
html{background:#F4F7FC}
[data-theme="forest"] html, html[data-theme="forest"]{background:#F4F6F2}
[data-theme="charcoal"] html, html[data-theme="charcoal"]{background:#F5F3EF}
.bk-nav{position:fixed!important;top:0;left:0;right:0;height:12px!important;
  min-height:12px;padding:0!important;border-bottom:2px solid #F05A20!important;
  background:#111E35!important;z-index:9999;overflow:hidden;
  display:flex!important;align-items:center}
.bk-nav .brand,.bk-nav .home{display:none!important}
body{padding-top:14px!important}
[data-theme="forest"] .bk-nav{background:#1F3A2E!important;border-bottom-color:#C89B3C!important}
[data-theme="charcoal"] .bk-nav{background:#1A1A1A!important;border-bottom-color:#A83232!important}
</style>

<!-- [2] 모드 복원: 반드시 두 번째 script (inline, 동기) -->
<script>(function(){try{
  var m=localStorage.getItem('kickoff-mode');
  if(m==='edit'||m==='presentation')document.documentElement.setAttribute('data-mode',m);
  var f=localStorage.getItem('kickoff-fit-mode');
  if(f==='frame')document.documentElement.setAttribute('data-fit-mode','frame');
}catch(e){}})()</script>

<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{섹션번호.페이지번호} {페이지 제목} — {프로젝트명}</title>

<!-- [3] 웹폰트 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<!-- [4] CSS 변수 (3 테마 전체 선언 필수) -->
<style>
:root,[data-theme="navy"]{
  --bk-nav:#19355D;--bk-deep:#00338D;--bk-mid:#275291;--bk-slate:#3271AA;
  --bk-muted:#6685BB;--bk-bright:#1760E8;--bk-pale:#C1D6ED;--bk-tint:#E0EDF8;
  --bk-bg:#F4F7FC;--bk-white:#FFFFFF;--bk-text:#0F1A2E;--bk-sub:#475569;
  --bk-orange:#FF5300;--bk-orange-bg:rgba(255,83,0,.07);
  --bk-green:#92D050;--bk-red:#C00000;--bk-shadow:rgba(0,51,141,.13);
}
[data-theme="forest"]{
  --bk-nav:#1F3A2E;--bk-deep:#2F4F3E;--bk-mid:#3F6550;--bk-slate:#507A60;
  --bk-muted:#7B9D88;--bk-bright:#2E7D52;--bk-pale:#C6CCC2;--bk-tint:#E6EAE3;
  --bk-bg:#F4F6F2;--bk-white:#FFFFFF;--bk-text:#1A2B1F;
  --bk-orange:#C89B3C;--bk-orange-bg:rgba(200,155,60,.08);
  --bk-green:#7EC234;--bk-red:#B5433A;--bk-shadow:rgba(31,58,46,.12);
}
[data-theme="charcoal"]{
  --bk-nav:#2B2B2B;--bk-deep:#1A1A1A;--bk-mid:#3E3E3E;--bk-slate:#555;
  --bk-muted:#8A8680;--bk-bright:#3E3E3E;--bk-pale:#CBC6BF;--bk-tint:#E8E5E0;
  --bk-bg:#F5F3EF;--bk-white:#FFFFFF;--bk-text:#1A1A1A;
  --bk-orange:#A83232;--bk-orange-bg:rgba(168,50,50,.07);
  --bk-green:#5A8A3A;--bk-red:#8B0000;--bk-shadow:rgba(0,0,0,.12);
}
/* [공통 리셋 + 기본 클래스 — 아래 § 4-2 참조] */
</style>

<!-- [5] 공통 모듈 (순서 유지, defer 필수) -->
<link rel="stylesheet" href="mode-tip.css">
<link rel="stylesheet" href="presentation-overrides.css">
<script defer src="theme.js"></script>
<script defer src="editor.js"></script>
<script defer src="mode-selector.js"></script>
<script defer src="tip-memo.js"></script>
<script defer src="fit-viewport.js"></script>
<script defer src="site-actions.js"></script>
</head>
<body>

<!-- [6] 네비게이션 바 (편집 모드: 전체 표시 / 발표 모드: 12px 엣지만) -->
<nav class="bk-nav">
  <div class="brand" data-eid="nav-brand">{조직명} <span>|</span> {프로젝트명}</div>
  <a class="home" href="index.html">목차</a>
</nav>

<!-- [7] 메인 콘텐츠 -->
<main class="bk-page" id="bk-page">
  <!-- 페이지 헤더 -->
  <header class="bk-hd">
    <div class="label" data-eid="page-label">{섹션 라벨}</div>
    <h1 data-eid="page-h1">{페이지 제목}</h1>
    <p class="sub" data-eid="page-sub">{부제}</p>
  </header>

  <!-- 콘텐츠 — § 4-2 레이아웃 선택 기준 참조 -->

  <!-- 하단 네비게이션 -->
  <nav class="pf">
    <a href="{prev}.html" class="pv{이전 없으면 ' off'}">
      <div class="dir">PREV</div>
      <div class="ttl">{이전 제목}</div>
    </a>
    <a href="{next}.html" class="nx{다음 없으면 ' off'}">
      <div class="dir">NEXT</div>
      <div class="ttl">{다음 제목}</div>
    </a>
  </nav>
</main>
</body>
</html>
```

---

### 4-2. 레이아웃 선택 의사결정 트리

#### 1단계 — 콘텐츠 유형 판단

```
콘텐츠가...
  단 하나의 핵심 숫자/결론이다     → .pstrip + .kpi 조합 (F 유형)
  Before/After 비교이다            → .step-row + .lbl + .body (E 유형)
  순차적 단계/프로세스이다          → .flow-row + .flow-item (H 유형)
  시간축 일정이다                  → .gantt 또는 .timeline (I 유형)
  역할/담당자 구조이다              → .g2/.g3 + .card 역할 설명 (J 유형)
  시나리오/사례 나열이다            → .sg.g3 + .scard (K 유형)
  그 외 정보 구조화                → 아이템 수 기반 선택 ↓
```

#### 2단계 — 아이템 수 기반 선택

| 항목 수 | 권장 레이아웃 | 비고 |
|--------|------------|------|
| 1개 | `.note` 박스 또는 단락 | 강조 1포인트 |
| 2개 | `.g2` | 비교·대조 |
| 3개 | `.g3` | 균형 3분할 |
| 4개 | `.g4` | 사분면 또는 4단계 |
| 5개 | `.pstrip` (수평) 또는 `.g5` | 목표·원칙·키워드 나열 |
| 6~9개 | `.g3` × 2행 | 카드 그리드 |
| 10개 이상 | `.tb` 테이블 또는 섹션 분리 | 가독성 우선 |

#### 3단계 — 카드 색상 선택

| 색상 클래스 | 의미 | 사용 시점 |
|-----------|------|---------|
| (기본) `.card` | 중립 정보 | 일반 설명 |
| `.card.d` | 딥블루 강조 | 핵심·주요 항목 |
| `.card.o` | 오렌지 강조 | 경고·주목 필요 |
| `.card.g` | 그린 강조 | 완료·긍정·승인 |
| `.card.r` | 레드 강조 | 문제·이슈·한계 |
| `.card.navy` | 진한 네이비 배경 | 인버스 강조 |
| `.pcard` | 좌측 바 강조 | 근거·데이터 중심 |
| `.qcard` | 원형 불릿 | 질문·체크포인트 |

#### 4단계 — 강조 박스 사용 기준

```
.note          → 핵심 가치 선언, 중요 정보 요약 (파란색 계열)
.note.w        → 경고, 전제 조건, 주의사항 (주황색 계열)
.badge.new     → 신규 기능·변경 사항
.badge.warn    → 주의 필요 항목
.badge.done    → 완료·확정 항목
```

---

### 4-3. 컴포넌트 스니펫 라이브러리

#### 카드 그리드 (.g2, .g3)
```html
<div class="g2"> <!-- 또는 g3, g4 -->
  <div class="card [o|d|g|r|navy]">
    <h3 data-eid="{eid}">{제목}</h3>
    <p data-eid="{eid}-body">{본문}</p>
  </div>
</div>
```

#### 좌측 강조 카드 (.pcard)
```html
<div class="pcard [o|d|g]">
  <div class="pcard-ttl" data-eid="{eid}">{제목}</div>
  <div class="pcard-body" data-eid="{eid}-body">{본문}</div>
</div>
```

#### AS-IS / TO-BE 비교 (.step-row)
```html
<div class="steps">
  <div class="step-row">
    <div class="lbl o" data-eid="{eid}-label">AS-IS</div>
    <div class="body">
      <div class="arr" data-eid="{eid}-arr">{단계1} → {단계2} → ···</div>
    </div>
  </div>
  <div class="step-row">
    <div class="lbl g" data-eid="{eid2}-label">TO-BE</div>
    <div class="body">
      <div class="arr" data-eid="{eid2}-arr">{간소화된 흐름}</div>
    </div>
  </div>
</div>
```

#### 효과 수치 카드 (.effect-card)
```html
<div class="effect-grid g3"> <!-- g2 또는 g3 -->
  <div class="effect-card">
    <div class="num" data-eid="{eid}-num">{수치}%</div>
    <div class="lbl" data-eid="{eid}-lbl">{지표명}</div>
    <div class="desc" data-eid="{eid}-desc">{설명}</div>
  </div>
</div>
```

#### 파노라마 스트립 (.pstrip)
```html
<div class="pstrip">
  <div class="pi">
    <div class="pn" data-eid="{eid}-no">01</div>
    <div class="pt" data-eid="{eid}-title">{제목}</div>
    <div class="pd" data-eid="{eid}-desc">{설명}</div>
  </div>
  <!-- 최대 5개 권장 -->
</div>
```

#### 프로세스 흐름 (.flow-row)
```html
<div class="flow-row">
  <div class="flow-item [red|blue|navy-bg]">
    <div class="fi-no" data-eid="{eid}-no">STEP 1</div>
    <div class="fi-title" data-eid="{eid}-title">{단계명}</div>
    <div class="fi-desc" data-eid="{eid}-desc">{설명}</div>
  </div>
  <!-- ::after 자동으로 → 생성 -->
</div>
```

#### 간트 차트 (.gantt) — 일정 페이지 전용
```html
<div class="gantt" style="overflow-x:auto">
  <div class="gh">
    <div>업무</div>
    <div>{월/주1}</div> <div>{월/주2}</div> ··· <!-- N열 -->
  </div>
  <div class="gr"> <!-- 행 -->
    <div class="gt">{업무명}</div>
    <div style="position:relative;grid-column:2/{끝열+1}">
      <div class="gb [navy|orange|green]"
           style="left:{시작%};width:{기간%}">{레이블}</div>
      <div class="ms" style="left:{마일스톤%}">{이벤트명}</div>
    </div>
  </div>
</div>
```

#### 시나리오 카드 (.scard)
```html
<div class="sg [g3]"> <!-- 2열=sg, 3열=sg.g3 -->
  <div class="scard [g]"> <!-- g=초록, b=딥블루, 기본=주황 -->
    <div class="scard-hd">
      <span class="snum [g|b]" data-eid="{eid}-num">{번호}</span>
      <h3 data-eid="{eid}-title">{시나리오명}</h3>
    </div>
    <ul data-eid="{eid}-body">
      <li>{설명 1}</li>
      <li>{설명 2}</li>
    </ul>
  </div>
</div>
```

#### KPI 수치 박스 (.kpi)
```html
<div class="g4">
  <div class="kpi">
    <div class="kpi-val" data-eid="{eid}-val">{수치}</div>
    <div class="kpi-unit" data-eid="{eid}-unit">{단위}</div>
    <div class="kpi-label" data-eid="{eid}-label">{지표명}</div>
  </div>
</div>
```

---

### 4-4. 스크립트 MD 생성 규칙 (script-text/{pageId}.md)

```markdown
# {pageId} — {한글 제목}

⏱ **권장 소요**: {초}초
🎯 **핵심 메시지**: {슬라이드 전체를 한 문장으로}

---

{발표 스크립트}

작성 원칙:
  1. 구어체 — "~입니다", "~하겠습니다" (공식), "~예요" (친근)
  2. 슬라이드 내용을 그대로 읽지 말 것 → 보충 설명 위주
  3. 청중 직접 호칭 가능 — "보시면", "확인하실 수 있듯이"
  4. 핵심 수치는 명시 — "9단계에서 3단계로"
  5. 1~2 단락 (100~200자 내외)
  6. TTS 엔진 특성: 쉼표·마침표 = 자연스러운 포즈

---

💡 **강조 포인트**
- {슬라이드에서 구두로 특히 강조할 내용}
- {수치 또는 핵심 키워드}
```

---

### 4-5. viewer.html SCRIPTS · MD[] 갱신

```javascript
// SCRIPTS 배열에 추가 (발표 순서대로)
const SCRIPTS = [
  ["{pageId}", "{페이지 제목}"],
  // ...
];

// MD 딕셔너리에 추가
MD["{pageId}"] = `{script-text/{pageId}.md 전체 내용}`;
```

---

### 4-6. script-text/README.md 갱신

```markdown
| {번호} | {pageId} {제목} | {초}초 | {누적 mm:ss} |
```
누적 시간은 이전 행 누적 + 현재 권장 소요로 계산.

---

## Phase 5 — index.html · site-actions.js 갱신

### 5-1. index.html 목차 섹션 추가

섹션·페이지 링크를 `.toc-row` 구조로 추가:

```html
<div class="toc-row">
  <div class="toc-marker">
    <div class="roman" data-eid="toc{N}-roman">Ⅰ.</div>
    <div class="mname" data-eid="toc{N}-mname">{섹션 제목}</div>
  </div>
  <div class="toc-right">
    <div class="toc-sub-label" data-eid="toc{N}-sublabel">{부제}</div>
    <ul class="toc-items">
      <li data-eid="toc{N}-item{n}"><a href="{pageId}.html">{페이지 제목}</a></li>
    </ul>
  </div>
</div>
```

### 5-2. site-actions.js 페이지 네비 갱신

```javascript
// 섹션 그룹을 items 배열에 추가
{ group: 'PART {N} · {섹션명}', items: [
  { file: '{pageId}.html', label: '{번호}  {페이지 제목}' },
  // ...
]},
```

---

## Phase 6 — 품질 검증 체크리스트

생성 완료 후 아래 항목을 점검한다. ✓ 전체 통과 시 사용자에게 보고.

### 6-1. 구조 완결성
```
[ ] 모든 페이지에 PREV/NEXT 링크가 올바르게 연결됨
[ ] 첫 페이지 PREV = off / 마지막 페이지 NEXT = off
[ ] index.html 목차의 모든 링크가 실제 파일과 일치
[ ] site-actions.js 그룹 구조가 TOC와 일치
[ ] SCRIPTS 배열 순서 = 발표 흐름 순서
[ ] MD["{pageId}"] 수 = SCRIPTS 배열 수
```

### 6-2. 콘텐츠 품질
```
[ ] 모든 페이지에 bk-hd (제목) 있음
[ ] 모든 페이지에 data-eid 속성 부착 (편집 모드 지원)
[ ] 모든 스크립트 MD에 ⏱·🎯·💡 3섹션 포함
[ ] 총 발표 시간 ≈ 사용자 요청 시간 (±20%)
[ ] 청중·톤·전문도 일관성 (전 페이지 동일 분위기)
[ ] 핵심 메시지 3개가 본문 곳곳에 반복 등장
```

### 6-3. 기술 검증
```
[ ] anti-flicker style 첫 번째 위치
[ ] 모드 복원 script 두 번째 위치 (inline, sync)
[ ] 공통 모듈 모두 로드 (6개 JS defer, 2개 CSS link)
[ ] 테마 CSS 변수 3종 모두 선언
[ ] pres-config.json 실제 값으로 채워져 있음
```

---

## Phase 7 — 완료 보고

```
✅ {프로젝트명} 발표 자료 생성 완료

📁 {output.path}
📊 {N}개 페이지 · 예상 {M}분 · {theme} 테마

생성 파일:
  HTML 슬라이드:      {N}개
  발표 스크립트 MD:    {N}개
  공통 모듈:          복사 완료
  스크립트 뷰어:      script-text/viewer.html
  목차:               index.html
  발표 진입점:        index01.html

품질 체크: {통과한 항목 수}/{전체 항목 수}

🎯 권장 다음 단계:
  1. index.html → 전체 흐름 확인
  2. 수정 필요 페이지 → 편집 모드(Esc)로 인라인 수정
  3. script-text/viewer.html → TTS 시청 + 스크립트 다듬기
  4. TTS/audio/ → 직접 녹음 파일 추가 (선택)
  5. index01.html → 최종 발표 리허설
```

---

## 부록 A — 페이지 밀도 가이드 (1페이지 = 몇 글자?)

| 레이아웃 유형 | 텍스트 밀도 | 가이드라인 |
|-------------|----------|----------|
| 카드 그리드 (.g2~.g4) | 낮음 | 카드당 제목 1줄 + 본문 3~5줄 |
| KPI 파노라마 (.pstrip) | 매우 낮음 | pi당 제목 1줄 + 설명 2줄 |
| AS-IS/TO-BE (.step-row) | 중간 | lbl 1줄 + 흐름 단계 5~9개 |
| 테이블 (.tb) | 높음 | 행 5~10개, 열 3~5개 |
| 간트 (.gantt) | 높음 | 업무 8~12개, 기간 8주 내외 |
| 시나리오 (.scard) | 중간 | 카드당 불릿 3~5개 |

---

## 부록 B — 프로젝트 유형별 레이아웃 배분 비율

| 유형 | A배경 | E비교 | F수치 | G구조 | H프로세스 | I일정 | J조직 |
|------|------|------|------|------|---------|------|------|
| 착수보고 | 15% | 20% | 15% | 20% | 15% | 10% | 5% |
| 제안서 | 20% | 25% | 20% | 15% | 10% | 5% | 5% |
| 사업계획서 | 15% | 10% | 30% | 20% | 10% | 10% | 5% |
| 중간보고 | 10% | 30% | 20% | 10% | 20% | 10% | 0% |
| 교육자료 | 20% | 10% | 5% | 25% | 25% | 5% | 10% |

---

## 부록 C — 텍스트 톤 변환 예시

**같은 내용을 다른 분위기로:**

원문: "자금이체 단계를 9개에서 3개로 줄였습니다"

| 분위기 | 변환 예시 |
|--------|---------|
| 공식·신뢰감 | "자금이체 처리 단계를 기존 9단계에서 3단계로 67% 축소하여, 업무 효율 향상을 달성하였습니다." |
| 전문·간결 | "자금이체: 9단계 → 3단계 (67% 축소)" |
| 친근·설득 | "이제 클릭 3번으로 이체가 끝납니다. 담당자분들이 가장 좋아하시는 변화예요." |
| 역동·자신감 | "9단계 프로세스? 이제 과거 얘기입니다. 3단계, 바로 실행!" |
| 학술·분석 | "자금이체 워크플로우 최적화를 통해 처리 단계가 9단계에서 3단계로 66.7% 감소함을 확인하였으며, 이는 평균 처리 시간 단축으로 이어질 것으로 분석됩니다." |

---

*이 스킬은 `D:/projects/products/Presentations` 착수보고회 프로젝트의 전체 구축 경험을 방법론으로 추출한 것이다.*  
*착수보고회 원본은 분석·설계·생성 각 단계의 기준 레퍼런스로 참조한다.*
