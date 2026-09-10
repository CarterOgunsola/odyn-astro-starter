# gl

The WebGL add-on. Installed with `bun run add gl`, which adds `three` and its types, copies the files below into the project, places `<GlStage />` in the layout after the header, and writes the decision record.

- `src/lib/gl/stage.ts`: the `Gl` global. One persistent canvas, one renderer, the Frame clock at priority 30. three.js loads lazily on the first page that carries `[data-gl]`.
- `src/lib/gl/gate.ts`: off without WebGL2, under reduced motion, `saveData`, low device memory, or `?gl=off`. Off means the DOM shows as-is.
- `src/lib/gl/planes.ts`: the identity registry. `data-gl="plane" data-id="…"` on an element gives it a plane that follows its rect every frame. Built on page mount, disposed on the swap.
- `src/lib/gl/textures.ts`: the chassis `Preloader` with three's loader underneath, registered as a conductor hold so the curtain waits for textures.
- `src/components/GlStage.astro`: the canvas, fixed behind the page, persisted.

After installing, register the two hooks in `src/app.ts` (the script prints them), mark an image, and run `bun run validate`.

The files here carry a `.tpl` suffix so the starter itself never type-checks against a package it does not install.

## Proof

Installed on a copy of the starter with the example plate marked `data-gl="plane" data-id="plate"` and the two hooks registered: `astro check` clean, the token check clean, three.js a separate 182 KB gzip chunk fetched only on the plane's page, `html[data-gl]` reads `on` there and `idle` after navigating to a page without planes, the marked image hidden only while its plane draws, and `?gl=off` leaving the DOM untouched. Write that check as the project's own e2e once a real page carries a plane.

An engine that draws its own thing on the stage (a frame sequence, a shader) calls `Gl.attach(el, make)`: `make(three)`
returns a mesh, the stage adds it and keeps it on `el`'s rect every frame like a plane, and the returned `detach()` removes
it. The engine owns its material and geometry; the registry disposes only what it made. Resolves null when the stage is
off, so the engine falls back to a 2D surface.
