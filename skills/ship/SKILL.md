---
name: ship
description: Run the project's own checks and report pass/fail with proof before calling a change done. Use when the user says the work is finished or asks to verify it ("check it", "is it done?", "다 됐어", "점검해 줘", "확인해 줘", "배포해도 돼?"), runs /fullship:ship, or before any claim that something works. Never say "done" or "it works" without this or equivalent command output.
argument-hint: "[--all] [--only id,id]"
---

# Ship checklist — proof, not "should work"

Answer in the project's language. Lead with the result line.

## 1. Run the checks
- Needs `.fullship/config.json`. If missing, say `/fullship:setup` comes first (about a minute) and stop.
- Prefer the `verifier` agent (keeps long logs out of the conversation). Give it the project path and any `$ARGUMENTS`.
- Without agents, run it yourself:
  `node "${CLAUDE_PLUGIN_ROOT}/scripts/run-checks.mjs" --cwd "<project>" $ARGUMENTS`
- Heavy checks (`"heavy": true`, e.g. full test suites) are skipped unless `--all`. If the change touched code those checks cover, ask once whether to run them now.

## 2. Report
```
passed 6 · failed 1 · not run 2
| check | result | detail |
…
Next: <one action>
```
- For each failure: the last few lines that explain it, and what you will change.
- For each "not run": why (heavy, needs a browser, no command) — never present it as passed.
- Evidence folder path on the last line.

## 3. Things commands cannot see
If the change has a user-facing side, list the manual items from the project's rules that apply and were not verified (phone layout, other languages, privacy text, patch notes). Mark each `checked (how)` or `not checked`. Do not mark anything checked without having looked.

## 4. Fix loop
If something failed and the fix is clear and inside the request, fix it and run only the failed checks again (`--only <ids>`). Stop after 3 rounds and report what is left.

## 5. After all pass
- Offer one line: deploy check (`deploy` skill) if the project deploys, or notification (`notify` skill) if set up.
- Do not commit, push or deploy unless the user asked or the project rules say it is approved.
