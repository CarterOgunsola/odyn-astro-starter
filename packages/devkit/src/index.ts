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

export type TuneRow = { key: string; label: string; min: number; max: number; step: number; value: number };

export function tunePanel(
  name: string,
  rows: TuneRow[],
  onChange: (board: Record<string, number>) => void,
): (() => void) | null {
  if (new URLSearchParams(location.search).get("tune") !== name) return null;
  const board: Record<string, number> = {};
  rows.forEach((r) => (board[r.key] = r.value));
  const el = document.createElement("div");
  el.setAttribute("data-lenis-prevent", "");
  el.style.cssText =
    "position:fixed;inset-block-end:16px;inset-inline-end:16px;z-index:3000;width:250px;max-height:70vh;overflow:auto;" +
    "padding:12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--ink);" +
    "font:500 10px/1.4 ui-monospace,monospace;box-shadow:var(--shadow-modal)";
  const head = document.createElement("div");
  head.textContent = `${name.toUpperCase()} TUNE`;
  head.style.cssText =
    "display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:var(--ink-muted)";
  const copy = document.createElement("button");
  copy.textContent = "COPY";
  copy.style.cssText =
    "border:1px solid var(--line);background:var(--fill);color:var(--ink);border-radius:99px;padding:2px 8px;font:inherit;cursor:pointer";
  copy.onclick = () => {
    navigator.clipboard?.writeText(JSON.stringify(board, null, 2));
    copy.textContent = "COPIED";
    setTimeout(() => (copy.textContent = "COPY"), 900);
  };
  const save = document.createElement("button");
  save.textContent = "SAVE";
  save.style.cssText = copy.style.cssText + ";margin-inline-start:4px";
  save.onclick = () => {
    save.textContent = "…";
    fetch(`/__tune/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(board),
    })
      .then((r) => (save.textContent = r.ok ? "SAVED" : "FAILED"))
      .catch(() => (save.textContent = "FAILED"))
      .finally(() => setTimeout(() => (save.textContent = "SAVE"), 900));
  };
  const actions = document.createElement("span");
  actions.append(copy, save);
  head.append(actions);
  el.append(head);
  for (const row of rows) {
    const wrap = document.createElement("label");
    wrap.style.cssText = "display:block;margin-block:6px";
    const cap = document.createElement("div");
    cap.style.cssText = "display:flex;justify-content:space-between";
    const label = document.createElement("span");
    label.textContent = row.label;
    const val = document.createElement("span");
    val.style.color = "var(--ink-muted)";
    val.textContent = String(row.value);
    cap.append(label, val);
    const range = document.createElement("input");
    range.type = "range";
    range.min = String(row.min);
    range.max = String(row.max);
    range.step = String(row.step);
    range.value = String(row.value);
    range.style.cssText = "width:100%;accent-color:var(--ink)";
    range.oninput = () => {
      board[row.key] = Number(range.value);
      val.textContent = range.value;
      onChange(board);
    };
    wrap.append(cap, range);
    el.append(wrap);
  }
  document.body.append(el);
  return () => el.remove();
}

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
    let last = performance.now();
    const frame = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;
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
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    console.log("[perf] armed");
  }
}
export const Perf = new _Perf();

export function mountDevkit(opts: { columns?: number } = {}) {
  DevGrid.init(opts);
  Perf.init();
}
