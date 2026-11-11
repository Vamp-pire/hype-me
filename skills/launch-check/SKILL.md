---
name: launch-check
description: Check a game's page is ready before promoting it — page loads, the share preview (title, description, image) looks right when the link is pasted into Discord/X/KakaoTalk/Reddit, visitor tracking is installed, and every tracking (UTM) link works. Use before posting or launching ("홍보 전에 확인해 줘", "링크 미리보기 괜찮아?", "is my page ready", "check my links"), or when a promo plan asks for it. Read-only.
---

# Ready to promote?
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

1. Run: `node "${CLAUDE_PLUGIN_ROOT}/scripts/launch-check.mjs" --cwd "<project>"`
   - Uses the profile's main link and saved tracking links. Pass `--url` for another page (e.g. a Steam or itch page — the visitor-tracking check then does not apply).
   - Just updated the page? add `--wait 180` to keep checking until it is live.
2. Report the first line as is (`ready · …` or `not ready · …`), then only what needs action:
   - **share image missing or not an image** → it hurts every shared link; suggest a 1200×630 image (`design` can check it).
   - **share title/description missing** → propose text from the profile pitch, in the main market's language.
   - **no visitor tracking** → "where do players come from?" will have no data; suggest the lightest option for their host (e.g. Cloudflare Web Analytics on Cloudflare Pages).
   - **tracking link lost its tag** → a redirect drops the `utm_` part; link to the final address instead.
3. Show the share preview text as people will see it. If you can read the image (download only if the user agrees), comment on whether it reads well at small size.
Never change files or publish anything; suggest the fixes.
