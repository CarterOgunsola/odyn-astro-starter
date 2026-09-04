# 026. The feed is @astrojs/rss

Date: 2026-09-04

Status: accepted

## Context

A site with notes wants a feed, and a feed written by hand drifts from the content collection the moment a field changes. Every dependency carries a record. `@astrojs/rss` is Astro's own package: it reads the collection, validates items and escapes for XML. Most personal starters have a feed and none of them hand-rolled.

## Decision

`@astrojs/rss` is a runtime dependency. `src/pages/rss.xml.ts` builds the feed from the `notes` collection, drafts excluded, titled from `SITE.name` and `SITE.feed`. `Seo.astro` links it as the alternate.

## Consequences

One package for one endpoint. A project without notes deletes `rss.xml.ts`, the `feed` key and the `<link rel="alternate">`, and removes the dependency in the same commit. Revisit if Astro folds feeds into core.
