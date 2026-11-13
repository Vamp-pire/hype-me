---
name: prototype
description: Test an idea in the cheapest way before building it — pick the right level (concept test, fake-door button, clickable screen, bare playable mechanic, small slice in the real game), set a success criterion first, build throwaway prototypes in a separate prototypes/ folder, and record the result as an experiment. Use for "프로토타입", "이 아이디어 먼저 시험해 보고 싶어", "만들기 전에 반응 보고 싶어", "fake door", "quick prototype", "would players want this".
argument-hint: "[idea]"
---

# Prototype — cheapest test first

Answer in the user's language. Prototypes are throwaway and live apart from the game.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

## 1. Pin down the question
If the idea is still vague, do not stop with only questions: give a first answer in at most 5 lines — the recommended level and why, an example success criterion, that any prototype lives in `prototypes/` apart from the game, and that it will be recorded as an experiment — then ask at most 2 questions (what the idea is, and want / understand / enjoy).
From the idea or an `experiment` record: what do we need to learn — do people **want** it, **understand** it, or **enjoy** it? Set the success criterion before building (e.g. "3 of 5 testers finish 2 rounds", "5%+ click the fake-door button").

## 2. Pick the cheapest level that answers it
| level | answers | how | time |
|---|---|---|---|
| 1 concept test | want? | 2–3 hook lines or thumbnail drafts posted by the user to a small community, or a Discord poll | ~1 h |
| 2 fake door | want enough to click? | a "coming soon" button/page; measure clicks with a tracking link or an analytics event. Clicking must say honestly that it is not ready yet | ~half a day |
| 3 screen prototype | understand? | one clickable HTML screen or flow | half a day–1 day |
| 4 play prototype | enjoy? | a bare playable mechanic in one HTML file | 1–2 days |
| 5 slice in the game | works for real players? | behind a switch for some players | days |
Say why this level and not a cheaper one.

## 3. Build (levels 3–4)
Start the `prototyper` agent with the question, criterion, kind, project path and style notes. It writes only to `prototypes/<name>/`. Then let one `ux-playtester` try it as a first look (from the `ux` skill), if the level allows.
For level 1, write the drafts (the user posts them). For level 2, write the button/page text and the tracking link (a `utm_` link as in `promo-plan`) or event line; changes to the real game happen only after a yes, and never collect payment or personal data behind a fake door.

## 4. Test and decide
Give the user: the link/file, who to show it to, the 3 questions to ask testers, and what to count. Record it as an experiment (`experiment new`, type "prototype test") with the check date. On review: **build / change / drop**, with the numbers.

Useful existing tools (suggest once if not installed): mattpocock/skills `prototype`, Anthropic `frontend-design`, Google Stitch for screen drafts; design resources in `references/design-resources.md` (check licences).
