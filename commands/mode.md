---
description: Show or change the fullship work mode for this project (manual, auto, heavy-only)
argument-hint: "[manual|auto|heavy-only]"
---

# fullship mode

Modes decide how much fullship does on its own in this project:

| mode | what happens |
|---|---|
| `manual` (default) | Nothing runs by itself. Use `/fullship:*` commands when you want them. |
| `auto` | Skills may step in on their own: planning before large features, the ship checklist when a feature is done. |
| `heavy-only` | Light checks may run by themselves; heavy ones (full test suite, screen matrix, release insights) are proposed and wait for a yes. |

Steps:
1. Read `.fullship/config.json`. If it does not exist, tell the user to run `/fullship:setup` first and stop.
2. If `$ARGUMENTS` is one of `manual`, `auto`, `heavy-only`, set `mode` to it.
   Otherwise show the current mode and ask which one to use (AskUserQuestion, current mode first).
3. Update only the `mode` field; keep the rest of the file as it is.
4. Confirm in one line, in the project's language. The session-start line will show the new mode from the next session.
