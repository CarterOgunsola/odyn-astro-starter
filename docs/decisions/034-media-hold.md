# 034. A media hold before the reveal

Date: 2026-09-04

Status: accepted

## Context

The conductor waits for engine chunks before it reveals a page, but not for images. A hero that decodes a frame after the curtain lifts is the one flash the transition exists to prevent. So: a media readiness hold, and a small preloader a heavier loader (textures, models) can extend so every loader reports the same way.

## Decision

`@odyn/engines` exports `mediaHold(root, cap)`: it decodes every `img[data-critical]` and `img[fetchpriority="high"]` under the root and resolves when they are decoded or at the cap, whichever first, and resolves at once when there are none. `src/app.ts` registers it as a conductor hold after every swap, capped at 1.5 seconds. The same module exports `Preloader`: items added as functions, run in parallel, progress reported in settle order, errors counted and never thrown, `abort()` resolving early. The gl add-on's texture loader extends it.

## Consequences

An author marks the one or two images the reveal must not land ahead of and nothing else; everything unmarked loads as before. The cap keeps a slow image from stalling a client navigation; on a hard load the browser's own load event has already waited for the image, so the hold resolves at once there. What to watch: `data-critical` on every image, which turns the hold into a page-wide wait and the cap into the norm.
