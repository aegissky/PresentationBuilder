---
type: PROJECT_LOCAL
project_code: PresentationBuilder
created: 2026-05-09
owner: admin
aegis_root: D:\aegis
---

# PresentationBuilder — 프로젝트 진입점

> SELECTIVE-SYNC 적용 — 미기재 항목은 상위 계층에서 탐색
> 탐색 순서: CLAUDE_local.md → D:\aegis\CLAUDE.md → ~/.claude/CLAUDE.md

## 프로젝트 개요

- **목적**: AI 기반 발표 자료 자동 생성 도구
- **스택**: HTML · CSS · JS · TTS
- **로컬 스킬**: `_GUIDE/SKILL.md` (최우선)
- **루트**: `D:\projects\products\PresentationBuilder\`

## 상속 구조

```
~/.claude/CLAUDE.md                    ← 전역 게이트웨이
  └─ D:\aegis\CLAUDE.md               ← AEGIS 채널
       └─ PresentationBuilder/CLAUDE.md ← 이 파일
            └─ CLAUDE_local.md         ← 프로젝트 특화 오버라이드
```

## 트리거 키워드

"발표 만들어줘", "프리젠테이션 생성", "슬라이드 만들어줘" 등 →
`_GUIDE/SKILL.md` 자동 발동

## 거버넌스

- `_governance/INHERITANCE.md` — L0·L1 상속 선언
- `_governance/INDEX.md` — 거버넌스 파일 목록
