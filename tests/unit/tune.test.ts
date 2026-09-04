import { test, expect } from "bun:test";
import { parseTune, handleTune, MAX_BYTES } from "@root/scripts/vite-tune.mjs";

test("a flat object of finite numbers is written pretty with a trailing newline", () => {
  const r = parseTune("example", '{"speed":0.6,"lines":24}');
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.text).toBe('{\n  "speed": 0.6,\n  "lines": 24\n}\n');
});

test("bad names, bad bodies and oversize bodies are refused", () => {
  const bad = [
    ["Example", "{}"],
    ["../x", "{}"],
    ["", "{}"],
    ["ok", "not json"],
    ["ok", "[1,2]"],
    ["ok", "null"],
    ["ok", '{"a":"1"}'],
    ["ok", '{"a":null}'],
    ["ok", '{"a":{"b":1}}'],
    ["ok", '{"bad key":1}'],
  ] as const;
  for (const [name, raw] of bad) {
    const r = parseTune(name, raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  }
  const big = parseTune("ok", `{"a":${"1".repeat(MAX_BYTES)}}`);
  expect(big.ok).toBe(false);
  if (!big.ok) expect(big.status).toBe(413);
  expect(parseTune("ok", '{"a":1e999}').ok).toBe(false);
});

test("handleTune writes to src/tune/<name>.json under the root and reports 204", async () => {
  const writes: [string, string][] = [];
  const r = await handleTune(
    "hero",
    '{"x":1}',
    async (p: string, t: string) => void writes.push([p, t]),
    "/proj",
  );
  expect(r.status).toBe(204);
  expect(writes.length).toBe(1);
  expect(writes[0][0]).toBe("/proj/src/tune/hero.json");
  expect(writes[0][1]).toBe('{\n  "x": 1\n}\n');
  const bad = await handleTune("Hero", "{}", async () => {}, "/proj");
  expect(bad.status).toBe(400);
});

test("prototype keys and long names are refused", () => {
  const status = (r: ReturnType<typeof parseTune>) => (r.ok ? 0 : r.status);
  expect(status(parseTune("x", '{"__proto__": 1}'))).toBe(400);
  expect(status(parseTune("x", '{"constructor": 1}'))).toBe(400);
  expect(status(parseTune("a".repeat(65), '{"a": 1}'))).toBe(400);
});
