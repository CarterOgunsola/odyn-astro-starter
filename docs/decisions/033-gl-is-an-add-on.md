# 033. WebGL is an add-on, installed by script

Date: 2026-09-04

Status: accepted

## Context

Decision 014 keeps three.js out of the chassis: most projects born here never draw a scene, and a library that size ships to every page it is imported on. But the projects that do want a scene want the same shape every time: one persistent canvas outside the swapped container, planes that follow the DOM, textures the curtain waits for, and a gate for the devices that should not run it. That shape has to exist somewhere a project can take it from in one step, with its decision record.

## Decision

`bun run add gl` installs the add-on from `scripts/_addons/gl`: it pins `three` and `@types/three`, copies `src/lib/gl/` (stage, gate, plane registry, texture loader) and `src/components/GlStage.astro`, places the stage in the layout after the header, and writes the project's own decision record from a template. The files live in the starter with a `.tpl` suffix so the starter never type-checks or bundles against a package it does not install. The texture loader extends the chassis `Preloader` (decision 034) and holds the curtain, capped at two seconds. three.js loads lazily on the first page that carries `[data-gl]`; the DOM is the truth and every plane follows an element's rect each frame.

## Consequences

The starter stays three-free and its main chunk stays where phase 4 put it. A project that installs the add-on owns the files from then on, like everything else the starter gives it; improvements travel back by pull request to `scripts/_addons/gl`. Revisit when a second add-on wants the same registry shape: that is when `scripts/add.mjs` grows a manifest file per add-on instead of the table it has now.
