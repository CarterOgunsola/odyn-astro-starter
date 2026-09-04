# 032. The manual is the content

Date: 2026-09-04

Status: accepted

## Context

The sample collection held one note that said it was a sample. The demo should be the documentation: content a reader would open anyway, proving the listing, the entry page and the feed on something real. The README already had the sections.

## Decision

`src/content/notes/` holds the README's sections as notes: clone to deploy, what is here, not included, generators and add-ons, versioning, sending improvements back, handover. The README stays the single manual; the notes mirror it so the content pipeline runs on the manual itself. `bun run init --no-example` removes them.

## Consequences

Two places to keep in step, both short. A change to a README section is a change to its note in the same commit. A project that keeps the notes folder gets an empty listing with a sentence saying where the first note goes.
