# PresentationBuilder — 자동 생성 설계서

> **버전**: 1.0 · **작성일**: 2026-04-30  
> **기준 프로젝트**: `[기준 원본 프로젝트]`  
> **목적**: 이 설계서를 CLAUDE에게 전달하면, 사용자가 폴더에 콘텐츠 파일만 넣고 「시작」 버튼을 누르면  
> 지금 구현된 모든 기능이 그대로 적용된 발표 시스템이 **자동으로 생성**된다.

---

## 0. 한 줄 정의

> **사용자가 콘텐츠(텍스트·이미지·데이터)와 설정 파일을 지정 폴더에 넣으면,  
> CLAUDE가 현재 Presentations 프로젝트의 전체 구조·기능을 그대로 복제하여  
> 새 발표 시스템을 자동 생성한다.**

---

## 1. 현재 구현 기능 전체 목록

### 1-1. 모드 시스템 (3 모드)

| 모드 | 키 | 설명 |
|------|-----|------|
| **일반** | (기본) | 목차 탐색, 단순 열람 |
| **편집(edit)** | `localStorage['kickoff-mode'] = 'edit'` | 인라인 텍스트 편집, 팁 메모, 레이아웃 조작 |
| **발표(presentation)** | `localStorage['kickoff-mode'] = 'presentation'` | 전체화면 최적화, 편집 UI 숨김, vfit 자동 맞춤 |

모드 전환 모듈: `mode-selector.js`  
모드별 CSS: `presentation-overrides.css`

---

### 1-2. 화면 맞춤(Fit) 시스템 (vfit)

| 옵션 | 설명 |
|------|------|
| **Frame** | `data-fit-mode="frame"` — 고정 캔버스(1200×900) 기준으로 전체 스케일 |
| **Fluid** | (기본) — 브라우저 너비에 맞춰 자연스럽게 흐름 |

구현 파일: `fit-viewport.js`  
CSS 변수: `--vfit-k` (scale factor)  
반복 수렴: JS가 폰트 크기 조정 → 재측정 → 오버플로우 없을 때까지 반복

---

### 1-3. 테마 시스템 (3 테마)

| 테마 | `data-theme` | 주색 | 강조색 |
|------|-------------|------|--------|
| **Navy** | `navy` (기본) | `#19355D` | `#FF5300` |
| **Forest** | `forest` | `#1F3A2E` | `#C89B3C` |
| **Charcoal** | `charcoal` | `#2B2B2B` | `#A83232` |

CSS 변수 19종 (모든 색상은 변수 참조):

```css
:root, [data-theme="navy"] {
  --bk-nav, --bk-deep, --bk-mid, --bk-slate,
  --bk-muted, --bk-bright, --bk-pale, --bk-tint,
  --bk-bg, --bk-white, --bk-text, --bk-sub,
  --bk-orange, --bk-orange-bg,
  --bk-green, --bk-red, --bk-shadow
}
```

구현 파일: `theme.js`, `theme-ai.css`  
Anti-flicker: 인라인 `<style id="anti-flicker">` — JS 로드 전 배경색 사전 적용

---

### 1-4. SPA 셸 (iframe 라우팅)

`index.html`이 셸 역할:
- TOC 링크 클릭 → URL 해시 변경 (`#01-1`)
- 해시 변경 이벤트 → `app-iframe.src = '01-1.html'`
- 서브 페이지에서 `postMessage({type:'kickoff-nav', file:'02-1.html'})` → 부모 해시 업데이트
- 서브 페이지에서 `postMessage({type:'kickoff-show-toc'})` → 목차 복원
- 구현 파일: `spa-link.js`, `index.html` 인라인 스크립트

---

### 1-5. 인라인 텍스트 편집 (Edit Mode)

- `data-eid` 속성이 있는 모든 요소를 편집 가능하게 활성
- 더블클릭 → `contenteditable="true"` 전환
- `blur` 또는 `Ctrl+S` → localStorage에 `kickoff-edit::pageId` 키로 JSON 저장
- 구현 파일: `editor.js`

---

### 1-6. 팁 메모 시스템 (Tip Memo)

