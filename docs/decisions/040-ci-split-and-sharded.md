# 040. CI in parallel jobs, e2e sharded by recorded time

Date: 2026-11-17

Status: accepted

## Context

CI ran validate as one job: checks, build, every browser test and Lighthouse in a row, on every pull request, whatever it touched.

## Decision

`checks`, `plan`, `e2e` and `lighthouse` are separate jobs. `scripts/e2e-plan.mjs` lists the suite, and on a pull request keeps only the specs whose pages reach a changed file through the import graph. A change outside that graph runs everything; a change the site never reads runs nothing. It bin-packs the kept tests into up to four shards by recorded time. Each `main` run uploads `e2e-timings-<n>`; the next plan reads the latest ones and falls back to `tests/e2e/timings.json`. The scaffold job is unchanged.

## Consequences

A docs-only pull request spends about two runner minutes. A full run spends more runner minutes than the single job did, because each shard installs and builds, in exchange for less wall time. The shard count follows the suite: under a minute of tests stays one shard. Revisit if the import graph misses a dependency (a test that should have run and did not).
