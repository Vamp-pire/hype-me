---
name: cases
description: Learn from others who tried what we are trying — similar games, but also any game or service that used a similar tactic (a jam launch, a daily challenge, shareable results) or solved a similar UX problem (onboarding, first win, retention) — with dated timelines, what triggered the result (fact/likely/guess, with sources), and ideas a small team can copy. Use for "비슷한 게임은 어떻게 떴어?", "성공 사례", "이런 시도 한 데 있어?", "온보딩 잘한 사례", "how did X blow up", "case study".
argument-hint: "[game or service names]"
---

# Success stories → ideas for our game

Answer in the user's language. Lead with the ideas, not the research process.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

## 1. Pick the subjects (how many: by level in `${CLAUDE_PLUGIN_ROOT}/references/budget.md` — light 1, normal 1–2, deep 2–3)
Three kinds of subjects — pick by what the user is trying to do, not only by genre:
| kind | search for | example |
|---|---|---|
| **similar game** | same genre/platform/size | another chess-variant web game |
| **similar attempt** | any game or service that tried the same tactic or move, even in another genre | "launched as a game-jam entry", "daily puzzle", "shareable personality result", "free web demo → Steam", "Discord-first community" |
| **similar UX problem** | who solved the same player problem well | "teaching complex rules in the first minute", "getting a first win fast", "bringing players back on day 2", "mobile board controls" |
- From `$ARGUMENTS` or the request; otherwise from the profile (`audience.similarGames`) and the latest open problem (newest `ux` report, experiment, or promo plan) — say which kind you are researching.
- If there are no subjects yet, suggest 4–5 across the kinds that fit (an indie example is more useful than a AAA one), and ask which to research (AskUserQuestion, multiSelect, up to the top of the level's range).
- For **UX cases**, the timeline is about the change and its effect (what they changed in onboarding/controls, what improved, how they measured), with screenshots or videos linked when public.
- Skip subjects already in `.hype-me/cases/` unless the user wants a refresh; reuse those files instead.

## 2. Research in parallel
Start one `case-researcher` agent per subject, all at once. Give each the level, and: the subject, a 3-line summary of our profile (genre, platforms, markets, share moments), and the output path `.hype-me/cases/<slug>.md`.
Without agents, research one subject yourself following `agents/case-researcher.md`.

## 3. Bring it together
Read the case files and reply with:
```
What worked for games like ours
1. <pattern seen in 2+ cases> — e.g. <case>, <case>
2. …
Try next (for <our game>)
1. <concrete action, why, effort: small/medium>
2. …
3. …
Doesn't apply to us: <one line>
Saved: .hype-me/cases/<a>.md, <b>.md
```
- Prefer patterns that show up in more than one case; say when something is a single example.
- Keep "fact / likely / guess" labels when you quote a case.
- If an idea needs a change in the game itself (e.g. a share button, a daily challenge), say so — it may matter more than any post.

Example (one case, from a trial on Shotgun King for a free browser chess-variant game — shape only):
```
What worked (single case — treat as a lead, not a pattern)
1. Game-jam first: it won Ludum Dare 50 (fact), and the free jam build kept working as a demo (fact) that pointed players to the paid version (likely)
2. A content update ~6 months after launch lines up with a second review spike (likely, not proven)
Try next (for our game)
1. Enter the next game jam with one variant as the jam entry; keep that build as the free sample — effort: medium
2. One short devlog per variant "chapter", each ending with a clear next step — effort: small
Doesn't apply to us: a publisher deal and console ports
```

## 4. Offer the next step (one line)
"Want a promo plan built on these?" (promo-plan) or "Find where to promote?" (channels).
