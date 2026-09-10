// The telemetry strip: a row of chips fixed top left, development only. Each chip is LABEL::value, the label
// in the sans, the value in mono, the same rounded-square vocabulary as the tune panel. The strip carries the
// machine's own readings (time, frame rate, frame cost, memory, largest paint, viewport, the GL stage) and
// whatever an engine puts on it with `watch`. Shift+H hides and shows it, remembered per tab; `?hud=off`
// keeps it away for a load.
import { sample } from "./sampler";

type Reader = () => string | null;
type Chip = { label: string; read: Reader; el: HTMLElement; val: HTMLElement };

const STYLE_ID = "dev-hud-style";
const CSS = `
.hud{position:fixed;inset-block-start:16px;inset-inline-start:16px;z-index:1350;display:flex;flex-wrap:wrap;gap:4px;max-inline-size:calc(100vw - 32px);pointer-events:none;font:var(--fw-regular,400) 11px/1 var(--font-sans,system-ui);-webkit-font-smoothing:antialiased;user-select:none}
.hud[hidden]{display:none}
.hud__chip{display:inline-flex;align-items:center;gap:0;height:26px;padding-inline:9px;border-radius:6px;background:color-mix(in srgb,var(--surface) 82%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 0 0 1px var(--line);color:var(--ink-muted);white-space:nowrap;letter-spacing:.02em;text-transform:uppercase}
.hud__chip[hidden]{display:none}
.hud__sep{opacity:.55;margin-inline:2px}
.hud__val{font:400 11px/1 var(--font-mono,ui-monospace);font-variant-numeric:tabular-nums;color:var(--ink);text-transform:none}
.hud__chip[data-warn] .hud__val{color:var(--spot)}
`;

const perfWithMemory = () => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;

class _Hud {
  private el: HTMLElement | null = null;
  private chips: Chip[] = [];
  private frames = 0;
  private cost = 0;
  private fps = 0;
  private ms = 0;
  private windowT0 = 0;
  private lcp: number | null = null;
  private offSample: (() => void) | null = null;
  private timer = 0;
  private bound = false;

  init() {
    if (this.el) return;
    if (new URLSearchParams(location.search).get("hud") === "off") return;
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.append(style);
    }
    const el = document.createElement("div");
    el.className = "hud";
    el.setAttribute("data-dev-hud", "");
    el.setAttribute("aria-hidden", "true");
    this.el = el;
    let shown = true;
    try {
      shown = localStorage.getItem("hud") !== "off";
    } catch {
      /* private mode */
    }
    el.hidden = !shown;
    document.body.append(el);

    // the machine's own readings, in the order a glance wants them
    this.watch("ut", () => {
      const s = new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZoneName: "short",
      });
      return s.replace(/\s+/g, "");
    });
    this.watch(
      "fps",
      () => (this.fps ? String(Math.round(this.fps)) : null),
      (v) => Number(v) < 50,
    );
    this.watch(
      "ms",
      () => (this.ms ? this.ms.toFixed(1) : null),
      (v) => Number(v) > 20,
    );
    this.watch("mem", () => {
      const m = perfWithMemory();
      return m ? `${Math.round(m.usedJSHeapSize / 1048576)}MB` : null;
    });
    this.watch(
      "lcp",
      () => (this.lcp === null ? null : `${(this.lcp / 1000).toFixed(1)}s`),
      (v) => parseFloat(v) > 2.5,
    );
    this.watch("vp", () => `${innerWidth}×${innerHeight}@${(devicePixelRatio || 1).toFixed(1)}`);
    this.watch("gl", () => document.documentElement.dataset.gl ?? null);

    try {
      new PerformanceObserver((l) => {
        const last = l.getEntries().at(-1);
        if (last) this.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      /* not supported */
    }

    // frame rate and cost over a half-second window, from the shared outside clock
    this.windowT0 = performance.now();
    this.offSample = sample((dt, now) => {
      this.frames++;
      this.cost += dt;
      if (now - this.windowT0 >= 500) {
        this.fps = (this.frames / (now - this.windowT0)) * 1000;
        this.ms = this.cost / this.frames;
        this.frames = 0;
        this.cost = 0;
        this.windowT0 = now;
      }
    });
    this.timer = window.setInterval(() => this.paint(), 250);
    this.paint();

    if (!this.bound) {
      this.bound = true;
      document.addEventListener("keydown", (e) => {
        if (!e.shiftKey || (e.key !== "H" && e.key !== "h") || e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        this.toggle();
      });
      // a View Transition replaces <body>: the strip re-adopts itself
      document.addEventListener("astro:page-load", () => {
        if (this.el && !this.el.isConnected) document.body.append(this.el);
      });
    }
  }

  /** Put a reading on the strip. The reader returns text, or null to hide the chip. `warn` colours the value. */
  watch(label: string, read: Reader, warn?: (value: string) => boolean): () => void {
    const el = document.createElement("span");
    el.className = "hud__chip";
    const lab = document.createElement("span");
    lab.textContent = label;
    const sep = document.createElement("span");
    sep.className = "hud__sep";
    sep.textContent = "::";
    const val = document.createElement("span");
    val.className = "hud__val";
    el.append(lab, sep, val);
    const chip: Chip = {
      label,
      el,
      val,
      read: () => {
        const v = read();
        if (v !== null && warn) el.toggleAttribute("data-warn", warn(v));
        return v;
      },
    };
    this.chips.push(chip);
    this.el?.append(el);
    this.paintChip(chip);
    return () => {
      this.chips = this.chips.filter((c) => c !== chip);
      el.remove();
    };
  }

  toggle(show = this.el?.hidden ?? false) {
    if (!this.el) return;
    this.el.hidden = !show;
    try {
      localStorage.setItem("hud", show ? "on" : "off");
    } catch {
      /* private mode */
    }
  }

  private paintChip(c: Chip) {
    let v: string | null = null;
    try {
      v = c.read();
    } catch {
      v = null;
    }
    c.el.hidden = v === null;
    if (v !== null && c.val.textContent !== v) c.val.textContent = v;
  }

  private paint() {
    if (!this.el || this.el.hidden) return;
    for (const c of this.chips) this.paintChip(c);
  }

  destroy() {
    this.offSample?.();
    this.offSample = null;
    clearInterval(this.timer);
    this.el?.remove();
    this.el = null;
    this.chips = [];
  }
}

export const Hud = new _Hud();
