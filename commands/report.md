---
description: A short report on your game — by default just the headline numbers and three things to do this week; add or remove sections any time ("리포트에 리텐션 추가해", "언급은 빼"). Can go to your Discord/Slack, on demand or weekly.
argument-hint: "[--send] [--since YYYY-MM-DD] [--schedule weekly|off] [add|remove <section>]"
---

# hype-me report

Answer in the user's language. Short and concrete. Follow `${CLAUDE_PLUGIN_ROOT}/references/rules.md` (profile first).

## Sections — minimal by default, the user decides the rest
The profile keeps the list: `.hype-me/profile.json` → `report.sections`. Default when empty: `["traffic", "actions"]`.
| section | what it shows | how (cheap first) |
|---|---|---|
| `traffic` | visits and change, top source, new source | `analytics.mjs` for connected sources, `traffic-csv.mjs` for new files in `.hype-me/data/` — no agent |
| `actions` | 3 things to do this week, the first one framed as an experiment | from everything else in the report + newest `.hype-me/cases/` and `channels` report — no new research |
| `mentions` | new mentions count, worth answering, quote candidates | reuse a run under 3 days old (`mentions-seen.mjs stats`), else the `mentions` skill |
| `experiments` | experiments whose check date passed or that are running | `.hype-me/experiments/` (includes promotions) |
| `retention` | day 1/7 retention and activation vs last period | `retention.mjs` on the newest export or connected events |
| `ux` | Clarity dead/rage clicks and quick backs by page | `analytics.mjs clarity` (counts toward Clarity's 10 calls a day) |
| `bugs` | new real-player errors | Clarity script errors + error tracker if connected (no monkey run) |
| `search` | Google search clicks and top queries | `analytics.mjs search-console` |
| `design` | share preview and store images still failing checks | latest `launch-check` / `design` results |
- **Add / remove:** "add retention", "리포트에 언급 넣어 줘", "UX는 빼" → update `report.sections`, confirm in one line, and use it from now on.
- Unknown request ("add Discord member count") → add it as a custom section if a source exists, otherwise say what would be needed.

## With `--schedule`
- `weekly`: set `report.schedule` to `"weekly"`, then help the user schedule it with what they have — Claude Code's `schedule` skill (a routine running `/hype-me:report --send`) or their OS scheduler. Show the exact routine/command and create it only after a yes.
- `off`: back to `"on-demand"`. Stop.

## Build
Period: since `--since`, else since the last report in `.hype-me/reports/`, else the last 7 days. Run the chosen sections in parallel; a section without data gets one line ("no data — how to connect").
```
<game> · <period>
<one line per chosen section>
This week
1. <action> — as an experiment: <hypothesis in one line>
2. …
3. …
```
Save as `.hype-me/reports/report-<YYYY-MM-DD>.md`.

## Send
With `--send`, or when `report.notify` is true: use the `notify` skill to send it as a card (title = game and period, status from the overall trend, one card section per report section). If notifications are not set up, say how, and do not send anywhere else.
