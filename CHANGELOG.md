# Changelog

All notable changes to the starter. The format follows Keep a Changelog. Versions follow semver from the point of view of a project born from the starter.

- **Major**: a primitive removed, a directory restructured, an Astro or Node major.
- **Minor**: a new primitive, package, script or convention.
- **Patch**: fixes, dependency bumps, documentation.

No long-term support branches. A project on an older tag reads `docs/migrations/` and cherry-picks by hand.

## [Unreleased]

### Added

- The telemetry strip: a row of chips fixed top left in development (time, fps, frame cost, memory, largest paint, viewport, GL state) with `Hud.watch(label, reader)` for an engine's own readings, Shift+H to hide, `?hud=off` to keep it away. It shares one outside clock with the perf probe (`packages/devkit/src/sampler.ts`).
- The GL add-on's `Gl.attach(el, make)` and `PlaneRegistry.attach`: an engine's own mesh on the stage, following a DOM rect like a plane.

### Changed

- The tune panel is rebuilt: each dial is one row whose fill is the value, scrubbed relative to the value, typed on click, in collapsible groups with a find field; rows take `unit`, `hint` and toggles. SAVE, COPY (the diff), ALL and RESET in the head. The example engine's dials show the grouped form.

- Renovate opens pull requests only. Nothing automerges; each update is landed by hand. Astro and TypeScript majors wait for dashboard approval.

## [1.0.0] - 2026-09-04

### Fixed

- Watchdogs re-arm on every hold and every drain iteration, so a slow engine chunk can no longer have the curtain torn off it at six seconds.
- Holds are accepted only while covered; a hold taken on an idle page no longer delays the next navigation. Holds and the cap reset on a force clear.
- A cover started after idle no longer kills the reveal timeline that carries the consumers' cascade; mid-reveal it retargets only the panel's own tweens.
- The chrome lift now applies (specificity) and lasts until idle instead of dropping at reveal start.
- The lockout window is the covered window: the page is live when it looks live, and a click during the reveal is a navigation.
- The conductor's second entrance system (`[data-reveal]`) is gone; entrances belong to the reveal package.
- The frame clock iterates a snapshot, so a subscriber that removes itself or adds another mid-tick skips or double-runs nobody.
- The line splitter keeps non-breaking pairs together, measures the content box with fractional widths, splits an inline element wider than the line by word, and never re-splits under a live tween.
- SVG anchors, a missing panel, non-page destinations, traversal focus and a throwing storage read are handled.
- A header-level Content-Security-Policy in `public/_headers` (same-origin, inline scripts and styles allowed, `object-src 'none'`); decision 005 now distinguishes it from Astro's hash policy.
- `.dev.vars.*` and `.lighthouseci/` ignored; the inert `allowScripts` key removed; the Worker's JSON helper sets `nosniff` and a throwing route answers 500 with a shape; Renovate does not automerge minors on 0.x packages.
- `baseUrl` removed from tsconfig (`@/` and `@root/` paths only); the non-null rule is on outside the packages and the tests; the dead exports are gone (`Theme.useSystem`, `Reveal.configure`, `Perf.wrap`); one kebab helper (`scripts/_util.mjs`); no `../../` imports.
- Docs drift fixed at the source: the init description, the example's import claim, the scripts note.
- `init` moves the starter's MIT notice into `THIRD-PARTY-NOTICES.md` before removing the license file; the production README names GSAP's license.
- A reveal's idle callback could fire during the next navigation and park its curtain with the entrances hidden; the app chunk now cancels the CSS failsafe the moment it runs; Back restores the scroll after the new page is measured; a hung engine chunk is forgotten at the cap; the splitter measures an element glued to text.
- The skip link runs in the capture phase and offsets by the header; everything outside the panel is inert while covered; reduced motion zeroes transitions instead of shortening them; standalone links get the hit area; keyboard users keep a ring on the focused heading.
- `init` no longer commits the parked starter history into the client's first commit; the tune middleware refuses cross-site writes, non-JSON, long names and prototype keys; one `SITE.noindex` list feeds the sitemap filter and the robots meta; actions pinned to commits; HSTS; the Worker's method guard and policy.
- Lenis loads in its own chunk (main 35.5 KiB gzip); reveal masks keep descenders at sub-1 leading; the toggle's pill slides under both labels; breakpoints are one map; the GL add-on lints; `bun run release <version>` cuts a release and writes the stamp `init` inherits.
- Every key in `src/config/site.ts` names its consumer, and the web manifest is generated from it (`src/pages/site.webmanifest.ts`) instead of hardcoded in `public/`.
- The scroll singleton has `destroy()`, a store (`Scroll.state`: scroll, limit, velocity, direction, progress), `on()` to subscribe, and a `?debug=scroll` readout.
- The Playwright suite runs inside validate, after the build, behind a check for Google Chrome (skipped with a message where Chrome is missing, required under CI).
- Decisions 026 (`@astrojs/rss`) and 027 (`@astrojs/sitemap`) written; the dependency arithmetic in 010 and 012 corrected; per-package consumers cited.
- `src/pages/README.md` was a route (`/README/`, in the sitemap); it is `_README.md` now.
- Lighthouse runs on the home only, the network dependency tree insight is off, and the example engine root carries a role with its label, so the CI job passes instead of failing on the example page.
- Actions on their current majors (checkout, setup-node, upload-artifact v7), Bun pinned by `.bun-version`, a read-only token, and in-flight runs cancelled on pull requests only.
- `init` refuses before it writes: the starter's own name, a bad `PROJECT_NAME`, a dirty tree, unpushed commits, or a missing git identity when the history is to be replaced (`--force` and `--keep-history` override). The old history is parked until the first commit lands, and the initialised flag is cleared if it does not.
- `init --no-example` strips by href and sentence, never by a styling class, removes the conductor proofs with the route they drive, and fails loudly when a strip finds nothing.
- The generator refuses names that cannot be identifiers and formats what it writes; `icon --help` answers before the mirror is looked for.

