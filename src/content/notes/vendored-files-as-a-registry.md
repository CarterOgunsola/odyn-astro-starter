---
title: "Vendored files as a registry"
description: "Pulling one house-shaped file into an existing project, with a diff on update."
date: 2026-09-04
---

The SCSS foundation, the layout shell, the config, the dev kit and the element skeleton are described in `jsrepo.config.ts` as registry items.

`bunx jsrepo add odyn/styles` pulls one into an existing project; `bunx jsrepo update` shows the diff against the current version before it writes. jsrepo is not a dependency of the starter; decision 031 has the build ritual.
