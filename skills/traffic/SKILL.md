---
name: traffic
description: Answer "where do my players come from?" — visits, clicks or sessions by referrer, search term, source and tracking link vs the previous period, from a connected analytics tool or from CSV exports (Cloudflare, Search Console, GA4, Steamworks, itch.io, app stores, any analytics tool). Use for "유저 어디서 와?", "유입 경로", "which post brought people".
argument-hint: "[CSV files] [--days N]"
---

# Where do players come from?

Answer in the user's language. Numbers with their metric name; no made-up figures.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

## 1. Connected tools first
If an analytics tool is connected in this Claude session (an MCP connector for Cloudflare, Google Analytics, Search Console, Plausible, PostHog or similar), ask it for visits/sessions/clicks by source, search term and campaign for this period and the one before. Use only what it returns.

## 2. CSV exports for everything else
Use exports in `$ARGUMENTS` or `.hype-me/data/`:
Read each file yourself: find the source/referrer (or campaign) column and the metric column; total per source for this period and the one before (from two files, or split by a date column); change in %; tracking-link names from `utm_source`/`utm_campaign` matched to `.hype-me/links.json`. Use a small throwaway script in the scratchpad for large files.
Where to get them: Cloudflare Web Analytics → export; Search Console → Performance → Export; GA4 → Reports → Share → Download CSV; Steamworks → UTM Analytics / Traffic Breakdown; itch.io → Analytics → referrers; App Store Connect → Sources; Play Console → Store performance. Save them in `.hype-me/data/` (git-ignored).

## 3. Nothing connected and no files
Say which one export or connector would help most for their platform and how to get it (two lines; `/hype-me:recommend` finds connectors), then stop. Do not guess numbers.

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
