---
description: A short report on your game's reach — traffic changes, new mentions, how the last promo did, and three things to do this week; can send it to your Discord/Slack. Run any time, or set it up to run weekly.
argument-hint: "[--send] [--since YYYY-MM-DD] [--schedule weekly|off]"
---

# hype-me report

Answer in the user's language. Short and concrete.

## With `--schedule`
- `weekly`: set `report.schedule` to `"weekly"` in `.hype-me/profile.json`, then help the user schedule it with what they have — Claude Code's `schedule` skill (a routine that runs `/hype-me:report --send` weekly) or their OS scheduler. Show the exact routine/command and create it only after a yes.
- `off`: set it back to `"on-demand"`. Stop.

## Build the report
Period: since `--since`, else since the last report in `.hype-me/reports/`, else the last 7 days. Skip any part without data (say so in one line). Keep it cheap — scripts first, agents only when needed:
1. **Traffic** — run `analytics.mjs` for the connected sources directly (and `traffic-csv.mjs` for new files in `.hype-me/data/`); no agent.
2. **Mentions** — if the last mentions run was under 3 days ago (`mentions-seen.mjs stats`), reuse it; otherwise the `mentions` skill (new ones only).
3. **Last promo** — if a `docs/promo/*.md` check date falls in the period, a 3-line `promo-review`.
4. **Ideas** — read the newest `.hype-me/cases/` and `channels` report; do not start new research for the report.

```
<game> · <period>
Visits <n> (<±%>) · top source <x> · new source <y>
Mentions <n> new · <love/gripe/bug/request counts> · worth answering: <n>
Last promo: <one line>
This week
1. <action> — why
2. …
3. …
```
Save as `.hype-me/reports/report-<YYYY-MM-DD>.md`.

## Send
With `--send`, or when `report.notify` is true: use the `notify` skill to send it as a card (title = game and period, status from the overall trend, sections Traffic / Mentions / Last promo / This week). If notifications are not set up, say how, and do not send anywhere else.
