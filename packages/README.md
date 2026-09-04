# packages

The engines, as workspace packages the root consumes with `workspace:*`. Each exports TypeScript source from `src/index.ts`. Vite bundles linked packages as source, so there is no build step.

- `@odyn/lifecycle`: the two module tiers, `safe()`, `onDestroy` and `runDestroy`, the one `Frame` clock, the resize hub, `createApp()`.
- `@odyn/conductor`: the transition contract on Astro's router events, holds, the reveal clock, the safety rails, and the `Leg` interface with a plain wipe.
- `@odyn/engines`: the lazy engine registry with prefetch and the swap token; `mediaHold()` (critical images decoded before the reveal, registered by the app as a conductor hold after every swap) and the `Preloader` a texture or model loader extends.
- `@odyn/reveal`: markup-driven entrances and the line splitter.
- `@odyn/devkit`: grid overlay, tune panel, perf probe. DEV only.

A package has a stable API and a consumer on every page. Anything still changing shape stays in `src/lib`. A package leaves for its own repo when a third consumer exists (decision 012).
