---
title: "Generators and add-ons"
description: "The scripts that write files in the house shape."
date: 2026-09-04
---

Four generators and one installer.

```
bun run new module <name>     # a page-tier module
bun run new element <name>    # a custom element
bun run new engine <name>     # a lazy engine, registered for you
bun run icon <Name...>        # pull Central Icons into src/icons
bun run add gl                # the WebGL add-on, with its decision record
```

What a generator writes passes `bun run validate` as written. The templates live in `scripts/_templates` and are reviewed with the code.
