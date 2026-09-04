# 021. Renovate with pins and a release-age floor

Date: 2026-09-03

Status: accepted

## Context

Going stale is the most common reason developers abandon their own starter. The answer is bot-driven dependency updates with pinned versions, a committed lockfile, weekly lockfile maintenance and a minimum release age before automerge.

## Decision

`renovate.json` extends `config:best-practices` and pins all dependencies except peers, sets `minimumReleaseAge` to 7 days, runs lockfile maintenance weekly, automerges patch and minor updates once CI is green, and holds Astro majors so a migration note can be written first.

## Consequences

Dependencies move without a human as long as `bun run validate` and the smoke test stay green. Astro majors and the TypeScript major (011) are the two deliberate stops. Enable the Renovate app on the repository after the first push.
