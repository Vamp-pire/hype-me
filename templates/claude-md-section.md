<!-- fullship:start -->
## fullship
- Settings live in `.fullship/config.json` (mode, modules, checks). Change the mode with `/fullship:mode`.
- "Done" means evidence: name the command you ran and its result. Say plainly what you did not run.
- Behavior-preserving refactors: save the output before, compare after.
- New rules in core logic: write the failing test first.
- Irreversible actions (publishing, posting, emailing, paying, store submissions) always get a preview and a yes first.
- fullship never overwrites your files; it writes `<name>.fullship-new` instead.
<!-- fullship:end -->
