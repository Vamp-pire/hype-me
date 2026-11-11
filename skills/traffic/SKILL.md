---
name: traffic
description: Answer "where do my players come from?" — visits, clicks or sessions by referrer, search term, source and tracking link vs the previous period, straight from Cloudflare Web Analytics, Google Search Console or GA4, or from CSV exports (Steamworks, itch.io, app stores, any analytics tool). Use for "유저 어디서 와?", "유입 경로", "which post brought people".
argument-hint: "[cloudflare | search-console | ga4 | CSV files] [--days N]"
---

# Where do players come from?

Answer in the user's language. Numbers with their metric name; no made-up figures.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

## 1. Direct connections first (cheap: one script call each, no agent)
`node "${CLAUDE_PLUGIN_ROOT}/scripts/analytics.mjs" status --cwd "<project>"` shows what is connected (names only, never values).
Then run each connected source (in parallel):
- `analytics.mjs cloudflare --cwd "<project>" --days 7` — visits by referrer, top pages, countries
- `analytics.mjs search-console --cwd "<project>" --days 28` — Google search clicks by search term
- `analytics.mjs ga4 --cwd "<project>" --days 28` — sessions by source / medium, tracking-link campaigns
A `not connected` line comes with a one-line "how"; pass it on only if the user wants that source.

## 2. CSV for everything else
Steam, itch.io and app stores have no public analytics API. Use exports in `$ARGUMENTS` or `.hype-me/data/`:
`node "${CLAUDE_PLUGIN_ROOT}/scripts/traffic-csv.mjs" <file> --cwd "<project>" [--before <older file> | --from … --to … --vs-from … --vs-to …]` (`--by` / `--metric` if it cannot tell the columns).
Where to get them: Steamworks → UTM Analytics / Traffic Breakdown; itch.io → Analytics → referrers; App Store Connect → Sources; Play Console → Store performance. Save them in `.hype-me/data/` (git-ignored).

## 3. Nothing connected and no files
Say which one source would help most for their platform and how to connect it (two lines), then stop. Do not guess numbers.

## 4. Reply
```
<metric> · <period> vs before
Total <n> (<±%>)
Top: <source> <n> · <source> <n> · <source> <n>
Up: <source> +x%   Down: <source> −y%   New: <source>
From your tracking links: <place> <n>
So: <1–2 sentences of meaning>
Missing: <what would make this better>
```
Never add numbers from different metrics (visits vs clicks vs sessions). Label guesses; say when numbers are small.

## 5. Next
One line: a promo idea for the source that grew, or an `experiment review` if a promo or change ran in this period. Save to `.hype-me/reports/traffic-<YYYY-MM-DD>.md` only if the user wants.
