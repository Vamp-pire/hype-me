---
name: mentions
description: Find who is talking about the game or service — new posts, videos, reviews and comments since last time (including ones only visible in your own traffic data), grouped into love / gripes / bugs / requests / questions, with ones worth answering and quotable reactions for social proof. Use when the user asks about mentions, reviews, reactions, buzz, testimonials or feedback ("우리 게임 언급 찾아 줘", "반응 어때?", "후기 모아 줘", "who's talking about my game", "any new reviews?"), or as part of a report.
---

# Who's talking about it?

Answer in the user's language. Never reply, post, vote or DM; the user answers people.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

1. **Profile.** Read `.hype-me/profile.json` (name, aliases, kind, links, markets).
   - A common-word name (e.g. "Stylish"): search with the domain and a distinctive phrase, not the name alone.
   - Ask whether the user already knows any posts or videos about it (one line, optional) — known URLs are opened directly.
2. **Run** the `mention-tracker` agent with that input, the project path and the level (first run: deep). Without agents, follow `agents/mention-tracker.md` yourself.
3. **Reply:**
```
New since <last run or "first run">: N mentions (M seen only in your traffic)
❤️ love N · 😕 gripes N · 🐞 bugs N · 💡 requests N · ❓ questions N
Worth answering
- <link> — <gist> — why: <unanswered question / bug report / big audience>
Quote candidates (ask the author before using them on your site or store page)
- "<≤15-word quote>" — <author>, <source>, <date> <link>
Themes
- "<request or complaint>" ×3 — <links>
Could not read — please open and paste: <URLs>
Not checked: <sources>
```
   Never present "not found by search" as "no mentions" when traffic shows visitors coming from a page — say "exists, seen in traffic".
4. **Offer**, one line each, only if they apply:
   - add repeated requests/bugs to `docs/backlog.md` (append, with links),
   - a reply draft for a "worth answering" item (the user posts it),
   - a thank-you or a feature idea for creators who covered it,
   - quotes for the landing page — only after the author agrees.
