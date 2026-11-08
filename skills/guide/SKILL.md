---
name: guide
description: Point the user to an existing plugin or skill that already does what they are asking for, in one line, instead of rebuilding it. Use when a request clearly matches a specialised tool listed in fullship's recommendations and it is not installed — e.g. stress-testing a plan ("grill me", "계획 빡세게 따져 봐"), video or motion effects for a trailer ("VFX", "모션 그래픽"), Three.js/shader debugging, deep SEO audits, design polish, social media hooks. Do not use for ordinary coding requests.
---

# One-line pointer to an existing tool

1. Look up the request in `${CLAUDE_PLUGIN_ROOT}/references/recommended.md` (the "when" column). If nothing matches well, do nothing and carry on with the request.
2. Skip it if it is already installed (check `~/.claude/plugins/installed_plugins.json`, `~/.claude/skills/`, `.claude/skills/`, or the skills available in this session) — then just use it.
3. Skip it if `.fullship/config.json` → `recommendations.dismissed` contains it.
4. Otherwise say, in the project's language, one line:
   "This is what **<name>** is built for (<source>, <trust>). Install it, or should I go ahead without it?"
   with buttons **[Install / Go ahead without]**. Never install without that yes.
5. On "Install": give the plugin step (`/plugin install …`, which the user runs) or run the skills.sh command (`npx skills add <owner/repo> --skill <name>`; mention `DISABLE_TELEMETRY=1`). For community items, show the repository link first.
6. On "Go ahead without": add the name to `recommendations.dismissed` and do the request yourself. Do not suggest it again.

At most one pointer per request, and never interrupt a task that is already in progress.