- 각 페이지에 발표자 메모 작성 가능
- FAB 버튼 (우측 하단 📝)
- 메모 저장: `localStorage['kickoff-tips']` (JSON, 페이지ID → 텍스트)
- JSON 내보내기/가져오기 지원
- 구현 파일: `tip-memo.js`

---

### 1-7. TTS (Text-to-Speech) 시스템

#### 엔진 (`tts/tts-engine.js`)
- Web Speech API (`SpeechSynthesisUtterance`)
- 상태: `idle | playing | paused | audio`
- 음성 설정: rate (기본 0.9×), pitch (기본 0.85 — 중후)
- 커스텀 오디오: `tts/audio/{pageId}.mp3` 존재 시 우선 재생, 없으면 TTS 폴백

#### 스크립트 추출 (`extractMentu`)
```
MD 파일에서 첫 번째 --- 와 두 번째 --- 사이 텍스트만 추출
마크다운 강조(**bold**, *italic*) 제거 → 순수 읽기 텍스트
```

#### UI (`tts/tts-ui.css`)
- `.tts-bar` — 버튼 컨테이너
- `.tts-btn` — 읽기/일시정지/정지 버튼
- `.tts-rate` — 속도/피치 선택 드롭다운
- `.tts-stat` — 상태 표시 ("읽는 중…")

#### 자동 읽기 옵션
- `localStorage['tts-autoplay']` 키 공유
- `index.html` 발표 설정 바에서 On/Off
- `viewer.html`에서 페이지 이동 시 300ms 후 자동 재생
- `storage` 이벤트로 두 창 간 실시간 동기화

---

### 1-8. 스크립트 뷰어 (`script-text/viewer.html`)

- 44개 발표 스크립트를 인라인 `MD["pageId"]` 딕셔너리로 보유
- 키보드 단축키: `←/→/Space/Home/End` 페이지 이동, `T` TTS 토글, `M` 메모
- 발표자 메모 패널 (JSON 내보내기/가져오기)
- 페이지 이동 시 TTS 자동 정지 → 새 텍스트 로드

---

### 1-9. 발표 전용 진입점 (`index01.html`)

- 자동 풀스크린 진입 시도
- 키보드 포워딩 (자식 iframe → 부모로 전달)
- 발표 모드 강제 적용

---

### 1-10. 동기화 체크 (`_sync_check.js`)

- 모든 HTML 파일의 제목/수정일 체크
- 스크립트 MD와 불일치 시 콘솔 경고

---

## 2. 폴더 구조 규약

```
{project-root}/
│
├── index.html              ← TOC 목차 + SPA 셸 (발표 설정 바 포함)
├── index01.html            ← 발표 전용 진입점 (자동 풀스크린)
├── launcher.html           ← 빠른 실행 런처
│
├── {pageId}.html           ← 발표 페이지 (복수)
│   예) 01-1.html, 02-5-8.html
│
├── mode-tip.css            ← 편집 모드 팁 UI 스타일
├── presentation-overrides.css ← 발표 모드 오버라이드
├── theme-ai.css            ← 테마 AI 추가 스타일 (선택)
├── content-frame.css       ← iframe 콘텐츠 프레임 스타일
│
├── theme.js                ← 테마 전환 로직
├── editor.js               ← 인라인 편집
├── mode-selector.js        ← 편집/발표 모드 전환 UI
├── tip-memo.js             ← 발표자 팁 메모
├── fit-viewport.js         ← vfit 화면 맞춤
├── site-actions.js         ← 사이트 공통 액션 (저장·공유·리셋 등)
├── spa-link.js             ← SPA 네비게이션 보조
├── _sync_check.js          ← 동기화 검증 (개발용)
│
├── tts/
│   ├── tts-engine.js       ← TTS 공통 엔진
│   ├── tts-ui.css          ← TTS UI 스타일
│   └── audio/              ← 커스텀 녹음 파일 (선택)
│       └── {pageId}.mp3
│
├── script-text/
│   ├── {pageId}.md         ← 발표 스크립트 (구어체 1~2 단락)
│   ├── viewer.html         ← 스크립트 뷰어 (TTS 통합)
│   ├── README.md           ← 스크립트 인덱스 + 누적 시간
│   └── index.md            ← 페이지 목록
│
├── md/                     ← 콘텐츠 원본 마크다운 (선택)
│   └── {pageId}.md
│
├── business/               ← 업무별 상세 설명 페이지 (선택)
│   └── {topic}.html
│
└── requirements/           ← 설계 문서
    └── PRESENTATION-BUILDER-SPEC.md  ← 본 문서
```

