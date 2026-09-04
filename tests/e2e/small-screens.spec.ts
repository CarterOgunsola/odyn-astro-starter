import { test, expect } from "@playwright/test";

for (const width of [320, 390]) {
  test(`every control is reachable at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/?debug=conductor");
    await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
    const report = await page.evaluate(() => {
      const bad: string[] = [];
      const controls = document.querySelectorAll<HTMLElement>("a[href], button");
      for (const c of controls) {
        const r = c.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue; // the off-canvas skip link
        if (r.bottom < 0 || r.top > innerHeight) continue; // below the fold
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!hit || !(c === hit || c.contains(hit))) bad.push(c.outerHTML.slice(0, 60));
        if (r.right > innerWidth + 0.5 || r.left < -0.5) bad.push(`offscreen: ${c.outerHTML.slice(0, 60)}`);
      }
      return { bad, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(report.bad).toEqual([]);
    expect(report.overflow).toBe(false);
  });
}

test("the first Tab is the skip link and it lands on main", async ({ page }) => {
  await page.goto("/?debug=conductor");
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await expect(page.locator(".skip")).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});
