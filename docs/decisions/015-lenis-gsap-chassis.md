# 015. Lenis and GSAP are chassis

Date: 2026-09-03

Status: accepted

## Context

A smooth-scroll instance needs start, stop and destroy, and GSAP registered once. One frame clock. Lenis or its descendants are in every studio starter and GSAP in most.

## Decision

`lenis` and `gsap` are runtime dependencies. `src/lib/gsap.ts` is the import for all app code and registers no plugin (amended below). Packages import `gsap` as a peer, which resolves to the same instance. `src/lib/scroll.ts` creates one Lenis instance, persisted across swaps, ticking on `Frame` at priority 10 and feeding ScrollTrigger. Stop and start are reference-counted so the conductor and an overlay compose. `destroy()` returns the page to native scrolling; `state` and `on()` are the store.

## Consequences

There is exactly one rAF loop. A page module never calls `requestAnimationFrame`. It subscribes to `Frame`. The scroll classes Lenis stamps on `<html>` are re-stamped after each swap because the router replaces them.

## Amended 2026-09-04

ScrollTrigger, Flip and CustomEase are no longer registered in the chassis. Nothing in it used ScrollTrigger or CustomEase, and the toggle's slide is a measured FLIP on the Web Animations API. The three plugins were a third of the main chunk's gzip weight (audit 2026-09, P5). A project registers the plugin it needs in `src/lib/gsap.ts`, once, and feeds ScrollTrigger from `Scroll.on()`; it ships only then.