---

## 3. 페이지 ID 규약

```
{섹션번호}-{페이지번호}           예) 01-1, 02-5, 03-2
{섹션번호}-{페이지번호}-{하위번호} 예) 01-2-1, 02-5-8, 03-1-2
{섹션번호}-{페이지번호}-{하위}-{세부} 예) 01-2-1-1
```

규칙:
- HTML 파일명(확장자 제외) = 스크립트 MD 파일명 = `viewer.html SCRIPTS` 배열 ID = `README` 매핑 ID
- 모두 **동일 문자열** 유지 (PRESENTATION-PAGE-SCRIPT-SYNC 헌법)

---

## 4. HTML 페이지 표준 템플릿

모든 발표 페이지는 다음 구조를 따른다.

```html
<!DOCTYPE html>
<html lang="ko" data-theme="navy">
<head>
<meta charset="UTF-8">

<!-- [1] Anti-flicker 인라인 스타일 (JS 로드 전 깜박임 방지) -->
<style id="anti-flicker">
html{background:#F4F7FC}
[data-theme="forest"] html, html[data-theme="forest"]{background:#F4F6F2}
[data-theme="charcoal"] html, html[data-theme="charcoal"]{background:#F5F3EF}
.bk-nav{position:fixed!important;top:0;left:0;right:0;height:12px!important;
  min-height:12px;padding:0!important;border-bottom:2px solid #F05A20!important;
  background:#111E35!important;z-index:9999;overflow:hidden;display:flex!important;align-items:center}
.bk-nav .brand,.bk-nav .home{display:none!important}
body{padding-top:14px!important}
[data-theme="forest"] .bk-nav{background:#1F3A2E!important;border-bottom-color:#C89B3C!important}
[data-theme="charcoal"] .bk-nav{background:#1A1A1A!important;border-bottom-color:#A83232!important}
</style>

<!-- [2] 모드 복원 인라인 스크립트 (깜박임 방지 — defer 전에 실행) -->
<script>(function(){try{
  var m=localStorage.getItem('kickoff-mode');
  if(m==='edit'||m==='presentation')document.documentElement.setAttribute('data-mode',m);
  var f=localStorage.getItem('kickoff-fit-mode');
  if(f==='frame')document.documentElement.setAttribute('data-fit-mode','frame');
}catch(e){}})()</script>

<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{섹션번호.페이지번호} {페이지 제목} — {프로젝트명}</title>

<!-- [3] 웹 폰트 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<!-- [4] CSS 변수 (테마 3종) -->
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
/* 공통 리셋 + 기본 스타일 */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Noto Sans KR','Malgun Gothic',sans-serif;
  background:var(--bk-bg);color:var(--bk-text);font-size:14px;line-height:1.65;
  -webkit-font-smoothing:antialiased}
</style>

<!-- [5] 공통 CSS 모듈 -->
<link rel="stylesheet" href="mode-tip.css">
<link rel="stylesheet" href="presentation-overrides.css">

<!-- [6] 공통 JS 모듈 (defer) -->
<script defer src="theme.js"></script>
<script defer src="editor.js"></script>
<script defer src="mode-selector.js"></script>
<script defer src="tip-memo.js"></script>
<script defer src="fit-viewport.js"></script>
<script defer src="site-actions.js"></script>
</head>
<body>

<!-- [7] 상단 네비게이션 바 -->
<nav class="bk-nav">
  <div class="brand" data-eid="nav-brand">
    {조직명} <span>|</span> {프로젝트명}
  </div>
  <a class="home" href="index.html">목차</a>
</nav>

<!-- [8] 페이지 콘텐츠 -->
<main class="bk-page" id="bk-page">

  <!-- 페이지 헤더 -->
  <header class="bk-hd">
    <div class="label" data-eid="page-label">{섹션 라벨}</div>
    <h1 data-eid="page-h1">{페이지 제목}</h1>
    <p class="sub" data-eid="page-sub">{부제}</p>
  </header>

  <!-- 콘텐츠 영역 (레이아웃별 상이) -->
  <!-- ... -->

  <!-- 하단 이전/다음 네비게이션 -->
  <div class="pf">
    <a href="{이전페이지}.html" class="pv">
      <div class="dir">PREV</div>
      <div class="ttl">{이전 페이지 제목}</div>
    </a>
    <a href="{다음페이지}.html" class="nx">
      <div class="dir">NEXT</div>
      <div class="ttl">{다음 페이지 제목}</div>
    </a>
  </div>

</main>
</body>
</html>
```

