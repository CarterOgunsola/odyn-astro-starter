# 006. Sätteri Markdown, no remark or rehype plugins

Date: 2026-09-03

Status: accepted

## Context

Astro 7 made the Rust Markdown pipeline the default. The unified pipeline remains available through `@astrojs/markdown-remark` and `markdown.processor`, but the `markdown.remarkPlugins` config key is announced for removal in Astro 8. One pipeline, chosen once. The failure to avoid is a `src/plugins/` folder of remark plugins sitting on the legacy path without anyone noticing.

## Decision

Sätteri, with no plugins. There is no `src/plugins/` folder and no `remarkPlugins` key. The sample collection in `src/content/notes` proves the pipeline on a fresh clone.

## Consequences

Builds are fast and the dependency count stays low. Reading-time, last-modified and similar recipes written for remark do not apply. A project that needs them installs `@astrojs/markdown-remark`, sets `markdown.processor: unified({...})`, and records the switch. Revisit when Sätteri grows a plugin surface.
