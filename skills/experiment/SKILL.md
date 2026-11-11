---
name: experiment
description: Run the improvement loop — hypothesis → (cheap prototype) → change → measure → learn → next hypothesis — for game changes and promotions alike, one record per experiment with a main metric, a guardrail and a check date; reviews how a change or a promotion went (visits per tracking link, plays, wishlists, mentions). Use for "가설 세워 줘", "실험해 보자", "이거 효과 있었어?", "홍보 어땠어?", "A/B 테스트", "개선 사이클", "how did the launch go", "which post worked", "did the change work".
argument-hint: "[new | review | list]"
---

# Improvement loop

Answer in the user's language. Records live in `.hype-me/experiments/<NNN>-<slug>.md` (template: `${CLAUDE_PLUGIN_ROOT}/templates/experiment.md`).
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

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
1. Read the record (for a promotion, also its plan in `docs/promo/` and `.hype-me/links.json`). Get numbers for both periods: `retention.mjs` for activation/retention, `analytics.mjs` / `traffic` for visits.
   **Promotions:** per place — visits from its tracking link (GA4 campaigns or CSV), plays/wishlists, reactions from `mentions`, anything the user counted by hand (upvotes, comments, Discord joins) — as a table `place · visits · plays/wishlists · reactions · verdict`. Do not judge a place from one post; say so when numbers are small. Append the result to the promo plan too.
2. Fill **Result**: before, after, change, people. Small numbers (< 30 per side, or under the minimum) → verdict "no clear effect yet", confidence low.
3. Watch for other things that changed in the same period (a promo, a viral post, a holiday) and name them.
4. Fill **Learned** and **Next** — the next hypothesis, ship, or roll back — and start that record if the user agrees.

## list
A table of experiments: number, name, status, check date, verdict. Point out any whose check date has passed.

Keep it short: one screen per record.
