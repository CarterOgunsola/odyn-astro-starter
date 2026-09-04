---
title: "Versioning and migrations"
description: "What a major, a minor and a patch mean for a starter."
date: 2026-09-04
---

Releases are tagged and logged in `CHANGELOG.md`.

A removed primitive or a restructured directory is a major. A new primitive is a minor. A fix or a dependency bump is a patch. No long-term branches.

A project born from a previous major reads `docs/migrations/`. It never syncs from the starter: the stamp in `package.json` (`starter.ref`, `starter.head`, `starter.date`) is what it diffs against.
