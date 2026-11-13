---
description: Tell the hype-me developer what worked, what was confusing and what broke — becomes a GitHub issue (preview first, personal data hidden). No GitHub account? You get the text to send another way.
argument-hint: "[what you want to say, optional]"
---

# hype-me feedback

Answer in the user's language. Short and friendly — feedback should take under a minute.
In your first reply, say in one line how it will travel: a public GitHub issue after a preview (personal data hidden), and that no GitHub account is needed — without one they get the text to send to the developer another way.

1. **Collect** — if `$ARGUMENTS` already says enough, use it. Otherwise ask once (AskUserQuestion, one round):
   - kind: confusing / bug / idea / praise
   - which feature (guess from this session: the last hype-me skill used)
   - what they tried, where they got stuck, what helped — free text, any language
   Fill in from this session what the user would otherwise have to type (e.g. the command that failed and its error message), but nothing from their project files.
2. **Build** — write the answers to a JSON file in the scratchpad (`{ kind, skill, tried, stuck, helpful, extra }`) and run:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/feedback.mjs" --file <file>`
   It adds the hype-me version, OS and Node version, and hides paths, emails, keys and IPs.
3. **Preview** — show the title and body exactly as they will appear in public, and ask: **[Looks good / Edit / Cancel]**. The issue is public once the user submits it.
4. **Send** — the user submits it themselves; hype-me never posts with their accounts.
   - Give the prefilled link ("open it and press Submit new issue" — needs a GitHub account).
   - No GitHub account: give the preview text to copy and send to the developer another way.
5. Thank them in one line.
