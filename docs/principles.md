# Guiding principles

Six lines. Every decision in `docs/decisions/` answers to one of them. If a proposal fits none, it does not go in.

1. **The frequency rule.** Something enters the chassis when it recurs in most projects. Clever is not a reason. It leaves when a project deletes it without noticing. The second project decides, not the first.

2. **Limit services, develop offline.** No account, key or network is needed to run `bun dev` or pass `bun run validate`. Every external service is an add-on behind a flag with a mock.

3. **Only one way.** One router stance, one animation registry, one module lifecycle, one CSS school, one Markdown pipeline, one formatter, one config file. If two ways coexist, the second gets removed, not documented.

4. **Defaults to no.** Features and design default to absent until the frequency rule lets them in. Tokens and ladders ship. Finished components do not. Framework opinions are welcome. Vendor opinions are not.

5. **A snapshot, never a dependency.** A project born from this starter owns its code. It records the starter commit, never syncs from the starter, and sends improvements back by pull request in the same session it makes them.

6. **Small enough to read in one sitting.** The chassis, without the packages, reads in under an hour. Growth is paid for by removal. The small starter outlives the big one.
