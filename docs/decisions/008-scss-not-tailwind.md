# 008. SCSS with the type and layout mixins, not Tailwind

Date: 2026-09-03

Status: accepted

## Context

The house writes SCSS. A size scale, fluid functions, a type role map with a `text()` mixin, a container and grid mixin set, all as custom properties GSAP can read. The vanilla side of the studio world is still on SCSS while the React side moved to Tailwind v4. Tailwind would add a dependency and a second way of expressing spacing and type.

## Decision

The `sass` package (the modern Dart Sass API through Vite) is the one styling dependency. SCSS is the one stylesheet language. `src/styles` holds the foundation partials. `global.scss` is the only global entry. Components carry scoped `<style lang="scss">`. Partials resolve from `src/styles` through Vite's `loadPaths`, so `@use "type" as t;` works anywhere.

## Consequences

Biome cannot lint SCSS yet, which keeps the linter on Prettier plus ESLint (010). Tokens double as the dev grid's inputs. A project that wants Tailwind for layout utilities adds `@tailwindcss/vite` and records why. It should not carry both spacing systems.
