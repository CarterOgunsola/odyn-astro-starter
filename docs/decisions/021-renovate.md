# 021. Renovate with pins and a release-age floor

Date: 2026-09-03

Status: accepted

## Context

Going stale is the most common reason developers abandon their own starter. The answer is bot-driven dependency updates with pinned versions, a committed lockfile, weekly lockfile maintenance and a minimum release age before a pull request opens.

## Decision

`renovate.json` extends `config:best-practices` and pins all dependencies except peers, sets `minimumReleaseAge` to 7 days, runs lockfile maintenance weekly, opens one pull request per update with nothing automerged, and holds Astro majors behind dashboard approval so a migration note can be written first.

## Consequences

Every update arrives as a pull request with CI already run. Each one is landed by hand as a commit of the author's own, so the history and the contributor graph stay the author's. Astro majors and the TypeScript major (011) are the two deliberate stops. Enable the Renovate app on the repository after the first push.
