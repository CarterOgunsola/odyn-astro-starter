import { cp, mkdir, readdir, readFile, writeFile, access } from "node:fs/promises";
import { execSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const [name] = process.argv.slice(2);

const ADDONS = {
  gl: {
    summary: "the WebGL stage on three.js: one persistent canvas, DOM-synced planes, a texture hold",
    deps: { three: "0.185.1" },
    devDeps: { "@types/three": "0.185.4" },
    guard: "src/lib/gl",
    layout: {
      after: "<Header />",
      line: "<GlStage />",
      importAfter: 'import Header from "@/components/Header.astro";',
      importLine: 'import GlStage from "@/components/GlStage.astro";',
    },
    decision: "three-gl-add-on",
    next: [
      "register in src/app.ts:",
      '  globals: { name: "Gl", init: () => Gl.init() }',
      '  pages:   { name: "GlPlanes", mount: () => Gl.mountPage() }',
      '  with: import { Gl } from "@/lib/gl/stage";',
      'mark an image: <img data-gl="plane" data-id="hero" src="…" width="…" height="…" alt="…" />',
      "then bun run validate",
    ],
  },
};

const usage = () => {
  console.log("usage: bun run add <name>\n");
  for (const [k, a] of Object.entries(ADDONS)) console.log(`  ${k.padEnd(8)} ${a.summary}`);
};
if (!name || name === "--help" || name === "-h") {
  usage();
  process.exit(name ? 0 : 1);
}
const addon = Object.hasOwn(ADDONS, name) ? ADDONS[name] : undefined;
if (!addon) {
  console.error(`✗ no add-on called "${name}"\n`);
  usage();
  process.exit(1);
}
const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );
if (await exists(resolve(root, addon.guard))) {
  console.error(`✗ ${addon.guard} exists: the ${name} add-on is already installed`);
  process.exit(1);
}

const dep = (o) =>
  Object.entries(o)
    .map(([k, v]) => `${k}@${v}`)
    .join(" ");
execSync(`bun add -E ${dep(addon.deps)} && bun add -dE ${dep(addon.devDeps)}`, {
  cwd: root,
  stdio: "inherit",
});

const src = resolve(root, `scripts/_addons/${name}/files`);
const written = [];
const walk = async (dir) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else {
      const out = resolve(root, relative(src, p).replace(/\.tpl$/, ""));
      await mkdir(dirname(out), { recursive: true });
      await cp(p, out);
      written.push(out);
      console.log(`✓ ${relative(root, out)}`);
    }
  }
};
await walk(src);

if (addon.layout) {
  const lp = resolve(root, "src/layouts/Base.astro");
  let layout = await readFile(lp, "utf8");
  if (!layout.includes(addon.layout.line)) {
    layout = layout.replace(
      addon.layout.importAfter,
      `${addon.layout.importAfter}\n${addon.layout.importLine}`,
    );
    layout = layout.replace(addon.layout.after, `${addon.layout.after}\n    ${addon.layout.line}`);
    await writeFile(lp, layout);
    written.push(lp);
    console.log(`✓ src/layouts/Base.astro: ${addon.layout.line} after ${addon.layout.after}`);
  }
}

const dir = resolve(root, "docs/decisions");
const nums = (await readdir(dir)).map((f) => parseInt(f, 10)).filter((n) => Number.isFinite(n));
const n = String(Math.max(0, ...nums) + 1).padStart(3, "0");
const tpl = await readFile(resolve(root, `scripts/_addons/${name}/decision.md`), "utf8");
const record = resolve(dir, `${n}-${addon.decision}.md`);
await writeFile(
  record,
  tpl
    .replace("NNN", n)
    .replace("DATE", new Date().toISOString().slice(0, 10))
    .replace("THREE_VERSION", addon.deps.three ?? ""),
);
written.push(record);
console.log(`✓ docs/decisions/${n}-${addon.decision}.md`);

execSync(`bunx prettier --write ${written.map((f) => JSON.stringify(f)).join(" ")}`, {
  cwd: root,
  stdio: "ignore",
});

console.log(`\n→ next:`);
for (const line of addon.next) console.log(`  ${line}`);
