import { test, expect } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

test("add gl installs an add-on that passes typecheck and lint", () => {
  expect(readFileSync(join(root, "package.json"), "utf8")).not.toContain('"three"');
  const dir = mkdtempSync(join(tmpdir(), "odyn-gl-"));
  const proj = join(dir, "gl-test");
  const excluded = ["node_modules", ".git", "dist", ".astro", "test-results", "vendor"]
    .map((d) => `--exclude ${d}`)
    .join(" ");
  execSync(`rsync -a ${excluded} "${root}/" "${proj}/"`);
  const run = (cmd: string) => {
    try {
      return execSync(cmd, { cwd: proj, stdio: ["ignore", "pipe", "pipe"] }).toString();
    } catch (e) {
      const err = e as { stdout?: Buffer; stderr?: Buffer };
      throw new Error(`${cmd} failed\n${err.stdout?.toString() ?? ""}\n${err.stderr?.toString() ?? ""}`, {
        cause: e,
      });
    }
  };
  try {
    run("bun install --frozen-lockfile");
    run("bun run add gl");
    expect(existsSync(join(proj, "src/lib/gl/stage.ts"))).toBe(true);
    expect(readFileSync(join(proj, "src/layouts/Base.astro"), "utf8")).toContain("<GlStage />");
    expect(readFileSync(join(proj, "package.json"), "utf8")).toContain('"three"');
    run("bun run typecheck");
    run("bun run check:astro");
    run("bun run lint");
    run("bun run format:check");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 300_000);
