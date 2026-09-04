# 011. TypeScript pinned to 6.x

Date: 2026-09-03

Status: accepted

## Context

TypeScript 7 shipped in July 2026 on the Go-native compiler. `@astrojs/check` 0.9.10 still peers `^5.0.0 || ^6.0.0`, and the Astro language server is on the same range. Stay on the major the checker supports.

## Decision

`typescript` pinned at 6.0.3. Renovate may move patches and minors within 6.x. A major update is held until the checker's peer range includes 7.

## Consequences

`astro check` keeps working on every clone. When the peer range moves, bump TypeScript, run `bun run validate`, and supersede this record.
