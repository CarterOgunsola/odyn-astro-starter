import gsap from "gsap";
import { wipeLeg, type Leg, type LegContext, type RevealMode } from "./leg";

type State = "boot" | "covering" | "covered" | "revealing" | "idle";
type NavType = "push" | "replace" | "traverse";
type PreparationEvent = Event & {
  from?: URL;
  to?: URL;
  navigationType?: NavType;
  sourceElement?: Element;
  info?: unknown;
  loader: () => Promise<void>;
};

export type ConductorOptions = {
  leg?: Leg;
  lock?: { stop(): symbol; start(token?: symbol): void };
  chrome?: string;
  holdCapMs?: number;
  hangMs?: number;
  carve?: (from: string, to: string, info: unknown) => boolean;
  onIntent?: (pathname: string) => void;
  focus?: boolean;
};

export type RevealDetail = { mode: RevealMode; wipeDur: number; tl?: gsap.core.Timeline };

const HOLD_CAP_MS = 3000;
const HANG_MS = 20000;
const DEAD_NAV_MS = 600;

class _Conductor {
  private panel: HTMLElement | null = null;
  private leg: Leg = wipeLeg();
  private opts: ConductorOptions = {};
  private state: State = "idle";
  private disabled = false;
  private reduced = false;
  private lockToken: symbol | null = null;
  private watchdog = 0;
  private tl: gsap.core.Animation | null = null;
  private revealWipeDur = 0;
  private coverPromise: Promise<void> | null = null;
  private navSeq = 0;
  private swapSeen = false;
  private uaSwipe = false;
  private inFlight = false;
  private pendingTo: string | null = null;
  private coverAt = 0;
  private holds: Promise<unknown>[] = [];
  private maxHoldCap = 0;
  private idleCall: (() => void) | null = null;
  private dbg: HTMLElement | null = null;
  private t = { prep: 0, covered: 0, swap: 0, reveal: 0, idle: 0 };
  private route = { from: "", to: "" };

  trigger: { type: NavType | "none"; source: Element | null } = { type: "none", source: null };
  carve: "conductor" | "ua-swipe" | "carved" | "none" = "none";

  get active(): boolean {
    return !this.disabled && (this.state === "boot" || this.state === "covering" || this.state === "covered");
  }

  get busy(): boolean {
    return this.active;
  }

  get phase(): State {
    return this.state;
  }

  hold(p: Promise<unknown>, capMs = this.opts.holdCapMs ?? HOLD_CAP_MS) {
    if (this.disabled || !this.active) return;
    const cap = new Promise((r) => setTimeout(r, capMs));
    this.maxHoldCap = Math.max(this.maxHoldCap, capMs);
    this.holds.push(Promise.race([p.catch(() => {}), cap]));
    this.armWatchdog(this.watchdogMs());
  }

  init(opts: ConductorOptions = {}) {
    this.opts = opts;
    if (opts.leg) this.leg = opts.leg;
    this.panel = document.querySelector<HTMLElement>("[data-conductor-panel]");
    if (!this.panel) {
      this.disabled = true;
      return;
    }

    if (new URLSearchParams(location.search).getAll("debug").includes("conductor") && !this.dbg) {
      const el = document.createElement("pre");
      el.setAttribute("data-conductor-debug", "");
      el.style.cssText =
        "position:fixed;inset-inline-start:8px;inset-block-end:8px;z-index:3000;margin:0;padding:6px 8px;" +
        "font:500 10px/1.5 ui-monospace,monospace;color:var(--ink);background:var(--surface);" +
        "border:1px solid var(--line);border-radius:6px;pointer-events:none;white-space:pre";
      document.documentElement.append(el);
      this.dbg = el;
      (window as unknown as { __conductor?: unknown }).__conductor = this;
    }

    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = mq.matches;
    mq.addEventListener?.("change", (e) => (this.reduced = e.matches));

    const html = document.documentElement;
    const mode = html.getAttribute("data-conductor");
    this.panel.classList.add("is-js");
    this.leg.mount(this.ctx());

    this.disabled = mode === "off";
    if (this.disabled) {
      html.removeAttribute("data-conductor");
      this.setIdle();
      return;
    }

    this.leg.covered(this.ctx());
    this.leg.enter?.({ ...this.ctx(), mode: mode === "boot" ? "boot" : "fast" });
    html.removeAttribute("data-conductor");
    this.setState(mode === "boot" ? "boot" : "covered");
    this.setInert(true);
    this.bindNav();

    this.acquireLock();
    this.armWatchdog(this.watchdogMs());
    void this.playEntry(mode === "boot" ? "boot" : "fast");
  }

