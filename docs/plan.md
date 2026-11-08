# fullship — Claude Code 플러그인 계획 (v2, 2026-11-08)

> 다른 세션에서 이 파일을 읽고 만들기 시작하면 됩니다. v1 초안을 평가·질문으로 구체화한 판입니다.
> 목표: 작은 팀·1인 웹 서비스를 **개발 → 검증 → 출시 → 출시 분석 → 홍보 → 영상**까지 한 흐름으로 돕는 플러그인.
> 대상: **공개 배포 전제**(나 혼자만 쓰는 게 아님), **스택 범용**.

## 0. 확정된 결정 (2026-11-08)
| 주제 | 결정 |
|---|---|
| 사용자 | 공개 배포 전제. 스킬 설명(description)은 영어, 결과물은 프로젝트 언어를 따름. 개인 습관·값은 플러그인에 넣지 않고 프로젝트 설정으로 |
| 스택 | 범용. 스택별 지식은 `references/adapters/<스택>.md`로 분리(Supabase, Cloudflare, Vercel, Netlify, Firebase…), `/fullship:setup`이 감지해 고름 |
| 프로젝트 설정 | `/fullship:setup`이 `.fullship/config.json` + CLAUDE.md 구간을 만들어 줌 (기본 `/init`보다 나은 판) |
| 쉽게 쓰기 | **외울 명령은 두 개**(`/fullship:setup` 처음 한 번, `/fullship:ship` 끝낼 때) + 막히면 `/fullship:help`. 나머지는 말로("다 됐어, 점검해 줘"). 에이전트·묶음·설정 파일은 사용자에게 안 보이게(14절) |
| 라이선스 | **MIT** (2026-11-08 확정, `LICENSE` 추가) |
| 계획 모드 | **"계획을 언제 먼저 세우나"만 정함**: 큰 작업만(기본) / 항상 / 수동. 프로젝트당 한 번 묻고 저장, 세션 시작 때 한 줄 표시, `/fullship:mode`로 변경(4절) |
| 검증 | **점수 대신 통과/실패 + 실행한 명령 근거**. 완료 기준은 먼저 실패하는 테스트로(TDD 빨강→초록). 화면은 스크린샷 비교가 근거 |
| 영상·이미지 | `trailer`, `share-card`는 **같은 플러그인 안 별도 묶음(media)**, 기본 꺼짐 |
| 출시 분석 | `release-insights` — 채널: GitHub Releases, 브라우저 확장 스토어, 자체 자동 업데이트 서버, npm 등 패키지 + 사이트 통계. 어떤 API를 연결할지 **에이전트가 제안** |
| 기존 스킬 | `site-report`, `discord-bot`(→`notify`)을 옮긴 뒤 `~/.claude/skills/`의 원본은 지운다(같은 스킬이 두 개 뜨면 옛 것이 불릴 수 있음) |
| 이미 있는 것 | 디자인·영상·SEO·테스트 등 **이미 잘 만든 플러그인·스킬은 다시 만들지 않고 추천**. 출처는 Claude 플러그인 디렉터리 + **skills.sh**. 설치돼 있으면 우리 스킬은 그쪽에 넘기고 빠진 부분만(11절) |

## 1. 왜 만드나
- 공식·커뮤니티 플러그인은 분야별로 흩어져 있다(feature-dev, Marketing, Remotion…). 개발 + 출시 분석 + 홍보 + 영상을 한 흐름으로 하는 건 없다.
- 차별점은 **"1인·작은 팀이 자주 놓치는 것"을 명령으로 검사**하는 것: 인수인계, 전후 비교, 화면 조합, 라이선스·개인정보·번역 누락, 무료 한도, 출시별 성과.

## 2. 구조
```
fullship/
  .claude-plugin/plugin.json
  commands/        setup, ship, help  (자주)  ·  mode, recommend  (가끔)
                   spec·handoff·idea는 명령 없이 말로 부르는 스킬
  skills/
    core/          spec-first, ship-checklist, golden-compare, screen-matrix,
                   release-guard, deploy-verify, handoff, quota-watch,
                   session-guard, feedback-inbox
    release/       release-insights, site-report, notify
    marketing/     promo-plan, promo-review, launch-post, outreach-log, seo-content
    media/         trailer, share-card          ← 별도 묶음, 기본 꺼짐
  agents/          plan-checker, reviewer, insights-scout, marketer
  hooks/hooks.json SessionStart 하나만 (계획 모드 한 줄 표시)
  references/adapters/<스택>.md
  references/recommended.md     추천 플러그인·스킬 목록(11절)
  templates/       config.json, CLAUDE.md 구간, spec.md, handoff.md
```
- 스킬 폴더는 Claude Code 규칙상 평평해야 하면 이름 앞에 묶음을 붙인다(`media-trailer` 등). 만들 때 확인.
- 묶음 켜고 끄기: `.fullship/config.json`의 `"modules": ["core","release","marketing"]`. 꺼진 묶음 스킬은 설명 첫 줄에 "only when media module is enabled"를 넣고, 스킬 안에서 설정을 확인해 꺼져 있으면 켜는 법만 안내.
- 만들 때 `skill-creator`로 SKILL.md·설명문 다듬기. **스킬마다 평가 케이스(불려야 할 말 3개 / 불리면 안 되는 말 3개)를 같이 작성**해 `claude plugin eval`에 바로 넣는다.

