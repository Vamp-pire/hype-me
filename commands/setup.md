---
description: One-time project setup (about a minute) — detects your stack, deploy and tests, asks at most 2 questions, and turns your release checklist into checks that actually run
argument-hint: "[--refresh]"
---

# fullship setup

Set up (or refresh) fullship for the current project. Think of this as a better `/init`:
it detects, asks only what it cannot detect, turns the checklist into runnable commands,
and never overwrites the user's files.

Reply to the user in the project's language (detect it from README / CLAUDE.md / UI strings; ask if unclear).

## 1. Detect (read only)
Look for, and note what you find with the file it came from:
- **Package / build**: `package.json` scripts, lockfile (npm/pnpm/yarn/bun), `tsconfig.json`, `pyproject.toml`, etc.
- **Hosting / deploy**: `wrangler.toml` or `functions/` (Cloudflare Pages/Workers), `vercel.json`, `netlify.toml`, `firebase.json`, `fly.toml`, `Dockerfile`, `.github/workflows/*`.
- **Backend**: `supabase/` (migrations, functions), Firebase, Prisma, etc.
- **Tests**: vitest / jest / playwright / pytest config, and the test script.
- **i18n**: locale folders, `/en/` routes, translation helpers.
- **Release channels**: browser extension `manifest.json`, GitHub release workflows, `npm publish`, auto-update endpoints.
- **Existing rules**: `CLAUDE.md`, `HANDOFF.md`, `PLAN.md`, patch notes / changelog files.

If `.fullship/config.json` already exists, load it first. With `--refresh`, only propose changes for what is new or different.

## 2. Ask as little as possible (max 2 questions)
Keep this easy: the user should not need to know about modules, agents or the config file.
- **Modules are chosen automatically** from what you detected: `core` always; `release` if there is a deploy target, extension, package or release workflow; `marketing` and `media` stay off until the user asks for that kind of work.
- Ask **only** what you could not detect, in one AskUserQuestion round, at most 2 questions, recommended answer first:
  - the production URL (only if not found), and
  - the planning mode: `big-only` (recommended: plan first only for big changes) / `always` / `manual` (only when asked), in plain words.
- Then show one summary screen ("I'll set it up like this": stack, deploy URL, checks, planning mode) and ask **[Looks good / Change something]**. Write files only after "Looks good".

## 3. Write `.fullship/config.json`
Start from `${CLAUDE_PLUGIN_ROOT}/templates/config.json`. Fill `stack`, `deploy`, `commands`, `languages`, `modules`, `mode`.
Build `checks` as **runnable** items: each has `id`, `name`, `run` (a shell command, or a fullship skill name like `skill:screen-matrix`), `pass` (`exit0` unless stated), and `heavy` (true if it takes over ~1 minute or needs a browser).
Only include checks whose command you actually found or the user confirmed.

## 4. Project rules section
Propose a short fullship section for `CLAUDE.md` from `${CLAUDE_PLUGIN_ROOT}/templates/claude-md-section.md`.
- No `CLAUDE.md`: create it with that section.
- Existing `CLAUDE.md`: show the section and append it inside `<!-- fullship:start -->` / `<!-- fullship:end -->` markers only after the user agrees. If it would conflict with existing rules, write `CLAUDE.md.fullship-new` instead and tell the user.

**Never overwrite an existing file.** When a file you would create already exists and differs, write `<name>.fullship-new` next to it.

## 5. Recommend
Finish by running the steps of `/fullship:recommend` for the detected stack (show the table; install nothing).

## 6. Report
Lead with one line: "fullship is ready." Then, briefly: what was detected (with source files), the mode, and how many checks were set up. Mark anything you guessed as a guess.
End with the one thing to do next: "When you finish a change, say 'check it' or run `/fullship:ship`." Use plain words in the project's language; avoid terms like config, module, agent.
