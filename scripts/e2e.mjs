// Playwright runs the installed Chrome. A machine without it skips here so validate stays green; CI installs Chrome and fails instead.
import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";

const candidates =
  {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      `${homedir()}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    ],
    linux: ["google-chrome", "google-chrome-stable", "chrome"],
    win32: [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `${process.env.LOCALAPPDATA ?? ""}\\Google\\Chrome\\Application\\chrome.exe`,
    ],
  }[process.platform] ?? [];

const onPath = (bin) => {
  try {
    execSync(`command -v ${bin}`, { stdio: "ignore", shell: "/bin/sh" });
    return true;
  } catch {
    return false;
  }
};
const found = candidates.some((c) => (c.includes("/") || c.includes("\\") ? existsSync(c) : onPath(c)));

if (!found) {
  const msg = "Google Chrome was not found, and the Playwright config runs the installed Chrome channel.";
  if (process.env.CI) {
    console.error(`✗ ${msg} Install it (bunx playwright install --with-deps chrome).`);
    process.exit(1);
  }
  console.log(
    `· validate: e2e SKIPPED. ${msg} Install Chrome to run it with validate, or run bun run test where it exists.`,
  );
  process.exit(0);
}

const r = spawnSync("bunx", ["playwright", "test"], { stdio: "inherit" });
process.exit(r.status ?? 1);
