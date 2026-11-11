---
description: What can hype-me do for this game right now? Shows the profile status, what was last looked at, and the one thing worth doing next
---

# hype-me help

Answer in the user's language, plain words, at most 10 lines. No jargon.

1. **Status** — read `.hype-me/profile.json` and the newest files in `.hype-me/reports/`, `.hype-me/cases/`, `docs/promo/`.
   - No profile: say there is no game profile yet, explain it in one sentence ("a one-page note about your game that makes every answer specific to it"), and offer to run `/hype-me:setup` now (about a minute) — every other feature starts with it. Stop.
   - Profile: one line with the game name and platforms, and one line with the last thing done (e.g. "last report: Nov 9", "2 case studies saved").
2. **One next step** — the single most useful action for where the game is:
   - nothing done yet → "find how similar games took off" or "where should I promote?"
   - a promo plan exists and its date has passed → "how did the last promo go?"
   - analytics connected and no recent report → `/hype-me:report`
3. **What you can say** — short examples:
   "where do my players come from?" · "where should I promote?" · "how did similar games take off?" · "who's talking about my game?" · "make a promo plan" · "check my thumbnail/store image" · "find bugs" · "where do new players get stuck?" · "do players come back?" · "let's test this idea first".

All of these are available as early versions. Something confusing or broken? `/hype-me:feedback` (it becomes a GitHub issue after a preview).
