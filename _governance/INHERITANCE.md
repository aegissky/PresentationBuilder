---
role: SPEC
domain: 거버넌스
sub_task: self-contained-inheritance
topic: [inheritance, governance, PresentationBuilder, self-contained]
updated: 2026-05-14
self_contained: true
---

# PresentationBuilder — 자체완결 상속 선언

> 본 배포본은 외부 헌법 디렉터리에 의존하지 않는다.
> 모든 규칙은 본 폴더 내부 문서로 자기 충족적이다.

---

## §1. 내부 규칙 (자체완결 5종)

| 코드 | 내용 | 강제 위치 |
|------|------|----------|
| **PB-SELF-CONTAINED** | `_scripts/*.ps1`은 `$PSScriptRoot` 기반 — 절대경로 하드코딩 금지 | 코드 |
| **PB-MANIFEST-INTEGRITY** | 14 자산 sha256 정합 의무 | `_scripts/verify-manifest.ps1` |
| **PB-PAGE-SCRIPT-SYNC** | 슬라이드 생성 시 HTML + script + viewer + nav 4종 동시 | `_GUIDE/SKILL.md` Phase 4 |
| **PB-DEPLOY-POLICY** | 자산 변경 시 매니페스트 갱신 + core_version bump | `../DEPLOYMENT-POLICY.md` §7 |
| **PB-PROMPT-STANDARD** | LLM 호출 시 표준 7-항목 인터뷰 + TOC 확인 게이트 | `../PROMPT-STANDARDS.md` |

## §2. 상속 계층 (단일 레이어)

```
PresentationBuilder/                     ← 본 배포본 (SSOT, 단일 레이어)
  ├─ _GUIDE/SKILL.md                    7-Phase 방법론
  ├─ PROMPT-STANDARDS.md                프롬프트 표준
  ├─ DEPLOYMENT-POLICY.md               배포 정책
  ├─ _core/MANIFEST.json                자산 무결성
  └─ _scripts/*.ps1                     운영 도구
       │
       └─ <부트스트랩된 새 PPT>          인스턴스
           pres-config.json._meta로 본 배포본 추적
```

## §3. 외부 의존성 (선택적, 비차단)

| 외부 자산 | 본 배포본 영향 | 비고 |
|----------|--------------|------|
| Google Fonts CDN | 폰트 렌더 (CLOSED 망 시 DEPLOYMENT-POLICY §4 로컬 호스팅) | 비차단 |
| 사용자별 AI 도구 (Claude Code / ChatGPT / Cursor) | LLM 트리거 환경 | 임의 선택 |

## §4. L2 오버라이드 (사용자 확장 지점)

- `CLAUDE_local.md` — 조직별 규칙 추가
- `_GUIDE/SKILL.md` — 방법론 보강 (단 PB-PAGE-SCRIPT-SYNC 헌법은 유지)
- `_templates/projects/<유형>/manifest.json` — 새 발표 유형 정의
- `_templates/projects/_template.manifest.json` — 마스터 뼈대 (복제 기준)

## §5. 변경 이력

| 일자 | 변경 |
|------|------|
| 2026-05-03 | 최초 생성 (외부 AEGIS 상속 기반) |
| 2026-05-14 | **자체완결 전환** — 외부 의존 제거, 내부 5 규칙 명시, 단일 레이어 선언 |
