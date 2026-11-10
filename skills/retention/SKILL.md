---
name: retention
description: Do players come back, and what makes them? — which events to record (first game, first win, share, return), how to record them with what the game already uses (GA4, PostHog, Supabase, Plausible), then day-1/7/30 retention by weekly cohort, activation, funnels and aha-moment candidates from an event export. Use for "리텐션", "재방문율", "아하 모먼트", "이탈", "퍼널", "do players come back", "activation".
argument-hint: "[events file] [--aha event]"
---

# Do players come back?

Answer in the user's language. Numbers come from data only; small groups are marked.

## 1. Is anything recorded?
Look for event tracking in the project (`gtag('event'`, `posthog.capture`, `plausible(`, inserts into an events table, `window.dataLayer`) and in `.hype-me/profile.json` → `data`.
- **Nothing recorded:** propose an event plan (step 2) and stop there.
- **Recorded:** go to step 3.

## 2. Event plan (5–8 events, no more)
Pick for this game, e.g. `first_visit`, `game_start`, `game_complete`, `first_win`, `result_view`, `share_click`, `return_visit` (or the tool's own session start). Each with: when it fires, which properties (mode, variant, length — no personal data).
How to record — match what the project already uses; if nothing, suggest the lightest:
- GA4 already on the site → `gtag('event', 'game_complete', { mode })`
- PostHog / Plausible custom events → their one-line call
- Own backend (e.g. Supabase) → one `events` table (anonymous id, event, time, props) with insert-only access and a retention period
Show the exact lines and where they go; add them only after the user says yes. Mention the privacy text if the project has one (an anonymous id is still a new stored item).

## 3. Analyse
Get an export with one row per event (who, when, what): GA4 BigQuery/Explore export, PostHog export, a SQL query on the events table, or a CSV. Then:
`node "${CLAUDE_PLUGIN_ROOT}/scripts/retention.mjs" <file> --aha <event> --funnel <a,b,c> --discover`
(`--user` / `--time` / `--event` if it cannot guess the columns.)

## 4. Report
```
Retention · <n> players · until <date>
Day 1 <x>% · Day 7 <y>% · Day 30 <z>% (cohort trend: up/down/flat)
Biggest drop: <funnel step> (<a>% → <b>%)
Aha-moment candidate: <behaviour> — <p>% came back vs <q>% (correlation, n=…)
Try next: <one experiment idea>
```
- Say clearly that aha candidates are correlations; propose testing the best one with the `experiment` skill (e.g. "make finishing 3 games on day 1 easier").
- Mark cohorts and groups under 30 people as hints.
