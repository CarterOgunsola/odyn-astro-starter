# 007. Fonts API with the local provider

Date: 2026-09-03

Status: accepted

## Context

Astro 6 stabilised the Fonts API. The community starters mostly still use fontsource packages or hand-written `@font-face`. Only a few use the API. The API with `fontProviders.local()` and a `<Font cssVariable preload />` in the head removes both the package tax and the hand-written blocks.

## Decision

Geist and Geist Mono (variable, latin subset) are vendored under `src/assets/fonts` with the SIL Open Font License alongside them. `astro.config.ts` declares both with the local provider and the variables `--font-sans` and `--font-mono`. `layouts/Base.astro` preloads the sans. `_tokens.scss` does not redeclare the font variables.

## Consequences

The files ship hashed under `_astro/fonts` and the variable and fallback stack come from one place. A project swaps faces by replacing two files and two names. Preload stays on the sans only, per the docs' "sparingly". Revisit if a project needs a font the local provider cannot serve.
