---
name: notify
description: Send a short hype-me update (a report summary or a finished research result) to the user's own Discord or Slack through a Discord/Slack tool connected in this Claude session — or give the text ready to paste. Use when the user asks to be sent or notified ("디스코드로 보내 줘", "끝나면 알려 줘", "send it to Slack"), or when the profile says reports are sent (report.notify).
---

# Notify

hype-me never handles webhook URLs, bot tokens or other keys. It sends only through a Discord or Slack tool the user has connected to Claude (an MCP connector), and only to a channel the user named.

## First time
If `notify.type` is empty in `.hype-me/profile.json`:
1. Ask which: Discord or Slack, and which channel.
2. Check that a matching tool is connected in this session. If not, say in one line that it needs a Discord/Slack connector (`/hype-me:recommend` can find one) and that until then you will give the text to paste.
3. Save `notify.type` and `notify.channel` (the name, not a URL), and ask whether reports should be sent automatically (`report.notify: true`) or only when asked.

## Send
Write the update in the user's language as a short card:
```
<game> · <period or topic>   [good | warn | bad | info]
<one or two lines: the most important change>
Traffic: visits 2,300 (+334%) · top: Google 1,070 · Naver blogs 70
Mentions: 7 new · 2 worth answering
This week: <action 1> · <action 2>
<link to the full report, if any>
```
- status: good = things improved, warn = something needs a look, bad = a drop or a broken page/link, info = neutral update.
- 2–4 sections, at most 4 short items each. Skip empty sections.

1. Show the card to the user unless they asked to send without a preview.
2. Send it with the connected tool to the saved channel, and report where it went in one line.
3. No connected tool: give the card as text to paste. Do not try another channel or another way of sending.

Send only what the user asked for; no secrets, personal data or file contents.
