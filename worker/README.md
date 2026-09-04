# worker

The Cloudflare Worker in front of the static assets. It runs only for the prefixes listed under `run_worker_first` in `wrangler.jsonc` (`/api/*` by default). The platform serves everything else without invoking it.

`index.ts` answers `/api/health` and hands every other request to the `ASSETS` binding. Add an endpoint by adding a route here and, if it needs a new prefix, adding that to `run_worker_first`. Secrets go in through `wrangler secret put` for production and `.dev.vars` locally, never into `public` env vars.

Run it locally with `bun run dev:worker`. The dev server proxies `/api` to it. A purely static project can delete this folder and the `main` key.
