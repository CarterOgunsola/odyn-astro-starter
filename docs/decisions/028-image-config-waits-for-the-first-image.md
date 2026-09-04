# 028. The image config waits for the first image

Date: 2026-09-04

Status: accepted

## Context

`astro.config.ts` carried an `image` block (`layout: "constrained"`, `responsiveStyles: true`) that nothing in the chassis reads: no page uses `<Image>` or `<Picture>`, and the Fonts API import from `astro:assets` is unrelated. Configuration that serves no file in the tree is weight, and nothing ships ahead of its first use.

## Decision

The block is removed. The first page to place an image adds it back, with the layout and the responsive styles that page needs, and records the choice in this file's successor.

## Consequences

One fewer setting to explain. When an image lands, two lines of config come with it in the same commit, and the image is served through Astro's pipeline (hashed, sized, `loading` set) rather than a bare `<img>` from `public/`.
