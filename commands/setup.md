---
description: One-time setup (about a minute) — builds a profile of your game or project (genre, platforms, links, similar games, who it is for, what players love to share) so every hype-me answer is about your game
argument-hint: "[--refresh]"
---

# hype-me setup — the game profile

Everything in hype-me (where players come from, where to promote, similar games' success stories, mentions, promo plans, design feedback) starts from one profile: `.hype-me/profile.json`. Build it with as few questions as possible.

Reply in the user's language, in plain words. Do not mention file names, keys or agents unless asked.

## 1. Detect (read only)
From the current folder and anything the user already said:
- **Name, one-line pitch, genre/tags**: README, package/store metadata, page `<title>`/`<meta name="description">`, `manifest.json`, Steam/itch/app-store links.
- **Platforms and links**: web URL (deploy config, README), Steam/itch/App Store/Play links, Discord invite, social accounts.
- **Languages and markets**: UI languages (i18n folders, `/en/` routes), README language.
- **Share moments**: result screens, replays, rankings, share buttons, OG/share-image code.
- **Data already wired**: analytics snippets (Cloudflare Web Analytics, GA4, Plausible), Search Console verification, UTM usage.
If `.hype-me/profile.json` exists, load it; with `--refresh` only propose what changed.

## 2. Ask at most 3 questions (one AskUserQuestion round, recommended answer first)
Only what you could not detect, typically:
1. **Similar games** (3–5) — offer your own guesses as options; this drives channels and case studies.
2. **Who it is for** — 2–3 player groups (e.g. "chess variant fans", "idle/tycoon players", "Korean chess community").
3. **Main link** to send people to, if none was found.
Then show one summary ("Here's your game profile") and ask **[Looks good / Change something]**. Write nothing before "Looks good".

## 3. Write the profile
Start from `${CLAUDE_PLUGIN_ROOT}/templates/profile.json`. Fill what you know, leave the rest null/empty.
- `data.keys` stores only environment-variable **names** for any API keys, never values.
- `context.add` / `context.skip` start empty; they hold the user's own "also look at X" / "skip Y".
- If the folder is a git repo, add `.hype-me/reports/` and `.hype-me/cache/` to `.gitignore` (append; create if missing). The profile itself can be committed.
- Never overwrite an existing file; write `<name>.hype-me-new` next to it instead.

## 4. Context check (only when needed)
Look at markets, platforms and genre. If they call for sources beyond the defaults, say so in one line each with the reason — for example: Korean market → Naver blogs/cafes, DCInside galleries, Arca.live; mobile → store search terms and reviews; chess → lichess/chess.com communities. Do not add anything that does not clearly apply.

## 5. Finish
One line: "Your game profile is ready." Then suggest the most useful first step, as plain requests the user can say:
- no players yet → "find similar games' success stories" or "where should I promote?"
- already live with analytics → "where do my players come from?"
Mention `/hype-me:report` for a summary any time.