## 3. 프로젝트 설정: `/fullship:setup` (기본 /init보다 나은 점)
1. **감지**: package.json·lockfile·배포 설정(wrangler.toml, vercel.json, netlify.toml, supabase/)·테스트 러너·i18n 구조·manifest.json(확장)·릴리스 워크플로를 읽어 스택과 명령을 추정.
2. **모르는 것만 질문**: 배포 주소, 계획 모드, 켤 묶음, 브랜드 말투, 지원 언어.
3. **실행 가능한 점검표 생성**: `.fullship/config.json`의 `checks`에 `{ id, 이름, 명령, 통과 조건 }` 목록. 예: `build: npm run build (exit 0)`, `test: npx vitest run`, `mobile: screen-matrix 375px 가로 스크롤 0`.
4. **덮어쓰지 않음**: 이미 CLAUDE.md가 있으면 `<!-- fullship -->` 구간만 추가 제안, 충돌하면 `CLAUDE.md.fullship-new`로 둠.
5. 다시 돌리면 바뀐 것만 갱신(새 스택·새 언어 감지).
6. **추천**: 감지한 스택·작업에 맞는 기존 플러그인·스킬을 골라 제안(11절). 설치는 사용자가 고른 것만.

## 4. 계획 모드 (`/fullship:mode`)
**모드는 "계획을 언제 먼저 세우나"만 정한다** (원래 결정: v1 평가 3번 답변, 2026-11-08 바로잡음 — v2 초안에서 모든 기능의 자동 여부로 잘못 넓혔음).
- `big-only` (**기본**): 큰 작업일 때만 만들기 전에 계획(목표·선택지·추천·바뀌는 파일·완료 기준)을 보여 주고 승인받는다. 큰 작업 = 새 화면·새 기능, 파일 여러 개, 서버·DB·저장 정보 변경, 되돌리기 어려운 일. 작은 수정·명확한 지시는 바로.
- `always`: 코드를 바꾸는 요청이면 작은 것도 짧은 계획부터.
- `manual`: 자동으로 계획하지 않음. "계획 먼저 짜 줘"라고 하거나 `/fullship:spec`일 때만.
- 점검·배포 확인·추천 같은 **다른 기능은 모드와 상관없이** 시킬 때 하거나, 기능을 끝냈을 때 한 줄로 "점검할까요?" 제안만.
- SessionStart 훅: 설정이 없으면 "`/fullship:setup`로 시작", 있으면 `fullship · planning: big changes only · /fullship:help` 한 줄.

## 5. 스킬

### core — 개발·검증
1. **spec-first** (`/spec`) — 목표·선택지·추천·바뀌는 파일·완료 기준. 큰 기능은 `docs/specs/<날짜>-<이름>.md` 한 파일. 요구사항은 "~하면 ~한다 / ~하지 않는다", 완료 기준은 Given/When/Then 3~5개. 반복 작업엔 "멈출 조건 + 최대 횟수".
2. **ship-checklist** (`/ship`) — `config.checks`를 차례로 실행해 **통과/실패**. 로그는 `.fullship/evidence/<날짜>-<기능>/`에 파일로, 대화엔 종료 코드 + 끝 30줄. 완료 기준마다 "먼저 실패하던 테스트가 이제 통과"를 근거로 붙임. 돌리지 않은 검사는 "안 돌림"으로 표시(거짓 확인 금지).
3. **golden-compare** — 동작을 안 바꾸는 정리 전에 출력 저장 → 고친 뒤 비교 → 다른 줄만 보고. 출력 덤프 스크립트 틀 제공(예: 이 저장소 `scripts/calib/story-dump.mts`).
4. **screen-matrix** — Playwright로 기기(375·768·1280) × 언어 × 라이트/다크를 한 번에 촬영, 지난 촬영과 다른 화면·가로 스크롤·콘솔 오류를 표로. 기준 이미지는 `.fullship/screens/`.
5. **release-guard** — 출시 전 정적 검사 묶음(각각 통과/실패):
   - 라이선스: 번들 의존성에 GPL·AGPL 등 금지 목록이 섞였나
   - 개인정보: 새 저장 필드(DB 마이그레이션·localStorage 키·폼)가 생겼는데 개인정보처리방침이 안 바뀌었나
   - 번역: 한 언어에만 있는 문구·페이지
   - 번들 크기: 예산 초과
   - 비밀 키: 커밋 안에 키 모양 문자열