  private async playEntry(mode: "boot" | "fast") {
    await new Promise((r) => setTimeout(r, mode === "boot" ? 200 : 120));
    if (this.state !== "boot" && this.state !== "covered") return;
    await this.fontsSettled(mode === "boot" ? undefined : 300);
    let pending = this.holds.splice(0);
    while (pending.length) {
      this.armWatchdog(this.watchdogMs());
      await Promise.all(pending);
      if (this.state !== "boot" && this.state !== "covered") return;
      pending = this.holds.splice(0);
    }
    this.reveal(mode);
  }

  private bindNav() {
    const w = window as unknown as { __conductorBound?: boolean };
    if (w.__conductorBound) return;
    w.__conductorBound = true;

    // Capture phase, so it runs before Astro's popstate handler dispatches before-preparation.
    window.addEventListener(
      "popstate",
      (e) => {
        this.uaSwipe = !!(e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition;
      },
      { capture: true },
    );

    window.addEventListener("pagehide", () => {
      if (this.state !== "idle") this.forceClear();
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted && this.state !== "idle") this.forceClear();
    });

    // Guard clicks here at capture. Cancelling astro:before-preparation instead makes Astro hard-load the page.
    document.addEventListener(
      "click",
      (e) => {
        if (this.disabled || e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const a = (e.target as Element | null)?.closest?.("a[href], area[href]") as
          HTMLAnchorElement | SVGAElement | null;
        if (!a) return;
        const href = a instanceof HTMLElement ? a.href : a.href.baseVal;
        if (!href) return;
        const target = a instanceof HTMLElement ? a.target : "";
        if ((target && target !== "_self") || a.hasAttribute("download")) return;
        const to = new URL(href, location.href);
        if (to.origin !== location.origin) return;
        const samePage = to.pathname === location.pathname && to.search === location.search;
        if (samePage && to.hash && to.hash !== location.hash) return;
        if (this.busy) {
          e.preventDefault();
          return;
        }
        if (samePage) {
          e.preventDefault();
          return;
        }
        a.classList.add("is-navving-from");
      },
      { capture: true },
    );

    const nav = (
      window as unknown as {
        navigation?: {
          addEventListener: (
            type: "navigate",
            cb: (e: { navigationType: string; cancelable: boolean; preventDefault: () => void }) => void,
          ) => void;
        };
      }
    ).navigation;
    nav?.addEventListener("navigate", (e) => {
      if (this.disabled) return;
      if (e.navigationType === "traverse" && e.cancelable && this.busy) e.preventDefault();
    });

    document.addEventListener("astro:before-preparation", (evt) => {
      if (this.disabled) return;
      const e = evt as PreparationEvent;
      const from = e.from?.pathname ?? "";
      const to = e.to?.pathname ?? "";
      this.trigger = { type: e.navigationType ?? "none", source: e.sourceElement ?? null };
      this.route = { from, to };
      this.carve = "conductor";
      this.note();
      this.opts.onIntent?.(to);
      const uaSwipe = this.uaSwipe;
      this.uaSwipe = false;
      if (e.navigationType === "traverse" && uaSwipe) {
        this.carve = "ua-swipe";
        this.note();
        return;
      }
      if (this.opts.carve?.(from, to, e.info)) {
        this.clearNavStamp();
        this.carve = "carved";
        this.note();
        return;
      }
      if (/\.[a-z0-9]{2,5}$/i.test(to) && !/\.html?$/i.test(to)) {
        this.clearNavStamp();
        this.carve = "carved";
        this.note();
        return;
      }
      this.chromeEl()?.classList.add("is-conductor-nav");
      const orig = e.loader;
      this.coverAt = performance.now();
      this.pendingTo = e.to?.href ?? null;
      const covered = this.cover();
      const nav = ++this.navSeq;
      this.swapSeen = false;
      this.inFlight = true;
      e.loader = async () => {
        try {
          await Promise.all([orig.call(e), covered]);
          if (e.defaultPrevented) return;
          window.setTimeout(() => {
            if (
              this.navSeq === nav &&
              !this.swapSeen &&
              (this.state === "covered" || this.state === "covering")
            )
              this.forceClear();
          }, DEAD_NAV_MS);
        } catch (err) {
          if ((err as Error)?.name !== "AbortError") this.forceClear();
          throw err;
        } finally {
          if (this.navSeq === nav) this.inFlight = false;
        }
      };
    });

    document.addEventListener("astro:before-swap", () => {
      this.swapSeen = true;
      this.t.swap = performance.now();
      try {
        performance.mark("conductor:swap");
      } catch {}
    });

    document.addEventListener("astro:after-swap", () => {
      if (this.state === "covering" || this.state === "covered") this.setInert(true);
    });

    document.addEventListener("astro:page-load", () => {
      if (this.disabled) return;
      if (this.carve !== "conductor" && this.carve !== "none") this.focusHeading();
      const drainThenReveal = async () => {
        if (this.state !== "covered") return;
        const nav = this.navSeq;
        let pending = this.holds.splice(0);
        while (pending.length) {
          this.armWatchdog(this.watchdogMs());
          await Promise.all(pending);
          if (this.navSeq !== nav || this.state !== "covered") return;
          pending = this.holds.splice(0);
        }
        this.reveal("nav");
      };
      if (this.state === "covering") void this.coverPromise?.then(drainThenReveal);
      else if (this.state === "covered") void drainThenReveal();
      if (this.state !== "idle") this.armWatchdog(this.watchdogMs());
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.tl && this.tl.progress() < 1) this.tl.progress(1);
    });
  }

