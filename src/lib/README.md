# src/lib

Site-level modules, the glue between the packages and this site. The GSAP setup (`gsap.ts`, the one place plugins get registered), the scroll instance (`scroll.ts`), the theme switcher (`theme.ts`), the header sync (`header.ts`), the lazy engine registry (`engines.ts`) and the engines it points at. A module here is either a GLOBAL (init once, re-sync per route) or a PAGE module (mount per page, teardown through `onDestroy`), and `src/app.ts` says which.

Anything with a stable API that a second project would want unchanged does not belong here. That is a package under `packages/`. Anything per-element is a custom element (`bun run new element`). The example engine goes when the example route goes.
