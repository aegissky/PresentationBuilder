# PresentationBuilder — 시작 가이드

> CLAUDE가 이 폴더를 읽고 발표 자료를 **자동으로 생성**합니다.  
> 아래 3단계를 따라 파일을 준비한 뒤 CLAUDE에게 "발표 만들어줘"라고 말하면 됩니다.

---

## 1단계 — 자료 넣기

| 폴더 | 넣을 파일 | 예시 |
|------|-----------|------|
| `_input/01_documents/` | 원본 문서 | 제안서.docx, 보고서.pdf, 설명.txt, 기획서.md |
| `_input/02_images/` | 이미지·다이어그램 | 아키텍처.png, 로고.svg, 화면캡처.jpg |
| `_input/03_data/` | 데이터·수치·표 | KPI.xlsx, 일정표.csv, 비교표.txt |

> **TIP**: 파일이 없어도 됩니다. 텍스트로 내용을 직접 설명해도 CLAUDE가 생성합니다.

---

## 2단계 — 설정 파일 작성 (`pres-config.json`)

`pres-config.template.json` 을 복사하여 `pres-config.json` 으로 저장하고 내용을 채웁니다.

**최소 필수 항목:**
```json
{
  "project": { "name": "프로젝트명", "org": "조직명" },
  "brief": {
    "type": "착수보고",
    "audience": "임원",
    "tone": "공식·신뢰감",
    "duration": 30
  }
}
```

---

## 3단계 — CLAUDE에게 요청

```
이 폴더를 읽고 발표 자료 만들어줘
→ D:/projects/products/PresentationBuilder/_GUIDE/SKILL.md 참조
```

또는 단순하게:

```
PresentationBuilder로 [착수보고회 / 제안서 / 사업계획서] 만들어줘
```

---

## 폴더 구조

```
PresentationBuilder/
├── _GUIDE/                 ← 지금 보고 있는 폴더
│   ├── README.md           ← 이 파일
│   ├── pres-config.template.json
│   └── SKILL.md            ← CLAUDE 자동 생성 스킬
├── _input/                 ← 사용자 자료 입력
│   ├── 01_documents/       ← 원본 문서
│   ├── 02_images/          ← 이미지
│   └── 03_data/            ← 데이터·표
├── [공통 JS·CSS 모듈]      ← 프레임워크 (수정 불필요)
├── TTS/                    ← TTS 엔진 + 커스텀 녹음
│   └── audio/              ← {pageId}.mp3 녹음 파일
├── script-text/            ← 발표 스크립트 (자동 생성됨)
├── md/                     ← 원본 마크다운 (자동 생성됨)
├── business/               ← 업무별 상세 페이지 (자동 생성됨)
└── requirements/
    └── PRESENTATION-BUILDER-SPEC.md  ← 전체 설계서
```
