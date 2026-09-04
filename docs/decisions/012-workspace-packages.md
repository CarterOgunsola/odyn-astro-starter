# 012. Engines as workspace packages

Date: 2026-09-03

Status: accepted

## Context

Anything with a stable API consumed by every page lives in a package, so the app entry is glue. The studio evidence is unanimous. Darkroom, Locomotive and Bizarro extracted their engines and shrank the starter. Packages are consumable without a registry token. The rule of three applies before extraction to a separate repository.

## Decision

Five packages under `packages/`: `@odyn/lifecycle` (tiers, teardown, Frame, resize hub), `@odyn/conductor` (the transition contract), `@odyn/engines` (lazy registry), `@odyn/reveal` (entrances and the line splitter) and `@odyn/devkit` (instruments). The root consumes them as `workspace:*`. They export TypeScript source, which Vite bundles as linked packages. They move to their own repository, published as git-tag dependencies, only when a third consumer exists.

## Consequences

A project born from the starter carries the packages as source, so it can edit them freely and the reverse flow (024) is a pull request. The count is 20 entries by literal count: 6 external runtime, 9 external dev, and the 5 workspace packages. Fifteen external is under the ceiling; the workspace five are the kind of entry the ceiling allows. The failure mode to watch is the wrong abstraction, a package growing flags for one project's needs.

## Amended 2026-09-04

Consumers per package, for the rule of three. `@odyn/lifecycle`: `src/app.ts`, `src/lib/scroll.ts`, `src/lib/example-engine.ts`, `@odyn/reveal`, both generator templates. `@odyn/conductor`: `src/app.ts`, `src/lib/example-engine.ts`, `@odyn/reveal`, the engine template. `@odyn/engines`: `src/app.ts` (`src/lib/engines.ts` imports only its type). `@odyn/reveal`: `src/app.ts`. `@odyn/devkit`: `src/app.ts`, `src/lib/example-engine.ts`, the engine template. One of the five (`@odyn/reveal`) has a single consumer in the tree. They stay packages because the boundary is the point (the app entry is glue) and because a second project born from the starter is the second consumer of all five; a third is the condition for their own repository.