---

## 5. 스크립트 MD 표준 형식

```markdown
# {pageId} — {한글 제목}

⏱ **권장 소요**: 30~60초
🎯 **핵심 메시지**: {한 문장 요약}

---

{자연스러운 구어체 1~2 단락 — 그대로 읽어도 어색하지 않게}

---

💡 **강조 포인트**
- {키 포인트 1}
- {키 포인트 2}
```

추출 규칙: TTS 엔진은 첫 번째 `---` 와 두 번째 `---` 사이 텍스트만 읽는다.

---

## 6. 컴포넌트 라이브러리 (현재 구현된 CSS 클래스)

### 레이아웃

| 클래스 | 설명 |
|--------|------|
| `.bk-page` | 메인 콘텐츠 래퍼 (max-width: 1160px, 중앙 정렬) |
| `.bk-hd` | 페이지 헤더 (라벨 + h1 + sub) |
| `.g2` ~ `.g5` | 2~5열 그리드 |
| `.mx` | 혼합 그리드 |
| `.pf` | 이전/다음 네비게이션 바 |
| `.pstrip` | 5칸 KPI 띠 (파노라마) |

### 카드

| 클래스 | 설명 |
|--------|------|
| `.card` | 기본 카드 (흰 배경, 그림자) |
| `.card.navy` | 네이비 배경 카드 |
| `.card.kpi` | KPI 수치 강조 카드 |
| `.ws-bcard` | 넓은 블록 카드 (전체 너비) |
| `.ic` | TOC 아이콘 카드 (링크) |

### 시나리오 카드 (02-6-x 스타일)

| 클래스 | 설명 |
|--------|------|
| `.scard` | 시나리오 카드 컨테이너 |
| `.scard-hd` | 카드 헤더 (번호 + 제목) |
| `.snum` | 오렌지 번호 뱃지 |
| `.snum.g` | 초록 번호 뱃지 |
| `.snum.b` | 딥블루 번호 뱃지 |
| `.sg` | 2열 카드 그리드 |
| `.sg.g3` | 3열 카드 그리드 |

### 비교 테이블

| 클래스 | 설명 |
|--------|------|
| `.as-is-table` | AS-IS / TO-BE 비교 표 |
| `.lbl` | 라벨 칩 (o=오렌지, g=초록, b=파랑) |
| `.tobe-flow` | TO-BE 흐름 화살표 체인 |
| `.eff-card` | 효과 수치 카드 |

### 기타

| 클래스 | 설명 |
|--------|------|
| `.badge` | 인라인 뱃지 (new, warn 등) |
| `.tag` | 기술 태그 |
| `.timeline` | 타임라인 세로 목록 |
| `.kpi` | KPI 수치 박스 |
| `.pi` | 파노라마 아이템 |

---

## 7. 자동 생성 설정 파일 규약 (`pres-config.json`)

새 프로젝트 생성 시 루트에 `pres-config.json` 을 작성한다.

```json
{
  "project": {
    "name": "프로젝트 이름",
    "org": "조직명",
    "date": "2026-00-00",
    "theme": "navy",
    "defaultFitMode": "fluid"
  },
  "sections": [
    {
      "id": "01",
      "title": "섹션 제목",
      "pages": [
        {
          "id": "01-1",
          "title": "페이지 제목",
          "sub": "부제",
          "duration": 60,
          "layout": "L02",
          "content": "md/01-1.md"
        }
      ]
    }
  ],
  "tts": {
    "enabled": true,
    "defaultRate": 0.9,
    "defaultPitch": 0.85,
    "autoPlay": false,
    "audioDir": "tts/audio"
  },
  "edit": {
    "enabled": true,
    "inlineEdit": true,
    "tipMemo": true
  }
}
```

---

## 8. 레이아웃 템플릿 카탈로그

