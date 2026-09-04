# 003. Cloudflare Workers with static assets, not Pages

Date: 2026-09-03

Status: accepted

## Context

Cloudflare's Pages docs now ask "Are you sure you want to use Pages?" and direct new projects to Workers. The Astro Cloudflare adapter dropped Pages support in v13. Building on Pages is a dead end. The shape is a Worker with an assets directory, no adapter, and headers and redirects in `public/`.

## Decision

`wrangler.jsonc` declares `assets.directory: "./dist"`, `binding: "ASSETS"`, `not_found_handling: "404-page"` and `run_worker_first: ["/api/*"]`. One Worker in `worker/index.ts` answers `/api/health` and hands everything else to the assets binding. No `@astrojs/cloudflare` adapter in the chassis. `_headers` and `_redirects` live in `public/`. Deploy is `astro build && wrangler deploy`.

## Consequences

Static serving is free and the Worker is billed only for `/api/*` invocations. `_headers` never applies to Worker responses, so any API caching is set in code. A project that needs on-demand rendering adds the adapter and records that as its own decision. A purely static project may delete `worker/` and the `main` key.
