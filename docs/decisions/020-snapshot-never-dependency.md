# 020. A snapshot, never a dependency

Date: 2026-09-03

Status: accepted

## Context

No JavaScript starter author offers a sync path from starter to project, and the one that tried ships a manual-merge caveat. The evolution discipline that works is tags, a changelog, a definition of breaking, and a recorded starter commit inside each project (Epic Stack, satus). Here they are gates.

## Decision

The starter is a GitHub template repository, also cloneable with `giget`. `scripts/init.mjs` writes `{ name, ref, head, date }` into `package.json` under `starter` at scaffold time so the diff against the starter is always possible. Releases are tagged. `CHANGELOG.md` follows Keep a Changelog. Breaking, for a starter, means a removed primitive or a restructured directory (major). A new primitive is a minor. A fix or dependency bump is a patch. No long-term branches.

## Consequences

A project never depends on the starter at runtime and never merges from it automatically. Improvements travel by hand, helped by atomic history, or back upstream by pull request (024). Each major ships a note in `docs/migrations`.

## Amended 2026-09-04

`init --handoff` keeps `.github/workflows/ci.yml`. Workflows could count as personal tooling, but the workflow here is the project's own pipeline (install, validate, Lighthouse) and the client inherits it with the repository. What leaves at handover is the agent files, the upstream notes and Renovate.
