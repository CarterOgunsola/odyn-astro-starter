import { test, expect } from "bun:test";
import { execSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

type Case = {
  name: string;
  project: string;
  env?: Record<string, string>;
  setup?: (p: string) => void;
  expect: string;
};

const make = (project: string, identity = true) => {
  const dir = mkdtempSync(join(tmpdir(), "odyn-init-"));
  const proj = join(dir, project);
  mkdirSync(join(proj, "scripts"), { recursive: true });
  for (const f of ["scripts/init.mjs", "package.json", "wrangler.jsonc"])
    cpSync(join(root, f), join(proj, f));
  // A copy has no tags: give it the release stamp a real release writes.
  const pkg = JSON.parse(readFileSync(join(proj, "package.json"), "utf8"));
  pkg.starter = { ...pkg.starter, ref: "v0.0.0-test", date: "2026-09-04" };
  writeFileSync(join(proj, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  const sh = (cmd: string) => execSync(cmd, { cwd: proj, stdio: "ignore" });
  sh("git init -q");
  if (identity) sh("git config user.name test && git config user.email test@example.com");
  sh("git -c user.name=seed -c user.email=seed@example.com add -A");
  sh("git -c user.name=seed -c user.email=seed@example.com commit -q -m seed");
  return { dir, proj };
};

const cases: Case[] = [
  {
    name: "the starter's own name",
    project: "odyn-astro-starter",
    expect: "still called odyn-astro-starter",
  },
  { name: "a bad PROJECT_NAME", project: "site", env: { PROJECT_NAME: "My Site" }, expect: "must be a slug" },
  {
    name: "a dirty tree",
    project: "site",
    setup: (p) => execSync("echo x >> wrangler.jsonc", { cwd: p }),
    expect: "uncommitted changes",
  },
  {
    name: "unpushed commits",
    project: "site",
    setup: (p) => {
      const remote = join(dirname(p), "origin.git");
      execSync(
        `git init -q --bare "${remote}" && git remote add origin "${remote}" && git push -q -u origin HEAD`,
        {
          cwd: p,
        },
      );
      execSync("echo y > note.txt && git add -A && git commit -q -m local", { cwd: p });
    },
    expect: "not pushed",
  },
];

for (const c of cases) {
  test(`init refuses ${c.name} and writes nothing`, () => {
    const { dir, proj } = make(c.project);
    try {
      c.setup?.(proj);
      const before = readFileSync(join(proj, "package.json"), "utf8");
      const r = spawnSync("node", ["scripts/init.mjs"], {
        cwd: proj,
        env: { ...process.env, ...c.env },
        encoding: "utf8",
      });
      expect(r.status).toBe(1);
      expect(r.stderr).toContain(c.expect);
      expect(readFileSync(join(proj, "package.json"), "utf8")).toBe(before);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

test("init refuses without a release stamp or a tag to record", () => {
  const { dir, proj } = make("site");
  try {
    const p = join(proj, "package.json");
    const pkg = JSON.parse(readFileSync(p, "utf8"));
    pkg.starter = { ...pkg.starter, ref: null, date: null };
    writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");
    execSync("git add -A && git commit -q -m unstamped", { cwd: proj });
    const r = spawnSync("node", ["scripts/init.mjs"], { cwd: proj, env: process.env, encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("no starter release");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("init refuses to replace history without a git identity, and keeps it with --keep-history", () => {
  const { dir, proj } = make("site", false);
  try {
    const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
    const r = spawnSync("node", ["scripts/init.mjs"], { cwd: proj, env, encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("user.name and user.email");
    const ok = spawnSync("node", ["scripts/init.mjs", "--keep-history"], {
      cwd: proj,
      env,
      encoding: "utf8",
    });
    expect(ok.status).toBe(0);
    const pkg = JSON.parse(readFileSync(join(proj, "package.json"), "utf8"));
    expect(pkg.name).toBe("site");
    expect(pkg.starter.initialised).toBe(true);
    expect(execSync("git rev-list --count HEAD", { cwd: proj }).toString().trim()).toBe("1");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
