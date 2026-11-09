---
description: Find existing plugins and skills that fit this game's promotion (SEO, store listings, trailers and motion, social posts, design) so hype-me doesn't rebuild them — with trust level and install command; installs nothing by itself
argument-hint: "[area, e.g. seo | store | video | social | design]"
---

# hype-me recommend

Answer in the user's language.

1. **Context** — read `.hype-me/profile.json` (platforms, markets, genre). Without it, ask what the game is in one line. With `$ARGUMENTS`, cover only that area.
2. **Already installed** — check `~/.claude/plugins/installed_plugins.json`, `~/.claude/skills/`, the project's `.claude/skills/` and the skills available in this session; skip those (mention "already installed" if useful). Skip names in `recommendations.dismissed`.
3. **Candidates** — rows of `${CLAUDE_PLUGIN_ROOT}/references/recommended.md` whose "when" fits the profile. If an area the user asked about is not covered, start the `tool-scout` agent for it.
4. **One table**, at most 6 rows, best fit first:
   `name · source · what it does · how it works with hype-me · trust · install`
   Ad-buying or auto-posting tools only if the user asked for that area, marked "irreversible".
5. **Install only what the user picks** (AskUserQuestion, multiSelect), following "How to install" in `references/recommended.md`. Save declined names to `recommendations.dismissed`.
