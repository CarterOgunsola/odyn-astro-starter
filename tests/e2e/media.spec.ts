import { test, expect } from "@playwright/test";

test("the reveal waits for a slow critical image", async ({ page }) => {
  await page.route(/example-plate\.svg$/, async (route) => {
    await new Promise((r) => setTimeout(r, 1200));
    await route.continue();
  });
  await page.goto("/example/?debug=conductor");
  await page.waitForFunction(
    () =>
      /state revealing|state idle/.test(document.querySelector("[data-conductor-debug]")?.textContent ?? ""),
    null,
    { timeout: 15_000 },
  );
  const img = await page.evaluate(() => {
    const el = document.querySelector<HTMLImageElement>("img[data-critical]")!;
    return { complete: el.complete, width: el.naturalWidth };
  });
  expect(img.complete).toBe(true);
  expect(img.width).toBeGreaterThan(0);
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle", { timeout: 15_000 });
});
