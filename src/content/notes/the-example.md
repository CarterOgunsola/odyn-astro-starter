---
title: "The example"
description: "What the example route shows, and the one command that removes it."
date: 2026-09-04
---

`src/pages/example.astro`, `src/lib/example-engine.ts`, the `ExampleEngine` entry in `src/lib/engines.ts`, its tune board, and these notes show every chassis primitive: entrances, a lazy engine under the curtain, content, the instruments, the type roles.

The route is `noindex`, out of the sitemap, and nothing imports from its engine except the registry entry that lazy-loads it. When the real site starts, run `bun run init --no-example`: it removes the route, the engine and its board, the registry entry, the proofs that drive the route, the plate image, the home link and these notes, and validate stays green.
