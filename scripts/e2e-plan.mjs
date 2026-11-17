import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const SPECS = "tests/e2e";
const PAGES = "src/pages";
const STYLES = "src/styles";
const MAX_SHARDS = 4;
const SHARD_FLOOR_MS = 60_000;
const UNKNOWN_MS = 30_000;
const NO_SITE = [
  /^(?!src\/content\/).*\.md$/,
  /^tests\/(unit|scaffold)\//,
  /^worker\//,
  /^scripts\/(_templates|_addons)\//,
  /^scripts\/(checks|check-[a-z]+|new|add|add-icon|init|release|count|e2e[a-z-]*)\.mjs$/,
  /^\.(oxlintrc|lighthouserc|prettierrc)(\.json)?$/,
  /^\.(prettierignore|gitignore|editorconfig|env\.example)$/,
  /^\.vscode\//,
  /^(wrangler\.jsonc|renovate\.json|jsrepo\.config\.ts|LICENSE)$/,
];
const IMPORTS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  /new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url/g,
  /<script[^>]*\bsrc=["']([^"']+)["']/g,
  /@(?:use|forward|import)\s+["']([^"']+)["']/g,
];
const EXTS = ["", ".ts", ".mts", ".js", ".mjs", ".astro", ".json", "/index.ts", "/index.js"];

const args = process.argv.slice(2);
const values = (flag) => args.flatMap((a, i) => (a === flag && args[i + 1] ? [args[i + 1]] : []));
const [changedFrom] = values("--changed-from");
const listed = values("--files").flatMap((v) => v.split(","));

const isFile = (p) => existsSync(p) && statSync(p).isFile();
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = join(dir, d.name);
        if (d.isDirectory()) return d.name === "node_modules" ? [] : walk(p);
        return [p];
      })
    : [];

const packageEntry = (name) => {
  const pkg = JSON.parse(readFileSync(join("packages", name, "package.json"), "utf8"));
  const entry = typeof pkg.exports === "string" ? pkg.exports : pkg.exports?.["."];
  return join("packages", name, entry ?? "src/index.ts");
};

const scssCandidates = (spec, from) => {
  const name = spec.split("/").at(-1);
  const sub = spec.split("/").slice(0, -1).join("/");
  return [dirname(from), STYLES].flatMap((base) => [
    join(base, sub, `${name}.scss`),
    join(base, sub, `_${name}.scss`),
    join(base, spec, "_index.scss"),
  ]);
};

