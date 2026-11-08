---
name: deploy
description: Confirm a deploy is actually live — pages return 200 and the live site serves the new build files — instead of assuming a push worked. Use after a push or deploy, or when the user asks "is it live?", "배포됐어?", "사이트에 반영됐어?", or runs /fullship:deploy. Checks only; it never deploys or pushes by itself.
argument-hint: "[--wait seconds]"
---

# Is the new version live?

1. Read `.fullship/config.json` → `deploy.url`, `deploy.checkPaths`, `deploy.buildDir`. If there is no URL, ask for it once and offer to save it.
2. If the project builds locally and `deploy.buildDir` exists, the check compares the hashed build files in the local `index.html` with the live homepage. Make sure the local build is the one that was pushed (built from the current commit); otherwise say the build match is not meaningful.
3. Run:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/deploy-check.mjs" --cwd "<project>" --wait 180`
   (use `--wait 0` when the user only wants a quick look).
4. Report the first line as is (`live · 3/3 checks passed` or `not confirmed · …`), then the table.
   - Not confirmed after waiting: say what failed, and the likely next step (check the host's deploy log, cache, or whether the push reached the deploy branch). Do not retry forever.
5. If the project rules mention a status page or a deploy dashboard command, mention it; do not log in anywhere on the user's behalf.
