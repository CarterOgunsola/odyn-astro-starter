# 024. The reverse flow is a pull request

Date: 2026-09-03

Status: accepted

## Context

No tool moves code from a project back into a starter. The developers whose starters evolve treat it as a human act tied to the moment of the improvement. The rule is written down where an agent and a person both read it.

## Decision

When a project improves a file that came from the starter (a package, a style partial, a layout, a script), the change goes back as a pull request to the starter in the same working session, or is logged in `docs/upstream.md` with the file path and the reason so it is not lost. The rule lives in `AGENTS.md`.

## Consequences

The starter grows only from real projects, which is the frequency rule in practice. A pull request against the starter is small because it is one file's worth of change. `docs/upstream.md` is reviewed at each starter release.
