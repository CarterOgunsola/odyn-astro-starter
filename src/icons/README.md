# src/icons

The project's icon set, one SVG each, committed. `bun run icon <Name...>` copies icons in from a local Central Icons mirror and normalises them (hardcoded black becomes `currentColor`, PascalCase becomes kebab). Import an icon as a component: `import Mark from "@/icons/odyn.svg"` and `<Mark width={18} height={18} />`. No icon library at runtime (decision 023).

`odyn.svg` is the mark: the brand in the header and the centre of the curtain. `public/favicon.svg` is the same mark as a favicon.
