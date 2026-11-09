---
name: traffic
description: Answer "where do my players come from?" — traffic and acquisition by source, referrer, search term and tracking link, compared with the previous period, from analytics CSV exports (Google Analytics 4, Cloudflare Web Analytics, Plausible, Search Console, Steamworks UTM/traffic reports, itch.io, App Store Connect, Play Console) or a connected analytics tool. Use when the user asks about visitors, players, downloads or wishlists by source, referrals, or which post/channel brought people ("유저 어디서 와?", "유입 경로", "어디서 들어왔어?", "where is my traffic from").
argument-hint: "[CSV files] [--since YYYY-MM-DD]"
---

# Where do players come from?

Answer in the user's language. Numbers with their metric name; no made-up figures.

## 1. Find the data
- Files in `$ARGUMENTS`, or CSVs the user drops in the project (look in `.hype-me/data/`, the project root, Downloads only if the user points there).
- A connected analytics tool in this session (MCP) — use it if present.
- `.hype-me/profile.json` → `data` lists what the user has.
If there is nothing, say which export to get and how, for their platforms (one or two lines each), then stop:
- **Web**: Cloudflare Web Analytics or GA4 → export "traffic by source/referrer" for the last 4 weeks as CSV; Search Console → Performance → Export (queries).
- **Steam**: Steamworks → UTM Analytics and Traffic Breakdown → download CSV (no public API).
- **itch.io**: Analytics → referrers (copy or export).
- **Mobile**: App Store Connect → Sources; Play Console → Store performance → traffic sources (export).
Suggest saving exports in `.hype-me/data/` (git-ignored by setup).

## 2. Analyse
Period: `--since` or the last 7/28 days, compared with the same length before. Start the `traffic-analyst` agent with the files/tools and periods (or follow `agents/traffic-analyst.md` yourself).

## 3. Reply
```
<metric> · <period> vs before
Total <n> (<±%>)
Top: <source> <n> · <source> <n> · <source> <n>
Up: <source> +x%   Down: <source> −y%   New: <source>
From your tracking links: <place> <n>, <place> <n>
So: <1–2 sentences of meaning, e.g. "the lichess team post brought more than all of Reddit">
Missing: <what would make this better>
```
Label guesses ("likely because…"). Small numbers: say they are small.

## 4. Next
One line: a promo idea for the source that grew, or `promo-review` if a promo ran in this period. If the user wants, save the reply to `.hype-me/reports/traffic-<YYYY-MM-DD>.md`.
