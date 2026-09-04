# 009. The clamp school for fluid sizing

Date: 2026-09-03

Status: accepted

## Context

One CSS school, recorded with its design widths. Two are in use. The vw school (satus, where every px becomes a proportion of the viewport against 375 and 1440 frames, one breakpoint at 800) and the Utopia school (Locomotive, clamp scales between a min and max viewport). The house `_fluid.scss` already interpolates with `clamp()` between two frames, which is the second school with its own function.

## Decision

The clamp school. `f.fluid(min, max)` interpolates between the 375 and 1440 design widths, bounds in rem and the preferred term in vw. Fixed sizes come from the `--s-*` scale. Fluid sizes are authored at the point of use. Breakpoints are added by content, not by a device ladder. Grid tokens (`--margin`, `--gutter`, `--container-max`, `--measure`, `--columns`) are custom properties that both the layout and the dev grid read.

## Consequences

Type and spacing respect user zoom because the bounds are rem. A project that prefers proportional comps can swap `_fluid.scss` for vw functions without touching the type roles. The two design widths are the one place a project retunes its frames.
