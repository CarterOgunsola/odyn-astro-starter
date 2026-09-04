# 001. Astro 7, static output, strict TypeScript

Date: 2026-09-03

Status: accepted

## Context

The starter needs a framework that renders to plain HTML, tolerates vanilla TypeScript without a client framework, and has an additive mechanism (`astro add`) so the chassis can stay thin. As of September 2026 Astro is at 7.3, on a Rust compiler, Rolldown and the Sätteri Markdown pipeline. The current major, static output and a strict tsconfig. A framework-version lock is the risk of building on anything older.

## Decision

Astro 7.3.1 pinned, `output: "static"`, `session: false`, `tsconfig` extending `astro/tsconfigs/strict` with the `.astro/types.d.ts` include, and `engines.node >=22.12.0`. Aliases live only in tsconfig `paths` (`@/*` to `src/*`, `@root/*` to the root).

## Consequences

Nothing renders on demand. Anything that has to run at request time goes through the Worker (003). Invalid HTML fails the build under the Rust compiler, and that is a feature. Astro majors are taken through `@astrojs/upgrade` plus a note in docs/migrations. Revisit when Astro 8 ships, which will also remove the legacy remark config keys.
