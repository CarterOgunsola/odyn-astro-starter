# 016. Devkit ships behind the DEV flag

Date: 2026-09-03

Status: accepted

## Context

Instruments must never reach production. Both studios that ship a dev grid strip it from the build. The house site ships its grid in production on purpose. That is a project decision, not a chassis default.

## Decision

`@odyn/devkit` is imported only inside `if (import.meta.env.DEV)` branches (in `src/app.ts`, the example engine and the engine template), so Vite tree-shakes the whole package from production. Shift+G toggles the grid, `?tune=<name>` a panel, `?perf` the probe. The panel's SAVE posts the board to a serve-only Vite middleware that writes `src/tune/<name>.json`, the engine's defaults (decision 035). `?debug=conductor` and `?debug=scroll` are part of the conductor and the scroll engine themselves and stay available in production because they are inert without the parameter.

## Consequences

Production bundles carry none of the instrument code. A project that wants the grid in production moves the import out of the DEV branch on purpose and records it. Verify with a bundle grep after any change to `app.ts`.

## Amended 2026-09-04

The perf probe runs its own `requestAnimationFrame` loop on purpose: it measures the one Frame clock from outside, so it cannot ride it. Development only, so the "one loop" rule for shipped code holds.
