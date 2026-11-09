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
| where do players come from? | `traffic` (CSV exports or a connected analytics tool) |
| where should I promote? | `channels` |
| how did similar games take off? | `cases` |
| who is talking about my game? | `mentions` |
| make a promo plan / how did it go? | `promo-plan`, `promo-review` |
| is my page ready to share? | `launch-check` (page, share preview, tracking, links) |
| check my thumbnail / store images | `design` |
| find an existing tool for X | `/hype-me:recommend`, `guide` |

Limits, honestly: Steam and itch analytics have no public API, so traffic reads their CSV exports; Reddit blocks automated reading, so those places come with links to check by hand; virality is never promised.

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
skills/           traffic, channels, cases, mentions, promo-plan, promo-review, launch-check, design, guide, notify
agents/           traffic-analyst, channel-scout, case-researcher, mention-tracker, scout
scripts/          traffic-csv, steam-app, reddit-sub, utm, launch-check, mentions-seen, image-size, notify (Node 18+, no dependencies)
hooks/            session start line
templates/        profile, case, promo-plan, CLAUDE.md section
references/       channels, image-specs, design-resources, recommended
evals/            trigger and safety cases (claude plugin eval)
docs/             plan.md (Korean), archive/
```

License: MIT
