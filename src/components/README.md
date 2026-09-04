# src/components

The few primitives the chassis needs to show its conventions, and nothing more. The head (`Seo.astro`), the persistent chrome (`Header.astro` with `data-header` and `transition:persist`), the theme control (`ThemeToggle.astro`, the flip-pill idiom with one shared background slid with a measured FLIP), the year-grouped list (`NoteList.astro`) and the footer.

A finished design system does not belong here. Tokens and type roles do. A component that owns behaviour on its own element is a custom element, scaffolded with `bun run new element <name>`. A component that reads site-wide values reads them from `src/config/site.ts`, never from its own constants. Scoped `<style lang="scss">` per component. No global CSS from this folder.