6. **deploy-verify** — push 후 실제 주소에서 새 번들 이름·새 페이지 200·OG 태그 확인.
7. **handoff** (`/handoff`) — 세션 끝에 `HANDOFF.md` 갱신: 한 일 / 남은 일 / 이번에 정한 것과 이유 / 다음에 먼저 볼 파일. 다음 세션이나 다른 사람이 바로 이어받게.
8. **quota-watch** — GitHub Actions 분, Supabase·Cloudflare·Vercel 무료 한도 대비 사용량 경고(어댑터별 API).
9. **session-guard** — 같은 폴더를 다른 세션이 쓸 때: 커밋 전 브랜치·남이 바꾼 파일 확인, 내가 안 고친 파일은 건드리지 않게.
10. **feedback-inbox** (`/idea`) — 디스코드·리뷰·이슈의 의견과 떠오른 아이디어를 `docs/backlog.md`에 모으고, 고를 때 중복·이미 한 것 표시.

### release — 출시·분석
11. **release-insights** — 출시(버전) 단위로 성과를 모아 "출시 전후" 비교 보고서:
    - GitHub Releases: 파일별 `download_count`(gh api)
    - 브라우저 확장 스토어: 사용자 수·평점·리뷰(Chrome Web Store, Edge, Firefox AMO — 가능한 공개/개발자 API)
    - 자체 자동 업데이트 서버: 업데이트 확인 요청 로그(버전별 활성 사용자 추정)
    - npm·PyPI 등: 다운로드 수
    - 사이트: site-report 결과(방문·검색 노출), 오류 수
    - 결과는 웹페이지 보고서 + 지난번 대비 변화
12. **site-report** (기존 스킬 이전) — SEO·Lighthouse·Search Console·Cloudflare·Clarity.
13. **notify** (기존 discord-bot 이전) — 작업 보고 DM. 키는 이름으로만, 키 파일 경로는 설정에.

### marketing — 홍보 (중심은 **홍보 계획 짜기**, 글쓰기는 그 다음)
13-1. **promo-plan** (`/fullship:promo`) — **이번 출시를 어떻게 퍼뜨릴지 계획**을 짠다. 결과는 `docs/promo/<날짜>-<이름>.md` 한 파일.
   1. **재료 찾기**: 패치노트·화면·출시 분석을 읽고 "사람들이 남에게 보여 주고 싶어 할 순간"을 찾는다(예: Stylish의 4글자 유형 결과·결과 이미지 = 공유하고 싶은 것).
   2. **누구에게**: 대상 2~3무리(예: 체스 커뮤니티, MBTI·성격 유형 좋아하는 사람, 개발자)와 그들이 모이는 곳.
   3. **바이럴 장치 점검** — 글보다 **제품 안에서 퍼지는 구조**가 먼저:
      - 공유할 이유: 결과가 나를 드러내나, 친구와 비교하고 싶나(유형·순위·도전)
      - 공유가 쉬운가: 한 번 눌러 공유, 미리보기(OG) 이미지가 예쁘게 뜨나, 링크 받은 사람이 바로 해 볼 수 있나
      - 되돌아오는 고리: 공유받은 사람이 자기 결과를 다시 공유하게 되나(친구 초대·비교·"너는 뭐 나왔어?")
      - 빠진 장치는 **제품 개선 제안**으로 돌린다(spec-first로 이어짐)
   4. **훅 만들기**: 채널별 첫 줄·썸네일 문구 후보 5개씩(호기심·비교·의외의 결과·숫자). 짧은 영상이 맞으면 media 묶음 trailer로.
   5. **채널·타이밍 표**: 채널마다 규칙(자기 홍보 허용 여부, 요일·시간, 길이, 금지 사항), 올리는 순서(작은 커뮤니티로 반응 보고 → 큰 곳), 날짜.
   6. **측정**: 채널별 UTM 링크, 볼 숫자(방문·공유 버튼 클릭·전환), 며칠 뒤 release-insights로 결과 확인 → 다음 계획에 반영.
   7. **하지 않을 것**: 가짜 계정·조작 후기·도배·커뮤니티 규칙 위반·과장. 게시·DM은 **사람이 직접**.
   - 바이럴은 보장할 수 없다고 분명히 말하고, "가설 → 작게 시험 → 숫자로 확인" 방식으로 쓴다.
13-2. **promo-review** — 지난 홍보 결과(outreach-log + 출시 분석)를 보고 무엇이 먹혔는지·다음엔 뭘 바꿀지 한 쪽 요약.
14. **launch-post** — promo-plan의 채널 표대로 글 초안(말투·길이·금지 사항 다르게). **게시는 사람이 직접**.
15. **outreach-log** — 보낸 기록을 먼저 읽고 이미 한 홍보를 다시 제안 안 함.
16. **seo-content** — 검색어 조사 → 가이드 글 개요 → 내부 링크·구조화 데이터 점검.

### media — 영상·이미지 (별도 묶음, 기본 꺼짐)
17. **trailer** — 15~30초 소개 영상. 장면 목록 승인 → Playwright 화면 녹화 또는 Remotion → 자막·음악(라이선스 확인된 것만) → 9:16·16:9 두 벌. 공식 Remotion 플러그인이 있으면 그것을 쓰고 우리는 장면 목록·소재 준비만.
18. **share-card** — OG 이미지·결과 카드·썸네일을 규격별로.
- media는 의존성(Remotion, ffmpeg)이 무거우므로 켤 때만 설치 안내. 나머지 묶음은 이것 없이 완전히 동작.

