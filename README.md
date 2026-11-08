# fullship

A Claude Code plugin for building, verifying, shipping and growing a small web product end to end.

> Status: **0.0.1 skeleton**. Name is provisional. Plan: [docs/plan.md](docs/plan.md) (Korean).

## Two commands to remember
1. `/fullship:setup` — once per project. Detects your stack, asks at most 2 questions, sets up your checks. Never overwrites files.
2. `/fullship:ship` — when you finish a change *(coming in v0.1)*. Or just say "check it".

Stuck? `/fullship:help` shows where you are and the one thing to do next.

Occasionally: `/fullship:mode` (how much happens on its own; default `manual` = nothing without asking) and `/fullship:recommend` (existing plugins and skills that fit your project; installs nothing by itself).

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
