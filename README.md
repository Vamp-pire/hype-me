# fullship

**Ship small web products without the forgotten steps.**
A Claude Code plugin for solo developers and small teams: it plans big changes before building, proves that your checks really ran, confirms the deploy is live, and shows how each release did.

> Status: **0.0.1 early preview** — setup, help, planning mode and recommendations work today; the rest is on the roadmap below. Name is provisional. Plan: [docs/plan.md](docs/plan.md) (Korean).

## Why install it
Claude Code can already write the code. What usually goes wrong on a small product is everything around it:

| without fullship | with fullship |
|---|---|
| A big feature gets built before anyone agreed on what "done" means | Big changes start with a short plan and acceptance criteria you approve (`/fullship:mode`) |
| "It should work now" — but the tests never ran | Your project's own checks run and the answer is a table: `passed 6 · failed 1 · not run 1`, with logs saved as proof |
| Pushed, but is the new version actually live? | The live site is checked for the new build and new pages |
| Mobile layout, English page, privacy policy, a GPL library… forgotten | Release guard flags them before you ship |
| "How did that release do?" means opening five dashboards | Downloads, store users, update pings and site visits per release, side by side |
| "Let's post it somewhere" with no plan, then guessing why it didn't spread | A promo plan: who it's for, the moment people want to share, whether sharing actually loops back, hooks per channel, timing — then the numbers tell you what worked |
| Rebuilding something a great plugin already does | `/fullship:recommend` points you to it, and fullship steps aside when it is installed |

It stays out of the way: nothing is installed, posted, deployed or paid for without your yes, and fullship never overwrites your files.

**Probably not for you if** you already have a full CI/CD pipeline, release dashboards and a team process you like — fullship is aimed at people who do all of this by hand.

## Two commands to remember
1. `/fullship:setup` — once per project. Detects your stack, asks at most 2 questions, sets up your checks.
2. `/fullship:ship` — when you finish a change *(coming in v0.1)*. Or just say "check it".

Stuck? `/fullship:help` shows where you are and the one thing to do next.

Occasionally: `/fullship:mode` (when to plan first: **big changes only** by default, always, or only when asked) and `/fullship:recommend`.

## Roadmap
| | feature |
|---|---|
| ✅ now | setup · help · planning mode · recommendations · session status line |
| 🔜 v0.1 | ship checklist with proof · plans for big changes · live-deploy check · finish notification |
| later | session handoff · before/after output compare · screen matrix (phone/desktop × language × theme) · release guard · free-tier quota warnings · release insights · promo plan (audience, share moments, viral loop, hooks, timing, measurement) · launch post drafts · trailer prep |

## Try it locally
```
/plugin marketplace add D:\fullship
/plugin install fullship@fullship-local
```
Or start Claude Code with `claude --plugin-dir D:\fullship`.

## Layout
```
.claude-plugin/   plugin.json, marketplace.json (local)
commands/         setup, help, mode, recommend
hooks/            hooks.json, session-start.mjs
templates/        config.json, claude-md-section.md
references/       recommended.md
docs/             plan.md
```

License: MIT