| ID | 이름 | 구조 설명 | 용도 |
|----|------|-----------|------|
| **L01** | 표지 | 전체폭 히어로 + 제목 + 부제 | 섹션 표지, 마무리 |
| **L02** | 헤더 + 1단 | bk-hd + 본문 1열 | 간단 소개, 개요 |
| **L03** | 헤더 + 2열 그리드 | bk-hd + .g2 | 비교, 2개 항목 |
| **L04** | 헤더 + 3열 그리드 | bk-hd + .g3 | 3개 기능/단계 |
| **L05** | 헤더 + 4열 그리드 | bk-hd + .g4 | KPI 4종, 특징 4가지 |
| **L06** | KPI 파노라마 | pstrip (5칸) + 보조 섹션 | 수치 강조 |
| **L07** | AS-IS / TO-BE | 2단 비교 + 화살표 | 개선 전후 |
| **L08** | 타임라인 | 세로 timeline 컴포넌트 | 일정, 단계 |
| **L09** | 시나리오 카드 | scard 그리드 (2×N, 3×N) | 시나리오 목록 |
| **L10** | 테이블 상세 | 헤더 + 비교 표 | 기능 비교, 스펙 |
| **L11** | 아키텍처 | 다이어그램 + 설명 | 시스템 구조 |
| **L12** | 흐름도 | 단계 체인 + 효과 카드 | 프로세스 |
| **L13** | 목차 TOC | 섹션별 아코디언 목록 | 중간 목차 |
| **L99** | 자유 그리드 | 12열 60px행 자유 배치 | 커스텀 |

---

## 9. 설정 페이지 UI 설계 (`pres-settings.html`)

### 9-1. 화면 구성

```
┌──────────────────────────────────────────────────────┐
│  🎯 PresentationBuilder                              │
│  새 발표 프로젝트를 설정하고 자동 생성합니다          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [1] 프로젝트 기본 정보                              │
│  ┌─────────────────────────────────────────────┐    │
│  │ 프로젝트명: [__________________________]    │    │
│  │ 조직명:     [__________________________]    │    │
│  │ 발표일:     [__________________________]    │    │
│  │ 테마:       ○ Navy  ○ Forest  ○ Charcoal   │    │
│  │ 화면 맞춤:  ○ Fluid  ○ Frame               │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [2] 섹션 구성                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ 섹션 1: [제목___________] [+ 페이지 추가]   │    │
│  │   └─ 01-1: [제목___] [레이아웃▼] [콘텐츠📁]│    │
│  │   └─ 01-2: [제목___] [레이아웃▼] [콘텐츠📁]│    │
│  │ [+ 섹션 추가]                                │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [3] 기능 옵션                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ ☑ TTS 자동 읽기 기능                        │    │
│  │ ☑ 편집 모드 (인라인 텍스트 편집)            │    │
│  │ ☑ 팁 메모 시스템                            │    │
│  │ ☑ 스크립트 뷰어 생성                        │    │
│  │ ☑ 발표 전용 진입점 (index01.html)           │    │
│  │ □  커스텀 오디오 (tts/audio/ 폴더 생성)     │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [4] 출력 경로                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📁 <OutputRoot>/<NewProject>/                │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│              [▶ 시작 — 자동 생성]                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 9-2. 시작 버튼 클릭 시 CLAUDE 자동 생성 절차

```
STEP 1: pres-config.json 파싱
STEP 2: 출력 폴더 생성 (없으면 새로 만들기)
STEP 3: 공통 모듈 파일 복사
  - mode-tip.css, presentation-overrides.css, content-frame.css
  - theme.js, editor.js, mode-selector.js, tip-memo.js
  - fit-viewport.js, site-actions.js, spa-link.js
  - tts/tts-engine.js, tts/tts-ui.css
STEP 4: index.html 생성 (설정값 기반 TOC 자동 구성)
STEP 5: index01.html 생성 (발표 전용 진입점)
STEP 6: 각 섹션/페이지별 HTML 생성
  - 지정 레이아웃 템플릿 적용
  - 콘텐츠 파일에서 데이터 추출 → 슬롯 채움
  - PREV/NEXT 링크 자동 연결
