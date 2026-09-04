export { mediaHold, Preloader, type PreloadItem } from "./media";

export type Engine = {
  name: string;
  when: string;
  sticky?: boolean;
  routes: RegExp;
  load: () => Promise<() => void>;
};

export type EnginesOptions = {
  engines: Engine[];
  hold: (p: Promise<unknown>, capMs?: number) => void;
  safe: (name: string, fn: () => void) => void;
  holdCapMs?: number;
};

export function createEngines(opts: EnginesOptions) {
  const { engines, hold, safe, holdCapMs = 8000 } = opts;
  const loads = new Map<string, Promise<() => void>>();
  const loadOf = (e: Engine) => {
    let p = loads.get(e.name);
    if (!p) {
      const started = e.load();
      p = started;
      let settled = false;
      started.then(
        () => (settled = true),
        () => {
          settled = true;
          loads.delete(e.name);
        },
      );
      setTimeout(() => {
        if (!settled && loads.get(e.name) === started) loads.delete(e.name);
      }, holdCapMs);
      loads.set(e.name, p);
    }
    return p;
  };

  let swap = 0;

  return {
    bumpSwap() {
      swap++;
    },
    mount() {
      const token = swap;
      for (const e of engines) {
        const here = !!document.querySelector(e.when);
        if (!here && !(e.sticky && loads.has(e.name))) continue;
        const p = loadOf(e).then((init) => {
          if (token !== swap) return;
          safe(e.name, init);
        });
        hold(p, holdCapMs);
      }
    },
    prefetch(pathname: string) {
      for (const e of engines) if (e.routes.test(pathname)) void loadOf(e);
    },
    bindHover() {
      document.addEventListener(
        "pointerover",
        (ev) => {
          const a = (ev.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
          if (!a) return;
          const to = new URL(a.href, location.href);
          if (to.origin === location.origin) this.prefetch(to.pathname);
        },
        { passive: true },
      );
    },
  };
}
