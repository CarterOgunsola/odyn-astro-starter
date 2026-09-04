# 013. The conductor owns the contract, the leg owns the skin

Date: 2026-09-03

Status: accepted

## Context

The house transition engine in carter-2026 is one skin, a paper-shader curtain with a counter. What is reusable under it is the contract. Navigation guards, readiness holds with a hard timeout, the one reveal clock every engine times on, the honest cover, the safety rails. That split is the point. Every studio build has a hand-written App class whose visual leg is swapped per project.

## Decision

`@odyn/conductor` exposes the contract and a `Leg` interface (`mount`, `covered`, `park`, `cover`, `reveal`). The default leg is a plain clip-path wipe inside the editorial band. A project passes its own leg to `Conductor.init()`. The paper shader stays in carter-2026 as that site's leg.

## Consequences

A skin can be a fade, a shader curtain or a persistent scene without touching guards or holds. The consumers (`@odyn/reveal`, engines) listen for `conductor:reveal` and insert into the timeline it carries, so curtain and content share one clock. Watch for a leg reaching into the conductor's state. The interface is the whole surface.
