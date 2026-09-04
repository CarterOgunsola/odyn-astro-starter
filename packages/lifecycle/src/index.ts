import gsap from "gsap";

export function safe(name: string, fn: () => void) {
  const t0 = performance.now();
  try {
    fn();
  } catch (e) {
    console.error(`[mount] ${name} failed`, e);
  } finally {
    try {
      performance.measure(`mount:${name}`, { start: t0 });
    } catch {}
  }
}

type Fn = () => void;
let destroyQueue: Fn[] = [];

export function onDestroy(fn: Fn) {
  destroyQueue.push(fn);
}

export function runDestroy() {
  const q = destroyQueue;
  destroyQueue = [];
  q.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("[destroy]", e);
    }
  });
}

type FrameFn = (time: number, dt: number) => void;
type FrameSub = { fn: FrameFn; priority: number; alive: boolean };
const frameSubs: FrameSub[] = [];
let frameBound = false;
let last = 0;

function tick(time: number) {
  const now = time * 1000;
  const dt = last ? Math.min(now - last, 100) : 16.7;
  last = now;
  const snapshot = frameSubs.slice();
  for (const s of snapshot) if (s.alive) s.fn(now, dt);
}

export const Frame = {
  add(fn: FrameFn, priority = 20): () => void {
    if (!frameBound) {
      frameBound = true;
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const sub: FrameSub = { fn, priority, alive: true };
    frameSubs.push(sub);
    frameSubs.sort((a, b) => a.priority - b.priority);
    return () => {
      sub.alive = false;
      const i = frameSubs.indexOf(sub);
      if (i >= 0) frameSubs.splice(i, 1);
    };
  },
};

type ResizeSub = { read?: () => void; write: () => void };
const resizeSubs = new Set<ResizeSub>();
let resizeTimer = 0;
let resizeBound = false;

function fireResize() {
  const list = [...resizeSubs];
  list.forEach((s) => s.read?.());
  list.forEach((s) => s.write());
}

export function onResize(sub: ResizeSub): () => void {
  if (!resizeBound) {
    resizeBound = true;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => requestAnimationFrame(fireResize), 40);
      },
      { passive: true },
    );
  }
  resizeSubs.add(sub);
  return () => resizeSubs.delete(sub);
}

export type Global = {
  name: string;
  init: () => void;
  onRoute?: (pathname: string) => void;
};
export type Page = { name: string; mount: () => void };

export type AppOptions = {
  globals: Global[];
  pages: Page[];
  runtime?: () => void;
  after?: () => void;
  beforeSwap?: () => void;
};

export function createApp(opts: AppOptions) {
  let booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    opts.globals.forEach((g) => safe(g.name, g.init));
  }

  function mount() {
    safe("boot", boot);
    if (opts.runtime) safe("runtime", opts.runtime);
    opts.globals.forEach((g) => g.onRoute && safe(`${g.name}.onRoute`, () => g.onRoute!(location.pathname)));
    opts.pages.forEach((p) => safe(p.name, p.mount));
    if (opts.after) safe("after", opts.after);
  }

  function unmount() {
    if (opts.beforeSwap) safe("beforeSwap", opts.beforeSwap);
    runDestroy();
  }

  const w = window as unknown as { __odynApp?: boolean };
  if (w.__odynApp) return { mount, unmount };
  w.__odynApp = true;
  // astro:page-load fires on the first load and after every swap.
  document.addEventListener("astro:page-load", mount);
  document.addEventListener("astro:before-swap", unmount);
  return { mount, unmount };
}
