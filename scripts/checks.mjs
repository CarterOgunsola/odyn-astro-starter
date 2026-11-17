import { spawn } from "node:child_process";

const GROUPS = [
  [
    ["sync", "bunx", ["astro", "sync"]],
    ["types", "bun", ["check", "--no-script"]],
    ["astro", "bunx", ["astro", "check"]],
  ],
  [["lint", "bunx", ["oxlint"]]],
  [["format", "bunx", ["prettier", "--check", "."]]],
  [["tokens", "node", ["scripts/check-tokens.mjs"]]],
  [["unit", "bun", ["test", "tests/unit"]]],
];

const run = ([name, cmd, args]) =>
  new Promise((done) => {
    const started = performance.now();
    const child = spawn(cmd, args, { env: { ...process.env, FORCE_COLOR: "1" } });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => {
      const secs = ((performance.now() - started) / 1000).toFixed(1);
      if (code === 0) console.log(`✓ ${name} ${secs}s`);
      else console.log(`✗ ${name} ${secs}s\n${out.trimEnd()}\n`);
      done(code === 0);
    });
  });

const inOrder = async (tasks) => {
  for (const task of tasks) if (!(await run(task))) return false;
  return true;
};

const results = await Promise.all(GROUPS.map(inOrder));
process.exit(results.every(Boolean) ? 0 : 1);
