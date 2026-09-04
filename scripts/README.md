# scripts

House tooling. Plain Node scripts with no dependencies of their own; `init --no-example`, `new` and `add` run the project's Prettier on what they write.

- `init.mjs`: run once after cloning. Renames the project, writes the starter stamp (`ref`, `head`, `date`) into `package.json`, and strips what belongs to the starter rather than the project. `--no-example` removes the example route and engine. `--handoff` strips personal tooling for a client transfer. That same list is the handover checklist.
- `new.mjs`: the generator. `bun run new module <name>`, `new element <name>` and `new engine <name>` write the house shape from `_templates/`, and an engine gets registered in `src/lib/engines.ts`. Templates live here so they get reviewed with the code.
- `add-icon.mjs`: pulls named icons from a local Central Icons mirror into `src/icons`, normalising fills to `currentColor`.
- `add.mjs`: installs an add-on (`bun run add gl`) from `_addons/`, with its dependency pinned and its decision record written.
- `e2e.mjs`: the Playwright suite inside validate, behind a check for Google Chrome.
- `check-tokens.mjs`: every custom property referenced is declared and every declared one is used; every `.text-*` role used is emitted.
- `vite-tune.mjs`: the serve-only middleware the tune panel's SAVE posts to.
- `_util.mjs`: the one kebab and Pascal helper the generators share.

Anything that runs at build time belongs in `astro.config.ts` or an integration, not here.
