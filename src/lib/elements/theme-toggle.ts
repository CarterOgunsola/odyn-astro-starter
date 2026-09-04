import { Theme, type ThemeName } from "@/lib/theme";
import gsap from "@/lib/gsap";
import { define } from "@/lib/elements";

export class ThemeToggle extends HTMLElement {
  private bg: HTMLElement | null = null;
  private reduced = false;
  private offChange = () => {};
  private onClick = (e: Event) => {
    const seg = (e.target as HTMLElement).closest<HTMLElement>("[data-theme-set]");
    const next = seg?.getAttribute("data-theme-set");
    if (next === "light" || next === "dark") Theme.set(next);
  };

  connectedCallback() {
    this.bg = this.querySelector<HTMLElement>("[data-theme-bg]");
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.place(Theme.current());
    this.addEventListener("click", this.onClick);
    this.offChange = Theme.onChange((t) => this.place(t, true));
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
    this.offChange();
    if (this.bg) gsap.killTweensOf(this.bg);
  }

  private place(theme: ThemeName, animate = false) {
    const segs = this.querySelectorAll<HTMLElement>("[data-theme-set]");
    const target = this.querySelector<HTMLElement>(`[data-theme-set="${theme}"]`);
    segs.forEach((s) => s.setAttribute("aria-pressed", String(s === target)));
    if (!target || !this.bg || target.contains(this.bg)) return;
    if (!animate || this.reduced) {
      target.prepend(this.bg);
      return;
    }
    const first = this.bg.getBoundingClientRect();
    gsap.killTweensOf(this.bg);
    target.prepend(this.bg);
    const last = this.bg.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;
    gsap.fromTo(
      this.bg,
      { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin: "0 0" },
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.45,
        ease: "house.in-out-quart",
        clearProps: "transform",
      },
    );
  }
}

define("theme-toggle", ThemeToggle);
