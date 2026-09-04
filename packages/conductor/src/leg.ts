import gsap from "gsap";

export type RevealMode = "boot" | "fast" | "nav";

export type LegContext = {
  panel: HTMLElement;
  reduced: boolean;
};

export interface Leg {
  mount(ctx: LegContext): void;
  enter?(ctx: LegContext & { mode: "boot" | "fast" }): void;
  covered(ctx: LegContext): void;
  park(ctx: LegContext): void;
  cover(tl: gsap.core.Timeline, ctx: LegContext & { exited: number }): number;
  reveal(tl: gsap.core.Timeline, ctx: LegContext & { mode: RevealMode }): number;
}

const CLIP_BELOW = "inset(100% 0% 0% 0%)";
const CLIP_COVERED = "inset(0% 0% 0% 0%)";
const CLIP_ABOVE = "inset(0% 0% 100% 0%)";

export type WipeOptions = {
  coverDur?: number;
  revealDur?: number;
  fastDur?: number;
  bootDur?: number;
  ease?: string;
  mark?: string | null;
};

export function wipeLeg(o: WipeOptions = {}): Leg {
  const coverDur = o.coverDur ?? 0.8;
  const revealDur = o.revealDur ?? 0.9;
  const fastDur = o.fastDur ?? 0.7;
  const bootDur = o.bootDur ?? 1.0;
  const ease = o.ease ?? "expo.inOut";
  const markSel = o.mark === undefined ? "[data-conductor-mark]" : o.mark;
  let mark: HTMLElement | null = null;
  const showMark = () => {
    if (!mark) return;
    gsap.killTweensOf(mark);
    gsap.set(mark, { opacity: 1, y: 0 });
  };
  return {
    mount({ panel }) {
      mark = markSel ? panel.querySelector<HTMLElement>(markSel) : null;
    },
    enter() {
      showMark();
    },
    covered({ panel }) {
      gsap.set(panel, { visibility: "visible", opacity: 1, clipPath: CLIP_COVERED, pointerEvents: "auto" });
    },
    park({ panel }) {
      gsap.set(panel, { visibility: "hidden", opacity: 1, clipPath: CLIP_BELOW, pointerEvents: "none" });
      showMark();
    },
    cover(tl, { panel, reduced, exited }) {
      showMark();
      gsap.set(panel, { visibility: "visible", opacity: 1, pointerEvents: "auto" });
      if (reduced) {
        gsap.set(panel, { clipPath: CLIP_COVERED });
        tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" }, 0);
        return 0.2;
      }
      if (exited >= 0.5) gsap.set(panel, { clipPath: CLIP_BELOW });
      tl.to(panel, { clipPath: CLIP_COVERED, duration: coverDur, ease }, 0);
      return coverDur;
    },
    reveal(tl, { panel, reduced, mode }) {
      if (reduced) {
        tl.to(panel, { opacity: 0, duration: 0.2, ease: "power1.out" }, 0);
        return 0.2;
      }
      const dur = mode === "boot" ? bootDur : mode === "fast" ? fastDur : revealDur;
      if (mark) tl.to(mark, { y: -32, opacity: 0, duration: 0.45, ease: "power2.in" }, 0);
      tl.to(panel, { clipPath: CLIP_ABOVE, duration: dur, ease }, 0);
      return dur;
    },
  };
}
