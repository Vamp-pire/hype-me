# hype-me

**"Hype me" — help people find your game.**
A Claude Code plugin for indie games and small projects (web, Steam/itch.io, mobile): it finds where your players come from, where to promote, how similar games took off, who is talking about you, and turns that into a promo plan you can actually run.

> Status: **0.14 — early version.** Everything below works and is tested on sample pages; real-game use is just starting. Feedback welcome in [Issues](https://github.com/Vamp-pire/hype-me/issues).

## The six questions it answers
| ask it | what you get |
|---|---|
| "Where do my players come from?" | traffic by source and by promo link (web analytics, Search Console, Steam/itch/store CSV exports), what grew and what dropped |
| "Where should I promote?" | communities, YouTubers/streamers, curators and events that fit your game — with each place's self-promotion rules |
| "How did similar games take off?" | a timeline of what made comparable games (or other services) spread, and three things to try |
| "Who's talking about my game?" | new mentions and reviews since last time, grouped into love / gripes / bugs / requests |
| "Make a promo plan" | audience, the moment players want to share, viral-loop check, hooks per channel, timing, how to measure |
| "Check my thumbnail / store image" | size and format checks per platform, honest design feedback, resources with licence notes |

It adapts to your game: a Korean-market game also gets Naver blogs and Korean communities; a mobile game gets store search terms; a chess variant gets chess communities — only when it actually applies.

It never posts, DMs, installs or spends money without your yes, and it follows each community's rules. No fake accounts, no spam.

## Commands
1. `/hype-me:setup` — once per game. A short game profile (at most 3 questions).
2. `/hype-me:report` — a summary any time: traffic changes, new mentions, last promo results, three things to do this week. Add `--send` to post it to Discord/Slack through a connector you added to Claude, `--schedule weekly` to run it every week.

Everything else: just ask in plain words. Stuck? `/hype-me:help`. Tell us what worked and what did not: `/hype-me:feedback` (turns into a GitHub issue after a preview; personal data is hidden). Looking for an existing tool for something? `/hype-me:recommend`.

## What is inside
| ask | skill |
|---|---|
| where do players come from? | `traffic` (an analytics connector you added to Claude, or CSV exports from Cloudflare, Search Console, GA4, Steam, itch.io and app stores) |
| where should I promote? | `channels` |
| how did similar games take off? | `cases` |
| who is talking about my game? | `mentions` |
| make a promo plan / how did it go? | `promo-plan`, then `experiment` review |
| is my page ready to share? | `launch-check` (page, share preview, tracking, links) |
| check my thumbnail / store images | `design` |
| find bugs players would hit | `bugs` (monkey test in several browsers at once, code reading, real player errors, rule checks) |
| where do new players get stuck? | `ux` (play bots per persona built once and rerun for free, Clarity, complaints, similar games, a people playtest kit) |
| do players come back? what is the aha moment? | `retention` (event plan, cohorts, activation, funnels) |
| run hypothesis → test → learn | `experiment`, and `prototype` for the cheapest test first |
| find an existing tool for X | `recommend` (also suggests one on its own when you need it) |

Limits, honestly: hype-me never reads API keys or tokens from your computer, so live numbers need a connector you add to Claude; otherwise it reads CSV exports; Reddit blocks automated reading, so those places come with links to check by hand; virality is never promised.

## Cost
Research uses web lookups, so it is the expensive part. hype-me keeps it down by default: analytics and checks are plain scripts (no AI), research agents run on smaller models, and every limit is a range per effort level (light / normal / deep — say "quickly" or "in depth", or set it in the profile): agents start at the low end and go further only while results stay useful, never past the top. Recent results are reused instead of researched again.

## Development
- Script tests: `node --test tests/scripts.test.mjs` (browser tests run when Chrome/Edge and Node 22+ are present).
- Trigger and safety evals: `claude plugin eval . --runs 1`.
- Rule: every new skill or script ships with an eval case and a script test.

## Install
```
/plugin marketplace add Vamp-pire/hype-me
/plugin install hype-me@hype-me
```
Needs Node.js 22+ for the browser tools (bug monkey, UX bots) and Chrome or Edge. For local development: `claude --plugin-dir <path to this folder>`.

## Layout
```
.claude-plugin/   plugin manifest, marketplace listing and icon
commands/         setup, report, help, feedback
skills/           bugs, ux, retention, experiment, prototype, traffic, channels, cases, mentions, promo-plan, launch-check, design, recommend, notify
agents/           bug-monkey, code-hunter, error-collector, rule-checker, ux-playtester, prototyper, channel-scout, case-researcher, mention-tracker, tool-scout
scripts/          plain Node scripts that Claude runs when a skill needs them (Node 18+, no dependencies; monkey and snap need Node 22+):
                  monkey, snap — open your game in the installed Chrome/Edge (headless, throwaway profile, no downloads), click around and save screenshots and errors
                  retention, traffic-csv — read CSV exports you saved in .hype-me/data/
                  steam-app, reddit-sub — read public Steam store and Reddit pages
                  utm, launch-check, image-size — build tracking links, check your page and share preview, check image sizes
                  mentions-seen — remember which mentions were already shown
                  feedback — build a prefilled GitHub issue link (you submit it yourself)
                  None of them read API keys, tokens or .env files, and none post anything.
templates/        profile, case, promo-plan, experiment
references/       budget, channels, image-specs, design-resources, recommended
evals/            trigger and safety cases (claude plugin eval)
docs/             plan.md (Korean)
```

License: MIT
