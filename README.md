# hype-me

**"Hype me" — help people find your game.**
A Claude Code plugin for indie games and small projects (web, Steam/itch.io, mobile): it finds where your players come from, where to promote, how similar games took off, who is talking about you, and turns that into a promo plan you can actually run.

> Status: **0.9 — feature complete, testing.** Everything below works as an early version; public release after real-game testing. Private for now.

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
2. `/hype-me:report` — a summary any time: traffic changes, new mentions, last promo results, three things to do this week. Add `--send` for Discord/Slack, `--schedule weekly` to run it every week.

Everything else: just ask in plain words. Stuck? `/hype-me:help`. Looking for an existing tool for something? `/hype-me:recommend`.

## What is inside
| ask | skill |
|---|---|
| where do players come from? | `traffic` (Cloudflare Web Analytics, Search Console and GA4 directly; CSV for Steam, itch.io and app stores) |
| where should I promote? | `channels` |
| how did similar games take off? | `cases` |
| who is talking about my game? | `mentions` |
| make a promo plan / how did it go? | `promo-plan`, `promo-review` |
| is my page ready to share? | `launch-check` (page, share preview, tracking, links) |
| check my thumbnail / store images | `design` |
| find bugs players would hit | `bugs` (monkey test in several browsers at once, code reading, real player errors, rule checks) |
| where do new players get stuck? | `ux` (first-time playtests by persona, Clarity, complaints, similar games) |
| do players come back? what is the aha moment? | `retention` (event plan, cohorts, activation, funnels) |
| run hypothesis → test → learn | `experiment`, and `prototype` for the cheapest test first |
| find an existing tool for X | `/hype-me:recommend`, `guide` |

Limits, honestly: Steam, itch.io and app-store analytics have no public API, so traffic reads their CSV exports; Reddit blocks automated reading, so those places come with links to check by hand; virality is never promised.

## Cost
Research uses web lookups, so it is the expensive part. hype-me keeps it down by default: analytics and checks are plain scripts (no AI), research agents run on smaller models, and every limit is a range per effort level (light / normal / deep — say "quickly" or "in depth", or set it in the profile): agents start at the low end and go further only while results stay useful, never past the top. Recent results are reused instead of researched again.

## Install
```
/plugin marketplace add Vamp-pire/hype-me
/plugin install hype-me@hype-me
```
The repository is private for now, so you need access to it. For local development: `claude --plugin-dir <path to this folder>`.

## Layout
```
.claude-plugin/   plugin.json, marketplace.json, icon.png
commands/         setup, report, help, recommend
skills/           bugs, ux, retention, experiment, prototype, traffic, channels, cases, mentions, promo-plan, promo-review, launch-check, design, guide, notify
agents/           bug-monkey, code-hunter, error-collector, rule-checker, ux-playtester, prototyper, traffic-analyst, channel-scout, case-researcher, mention-tracker, tool-scout
scripts/          monkey, snap (drive the installed Chrome/Edge — no downloads), retention, analytics, traffic-csv, steam-app, reddit-sub, utm, launch-check, mentions-seen, image-size, notify (Node 18+, no dependencies; monkey and snap need Node 22+)
hooks/            one status line in projects that have a game profile
templates/        profile, case, promo-plan, experiment
references/       budget, channels, image-specs, design-resources, recommended
evals/            trigger and safety cases (claude plugin eval)
docs/             plan.md (Korean)
```

License: MIT