### Changed

- One easing table, `src/config/easing.ts`: the layout inlines it as `--ease-*`, the app registers it with GSAP as `house.*`, unused curves are gone. `bun run check:tokens` (inside validate) proves every custom property referenced is declared and every declared one is used, bar the reserved sets, and that every `.text-*` role the markup uses is emitted.
- Only the type roles the markup uses are emitted; a `control` role replaces the toggle's pixel override. The toggle and header read the size scale, a `--hit` token and a z scale instead of numbers.
- `theme-color` follows the paper token on every theme change and every swap.
- The focus ring, the media edge, and the prose leading and tracking are tokens. The container caps at 1440 (the desktop frame); the dev grid reads `--columns`.
- Decision 029 names the browser baseline; the `100vh` fallback is gone and `text-wrap: pretty` is the one progressive enhancement.
- A skip link is the first thing in the body and lands focus on `main` (every page's main carries `id` and `tabindex`); the persistent header handles it because the client router turns an in-page hash into a scroll.
- The brand never wraps; under 32em the toggle takes a second row, right-aligned. Every control is reachable at 320 and 390 (proof in the e2e suite).
- Reduced motion, the CSS half: a global reduce rule; the scroll engine's smoothing off; every engine loop draws one static frame.
- Muted ink clears 7:1 in both themes; the at-rest underline is muted ink (3:1 or better); `code` keeps full ink inside muted text; the lists that lose their bullets carry `role="list"`; the example engine root is a labelled image.
- Back and forward leave focus where the browser put it; the conductor no longer focuses the heading on a traversal.
- The chassis registers no GSAP plugin: ScrollTrigger, Flip and CustomEase are gone from the main chunk (69 KiB to 39 KiB gzip). A project registers what it needs in `src/lib/gsap.ts` and feeds ScrollTrigger from the scroll store.
- The toggle's slide is a measured FLIP on the Web Animations API, interruptible.
- The `image` config block waits for the first image (decision 028).
- The example engine reads its stroke colour once per theme, draws every line in one path at eight pixels a step, and honours reduced motion with a single frame; the engine template has the same shape.
- `favicon.ico` is the 32-pixel entry only.

### Added

- `<theme-toggle>` is a custom element (connected and disconnected callbacks, the FLIP inside); `src/lib/elements` is the tiny manager: `define`, `byId`, `all`. The element template uses it.
- `@odyn/engines` gained `mediaHold()` (critical images decoded before the reveal, registered as a conductor hold after every swap, capped at 1.5 s) and a `Preloader` with progress, error counting and abort. Decision 034.
- `bun run add gl` installs the WebGL add-on: pinned three.js, one persistent canvas behind the page, a gate (WebGL2, reduced motion, saveData, device memory, `?gl=off`), DOM-synced planes built on mount and disposed on the swap, a texture loader that holds the curtain, and the project's decision record. The starter itself stays three-free. Decision 033.
- The tune panel persists: SAVE posts the board to a serve-only Vite middleware (`scripts/vite-tune.mjs`) that writes `src/tune/<name>.json`, and each engine imports its file as the defaults it boots from. `bun run new engine` creates the file. Decision 035.
- `docs/add-ons.md`: where each absent thing lives and the steps to bring it in. The README states the reading budget with the measured line count (`bun run count`).
- The notes collection is the manual: the README's sections as notes, so the content pipeline runs on real content (decision 032). `init --no-example` removes them.
- `jsrepo.config.ts` describes the vendored, house-shaped files as registry items (decision 031). A README in every folder; decision 030 records that the incremental build waits for Astro 8.
- `bun run test:e2e`; a scroll store proof in the e2e suite.
- `bun run test:scaffold`: a project made with `init --no-example` validates green on a copy of the tree, and five refusal cases prove `init` writes nothing when it says no. Its own CI job.
- `bun run test:unit` (Bun) inside validate; four conductor proofs in the e2e suite; a splitter fixture on the example page.
## [0.1.0] - 2026-09-03

First edition.

### Added

- Packages: `@odyn/lifecycle` (two-tier module lifecycle, one frame clock, one resize hub), `@odyn/conductor` (the transition contract on Astro's client router, with a plain wipe leg), `@odyn/engines` (lazy engines by root), `@odyn/reveal` (markup-driven entrances and a resize-safe line splitter), `@odyn/devkit` (grid overlay, tune panel, perf probe, development only).
- Foundations: tokens, size scale, fluid clamp school, easings, radii, monochrome colour system with one spot colour, type roles with leading and tracking ladders, layout mixins, base elements.
- Shell: Fonts API with Geist and Geist Mono (local provider), pre-paint theme and conductor stamps, SEO head with JSON-LD, persistent header with a flip-pill theme toggle, footer.
- Content: one sample collection on Sätteri, a notes listing, an entry page, RSS, robots.
- Deploy: Cloudflare Workers with static assets, a `/api/health` Worker, `_headers` and `_redirects`.
- Discipline: principles, 25 decision records, AGENTS.md and CLAUDE.md, CI (validate, Playwright smoke, Lighthouse), Renovate, init and generator scripts, a client-facing production README.
