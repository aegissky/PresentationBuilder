# PresentationBuilder

> **자체완결** LLM 기반 발표 자료 자동 생성 도구.
> 본 폴더만 있으면 동작. 외부 의존성 없음.

## 스택

HTML · CSS · JS · TTS · PowerShell 5.1+

## 5분 시작

```powershell
# 1. 새 PPT 부트스트랩 (한 줄)
.\_scripts\new-presentation.ps1 -Name MyReport -Project kickoff -Org "ACME"

# 2. 생성된 폴더의 _input/ 에 자료 넣기
#    01_documents/ 02_images/ 03_data/

# 3. AI 트리거
#    "발표 만들어줘"  ← _GUIDE/SKILL.md 자동 발동
```

## 문서

| 문서 | 역할 |
|------|------|
| [`QUICKSTART.md`](QUICKSTART.md) | 5분 시작 가이드 |
| [`PREREQUISITES.md`](PREREQUISITES.md) | 사전 준비사항 (도구·자료·환경) |
| [`LLM-WORKFLOW.md`](LLM-WORKFLOW.md) | LLM 사용 7-Phase 흐름 |
| [`PROMPT-STANDARDS.md`](PROMPT-STANDARDS.md) | LLM 프롬프트 표준 (헌법 역할) |
| [`DEPLOYMENT-POLICY.md`](DEPLOYMENT-POLICY.md) | 배포·동기화·버전 정책 |
| [`_GUIDE/SKILL.md`](_GUIDE/SKILL.md) | 7-Phase 방법론 SSOT |
| [`INHERITANCE.md`](INHERITANCE.md) | 자체완결 상속 선언 (5 내부 규칙) |

## 운영 도구

```powershell
.\_scripts\new-presentation.ps1   # 새 PPT 부트스트랩 (-Name, -Project, -Theme, -Org)
.\_scripts\verify-manifest.ps1    # 자산 sha256 정합 검증
.\_scripts\inject-head.ps1        # 슬라이드 표준 헤드 슬롯 자동 주입
```

## 7 발표 유형 (`_templates/projects/`)

`kickoff` (착수보고) · `proposal` (제안서) · `business-plan` (사업계획서) · `interim` (중간보고) · `completion` (완료보고) · `education` (교육자료) · `ir-pitch` (IR 피치덱)

## 5 내부 규칙 ([INHERITANCE.md](INHERITANCE.md))

`PB-SELF-CONTAINED` · `PB-MANIFEST-INTEGRITY` · `PB-PAGE-SCRIPT-SYNC` · `PB-DEPLOY-POLICY` · `PB-PROMPT-STANDARD`

## 라이선스

내부 활용용.
