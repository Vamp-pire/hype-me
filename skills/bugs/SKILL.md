---
name: bugs
description: Find bugs players would hit, fast — first by running the game (a monkey test where several browsers play at once, rule checks against a reference for rule-heavy games like chess variants, and errors real players already got), then by tracing each found problem to its cause in the code with a failing test; merges duplicates and ranks by harm with shortest repro steps. Use for "버그 찾아 줘", "오류 있는지 봐 줘", "QA 해 줘", "find bugs", "test my game".
argument-hint: "[url] [quick | deep]"
---

# Find bugs players would hit

Answer in the user's language. Report first; fix only after the user says which ones (or draft issues). Never push, deploy or file issues without a yes.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

## 1. Set up the run
**If the game or a URL is missing, do not stop with only a question.** Show the run plan in at most 4 lines — level, methods, where it will test (local dev server first, live site only with a yes), and what the report will contain (ranked bugs with shortest repro steps and screenshots; nothing fixed without a yes) — then ask for exactly the missing thing (project folder or URL).
- **Level** (light / normal / deep) from the request or the profile's `budget` — ranges in `${CLAUDE_PLUGIN_ROOT}/references/budget.md`.
- **Where to test (monkey):** prefer a local dev server or preview build. Check `package.json` scripts, `.claude/launch.json`, or a `dist/` folder you can serve. If only the live site is available, say once that test visits will show up in analytics and that the monkey avoids payment/login forms, and ask before using it.
- **Methods by level:** light → monkey + real errors; normal → + rule checks (rule-heavy games) + root-cause tracing; deep → all with the deep ranges, both viewports, and a risk-area code read when nothing was found.
- Why this order: running the game finds what a plain code read cannot (real clicks, real timing, thousands of rule cases); the code is read only to explain and fix what was found.

## 2. Phase 1 — find (in parallel)
Start at once, each with the project path and level:
- `bug-monkey` (URL, viewport: mobile for normal, both for deep)
- `error-collector`
- `rule-checker` — only for rule-heavy games (board games, puzzles, card games)
Without agents, run `monkey.mjs` yourself.

## 2b. Phase 2 — trace (normal and deep)
Give the found problems (messages, stack traces, shortest steps, rule differences) to `code-hunter` — one agent per group of related problems. It returns the cause, a failing check and a proposed fix for each, plus the same mistake elsewhere.

## 3. Merge and rank
- Same problem from several sources (e.g. monkey exception + player reports + traced to the same line) → one row, list all evidence. Agreement raises confidence.
- Rank: **stops play** (freeze, blank, crash, dead end) > **wrong result** (rules, score) > **lost progress** > **broken screen** > minor — then by how many players it touches (real-error counts, mentions), then by how reliably it reproduces.

## 4. Report
```
Bugs · <level> · <n> found (<k> confirmed by 2+ hunters)
1. [stops play] <what the player sees> — repro: <shortest steps> · evidence: monkey ×5, code src/game.ts:120, 3 player reports
2. …
Checked: <methods run, browsers × actions, files read, rule cases>
Not checked: <what was skipped and why>
```
Save to `.hype-me/bugs/report-<YYYY-MM-DD>.md` with screenshots/run folders linked.

## 5. Next (one line)
Offer: fix the top 1–3 (each with the failing check from phase 2, which must pass afterwards), draft GitHub issues, or rerun the monkey at deep on the screens where problems clustered. Bugs that touch first-time players also go to the `ux` skill's list.
