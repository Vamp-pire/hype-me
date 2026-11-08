---
description: Choose when fullship plans before building — only for big changes (default), always, or only when asked
argument-hint: "[big-only|always|manual]"
---

# fullship planning mode

The mode decides **one thing: when to show a plan before building.** A plan is short: goal, options with a recommendation, files that will change, how "done" will be checked. Nothing is built until the user approves it.

| mode | when a plan comes first |
|---|---|
| `big-only` (default) | Only for big changes: a new screen or feature, several files, server/database or stored-data changes, anything hard to undo. Small fixes and clear instructions go straight ahead. |
| `always` | For every request that changes code, even small ones (a 3-line plan is fine). |
| `manual` | Never on its own. Only when the user says "plan it first" or runs `/fullship:spec`. |

Other fullship features (checks, deploy verification, recommendations) do not depend on this mode: they run when asked, and at most get a one-line offer when a feature is finished.

Steps:
1. Read `.fullship/config.json`. If it does not exist, say `/fullship:setup` comes first and stop.
2. If `$ARGUMENTS` is `big-only`, `always` or `manual`, use it. Otherwise show the current mode in plain words and ask (AskUserQuestion, recommended `big-only` first). Accept plain requests too, like "always plan first" → `always`.
3. Change only the `mode` field and keep the rest of the file.
4. Confirm in one line, in the project's language, describing the behaviour (not the keyword).
