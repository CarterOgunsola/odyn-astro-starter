import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error("usage: bun run release <major.minor.patch>");
  process.exit(1);
}
const sh = (cmd) =>
  execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();
if (sh("git status --porcelain")) {
  console.error("✗ the working tree is not clean. Commit first.");
  process.exit(1);
}
const tag = `v${version}`;
const today = new Date().toISOString().slice(0, 10);

const pkgPath = resolve(root, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
pkg.version = version;
pkg.starter = { ...pkg.starter, ref: tag, head: null, date: today };
await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const clPath = resolve(root, "CHANGELOG.md");
const cl = await readFile(clPath, "utf8");
if (!cl.includes(`## [${version}]`)) {
  await writeFile(clPath, cl.replace("## [Unreleased]\n", `## [Unreleased]\n\n## [${version}] - ${today}\n`));
}
sh("git add package.json CHANGELOG.md");
sh(`git commit -q -m "chore(release): ${tag}"`);
sh(`git tag -a ${tag} -m "${tag}"`);
console.log(
  `✓ ${tag}: package.json version and starter stamp, changelog dated, committed and tagged. Push with: git push --follow-tags`,
);
