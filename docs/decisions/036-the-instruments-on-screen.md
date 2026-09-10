# 036. The instruments on screen: the pill-slider tune panel and the telemetry strip

Date: 2026-09-10

Status: accepted

## Context

The first tune panel was a stack of range inputs in a box. Tuning a scroll-driven site all day showed its limits: no
grouping, no units, no way to type a value, a jump on every press, and the numbers that matter (frame rate, frame
cost, what the engine is doing) living in the console. Carter's other site grew a better panel from three references
and a habit of watching numbers on a strip at the top left.

## Decision

`packages/devkit/src/tune.ts` replaces the panel: each dial is one rounded row whose fill is the value, a drag anywhere
scrubs relative to the value (Alt for a tenth), arrows step, the readout is typed, a double-click resets one dial. Rows
come in collapsible groups remembered per tab, a find field filters, the head holds SAVE (decision 035), COPY of only
what moved, ALL and RESET, and drags the panel. Rows take `unit`, `hint` and `kind: "toggle"`. `hud.ts` adds the
telemetry strip: chips top left for time, fps, frame cost, memory, largest paint, viewport and the GL stage, plus
`Hud.watch(label, reader)` for an engine's own readings; Shift+H hides it, `?hud=off` keeps it away. Both instruments
speak one vocabulary: rounded squares, sans labels, mono values, the `::` separator. `sampler.ts` is the one outside
clock (decision 016) that the perf probe and the strip now share. Icons are inlined so the package stays free of the
site. Everything stays behind `import.meta.env.DEV`.

## Consequences

A dial changed at eleven at night is still grouped, named and saved in the morning. An engine's state is readable at a
glance during a scroll instead of in a log. The devkit grew by two files; the production bundle did not. Revisit when
a project needs a second kind of dial (a colour, a curve) or when the strip wants a second row.
