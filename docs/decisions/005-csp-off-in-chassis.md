# 005. Astro's hash CSP off in the chassis; a header CSP on

Date: 2026-09-03

Status: accepted

## Context

Astro 6 made `security.csp` stable, and for a static site it is a one-line opt-in that emits a hash-based `<meta>` policy. The docs also state it is incompatible with the ClientRouter and with Shiki inline styles. A stance beats an unexamined default. 004 keeps the ClientRouter.

## Decision

`security.csp` is not set in the chassis. The consequence of 004 is recorded here so the pairing is visible. Client router on, Astro's hash CSP off. `_headers` in `public/` carries a header-level Content-Security-Policy instead: same-origin everything, inline scripts and styles allowed (the shell inlines the theme script, the conductor stamp and the easing table), `object-src 'none'`, `frame-ancestors 'self'`. It is served by the platform's static assets, so it applies in production and not under `astro dev` or `astro preview`. The other security headers (nosniff, referrer policy, permissions policy, frame options) sit beside it.

## Consequences

A project that needs a hash-based policy without `'unsafe-inline'` flips the stance by removing the ClientRouter, switching the conductor to a full-load or native view-transition leg, and turning `security.csp` on, then records that as its own decision. Revisit if Astro makes the two compatible.
