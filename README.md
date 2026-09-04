# odyn-astro-starter

A personal Astro starter for experiential sites. It is the code I keep from every project. The transition conductor, lazy engines, a markup-driven reveal system, one frame clock, SCSS tokens and type ladders, the SEO head, a Cloudflare Worker deploy, and the instruments I tune all of it with. It is not a design, a CMS or a framework.

Born from Astro `minimal`. Read `docs/principles.md` before adding anything.

## From clone to deploy

1. **Scaffold.** Use this template on GitHub, or clone without history:

   ```
   bunx giget@latest gh:CarterOgunsola/odyn-astro-starter my-site
   cd my-site && bun install && bun run init
   ```

   `bun run init` renames the project, writes the starter stamp (`starter.ref`, `starter.head`, `starter.date` in `package.json`), removes the starter's own changelog, migrations and license (the MIT notice moves to `THIRD-PARTY-NOTICES.md`), and gives the project a fresh git history (`--keep-history` keeps it). It refuses to run on a dirty tree, on unpushed commits, or under the starter's own name. Add `--no-example` to delete the example route, its engine, the proofs that drive it and the manual notes at the same time.

2. **Run.** `bun run dev` for the site, `bun run dev:worker` for `/api/*` alongside it. No account or key needed.

3. **Configure.** Edit `src/config/site.ts` (URL, name, nav, socials, theme default, feed). Every value names what reads it. Replace `public/og-default.png` and `public/favicon.svg`.

4. **Prove it.** `bun run validate` (typecheck, lint, format check, unit tests, build, then the Playwright suite against the built site) green before the first commit of real work.

5. **Deploy.** Create the Worker on Cloudflare with the same name as `wrangler.jsonc` and run `bun run deploy`, or connect the repo to Workers Builds for git deploys and preview URLs. The platform serves the static assets. The Worker runs only for `/api/*`.

## The example

`src/pages/example.astro`, `src/lib/example-engine.ts`, the `ExampleEngine` entry in `src/lib/engines.ts`, and the notes in `src/content/notes/` show every chassis primitive. The notes are this README's sections, so the content pipeline is proven on the manual itself. The example route is `noindex`, out of the sitemap, and nothing imports from its engine except the registry entry that lazy-loads it. When the real site starts, run `bun run init --no-example`: it removes the route, the engine and its tune board, the registry entry, the proofs that drive the route, the plate image, the home link and the notes, and validate stays green. Deleting by hand means deleting that same list.

## Reading budget

The chassis alone (`src/`) is under three thousand lines of TypeScript, Astro and SCSS, an hour's read. With the packages, the scripts, the Worker and the tests it is under five thousand. `bun run count` prints both numbers; the numbers in this paragraph are rounded up so they stay true for a while. Growth is paid for by removal.

## What is here

| Layer | Where | Notes |
|---|---|---|
| Lifecycle | `packages/lifecycle` | globals and pages, `onDestroy`, `Frame` (one clock), `onResize` (one hub) |
| Transitions | `packages/conductor` | guards, holds, honest cover, the `conductor:reveal` clock, safety rails, a plain wipe leg with the mark |
| Lazy engines | `packages/engines` | load by root, prefetch at intent, swap token, the media hold and preloader |
| Entrances | `packages/reveal` | `z-y`, `z-s`, `z-o`, `z-x` classes, resize-safe line split |
| Instruments | `packages/devkit`, `src/tune` | grid overlay (Shift+G), tune panel (`?tune=`, SAVE writes `src/tune/<name>.json`, the engine's defaults), perf probe (`?perf`), development only |
| Foundations | `src/styles`, `src/config/easing.ts` | tokens, size scale, fluid clamp, radii, colour, type roles, layout, base elements, one easing table for CSS and GSAP |
| Shell | `src/layouts/Base.astro`, `src/components` | fonts, theme, SEO head, header, footer, the panel |
| Content | `src/content.config.ts` | one collection (the manual as notes), Sätteri Markdown, no plugins |
| Deploy | `wrangler.jsonc`, `worker/` | Workers static assets, `/api/health` |
| Discipline | `docs/`, `.github/workflows/ci.yml`, `renovate.json` | principles, decisions, CI, dependency bot |

## Not included, by design

No CMS, mail, analytics, auth, comments or payments. No three.js. No Tailwind. No React or islands. No i18n. Each one is an add-on for the project that needs it, with a flag, a mock where a service is involved, and a decision record. `docs/add-ons.md` names where each one lives and the steps to bring it in; the GL add-on installs with `bun run add gl`. The paper behind these choices is `docs/research/project-starters.md`.

## Generators

```
bun run new module <name>     # a page-tier module
bun run new element <name>    # a custom element
bun run new engine <name>     # a lazy engine, registered for you
bun run icon <Name...>        # pull Central Icons into src/icons
bun run add gl                # the WebGL add-on, with its decision record
```

`bun run new engine` also creates `src/tune/<name>.json`, the board the engine boots from.

## Vendored files as a registry

The SCSS foundation, the layout shell, the config, the dev kit and the element skeleton are described in `jsrepo.config.ts` as registry items. `bunx jsrepo add odyn/styles` pulls one into an existing project; `bunx jsrepo update` shows the diff against the current version before it writes. jsrepo is not a dependency of the starter; decision 031 has the build ritual.

## Versioning

Releases are tagged and logged in `CHANGELOG.md`. A removed primitive or a restructured directory is a major. A new primitive is a minor. A fix or a dependency bump is a patch. No long-term branches. A project born from a previous major reads `docs/migrations/`.

## Sending improvements back

A project that improves a file from this starter opens a pull request here in the same session, or logs the change in its own `docs/upstream.md`. The starter only changes by graduation from a real project.

## Maintenance

I maintain this for my own projects. When updates slow down, this section will read: *"This starter is in maintenance. Dependencies move by bot and nothing new is added. Fork it and make it yours."* When it stops: *"This starter is retired as of <date>. It stays as a reference and will not be updated."* Either notice replaces this paragraph the day it becomes true.

## Handover

`bun run init --handoff` strips the personal tooling (the agent files, the upstream log, the registry manifest, the scaffold tests, the icon mirror script, Renovate) and puts `PROD-README.md` in this file's place. Then fill in its placeholders, hand over credentials per environment, and transfer the repo.
