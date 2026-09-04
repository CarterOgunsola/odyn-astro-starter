import { test, expect } from "bun:test";
import gsap from "gsap";
import { Frame } from "@odyn/lifecycle";

const tick = () => gsap.ticker.tick();

test("a self-removing subscriber does not skip the next one", () => {
  const ran: string[] = [];
  let offA = () => {};
  offA = Frame.add(() => {
    ran.push("A");
    offA();
  }, 0);
  const offB = Frame.add(() => ran.push("B"), 5);
  tick();
  expect(ran).toEqual(["A", "B"]);
  ran.length = 0;
  tick();
  expect(ran).toEqual(["B"]);
  offB();
});

test("a subscriber added mid-tick runs once, next frame", () => {
  const ran: string[] = [];
  let offY = () => {};
  let added = false;
  const offX = Frame.add(() => {
    ran.push("X");
    if (!added) {
      added = true;
      offY = Frame.add(() => ran.push("Y"), 30);
    }
  }, 0);
  tick();
  expect(ran).toEqual(["X"]);
  ran.length = 0;
  tick();
  expect(ran).toEqual(["X", "Y"]);
  offX();
  offY();
});

test("priority order is ascending", () => {
  const ran: number[] = [];
  const offs = [30, 0, 20, 10].map((p) => Frame.add(() => ran.push(p), p));
  tick();
  expect(ran).toEqual([0, 10, 20, 30]);
  offs.forEach((off) => off());
});
