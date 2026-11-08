---
description: Find existing plugins and skills.sh skills that fit this project (design, testing, SEO, video…) so you do not rebuild them — shows trust and install commands, installs nothing by itself
argument-hint: "[area, e.g. design | testing | seo | video]"
---

# fullship recommend

fullship does not rebuild what already exists. This command finds plugins and skills that fit
the project and explains how they work with fullship. **It never installs anything by itself.**

## 1. Understand the project
Read `.fullship/config.json` if present (stack, modules, languages, release channels).
If it is missing, detect quickly from the repo (see `/fullship:setup` step 1) without writing anything.
If `$ARGUMENTS` names an area, focus on that area only.

## 2. Check what is already installed
- Claude Code plugins: `~/.claude/plugins/installed_plugins.json` (or the ListPlugins tool if available).
- Skills: `~/.claude/skills/*/SKILL.md`, the project's `.claude/skills/`, and skills listed in this session.
Skip anything already installed; mention it as "already installed" if relevant.

## 3. Pick candidates
Start from `${CLAUDE_PLUGIN_ROOT}/references/recommended.md`. Keep only rows whose "when" matches this project.
If an area is not covered there, search skills.sh (https://skills.sh — leaderboard, `/topic/<name>` pages, or the `find-skills` skill if installed).
Do not use the skills.sh API by default: it needs a Vercel OIDC token.

Skip by default anything that spends money or posts publicly on its own (ads, auto-posting); list it only if the user asked for that area, marked "irreversible actions".

## 4. Show one table
Columns: name · source (plugin directory / skills.sh) · what it does · relation to fullship (`replaces <fullship skill>` / `works with`) · trust (official / partner / community; skills.sh audit status if known) · install command.
At most 8 rows, best fit first. Then one line on what fullship will hand over if they install each one.

## 5. Install only what the user picks
Ask which ones to install (AskUserQuestion, multiSelect). For each picked item:
- Plugin: give the `/plugin install …` step (the user runs plugin installs in their client).
- skills.sh: show `npx skills add <owner/repo> --skill <name>`; mention `DISABLE_TELEMETRY=1` to opt out of install telemetry. Run it only after the user says yes; for community skills, show the repository link first.
Record declined items in `.fullship/config.json` → `recommendations.dismissed` so they are not suggested again.
