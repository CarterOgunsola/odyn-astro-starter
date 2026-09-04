# 035. The tune panel persists to src/tune

Date: 2026-09-04

Status: accepted

## Context

The tune panel (`?tune=<name>`, decision 016) puts an engine's numbers on dials, and COPY hands the board back as JSON to paste into source. In practice the paste step is where taste calls die: the tab closes, the numbers go with it, and the source keeps last week's values. A call made on the dials should survive the session without a hand step.

## Decision

`scripts/vite-tune.mjs` is a serve-only Vite plugin registered in `astro.config.ts`. `POST /__tune/<name>` with a flat JSON object of finite numbers writes `src/tune/<name>.json` (a slug name of 64 characters or fewer, under 16 KB, same-origin, JSON; a bad body is a 400, an oversize one a 413, a cross-site request a 403). The panel gains SAVE next to COPY. Each engine imports its file as the defaults its board boots from; `bun run new engine` creates an empty one. The folder is committed.

## Consequences

A taste call is one press from being in the next commit, and the diff reviews as numbers. The middleware does not exist in a build (`apply: "serve"`), and the JSON import is static, so production carries only the values. The failure mode to watch is a file edited by hand and by SAVE in the same session; the last write wins, and git shows it.
