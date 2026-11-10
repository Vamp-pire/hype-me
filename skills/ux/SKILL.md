---
name: ux
description: Find where new players get confused, stuck or leave — first-time playtests by persona on phone and PC (screenshots, time and taps to the first fun moment), real behaviour from Microsoft Clarity (rage/dead clicks, quick backs) and analytics funnels, complaints in reviews and mentions, and a comparison with how similar games onboard — ranked with fixes. Use for "UX 개선점", "어디서 이탈해?", "첫 화면 어때?", "온보딩 봐 줘", "playtest", "why do players leave".
argument-hint: "[url] [quick | deep]"
---

# Where do new players get stuck?

Answer in the user's language. Every problem needs at least two kinds of evidence, or is marked "single signal".

## 0. Missing the game or a URL?
Do not stop with only a question. Show the plan in at most 4 lines — level, personas (built from what the user said), which evidence (playtest with screenshots on phone/PC, Clarity, complaints, similar games), and the output (ranked problems, each with evidence and a fix) — then ask for exactly the missing thing (URL or project folder).

## 1. Gather in parallel (level from the request or profile `budget`; ranges in `references/budget.md`)
- **Playtests** — start one `ux-playtester` per persona (light: 1, normal: 2, deep: 3). Build personas from the profile's player groups and markets, e.g. "chess beginner, Korean, phone" and "variant fan, English, PC". URL: a local/preview build if available, else the main link.
- **Real behaviour** — `node "${CLAUDE_PLUGIN_ROOT}/scripts/analytics.mjs" clarity --cwd "<project>"` (dead clicks, quick backs, rage clicks by page) and, if events are tracked, the funnel from the `retention` skill (where the biggest drop is).
- **What players say** — gripes and questions from `.hype-me/mentions.json` / the `mentions` skill ("어렵다", "모르겠다", "느리다", "how do I…").
- **Similar games** (normal and deep) — first screens and onboarding of 1–2 similar games (store screenshots, their sites; Mobbin or getdesign.md for references). Compare: what do they show first, how fast is the first win.

## 2. Judge with game-onboarding principles
Teach by doing, not reading · first success within ~60 seconds · one obvious thing to do per screen · failing is cheap and you can retry at once · a moment worth showing a friend · works one-handed on a phone (tap targets ≥ 40px, no sideways scroll, readable text).

## 3. Report
```
UX · <level> · <n> problems
1. <screen> — <what happens to players> · evidence: playtest (persona A stuck 40s), Clarity dead clicks 83% on /app?view=practice, 2 reviews · fix: <concrete change> · effort: small
2. …
Works well: <1–2 things to keep>
Not checked: <what and why>
```
Rank by players affected × how badly it stops them ÷ effort. Save to `.hype-me/ux/report-<YYYY-MM-DD>.md` with screenshot paths.

## 4. Next (one line)
Turn the top 1–2 into experiments (`experiment` skill: hypothesis, metric, check date), or a quick prototype of the fix (`prototype` skill). Bugs found on the way go to the `bugs` list.
