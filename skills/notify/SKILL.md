---
name: notify
description: Send a short hype-me update (a report summary or a finished research result) to the user's own Discord or Slack via a webhook set up for this project — as a card on Discord. Use when the user asks to be sent or notified ("디스코드로 보내 줘", "끝나면 알려 줘", "send it to Slack"), or when the profile says reports are sent (report.notify).
---

# Notify

The webhook URL lives in an environment variable; the profile stores only its **name** (`notify.urlEnv`). Never print, log or ask for the URL value in chat.

## First time
If `notify.type` is empty in `.hype-me/profile.json`:
1. Ask which: Discord, Slack, or another webhook.
2. The user creates an incoming webhook there and puts its URL in an environment variable themselves (suggest `HYPE_ME_WEBHOOK_URL`, in their shell profile, `~/.claude/hype-me/.env`, or the env file in `data.envFile`). Do not type the URL for them.
3. Save `notify.type`, and ask whether reports should be sent automatically (`report.notify: true`) or only when asked.

## Send (card template)
Write the update as a card file (scratchpad or `.hype-me/cache/notify-<YYYY-MM-DD>.json`) in the user's language:
```json
{
  "title": "<game> · <period or topic>",
  "status": "good | warn | bad | info",
  "summary": "one or two lines: the most important change",
  "sections": [["Traffic", ["visits 2,300 (+334%)", "top: Google 1,070 · Naver blogs 70"]],
               ["Mentions", ["7 new · 2 worth answering"]],
               ["This week", ["<action 1>", "<action 2>"]]],
  "links": [["Full report", "https://…"]],
  "footer": "hype-me report"
}
```
- status: good = things improved, warn = something needs a look, bad = a drop or a broken page/link, info = neutral update.
- 2–4 sections, at most 4 short items each. Skip empty sections.

1. Preview: `node "${CLAUDE_PLUGIN_ROOT}/scripts/notify.mjs" --cwd "<project>" --file <card.json> --dry-run` — show the user the card as text (not the JSON) unless they asked to send without a preview.
2. Send: the same command without `--dry-run` → report its one-line result.

On Discord it arrives as a coloured card, on Slack as formatted blocks. For a one-line note, `--message "text"` also works.
If the variable is not set, explain how to set it; do not try another channel.
Send only what the user asked for; no secrets, personal data or file contents.
