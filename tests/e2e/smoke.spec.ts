import { test, expect } from "@playwright/test";

test("home loads, conductor goes idle, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/?debug=conductor");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  expect(errors).toEqual([]);
});

test("client navigation covers, swaps and reveals", async ({ page }) => {
  await page.goto("/?debug=conductor");
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
  await page.click('a[href="/example/"], a[href="/example"]');
  await expect(page).toHaveURL(/\/example\/?$/);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("[data-conductor-debug]")).toContainText("state idle");
  await expect(page.locator("[data-conductor-debug]")).toContainText("route / → /example");
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  await expect(page.locator("[data-example-engine] canvas")).toHaveCount(1);
});

test("404 page serves", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.locator("main h1")).toBeVisible();
});
