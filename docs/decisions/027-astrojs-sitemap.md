# 027. The sitemap is @astrojs/sitemap

Date: 2026-09-04

Status: accepted

## Context

Search engines want a sitemap, and the list of pages is only known at build time. Every dependency carries a record. `@astrojs/sitemap` is Astro's own integration: it reads the built routes and writes `sitemap-index.xml`. The disposable example route and anything parked under an `-old` or `-v2` name must stay out of it, or the sitemap says the opposite of the pages' `noindex`.

## Decision

`@astrojs/sitemap` is a runtime dependency, configured in `astro.config.ts` with a filter that drops `/example` and parked routes. `Seo.astro` links the index. Endpoints (the feed, the manifest) are not pages and are never listed.

## Consequences

One integration, one filter to keep honest: a route that ships `noindex` is added to the filter in the same commit. The `site` in `astro.config.ts` comes from `SITE.url`, so the sitemap's absolute URLs follow the one config surface. Revisit if Astro folds sitemaps into core.
