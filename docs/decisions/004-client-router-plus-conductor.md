# 004. Astro's ClientRouter plus the conductor, not Swup or Barba

Date: 2026-09-03

Status: accepted

## Context

Every studio Astro build I looked at turns the ClientRouter off and puts Swup or Barba on top with a hand-written App class. The rule is one router with a written stance, whichever it is. The house engine already owned guards, readiness holds and the one reveal clock on Astro's five router events (`astro:before-preparation` through `astro:page-load`), and that engine is what `@odyn/conductor` is extracted from.

## Decision

The ClientRouter stays on with `transition:animate="none"`. The conductor rides its events and owns the choreography. Swup and Barba are not dependencies. The stance is one router, never both.

## Consequences

One dependency fewer, and the router's prefetch, scroll restoration and view-transition fallbacks come for free. Two known costs. Astro's CSP is incompatible with the ClientRouter (005), and attributes on `<html>` are replaced on swap, which is why theme and scroll classes get re-stamped at `astro:after-swap`. Revisit if a project needs Firefox cross-document view transitions or a router feature the ClientRouter cannot offer.
