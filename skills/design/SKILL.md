---
name: design
description: Help with how the game looks to people who have not played it yet — check store and share images against each platform's sizes (Steam capsules and screenshots, itch.io cover, App Store/Google Play icons and screenshots, share preview, YouTube thumbnail), give honest feedback on thumbnails, capsules and landing pages (readable small? genre clear? stands out next to similar games?), and recommend design resources with licence notes. Use for "썸네일 봐 줘", "캡슐 이미지 괜찮아?", "스토어 이미지 크기", "랜딩 페이지 디자인", "디자인 리소스 추천", "check my thumbnail / capsule / store page".
argument-hint: "[image files or page URL]"
---

# Design help for promotion

Answer in the user's language. Be direct and kind: say what works, then the 1–3 changes that matter most.

## 1. Sizes and formats
For each image (`$ARGUMENTS` or files the user points to):
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/image-size.mjs" <files> --expect <WxH>` using `${CLAUDE_PLUGIN_ROOT}/references/image-specs.md` for the asset type (ask once if the type is unclear).
- Report matches / wrong size / wrong shape, and which assets each platform in the profile still needs.

## 2. Feedback (look at the image)
Open the image (Read can show images). Apply the "small-size test" in `image-specs.md`: name readable at ~25%, genre guessable, one focal point, stands out.
- Compare with similar games: for Steam games, `node "${CLAUDE_PLUGIN_ROOT}/scripts/steam-app.mjs" info <appid>` gives their header image link; look at 2–3 of them and say how ours differs (colour, contrast, framing, text).
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
