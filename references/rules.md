# Shared rules for every hype-me skill

## 1. Profile first
Before doing a skill's work, check `.hype-me/profile.json`.
- **Missing:** run the setup first (`/hype-me:setup`, about a minute) — say in one line why ("so the answer fits your game"), draft what you can from the request and the folder, ask at most 3 questions in one round, save after "looks good", then **continue with the user's original request** without making them ask again.
- If the user refuses setup, continue with marked assumptions and say the answer will be less specific.
- Exceptions that never need a profile: `/hype-me:help`, the `recommend` skill, `notify` set-up.

## 2. End with the improvement loop
After any finding (traffic, mentions, cases, channels, ux, bugs, retention, design, report), end with **one** suggested experiment in one line:
"Hypothesis: <change> will move <metric> because <finding> — record it as an experiment?"
Skip only when the finding gives nothing testable. Do not start the record without a yes.

## 3. Use design actively
Whenever the work touches what people see — a share preview, a thumbnail, a store image, a first screen, a promo hook, a prototype — run the relevant `design` checks (sizes, small-size readability, comparison with similar games) as part of the answer, and suggest a concrete visual change or 2–3 visual directions. Use `references/design-resources.md` for resources and licences.

## 4. Leave a test with anything you make
Whenever hype-me makes or changes something in the user's project, it leaves a check that can be run again:
- **Bug fix** → first a test that fails because of the bug, then the fix, then the test passes (use the project's test runner; if none, a small `node` script in `tests/` or `.hype-me/checks/`).
- **Event / tracking code** → a check that the event fires with the right name and properties (unit test, or a `snap.mjs` step run that reads the network or dataLayer).
- **Prototype** → a smoke check that it opens without errors (`snap.mjs`), saved next to it.
- **Tracking links / share preview** → `launch-check` covers them; save its result.
- **Rule checks** → keep the rule-checker harness so it can be rerun.
Say where the test is and the command to run it. Never mark something done without having run its check once.
A Stop hook backs this up in projects with a profile: if a turn ends with changed code and no changed test or check file, it sends Claude back once.

## 5. Always
Answer in the user's language, result first. Never post, DM, install, pay or publish without a yes. Ranges, not fixed numbers (`references/budget.md`).
