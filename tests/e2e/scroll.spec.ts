import { test, expect } from "@playwright/test";

test("the scroll store follows the wheel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto("/?debug=scroll");
  const readout = page.locator("[data-scroll-debug]");
  await expect(readout).toContainText("limit");
  await page.mouse.move(640, 240);
  // The conductor holds scroll until idle: keep nudging until it moves.
  await expect
    .poll(
      async () => {
        await page.mouse.wheel(0, 300);
        return (await readout.textContent())!.includes("direction 1");
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  await expect
    .poll(async () => {
      const text = await readout.textContent();
      const n = (k: string) => parseFloat(text!.match(new RegExp(`${k} (-?[\\d.]+)`))![1]);
      return n("scroll") > 100 && n("limit") > 0 && n("progress") > 0;
    })
    .toBe(true);
});
