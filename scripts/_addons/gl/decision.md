# NNN. three.js, as the gl add-on

Date: DATE

Status: accepted

## Context

This project has a scene: something the DOM cannot draw. The chassis ships without three.js (decision 033) and the add-on installs it by script, so the choice is recorded here, in the project, on the day it was made.

## Decision

`three@THREE_VERSION` is a runtime dependency; `@types/three` a dev one. `src/lib/gl/` holds the stage (one persistent canvas behind the page, one renderer, drawing on the Frame clock at priority 30), the gate, the plane registry and the texture loader. `src/components/GlStage.astro` sits in the layout after the header, persisted across swaps.

The gate keeps the stage off, and the DOM as-is, without WebGL2, under reduced motion, under `saveData`, under 2 GB of device memory, or with `?gl=off`. three.js is imported only on the first page that carries `[data-gl]`.

The DOM-sync contract: an element marked `data-gl="plane" data-id="…"` is the truth. Its plane takes the element's rect every frame, the element goes invisible only once its plane is built, and the swap disposes every plane, material and texture the page made.

## Consequences

One scene system, one canvas, one context. A page with no `[data-gl]` stops the loop. What to watch: a page that marks hundreds of planes (the per-frame rect reads want caching then), and any scene code that reaches around the registry to keep its own meshes alive across a swap.
