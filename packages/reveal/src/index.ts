import gsap from "gsap";
import { onDestroy } from "@odyn/lifecycle";
import { Conductor, type RevealDetail } from "@odyn/conductor";
import { LineSplit } from "./split";

export { LineSplit };

export type RevealTiming = {
  y: gsap.TweenVars;
  o: gsap.TweenVars;
  x: gsap.TweenVars;
  stagger: number;
  anchor: number;
};

const timing: RevealTiming = {
  y: { duration: 1.2, ease: "expo.out" },
  o: { duration: 1.0, ease: "power2.out" },
  x: { duration: 1.4, ease: "expo.out" },
  stagger: 0.1,
  anchor: 0.5,
};

type Kind = "y" | "s" | "o" | "x";
type Item = {
  el: HTMLElement;
  kind: Kind;
  delayBelow: number;
  delayAbove: number;
  split: LineSplit | null;
  targets: HTMLElement[];
  played: boolean;
};

const RX = /^z-(y|s|o|x)(?:-(\d+))?(?:-(\d+))?$/;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

class _Reveal {
  init(root: ParentNode = document) {
    if (reduced()) return;
    const items: Item[] = [];
    root.querySelectorAll<HTMLElement>('main [class*="z-"]').forEach((el) => {
      let m: RegExpMatchArray | null = null;
      for (const c of el.classList) if ((m = c.match(RX))) break;
      if (!m) return;
      const kind = m[1] as Kind;
      const a = m[2] ? parseInt(m[2], 10) * 100 : 0;
      const b = m[3] ? parseInt(m[3], 10) * 100 : a;
      const item: Item = {
        el,
        kind,
        delayBelow: a / 1000,
        delayAbove: b / 1000,
        split: null,
        targets: [el],
        played: false,
      };
      if (kind === "o") gsap.set(el, { opacity: 0 });
      else if (kind === "x") gsap.set(el, { scaleX: 0, transformOrigin: "0% 50%" });
      else if (kind === "s") {
        item.split = new LineSplit(el);
        item.targets = item.split.lines();
      } else {
        const inner = document.createElement("span");
        inner.className = "y";
        inner.innerHTML = el.innerHTML;
        el.innerHTML = "";
        el.classList.add("y_");
        el.append(inner);
        gsap.set(inner, { yPercent: 110 });
        item.targets = [inner];
      }
      items.push(item);
    });
    if (!items.length) return;

    const play = (item: Item, above: boolean, base = 0, tl?: gsap.core.Timeline) => {
      if (item.played) return;
      item.played = true;
      const at = base + (above ? item.delayAbove : item.delayBelow);
      if (item.kind === "o") {
        const vars = { opacity: 1, ...timing.o, clearProps: "opacity" };
        if (tl) tl.to(item.el, vars, at);
        else gsap.to(item.el, { ...vars, delay: at });
        return;
      }
      if (item.kind === "x") {
        const vars = { scaleX: 1, ...timing.x, clearProps: "transform" };
        if (tl) tl.to(item.el, vars, at);
        else gsap.to(item.el, { ...vars, delay: at });
        return;
      }
      item.split?.reveal();
      const targets = item.split ? item.split.lines() : item.targets;
      const from = { yPercent: 110, y: 0 };
      const vars = {
        yPercent: 0,
        ...timing.y,
        stagger: targets.length > 10 ? timing.stagger / 2 : timing.stagger,
        clearProps: "transform",
      };
      if (tl) tl.fromTo(targets, from, vars, at);
      else gsap.fromTo(targets, from, { ...vars, delay: at });
    };

    const above = items.filter((i) => i.el.getBoundingClientRect().top < innerHeight);
    const below = items.filter((i) => !above.includes(i));

    const playAbove = (e?: Event) => {
      const d = (e as CustomEvent<RevealDetail> | undefined)?.detail;
      const base = (d?.wipeDur ?? 0) * timing.anchor;
      above.forEach((i) => play(i, true, base, d?.tl));
    };
    if (Conductor.active) {
      document.addEventListener("conductor:reveal", playAbove, { once: true });
      onDestroy(() => document.removeEventListener("conductor:reveal", playAbove));
    } else {
      playAbove();
    }

    if (below.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const item = below.find((i) => i.el === e.target);
            if (item) {
              play(item, false);
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      below.forEach((i) => io.observe(i.el));
      onDestroy(() => io.disconnect());
    }

    onDestroy(() => {
      items.forEach((i) => {
        gsap.killTweensOf(i.kind === "o" || i.kind === "x" ? i.el : i.split ? i.split.lines() : i.targets);
        i.split?.destroy();
      });
    });
  }
}

export function arrive(target: object, vars: gsap.TweenVars): () => void {
  const play = (d?: RevealDetail) => {
    const v = { ...timing.y, ...vars };
    if (d?.tl) d.tl.to(target, v, (d.wipeDur ?? 0) * timing.anchor);
    else gsap.to(target, v);
  };
  if (!Conductor.active) {
    play();
    return () => gsap.killTweensOf(target);
  }
  const on = (e: Event) => play((e as CustomEvent<RevealDetail>).detail);
  document.addEventListener("conductor:reveal", on, { once: true });
  return () => {
    document.removeEventListener("conductor:reveal", on);
    gsap.killTweensOf(target);
  };
}

export const Reveal = new _Reveal();
