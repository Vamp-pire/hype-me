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
Period: since `--since`, else since the last report in `.hype-me/reports/`, else the last 7 days. Run the parts in parallel and skip any part without data (say so in one line):
1. **Traffic** — `traffic` skill for the period vs the period before (needs analytics data or a CSV).
2. **Mentions** — `mentions` skill (new ones only).
3. **Last promo** — if a `docs/promo/*.md` check date falls in the period, a 3-line `promo-review`.
4. **Ideas** — newest `.hype-me/cases/` and `channels` report, for suggestions.

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
With `--send`, or when `report.notify` is true: use the `notify` skill to send the short version (at most 8 lines). If notifications are not set up, say how, and do not send anywhere else.
