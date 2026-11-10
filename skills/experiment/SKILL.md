---
name: experiment
description: Run the improvement loop — hypothesis → (cheap prototype) → change → measure → learn → next hypothesis — for game changes and promotions alike, one record per experiment with a main metric, a guardrail and a check date. Use for "가설 세워 줘", "실험해 보자", "이거 효과 있었어?", "A/B 테스트", "개선 사이클", "what should we test next", "did the change work".
argument-hint: "[new | review | list]"
---

# Improvement loop

Answer in the user's language. Records live in `.hype-me/experiments/<NNN>-<slug>.md` (template: `${CLAUDE_PLUGIN_ROOT}/templates/experiment.md`).

## new — write a hypothesis worth testing
1. Find the evidence first: latest `ux`, `bugs`, `cases`, `traffic`, `retention` results and `mentions` themes. A hypothesis without evidence is fine but must say "hunch".
2. Fill the template. Rules:
   - **One change, one main metric, one guardrail.** The metric should be close to the change (e.g. "first-game completion" for an onboarding change, not "revenue").
   - Prefer metrics around the **aha moment and retention** (see the `retention` skill) over raw visits.
   - Baseline from real data, with the period and source; if there is none, the first step is to measure it.
   - **Minimum to judge** sized to the game's traffic: small games compare before/after over the same weekdays and a fixed period; true A/B splits only when there are enough players (roughly a few hundred per side). Say which.
3. If the change is big or uncertain, suggest testing it first with the `prototype` skill (cheapest test).
4. Never change the game's code from here; building the change is separate and needs the user's go.

## review — did it work?
1. Read the record. Get numbers for both periods: `retention.mjs` for activation/retention, `analytics.mjs` / `traffic` for visits, `promo-review` for promotions.
2. Fill **Result**: before, after, change, people. Small numbers (< 30 per side, or under the minimum) → verdict "no clear effect yet", confidence low.
3. Watch for other things that changed in the same period (a promo, a viral post, a holiday) and name them.
4. Fill **Learned** and **Next** — the next hypothesis, ship, or roll back — and start that record if the user agrees.

## list
A table of experiments: number, name, status, check date, verdict. Point out any whose check date has passed.

Keep it short: one screen per record.
