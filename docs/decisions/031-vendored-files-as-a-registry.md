# 031. The vendored files are a jsrepo registry

Date: 2026-09-04

Status: accepted

## Context

The SCSS foundation, the layout shell, the dev kit and the element skeleton are vendored on purpose: every project retunes them, so they cannot be a package (decision 008, principle 5). There has to be a way to pull one of them into an existing project and to see, later, what changed upstream, without the starter becoming a dependency.

## Decision

`jsrepo.config.ts` at the root describes the house-shaped files as registry items (`styles`, `layout`, `config`, `devkit`, `element-skeleton`). Building the manifest needs jsrepo's `repository()` output, which the config can only import when the package is installed, so the build is a short ritual, not a script: `bun add -d jsrepo`, add `outputs: [repository()]`, `bunx jsrepo build`, then drop the package again. Consumers use `bunx jsrepo add` and `bunx jsrepo update`, which shows a diff per file before it writes. jsrepo is not a dependency of the starter.

## Consequences

An existing project can adopt the foundation file by file, and a project born from the starter can compare its retuned copy against the current one with a diff instead of a memory. Nothing syncs on its own. Revisit if a second registry tool becomes the convention.
