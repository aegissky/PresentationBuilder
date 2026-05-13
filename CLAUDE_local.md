# PresentationBuilder — 로컬 스킬 등록

> 이 파일은 `D:/projects/products/PresentationBuilder` 프로젝트의 CLAUDE 로컬 설정이다.

## 스킬 참조 우선순위

이 프로젝트에서는 아래 순서로 스킬을 참조한다:

1. **로컬 스킬** (최우선): `_GUIDE/SKILL.md`
2. **전역 스킬**: `D:/aegis/base/02_skills/general/`
3. **폴백**: `D:/aegis/base/02_skills/specialized/skills/`

## 프로젝트 진입 시 자동 실행

이 폴더가 작업 디렉토리일 때:

1. `_GUIDE/SKILL.md` 읽기
2. `pres-config.json` 존재 확인
3. `_input/` 폴더 자료 탐색
4. 사용자 요청 대기

## 트리거 키워드

다음 키워드 발화 시 `_GUIDE/SKILL.md` 자동 발동:

- "발표 만들어줘"
- "프리젠테이션 생성"
- "보고서 슬라이드"
- "PresentationBuilder"
- "발표 자료 만들어줘"
- "슬라이드 만들어줘"
- "착수보고 / 제안서 / 사업계획서 / 보고서 만들어줘"

## 기준 템플릿 경로

```
D:/projects/products/PresentationBuilder/
```

공통 모듈 (신규 프로젝트 생성 시 복사 대상):
- CSS: mode-tip.css, presentation-overrides.css, content-frame.css, theme-ai.css
- JS:  theme.js, editor.js, mode-selector.js, tip-memo.js, fit-viewport.js,
       site-actions.js, spa-link.js, _sync_check.js, theme-ai.js
- TTS: TTS/tts-engine.js, TTS/tts-ui.css

## 설계서 참조

전체 기술 명세: `requirements/PRESENTATION-BUILDER-SPEC.md`

---

## AUTO-SKILL-TRIGGER 상속 (PresentationBuilder HTML/CSS/JS/TTS 특화)

> 전역 `AUTO-SKILL-TRIGGER` 헌법(`~/.claude/global_index/02_dev_rules/AUTO-SKILL-TRIGGER.md`) 상속.
> 아래 조건은 **PresentationBuilder 파일 패턴·`_GUIDE/SKILL.md` 연동**으로 구체화한 오버라이드다.

### 파일별 자동 트리거

| 감지 조건 | 즉시 로드 스킬 | 실행 항목 |
|----------|--------------|----------|
| 슬라이드 HTML 파일 편집 (버튼·링크·카드 요소) | `UI-FUNCTION-CONNECT` C1~C9 | onclick 연결·ID 일치·이벤트 버블링 확인 |
| 공통 JS 모듈 편집 (`theme.js` / `editor.js` / `spa-link.js` 등) | `27_change_guard_skill` | 변경 전후 기능 회귀 대조, 공통 모듈 의존 슬라이드 영향 확인 |
| TTS 관련 코드 수정 (`TTS/tts-engine.js` / `TTS/tts-ui.css`) | `27_change_guard_skill` + `UI-FUNCTION-CONNECT` C9 | TTS 재생·정지·오류 경로 3가지 시나리오 확인 |
| 기존 공통 모듈 교체·삭제 | `50_code_cleanup_guard_skill` FRC 7/7 | 구형 모듈 참조 슬라이드 전수 grep·연결 동등성 확인 |
| 신규 슬라이드 HTML 생성 | **PRESENTATION-PAGE-SCRIPT-SYNC** 4종 의무 | script-text/<page>.md + viewer.html 배열 + README.md 동시 작업 |
| 버그 수정 작업 | `47_ersl_skill` ERG→ESS→5W2H | 원인 파악 전 증상만 보고 수정 금지 |

### PRESENTATION-PAGE-SCRIPT-SYNC 연동 (신규 슬라이드 생성 시)

신규 HTML 슬라이드 생성 시 AUTO-SKILL-TRIGGER는 **`_GUIDE/SKILL.md` → PRESENTATION-PAGE-SCRIPT-SYNC 4종 동시 작업**을 강제한다:

```
1. <page>.html — 슬라이드 본문
2. script-text/<page>.md — 발표 스크립트
3. script-text/viewer.html — SCRIPTS 배열 + MD["<page>"] 추가
4. script-text/README.md — 매핑 테이블 행 + 누적 시간 재계산
```

4종 중 하나라도 누락 시 완료 선언 금지.

### 실패 패턴 블랙리스트 (반복 금지)

| # | 패턴 | 발생 위치 | 방지 트리거 |
|---|------|----------|------------|
| P1 | 슬라이드 HTML만 생성하고 script-text 누락 — 발표 시 스크립트 없음 | 신규 HTML 생성 | PRESENTATION-PAGE-SCRIPT-SYNC 4종 동시 확인 |
| P2 | 공통 JS 모듈 수정 후 의존 슬라이드 회귀 미확인 — 일부 슬라이드 동작 파손 | 공통 JS 편집 | `27_change_guard` + 영향 슬라이드 grep 확인 |

---

_갱신: 2026-05-02 | AUTO-SKILL-TRIGGER 상속 추가 | SELECTIVE-SYNC_
