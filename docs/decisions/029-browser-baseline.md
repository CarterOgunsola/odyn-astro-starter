# 029. The browser baseline is Baseline Widely Available

Date: 2026-09-04

Status: accepted

## Context

A stylesheet that carries a fallback for every property is twice the stylesheet, and nobody knows which fallbacks still matter. The baseline gets written down, and progressive enhancement is a decision, not a habit. The reset had a `100vh` fallback under `100svh` and a comment hedging on `text-wrap: pretty`.

## Decision

The chassis targets Baseline Widely Available as of its release date: a feature is used without a fallback once it has been in every major engine for thirty months. That covers `svh`, `color-mix()`, `:where()`, `clip-path: inset()`, `scrollbar-gutter`, `text-wrap: balance`, `inert`, the Web Animations API and the View Transitions the client router uses. One progressive enhancement is allowed and named: `text-wrap: pretty`, which degrades to ordinary wrapping. Anything newer than the baseline comes with a fallback and a comment naming this record.

## Consequences

The reset lost its `100vh` line. A project that must reach an older engine (a kiosk, an embedded view) pins its own baseline in this record's successor and adds the fallbacks it needs. Revisit each release: what was progressive last year is baseline this year, and the comment comes off.
