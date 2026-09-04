export const EASES = {
  "out-quad": [0.5, 1, 0.89, 1],
  "in-out-quart": [0.76, 0, 0.24, 1],
} as const;

export type EaseName = keyof typeof EASES;

export const css = (name: EaseName) => `cubic-bezier(${EASES[name].join(", ")})`;

export function easingCss(): string {
  const vars = Object.keys(EASES).map((n) => `--ease-${n}:${css(n as EaseName)}`);
  return `:root{${vars.join(";")}}`;
}

export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const A = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const B = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const C = (a1: number) => 3 * a1;
  const calc = (t: number, a1: number, a2: number) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const slope = (t: number, a1: number, a2: number) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      const dx = calc(t, x1, x2) - x;
      if (Math.abs(dx) < 1e-6) return t;
      t -= dx / s;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (hi - lo > 1e-6) {
      t = (lo + hi) / 2;
      if (calc(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return t;
  };
  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : calc(solveX(t), y1, y2));
}

export function registerEases(g: { registerEase: (name: string, fn: (t: number) => number) => void }) {
  for (const [name, [x1, y1, x2, y2]] of Object.entries(EASES))
    g.registerEase(`house.${name}`, bezier(x1, y1, x2, y2));
}
