---
type: llm
weight: 1
---

Pass if the response uses (or clearly follows) the hype-me bugs skill: it plans several bug-finding methods (e.g. an automated monkey test in browsers, code reading, real player errors, rule checks for rule-heavy games), prefers the local dev server over the live site, and promises to report with repro steps and ranking before fixing anything. Fail if it just starts editing code or gives only generic testing advice.

Note: the test folder contains no game. In that case, a passing answer shows the concrete plan (as above) and asks for the URL or project folder; it must not invent findings.

Note: the test folder has no hype-me profile. Starting the hype-me setup first (a short game profile, at most 3 questions) and saying it will then continue with this request also counts as a pass, as long as it does not invent results.
