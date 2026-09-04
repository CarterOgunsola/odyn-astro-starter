import type Lenis from "lenis";
import { Frame, onResize } from "@odyn/lifecycle";

export type ScrollState = {
  scroll: number;
  limit: number;
  velocity: number;
  direction: -1 | 0 | 1;
  progress: number;
};

type Listener = (s: Readonly<ScrollState>) => void;

class _Scroll {
  lenis: Lenis | null = null;
  readonly state: ScrollState = { scroll: 0, limit: 0, velocity: 0, direction: 0, progress: 0 };
  private holders = new Set<symbol>();
  private listeners = new Set<Listener>();
  private offFrame: (() => void) | null = null;
  private loading: Promise<void> | null = null;
  private generation = 0;
  private offResize: (() => void) | null = null;
  private onAfterSwap = () => this.adoptNativeScroll();
  private readout: HTMLElement | null = null;
  private onReadoutSwap = () => {
    if (this.readout && !this.readout.isConnected) document.body.append(this.readout);
  };

  init() {
    if (this.lenis || this.loading) return;
    const gen = ++this.generation;
    this.loading = import("lenis").then(({ default: LenisCtor }) => {
      this.loading = null;
      if (gen !== this.generation) return;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      // autoResize off: the one resize hub feeds Lenis.
      const lenis = new LenisCtor({ autoRaf: false, autoResize: false, smoothWheel: !reduced });
      this.lenis = lenis;
      this.offResize = onResize({ write: () => this.lenis?.resize() });
      lenis.on("scroll", (l) => this.publish(l));
      this.offFrame = Frame.add((time) => this.lenis?.raf(time), 10);
      document.addEventListener("astro:after-swap", this.onAfterSwap);
      if (this.holders.size) lenis.stop();
      this.publish(lenis);
    });
    if (new URLSearchParams(location.search).getAll("debug").includes("scroll")) this.mountReadout();
  }

  destroy() {
    this.generation++;
    if (!this.lenis) return;
    this.offFrame?.();
    this.offFrame = null;
    this.offResize?.();
    this.offResize = null;
    document.removeEventListener("astro:after-swap", this.onAfterSwap);
    this.lenis.destroy();
    this.lenis = null;
    this.holders.clear();
    this.listeners.clear();
    document.removeEventListener("astro:after-swap", this.onReadoutSwap);
    this.readout?.remove();
    this.readout = null;
    Object.assign(this.state, { scroll: 0, limit: 0, velocity: 0, direction: 0, progress: 0 });
  }

  on(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private publish(l: Lenis) {
    const s = this.state;
    s.scroll = l.scroll;
    s.limit = l.limit;
    s.velocity = l.velocity;
    s.direction = l.velocity === 0 ? 0 : (l.direction as ScrollState["direction"]);
    s.progress = l.progress;
    this.listeners.forEach((fn) => fn(s));
    if (this.readout) this.print();
  }

  private mountReadout() {
    const el = document.createElement("pre");
    el.dataset.scrollDebug = "";
    el.style.cssText =
      "position:fixed;left:8px;bottom:8px;z-index:9999;margin:0;padding:6px 8px;font:12px/1.4 monospace;" +
      "background:rgba(0,0,0,.72);color:#fff;pointer-events:none;white-space:pre";
    document.body.append(el);
    this.readout = el;
    document.addEventListener("astro:after-swap", this.onReadoutSwap);
    this.print();
  }

  private print() {
    if (!this.readout) return;
    const s = this.state;
    this.readout.textContent =
      `scroll ${s.scroll.toFixed(0)}\nlimit ${s.limit.toFixed(0)}\nvelocity ${s.velocity.toFixed(1)}\n` +
      `direction ${s.direction}\nprogress ${s.progress.toFixed(3)}`;
  }

  resize() {
    this.lenis?.resize();
  }

  private adoptNativeScroll() {
    this.lenis?.resize();
    this.lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    // Astro copies <html> attributes on swap, which drops the classes Lenis set.
    if (this.lenis) {
      const cl = document.documentElement.classList;
      cl.add("lenis");
      cl.toggle("lenis-stopped", !!this.lenis.isStopped);
    }
  }

  scrollTo(target: string | number | HTMLElement, opts?: Record<string, unknown>) {
    this.lenis?.scrollTo(target, opts);
  }

  stop(): symbol {
    const token = Symbol();
    this.holders.add(token);
    this.lenis?.stop();
    return token;
  }
  start(token?: symbol) {
    if (token) this.holders.delete(token);
    else this.holders.clear();
    if (this.holders.size === 0) this.lenis?.start();
  }
}

export const Scroll = new _Scroll();
