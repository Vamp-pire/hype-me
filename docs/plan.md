# hype-me v3 — 게임·프로젝트 홍보와 유입 조사 플러그인 (계획, 2026-11-09)

> v2(개발·검증 중심)는 원래 의도에서 벗어나 `docs/archive/plan-v2-dev-focus.md`로 옮겼다. v0.1.0 코드(점검·배포 확인·계획 모드)는 git 기록(`dce6360`)에 남는다.
> **원래 의도**: 특정 프로젝트, 특히 **게임**을 알리고 **사람이 어디서 오는지·어디로 가야 하는지**를 조사하는 특화 도구.

## 0. 확정된 결정 (2026-11-09)
| 주제 | 결정 |
|---|---|
| 중심 | **홍보·유입 조사**. 출시 확인은 홍보에 필요한 만큼만(가게 페이지·링크·미리보기 이미지가 제대로 뜨는지) |
| 대상 | 브라우저 웹 게임, Steam·itch.io 등 PC 게임, 모바일 게임, 그 밖의 웹 서비스(예: Stylish) |
| 더하는 것 | **디자인 도움**(가게·썸네일·공유 이미지 규격, 리소스 사이트 — 목록은 사용자가 나중에 줌), **다른 서비스·게임의 성공 사례 수집** |
| 빼는 것 | 개발 기능(점검표 `ship`, 계획 `spec`, 계획 모드 `mode`, 배포 확인 `deploy`, verifier·plan-checker 에이전트, run-checks). 기록만 남김 |
| 그대로 | 공개 배포 전제·MIT·쉽게 쓰기(외울 명령 최소)·이미 있는 도구는 추천·되돌리기 어려운 일은 사람 확인 |
| 이름 | **hype-me** (2026-11-09 확정, GitHub·skills.sh·플러그인 디렉터리에 같은 이름 없음). 옛 이름 fullship |
| 디자인 리소스 | 기본 세트: Stitch, Tailwind CSS, Bootstrap, shadcn/ui, Framer Motion, Mobbin, design.md(사이트 확인 필요), Google 아이콘(Google Fonts 안) → `references/design-resources.md` |
| 첫 시험 | 후보(미확정): **Rlo 체스 타이쿤**, 또는 **여러 변형 체스를 돌아다니는(투어) 게임** — 사용자가 속한 소규모 디스코드와 다른 커뮤니티까지 다양하게 |
| 보고 | 기본은 **부를 때만**. 사용자가 정하면 매주 자동(예약)도 가능 |
| 상황 맞춤 | 기본 목록(채널·데이터 출처·리소스)에 **에이전트가 사용자 상황을 보고 더하거나 뺄 수 있음, 꼭 필요할 때만**(11절) |

## 1. 이 플러그인이 답하는 질문 6개
1. **우리 유저는 어디서 오나?** — 유입 출처·검색어·홍보별 성과
2. **어디서 홍보하면 좋을까?** — 우리 게임을 좋아할 사람이 모인 커뮤니티·유튜버·스트리머·큐레이터·행사
3. **비슷한 게임은 어떻게 떴나?** — 성공 사례의 타임라인과 계기, 우리에게 적용할 것
4. **누가 우리 얘기를 하나?** — 언급·리뷰·반응 추적과 요약
5. **이번 홍보는 어떻게 할까?** — 홍보 계획(대상·공유 순간·바이럴 장치·훅·채널·타이밍·측정)
6. **보여 줄 그림은 괜찮나?** — 가게 이미지·썸네일·공유 카드 규격과 디자인 피드백, 리소스

## 2. 외울 명령
- `/hype-me:setup` — 처음 한 번. **게임 프로필** 만들기
- `/hype-me:report` — 주간 보고서(유입·언급·지난 홍보 결과·이번 주 할 일 3개). 원하면 디스코드 DM
- 나머지는 말로: "유저 어디서 와?", "어디 홍보할까?", "비슷한 게임 사례 찾아 줘", "우리 언급 찾아 줘", "홍보 계획 짜 줘", "썸네일 봐 줘"
- 막히면 `/hype-me:help`

