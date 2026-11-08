# Recommended plugins and skills

fullship does not rebuild these. `/fullship:recommend` picks rows that match the project.
Install counts are skills.sh all-time totals, rounded, as of 2026-11-08 — recheck before quoting.

Sources:
- **Plugin directory**: Claude Code plugin marketplaces (Anthropic Directory, Knowledge Work). Install with `/plugin`.
- **skills.sh**: open skills directory run by Vercel. Install with `npx skills add <owner/repo> --skill <name>`.

| area | name | source | id / install | when | relation to fullship | trust |
|---|---|---|---|---|---|---|
| design | frontend-design | plugin directory, skills.sh | `anthropics/skills` → `frontend-design` (~1.1M) | any web UI | works with; `screen-matrix` checks the result | official |
| design | web-design-guidelines | skills.sh | `vercel-labs/agent-skills` → `web-design-guidelines` (~840K) | web UI, accessibility rules | replaces the accessibility item of `release-guard` | partner |
| design | impeccable / taste-skill / emil-design-eng | skills.sh | `pbakaus/impeccable`, `leonxlnx/taste-skill`, `emilkowalski/skills` | polishing UI | optional | community |
| design | Design | plugin directory | Anthropic "Design" plugin | design critique, design system, UX copy, accessibility | works with `reviewer` | official |
| design | Fairmind Design | plugin directory | "Fairmind Design" | design tokens, WCAG audits | replaces token checks if installed | community |
| design | audit-suite | plugin directory | "audit-suite" | multi-lens audits (UX, perf, a11y) | works with | community |
| design | Figma | plugin directory | "Figma" | team uses Figma | optional | partner |
| design | UI Color Palette | plugin directory | "UI Color Palette" | building a palette, contrast | optional | community |
| frontend | vercel-react-best-practices | skills.sh | `vercel-labs/agent-skills` (~880K) | React / Next.js | works with | partner |
| frontend | next-best-practices | skills.sh | `vercel-labs/next-skills` | Next.js | works with | partner |
| workflow | feature-dev | plugin directory | "feature-dev" | larger features | overlaps `spec-first`; if installed fullship only writes the spec file and acceptance criteria | official |
| testing | test-driven-development, verification-before-completion | skills.sh | `obra/superpowers` (~270K each) | any project | same principles as `ship-checklist`; works with | community |
| testing | webapp-testing | skills.sh | `anthropics/skills` → `webapp-testing` | web apps | works with | official |
| testing | playwright-best-practices | skills.sh | `currents-dev/playwright-best-practices-skill` | Playwright present | works with | community |
| testing | playwright (MCP) | plugin directory | "playwright" (Microsoft) | browser checks | used by `screen-matrix`, `deploy-verify` | partner |
| review | code-review | plugin directory / built-in | "code-review" | PR review | `reviewer` only checks project rules | official |
| extension | Chrome Extension Builder | plugin directory | "Chrome Extension Builder" | `manifest.json` (MV3) found | works with; `release-insights` reads store numbers | community |
| backend | supabase, supabase-postgres-best-practices | skills.sh, plugin directory | `supabase/agent-skills` (~360K / ~480K) | `supabase/` found | `adapters/supabase` points to these | official (vendor) |
| hosting | deploy-to-vercel | skills.sh | `vercel-labs/agent-skills` → `deploy-to-vercel` | Vercel | `adapters/vercel` points to it | partner |
| hosting | Cloudflare | — | none found on skills.sh (2026-11) | Cloudflare | fullship `adapters/cloudflare` covers it | — |
| seo | seo-audit, ai-seo, schema-markup, programmatic-seo | skills.sh | `coreyhaines31/marketingskills` | `marketing` module | `seo-content` hands over to these | community |
| seo | SEO-AEO-GEO Ultimate | plugin directory | "SEO-AEO-GEO Ultimate" | deep SEO work | optional | community |
| marketing | Marketing | plugin directory | Anthropic "Marketing" | campaigns, content | `launch-post` keeps only patch-notes → drafts and the outreach log | official |
| marketing | copywriting, launch-strategy | skills.sh | `coreyhaines31/marketingskills` | launch copy | works with `launch-post` | community |
| marketing | Social Media Skills | plugin directory | "Social Media Skills" | many social channels | optional | community |
| media | Remotion | plugin directory, skills.sh | `remotion-dev/skills` (~770K best-practices) | `media` module | `trailer` prepares shot list and footage; rendering goes here | vendor |
| media | video-shotcraft | plugin directory | "video-shotcraft" | product videos with Remotion | optional | community |
| media | hyperframes | skills.sh | `heygen-com/hyperframes` | alternative to Remotion | optional | vendor |
| planning | grill-me, grill-with-docs, to-spec, to-prd | skills.sh | `mattpocock/skills` (grill-me ~1.5M, audits Gen/Socket/Snyk Pass) | before building a feature | runs before `spec-first`; `plan-checker` then only checks gaps | community |
| handoff | handoff, claude-handoff | skills.sh | `mattpocock/skills` (handoff ~1.1M) | session handoff | overlaps fullship `handoff`; try first, fullship adds only HANDOFF.md format and decision reasons | community |
| workflow | writing-plans, systematic-debugging, subagent-driven-development, dispatching-parallel-agents, requesting-code-review | skills.sh | `obra/superpowers` | any project | works with | community |
| workflow | spec-driven-dev | plugin directory | "spec-driven-dev" (plan review, TDD implement, standards agents) | larger features | overlaps `spec-first` + `plan-checker`; suggest one of them | community |
| release | claude-release | plugin directory | "claude-release" | versioned releases, GitHub releases | works with `deploy-verify` | community |
| release | Cyberine ReleaseGuard | plugin directory | "Cyberine ReleaseGuard" | publishing packages/artifacts | works with `release-guard` (leak checks) | community |
| media | hyperframes-animation, motion-graphics | skills.sh | `heygen-com/hyperframes` (~1.0M / ~510K) | motion / effects in trailers | `trailer` renders with these | vendor |
| media | review-animations, animation-vocabulary | skills.sh | `emilkowalski/skills` | UI motion polish | optional | community |
| media | Tweenkit, animation-studio | plugin directory | "Tweenkit", "animation-studio" | kinetic videos, coded animation | optional | community |
| 3d | parallax-threejs | plugin directory | "parallax-threejs" (Three.js/GLSL debugging, visual regression) | Three.js / shaders found | replaces `screen-matrix` for 3D scenes | community |
| 3d | PlayCanvas | plugin directory | "PlayCanvas" | PlayCanvas found | optional | vendor |
| games | Unity | plugin directory | "Unity" | Unity project found | optional | partner |
| meta | find-skills | skills.sh | `vercel-labs/skills` → `find-skills` (~4.3M) | searching for more skills | used by `/fullship:recommend` | partner |
| meta | skill-creator | skills.sh, built-in | `anthropics/skills` → `skill-creator` | writing new skills | for fullship development | official |

## Not recommended by default (irreversible actions)
Ad-buying and auto-posting plugins (for example Hyper Marketing, AdWhispr, Social media studio). List them only when the user asks for that area, marked "irreversible actions: spends money / posts publicly".
