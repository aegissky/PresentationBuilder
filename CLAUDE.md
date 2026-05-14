---
type: PROJECT_LOCAL
project_code: PresentationBuilder
created: 2026-05-09
updated: 2026-05-14
owner: admin
self_contained: true
---

# PresentationBuilder — 프로젝트 진입점

> **단독 실행본**. 외부 의존성 없음. 본 폴더만 있으면 동작한다.
> LLM(Claude Code / ChatGPT / 기타)이 본 프로젝트에 진입하면 `_GUIDE/SKILL.md`가 최우선 스킬로 발동.

---

## §1. 프로젝트 선언

| 키 | 값 |
|----|-----|
| **ENV_STAGE** | `deploy` |
| **NET_TYPE** | `INTERNET` (Google Fonts CDN — CLOSED 망 배포 시 [DEPLOYMENT-POLICY §4](DEPLOYMENT-POLICY.md) 참조) |
| **CDN_ALLOWED** | `true` (Noto Sans KR — fonts.googleapis.com) |
| **SELF_CONTAINED** | `true` — `_scripts/*.ps1`이 `$PSScriptRoot` 기반 자동 동작 |

---

## §2. 진입 시 우선순위

1. **`_GUIDE/SKILL.md`** — 본 프로젝트의 표준 7-Phase 방법론 (최우선)
2. **`PROMPT-STANDARDS.md`** — LLM 호출 시 프롬프트 표준 (헌법 역할)
3. **`_GUIDE/pres-config.template.json`** — 프로젝트 설정 스키마
4. **(있으면) `pres-config.json`** — 사용자 프로젝트 설정

## §3. 트리거 키워드

다음 입력이 감지되면 `_GUIDE/SKILL.md`가 자동 발동:

- "발표 만들어줘"
- "프리젠테이션 생성"
- "슬라이드 만들어줘"
- "PresentationBuilder"
- "보고서 슬라이드"

## §4. 운영 도구

```powershell
.\_scripts\new-presentation.ps1   # 새 PPT 부트스트랩 (1 명령)
.\_scripts\verify-manifest.ps1    # 자산 정합 검증
.\_scripts\inject-head.ps1        # 슬라이드 표준 헤드 슬롯 자동 주입
```

전체 가이드: [QUICKSTART.md](QUICKSTART.md) · [LLM-WORKFLOW.md](LLM-WORKFLOW.md) · [PREREQUISITES.md](PREREQUISITES.md) · [DEPLOYMENT-POLICY.md](DEPLOYMENT-POLICY.md) · [PROMPT-STANDARDS.md](PROMPT-STANDARDS.md)

## §5. 거버넌스

- `_governance/INDEX.md` — 거버넌스 파일 목록
- `_governance/INHERITANCE.md` — 자체완결 상속 선언 (외부 의존 없음)
- `DEPLOYMENT-POLICY.md` — 배포·동기화·버전 정책
- `PROMPT-STANDARDS.md` — LLM 프롬프트 표준
