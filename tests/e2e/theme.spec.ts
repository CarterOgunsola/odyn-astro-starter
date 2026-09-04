import { test, expect } from "@playwright/test";

test("the toggle pins the theme and the chrome follows", async ({ page }) => {
  await page.goto("/?debug=conductor");
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
  const html = page.locator("html");
  const start = await html.getAttribute("data-theme");
  const other = start === "dark" ? "light" : "dark";
  await page.click(`theme-toggle [data-theme-set="${other}"]`);
  await expect(html).toHaveAttribute("data-theme", other);
  await expect(page.locator(`theme-toggle [data-theme-set="${other}"]`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(`theme-toggle [data-theme-set="${other}"] [data-theme-bg]`)).toHaveCount(1);
  const paper = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--paper").trim(),
  );
  const metas = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => m.content),
  );
  expect(metas.length).toBeGreaterThan(0);
  for (const m of metas) expect(m).toBe(paper);
  await page.click('a[href="/notes"]');
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
  await expect(html).toHaveAttribute("data-theme", other);
  const metasAfter = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => m.content),
  );
  for (const m of metasAfter) expect(m).toBe(paper);
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", other);
});