## 3. 게임 프로필 (`/hype-me:setup` → `.hype-me/profile.json`)
감지 + 최대 3개 질문으로 채운다.
- 이름·한 줄 소개·장르·태그, 플랫폼(웹/Steam/itch/iOS/Android), 가게·랜딩 주소, 언어
- **누구를 위한 게임인가**: 비슷한 게임 3~5개(사용자에게 받거나 제안), 핵심 플레이어 무리 2~3개
- 공유하고 싶은 순간(결과 화면·리플레이·클립·순위 등)
- 연결 가능한 데이터(아래 4절)와 키 **이름**만 — 값은 환경 변수
- 출력은 프로젝트 언어로, 설정 파일 이름은 사용자에게 안 보여도 됨

## 4. 기능 (스킬)

### A. 유입 조사 — `traffic` ("유저 어디서 와?")
- 연결할 수 있는 것부터 쓰고, 없으면 **CSV 내보내기를 받아서** 읽는다:
  - 웹: Cloudflare Web Analytics, Google Analytics 4, Plausible, Search Console(검색어)
  - Steam: Steamworks 트래픽 분석·UTM 분석(공개 API 없음 → CSV), 위시리스트 보고서(CSV)
  - itch.io: 분석 페이지(CSV/수동)
  - 모바일: App Store Connect·Google Play Console(API 키 또는 CSV)
- 결과: 채널별 표(방문·전환·추세), 홍보별 성과(UTM), 새로 생긴 유입처, 줄어든 유입처
- **UTM 링크 만들기**: 채널마다 추적 링크를 만들어 `.hype-me/links.json`에 기록 → 나중에 성과와 연결
- 에이전트 `traffic-analyst`(가벼운 모델)가 숫자 모으기

### B. 어디서 홍보할까 — `channels` ("어디 홍보할까?")
- 비슷한 게임·장르에서 출발해 찾는다:
  - 커뮤니티: 레딧 서브레딧(크기, **자기 홍보 규칙**), 디스코드 서버, 국내 커뮤니티·카페, 포럼
  - 영상: 비슷한 게임을 다룬 유튜버·스트리머(구독자·최근 활동·연락 경로 공개된 것만)
  - Steam 큐레이터, 언론·뉴스레터, 행사(Steam Next Fest, itch 잼, 지역 게임 행사)
- 결과: 우선순위 표(맞는 이유·규칙·추천 접근법·예상 노력). **대량 DM·스팸 금지**, 연락은 사람이 직접
- 에이전트 `channel-scout`

### C. 성공 사례 — `cases` ("비슷한 게임은 어떻게 떴어?")
- 비슷한 게임·서비스 하나씩: 출시·업데이트·첫 바이럴 글·스트리머 방송·할인·행사 같은 **사건 타임라인** + 무엇이 계기였나 + 우리에게 적용할 것 3가지
- 출처: 공개 리뷰 수 추이(Steam 공개 리뷰 API), 레딧·유튜브의 퍼진 글/영상, 개발자 회고(블로그·GDC·포스트모템), 검색 관심도
- 다른 분야 서비스의 성공 사례도 같은 틀로(예: 성격 유형 테스트가 퍼진 방식)
- `.hype-me/cases/<이름>.md`로 쌓아 다시 씀. 출처 링크 필수, 추측은 추측이라고 표시
- 에이전트 `case-researcher`

### D. 언급·반응 추적 — `mentions` ("우리 얘기 찾아 줘")
- 게임 이름·주소로 찾기: 레딧, 유튜브(댓글 포함, 키 있으면 YouTube Data API), Steam 리뷰(공개 API), itch 댓글, 디스코드(우리 봇 채널), 검색
- 지난번 이후 **새 언급만**, 좋다/아쉽다/버그/요청으로 묶어 요약, 답할 만한 글 표시(답은 사람이 직접)
- 반복되는 요청·불만은 `docs/backlog.md`로
- 에이전트 `mention-tracker`

### E. 홍보 계획 — `promo-plan`, 돌아보기 `promo-review`
(v2 설계 유지, 게임에 맞게 보강)
1. 재료: 공유하고 싶은 순간 찾기
2. 대상 무리와 그들이 모이는 곳(B 결과 사용)
3. **바이럴 장치 점검**: 공유할 이유·공유 쉬움·되돌아오는 고리 → 빠진 건 게임 개선 제안
4. 훅: 채널별 첫 줄·썸네일 문구 5개
5. 채널·타이밍 표 (+ 게임 전용: 위시리스트 쌓기, 데모, Next Fest, 데브로그 주기, 키 배포, 패치 맞춰 다시 알리기, 모바일은 스토어 문구·스크린샷)
6. 측정: UTM 링크(A), 볼 숫자, 며칠 뒤 `promo-review`
7. 하지 않을 것: 가짜 계정·조작 후기·도배·규칙 위반·과장, 자동 게시
- 결과 `docs/promo/<날짜>-<이름>.md`, 글 초안은 `launch-post`(채널 표대로)

