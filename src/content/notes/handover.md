---
title: "Handover"
description: "Stripping the personal tooling before a repository changes hands."
date: 2026-09-04
---

`bun run init --handoff` strips the personal tooling: the agent files, the upstream log, the registry manifest, the scaffold tests, the icon mirror script and the dependency bot, and puts the production README in the README's place. The CI workflow stays, since it is the project's own pipeline.

Then fill in the README's placeholders, hand over credentials per environment, and transfer the repository.
