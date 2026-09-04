---
title: "From clone to deploy"
description: "The five steps from a fresh clone to a Worker on Cloudflare."
date: 2026-09-04
---

Five steps.

1. **Scaffold.** Use this template on GitHub, or clone without history: `bunx giget@latest gh:CarterOgunsola/odyn-astro-starter my-site`, then `cd my-site && bun install && bun run init`. The init script renames the project, writes the starter stamp into `package.json`, removes the starter's own changelog, migrations and license (the MIT notice moves to `THIRD-PARTY-NOTICES.md`), and gives the project a fresh git history (`--keep-history` keeps it). It refuses to run on a dirty tree, on unpushed commits, or under the starter's own name. Add `--no-example` to delete the example route, its engine, the proofs that drive it and these notes at the same time.

2. **Run.** `bun run dev` for the site, `bun run dev:worker` for `/api/*` alongside it. No account or key needed.

3. **Configure.** Edit `src/config/site.ts`. Every value names what reads it. Replace `public/og-default.png` and `public/favicon.svg`.

4. **Prove it.** `bun run validate` green before the first commit of real work. It typechecks, lints, checks formatting and tokens, runs the unit tests, builds, and runs the Playwright suite against the built site.

5. **Deploy.** Create the Worker on Cloudflare with the same name as `wrangler.jsonc` and run `bun run deploy`, or connect the repo to Workers Builds for git deploys and preview URLs. The platform serves the static assets. The Worker runs only for `/api/*`.