const resolveImport = (spec, from) => {
  const bare = spec.replace(/[?#].*$/, "");
  if (bare.startsWith("sass:")) return null;
  let base = null;
  if (bare.startsWith("@/")) base = join("src", bare.slice(2));
  else if (bare.startsWith("@root/")) base = bare.slice("@root/".length);
  else if (bare.startsWith("@odyn/")) {
    const [name, ...rest] = bare.slice("@odyn/".length).split("/");
    base = rest.length > 0 ? join("packages", name, ...rest) : packageEntry(name);
  } else if (bare.startsWith(".")) base = join(dirname(from), bare);
  const found = base === null ? undefined : EXTS.map((e) => base + e).find((p) => isFile(p));
  if (found) return normalize(found);
  if (from.endsWith(".scss") || from.endsWith(".astro"))
    return scssCandidates(bare, from).find((p) => isFile(p)) ?? null;
  return null;
};

const graph = new Map();
const edges = (file) => {
  if (!graph.has(file)) {
    const text = /\.(ts|mts|js|mjs|astro|scss)$/.test(file) ? readFileSync(file, "utf8") : "";
    const out = new Set();
    for (const re of IMPORTS) {
      for (const m of text.matchAll(re)) {
        const hit = resolveImport(m[1], file);
        if (hit) out.add(hit);
      }
    }
    graph.set(file, out);
  }
  return graph.get(file);
};

const reach = (entry) => {
  const seen = new Set([entry]);
  const queue = [entry];
  while (queue.length > 0) {
    for (const next of edges(queue.pop())) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
};

const pageFor = (route) => {
  const seg = route
    .replace(/^\.?\//, "")
    .replace(/[?#].*$/, "")
    .split("/")[0];
  const candidates = seg === "" ? ["index.astro"] : [`${seg}.astro`, `${seg}/index.astro`];
  return candidates.map((c) => join(PAGES, c)).find((p) => isFile(p)) ?? join(PAGES, "404.astro");
};

const specRoutes = (file) =>
  new Set(
    [...readFileSync(join(SPECS, file), "utf8").matchAll(/\.goto\(\s*["'`]([^"'`]*)["'`]/g)].map((m) =>
      pageFor(m[1]),
    ),
  );

const inventory = () => {
  const raw = execFileSync("bunx", ["playwright", "test", "--list", "--reporter=json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const tests = [];
  const visit = (suite, path) => {
    const here = suite.file && path.length === 0 ? [suite.file] : [...path, suite.title];
    for (const spec of suite.specs ?? [])
      tests.push({ file: spec.file, key: [...here, spec.title].join(" › ") });
    for (const child of suite.suites ?? []) visit(child, here);
  };
  for (const suite of JSON.parse(raw).suites) visit(suite, []);
  return tests;
};

const readTimings = () => {
  const files = [
    ...values("--timings"),
    ...values("--timings-dir").flatMap((d) => walk(d).filter((p) => p.endsWith(".json"))),
  ];
  return Object.assign({}, ...files.filter((f) => isFile(f)).map((f) => JSON.parse(readFileSync(f, "utf8"))));
};

const changedFiles = () =>
  listed.length > 0
    ? listed
    : execFileSync("git", ["diff", "--name-only", changedFrom], { encoding: "utf8" })
        .split("\n")
        .filter(Boolean);

const select = (tests) => {
  if (!changedFrom && listed.length === 0) return { picked: tests, reason: "full run" };
  const files = changedFiles().filter((f) => !NO_SITE.some((re) => re.test(f)));
  if (files.length === 0) return { picked: [], reason: "nothing the site or its tests read" };
  const specFiles = [...new Set(tests.map((t) => t.file))];
  const reached = new Map();
  const pageReach = (page) => {
    if (!reached.has(page)) reached.set(page, reach(page));
    return reached.get(page);
  };
  const wanted = new Set();
  for (const f of files) {
    if (f.startsWith(`${SPECS}/`) && f.endsWith(".spec.ts")) {
      wanted.add(relative(SPECS, f));
      continue;
    }
    if (!f.startsWith("src/") && !f.startsWith("packages/"))
      return { picked: tests, reason: `${f} touches everything` };
    const hits = specFiles.filter((s) =>
      [...specRoutes(s)].some((page) => pageReach(page).has(normalize(f))),
    );
    if (hits.length === 0) return { picked: tests, reason: `${f} is outside the page graph` };
    for (const s of hits) wanted.add(s);
  }
  return { picked: tests.filter((t) => wanted.has(t.file)), reason: `${files.length} changed file(s)` };
};

const shard = (picked, timings) => {
  const known = Object.values(timings);
  const fallback =
    known.length > 0 ? known.toSorted((a, b) => a - b)[Math.floor(known.length / 2)] : UNKNOWN_MS;
  const timed = picked.map((t) => ({ ...t, ms: timings[t.key] ?? fallback })).toSorted((a, b) => b.ms - a.ms);
  if (timed.length === 0) return [];
  const total = timed.reduce((s, t) => s + t.ms, 0);
  const count = Math.min(MAX_SHARDS, timed.length, Math.ceil(total / Math.max(timed[0].ms, SHARD_FLOOR_MS)));
  const bins = Array.from({ length: count }, () => ({ ms: 0, tests: [] }));
  for (const t of timed) {
    const bin = bins.reduce((a, b) => (b.ms < a.ms ? b : a));
    bin.ms += t.ms;
    bin.tests.push(t.key);
  }
  return bins;
};

const tests = inventory();
const { picked, reason } = select(tests);
const bins = shard(picked, readTimings());
const matrix = {
  include: bins.map((b, i) => ({ shard: i + 1, seconds: Math.round(b.ms / 1000), list: b.tests.join("\n") })),
};

console.error(`e2e: ${picked.length}/${tests.length} tests, ${bins.length} shard(s) :: ${reason}`);
for (const m of matrix.include)
  console.error(`  shard ${m.shard}: ~${m.seconds}s, ${m.list.split("\n").length} test(s)`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `matrix=${JSON.stringify(matrix)}\ncount=${bins.length}\nsite=${picked.length > 0}\n`,
  );
} else {
  console.log(JSON.stringify(matrix, null, 2));
}
