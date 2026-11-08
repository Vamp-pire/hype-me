---
name: spec
description: Plan a change before building it — goal, options with a recommendation, files that will change, and acceptance criteria the user approves. Use when the user asks to plan first ("plan it first", "계획 먼저", "어떻게 만들지 정리해 줘"), runs /fullship:spec, or when the fullship planning mode says this change needs a plan (big-only: new screen or feature, several files, server/database or stored-data changes, anything hard to undo; always: any code change). Not for small fixes or clear one-line instructions in big-only mode.
---

# Plan before building

Write in the project's language, plain words. Keep the whole plan on one screen.

## 1. Understand
- Read what the request touches (files, CLAUDE.md rules, `.fullship/config.json`). Do not build anything yet.
- If something important is unclear, ask in one AskUserQuestion round (max 3 questions, recommended answer first). If a `grill-me` style skill is installed and the user wants a deep review, suggest it.

## 2. Show the plan
```
Goal: <one sentence: what changes for the user>
Options:
  A. … (recommended — why in one line)
  B. …
Files: <files to add/change>
Done when:
  - AC-1 Given …, when …, then …
  - AC-2 …   (3–5 items; include one edge case)
Out of scope: <what this will not do>
Risks: <only if any: data, privacy text, hard-to-undo steps>
Stop rule: <only for open-ended work like "make it faster": stop when …, or after N tries>
```
Rules for "Done when": each item must be checkable by a command, a test, or a look at a page. Name which.
Also check for forgotten parts and list them under Risks if they apply: other languages of the UI, phone layout, privacy policy/terms for new stored data, sitemap/menu for new pages, server access rules.

## 3. Get approval
Ask with buttons: **[Go with A / Change something / Not now]**. Build nothing before "Go".

## 4. After approval
- For big features, save the plan as `docs/specs/<YYYY-MM-DD>-<short-name>.md` (if the file exists, write `<name>.fullship-new.md`).
- Where the project has tests and the change is logic (not just layout), write the failing tests for the acceptance criteria first, run them to see them fail, then build until they pass.
- Optionally ask the `plan-checker` agent for a second look on large plans; show its "needs work" items before building.
- When building is done, offer once: "Run the checks? (/fullship:ship)".
