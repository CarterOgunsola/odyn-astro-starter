import { Scroll } from "@/lib/scroll";

class _Header {
  private root: HTMLElement | null = null;

  init() {
    this.root = document.querySelector<HTMLElement>("[data-header]");
    // Capture phase, or the client router handles the click first.
    document.addEventListener(
      "click",
      (e) => {
        const a = (e.target as HTMLElement).closest?.("[data-skip]");
        if (!a) return;
        e.preventDefault();
        const main = document.getElementById("main");
        if (!main) return;
        const offset = -(this.root?.getBoundingClientRect().height ?? 0);
        Scroll.scrollTo(main, { immediate: true, force: true, offset });
        main.focus({ preventScroll: true });
      },
      { capture: true },
    );
  }

  sync(pathname: string) {
    if (!this.root) return;
    this.root.querySelectorAll<HTMLAnchorElement>("nav a[href]").forEach((a) => {
      const href = a.getAttribute("href") ?? "";
      const active = href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
}

export const Header = new _Header();
