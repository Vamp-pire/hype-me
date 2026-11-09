---
name: notify
description: Send a short hype-me update (a report summary or a finished research result) to the user's own Discord or Slack via a webhook set up for this project. Use when the user asks to be sent or notified ("디스코드로 보내 줘", "끝나면 알려 줘", "send it to Slack"), or when the profile says reports are sent (report.notify).
---

# Notify

The webhook URL lives in an environment variable; the profile stores only its **name** (`notify.urlEnv`). Never print, log or ask for the URL value in chat.

## First time
If `notify.type` is empty in `.hype-me/profile.json`:
1. Ask which: Discord, Slack, or another webhook.
2. The user creates an incoming webhook there and puts its URL in an environment variable themselves (suggest `HYPE_ME_WEBHOOK_URL`, in their shell profile or a git-ignored env file). Do not type the URL for them.
3. Save `notify.type`, and ask whether reports should be sent automatically (`report.notify: true`) or only when asked.

## Send
At most 8 lines in the user's language, for example:
```
📣 <game> · <period>
visits 1,240 (+18%) · top source r/chessvariants
new mentions 7 (2 worth answering)
this week: <1–3 short actions>
```
`node "${CLAUDE_PLUGIN_ROOT}/scripts/notify.mjs" --cwd "<project>" --message "<text>"` → report its one-line result. If the variable is not set, explain how to set it; do not try another channel.
Send only what the user asked for; no secrets, personal data or file contents.
