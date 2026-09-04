import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const EXT = [".ts", ".astro", ".scss", ".mjs", ".tpl"];
const count = (dir) => {
  let n = 0;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) n += f === "node_modules" ? 0 : count(p);
    else if (EXT.includes(extname(p))) n += readFileSync(p, "utf8").split("\n").length - 1;
  }
  return n;
};
const chassis = count(join(root, "src"));
const whole =
  chassis + ["packages", "scripts", "worker", "tests"].reduce((n, d) => n + count(join(root, d)), 0);
console.log(
  `chassis (src): ${chassis} lines\nwhole tree (src, packages, scripts, worker, tests): ${whole} lines`,
);
