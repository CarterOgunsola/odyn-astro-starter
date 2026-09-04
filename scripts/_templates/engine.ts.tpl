import { Conductor } from "@odyn/conductor";
import { Frame, onDestroy } from "@odyn/lifecycle";
import { arrive as arrive_ } from "@odyn/reveal";
import defaults from "@/tune/__KEBAB__.json";

const board: Record<string, number> = { ...defaults };

class ___PASCAL__ {
  init() {
    const root = document.querySelector<HTMLElement>("[data-__KEBAB__]");
    if (!root) return;

    const ready = Promise.resolve();
    Conductor.hold(ready);

    const arrive = { p: 0 };
    let ink = getComputedStyle(root).color;
    const draw = () => {
      void ink;
    };
    const mo = new MutationObserver(() => {
      ink = getComputedStyle(root).color;
      if (reduced) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      arrive.p = 1;
      draw();
    }

    const offArrive = reduced ? () => {} : arrive_(arrive, { p: 1 });

    const off = reduced ? () => {} : Frame.add((_time, _dt) => draw(), 30);

    let offTune: (() => void) | null = null;
    if (import.meta.env.DEV) {
      void import("@odyn/devkit").then(({ tunePanel }) => {
        offTune = tunePanel(
          "__KEBAB__",
          Object.entries(board).map(([key, value]) => ({ key, label: key, min: 0, max: value * 2 || 1, step: 0.01, value })),
          (b) => Object.assign(board, b),
        );
      });
    }

    onDestroy(() => {
      off();
      offTune?.();
      mo.disconnect();
      offArrive();
    });
  }
}

export const __PASCAL__ = new ___PASCAL__();