  private cover(): Promise<void> {
    if (this.state === "covering" && this.coverPromise) return this.coverPromise;
    if (this.state === "covered" || this.state === "boot") {
      this.killTl();
      this.leg.covered(this.ctx());
      this.setState("covered");
      return Promise.resolve();
    }
    const exited =
      this.state === "revealing" && this.revealWipeDur > 0
        ? Math.min(1, (this.tl?.time() ?? 0) / this.revealWipeDur)
        : 1;
    if (this.state === "revealing" && this.tl) {
      const rt = this.tl as gsap.core.Timeline;
      rt.getTweensOf(this.panel!).forEach((t) => t.kill());
      if (this.idleCall) rt.remove(this.idleCall);
    }
    this.tl = null;
    this.idleCall = null;
    this.setState("covering");
    this.acquireLock();
    this.armWatchdog(5000);
    this.setInert(true);
    this.coverPromise = new Promise<void>((resolve) => {
      const done = () => {
        this.setState("covered");
        resolve();
      };
      const tl = gsap.timeline({ onComplete: done, onInterrupt: done });
      this.tl = tl;
      this.leg.cover(tl, { ...this.ctx(), exited });
      try {
        performance.mark("conductor:cover");
      } catch {}
    });
    return this.coverPromise;
  }

  private reveal(mode: RevealMode) {
    this.setState("revealing");
    this.releaseLock();
    this.clearWatchdog();
    this.killTl();
    this.coverPromise = null;
    this.holds.length = 0;
    this.maxHoldCap = 0;
    if (this.panel) gsap.set(this.panel, { pointerEvents: "none" });
    this.setInert(false);
    if (mode === "nav" && this.opts.focus !== false) this.focusHeading(mode);

    const tl = gsap.timeline();
    this.tl = tl;
    const wipeDur = this.leg.reveal(tl, { ...this.ctx(), mode });
    this.revealWipeDur = wipeDur;
    const idleCall = () => {
      if (this.tl === tl) this.setIdle();
    };
    this.idleCall = idleCall;
    tl.call(idleCall, [], wipeDur);
    this.dispatchReveal({ mode, wipeDur: this.reduced ? 0 : wipeDur, tl });
  }

  private dispatchReveal(detail: RevealDetail) {
    document.dispatchEvent(new CustomEvent<RevealDetail>("conductor:reveal", { detail }));
  }

  private focusHeading(mode: RevealMode = "nav") {
    if (this.trigger.type === "traverse") return;
    const h = ["main [data-focus-target]", "main h1", "main h2", "main"]
      .map((sel) => document.querySelector<HTMLElement>(sel))
      .find(Boolean);
    if (!h) return;
    if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
    try {
      h.focus({ preventScroll: mode === "nav" });
    } catch {}
  }

