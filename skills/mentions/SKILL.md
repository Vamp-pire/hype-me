---
name: mentions
description: Find who is talking about the game — new posts, videos, reviews and comments since last time, grouped into love / gripes / bugs / requests / questions, with the ones worth answering. Use when the user asks about mentions, reviews, reactions, buzz or feedback ("우리 게임 언급 찾아 줘", "반응 어때?", "who's talking about my game", "any new reviews?"), or as part of a report.
---

# Who's talking about the game?

Answer in the user's language. Never reply, post, vote or DM; the user answers people.

1. Read `.hype-me/profile.json` for name, aliases, links and markets. If the game name is a common word, ask once for a distinctive phrase or link to search by.
2. Start the `mention-tracker` agent with that input and the project path (without agents, follow `agents/mention-tracker.md` yourself).
3. Reply:
```
New since <last run or "first run">: N mentions
❤️ love N · 😕 gripes N · 🐞 bugs N · 💡 requests N · ❓ questions N
Worth answering
- <link> — <gist> — why: <unanswered question / bug report / big audience>
Themes
- "<request or complaint>" ×3 — <links>
Not checked: <sources>
```
4. Offer, one line each, only if they apply:
   - add repeated requests/bugs to `docs/backlog.md` (append, with links),
   - a reply draft for a "worth answering" item (the user posts it),
   - thank-you/feature ideas for creators who covered the game.
