# docs

`principles.md` is the six lines every decision answers to. `decisions/` is one record per dependency and per convention, numbered, never reused. `migrations/` holds a note per starter major for projects born from the previous one. `add-ons.md` names where each absent thing lives and how it comes in. `upstream.md` is the log a project keeps of changes worth sending back.

`public/` has no note of its own because everything in it is served verbatim: `favicon.svg` and `favicon.ico` (the 32-pixel entry only), `og-default.png` (the social image, 1200 by 630; replace it), `robots.txt`, `_headers` and `_redirects`. The manifest is not there: `src/pages/site.webmanifest.ts` generates it from the config.
