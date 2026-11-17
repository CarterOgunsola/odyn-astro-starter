# 038. oxlint with every rule the code passes, not ESLint

Date: 2026-11-17

Status: accepted

## Context

ESLint with `typescript-eslint` and `eslint-plugin-astro` ran the recommended sets only and was the slowest step in validate. oxlint 1.94 runs the eslint, typescript, unicorn, oxc, import, promise and node rule sets natively, and with `oxlint-tsgolint` it runs the type-aware rules on the Go compiler.

## Decision

`oxlint` and `oxlint-tsgolint` replace `eslint`, `eslint-plugin-astro` and `typescript-eslint`. `.oxlintrc.json` sets every category to error, turns on type-aware rules, denies warnings and unused disable directives, and lists each rule the house does not follow as `"off"`. The ESLint half of 010 is superseded. Prettier stays.

## Consequences

Lint runs in under a second. A new rule is on unless someone turns it off by name, so the off list is the record of what the house rejects. oxlint reads the frontmatter and scripts of `.astro` files, not the markup. Revisit if a rule ESLint's Astro plugin caught in markup starts to matter.