## 6. 커스텀 서브에이전트 (`agents/<이름>.md`)
서브에이전트 = 메인 대화와 **따로 떨어진 작업 공간**에서 일하고 결과 요약만 돌려주는 도우미.

### 언제 서브에이전트로 만드나 (원칙)
- **긴 출력·로그가 생기는 일**(테스트·빌드·스크린샷) → 메인 대화를 더럽히지 않게 따로 돌리고 표만 받는다.
- **넓게 읽는 일**(저장소 훑기, 웹·디렉터리 조사) → 병렬로, 읽기 전용.
- **독립된 눈이 필요한 일**(계획 점검, 리뷰) → 만든 사람과 다른 맥락에서 보게.
- 반대로 **대화 맥락이 필요한 일**(인수인계 작성, 계획 세우기, 사용자와 질문 주고받기)은 스킬로 둔다. 서브에이전트는 대화를 못 보고 사용자에게 질문도 못 한다.

### 공통 규칙
- 기본은 **읽기 전용**. 파일을 쓰는 건 `.fullship/` 아래(evidence, screens, reports)만.
- 결과는 정해진 형식으로: `통과/실패 표 + 근거(명령·파일) + 못 한 것`. 길어도 30줄.
- 되돌리기 어려운 일(배포·게시·설치·결제)은 하지 않는다 — 제안만 하고 메인이 사용자에게 묻는다.
- 모델: 판단이 필요한 건 상위 모델(inherit), 단순 실행·수집은 가벼운 모델(haiku)로 비용 절약. frontmatter `model`로 지정.
- 외부에 같은 역할 에이전트가 설치돼 있으면(11절) 그쪽에 넘긴다.

### 목록
| 이름 | 하는 일 | 도구 | 모델 | 부르는 곳 | 묶음 |
|---|---|---|---|---|---|
| **plan-checker** | 계획 PASS/DEBT: 빠진 화면(언어·휴대폰)·새 저장 정보(약관)·되돌리기 어려운 일·완료 기준·멈출 조건 없음 → DEBT와 고칠 항목 | Read, Grep, Glob | inherit | `spec-first` 끝 | core |
| **verifier** | `config.checks`를 차례로 실행, 로그는 `.fullship/evidence/`에, 돌려주는 건 통과/실패 표 + 실패 끝 30줄. "안 돌린 것"을 따로 표시 | Bash, Read, Write(evidence만) | haiku | `ship-checklist`, `deploy-verify` | core |
| **screen-tester** | Playwright로 기기×언어×테마 촬영, 기준 이미지와 비교, 가로 스크롤·콘솔 오류 표 | Bash, Read, Write(screens만), playwright MCP | haiku | `screen-matrix` | core |
| **guard** | 출시 전 정적 검사(라이선스·개인정보 필드·번역 누락·번들 크기·키 모양 문자열) | Bash, Read, Grep | haiku | `release-guard` | core |
| **reviewer** | 프로젝트 규칙 위반만(디자인 토큰, 금지 라이선스, 언어 누락, CLAUDE.md 규칙). 일반 버그·보안은 `/code-review`·`/security-review`에 맡김 | Read, Grep, Glob, Bash(git diff) | inherit | `/fullship:ship` 중, 사용자 요청 | core |
| **scout** | 추천 조사: 설치된 것 확인 → 11절 목록 대조 → skills.sh·디렉터리에서 새 후보 찾기 → 후보 표(신뢰도·감사 결과 포함). 설치는 안 함 | Read, Glob, WebFetch | haiku | `/fullship:recommend`, `fullship-guide` | core |
| **insights-scout** | 프로젝트를 읽고 "연결하면 볼 수 있는 출시 데이터와 필요한 API·키 이름" 제안 | Read, Glob, Grep, WebFetch | inherit | `release-insights` 처음 설정 | release |
| **release-analyst** | 설정된 채널(GitHub 다운로드, 스토어, 업데이트 서버, npm, 사이트 통계)에서 숫자를 모아 출시 전후 비교표 | Bash(gh·curl), Read, Write(reports만) | haiku | `release-insights` | release |
| **marketer** | promo-plan 재료 조사: 대상 커뮤니티의 규칙·잘 된 글 유형·비슷한 제품의 퍼진 사례를 읽어 요약(게시 안 함) | Read, WebFetch | inherit | `promo-plan` 1·2·5단계 | marketing |
| **shot-lister** | 화면·패치노트로 15~30초 장면 목록과 필요한 캡처 목록 | Read, Glob | inherit | `trailer` | media |

- `handoff`, `spec-first`, `promo-plan`, `launch-post`는 대화 맥락이 필요해서 **스킬로** 둔다.
- 여러 개를 동시에 돌릴 수 있는 조합: verifier + screen-tester + guard (`/fullship:ship`에서 병렬, 결과를 한 표로 합침).

