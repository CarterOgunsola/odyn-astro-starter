# 025. Playwright smoke and Lighthouse in CI, no Vitest

Date: 2026-09-03

Status: accepted

## Context

The build is the test. CI builds the starter on every push and runs one smoke against the built output. Lighthouse runs with it. The dependency count is capped, and Astro's Container API for component tests is still experimental, so a unit runner would test very little the smoke does not.

## Decision

`@playwright/test` runs `tests/e2e/smoke.spec.ts` against `astro preview` of the built `dist`. Home loads and the conductor reaches idle, a client navigation covers, swaps and reveals with the lazy engine mounted, and the 404 serves. Lighthouse runs in CI through a GitHub action against `dist` with thresholds in `.lighthouserc.json`, adding no dependency. Vitest is not installed.

## Consequences

What CI tests is what deploys. A package with pure logic that deserves unit tests can add Vitest at that point and record it. The smoke test is also the starter's contract check for the conductor.

## Amended 2026-09-03

The frame clock earned the first unit tests. They run under `bun test` (no new dependency, Bun is already the script runner) from `tests/unit/`, inside validate. Vitest stays out until a test needs Vite's transform pipeline. A scaffold proof (`tests/scaffold/`) runs `init --no-example` on a copy of the tree and validates the result; it has its own script and CI job because it is slow.

## Amended 2026-09-04

The Playwright suite runs inside validate (`bun run test:e2e`, after the build) behind a check for Google Chrome, since the config uses the installed Chrome channel. Without Chrome the step prints why it was skipped and validate stays green, except under `CI`, where a missing Chrome fails. One command is the whole check.
