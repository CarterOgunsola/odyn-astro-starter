# AGENTS.md

Canonical instructions for coding agents and contributors. `CLAUDE.md` points here. Keep this file short. The detail lives in the per-folder READMEs mapped at the end.

## What this is

A personal Astro starter for experiential sites. Static output, vanilla TypeScript, SCSS, GSAP, a page-transition conductor, lazy engines, a Cloudflare Worker deploy. No client framework, no Tailwind, no CMS in the chassis. Read `docs/principles.md` first. It decides what goes in.

## Run

```
bun install                 # no account, no key needed
bun run dev                 # http://localhost:4321
bun run dev:worker          # the /api/* Worker on :8787 (dev proxies to it)
bun run validate            # typecheck + lint + format + tokens + unit tests + build + e2e: must be green
bun run format              # rewrite what format:check complains about
bun run test                # the Playwright suite alone, against the built site
```

Agents: start the dev server detached and read its state from the lock file instead of holding a terminal.

```
astro dev --background      # writes .astro/dev.json (url, port, pid)
astro dev status | logs | stop
```

`bun run validate` before finishing any change. Never commit without it green.

## Where things go

| Path | What belongs | What does not |
|---|---|---|
| `src/config/site.ts` | every site-wide value, consumer named in a comment | a second config file |
| `src/app.ts` | registrations only: globals, pages, engines | behaviour |
| `src/lib/` | page modules, engines, the scroll and theme singletons | anything a package already does |
| `src/styles/` | tokens, ladders, mixins, base elements | component styles (those are scoped in the component) |
| `src/components/`, `src/layouts/` | Astro components with scoped SCSS | client logic (put it in `src/lib`) |
| `packages/*` | engines with a stable API (lifecycle, conductor, engines, reveal, devkit) | project-specific code |
| `worker/` | the `/api/*` Worker | rendering |
| `docs/decisions/` | one record per dependency and convention, removals included | notes without a decision |

## The lifecycle (do not bypass)

- **Global tier** (`app.ts` globals): init once at boot, `onRoute` re-sync per page, never destroyed. For persistent chrome only.
- **Page tier** (`app.ts` pages, `src/lib/*.ts`): `init()` on every page load. Register every listener, observer, frame, timer and tween for teardown with `onDestroy()` from `@odyn/lifecycle`. `bun run new module <name>` writes one; register it in `app.ts` under `pages` as `{ name, mount: () => X.init() }`.
- **Custom elements** (`bun run new element <name>`): per-instance logic uses `connectedCallback` / `disconnectedCallback`. Import the file once from `app.ts` (`import "@/lib/elements/<name>"`) and use the tag in markup; find instances with `all()` or `byId()` from `@/lib/elements`.
- **Engines** (`bun run new engine`): heavy modules load only on the page that carries their root, register `Conductor.hold()`, draw on `Frame.add()`, arrive on the `conductor:reveal` event.
- **Entrances** are classes on markup (`z-y`, `z-s`, `z-o`, `z-x`, delay suffixes). Never write a bespoke entrance tween in a page module.
- **One clock**: `Frame.add(fn, priority)` from `@odyn/lifecycle`. Never start a second `requestAnimationFrame` loop (the devkit's sampler is the one exception, decision 016: the perf probe and the telemetry strip measure the clock from outside, on one shared loop). One resize hub: `onResize({ read, write })`, never a ResizeObserver or window listener of your own.

## Conventions

- Imports: `@/` for `src`, package names for `packages/*`. GSAP always from `@/lib/gsap` in `src`.
- Data hooks: `data-<thing>` on the root an engine or module binds. Never bind by class.
- SCSS: `@use "type" as t;` then `@include t.text(h2)`. Sizes from `--s-*`, fluid values from `f.fluid(min, max)`. No magic numbers.
- Colour: only tokens from `_color.scss`. Surfaces at the value extremes, ink at 7:1, the spot colour marks and never decorates.
- Motion: shows long ease-out, hides short ease-in at about half the show, exits continue their direction. Durations inside 0.6 to 1.4 s for transitions.
- Copy: no em dashes. The house separator in UI copy is `::`.
- Mono: only for code and literal values (`<code>`, commands, versions, the debug readout). Labels, dates, nav and headings are sans, in the caption or tag role. Mono as a small-data-label style is the generic tell. Do not.
- Dependencies: the chassis stays at twenty entries, fifteen of them external. Adding one needs a decision record.
- Vendors: none in the chassis. A CMS, mail, analytics or auth is an add-on with a flag and a mock.

## Forbidden

- `any`, non-null assertions outside the packages, `../../` imports.
- A second router, a second frame loop, a second config file, a second Markdown pipeline.
- Hiding content in shipped markup (the reveal system hides at mount, under the curtain).
- `preventDefault` on `astro:before-preparation` (Astro's cancel path there is a hard load; guard clicks at the capture phase instead).
- Shipping `@odyn/devkit` outside `import.meta.env.DEV` without a decision record.
- A file named `src/fetch.ts`. Remark or rehype plugins without switching the processor.

## When you change a file that came from the starter

Open the pull request against `odyn-astro-starter` in the same session, or add a line to `docs/upstream.md` with the file, the change and the reason. The starter is a snapshot. Improvements flow back by hand.

## Documentation map

- `README.md`: clone to deploy, the example, what is not included, maintenance
- `docs/principles.md`: the six lines
- `docs/decisions/`: why each dependency and convention exists
- `docs/migrations/`: notes for projects born from a previous starter major
- A README in every folder: `src/lib`, `src/styles`, `src/components`, `src/config`, `src/content`, `src/icons`, `src/assets`, `src/layouts`, `src/tune`, `src/pages/_README.md` (underscored so Astro does not route it), `packages`, `worker`, `scripts`, `tests`, `docs` (which also describes `public/`, served verbatim)
- `docs/add-ons.md`: where each absent thing lives and how it comes in
