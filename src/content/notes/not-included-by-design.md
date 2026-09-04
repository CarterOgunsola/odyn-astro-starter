---
title: "Not included, by design"
description: "What the starter leaves out, and how each thing comes in when a project needs it."
date: 2026-09-04
---

No CMS, mail, analytics, auth, comments or payments. No three.js. No Tailwind. No React or islands. No i18n.

Each one is an add-on for the project that needs it, with a flag, a mock where a service is involved, and a decision record. `docs/add-ons.md` names where each one lives and the steps to bring it in. The GL add-on installs with `bun run add gl`.

The reasoning is the frequency rule in `docs/principles.md`: something enters the chassis when it recurs in most projects, and leaves when a project deletes it without noticing.
