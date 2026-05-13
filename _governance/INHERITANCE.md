---
role: SPEC
domain: 거버넌스
sub_task: product-layer-inheritance
topic: [inheritance, governance, PresentationBuilder]
context: PresentationBuilder가 L0·L1 레이어에서 어떤 헌법과 정책을 상속받는지 선언
updated: 2026-05-03
---

# PresentationBuilder — L0·L1 상속 선언

```
L0  global_index/              전역 헌법 (불가침 적용)
L1  base/llm_root/             base 정책·방법론
L1  base/#Global SkillNet/     재사용 스킬
L2  product/PresentationBuilder/  이 프로젝트 (현재 레이어)
```

---

## L0 상속 — 전역 헌법 (전부 적용)

| 헌법 코드 | 파일 | 적용 여부 |
|----------|------|:--------:|
| PROCESS-KILL | `global_index/01_constitution/PROCESS-KILL.md` | ✅ |
| TCE | `global_index/01_constitution/TCE.md` | ✅ |
| CONTEXT-CHAIN | `global_index/01_constitution/CONTEXT-CHAIN.md` | ✅ |
| FORWARD-ONLY | `global_index/01_constitution/FORWARD-ONLY.md` | ✅ |
| DEEP-JUDGMENT | `global_index/01_constitution/DEEP-JUDGMENT.md` | ✅ |
| STEP-CHECKPOINT | `global_index/01_constitution/STEP-CHECKPOINT.md` | ✅ |
| CODE-CLEANUP | `global_index/02_dev_rules/CODE-CLEANUP-COMPLETENESS.md` | ✅ |
| OUTPUT-FORMAT | `global_index/01_constitution/OUTPUT-FORMAT.md` | ✅ |
| UI-FUNCTION-CONNECT | `global_index/02_dev_rules/UI-FUNCTION-CONNECT.md` | ✅ |
| API-SERIALIZATION-PARITY | `global_index/02_dev_rules/API-SERIALIZATION-PARITY.md` | ✅ |
| PATH-ENCODING-SAFETY | `global_index/02_dev_rules/PATH-ENCODING-SAFETY.md` | ✅ |
| CRI | `global_index/02_dev_rules/CODE-REFERENCE-INTEGRITY.md` | ✅ |
| PRESENTATION-PAGE-SCRIPT-SYNC | `global_index/03_project_rules/PRESENTATION-PAGE-SCRIPT-SYNC.md` | ✅ |
| WHG | `global_index/02_dev_rules/WORK-HISTORY-GOVERNANCE.md` | ✅ |
| MFG | `global_index/02_dev_rules/MD-FILE-GOVERNANCE.md` | ✅ |

---

## L1 상속 — base 정책

| 정책 | 파일 | 적용 여부 | 비고 |
|------|------|:--------:|------|
| 모델 선택·토큰 최적화 | `base/llm_root/09_optimization/token-model.md` | ✅ | |
| 기능 추가·수정 게이트 | `base/llm_root/04_design/pia-gate.md` | ✅ | 슬라이드 기능 추가 전 |
| 코드 작성 가이드 | `base/llm_root/05_coding/coding-guard.md` | ✅ | HTML/CSS/JS |
| 필수 개발 정책 | `base/llm_root/05_coding/dev-mandatory-policy.md` | ✅ | §DMP |

---

## L1 스킬 상속 — #Global SkillNet

| 스킬 ID | 스킬명 | 용도 |
|---------|--------|------|
| 27 | change_guard_skill | 공통 모듈 변경 보호 |
| 32 | critical_evaluator_skill | 완료 선언 전 평가 |
| 47 | ersl_skill | 버그 수정 |
| 51 | work_history_skill | 작업 이력 관리 |

---

## L2 오버라이드 — PresentationBuilder 전용

```
프로젝트명  : PresentationBuilder
레이어      : L2
루트 경로   : D:/projects/products/PresentationBuilder/
LLM 진입점  : CLAUDE_local.md (Claude Code 오버라이드)
스택        : HTML · CSS · JS · TTS
로컬 스킬   : _GUIDE/SKILL.md (최우선)
```

| 항목 | L0/L1 기본값 | PresentationBuilder 오버라이드 | 근거 |
|------|------------|---------------------------|------|
| 스킬 1차 참조 | #Global SkillNet | `_GUIDE/SKILL.md` 최우선 | 발표 생성 전용 스킬 |
| 신규 슬라이드 생성 | 일반 파일 생성 게이트 | PRESENTATION-PAGE-SCRIPT-SYNC 4종 동시 의무 | 스크립트 누락 방지 |
| 완료 선언 형식 | 기본 | 브라우저 실행 시나리오 3경로 필수 포함 | UI 검증 불가 환경 |

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|---------|
| 2026-05-03 | 최초 생성 — products _governance/ 전환 작업 |
