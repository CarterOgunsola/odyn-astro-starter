# 022. Custom elements for per-instance component logic

Date: 2026-09-03

Status: accepted

## Context

The 2026 answer to the module lifecycle across content swaps is the platform's own. Custom elements with `connectedCallback` and `disconnectedCallback`, so a swap needs no scan step (Locomotive's component-manager does the same). This is the shape for components that own an element, with attribute scanning kept only for elements the author does not control.

## Decision

Per-instance behaviour (an accordion, a marquee, a hover effect on one element) is written as a custom element and registered once. Page-wide behaviour (the reveal system, a page engine) stays in the page tier with `onDestroy` for teardown. `bun run new element <name>` scaffolds the house shape.

## Consequences

Elements clean up when the router removes them, without the app knowing they exist. The page tier remains for anything that spans the page. Astro's docs recommend the same for per-instance logic.
