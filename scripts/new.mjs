import { readFile, writeFile, access, mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { kebab as toKebab, pascal as toPascal } from "./_util.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const [kind, raw] = process.argv.slice(2);
if (!kind || !raw || !["module", "element", "engine"].includes(kind)) {
  console.log("usage: bun run new <module|element|engine> <name>");
  process.exit(1);
}

const kebab = toKebab(raw);
if (!kebab || /^\d/.test(kebab)) {
  console.error(`✗ "${raw}" does not make a name (letters first, then letters, digits or hyphens)`);
  process.exit(1);
}
const pascal = toPascal(kebab);
const tag = kebab.includes("-") ? kebab : `x-${kebab}`;

const fill = (s) =>
  s.replaceAll("__KEBAB__", kebab).replaceAll("__PASCAL__", pascal).replaceAll("__TAG__", tag);
const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

const out = {
  module: resolve(root, `src/lib/${kebab}.ts`),
  element: resolve(root, `src/lib/elements/${kebab}.ts`),
  engine: resolve(root, `src/lib/${kebab}.ts`),
}[kind];
if (await exists(out)) {
  console.error(`✗ ${out} exists`);
  process.exit(1);
}
const tpl = await readFile(resolve(root, `scripts/_templates/${kind}.ts.tpl`), "utf8");
if (kind === "element") await mkdir(resolve(root, "src/lib/elements"), { recursive: true });
await writeFile(out, fill(tpl));
const written = [out];
console.log(`✓ ${out.replace(root + "/", "")}`);

if (kind === "engine") {
  const reg = resolve(root, "src/lib/engines.ts");
  const src = await readFile(reg, "utf8");
  const entry = fill(
    `  {\n    name: "__PASCAL__",\n    when: "[data-__KEBAB__]",\n    routes: /^\\/__KEBAB__\\/?$/,\n    load: () => import("@/lib/__KEBAB__").then((m) => () => m.__PASCAL__.init()),\n  },\n`,
  );
  const i = src.lastIndexOf("];");
  await writeFile(reg, src.slice(0, i) + entry + src.slice(i));
  written.push(reg);
  await mkdir(resolve(root, "src/tune"), { recursive: true });
  const tune = resolve(root, `src/tune/${kebab}.json`);
  if (!(await exists(tune))) await writeFile(tune, "{}\n");
  console.log(`✓ src/tune/${kebab}.json (defaults; ?tune=${kebab} + SAVE writes it)`);
  console.log(`✓ registered in src/lib/engines.ts (root: [data-${kebab}], route: /${kebab})`);
}
execSync(`bunx prettier --write ${written.map((f) => JSON.stringify(f)).join(" ")}`, {
  cwd: root,
  stdio: "ignore",
});
if (kind === "module") {
  console.log(`→ register it in src/app.ts pages: { name: "${pascal}", mount: () => ${pascal}.init() }`);
}
if (kind === "element") {
  console.log(
    `→ import it once from src/app.ts (import "@/lib/elements/${kebab}") and use <${tag}> in markup`,
  );
}
