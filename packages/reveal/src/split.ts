import gsap from "gsap";
import { onResize } from "@odyn/lifecycle";

const WS = /[ \t\n\r\f]+/;

export class LineSplit {
  private original: string;
  private hidden = true;
  private offResize: () => void;
  private measuredW = 0;

  constructor(private el: HTMLElement) {
    this.original = el.innerHTML;
    this.split();
    this.offResize = onResize({
      read: () => {
        this.measuredW = this.el.isConnected ? this.contentWidth() : 0;
      },
      write: () => {
        if (this.measuredW) this.split(this.measuredW);
      },
    });
    // Only while fonts still load: on a warm cache fonts.ready resolves inside the reveal dispatch and would drop the spans the tween holds.
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => this.resplitWhenSettled());
    }
  }

  lines(): HTMLElement[] {
    return [...this.el.querySelectorAll<HTMLElement>(".y")];
  }

  reveal() {
    this.hidden = false;
  }

  destroy() {
    this.offResize();
    this.el.innerHTML = this.original;
  }

  private resplitWhenSettled() {
    if (!this.el.isConnected) return;
    const active = gsap.getTweensOf(this.lines()).filter((t) => t.isActive());
    if (!active.length) {
      this.split();
      return;
    }
    Promise.all(active.map((t) => t.then())).then(() => {
      if (this.el.isConnected) this.split();
    });
  }

  private contentWidth(): number {
    const cs = getComputedStyle(this.el);
    const inner =
      parseFloat(cs.paddingLeft) +
      parseFloat(cs.paddingRight) +
      parseFloat(cs.borderLeftWidth) +
      parseFloat(cs.borderRightWidth);
    return this.el.getBoundingClientRect().width - (Number.isFinite(inner) ? inner : 0);
  }

  private split(knownWidth?: number) {
    const el = this.el;
    const src = document.createElement("div");
    src.innerHTML = this.original;
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const EL = "\u0001";
    const BR = "\u0002";
    const els: HTMLElement[] = [];
    let flat = "";
    src.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) flat += esc(n.textContent ?? "");
      else if (n.nodeType === Node.ELEMENT_NODE) {
        if ((n as HTMLElement).tagName === "BR") {
          flat += ` ${BR} `;
          return;
        }
        flat += `${EL}${els.length}${EL}`;
        els.push(n as HTMLElement);
      }
    });
    const tokens = flat.trim().split(WS).filter(Boolean);
    if (!tokens.length) return;

    const cs = getComputedStyle(el);
    const ghost = document.createElement("div");
    ghost.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap;" +
      `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};` +
      `font-style:${cs.fontStyle};letter-spacing:${cs.letterSpacing};word-spacing:${cs.wordSpacing};` +
      `text-transform:${cs.textTransform}`;
    document.body.append(ghost);
    const measure = (html: string) => {
      ghost.innerHTML = html;
      return ghost.getBoundingClientRect().width;
    };
    const width = knownWidth ?? this.contentWidth();

    const words: string[] = [];
    for (const t of tokens) {
      const m = t.match(/^([^\u0001]*)\u0001(\d+)\u0001([^\u0001]*)$/);
      if (!m) {
        words.push(t.replace(/\u0001(\d+)\u0001/g, (mm, i) => els[+i]?.outerHTML ?? mm));
        continue;
      }
      const [, before, idx, after] = m;
      const node = els[+idx];
      if (!node) continue;
      if (measure(before + node.outerHTML + after) <= width) {
        words.push(before + node.outerHTML + after);
        continue;
      }
      const parts = (node.textContent ?? "").split(WS).filter(Boolean);
      parts.forEach((part, i) => {
        const clone = node.cloneNode(false) as HTMLElement;
        clone.textContent = part;
        const lead = i === 0 ? before : "";
        const tail = i === parts.length - 1 ? after : "";
        words.push(lead + clone.outerHTML + tail);
      });
    }

    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      if (w === BR) {
        lines.push(line || "&nbsp;");
        line = "";
        continue;
      }
      const probe = line ? `${line} ${w}` : w;
      if (measure(probe) > width && line) {
        lines.push(line);
        line = w;
      } else {
        line = probe;
      }
    }
    if (line) lines.push(line);
    ghost.remove();

    const y = this.hidden ? 110 : 0;
    el.innerHTML = lines
      .map(
        (l) => `<span class="y_"><span class="y" style="transform:translate3d(0,${y}%,0)">${l}</span></span>`,
      )
      .join("");
  }
}
