---
name: cases
description: Find out how similar games or services took off — a dated timeline of launches, demos, festivals, viral posts and creator videos, what triggered growth (fact/likely/guess, with sources), and ideas a small team can copy. Use for "비슷한 게임은 어떻게 떴어?", "성공 사례", "how did X blow up", "case study".
argument-hint: "[game or service names]"
---

# Success stories → ideas for our game

Answer in the user's language. Lead with the ideas, not the research process.

## 1. Pick the subjects (how many: by level in `${CLAUDE_PLUGIN_ROOT}/references/budget.md` — light 1, normal 1–2, deep 2–3)
- From `$ARGUMENTS` or the request; otherwise from `.hype-me/profile.json` → `audience.similarGames`.
- If there are none, suggest 4–5 candidates that match our genre, platforms and team size (an indie hit is more useful than a AAA one), and ask which to research (AskUserQuestion, multiSelect, up to the top of the level's range).
- Allow non-game services when the user asks or when a mechanic is the point (e.g. a personality test that spread through shared results).
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