STEP 7: 스크립트 MD 생성 (script-text/{pageId}.md)
  - 콘텐츠 분석 → 구어체 1~2 단락 자동 작성
  - ⏱권장소요 / 🎯핵심메시지 / 💡강조포인트 포함
STEP 8: viewer.html 생성
  - SCRIPTS 배열 자동 구성
  - MD["{pageId}"] 인라인 삽입
  - TTS 통합 (설정 옵션에 따라)
STEP 9: script-text/README.md 생성
  - 전체 페이지 매핑 테이블
  - 누적 발표 시간 계산
STEP 10: 완료 보고 (생성 파일 수, 총 페이지, 예상 발표 시간)
```

---

## 10. CLAUDE 자동 생성 프롬프트 템플릿

다음 프롬프트를 CLAUDE에게 전달하면 설정 파일을 읽고 전체 시스템을 생성한다.

```
다음 설계서와 설정 파일을 읽고, [기준 원본 프로젝트] 의 구조를
그대로 복제하여 새 발표 시스템을 생성해주세요.

1. 설계서 읽기: [출력경로]/requirements/PRESENTATION-BUILDER-SPEC.md
2. 설정 파일 읽기: [출력경로]/pres-config.json
3. 기준 프로젝트 참조: [기준 원본 프로젝트]

생성 순서:
- 공통 모듈 파일 복사 (tts/, CSS, JS)
- index.html (TOC + 발표 설정 바)
- index01.html (발표 전용 진입점)
- 각 발표 페이지 HTML ({pageId}.html)
- 발표 스크립트 (script-text/{pageId}.md)
- 스크립트 뷰어 (script-text/viewer.html)
- README (script-text/README.md)

4종 동시 작업 의무 (PRESENTATION-PAGE-SCRIPT-SYNC):
  HTML ↔ script-text/MD ↔ viewer.html MD[] ↔ README.md
```

---

## 11. 발표 모드별 동작 정의

### 11-1. 일반 모드 (기본)

- 목차 페이지에서 링크 클릭 → iframe SPA 로드
- 편집 UI 숨김, 발표 오버라이드 미적용
- TTS 수동 실행만 (자동 읽기 Off 기본)

### 11-2. 편집 모드 (`data-mode="edit"`)

활성 기능:
- `data-eid` 요소 더블클릭 → 인라인 편집
- 팁 메모 FAB 표시
- 레이아웃 편집 패널 (우측 아이콘, 개발 진행 중)
- `Ctrl+S` → localStorage 저장
- `Ctrl+Z` → 5단계 되돌리기

비활성:
- vfit 자동 맞춤 (편집 중 콘텐츠 크기 변경 때문)

### 11-3. 발표 모드 (`data-mode="presentation"`)

활성 기능:
- vfit 자동 화면 맞춤 (CSS 변수 `--vfit-k` 스케일)
- 편집 UI 완전 숨김
- TTS 자동 읽기 옵션 반영
- 전체화면 지원

Frame / Fluid 분기 (`data-fit-mode`):
- **Frame**: 고정 캔버스(1200×900) → 전체 스케일 (발표용)
- **Fluid**: 브라우저 너비 맞춤 → 자연스럽게 흐름 (리뷰용)

### 11-4. 단독 발표 모드 (`index01.html`)

- 자동 풀스크린 요청
- iframe 키보드 이벤트 포워딩
- 발표 모드 강제 + Frame 맞춤
- 외부 의존성 최소화

---

## 12. TTS 커스텀 음성 등록 절차

```
1. 각 페이지 발표 스크립트 (script-text/{pageId}.md) 의 --- ~ --- 구간 텍스트 확인
2. 해당 텍스트를 직접 읽어 녹음 (.mp3 또는 .wav)
3. tts/audio/{pageId}.mp3 로 저장
4. TTS.playAudio('tts/audio/{pageId}.mp3') 호출
   → 파일 존재 시 오디오 재생, 없으면 Web Speech API 폴백 자동 처리
```

---

## 13. 발표 설정 바 (`index.html` 내 `.pres-settings`)

```html
<div class="pres-settings">
  <span class="ps-label">발표 설정</span>
  <!-- 자동 읽기 토글 (localStorage['tts-autoplay'] 공유) -->
  <label class="ps-toggle">
    <input type="checkbox" id="ps-autoplay"> 자동 읽기
  </label>
  <div class="ps-sep"></div>
  <!-- 스크립트 뷰어 바로가기 -->
  <a class="ps-link" href="script-text/viewer.html" target="_blank">📄 스크립트 뷰어</a>
  <!-- 추가 확장 가능한 옵션 슬롯 -->
