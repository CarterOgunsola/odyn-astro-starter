# 002. Bun installs and runs scripts, Node is the reference runtime

Date: 2026-09-03

Status: accepted

## Context

The house uses Bun for speed, but Astro's own docs still describe Bun as a runtime with "rough edges", and running Astro on Bun's runtime needs `bunx --bun`. Installer and script runner yes, reference runtime no.

## Decision

Bun is the package manager (`bun install`, `bun.lock`, workspaces) and the script runner (`bun run dev`). Node is the runtime the scripts execute in, pinned by `.node-version` (24, the active LTS) and checked in CI, where the workflow installs Node first and then Bun.

## Consequences

Local and CI behave the same way because both resolve `astro` to a Node binary. A contributor without Bun can still run everything with npm, since nothing depends on Bun-only APIs. If Astro's Bun guidance changes to full support, this record can flip to Bun-first with one line in CI.
