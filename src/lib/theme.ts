import { SITE } from "@/config/site";

const KEY = "theme";
export type ThemeName = "light" | "dark";
type Listener = (t: ThemeName) => void;

class _Theme {
  private listeners = new Set<Listener>();

  current(): ThemeName {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  init() {
    this.syncColor();
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (e) => {
      try {
        if ((localStorage.getItem(KEY) ?? SITE.theme) !== "system") return;
      } catch {
        return;
      }
      this.apply(e.matches ? "dark" : "light");
    });
  }

  set(next: ThemeName) {
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    this.apply(next);
  }

  onChange(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  syncColor() {
    const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
    if (!paper) return;
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((m) => (m.content = paper));
  }

  private apply(t: ThemeName) {
    document.documentElement.dataset.theme = t;
    this.syncColor();
    this.listeners.forEach((fn) => fn(t));
  }
}

export const Theme = new _Theme();
