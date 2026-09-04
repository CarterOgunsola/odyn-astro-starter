# 018. One config surface

Date: 2026-09-03

Status: accepted

## Context

The Astro starters that stayed maintainable keep one typed config. The ones with YAML loaded by a custom integration, or ten config files, are the hardest to reason about. One file, each consumer named.

## Decision

`src/config/site.ts` exports `SITE` (URL, name, tagline, description, author, locale, social image, theme default and colours, navigation, socials, feed). Every value carries a comment naming what reads it (`Seo.astro`, `Header.astro`, `Base.astro`, `rss.xml.ts`, `astro.config.ts`). `astro.config.ts` imports it for `site`.

## Consequences

A new project edits one file to become itself. Anything that wants config outside this file must argue for it in a record. Feature flags, when they arrive, go here too.
