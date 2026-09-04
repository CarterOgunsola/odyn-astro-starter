# 023. No astro-icon

Date: 2026-09-03

Status: accepted (replaces a dependency the house used)

## Context

The house pulled icons through `astro-icon` plus a script that copies Central Icons into `src/icons`. Since Astro 5.7 an SVG file imports as a component natively, so the package's job is done by the framework. The dependency count is capped.

## Decision

`astro-icon` is not a dependency. Icons are SVG files under `src/icons`, imported as components (`import Arrow from "@/icons/arrow.svg"`) with `currentColor` fills so they theme. `scripts/add-icon.mjs` pulls named icons from a local Central Icons mirror and normalises them.

## Consequences

One package fewer, and icons are plain files a designer can hand over. The script assumes the mirror at `vendor/central-icons`, which is gitignored. A project without it adds SVGs by hand.
