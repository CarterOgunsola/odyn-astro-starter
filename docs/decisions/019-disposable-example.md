# 019. The example route is disposable

Date: 2026-09-03

Status: accepted

## Context

Every framework's official template ships an example meant to be deleted ("Seasoned astronaut? Delete this file"), and documentation baked into the app is the thing that then has to be removed. The rule is exactly one example route that demonstrates every chassis primitive, marked for deletion, with nothing importing from it.

## Decision

`src/pages/example.astro`, `src/lib/example-engine.ts` and its entry in `src/lib/engines.ts`, its tune board, the proofs that drive the route, the plate image, the home link, and the manual notes under `src/content/notes` (decision 032) are the example. The route is `noindex` and filtered from the sitemap. `scripts/init.mjs --no-example` removes them. The README names them under "the example".

## Consequences

The build and the smoke test both exercise the primitives through this page, so the starter proves itself. Deleting the example leaves a home page, a notes listing and a 404, which is a real site's skeleton. Nothing in the chassis imports from the example.
