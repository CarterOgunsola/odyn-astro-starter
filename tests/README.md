# tests

Three kinds of test, each in its own folder.

`e2e/` is Playwright against `astro preview` of the built `dist`, so what CI tests is what deploys. `smoke.spec.ts`: the home page loads and the conductor reaches idle, a client navigation covers, swaps and reveals with the lazy engine mounted, the 404 page serves. `conductor.spec.ts`: the transition contract, the chrome lift, a slow engine chunk under the curtain, a click during the previous page's cascade tail (both hops land with nothing hidden), the line splitter. `media.spec.ts`: the curtain waits for a critical image. `scroll.spec.ts`: the scroll store. `small-screens.spec.ts`: every control reachable at 320 and 390, the skip link. `theme.spec.ts`: the toggle, the pill, theme-color, persistence.

`unit/` is `bun test`, inside validate, for pure logic: the frame clock, the easing table, the preloader, the tune middleware's parser.

`scaffold/` is `bun test` on copies of the tree in a scratch directory: `init --no-example` then a full validate, `init --handoff` then validate, `add gl` then check and lint, and the five refusal cases of `init`. Slow, so it has its own script and CI job.

Run them with `bun run build && bun run test`, `bun run test:unit` and `bun run test:scaffold`. Add a test here when a chassis contract changes shape. Page-level behaviour of a real site belongs in that site's own suite.