### F. 디자인 도움 — `design`
- **규격 확인**: Steam 캡슐·스크린샷·트레일러, itch 커버, 앱스토어·플레이 아이콘·스크린샷, 공유(OG) 이미지, 유튜브 썸네일 — 크기·비율·글자 안전 영역
- **피드백**: 썸네일·캡슐·랜딩 첫 화면을 보고 "작게 봐도 읽히나, 장르가 보이나, 비슷한 게임들 사이에서 눈에 띄나"
- **리소스 사이트**: `references/design-resources.md`의 기본 세트(Stitch, Tailwind CSS, Bootstrap, shadcn/ui, Framer Motion, Mobbin, design.md, Google 아이콘·폰트)를 "언제 쓰나"에 맞춰 추천, **라이선스(상업 사용·표기 필요)** 함께 표시. 프로젝트가 이미 쓰는 것(package.json·CSS)을 우선
- 기본 세트로 안 되는 경우만 에이전트가 더함(게임 아트·효과음, 스토어 이미지 틀, 목업 등) — 이유 한 줄과 함께
- 기존 도구 추천: frontend-design, Design(Anthropic), UI Color Palette, Remotion·hyperframes(트레일러) 등

### G. 출시 확인(홍보에 필요한 만큼) — `launch-check`
- 가게·랜딩 페이지가 열리나, UTM 링크가 제대로 가나, **공유 미리보기(OG) 이미지·제목**이 뜨나, 분석 코드가 심어져 있나
- (v0.1 deploy-check 스크립트를 이 용도로 고쳐 씀)

### H. 보고 — `report`, `notify`
- 주간 보고: 유입 변화 · 새 언급 · 지난 홍보 결과 · 이번 주 할 일 3개
- 디스코드·슬랙 웹훅으로 보내기(기존 notify 유지, 주소는 환경 변수 이름으로만)

## 5. 서브에이전트
| 이름 | 하는 일 | 도구 | 모델 |
|---|---|---|---|
| traffic-analyst | 분석 API·CSV에서 숫자 모아 표 | Bash, Read, Write(.hype-me/reports) | haiku |
| channel-scout | 홍보할 곳 찾기(규칙·크기·연락 경로) | WebFetch, Read | haiku |
| case-researcher | 성공 사례 타임라인·계기 정리(출처 필수) | WebFetch, Read, Write(.hype-me/cases) | inherit |
| mention-tracker | 새 언급 모으고 분류 | WebFetch, Bash, Read | haiku |
| scout | 이미 있는 도구 추천 조사 (유지) | WebFetch, Read | haiku |
- 공통: 읽기 위주, 게시·DM·설치 안 함, 출처 링크 필수, 모르면 "모름"

## 6. 데이터 출처와 한계 (정직하게)
- Steamworks·itch 분석은 공개 API가 없거나 제한 → **CSV를 받아 읽는 방식**이 기본
- 레딧·X·유튜브는 API 정책·요금이 바뀐다: 키가 있으면 쓰고, 없으면 공개 페이지·검색 범위에서만. **사이트 이용 약관을 어기는 긁어오기는 하지 않는다**(예: SteamDB는 자동 수집을 막음 → 링크만 안내)
- 검색 관심도(Google Trends)는 공식 API가 없어 링크·수동 확인
- 개인 정보: 언급 작성자의 공개 이름 정도만, 연락처 수집 안 함

## 7. 이미 있는 도구 추천 (유지·보강)
- 홍보 일반: coreyhaines31/marketingskills(launch-strategy, marketing-psychology), Social Media Skills(viral-reverse-engineering, hook-writer, reddit-marketing), Anthropic Marketing
- 모바일 스토어 문구: ASO Specialist
- 트레일러·모션: Remotion, hyperframes, video-shotcraft, Tweenkit
- 디자인: frontend-design, Design(Anthropic), UI Color Palette
- 분석 연결: Windsor.ai(GA4·Search Console 등 여러 출처, 유료 서비스 주의)
- 광고 집행·자동 게시형은 기본 추천 안 함

