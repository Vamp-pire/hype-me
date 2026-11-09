---
name: channels
description: Find WHERE to promote a game — subreddits, Discord servers, forums, YouTubers/streamers, curators, press and events that fit it, ranked, with each place's self-promotion rules and a first step; adapts to market and genre. Use for "어디서 홍보해?", "홍보할 곳 찾아 줘", "where should I post my game", "which streamers". For a whole plan (what, when, how to measure), use promo-plan instead.
argument-hint: "[area: communities | creators | press | events]"
---

# Where to promote

Answer in the user's language. Never post, comment, DM or contact anyone; the user does outreach.

## 1. Read the profile
`.hype-me/profile.json`: genre, tags, platforms, markets, similar games, player groups, `context.add` / `context.skip`.
**No profile: do not stop to ask.** Use what the user said (genre, platform, market), guess 2–3 similar games and mark them as guesses, run a light search, and show results. Afterwards ask at most 2 questions that would change the list most (e.g. "which communities are you already in?") and offer `/hype-me:setup` for next time.
If `.hype-me/cases/` has case files, use the places that worked for those games as leads.

## 2. Reuse, then decide the areas
- If the reference's "Last checked" date is more than 6 months before today, say in one line that the community rules and examples may be out of date; rules must be read live anyway.
- If `.hype-me/reports/channels-*.md` is under 14 days old and the profile has not changed, show it and ask whether to refresh — do not search again unasked.
- Default (light): **two areas** — communities and creators. Add curators/press and events only when asked, with `--deep`, or when the platform makes them central (Steam → curators and festivals). With `$ARGUMENTS`, only that area.
- Context from `${CLAUDE_PLUGIN_ROOT}/references/channels.md`: add market/platform/genre rows only when the profile clearly calls for them, and tell the user each addition in one line with the reason (e.g. "Korean market → also checking Naver cafes and DCInside"). Drop rows that do not fit (e.g. Steam curators for a web game).

## 3. Search in parallel
One `channel-scout` agent per chosen area, all at once, each with the profile summary and context notes (and "deep" if the user asked for `--deep`). Without agents, do the areas yourself following `agents/channel-scout.md`.

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

Example of the top block (from a trial for a free browser game touring chess variants — shape only, not a list to reuse):
```
Top 3 to start with
1. Your own chess-variant Discord servers — closest audience you already have · rule: check each server's #self-promo channel · start: ask the mods where a showcase post fits
2. lichess teams "Variant Lovers" / "Variant Beginners" — variant fans, lichess is a similar game · rule: not checked · start: join, then ask a team leader about a variant-of-the-week event
3. PyChess Discord — PyChess is a named similar game, devs take variant suggestions · rule: not checked · start: suggest your variant as a feature idea, not an ad
Check by hand: r/chessvariants (Reddit blocked automated reading) → https://www.reddit.com/r/chessvariants/about/rules
```

## 5. Next step (one line)
Offer a promo plan that uses these places in order, or post drafts for the top 3 (the user posts them).
If the user says "skip X" or "also look at Y", save it to the profile's `context.skip` / `context.add`.
