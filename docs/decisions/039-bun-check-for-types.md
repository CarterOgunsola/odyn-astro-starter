# 039. bun check for types, astro check for templates

Date: 2026-11-17

Status: accepted

## Context

`astro check` typechecks `.astro` files and `.ts` files together on TypeScript 6 and takes most of validate's check time. Bun 1.4.3 ships `bun check`, a TS7-compatible checker that reads the same tsconfig in a fraction of the time but does not read `.astro` files.

## Decision

`bun run typecheck` is `astro sync && bun check --no-script`. `astro sync` writes `.astro/types.d.ts` first so `astro:*` modules and `ImportMeta.env` resolve. `astro check` stays as `check:astro` for the templates. `scripts/checks.mjs` runs sync, types and astro in order, and lint, format, tokens and unit tests beside them. `.bun-version` is 1.4.4.

## Consequences

No new dependency. Type errors in `.ts` arrive in milliseconds; `.astro` errors still arrive from `astro check`. 011 still holds for `astro check`. Revisit when `astro check` runs on TypeScript 7 or `bun check` reads `.astro`.
