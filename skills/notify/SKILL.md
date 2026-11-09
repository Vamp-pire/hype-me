---
name: notify
description: Send a short "work finished" report to the user's own Discord/Slack/webhook channel set up for this project. Use when the user asks to be notified or reported to ("끝나면 알려 줘", "디스코드로 보고해", "notify me when done"), or when a hype-me report is set to be sent (report.notify). Only sends to the webhook configured in .hype-me/profile.json.
---

# Notify

The webhook URL lives in an environment variable; the config only stores its **name** (`notify.urlEnv`). Never print, log or ask for the URL value in chat.

## Set up (first time)
If `notify` is missing in `.hype-me/profile.json`:
1. Ask which channel: Discord, Slack, or another webhook.
2. Tell the user to create an incoming webhook there and put its URL in an environment variable themselves (suggest the name `HYPE_ME_WEBHOOK_URL`, set in their shell profile or a local, git-ignored env file). Do not type the URL for them.
3. Save `"notify": { "type": "<discord|slack|webhook>", "urlEnv": "HYPE_ME_WEBHOOK_URL"}`. Ask whether reports should be sent automatically (`report.notify: true`) or only when asked.

## Send
Write one short message in the project's language, at most 5 lines:
```
✅ <project>: <what was done in one line>
visits: 1,240 (+18%) · new mentions: 7
top source: r/chessvariants
next: <one line, if any>
```
Then run:
`node "${CLAUDE_PLUGIN_ROOT}/scripts/notify.mjs" --cwd "<project>" --message "<text>"`
Report the script's one-line result. If it says the variable is not set, explain how to set it; do not retry with another channel.

Send only what the user asked to be told. Do not include secrets, personal data or file contents.
