---
name: launch-check
description: Check a game's page is ready before promoting it — page loads, the share preview (title, description, image) looks right when the link is pasted into Discord/X/KakaoTalk/Reddit, visitor tracking is installed, and every tracking (UTM) link works. Use before posting or launching ("홍보 전에 확인해 줘", "링크 미리보기 괜찮아?", "is my page ready", "check my links"), or when a promo plan asks for it. Read-only.
---

# Ready to promote?
Follow the shared rules in `${CLAUDE_PLUGIN_ROOT}/references/rules.md` — profile first (run setup, then continue), end with one experiment suggestion, use design checks whenever something visual is involved, and leave a runnable test with anything you make.

1. Check the profile's main link (or the page the user named) and each saved link in `.hype-me/links.json`, by fetching the page:
   - **loads**: it answers, and does not redirect somewhere unexpected
   - **share preview**: `og:title`, `og:description`, `og:image` (and `twitter:card`) in the page head; the image link itself works
   - **visitor tracking**: a known analytics snippet is present (Cloudflare Web Analytics, GA4 `gtag`, Plausible, PostHog, Clarity, …) — skip for Steam or itch pages
   - **tracking links**: after redirects the address still carries its `utm_` part
2. Report one first line (`ready · …` or `not ready · …`), then only what needs action:
   - **share image missing or not an image** → it hurts every shared link; suggest a 1200×630 image (`design` can check it).
   - **share title/description missing** → propose text from the profile pitch, in the main market's language.
   - **no visitor tracking** → "where do players come from?" will have no data; suggest the lightest option for their host (e.g. Cloudflare Web Analytics on Cloudflare Pages).
   - **tracking link lost its tag** → a redirect drops the `utm_` part; link to the final address instead.
3. Show the share preview text as people will see it. If you can read the image (download only if the user agrees), comment on whether it reads well at small size.
4. Save the result to `.hype-me/reports/launch-check-<YYYY-MM-DD>.md` so it can be compared next time.
Never change files or publish anything; suggest the fixes.
