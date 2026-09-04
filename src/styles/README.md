# src/styles

The SCSS foundation, vendored on purpose because every project retunes it. `global.scss` is the only global entry. It emits the token layers in order (scale, color, radius, tokens), then the reset, then calls the type and layout mixins once; the easing curves come from `src/config/easing.ts`, inlined by the layout, so CSS and GSAP share one table. `bun run check:tokens` proves nothing referenced is undeclared and nothing declared is unused. Partials resolve from this folder, so a component writes `@use "type" as t;` and gets `@include t.text(h2)`.

Fixed sizes come from the `--s-*` scale. Fluid sizes come from `f.fluid(min, max)` between the two design widths in `_fluid.scss`. Colour comes from `_color.scss` (the value gate is in its header). Component styles stay scoped in their `.astro` files. Nothing here hides content. `_reveal.scss` and `_conductor.scss` only provide masks and the panel. Visibility is driven inline by the packages.