  private armWatchdog(ms: number) {
    this.clearWatchdog();
    this.watchdog = window.setTimeout(() => this.onWatchdog(), ms);
  }

  private onWatchdog() {
    if (this.state === "idle") return;
    if (this.inFlight) {
      if (this.pendingTo && performance.now() - this.coverAt > (this.opts.hangMs ?? HANG_MS)) {
        location.assign(this.pendingTo);
        return;
      }
      this.armWatchdog(1000);
      return;
    }
    this.forceClear();
  }

  private clearWatchdog() {
    if (this.watchdog) {
      clearTimeout(this.watchdog);
      this.watchdog = 0;
    }
  }

  private forceClear() {
    if (this.state === "revealing") this.tl?.progress(1);
    this.killTl();
    this.idleCall = null;
    this.coverPromise = null;
    this.holds.length = 0;
    this.maxHoldCap = 0;
    this.dispatchReveal({ mode: "nav", wipeDur: 0 });
    this.setIdle();
  }

  private setInert(on: boolean) {
    for (const el of document.body.children) {
      if (el.matches("[data-conductor-panel], .astro-route-announcer")) continue;
      el.toggleAttribute("inert", on);
    }
  }

  private setIdle() {
    this.clearWatchdog();
    this.releaseLock();
    this.setInert(false);
    this.chromeEl()?.classList.remove("is-conductor-nav");
    this.clearNavStamp();
    if (this.panel) this.leg.park(this.ctx());
    this.setState("idle");
  }

  private acquireLock() {
    if (this.opts.lock && !this.lockToken) this.lockToken = this.opts.lock.stop();
  }

  private watchdogMs(): number {
    return Math.max(this.opts.holdCapMs ?? HOLD_CAP_MS, this.maxHoldCap) + 3000;
  }

  private releaseLock() {
    if (this.lockToken) {
      this.opts.lock?.start(this.lockToken);
      this.lockToken = null;
    }
  }

  private clearNavStamp() {
    document.querySelectorAll(".is-navving-from").forEach((el) => el.classList.remove("is-navving-from"));
  }

  private chromeEl(): HTMLElement | null {
    return document.querySelector<HTMLElement>(this.opts.chrome ?? "[data-header]");
  }

  private ctx(): LegContext {
    return { panel: this.panel!, reduced: this.reduced };
  }

  private killTl() {
    this.tl?.kill();
    this.tl = null;
  }

  private fontsSettled(ms = 2000): Promise<unknown> {
    const cap = new Promise((r) => setTimeout(r, ms));
    try {
      return Promise.race([document.fonts.ready, cap]);
    } catch {
      return cap;
    }
  }

  private setState(s: State) {
    if (this.state === s) return;
    this.state = s;
    try {
      performance.mark(`conductor:${s}`);
      if (s === "covering") {
        performance.clearMarks();
        performance.clearMeasures();
      }
      if (s === "covering") this.t = { prep: performance.now(), covered: 0, swap: 0, reveal: 0, idle: 0 };
      if (s === "covered") this.t.covered = performance.now();
      if (s === "revealing") this.t.reveal = performance.now();
      if (s === "idle") {
        this.t.idle = performance.now();
        if (this.t.prep) performance.measure("conductor:nav", { start: this.t.prep, end: this.t.idle });
      }
    } catch {}
    this.note();
  }

  private note() {
    if (!this.dbg) return;
    const ms = (a: number, b: number) => (a && b && b >= a ? `${Math.round(b - a)}ms` : "-");
    const src = this.trigger.source;
    const tag = src ? `<${src.tagName.toLowerCase()}${src.id ? "#" + src.id : ""}>` : "-";
    this.dbg.textContent = [
      `state ${this.state}${this.inFlight ? " · in flight" : ""}`,
      `nav   ${this.trigger.type} via ${tag}`,
      `route ${this.route.from || "-"} → ${this.route.to || "-"}  [${this.carve}]`,
      `lock  ${this.lockToken ? "scroll" : "-"}  holds ${this.holds.length}`,
      `cover ${ms(this.t.prep, this.t.covered)}  fetch ${ms(this.t.prep, this.t.swap)}  reveal ${ms(this.t.reveal, this.t.idle)}`,
    ].join("\n");
  }
}

export const Conductor = new _Conductor();
