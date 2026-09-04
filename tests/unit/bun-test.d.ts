// The slice of Bun's test module these tests use, so `astro check` can type them without a types package.
declare module "bun:test" {
  export function test(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  export function expect<T>(value: T): {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toBeLessThan(expected: number): void;
    toContain(expected: unknown): void;
    not: { toContain(expected: unknown): void; toBe(expected: T): void };
  };
}
