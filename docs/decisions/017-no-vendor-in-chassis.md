# 017. No vendor in the chassis

Date: 2026-09-03

Status: accepted

## Context

Vendor coupling is the loudest complaint in twelve years of starter discourse. A hosted service the project cannot run without, and an env-var gate that blocks the first run. Epic Stack's "Limit Services" and "Offline Development" are the principles that answer it. Here they are gates.

## Decision

No CMS, mail, analytics, auth, comments or payments in the chassis. `bun dev` and `bun run validate` need no environment variable and no account. `.env.example` documents where a project's keys would live (Worker secrets, `.dev.vars`, `astro:env` schema) and contains none. Any add-on that brings a vendor arrives with a flag, a mock, and a decision record.

## Consequences

A fresh clone is green on a clean machine. Framework opinions (router, styles, motion) are strong. Vendor opinions are absent. The README's "not included, by design" list names each absence and where its add-on would go.
