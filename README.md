# hype-me

**"Hype me" — help people find your game.**
A Claude Code plugin for indie games and small projects (web, Steam/itch.io, mobile): it finds where your players come from, where to promote, how similar games took off, who is talking about you, and turns that into a promo plan you can actually run.

> This is the **directory edition**: Markdown only, nothing runs on your computer by itself. The automatic browser tests (a monkey test across several browsers, reusable play bots) and the script-based checks are in the full edition on GitHub: https://github.com/Vamp-pire/hype-me. Here, Claude does those steps itself with a browser tool you have connected (Claude in Chrome, the built-in browser, or a Playwright connector).

## Install
From the Claude plugin directory, or the full edition from GitHub:
```
/plugin marketplace add Vamp-pire/hype-me
/plugin install hype-me@hype-me
```

## Commands
1. `/hype-me:setup` — once per game. A short game profile (at most 3 questions).
2. `/hype-me:report` — a summary any time: traffic changes, new mentions, last promo results, three things to do this week.

Everything else: just ask in plain words. Stuck? `/hype-me:help`. Tell us what worked and what did not: `/hype-me:feedback` (a prefilled GitHub issue you submit yourself; personal data is hidden). Looking for an existing tool? `/hype-me:recommend`.

## What it does
| ask | skill |
|---|---|
| where do players come from? | `traffic` (an analytics connector you added to Claude, or CSV exports) |
| where should I promote? | `channels` |
| how did similar games take off? | `cases` |
| who is talking about my game? | `mentions` |
| make a promo plan / how did it go? | `promo-plan`, then `experiment` review |
| is my page ready to share? | `launch-check` |
| check my thumbnail / store images | `design` |
| find bugs players would hit | `bugs` |
| where do new players get stuck? | `ux` |
| do players come back? what is the aha moment? | `retention` |
| run hypothesis → test → learn | `experiment`, `prototype` |
| find an existing tool for X | `recommend` |

It never posts, DMs, installs or spends money without your yes, and it follows each community's rules. It never reads API keys, tokens or `.env` files. Results stay in your project folder (`.hype-me/`).

Privacy: https://github.com/Vamp-pire/hype-me/blob/main/PRIVACY.md · Issues: https://github.com/Vamp-pire/hype-me/issues

License: MIT
