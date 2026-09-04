# 030. The incremental build waits for Astro 8

Date: 2026-09-04

Status: accepted

## Context

Astro 7 ships an incremental build behind a flag, keyed by a cache that CI would have to restore between runs. The choice gets made, not left. The starter builds in under three seconds; a project with a few hundred content pages is where the cache starts to pay.

## Decision

Not enabled. The build stays whole. A project that crosses a few hundred pages turns the flag on in `astro.config.ts`, adds a cache restore step to the CI workflow keyed on the lockfile and the content folder, and records it in this file's successor.

## Consequences

CI has no cache to invalidate and no cache key to get wrong. Revisit at Astro 8, where the feature is expected to leave its flag.
