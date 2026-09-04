# src/content

Content collections, read by `src/content.config.ts` (the schema) through Astro's Content Layer.

`notes/` is the one collection. In the starter it is the manual: each note is a section of the README, so the listing at `/notes`, the entry pages and the feed are proven on real content. `bun run init --no-example` removes them, and a project's own content takes the folder.

Markdown goes through Sätteri with no plugins (decision 006).
