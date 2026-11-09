---
name: promo-plan
description: Make a promotion plan for a game or project launch/update — goal, audience, the moment players want to share, a viral-loop check (reason to share, ease, does it come back), hooks per channel, channel order and timing with the rules of each place, tracking links, and how to measure — plus post drafts on request. Use when the user asks how to promote, market, launch or make something go viral ("홍보 계획 짜 줘", "어떻게 바이럴 시켜?", "launch plan", "how do I market my game", "post 써 줘").
argument-hint: "[what to promote: launch | update | event | demo]"
---

# Promo plan

Answer in the user's language. Be honest: virality cannot be promised — write it as "hypothesis → small test → check the numbers".

## 1. Gather inputs (do not ask what you can read)
- `.hype-me/profile.json` (game, platforms, markets, audience, share moments, links).
- Latest `.hype-me/reports/channels-*.md` and `.hype-me/cases/*.md`. If neither exists, say the plan will be stronger with them and offer to run `channels` and/or `cases` first; continue if the user wants a plan now.
- What is being promoted (`$ARGUMENTS` or the request): launch, update, event, demo — and a date if there is one.
- **Do not block on questions.** If there is no profile and little information, still write a short draft plan now with every assumption marked (e.g. "assuming a web game, Korea first"), covering all sections below, then ask at most 3 questions that would change the plan most (AskUserQuestion, recommended answer first) and offer `/hype-me:setup` for next time.

## 2. Write the plan
Fill `${CLAUDE_PLUGIN_ROOT}/templates/promo-plan.md`:
- **Goal**: one number with a time window, small enough to test.
- **Viral loop check**: inspect the actual game when possible (share buttons, result screens, preview image via `launch-check`). Turn each "no" into a concrete game change and say it may beat any post.
- **Hooks**: 5 per channel, in that channel's language and tone; curiosity, comparison, surprising result, numbers. Never fake claims.
- **Channel and timing**: small, friendly communities first to learn what lands, then bigger places. Respect each place's self-promotion rule (quote it). Add game-specific items that fit (wishlists, Next Fest, demo, devlogs, creator keys, store text for mobile).
- **Tracking links**: for every row, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/utm.mjs" add --channel "<place>" --campaign "<name>" --cwd "<project>"` and put the link in the table.
- Use the context rules from the profile (e.g. Korean market → Naver/DCInside rows) only when they apply.
Save to `docs/promo/<YYYY-MM-DD>-<name>.md` (if it exists, write `<name>.hype-me-new.md`).

## 3. Before posting
Offer `launch-check` once: page up, share preview correct, visitor tracking present, tracking links working.

## 4. Drafts (only if asked)
Write a draft per channel following the table: that place's tone and length, the hook, the tracking link, an honest note that the developer made it if the place requires it. The user posts them — never post, schedule or DM.

## 5. Close
One line with the check date and: "On <date>, ask 'how did the promo go?'" (promo-review).
