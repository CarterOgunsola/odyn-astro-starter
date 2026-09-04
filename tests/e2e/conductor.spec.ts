import { test, expect, type Page } from "@playwright/test";

const state = (page: Page) => page.locator("[data-conductor-debug]");

test("the header rides above the curtain for the whole cover", async ({ page }) => {
  await page.goto("/?debug=conductor");
  await expect(state(page)).toContainText("state idle");
  await page.click('a[href="/example"]');
  await page.waitForFunction(() =>
    document.querySelector("[data-header]")?.classList.contains("is-conductor-nav"),
  );
  const z = await page.evaluate(() => ({
    header: parseInt(getComputedStyle(document.querySelector("[data-header]")!).zIndex, 10),
    panel: parseInt(getComputedStyle(document.querySelector("[data-conductor-panel]")!).zIndex, 10),
  }));
  expect(z.header).toBeGreaterThan(z.panel);
  await expect(state(page)).toContainText("state idle");
  const lifted = await page.evaluate(() =>
    document.querySelector("[data-header]")!.classList.contains("is-conductor-nav"),
  );
  expect(lifted).toBe(false);
});

test("a slow engine chunk holds the curtain and lands before the reveal", async ({ page }) => {
  await page.route(/example-engine.*\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, 6500));
    await route.continue();
  });
  const t0 = Date.now();
  await page.goto("/example/?debug=conductor");
  await expect(state(page)).toContainText("state idle", { timeout: 15_000 });
  const elapsed = Date.now() - t0;
  expect(elapsed).toBeGreaterThan(6000);
  await expect(page.locator("[data-example-engine] canvas")).toHaveCount(1);
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
});

const hiddenEntrances = (page: Page) =>
  page.evaluate(() => {
    const hidden: string[] = [];
    for (const y of document.querySelectorAll<HTMLElement>("main .y")) {
      const t = getComputedStyle(y).transform;
      const m = t.match(/matrix\(([^)]+)\)/);
      if (m && Math.abs(parseFloat(m[1].split(",")[5])) > 0.5)
        hidden.push(`y:${y.textContent?.slice(0, 20)}`);
    }
    for (const el of document.querySelectorAll<HTMLElement>('main [class*="z-o"]'))
      if (parseFloat(getComputedStyle(el).opacity) < 0.99) hidden.push(`o:${el.className}`);
    for (const el of document.querySelectorAll<HTMLElement>('main [class*="z-x"]')) {
      const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
      if (m && parseFloat(m[1].split(",")[0]) < 0.99) hidden.push(`x:${el.className}`);
    }
    return hidden;
  });

test("a click during the previous page's cascade tail lands both pages whole", async ({ page }) => {
  await page.goto("/?debug=conductor");
  await expect(state(page)).toContainText("state idle");
  await page.click('a[href="/example"]');
  await expect(state(page)).toContainText("state idle");
  await page.click('a[href="/notes"]');
  await expect(page).toHaveURL(/\/notes\/?$/);
  await expect(state(page)).toContainText("state idle");
  await expect(state(page)).toContainText("nav");
  await page.waitForTimeout(2000);
  expect(await hiddenEntrances(page)).toEqual([]);
  await page.click('a[href="/example"]');
  await expect(state(page)).toContainText("state idle");
  await page.waitForTimeout(2000);
  expect(await hiddenEntrances(page)).toEqual([]);
});

test("the line splitter never wraps a line inside one mask", async ({ page }) => {
  await page.goto("/example/?debug=conductor");
  await expect(state(page)).toContainText("state idle");
  const fixture = page.locator("[data-split-fixture]");
  await expect(fixture).toBeVisible();
  const report = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>("[data-split-fixture]")!;
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    const ys = [...el.querySelectorAll<HTMLElement>(".y")];
    return {
      lines: ys.length,
      tallest: Math.max(...ys.map((y) => y.getBoundingClientRect().height)) / lh,
      nbspIntact: ys.some((y) => y.textContent!.includes("Non breaking")),
    };
  });
  expect(report.lines).toBeGreaterThan(1);
  expect(report.tallest).toBeLessThan(1.5);
  expect(report.nbspIntact).toBe(true);
});