## 7. 넣지 말 것 / 주의
- 기본과 겹치지 않게: `/code-review`, `/security-review`, `/simplify`, `/init`, `loop`, `schedule`은 그대로 쓴다(`/fullship:setup`은 `/init` 결과를 보완하는 쪽).
- 비밀 키를 플러그인·설정에 넣지 않는다. 키 **이름과 키 파일 경로**만.
- 자동 게시·메일·결제·스토어 제출 등 되돌리기 어려운 일은 항상 미리보기 → 사람 확인.
- 훅은 SessionStart 하나만. 늘리려면 이유를 적고.
- 프로젝트 파일을 만들 땐 덮어쓰지 않고 `.fullship-new`로.
- 특정 프로젝트 규칙(워크트리 금지, main 직접 커밋 등)은 플러그인에 하드코딩하지 않고 설정·CLAUDE.md에서.

## 8. 만드는 순서 (v0.1 = 개발·출시 핵심)
1. 뼈대 + `/fullship:setup` + `/fullship:mode` + `/fullship:recommend`(11절 목록) + SessionStart 훅 + `.fullship/config.json` 형식
2. `spec-first`, `ship-checklist`, `deploy-verify`, `notify` + 에이전트 `plan-checker`, `verifier`, `scout` + `fullship-guide` → **이 프로젝트에서 한 주 써 보기** (v0.1)
3. `handoff`, `golden-compare`, `release-guard`, `session-guard`
4. `screen-matrix`, `quota-watch`, `feedback-inbox`
5. `release-insights` + `insights-scout`, `site-report` 이전(원본 삭제)
6. marketing 묶음 — `promo-plan` 먼저, 그다음 launch-post·outreach-log·promo-review
7. media 묶음 (Remotion 플러그인으로 먼저 시험)
8. 공개 준비: 영어 README, 다른 스택 예제 프로젝트 1~2개에서 `/fullship:setup` 시험, 평가 케이스 정리, 마켓플레이스 등록
- 각 단계마다 스킬별 평가 케이스를 같이 만든다(마지막에 몰아서 하지 않음).

## 9. MoAI-ADK에서 참고할 것 (2026-11-08 조사)
출처: https://github.com/modu-ai/moai-adk, https://adk.mo.ai.kr/en/ (TRUST 5·SPEC 문서는 원문 확인, 나머지는 만들 때 원문 재확인)

| MoAI | 우리 플러그인에서 | 넣을 곳 |
|---|---|---|
| SPEC 문서(spec·plan·acceptance·progress) | 한 파일짜리 기능 메모, 큰 기능에만 | `spec-first` |
| GEARS 요구사항 문장 | "~하면 ~한다 / ~하지 않는다" 꼴만 빌림 | `spec-first` |
| 완료 기준 Given/When/Then | 3~5개 → 먼저 실패하는 테스트로 | `spec-first`, `ship-checklist` |
| plan-auditor (PASS/DEBT) | 만들기 전 계획 점검 | `plan-checker` |
| sync-auditor (100점 채점) | **채점 대신 통과/실패 + 근거**(자기 채점은 들쭉날쭉) | `ship-checklist` |
| TRUST 5 | 테스트 / 린트·타입 / 포맷·토큰 / 보안 / 패치노트·커밋 | `config.checks` 기본 항목 |
| No false verification | 실행한 명령 + 결과 끝부분 필수, 안 돌린 건 "안 돌림" | `ship-checklist`, `deploy-verify` |
| 긴 출력은 파일로 | 로그는 evidence 폴더, 대화엔 요약 | `ship-checklist/scripts/run-quiet` |
| /moai goal | 멈출 조건 + 최대 횟수 | `spec-first` |
| /moai gtd | 아이디어 쌓기 → 고르기 | `feedback-inbox` (`/idea`) |
| 업데이트 때 사용자 수정 보존 | 덮어쓰지 않고 `.fullship-new` | 공통 규칙 |

가져오지 않을 것: Factory Mode·병렬 워크트리 강제, TDD 전면 강제·커버리지 85%(판정 로직만 테스트 먼저), 16개 언어·LSP 게이트·다른 LLM 백엔드·전역 설치, 에이전트 10여 개.

## 10. 남은 질문 (만들면서 정하기)
- 플러그인 이름: 임시로 `fullship`(2026-11-08). 나중에 바꿀 수 있음 — 바꾸면 plugin.json·marketplace.json·명령 이름(`/fullship:*`)·설정 폴더(`.fullship/`)를 함께
- 스킬 폴더를 묶음 하위로 둘 수 있는지, 아니면 이름 접두어로 갈지(플러그인 규격 확인)
- 확장 스토어별로 쓸 수 있는 공개 API 범위(insights-scout가 조사)
- 자체 자동 업데이트 서버 로그를 어디서 읽을지(Cloudflare 로그, Supabase 표 등 — 어댑터)

## 11. 이미 있는 플러그인·스킬 추천 (2026-11-08 조사)
원칙: **이미 잘 만든 것은 다시 만들지 않는다.** 우리 플러그인은 "언제 무엇을 쓸지"를 알려 주고, 겹치는 스킬은 설치돼 있으면 그쪽에 넘긴다.

