class _DevGrid {
  private el: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private power: HTMLElement | null = null;
  private rhythm: HTMLElement | null = null;
  private mode = 0;
  private columns = 12;

  init(opts: { columns?: number } = {}) {
    const fromCss = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--columns"), 10);
    this.columns = opts.columns ?? (Number.isFinite(fromCss) && fromCss > 0 ? fromCss : 12);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.mode) return this.set(0);
      if (!e.shiftKey || (e.key !== "G" && e.key !== "g")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      this.set((this.mode + 1) % 4);
    });
    document.addEventListener("astro:page-load", () => {
      if (this.mode && this.el && !this.el.isConnected) document.body.append(this.el);
    });
  }

  private build(): HTMLElement {
    const el = document.createElement("div");
    el.setAttribute("data-dev-grid", "");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;inset:0;z-index:2900;pointer-events:none;";
    const track = document.createElement("div");
    track.style.cssText =
      "position:absolute;inset:0;display:grid;" +
      "grid-template-columns:minmax(var(--margin),1fr) min(100% - var(--margin)*2,var(--container-max)) minmax(var(--margin),1fr)";
    const cols = document.createElement("div");
    cols.style.cssText = `grid-column:2;display:grid;grid-template-columns:repeat(${this.columns},minmax(0,1fr));gap:var(--gutter)`;
    for (let i = 0; i < this.columns; i++) {
      const col = document.createElement("div");
      col.style.background = "var(--ink)";
      cols.append(col);
    }
    track.append(cols);
    const power = document.createElement("div");
    power.style.cssText = "position:absolute;inset:0;display:none";
    const meas = document.createElement("div");
    meas.style.cssText =
      "position:absolute;inset-block:0;left:50%;translate:-50% 0;width:min(100% - var(--margin)*2,var(--measure));border-inline:1px dashed var(--ink)";
    power.append(meas);
    for (const pct of [33.333, 66.667]) {
      const line = document.createElement("div");
      line.style.cssText = `position:absolute;left:0;right:0;top:${pct}%;border-top:1px dashed var(--ink)`;
      power.append(line);
    }
    const rhythm = document.createElement("div");
    rhythm.style.cssText =
      "position:absolute;inset:0;display:none;background:repeating-linear-gradient(to bottom,var(--ink) 0,var(--ink) 1px,transparent 1px,transparent calc(var(--fs-body) * var(--lh-body, 1.5)))";
    el.append(track, power, rhythm);
    this.track = track;
    this.power = power;
    this.rhythm = rhythm;
    return el;
  }

  private set(mode: number) {
    this.mode = mode;
    if (!mode) return void this.el?.remove();
    if (!this.el) this.el = this.build();
    if (!this.el.isConnected) document.body.append(this.el);
    this.track!.style.display = mode === 3 ? "none" : "grid";
    this.power!.style.display = mode === 2 ? "block" : "none";
    this.rhythm!.style.display = mode === 3 ? "block" : "none";
    this.el.style.opacity = mode === 1 ? "0.05" : mode === 2 ? "0.11" : "0.09";
  }
}
export const DevGrid = new _DevGrid();

export { tunePanel, tuneToggle, type TuneRow, type TuneGroup, type TuneOpts } from "./tune";
export { Hud } from "./hud";
import { Hud } from "./hud";
import { sample } from "./sampler";

const LONG_FRAME = 34;

class _Perf {
  private frames = 0;
  private worst = 0;
  private winT0 = 0;
  armed = false;

  init() {
    if (new URLSearchParams(location.search).get("perf") === null) return;
    this.armed = true;
    (window as unknown as { __perf?: unknown }).__perf = this;
    try {
      new PerformanceObserver((l) =>
        l.getEntries().forEach((e) => console.log(`[perf] longtask ${Math.round(e.duration)}ms`)),
      ).observe({ entryTypes: ["longtask"] });
    } catch {}
    this.winT0 = performance.now();
    sample((dt, now) => {
      this.frames++;
      if (dt > this.worst) this.worst = dt;
      if (dt > LONG_FRAME) console.log(`[perf] long frame ${dt.toFixed(1)}ms`);
      if (now - this.winT0 > 2000) {
        const fps = (this.frames / (now - this.winT0)) * 1000;
        console.log(`[perf] ${fps.toFixed(0)}fps worst ${this.worst.toFixed(1)}ms`);
        this.frames = 0;
        this.worst = 0;
        this.winT0 = now;
      }
    });
    console.log("[perf] armed");
  }
}
export const Perf = new _Perf();

export function mountDevkit(opts: { columns?: number } = {}) {
  DevGrid.init(opts);
  Perf.init();
  Hud.init();
}
