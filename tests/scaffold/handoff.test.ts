import { test, expect } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const stampRelease = (proj: string) => {
  const p = join(proj, "package.json");
  const pkg = JSON.parse(readFileSync(p, "utf8"));
  pkg.starter = { ...pkg.starter, ref: "v0.0.0-test", date: "2026-09-04" };
  writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");
};

test("init --handoff strips the personal tooling and validates green", () => {
  const dir = mkdtempSync(join(tmpdir(), "odyn-handoff-"));
  const proj = join(dir, "client-site");
  const excluded = ["node_modules", ".git", "dist", ".astro", "test-results", "vendor"]
    .map((d) => `--exclude ${d}`)
    .join(" ");
  execSync(`rsync -a ${excluded} "${root}/" "${proj}/"`);
  // A copy has no tags: give it the release stamp a real release writes.
  stampRelease(proj);
  const gitconfig = join(dir, "gitconfig");
  writeFileSync(gitconfig, "[user]\n\tname = test\n\temail = test@example.com\n");
  const run = (cmd: string) => {
    try {
      return execSync(cmd, {
        cwd: proj,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PROJECT_NAME: "client-site", GIT_CONFIG_GLOBAL: gitconfig },
      }).toString();
    } catch (e) {
      const err = e as { stdout?: Buffer; stderr?: Buffer };
      throw new Error(`${cmd} failed\n${err.stdout ?? ""}\n${err.stderr ?? ""}`);
    }
  };
  try {
    run("bun install --frozen-lockfile");
    run("git init -q && git config user.name test && git config user.email test@example.com");
    run("git add -A && git commit -q -m seed");
    run("bun run init --handoff");
    for (const f of [
      "AGENTS.md",
      "CLAUDE.md",
      "docs/upstream.md",
      "renovate.json",
      "jsrepo.config.ts",
      "tests/scaffold",
      "scripts/add-icon.mjs",
      "PROD-README.md",
      "LICENSE",
    ]) {
      expect(existsSync(join(proj, f))).toBe(false);
    }
    expect(existsSync(join(proj, ".github/workflows/ci.yml"))).toBe(true);
    expect(existsSync(join(proj, "THIRD-PARTY-NOTICES.md"))).toBe(true);
    expect(readFileSync(join(proj, "README.md"), "utf8")).toContain("## Credentials");
    const pkg = JSON.parse(readFileSync(join(proj, "package.json"), "utf8"));
    expect(pkg.scripts["test:scaffold"]).toBe(undefined);
    expect(pkg.scripts.icon).toBe(undefined);
    expect(run("git ls-files")).not.toContain(".git.starter");
    run("bun run validate");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 300_000);
