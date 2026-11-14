---
name: design
description: Check how the game looks before players try it — store and share image sizes per platform (Steam capsules, itch cover, app store icons and screenshots, share preview, YouTube thumbnail), honest feedback on thumbnails, capsules and landing pages, and design resources with licence notes. Use for "썸네일 봐 줘", "캡슐 이미지 크기", "랜딩 페이지 디자인", "check my thumbnail / store image".
argument-hint: "[image files or page URL]"
---

# Design help for promotion

Answer in the user's language. Be direct and kind: say what works, then the 1–3 changes that matter most.
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

## 1. Sizes and formats
If the reference's "Last checked" date is more than 6 months before today, say in one line that the figures may be out of date and, before a store submission, confirm on the official page linked in image-specs.md.
For each image (`$ARGUMENTS` or files the user points to):
- Read each image's width, height and format (open it, or a browser tool) and compare using `${CLAUDE_PLUGIN_ROOT}/references/image-specs.md` for the asset type (ask once if the type is unclear).
- Report matches / wrong size / wrong shape, and which assets each platform in the profile still needs.

## 2. Feedback (look at the image)
Open the image (Read can show images). Apply the "small-size test" in `image-specs.md`: name readable at ~25%, genre guessable, one focal point, stands out.
- Compare with similar games: for Steam games, their store page (`https://store.steampowered.com/app/<appid>`) shows the header image; look at 2–3 of them and say how ours differs (colour, contrast, framing, text).
- For a page URL: read the first screen as a visitor — is it clear in 5 seconds what the game is and what to click? Use `launch-check` for the share preview.
- Korean or other local markets: check that text in that language renders well (font, size, line breaks).
Do not redraw or generate images unless asked; describe changes concretely ("make the title 2× larger and move it top-left", "drop the three small characters, keep the king").

## 3. Resources (only when useful)
Recommend from `${CLAUDE_PLUGIN_ROOT}/references/design-resources.md` by "use when", preferring what the project already uses (check `package.json`, CSS). Always include the licence/terms note when an asset will ship. Add something outside the list only when the task needs it, with one line why.
Related tools from `references/recommended.md` (e.g. frontend-design, UI Color Palette, Remotion for trailers) — mention once, never install without a yes.

## 4. Output
```
Sizes: <asset> ✅ / ⚠️ <issue> …
Works: <1–2 things>
Change: 1. … 2. … 3. …
Resources: <only if asked or clearly needed>
```
