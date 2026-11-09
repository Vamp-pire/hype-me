---
name: guide
description: Point the user, in one line, to an existing plugin or skill built for what they are asking when hype-me itself does not do it — e.g. stress-testing a plan ("grill me", "계획 빡세게 따져 봐"), trailer video or motion effects ("VFX", "모션 그래픽"), deep SEO audits, app-store listing text (ASO). Not for ordinary coding, and not for things hype-me's own skills already cover.
---

# One-line pointer to an existing tool

1. Match the request against the "when" column of `${CLAUDE_PLUGIN_ROOT}/references/recommended.md`. No clear match → say nothing and carry on.
2. Already installed (plugins list, `~/.claude/skills/`, `.claude/skills/`, or available in this session) → just use it.
3. In `.hype-me/profile.json` → `recommendations.dismissed` → carry on without it.
4. Otherwise one line in the user's language: "**<name>** is built for this (<source>, <trust>). Install it, or go ahead without?" with buttons **[Install / Go ahead without]**.
5. Install → follow "How to install" in `references/recommended.md`. Go ahead without → add the name to `recommendations.dismissed` and do the task yourself.

At most one pointer per request; never interrupt a task in progress.
