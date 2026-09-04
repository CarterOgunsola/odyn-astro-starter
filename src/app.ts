// Cancel the CSS failsafe as soon as the app chunk runs, not at window load.
document.querySelector("[data-conductor-panel]")?.classList.add("is-js");

import "lenis/dist/lenis.css";
import { createApp, safe } from "@odyn/lifecycle";
import { Conductor, wipeLeg } from "@odyn/conductor";
import { Reveal } from "@odyn/reveal";
import { createEngines, mediaHold } from "@odyn/engines";
import gsap from "@/lib/gsap";
import { registerEases } from "@/config/easing";
import { Scroll } from "@/lib/scroll";
import { Theme } from "@/lib/theme";
import { Header } from "@/lib/header";
import "@/lib/elements/theme-toggle";
import { ENGINES } from "@/lib/engines";

const engines = createEngines({
  engines: ENGINES,
  hold: (p, cap) => Conductor.hold(p, cap),
  safe,
});

registerEases(gsap);

createApp({
  globals: [
    { name: "Scroll", init: () => Scroll.init() },
    {
      name: "Conductor",
      init: () =>
        Conductor.init({
          leg: wipeLeg(),
          lock: Scroll,
          chrome: "[data-header]",
          onIntent: (pathname) => engines.prefetch(pathname),
        }),
    },
    { name: "Theme", init: () => Theme.init(), onRoute: () => Theme.syncColor() },
    { name: "Header", init: () => Header.init(), onRoute: (p) => Header.sync(p) },
    { name: "Engines.hover", init: () => engines.bindHover() },
    ...(import.meta.env.DEV
      ? [{ name: "Devkit", init: () => void import("@odyn/devkit").then((m) => m.mountDevkit()) }]
      : []),
  ],
  runtime: () => Scroll.resize(),
  pages: [{ name: "Reveal", mount: () => Reveal.init() }],
  after: () => {
    engines.mount();
    Conductor.hold(mediaHold(), 1500);
    Scroll.resize();
  },
  beforeSwap: () => engines.bumpSwap(),
});
