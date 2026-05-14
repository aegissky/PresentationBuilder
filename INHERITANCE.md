---
type: INHERITANCE
project_code: PresentationBuilder
created: 2026-05-09
updated: 2026-05-14
owner: admin
self_contained: true
---

# PresentationBuilder — 상속 선언 (자체완결)

> **본 배포본은 자기 자신이 SSOT**. 외부 헌법·정책 디렉터리에 의존하지 않는다.
> 본 폴더만으로 발표 생성 + 슬라이드 운영 + 자산 검증이 가능하다.

---

## §1. 자체완결 원칙

| 항목 | 위치 | 역할 |
|------|------|------|
| **방법론** | `_GUIDE/SKILL.md` | 7-Phase 발표 생성 절차 |
| **프롬프트 표준** | `PROMPT-STANDARDS.md` | LLM 호출 시 표준 형식 |
| **배포 정책** | `DEPLOYMENT-POLICY.md` | 버전·동기화·자산 정합 |
| **스킬 진입점** | `CLAUDE.md` / `CLAUDE_local.md` | LLM 도구 인식 |
| **운영 도구** | `_scripts/*.ps1` | 부트스트랩·검증·헤드 주입 |
| **자산 매니페스트** | `_core/MANIFEST.json` + `_core/features.manifest.json` | sha256 무결성 + 기능 카탈로그 |

## §2. 상속 계층 (단일 레이어)

```
PresentationBuilder/      ← 본 배포본 (자체완결, SSOT)
  └─ <새 PPT 인스턴스>   ← new-presentation.ps1로 부트스트랩
       pres-config.json._meta.core_version_used 로 본 배포본 추적
```

외부 헌법 디렉터리에 의존하지 **않는다**. clone 후 즉시 실행 가능.

## §3. 내장 규칙 (외부 헌법 대체)

본 배포본은 다음 규칙을 자체적으로 강제한다:

| 코드 | 내용 | 적용 위치 |
|------|------|----------|
| **PB-SELF-CONTAINED** | 모든 운영 스크립트는 `$PSScriptRoot` 기반 자동 동작 | `_scripts/*.ps1` |
| **PB-MANIFEST-INTEGRITY** | 14 자산 sha256 정합 의무 | `_core/MANIFEST.json` + `verify-manifest.ps1` |
| **PB-PAGE-SCRIPT-SYNC** | 슬라이드 생성 시 HTML + script-text/{id}.md + viewer.html + nav-data.js 4종 동시 작성 의무 | `_GUIDE/SKILL.md` Phase 4 |
| **PB-DEPLOY-POLICY** | 자산 변경 시 매니페스트 갱신 + core_version bump 의무 | `DEPLOYMENT-POLICY.md` §7 |
| **PB-PROMPT-STANDARD** | LLM 호출 시 표준 7-항목 인터뷰 + TOC 확인 게이트 의무 | `PROMPT-STANDARDS.md` |

## §4. 변경 이력

| 일자 | 변경 |
|------|------|
| 2026-05-09 | 최초 생성 |
| 2026-05-14 | **자체완결 전환** — 외부 헌법 디렉터리 의존 제거, 내장 규칙 5종 명시 |
