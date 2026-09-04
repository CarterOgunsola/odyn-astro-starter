import { Conductor } from "@odyn/conductor";
import { Frame, onDestroy, onResize } from "@odyn/lifecycle";
import { arrive as arrive_ } from "@odyn/reveal";
import defaults from "@/tune/example.json";

const board = { ...defaults };

class _ExampleEngine {
  init() {
    const root = document.querySelector<HTMLElement>("[data-example-engine]");
    if (!root) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    root.append(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = () => {
      const r = root.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const offResize = onResize({
      write: () => {
        size();
        if (reduced) draw();
      },
    });

    Conductor.hold(new Promise((r) => setTimeout(r, 300)));

    let t = 0;
    const arrive = { p: 0 };
    let ink = getComputedStyle(root).color;
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const n = Math.round(board.lines);
      const reach = w * arrive.p;
      for (let i = 0; i < n; i++) {
        const y = (h / (n + 1)) * (i + 1);
        for (let x = 0; x <= reach; x += 8) {
          const k = x / w;
          const yy =
            y + Math.sin(k * 6 + t + i * 0.3) * h * board.amplitude * 0.15 * (1 - Math.abs(k - 0.5) * 2);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
      }
      ctx.stroke();
    };
    const mo = new MutationObserver(() => {
      ink = getComputedStyle(root).color;
      if (reduced) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    if (reduced) {
      arrive.p = 1;
      draw();
    }

    const offArrive = reduced ? () => {} : arrive_(arrive, { p: 1 });

    const off = reduced
      ? () => {}
      : Frame.add((_, dt) => {
          t += (dt / 1000) * board.speed;
          draw();
        }, 30);

    let offTune: (() => void) | null = null;
    if (import.meta.env.DEV) {
      void import("@odyn/devkit").then(({ tunePanel }) => {
        offTune = tunePanel(
          "example",
          [
            { key: "speed", label: "speed", min: 0, max: 3, step: 0.05, value: board.speed },
            { key: "amplitude", label: "amplitude", min: 0, max: 1, step: 0.01, value: board.amplitude },
            { key: "lines", label: "lines", min: 1, max: 80, step: 1, value: board.lines },
          ],
          (b) => Object.assign(board, b),
        );
      });
    }

    onDestroy(() => {
      off();
      offResize();
      mo.disconnect();
      offTune?.();
      offArrive();
      canvas.remove();
    });
  }
}

export const ExampleEngine = new _ExampleEngine();
