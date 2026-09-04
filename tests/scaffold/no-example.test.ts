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

test("init --no-example leaves a project with no example and a green validate", () => {
  const dir = mkdtempSync(join(tmpdir(), "odyn-scaffold-"));
  const proj = join(dir, "scaffold-test");
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
        env: { ...process.env, PROJECT_NAME: "scaffold-test", GIT_CONFIG_GLOBAL: gitconfig },
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

    const out = run("bun run init --no-example");
    expect(out).toContain("fresh git history");

    const read = (f: string) => readFileSync(join(proj, f), "utf8");
    for (const f of [
      "src/pages/example.astro",
      "src/lib/example-engine.ts",
      "tests/e2e/conductor.spec.ts",
      "CHANGELOG.md",
      "LICENSE",
    ]) {
      expect(existsSync(join(proj, f))).toBe(false);
    }
    expect(read("src/config/site.ts")).not.toContain('href: "/example"');
    expect(read("src/pages/index.astro")).not.toContain("/example");
    expect(read("src/pages/index.astro")).not.toContain("example route");
    expect(read("tests/e2e/smoke.spec.ts")).not.toContain("/example");
    expect(read("tests/e2e/smoke.spec.ts")).not.toContain("example-engine");
    expect(read("src/lib/engines.ts")).not.toContain("example");
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.name).toBe("scaffold-test");
    expect(pkg.starter.initialised).toBe(true);
    expect(read("wrangler.jsonc")).toContain('"name": "scaffold-test"');

    run("bun run validate");
    expect(existsSync(join(proj, "dist/index.html"))).toBe(true);
    expect(existsSync(join(proj, "dist/example"))).toBe(false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 300_000);
