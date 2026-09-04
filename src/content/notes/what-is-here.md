---
title: "What is here"
description: "The layers of the chassis and where each one lives."
date: 2026-09-04
---

The chassis, layer by layer.

- **Lifecycle** in `packages/lifecycle`: globals and pages, `onDestroy`, `Frame` (the one clock), `onResize` (the one hub).
- **Transitions** in `packages/conductor`: guards, holds, an honest cover, the `conductor:reveal` clock, safety rails, a plain wipe leg with the mark.
- **Lazy engines** in `packages/engines`: load by root, prefetch at intent, a swap token, the media hold.
- **Entrances** in `packages/reveal`: the `z-y`, `z-s`, `z-o` and `z-x` classes and a resize-safe line split.
- **Instruments** in `packages/devkit` and `src/tune`: the grid overlay (Shift+G), the tune panel (`?tune=`, SAVE writes `src/tune/<name>.json`, the engine's defaults), the perf probe (`?perf`). Development only.
- **Foundations** in `src/styles`: the size scale, the fluid clamp, radii, colour, type roles, layout, base elements. The easing table sits in `src/config/easing.ts`.
- **Shell** in `src/layouts/Base.astro` and `src/components`: fonts, theme, the SEO head, the header with its `<theme-toggle>`, the footer, the panel.
- **Content** in `src/content.config.ts`: one collection, Sätteri Markdown, no plugins.
- **Deploy** in `wrangler.jsonc` and `worker/`: Workers static assets and `/api/health`.
- **Discipline** in `docs/`, `.github/workflows/ci.yml` and `renovate.json`: principles, decisions, CI, the dependency bot.
