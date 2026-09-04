# Add-ons

What the starter leaves out, and where each thing lives when a project needs it. Every add-on follows the same shape: a flag in `src/config/site.ts` (or an environment variable in `.env.example`), a mock so `bun run dev` and `bun run validate` need no account, and a decision record. Install, then record, in the same commit.

## GL (three.js)

Installed by script.

1. `bun run add gl`. Pins `three` and its types, copies `src/lib/gl/` and `src/components/GlStage.astro`, places the stage in the layout, and writes the decision record.
2. Add the two lines the script prints to `src/app.ts` (the `Gl` global and the `GlPlanes` page mount).
3. Mark a DOM element `data-gl="plane" data-id="hero"`: a plane follows its rect every frame. Hardware and load gating, per-page dispose and the texture hold are built in; `?gl=off` turns the stage off for that load.

## CMS

1. Pick the client (Sanity, Contentful, Keystatic) and install its SDK only. No framework integration.
2. Read at build time in the content config through a custom loader, keyed by a token in `.env.example`.
3. Mock: when the token is empty, the loader reads `src/content/<collection>/` fixtures, so a fresh clone builds.
4. Record: `docs/decisions/NNN-<cms>.md`. Name the loader file and the token.

## Mail

1. A Worker route under `/api/mail` in `worker/`, using the provider's HTTP API (Resend or similar) with the key set by `wrangler secret put`.
2. Mock: with no key the route logs the payload and returns `202`, so a form submits offline.
3. Record: the route, the secret name, the rate limit.

## Analytics

1. Prefer the platform's own (Cloudflare Web Analytics) added as one tag in `Seo.astro` behind `SITE.analytics`.
2. Mock: an empty value emits nothing. Never a script that needs consent to load.
3. Record: which product, what it collects, why it needed no banner.

## i18n

1. Astro's built-in `i18n` config: `defaultLocale`, `locales`, `routing`.
2. Move `SITE.locale` and `ogLocale` to a per-locale table; `Seo.astro` emits `hreflang`.
3. Mock: none needed. Record: the routing strategy chosen and why.

## Auth, comments, payments

Each is a service with a client. The same three steps: SDK only, a mock behind an empty key, a record. If it needs a server, it is a Worker route under `/api/*`, never a rendered page: the site stays static.
