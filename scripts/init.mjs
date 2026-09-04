import { readFile, writeFile, rm, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const force = args.has("--force");
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
};
const refuse = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
const rawName = process.env.PROJECT_NAME || basename(root);
const name = slug(rawName);
if (!name) refuse(`"${rawName}" does not reduce to a project name. Set PROJECT_NAME.`);
if (process.env.PROJECT_NAME && name !== process.env.PROJECT_NAME)
  refuse(`PROJECT_NAME must be a slug (lowercase letters, digits, hyphens). Try ${name}.`);

const pkgPath = resolve(root, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

if (!pkg.starter?.initialised) {
  const inGit = !!git("rev-parse --is-inside-work-tree");
  const replaceHistory = inGit && !args.has("--keep-history");

  if (name === "odyn-astro-starter" && !force)
    refuse(
      "the project is still called odyn-astro-starter. Run init in a project made from the template, or set PROJECT_NAME.",
    );
  if (inGit && !force) {
    if (git("status --porcelain"))
      refuse("the working tree has uncommitted changes. Commit or stash them first, or pass --force.");
    const upstream = git("rev-parse --abbrev-ref @{u}");
    if (upstream && git(`rev-list ${upstream}..HEAD --count`) !== "0")
      refuse(`there are commits not pushed to ${upstream}. Push them first, or pass --force.`);
  }
  if (replaceHistory && !(git("config user.email") && git("config user.name")))
    refuse(
      "git user.name and user.email are not set, so a fresh history cannot be committed. Configure git, or pass --keep-history.",
    );

  // A giget copy or a template repository has no starter history: the stamp falls back to what `bun run release` wrote into package.json, and head stays null.
  const described = git("describe --tags --abbrev=0");
  const stamp = {
    name: "odyn-astro-starter",
    initialised: true,
    ref: described || pkg.starter?.ref || null,
    head: described ? git("rev-parse HEAD") : null,
    date: (described && git("log -1 --format=%cI")) || pkg.starter?.date || new Date().toISOString(),
  };
  if (!stamp.ref)
    refuse(
      "no starter release to record: neither a tag in this checkout nor a release stamp in package.json.",
    );
  if (!stamp.head)
    console.log(
      `· no starter commit in this checkout (giget or template); the stamp carries the release ${stamp.ref}`,
    );
  pkg.starter = stamp;
  pkg.name = name;
  pkg.version = "0.1.0";
  pkg.description = "";
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(
    `✓ package.json: name=${name}, starter stamp ${stamp.ref ?? ""}@${(stamp.head ?? "").slice(0, 7)}`,
  );

  const wr = resolve(root, "wrangler.jsonc");
  const w = await readFile(wr, "utf8");
  await writeFile(
    wr,
    w.replace(/"name":\s*"[^"]+"/, () => `"name": "${name}"`),
  );
  console.log(`✓ wrangler.jsonc: name=${name}`);

  const lic = resolve(root, "LICENSE");
  const notice = await readFile(lic, "utf8").catch(() => null);
  if (notice) {
    await writeFile(
      resolve(root, "THIRD-PARTY-NOTICES.md"),
      `# Third-party notices\n\n## odyn-astro-starter\n\nThis project was born from odyn-astro-starter${stamp.ref ? ` (${stamp.ref})` : ""}, used under the MIT License:\n\n\`\`\`\n${notice.trim()}\n\`\`\`\n\n## GSAP\n\nGSAP is used under its standard license (gsap.com/standard-license).\n`,
    );
    console.log("✓ THIRD-PARTY-NOTICES.md: the starter's MIT notice and GSAP's license");
  }
  for (const f of ["CHANGELOG.md", "docs/migrations", "LICENSE"]) {
    await rm(resolve(root, f), { recursive: true, force: true });
    console.log(`✓ removed ${f}`);
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(
    `✓ package.json: name=${name}, starter stamp ${stamp.ref ?? ""}@${(stamp.head ?? "").slice(0, 7)}`,
  );

  if (replaceHistory) {
    const old = resolve(root, ".git");
    const parked = resolve(root, ".git.starter");
    await rename(old, parked);
    try {
      execSync("git init -q", { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
      await writeFile(resolve(root, ".git/info/exclude"), ".git.starter/\n", { flag: "a" });
      execSync("git add -A && git commit -q -m 'chore: born from odyn-astro-starter'", {
        cwd: root,
        stdio: ["ignore", "pipe", "pipe"],
      });
      await rm(parked, { recursive: true, force: true });
      console.log("✓ fresh git history");
    } catch (e) {
      await rm(old, { recursive: true, force: true });
      await rename(parked, old);
      pkg.starter.initialised = false;
      await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
      refuse(
        `the first commit failed, so the starter history stays and init can be rerun.\n${e.stderr ?? e.message}`,
      );
    }
  }
} else {
  console.log(`· already initialised from ${pkg.starter.ref ?? pkg.starter.head}`);
}

if (args.has("--no-example") && !existsSync(resolve(root, "src/pages/example.astro"))) {
  console.log("· the example is already removed");
} else if (args.has("--no-example")) {
  for (const f of [
    "src/pages/example.astro",
    "src/lib/example-engine.ts",
    "src/tune/example.json",
    ...[
      "from-clone-to-deploy",
      "what-is-here",
      "not-included-by-design",
      "generators-and-add-ons",
      "versioning-and-migrations",
      "sending-improvements-back",
      "handover",
      "the-example",
      "reading-budget",
      "vendored-files-as-a-registry",
      "maintenance",
    ].map((n) => `src/content/notes/${n}.md`),
    "tests/e2e/conductor.spec.ts",
    "tests/e2e/media.spec.ts",
    "public/example-plate.svg",
  ]) {
    await rm(resolve(root, f), { force: true });
    console.log(`✓ removed ${f}`);
  }
  const strip = async (file, fn) => {
    const p = resolve(root, file);
    const before = await readFile(p, "utf8");
    const after = fn(before);
    if (after === before) refuse(`${file}: no example reference found to remove. The strip needs updating.`);
    await writeFile(p, after);
    console.log(`✓ ${file}: example references removed`);
  };
  await strip("src/config/site.ts", (s) =>
    s.replace(/^\s*\{ label: "Example", href: "\/example" \},\n/m, ""),
  );
  await strip("src/pages/index.astro", (s) =>
    s
      .replace(/\n\s*The example route shows every primitive, then gets deleted\./, "")
      .replace(/^\s*<p class="hero__cta[^"]*"><a[^>]*href="\/example"[^>]*>[^<]*<\/a><\/p>\n/m, ""),
  );
  await strip("tests/e2e/smoke.spec.ts", (s) =>
    s.replace(/\ntest\("client navigation covers, swaps and reveals"[\s\S]*?\n\}\);\n/, "\n"),
  );
  const eng = resolve(root, "src/lib/engines.ts");
  await writeFile(
    eng,
    `import type { Engine } from "@odyn/engines";\n\n// One entry per heavy module. Add one with: bun run new engine <name>\nexport const ENGINES: Engine[] = [];\n`,
  );
  console.log("✓ engines.ts emptied");
  await writeFile(
    resolve(root, "src/content/notes/first-note.md"),
    `---\ntitle: "First note"\ndescription: "The one note the project starts with. Replace it."\ndate: ${new Date().toISOString().slice(0, 10)}\n---\n\nThe notes collection starts here. The schema is in \`src/content.config.ts\`; the listing is \`/notes\`, the entry page \`/notes/first-note\`, the feed \`/rss.xml\`. Replace this note, or delete the collection, its routes and the feed together.\n`,
  );
  console.log("✓ src/content/notes/first-note.md: the seed note");
  execSync(
    "bunx prettier --write src/config/site.ts src/pages/index.astro tests/e2e/smoke.spec.ts src/lib/engines.ts",
    {
      cwd: root,
      stdio: "ignore",
    },
  );
  console.log("✓ formatted");
}

if (args.has("--handoff")) {
  for (const f of [
    ".claude",
    "CLAUDE.md",
    "AGENTS.md",
    "docs/upstream.md",
    "renovate.json",
    "jsrepo.config.ts",
    "tests/scaffold",
    "scripts/add-icon.mjs",
  ]) {
    await rm(resolve(root, f), { recursive: true, force: true });
    console.log(`✓ removed ${f}`);
  }
  const handoffPkg = JSON.parse(await readFile(pkgPath, "utf8"));
  delete handoffPkg.scripts["test:scaffold"];
  delete handoffPkg.scripts.icon;
  await writeFile(pkgPath, JSON.stringify(handoffPkg, null, 2) + "\n");
  console.log("✓ package.json: scaffold and icon scripts removed");
  await rename(resolve(root, "PROD-README.md"), resolve(root, "README.md"));
  console.log("✓ README.md is the production README");
  console.log(
    "→ next, fill in the README's placeholders, hand over credentials per environment, and transfer the repo.",
  );
}
