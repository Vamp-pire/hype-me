---
name: channels
description: Find where to promote a game — subreddits, Discord servers, forums, YouTubers/streamers, Steam curators, press, festivals and events that fit it — ranked, with each place's self-promotion rules and a concrete way in. Adapts to market and platform (e.g. Naver/DCInside for Korea, chess communities for chess games). Use when the user asks where to promote, post, advertise or find players ("어디서 홍보해?", "홍보할 곳 찾아 줘", "where should I post my game", "which streamers", "communities for my game").
argument-hint: "[area: communities | creators | press | events]"
---

# Where to promote

Answer in the user's language. Never post, comment, DM or contact anyone; the user does outreach.

## 1. Read the profile
`.hype-me/profile.json`: genre, tags, platforms, markets, similar games, player groups, `context.add` / `context.skip`. If there is no profile, ask for the game's genre, platform and 2–3 similar games first (or suggest `/hype-me:setup`).
If `.hype-me/cases/` has case files, use the places that worked for those games as leads.

## 2. Decide the areas and the context
- Default areas: communities, creators, curators/press, events. With `$ARGUMENTS`, only that area.
- Context from `${CLAUDE_PLUGIN_ROOT}/references/channels.md`: add market/platform/genre rows only when the profile clearly calls for them, and tell the user each addition in one line with the reason (e.g. "Korean market → also checking Naver cafes and DCInside"). Drop rows that do not fit (e.g. Steam curators for a web game).

## 3. Search in parallel
One `channel-scout` agent per area, all at once, each with the profile summary and context notes. Without agents, do the areas yourself following `agents/channel-scout.md`.

## 4. Rank and present
Merge into one list of at most 12, ordered by **fit × reachability ÷ effort** (a small, exact-fit community the user already belongs to beats a huge general one):
```
Top 3 to start with
1. <place> — <why> · rule: "<short quote>" · start: <first action>
…
| # | place | kind | size | fit | rule | how to approach | effort |
```
Then: "Not recommended: <place> — <reason>" for anything big but against its rules or off-target.
Then "Check by hand" — places that look right but could not be read automatically (blocked sites, logins), each with its direct link.
If a market's local communities came back thin (common for Korean cafes, galleries and Discord servers), ask the user once which communities they already know or belong to, and save them to `context.add`.
Save the full table to `.hype-me/reports/channels-<YYYY-MM-DD>.md` with all links.

## 5. Next step (one line)
Offer a promo plan that uses these places in order, or post drafts for the top 3 (the user posts them).
If the user says "skip X" or "also look at Y", save it to the profile's `context.skip` / `context.add`.
