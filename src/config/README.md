# src/config

The one config surface (decision 018) and the one easing table.

`site.ts` holds every site-wide value and names, on each key, the file that reads it. `easing.ts` holds the curves: the layout inlines them as `--ease-*`, the app registers them with GSAP as `house.*`, and `bun run check:tokens` proves nothing here is unused.
