import { test, expect } from "bun:test";
import gsap from "gsap";
import { EASES, bezier, css, easingCss, registerEases } from "@/config/easing";

test("a bezier runs 0 to 1, monotonic, linear when linear", () => {
  const lin = bezier(0, 0, 1, 1);
  expect(lin(0)).toBe(0);
  expect(lin(1)).toBe(1);
  expect(Math.abs(lin(0.5) - 0.5)).toBeLessThan(1e-4);
  const out = bezier(...EASES["out-quad"]);
  let last = 0;
  for (let i = 1; i <= 20; i++) {
    const v = out(i / 20);
    expect(v).toBeGreaterThan(last - 1e-9);
    last = v;
  }
  expect(out(0.25)).toBeGreaterThan(0.35);
});

test("CSS and GSAP get the same curves", () => {
  expect(css("out-quad")).toBe("cubic-bezier(0.5, 1, 0.89, 1)");
  expect(easingCss()).toContain("--ease-in-out-quart:cubic-bezier(0.76, 0, 0.24, 1)");
  registerEases(gsap);
  const fn = gsap.parseEase("house.in-out-quart") as (t: number) => number;
  expect(typeof fn).toBe("function");
  expect(Math.abs(fn(0.5) - bezier(...EASES["in-out-quart"])(0.5))).toBeLessThan(1e-9);
});
