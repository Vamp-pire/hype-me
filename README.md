# hype-me

**"Hype me" — help people find your game.**
A Claude Code plugin for indie games and small projects (web, Steam/itch.io, mobile): it finds where your players come from, where to promote, how similar games took off, who is talking about you, and turns that into a promo plan you can actually run.

> Status: **0.2 early version** — the game profile and recommendations work today; the research skills are being built (see Roadmap). Private for now.

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
2. `/hype-me:report` — a summary any time: traffic changes, new mentions, last promo results, three things to do this week *(coming)*.

Everything else: just ask in plain words. Stuck? `/hype-me:help`. Looking for an existing tool for something? `/hype-me:recommend`.

## Roadmap
| | feature |
|---|---|
| ✅ now | game profile · help · recommendations of existing tools (incl. design resources) · one-line pointers · notifications to Discord/Slack |
| next | similar-game case studies · where to promote |
| then | promo plan + launch check (page, links, share preview) + UTM links · mentions + report · traffic (CSV first, then APIs) · design feedback |

## Install
```
/plugin marketplace add Vamp-pire/hype-me
/plugin install hype-me@hype-me
```
The repository is private for now, so you need access to it. For local development: `claude --plugin-dir <path to this folder>`.

## Layout
```
.claude-plugin/   plugin.json, marketplace.json
commands/         setup, help, recommend
skills/           guide, notify
agents/           scout
scripts/          launch-check, notify (Node 18+, no dependencies)
hooks/            hooks.json, session-start.mjs
templates/        profile.json, claude-md-section.md
references/       recommended.md, design-resources.md
docs/             plan.md (Korean), archive/
```

License: MIT