## 8. 지금 코드에서 바뀌는 것
| 지금 (v0.1.0) | v3 |
|---|---|
| commands: setup, help, mode, recommend | setup(게임 프로필로 다시 씀), help, recommend, **report**(새로). mode 삭제 |
| skills: spec, ship, deploy, notify, guide | **traffic, channels, cases, mentions, promo-plan, design, launch-check**(새로), notify·guide 유지. spec·ship·deploy 삭제 |
| agents: verifier, plan-checker, scout | traffic-analyst, channel-scout, case-researcher, mention-tracker 새로, scout 유지. verifier·plan-checker 삭제 |
| scripts: run-checks, deploy-check, notify | run-checks 삭제, deploy-check → launch-check로 고쳐 씀, utm 링크 만들기·CSV 읽기 추가 |
| hooks: 계획 모드 한 줄 | "hype-me · <게임 이름> · /hype-me:help" 한 줄 |
| templates/config.json | profile.json(게임 프로필) |

## 9. 만드는 순서
1. ✅ (2026-11-09, v0.2.0) 정리: 개발 기능 삭제, setup → 게임 프로필, help·hook·README 고치기
2. **cases + channels** (조사 두 가지, 데이터 연결 없이 바로 쓸 수 있음) → Stylish·변형 체스 게임 하나로 시험
3. promo-plan + launch-check + UTM 링크
4. mentions + report + notify 연결
5. traffic (CSV 읽기부터, 그다음 API)
6. design (리소스 목록 받은 뒤)
7. 공개 준비: 이름 정하기, 다른 장르 게임 1~2개로 시험, 평가 케이스

## 10. 이름 후보 (재치 있게)
grill-me처럼 '부탁하는 말'이 이름이 되면 기억하기 쉽고, 명령도 `/이름:report`처럼 읽힌다. 정하기 전에 skills.sh·플러그인 디렉터리·GitHub에서 같은 이름이 있는지 확인.
| 이름 | 느낌 |
|---|---|
| **hype-me** | grill-me의 짝. "나 좀 띄워 줘". 짧고 뜻이 바로 옴 |
| **find-my-players** | 이 플러그인이 답하는 질문 그대로. 길지만 오해가 없음 |
| **where-they-at** | "우리 유저들 어디 있어?" 장난스러운 말투 |
| **lure-me** | 플레이어를 끌어오는 미끼. 낚시 느낌이 살짝 |
| **go-viral-maybe** | 바이럴은 보장 못 한다는 정직한 농담 |
| **crowd-magnet** | 사람을 끌어당기는 자석 |
| **side-quest** | 개발이 본편, 홍보는 사이드 퀘스트. 게임 개발자에게 통하는 말 |

## 11. 상황 맞춤 원칙 (에이전트가 더하고 빼기)
- 기본 목록이 출발점: 채널(4B), 데이터 출처(4A·4D), 디자인 리소스(4F), 추천 도구(7).
- 에이전트는 게임 프로필(언어·나라·장르·플랫폼·규모)을 보고 **꼭 필요할 때만** 더하거나 뺀다. 그때마다 **이유 한 줄**을 보여 준다.
- 예:
  - 한국 대상 → 네이버 블로그·카페 노출, 디시인사이드 갤러리, 아카라이브 같은 국내 채널
  - 일본 대상 → X(트위터) 비중을 높임
  - 모바일 게임 → 스토어 검색어(ASO)·스토어 리뷰 추가, Steam 큐레이터는 뺌
  - 웹 게임·소규모 커뮤니티 → 큰 언론·유료 광고는 빼고 디스코드·커뮤니티 이벤트 위주
  - 체스·변형 체스 → lichess 포럼·팀, chess.com 클럽, 변형 체스 디스코드
- 하지 않을 것: 필요 없는데 목록 늘리기, 묻지 않고 유료 서비스·키가 필요한 출처를 기본으로 넣기.
- 사용자가 "이건 빼" / "이것도 봐 줘" 하면 프로필에 저장해 다음에도 반영.

## 12. 남은 질문
- 첫 시험: Rlo 체스 타이쿤 vs 변형 체스 투어 게임 — 어느 쪽, 저장소·주소
- 로컬 폴더 `D:/fullship` → `D:/hype-me` 이름 바꾸기(세션을 옮긴 뒤)