</div>
```

`storage` 이벤트로 `viewer.html` 과 실시간 동기화 (두 창 동시 열림 시 즉시 반영).

---

## 14. 신규 페이지 추가 체크리스트 (4종 동시 작업)

새 HTML 페이지 생성 시 반드시 4종 동시 작업:

| # | 파일 | 작업 내용 |
|---|------|-----------|
| 1 | `{pageId}.html` | 페이지 본문 (표준 템플릿 적용) |
| 2 | `script-text/{pageId}.md` | 발표 스크립트 (구어체 1~2 단락) |
| 3 | `script-text/viewer.html` | `SCRIPTS` 배열 + `MD["{pageId}"]` 인라인 추가 |
| 4 | `script-text/README.md` | 매핑 테이블 행 추가 + 누적 시간 재계산 |

---

## 15. 확장 로드맵 (미구현 · 설계 완료)

| Phase | 기능 | 설계 문서 |
|-------|------|-----------|
| P1 | 레이아웃 편집 아이콘 + 패널 셸 | `01_phase1_edit_icon.md` |
| P2 | 표준 레이아웃 템플릿 카탈로그 (L01~L14) | `02_phase2_layout_templates.md` |
| P3 | 드래그·리사이즈·반응형 엔진 | `03_phase3_layout_engine.md` |
| P4 | 01-1·01-2 파일럿 적용 | `04_phase4_pilot.md` |
| P5 | 전체 확장 + 마이그레이션 도구 | `05_phase5_rollout.md` |
| S2 | 슬롯 시스템 + LLM 자동 채움 | `11_llm_placeholder.md` |

---

## 부록 A. 전체 JS 모듈 API 요약

### `TTS` (전역 객체, `tts/tts-engine.js`)

```javascript
TTS.setMd(mdString)         // MD 문자열에서 멘트 추출 후 세팅
TTS.loadMd(url)             // .md 파일 fetch 후 세팅 (Promise)
TTS.play([overrideText])    // 재생 시작
TTS.toggle()                // 재생↔일시정지 전환
TTS.stop()                  // 정지 (상태 idle 복귀)
TTS.playAudio(url, [fallbackText]) // 오디오 파일 재생 (없으면 TTS 폴백)
TTS.bindUI({playBtn, pauseBtn, stopBtn, rateSelect, pitchSelect, voiceSelect, statEl})
TTS.bindKey(key)            // 키보드 단축키 (기본 'T')
TTS.initVoices(selectEl)    // 음성 드롭다운 채우기
TTS.state                   // 'idle' | 'playing' | 'paused' | 'audio'
```

### `viewer.html` 전역 변수

```javascript
SCRIPTS   // [[id, title], ...] — 페이지 목록 순서
MD        // {pageId: mdString} — 인라인 스크립트 딕셔너리
idx       // 현재 페이지 인덱스
render()  // 현재 idx 페이지 렌더링 (오버라이드 체인 지원)
```

---

## 부록 B. localStorage 키 목록

| 키 | 타입 | 설명 |
|----|------|------|
| `kickoff-mode` | `'edit'` \| `'presentation'` | 현재 모드 |
| `kickoff-fit-mode` | `'frame'` \| `'fluid'` | 화면 맞춤 모드 |
| `kickoff-edit::{pageId}` | JSON | 페이지별 편집 내용 |
| `kickoff-tips` | JSON | 전체 팁 메모 (`{pageId: {text, ts}}`) |
| `tts-autoplay` | `'0'` \| `'1'` | 자동 읽기 On/Off |
| `kickoff-sync` | JSON | 마지막 뷰어 동기화 (`{id, ts}`) |

---

*이 설계서는 `[기준 원본 프로젝트]` 프로젝트의 현재 구현을 완전히 반영한다.*  
*CLAUDE에게 이 문서 + `pres-config.json` 을 함께 전달하면 동일한 시스템을 새 경로에 자동 생성할 수 있다.*
