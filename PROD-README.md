# <Project name>

The website for <client>, built on Astro and deployed to Cloudflare. This document is for whoever runs the site next.

## Run it locally

```
bun install
bun run dev            # http://localhost:4321
bun run dev:worker     # the API routes on :8787, if the site has any
```

Node 24 (the version in `.node-version`) is required. Bun installs the dependencies and runs the scripts.

## Build and deploy

```
bun run validate       # typecheck, lint, format, tokens, unit tests, build, browser tests. Must be green.
bun run deploy         # builds and deploys the Worker and its static assets
```

Deploys also run from Git through Cloudflare Workers Builds. Every pull request gets a preview URL. The production branch is `main`.

## Where things are

- `src/config/site.ts`: the site's name, URL, navigation and social links
- `src/content/`: editable content (Markdown)
- `src/pages/`: one file per route
- `src/styles/`: colours, type and spacing tokens
- `worker/`: server code for `/api/*`, if any

## Credentials

Per environment, held outside this repo:

| Service | Where the value lives | Who holds it |
|---|---|---|
| Cloudflare account | Cloudflare dashboard | <owner> |
| Worker secrets | `wrangler secret put NAME` | <owner> |
| Domain / DNS | Cloudflare | <owner> |

## Third-party software

The dependencies are open source under permissive licenses (MIT, ISC, Apache-2.0), with two exceptions to know about. GSAP is used under its own standard license (free for commercial use, gsap.com/standard-license), not MIT. The Geist typefaces are used under the SIL Open Font License; the license text is in `src/assets/fonts/`. The starter this site was built from is MIT; its notice is kept in `THIRD-PARTY-NOTICES.md`.

## Support

<contact and terms>