### 추천 방식
- **`/fullship:recommend`** (그리고 `/fullship:setup` 6단계): 프로젝트를 읽고 상황별 추천을 표로 보여 준다 — 이름 · 출처 · 하는 일 · 우리 스킬과의 관계(대신 씀 / 함께 씀) · 설치 명령 · 신뢰도(공식/파트너/커뮤니티, skills.sh 감사 결과).
- 출처 두 곳:
  1. **Claude 플러그인 디렉터리** (공식 Anthropic Directory·Knowledge Work 마켓플레이스) — `/plugin` 설치
  2. **skills.sh** (Vercel이 운영하는 오픈 스킬 디렉터리, 설치 수 순위·주제별·감사 결과 있음) — `npx skills add <owner/repo> [--skill <이름>]`
- 목록은 `references/recommended.md`에 고정본을 두고, 새로 찾을 땐 skills.sh 검색(웹 페이지·`find-skills` 스킬)을 쓴다. skills.sh API(`/api/v1/skills/search`)는 Vercel OIDC 토큰이 필요해 기본으로는 안 씀.
- **자동 설치 안 함**. 사용자가 고른 것만 설치 명령을 안내/실행. 커뮤니티 것은 감사 결과·저장소를 보여 주고 확인받기. skills.sh CLI는 설치 통계를 보내므로 `DISABLE_TELEMETRY=1` 선택지를 같이 안내.
- 설치 후 우리 스킬은 겹치는 일을 하지 않도록: 각 SKILL.md에 "X가 설치돼 있으면 X를 쓰고 여기선 Y만" 한 줄.

### 플러그인 안에 "경로"를 넣는 방식 (2026-11-08 결정)
- **복사해 넣지 않는다**(라이선스·원본 갱신 문제). 경로만 든다.
- **모음 마켓플레이스**: `marketplace.json`에 fullship 자신 + 외부 플러그인 항목(원본 GitHub 저장소를 가리킴)을 넣는다. 사용자는 fullship 마켓플레이스 하나만 추가하면 추천 플러그인도 같은 곳에서 고를 수 있다. 원본 저장소·경로는 넣기 전에 확인.
- **skills.sh 스킬**은 마켓플레이스에 못 넣으므로 `references/recommended.md`에 `owner/repo --skill 이름` + 감사 결과로 둔다.
- **`fullship-guide` 스킬**(대화 중 추천): 설명문을 "이런 요청이면 불린다"로 써서 — 예: "계획 빡세게 따져 봐" → grill-me, "트레일러에 효과" → hyperframes/Remotion — 짧은 색인만 읽고 "이건 X가 잘해요, 설치할까요?" 한 줄. 이미 설치돼 있으면 그걸 쓰라고만, 거절한 건 다시 안 꺼냄. 물어볼 때만 길게, 평소엔 한 줄 제안(계획 모드와 무관).
- **설치는 확인 한 번까지**: 설정 `install: "ask"`(기본, 하나씩) / `"trusted-batch"`(공식·파트너·감사 Pass인 것만 묶어서 한 번 확인). 확인 없는 완전 자동 설치는 넣지 않는다(남의 코드 실행, 디렉터리 심사 문제).
- skills.sh 상세 페이지엔 **라이선스가 안 나온다**(감사 3종 Gen·Socket·Snyk만). 라이선스는 저장소에서 확인해 목록에 적는다.

