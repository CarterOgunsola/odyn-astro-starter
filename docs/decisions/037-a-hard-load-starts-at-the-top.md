# 037. A hard load starts at the top

Date: 2026-09-10

Status: accepted

## Context

The ClientRouter saves the scroll position into `history.state` as the page scrolls and restores it on every load,
reloads included (decision 004 counted this as a free feature). For a document that is right. For an experiential
page that tells its story from the top, a reload that reopens mid-scene is wrong every time, and it looks like a bug
in the scroll engine when it is the router keeping its promise.

## Decision

`SITE.startAtTop` (default `true`). When on, `Scroll.init` zeroes the saved position in `history.state` and scrolls to
0 before Lenis boots, on a hard load only. Back and forward between pages are swaps, not loads, and still restore.

## Consequences

A reload is a fresh start. A project that is a document sets the flag off and gets the router's behaviour back.
Revisit if a project wants deep links into a scene to survive a reload; that is an anchor or a query, not saved scroll.
