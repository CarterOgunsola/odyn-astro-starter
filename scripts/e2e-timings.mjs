import { readFileSync } from "node:fs";

const timings = {};
const visit = (suite, path) => {
  const here = suite.file && path.length === 0 ? [suite.file] : [...path, suite.title];
  for (const spec of suite.specs ?? []) {
    const runs = spec.tests.flatMap((t) => t.results);
    if (runs.length > 0) timings[[...here, spec.title].join(" › ")] = Math.round(runs.at(-1).duration);
  }
  for (const child of suite.suites ?? []) visit(child, here);
};
for (const file of process.argv.slice(2)) {
  for (const suite of JSON.parse(readFileSync(file, "utf8")).suites) visit(suite, []);
}
console.log(JSON.stringify(timings, null, 2));
