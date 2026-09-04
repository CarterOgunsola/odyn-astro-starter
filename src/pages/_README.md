# src/pages

File-based routes. The chassis ships a home, `notes/` (listing and entry from the sample collection), `rss.xml.ts`, `robots.txt.ts` (a route, so the sitemap line follows `SITE.url`), a `404.astro`, and `example.astro`.

`example.astro` is the disposable page. It proves every primitive on a fresh clone, it is `noindex`, it is filtered from the sitemap, and nothing imports from it. Delete it with `src/lib/example-engine.ts` and its registry entry when the real site starts, or run `bun run init --no-example`.

Every page renders through `layouts/Base.astro` and passes its head values as props. Do not name a file `src/fetch.ts`. Astro 7 reserves it.

`site.webmanifest.ts` is an endpoint, not a page: it generates the manifest from the config.
