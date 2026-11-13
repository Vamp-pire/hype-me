# hype-me privacy policy

Last updated: 2026-11-13

hype-me is a Claude Code plugin. It has no server of its own, and the developer receives nothing from it.

## What it reads
- Files in your project folder that a skill needs, such as your game's README, pages and CSV exports you put in `.hype-me/data/`.
- Public web pages about your game: search results, store pages, public posts and reviews. This can include the public name or handle shown with a post.
- Tools you have connected to Claude yourself (for example an analytics or Discord connector), and only when a skill needs them.

hype-me never reads API keys, tokens, passwords or `.env` files.

## What it stores
Results are saved only in your project folder, under `.hype-me/` and `docs/promo/`. When it tracks mentions of your game, it saves each mention's link, date, public author name and a short summary in `.hype-me/mentions.json`, so it can show only new ones next time. You can delete these files at any time.

## What it sends
- The plugin does not send your data to the developer or to any analytics service.
- Its scripts make read-only requests to public pages and APIs (for example Steam store data and Reddit pages), using your game's name.
- `/hype-me:feedback` builds a prefilled GitHub issue link with personal data hidden. Nothing is posted unless you open the link and submit it yourself, and then it is public on GitHub.
- Anything Claude itself processes follows Anthropic's policies for your Claude account.

## Contact
Questions: https://github.com/Vamp-pire/hype-me/issues
