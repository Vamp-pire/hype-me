---
name: promo-review
description: Look back at a promotion — what each post or channel brought (visits per tracking link, plays, wishlists, mentions), what worked, what did not, and what to change next time. Use when the user asks how a promo, post, launch or campaign went ("홍보 어땠어?", "효과 있었어?", "how did the launch go", "which post worked"), or when a promo plan's check date has passed.
argument-hint: "[promo plan file or campaign name]"
---

# How did the promo go?

Answer in the user's language. Numbers first, then the lesson.

1. Pick the plan: `$ARGUMENTS`, or the newest `docs/promo/*.md` whose check date has passed. Read its goal, channel table and tracking links (`.hype-me/links.json`).
2. Get results:
   - traffic per tracking link / source → run the `traffic` skill for the plan's date window (CSV or connected analytics). If there is no data, ask the user for an export or the numbers they see, and say what is missing.
   - reactions → the `mentions` results for the same window.
   - anything the user tracked by hand (upvotes, comments, Discord joins, wishlists).
3. Reply:
```
Goal: <goal> → <result> (<met / partly / not yet>)
| place | visits | plays/wishlists | reactions | verdict |
Worked: <1–2 things, with numbers>
Didn't: <1–2 things, likely reasons — label guesses>
Next time: <3 concrete changes>
```
4. Append a dated "Result" section to the plan file and suggest the next plan or channel. Do not judge a channel from one post alone; say so when the numbers are small.
