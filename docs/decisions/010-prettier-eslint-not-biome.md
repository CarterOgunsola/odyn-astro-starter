# 010. Prettier plus ESLint with the Astro plugins, not Biome

Date: 2026-09-03

Status: accepted

## Context

Biome 2.5 treats `.astro` parsing, formatting and linting as experimental and has not started SCSS linting. A house on SCSS and `.astro` stays on Prettier and ESLint until that changes.

## Decision

`prettier` with `prettier-plugin-astro` for formatting. `eslint` 10 flat config with `typescript-eslint` and `eslint-plugin-astro` for linting. `bun run validate` runs both alongside `astro check` and the build.

## Consequences

Five dev dependencies (`prettier`, `prettier-plugin-astro`, `eslint`, `eslint-plugin-astro`, `typescript-eslint`) instead of one. Formatting and linting never disagree because they are separate tools with separate jobs. Revisit when Biome formats `.astro` outside experimental and lints SCSS. At that point this record is superseded and the five packages leave.
