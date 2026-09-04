# tune

One JSON file per engine, its board of numbers, committed. The engine imports its file as the defaults it boots with. `bun run new engine <name>` creates an empty one.

A file changes two ways. Edit it by hand, or open the page with `?tune=<name>` in development, move the dials, and press SAVE: the panel posts the board to the dev server, which writes it here (`scripts/vite-tune.mjs`). Either way the next reload runs the new numbers and the change goes in the commit, so a taste call made at eleven at night is still there in the morning.

Only flat objects of finite numbers are accepted; a name is a slug. The middleware runs in `astro dev` only and does not exist in a build.