### 상황별 추천 후보 (설치 수는 skills.sh 누적, 반올림 — 만들 때 다시 확인)
| 상황 | 추천 | 출처 | 우리 스킬과 관계 |
|---|---|---|---|
| 화면 디자인 품질 | `frontend-design` (anthropics/skills, 약 110만) | 디렉터리(공식)·skills.sh | 함께 씀. screen-matrix가 결과 확인 |
| UI 규칙·접근성 점검 | `web-design-guidelines` (vercel-labs/agent-skills, 약 84만) | skills.sh | release-guard 접근성 항목 대신 |
| 디자인 감각·다듬기 | `impeccable`(pbakaus), `taste-skill`(leonxlnx), `emil-design-eng`(emilkowalski) | skills.sh | 선택 |
| 디자인 시스템·접근성 감사 | **Design**(Anthropic: 비평·디자인 시스템·UX 문구·접근성), **Fairmind Design**(토큰·WCAG), **audit-suite**(디자인·UX·성능·접근성 10관점) | 디렉터리 | design-tokens 검사·reviewer와 겹치면 그쪽 |
| Figma 연동 | **Figma**(공식) | 디렉터리 | 쓰는 사람만 |
| 색 팔레트·대비 | **UI Color Palette** | 디렉터리 | 선택 |
| React/Next | `vercel-react-best-practices`(약 88만), `next-best-practices` | skills.sh | 스택 감지 시 |
| 기능 개발 흐름 | **feature-dev**(공식: 탐색·설계·리뷰 에이전트) | 디렉터리 | spec-first와 겹침 → 설치돼 있으면 spec 문서·완료 기준만 우리가 |
| 테스트·검증 | `test-driven-development`, `verification-before-completion`(obra/superpowers), `webapp-testing`(anthropics), `playwright-best-practices` | skills.sh | ship-checklist 원칙과 같음 → 참고·함께 |
| 브라우저 자동화 | **playwright**(Microsoft MCP) | 디렉터리 | screen-matrix·deploy-verify가 사용 |
| 코드 리뷰 | **code-review**(공식) | 디렉터리 | reviewer는 프로젝트 규칙만 |
| 브라우저 확장 | **Chrome Extension Builder**(MV3 설계·감사·출시) | 디렉터리 | 확장이 있으면 추천, release-insights가 스토어 지표 |
| Supabase | `supabase`, `supabase-postgres-best-practices` (supabase/agent-skills) | skills.sh·디렉터리 | adapters/supabase가 참조 |
| Vercel 배포 | `deploy-to-vercel` | skills.sh | adapters/vercel |
| Cloudflare | (2026-11 조사 땐 skills.sh에서 못 찾음) | — | 우리 adapters/cloudflare가 직접 |
| SEO | `seo-audit`, `ai-seo`, `schema-markup`, `programmatic-seo` (coreyhaines31/marketingskills), **SEO-AEO-GEO Ultimate** | skills.sh·디렉터리 | seo-content는 이것들이 있으면 연결만 |
| 홍보 계획·바이럴 | `launch-strategy`·`marketing-psychology`·`social-content`·`content-strategy`(coreyhaines31/marketingskills), **Social Media Skills**의 `viral-reverse-engineering`·`hook-writer`·`campaign-and-launch-planning`·`reddit-marketing`·`content-calendar`, **Marketing**(Anthropic) `campaign-plan` | skills.sh·디렉터리 | promo-plan이 있으면 함께: 일반 전략·훅 기법은 이것들, fullship은 **우리 제품의 공유 순간·바이럴 장치 점검·출시 숫자로 결과 확인**만 |
| 홍보 글·카피 | **Marketing**(Anthropic), `copywriting`(coreyhaines31) | 디렉터리·skills.sh | launch-post는 패치노트→초안·outreach-log만 |
| 영상 | **Remotion**(`remotion-dev/skills`, 약 77만), **video-shotcraft**, HeyGen `hyperframes` | 디렉터리·skills.sh | trailer는 장면 목록·화면 소재 준비, 렌더는 이것들 |
| 계획 따져 묻기 | `grill-me`(약 150만, 감사 3종 Pass), `grill-with-docs`, `to-spec`, `to-prd` (mattpocock/skills) | skills.sh | spec-first 전에 "계획 검증" 단계로 추천. 있으면 plan-checker는 빠진 항목만 |
| 인수인계 | `handoff`(약 110만), `claude-handoff` (mattpocock/skills) | skills.sh | 우리 `handoff`와 겹침 → 만들기 전에 써 보고 모자란 것만(HANDOFF.md 형식·결정 이유) |
| 개발 습관 묶음 | `writing-plans`, `systematic-debugging`, `subagent-driven-development`, `dispatching-parallel-agents`, `requesting-code-review` (obra/superpowers) | skills.sh | 함께 씀 |
| 계획→구현→리뷰 에이전트 | **spec-driven-dev**(계획 리뷰·TDD 구현·표준 검사 에이전트 9개) | 디렉터리 | spec-first·plan-checker와 겹침 → 하나만 쓰게 안내 |
| 출시 절차 | **claude-release**(버전·테스트·릴리스 노트·승인·GitHub 릴리스), **Cyberine ReleaseGuard**(배포물에 소스·키 유출 검사) | 디렉터리 | release-guard·deploy-verify와 함께 |
| 효과·모션(VFX) | HeyGen `hyperframes-animation`(약 100만)·`motion-graphics`(약 51만), `review-animations`·`animation-vocabulary`(emilkowalski), **Tweenkit**(키네틱 영상·애니메이션 페이지), **animation-studio**(코드로 그린 애니메이션+음악) | skills.sh·디렉터리 | media 묶음: trailer가 이것들로 렌더 |
| 3D·셰이더 | **parallax-threejs**(Three.js/GLSL 디버깅·시각 회귀 테스트, shader-reviewer 에이전트), **PlayCanvas**(효과·셰이더) | 디렉터리 | 3D 쓰는 프로젝트만. screen-matrix 대신 시각 회귀 |
| 게임 | **Unity**(공식 파트너) | 디렉터리 | 게임 프로젝트 감지 시 |
| 스킬 찾기 | `find-skills` (vercel-labs/skills, 1위 약 430만) | skills.sh | `/fullship:recommend`가 활용 |
| 스킬 만들기 | `skill-creator` (anthropics/skills) | skills.sh·기본 | 우리 플러그인 개발용 |

- 광고 집행·자동 게시형(Hyper Marketing, AdWhispr, Social media studio 등)은 **추천 목록에서 "되돌리기 어려운 일" 표시**를 붙이고 기본 추천하지 않음.
- skills.sh에서 셰이더·WebGL·GSAP 전용 스킬은 2026-11 조사 땐 못 찾음(사이트 검색이 화면에서만 동작) — scout가 다시 찾을 것.

