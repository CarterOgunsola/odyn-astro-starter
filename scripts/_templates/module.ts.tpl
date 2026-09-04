import { onDestroy } from "@odyn/lifecycle";
import gsap from "@/lib/gsap";

class ___PASCAL__ {
  init() {
    const root = document.querySelector<HTMLElement>("[data-__KEBAB__]");
    if (!root) return;

    const onClick = () => {};
    root.addEventListener("click", onClick);

    onDestroy(() => {
      root.removeEventListener("click", onClick);
      gsap.killTweensOf(root);
    });
  }
}

export const __PASCAL__ = new ___PASCAL__();
