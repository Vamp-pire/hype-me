# Design resources

Last checked: 2026-11-09

The user's chosen starting set (2026-11-09). Agents use it as a default, not a fixed list:
add or drop a resource only when the project clearly needs it, and say why in one line.
Licence notes are as known on 2026-11-09 — confirm on the site before shipping commercial work.

| resource | what it is good for | use when | licence / terms note |
|---|---|---|---|
| Stitch (Google) | AI tool that drafts UI screens and exports code/designs | quick first drafts of a landing page, store page mock, in-game menu screens | Google Labs product; check its terms for generated output |
| Tailwind CSS | utility-first CSS framework | building or restyling a landing page / web game UI fast | MIT |
| Bootstrap | ready-made CSS components and grid | simple, safe-looking pages with little custom design | MIT |
| shadcn/ui | copy-in React components built on Tailwind | React landing pages, dashboards, settings screens | MIT (code is copied into your project) |
| Framer Motion (now "Motion") | animation library for React/JS | small motion on landing pages, result reveals, share moments | MIT |
| Mobbin | library of real app/web screenshots and flows | references: how successful apps lay out onboarding, store-like pages, paywalls, share screens | paid tiers; references only, do not copy others' artwork |
| getdesign.md (https://getdesign.md) | 550+ DESIGN.md files describing real sites' design (colours, type, spacing, components), made to hand to an AI coder; follows Google's DESIGN.md spec. Run by the VoltAgent team | giving a landing page or store page a coherent look "in the style of" a known site, or writing the project's own DESIGN.md | public DESIGN.md files are free to use in projects (terms, Aug 2026); not official files of the listed companies; paid kits may not be redistributed |
| Google Material Symbols / Icons (in Google Fonts) | icon set, variable icon font | UI and landing icons, consistent style | Apache 2.0 |
| Google Fonts | web fonts, including Korean ones such as Noto Sans KR | readable text on pages and thumbnails | mostly SIL Open Font License; check each font |

## Gaps the agent may fill only when needed
These are not in the default set. Suggest one only when the task needs it and the default set cannot cover it, and say why:
- **Game art and sound assets** (sprites, SFX, music) — needed for trailers, store screenshots or in-game polish. Check commercial-use licence per asset.
- **Store asset templates** (Steam capsule, app store screenshot frames) — needed for store pages.
- **Mockup generators** (devices, browser frames) — needed for share images and press kits.
- **Local-market references** — e.g. Korean-language typography for Korean-targeted thumbnails.

## How agents use this file
1. Start from the table above for any design request.
2. Match by "use when"; prefer what the project already uses (check `package.json`, existing CSS).
3. Mention the licence note whenever an asset ends up in a shipped product.
4. Never download or install anything without the user's yes.