## 13. 라이선스
- **추천: MIT.** 가장 짧고 널리 쓰여서 다른 사람이 가져다 쓰기 쉽다. Claude 플러그인·스킬 생태계에서도 흔하다. 저작권 표시만 남기면 누구나 쓰고 고칠 수 있다.
- 대안: **Apache-2.0** — MIT처럼 자유롭지만 특허 사용 허락 조항이 있고, 바꾼 파일 표시·NOTICE 파일이 필요. 회사 사용자를 신경 쓰면 이쪽.
- 피할 것: GPL 계열(가져다 쓰는 사람이 자기 코드도 공개해야 할 수 있어 플러그인엔 부담), 라이선스 없음(지금 `UNLICENSED` = 남이 쓸 권리 없음).
- 지킬 것:
  - 외부 스킬·플러그인은 **경로만** 가리키므로 그쪽 라이선스와 섞이지 않는다. 코드를 복사해 올 땐 그 라이선스를 확인하고 `THIRD_PARTY.md`에 표기.
  - Stylish 저장소 코드는 "All rights reserved"라 **복사하지 않는다**. 패턴만 참고해 새로 쓴다.
- 할 일: `LICENSE` 파일 추가, `plugin.json`의 `license`를 `MIT`로, `author` 채우기(이름은 사용자에게 받기).

## 12. 참고 (이 저장소)
- 작업 규칙 예: `CLAUDE.md` (계획 먼저, 디자인 토큰, 검증 원칙, 마무리 점검표) → `/fullship:setup` 출력의 본보기
- 기존 스킬: `discord-bot`, `site-report` (개인 스킬 폴더)
- 패턴 예: `src/share/typeMeta.ts`+`functions/types/` (og 미리보기), `supabase/functions/verify-listing/` (본인 확인), `scripts/calib/story-dump.mts` (전후 비교), `scripts/updates.mjs` (패치노트), `HANDOFF.md`·`PLAN.md` (인수인계·결정 이력)
- 플러그인 후보 조사: feature-dev(공식), Marketing(공식), Remotion, Motion Reel, Social Media Skills

## 14. 쉽게 쓰기 (2026-11-08 원칙)
목표: **설치부터 첫 점검 결과까지 5분, 외운 명령 2개.** 기능이 늘어도 사용자가 알아야 할 것은 늘지 않게.

### 지금 계획에서 어려워질 수 있던 것 → 바꾼 것
| 어려운 점 | 바꾼 것 |
|---|---|
| 명령 7개(setup·mode·recommend·spec·ship·handoff·idea) | 자주 쓰는 건 **setup·ship 두 개** + `help`. 나머지는 말로 부르면 스킬이 알아서 불림, 명령은 지름길로만 |
| 모드 3개 + 묶음 4개 + 설정 JSON | 묶음은 **감지해서 자동으로 켬**(확장 있으면 release, 영상 요청하면 media 켤지 물어봄). 계획 모드는 기본 `big-only`(큰 작업만 계획), 바꾸고 싶으면 말로("항상 계획부터 해 줘") |
| 에이전트 10개 | **사용자 눈에 안 보임**. 이름도 몰라도 됨. 결과 표에 "누가 했는지"는 안 씀 |
| setup 질문 | **최대 2개**(감지 못 한 배포 주소, 계획 모드). 나머지는 감지한 값으로 채워 "이렇게 할게요" 한 화면 → [좋아요 / 고칠래요] |
| 긴 결과 | **첫 줄에 결론**: `통과 6 · 실패 1 · 안 돌림 1`. 실패한 것만 아래에 한 줄씩 + "다음에 할 일". 로그 전체는 파일로 |
| 영어 용어 | 사용자 말은 프로젝트 언어·쉬운 말로. "evidence"→"근거", "DEBT"→"보완 필요" |
| 추천이 귀찮을 수 있음 | 한 번에 최대 3개, 거절하면 다시 안 꺼냄 |

### 규칙 (모든 스킬·명령에 적용)
1. **말로 해도 된다**: 모든 기능은 자연어로 부를 수 있어야 한다. 명령은 지름길.
2. **기본값이 안전하고 쓸 만하다**: 아무것도 안 정해도 동작. 기본은 "큰 작업만 계획 먼저"(`big-only`), 점검·배포 확인·설치·게시는 시킬 때만.
3. **물을 땐 버튼으로, 한 번에**: 질문은 묶어서 한 번, 추천 답을 첫 번째에.
4. **결론 먼저, 다음 할 일 하나**: 결과마다 "그래서 다음은?" 한 줄.
5. **숨길 건 숨긴다**: 설정 파일·에이전트·묶음 이름을 몰라도 쓸 수 있다. 바꾸고 싶으면 말로.
6. **막히면 `/fullship:help`**: 지금 프로젝트 상태(설정됨? 마지막 점검 결과?)와 **지금 할 만한 것 하나**를 보여 줌.

### 확인 방법
- 공개 전에 처음 쓰는 사람 1~2명에게 README 없이 설치·setup·ship까지 해 보게 하고, 막힌 곳을 고친다.
- 평가 케이스에 "자연어로 불렀을 때 맞는 스킬이 불리는지"를 넣는다(예: "다 됐어 확인해 줘" → ship-checklist).
