import gsap from "@/lib/gsap";
import { define } from "@/lib/elements";

export class __PASCAL__ extends HTMLElement {
  private onClick = () => {};

  connectedCallback() {
    this.addEventListener("click", this.onClick);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
    gsap.killTweensOf(this);
  }
}

define("__TAG__", __PASCAL__);
