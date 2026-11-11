---
name: recommend
description: Point to existing plugins and skills built for what the user needs, instead of rebuilding them — in one line when a request clearly needs a specialised tool hype-me does not have (stress-testing a plan "grill me", trailer video or motion "VFX", deep SEO, app-store listing text), or as a short table when asked ("/hype-me:recommend", "도구 추천해 줘", "recommend tools for SEO / video / design"). Installs nothing by itself.
argument-hint: "[area, e.g. seo | store | video | social | design]"
---

# Existing tools first

Answer in the user's language. Never install without a yes.

## When it fires on its own (one-line pointer)
Only when a request clearly matches the "when" column of `${CLAUDE_PLUGIN_ROOT}/references/recommended.md` and hype-me's own skills do not cover it. Not for ordinary coding.
1. Already installed (`~/.claude/plugins/installed_plugins.json`, `~/.claude/skills/`, `.claude/skills/`, or available in this session) → just use it.
2. In `.hype-me/profile.json` → `recommendations.dismissed` → carry on without it.
3. Otherwise one line: "**<name>** is built for this (<source>, <trust>). Install it, or go ahead without?" with buttons **[Install / Go ahead without]**. At most one pointer per request; never interrupt a task in progress.

## When asked (table)
1. Context from the profile (platforms, markets, genre); with `$ARGUMENTS`, only that area.
2. Skip installed and dismissed ones.
3. Rows from `references/recommended.md` whose "when" fits; for an area it does not cover, start the `tool-scout` agent. If the file's "Last checked" date is over 6 months old, say the figures may be out of date.
4. One table, rows within the level's range in `references/budget.md`: `name · source · what it does · how it works with hype-me · trust · install`. Ad-buying or auto-posting tools only if the user asked for that area, marked "irreversible".

## Install (either way)
Follow "How to install" in `references/recommended.md`. Save declined names to `recommendations.dismissed`.
