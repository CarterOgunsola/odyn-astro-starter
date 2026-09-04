# 014. No three.js in the chassis

Date: 2026-09-03

Status: accepted

## Context

The one credible Astro creative base switched from three.js to a lighter image-plane library, and three.js's star mass lives in single-page scaffolds, not site starters. The GL layer is optional and contracted. The dependency count is capped.

## Decision

three.js is not a dependency. The example engine draws on a 2D canvas to prove the engine shape (root, hold, Frame clock, reveal event, teardown). A GL add-on, when a project needs one, ships one persistent canvas outside the swapped container, DOM-to-GL sync by identity attributes, dispose per page, hardware and load gating, and a devkit off-switch, and it records its own decision.

## Consequences

The chassis installs and builds in seconds. The lazy engine registry is where a GL engine would slot in. The conductor's holds already cover texture loading. Revisit if the frequency rule says most projects carry GL.
