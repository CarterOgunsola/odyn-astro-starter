import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { kebab as toKebab } from "./_util.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(root, "vendor/central-icons");
const OUT = join(root, "src/icons");

const kebab = (base) => toKebab(base.replace(/\.svg$/i, "").replace(/^Icon/, ""));

const key = (s) =>
  s
    .replace(/\.svg$/i, "")
    .replace(/^icon/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

async function index() {
  const map = new Map();
  let categories;
  try {
    categories = await readdir(SRC, { withFileTypes: true });
  } catch {
    console.error(`✗ Source not found: ${SRC}\n  Mirror one variant there first.`);
    process.exit(1);
  }
  for (const c of categories) {
    if (!c.isDirectory()) continue;
    const files = await readdir(join(SRC, c.name));
    for (const f of files) {
      if (!f.endsWith(".svg")) continue;
      map.set(key(f), { path: join(SRC, c.name, f), name: kebab(f), category: c.name });
    }
  }
  return map;
}

function normalize(svg) {
  return svg.replace(/(stroke|fill)="(black|#000000|#000|#1e1e1e)"/gi, '$1="currentColor"').trim();
}

const args = process.argv.slice(2);

if (!args.length || args[0] === "--help" || args[0] === "-h") {
  console.log(
    "Usage:\n  bun run icon <Name…>        add icons (e.g. MagnifyingGlass arrow-up-right)\n  bun run icon --list [query] search available\n" +
      `\nIcons are read from ${SRC} (gitignored). Mirror one Central Icons variant there first.`,
  );
  process.exit(0);
}

const map = await index();

if (args[0] === "--list" || args[0] === "-l") {
  const q = (args[1] ?? "").toLowerCase();
  const hits = [...map.values()]
    .filter((v) => !q || v.name.includes(q) || v.category.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const h of hits) console.log(`${h.name.padEnd(34)} ${h.category}`);
  console.log(`\n${hits.length} match${hits.length === 1 ? "" : "es"}.`);
  process.exit(0);
}

await mkdir(OUT, { recursive: true });
for (const arg of args) {
  const hit = map.get(key(arg));
  if (!hit) {
    const near = [...map.values()]
      .filter((v) => v.name.includes(key(arg).slice(0, 4)))
      .slice(0, 6)
      .map((v) => v.name);
    console.error(`✗ "${arg}" not found.${near.length ? ` Did you mean: ${near.join(", ")}?` : ""}`);
    continue;
  }
  const svg = normalize(await readFile(hit.path, "utf8"));
  await writeFile(join(OUT, `${hit.name}.svg`), svg + "\n");
  console.log(`✓ ${hit.name}  ←  ${hit.category}`);
}
