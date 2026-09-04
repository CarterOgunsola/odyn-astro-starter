import { test, expect } from "bun:test";
import { Preloader } from "@odyn/engines";

const later = <T>(ms: number, value: T, fail = false) =>
  new Promise<T>((res, rej) => setTimeout(() => (fail ? rej(new Error("x")) : res(value)), ms));

test("progress climbs in the order items settle", async () => {
  const p = new Preloader();
  const seen: number[] = [];
  p.onProgress((x) => seen.push(Math.round(x * 100)));
  p.add("slow", () => later(30, 1))
    .add("fast", () => later(5, 2))
    .add("mid", () => later(15, 3));
  expect(p.progress).toBe(0);
  await p.run();
  expect(seen).toEqual([33, 67, 100]);
  expect(p.progress).toBe(1);
  expect(p.errors).toBe(0);
});

test("a rejecting item counts as settled and as an error, and never throws", async () => {
  const p = new Preloader();
  p.add("ok", () => later(5, 1)).add("bad", () => later(5, 0, true));
  let threw = false;
  try {
    await p.run();
  } catch {
    threw = true;
  }
  expect(threw).toBe(false);
  expect(p.progress).toBe(1);
  expect(p.errors).toBe(1);
});

test("abort resolves run() early and stops the reports", async () => {
  const p = new Preloader();
  const seen: number[] = [];
  p.onProgress((x) => seen.push(x));
  p.add("quick", () => later(5, 1)).add("slow", () => later(200, 2));
  const t0 = Date.now();
  setTimeout(() => p.abort(), 20);
  await p.run();
  expect(Date.now() - t0).toBeLessThan(150);
  expect(seen).toEqual([0.5]);
  await later(220, 0);
  expect(seen).toEqual([0.5]);
});

test("an empty loader is complete", async () => {
  const p = new Preloader();
  expect(p.progress).toBe(1);
  await p.run();
  expect(p.progress).toBe(1);
});
