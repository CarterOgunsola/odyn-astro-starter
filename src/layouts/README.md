# src/layouts

One layout. `Base.astro` is the shell: the fonts, the pre-paint theme script, the easing table, the SEO head, the client router, the skip link, the persistent header, the page, the footer, the transition panel with the mark, and the app entry. Every line carries a comment saying why it is there and in that order.

A page passes `title`, `description`, `image`, `type`, `noindex` and `schema` through to `Seo.astro`.
