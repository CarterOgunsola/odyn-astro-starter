import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4331",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    channel: "chrome",
  },
  webServer: {
    command: "bun run preview -- --port 4331 --ignore-lock",
    // Astro 7 forces preview into background mode under an agent, which refuses --ignore-lock. This keeps it in the foreground.
    env: { ASTRO_PREVIEW_BACKGROUND: "1" },
    url: "http://localhost:4331",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
