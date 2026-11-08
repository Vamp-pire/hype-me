---
description: Show where this project stands with fullship and the one thing worth doing next
---

# fullship help

Answer in the project's language, in plain words, in at most 8 lines. No jargon (do not say config, module, agent).

1. **Status** — read `.fullship/config.json` and the newest folder in `.fullship/evidence/` if they exist.
   - Not set up: say so and suggest `/fullship:setup` (about a minute, at most 2 questions). Stop.
   - Set up: one line with the mode in plain words (for example "manual: I only act when you ask") and the last check result (`passed 6 · failed 1 · not run 1`, with its date), or "no checks run yet".
2. **One next step** — pick the single most useful action:
   - last check failed → fix what failed, then "check it" again
   - changes since the last check (git status / git log) → "say 'check it' or run `/fullship:ship`"
   - everything passed and nothing changed → suggest `/fullship:recommend` once, or nothing.
3. **What you can say** — three short examples of plain requests, for example:
   "check it" · "is the deploy live?" · "recommend tools for this project".
   Mention that `/fullship:mode` changes how much happens on its own, in one short line.
