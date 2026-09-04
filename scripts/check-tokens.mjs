import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (!["node_modules", "dist", ".astro"].includes(f)) walk(p, out);
    } else if ([".scss", ".astro", ".ts", ".tpl"].includes(extname(p))) out.push(p);
  }
  return out;
};
const files = [
  ...walk(join(root, "src")),
  ...walk(join(root, "packages")),
  ...walk(join(root, "scripts/_templates")),
];
const NAME = "(--[a-z][a-z0-9-]*[a-z0-9])";

const declared = new Set(["--font-sans", "--font-mono"]);
const easing = readFileSync(join(root, "src/config/easing.ts"), "utf8");
for (const m of easing.matchAll(/^\s+"([a-z-]+)": \[/gm)) declared.add(`--ease-${m[1]}`);
const scale = readFileSync(join(root, "src/styles/_scale.scss"), "utf8").match(/\$scale:\s*([\d ]+)/)[1];
for (const step of scale.trim().split(/\s+/)) declared.add(`--s-${step}`);

const referenced = new Map();
const ref = (n, f) => referenced.set(n, [...(referenced.get(n) ?? []), f]);
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(new RegExp(`${NAME}\\s*:`, "g"))) declared.add(m[1]);
  for (const m of src.matchAll(new RegExp(`var\\(\\s*${NAME}`, "g"))) ref(m[1], f);
  for (const m of src.matchAll(new RegExp(`getPropertyValue\\(\\s*["']${NAME}`, "g"))) ref(m[1], f);
  for (const m of src.matchAll(/\bcss\(\s*"([a-z-]+)"|house\.([a-z-]+)/g)) ref(`--ease-${m[1] ?? m[2]}`, f);
}

const RESERVED = {
  prefixes: ["--s-", "--r-", "--sp-", "--fs-", "--mono-"],
  names: [
    "--white",
    "--card",
    "--fill-strong",
    "--scrim",
    "--btn-fill",
    "--btn-on",
    "--fw-semibold",
    "--flow",
  ],
};
const isReserved = (n) => RESERVED.names.includes(n) || RESERVED.prefixes.some((p) => n.startsWith(p));

const undeclared = [...referenced.keys()].filter((n) => !declared.has(n) && !RESERVED.names.includes(n));
const unused = [...declared].filter((n) => !referenced.has(n) && !isReserved(n));

const globalScss = readFileSync(join(root, "src/styles/global.scss"), "utf8");
const emitted = new Set(
  [...globalScss.matchAll(/utilities\(\s*\(([\s\S]*?)\)\s*\)/g)].flatMap((m) =>
    [...m[1].matchAll(/"([a-z0-9-]+)"/g)].map((r) => r[1]),
  ),
);
const usedRoles = new Set();
for (const f of files.filter((f) => f.endsWith(".astro") || f.endsWith(".ts")))
  for (const line of readFileSync(f, "utf8").split("\n"))
    if (/class/.test(line))
      for (const m of line.matchAll(/(?<=["'`\s{])text-([a-z][a-z0-9-]*[a-z0-9])(?![a-z0-9-]|\s*:)/g))
        usedRoles.add(m[1]);
const missingRoles = [...usedRoles].filter((r) => !emitted.has(r));
const spareRoles = [...emitted].filter((r) => !usedRoles.has(r));

// SITE.themeColor and --paper are one value, hand-mirrored, so the check keeps them equal.
const colorScss = readFileSync(join(root, "src/styles/_color.scss"), "utf8");
const siteTs = readFileSync(join(root, "src/config/site.ts"), "utf8");
const papers = [...colorScss.matchAll(/--paper:\s*(#[0-9a-f]{3,8})/gi)].map((m) => m[1].toLowerCase());
const themeColors = [...siteTs.matchAll(/(light|dark):\s*"(#[0-9a-f]{3,8})"/gi)].map((m) =>
  m[2].toLowerCase(),
);
const paperMismatch =
  papers.length !== 2 ||
  themeColors.length !== 2 ||
  papers[0] !== themeColors[0] ||
  papers[1] !== themeColors[1];

const rel = (f) => f.replace(root, "");
let bad = false;
if (paperMismatch) {
  bad = true;
  console.error(
    `✗ SITE.themeColor ${JSON.stringify(themeColors)} does not mirror --paper ${JSON.stringify(papers)} in _color.scss`,
  );
}
if (undeclared.length) {
  bad = true;
  console.error("✗ referenced but never declared:");
  for (const n of undeclared)
    console.error(`  ${n}  ←  ${[...new Set(referenced.get(n).map(rel))].join(", ")}`);
}
if (unused.length) {
  bad = true;
  console.error("✗ declared but never referenced (delete it, or reserve it in scripts/check-tokens.mjs):");
  for (const n of unused) console.error(`  ${n}`);
}
if (missingRoles.length) {
  bad = true;
  console.error(
    `✗ .text-* roles used in markup but not emitted from global.scss: ${missingRoles.join(", ")}`,
  );
}
if (spareRoles.length) console.warn(`· .text-* roles emitted but unused: ${spareRoles.join(", ")}`);
if (!bad)
  console.log(
    `✓ tokens: ${declared.size} declared, ${referenced.size} referenced, ${emitted.size} roles emitted, nothing stray`,
  );
process.exit(bad ? 1 : 0);
