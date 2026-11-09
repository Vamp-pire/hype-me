# Recommended plugins and skills

Last checked: 2026-11-09

hype-me does not rebuild these. `/hype-me:recommend` and the `guide` skill pick rows that match the game profile.
Install counts are skills.sh all-time totals, rounded, as of 2026-11-08/09 — recheck before quoting.

Sources:
- **Plugin directory**: Claude Code plugin marketplaces (Anthropic Directory, Knowledge Work). Install with `/plugin`.
- **skills.sh**: open skills directory run by Vercel. Install with `npx skills add <owner/repo> --skill <name>`.

| area | name | source | id / install | when | relation to hype-me | trust |
|---|---|---|---|---|---|---|
| planning | grill-me, grill-with-docs, to-spec | skills.sh | `mattpocock/skills` (grill-me ~1.5M, audits Gen/Socket/Snyk Pass) | stress-testing a promo plan or a big game change | use before `promo-plan` when the idea is shaky | community |
| promotion | launch-strategy, marketing-psychology, social-content, content-strategy | skills.sh | `coreyhaines31/marketingskills` | planning a launch or campaign | general strategy; hype-me adds the game's share moments, viral-loop check and its numbers | community |
| promotion | Social Media Skills (viral-reverse-engineering, hook-writer, campaign-and-launch-planning, reddit-marketing, content-calendar) | plugin directory | "Social Media Skills" | social channels, hooks | works with `promo-plan` hooks and drafts | community |
| promotion | Marketing | plugin directory | Anthropic "Marketing" | campaigns, content, brand voice | works with `promo-plan` | official |
| promotion | copywriting | skills.sh | `coreyhaines31/marketingskills` | store text, landing copy, posts | works with `promo-plan` drafts | community |
| seo | seo-audit, ai-seo, schema-markup, programmatic-seo | skills.sh | `coreyhaines31/marketingskills` | web games and landing pages that need search traffic | deeper than `launch-check`; hype-me links results to traffic | community |
| seo | SEO-AEO-GEO Ultimate | plugin directory | "SEO-AEO-GEO Ultimate" | deep SEO work | optional | community |
| mobile | ASO Specialist | plugin directory | "ASO Specialist" | App Store / Google Play listings | store text and keywords; hype-me covers images (`design`) and traffic | community |
| analytics | Windsor.ai Ads and Marketing Data | plugin directory | "Windsor.ai" | GA4, Search Console and many sources in one place (paid service) | a connected source for `traffic` instead of CSVs | partner |
| design | frontend-design | plugin directory, skills.sh | `anthropics/skills` → `frontend-design` (~1.1M) | landing page or web game UI | works with `design` feedback | official |
| design | web-design-guidelines | skills.sh | `vercel-labs/agent-skills` → `web-design-guidelines` (~840K) | landing page rules incl. accessibility | works with `design` | partner |
| design | impeccable / taste-skill / emil-design-eng | skills.sh | `pbakaus/impeccable`, `leonxlnx/taste-skill`, `emilkowalski/skills` | polishing a landing page | optional | community |
| design | Design | plugin directory | Anthropic "Design" | design critique, design system, UX copy | works with `design` | official |
| design | UI Color Palette | plugin directory | "UI Color Palette" | building a palette, contrast checks | optional | community |
| design | Figma | plugin directory | "Figma" | the team designs in Figma | optional | partner |
| media | Remotion | plugin directory, skills.sh | `remotion-dev/skills` (~770K best-practices) | trailers and short clips in code | renders videos a promo plan calls for | vendor |
| media | hyperframes-animation, motion-graphics | skills.sh | `heygen-com/hyperframes` (~1.0M / ~510K) | motion graphics / effects in trailers | alternative to Remotion | vendor |
| media | video-shotcraft, Tweenkit, animation-studio | plugin directory | "video-shotcraft", "Tweenkit", "animation-studio" | product videos, kinetic text, coded animation | optional | community |
| media | review-animations, animation-vocabulary | skills.sh | `emilkowalski/skills` | UI motion polish for a landing page | optional | community |
| meta | find-skills | skills.sh | `vercel-labs/skills` → `find-skills` (~4.3M) | searching for more skills | used by `tool-scout` | partner |

## How to install (shared by /hype-me:recommend and the guide skill)
- **Plugin**: give the `/plugin install <name>@<marketplace>` step; the user runs plugin installs in their client.
- **skills.sh skill**: show `npx skills add <owner/repo> --skill <name>` and mention `DISABLE_TELEMETRY=1` to skip install statistics. Run it only after the user says yes. For community items, show the repository link (and skills.sh audit result if known) first.
- Never install anything the user did not pick.

## Not recommended by default (irreversible actions)
Ad-buying and auto-posting plugins (for example Hyper Marketing, AdWhispr, Social media studio). List them only when the user asks for that area, marked "irreversible: spends money / posts publicly". Never set up automatic posting.
