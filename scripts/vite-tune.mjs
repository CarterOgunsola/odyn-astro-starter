import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const TUNE_DIR = "src/tune";
export const MAX_BYTES = 16 * 1024;
const NAME = /^[a-z][a-z0-9-]*$/;

export function parseTune(name, raw) {
  if (typeof name !== "string" || name.length > 64)
    return { ok: false, status: 400, error: "name over 64 characters" };
  if (!NAME.test(name)) return { ok: false, status: 400, error: `bad name: ${JSON.stringify(name)}` };
  if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) return { ok: false, status: 413, error: "body over 16 KB" };
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, error: "body is not JSON" };
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { ok: false, status: 400, error: "body must be a flat object" };
  for (const [k, v] of Object.entries(body)) {
    if (!NAME.test(k) && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k))
      return { ok: false, status: 400, error: `bad key: ${JSON.stringify(k)}` };
    if (k === "__proto__" || k === "constructor" || k === "prototype")
      return { ok: false, status: 400, error: `bad key: ${k}` };
    if (typeof v !== "number" || !Number.isFinite(v))
      return { ok: false, status: 400, error: `${k} is not a finite number` };
  }
  return { ok: true, text: JSON.stringify(body, null, 2) + "\n" };
}

export async function handleTune(name, raw, write, root = process.cwd()) {
  const parsed = parseTune(name, raw);
  if (!parsed.ok) return { status: parsed.status, message: parsed.error };
  const path = resolve(root, TUNE_DIR, `${name}.json`);
  await write(path, parsed.text);
  return { status: 204, message: `${TUNE_DIR}/${name}.json` };
}

const writeJson = async (path, text) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text);
};

export function tunePlugin() {
  return {
    name: "odyn-tune",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/__tune/")) return next();
        const site = req.headers["sec-fetch-site"];
        if (site && site !== "same-origin" && site !== "none") {
          res.statusCode = 403;
          res.end("cross-site");
          return;
        }
        if (!String(req.headers["content-type"] ?? "").startsWith("application/json")) {
          res.statusCode = 415;
          res.end("application/json only");
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end("POST only");
        }
        const name = url.slice("/__tune/".length).split("?")[0];
        let raw = "";
        let over = false;
        for await (const chunk of req) {
          raw += chunk;
          if (raw.length > MAX_BYTES + 1) {
            over = true;
            break;
          }
        }
        const r = over
          ? { status: 413, message: "body over 16 KB" }
          : await handleTune(name, raw, writeJson, server.config.root);
        res.statusCode = r.status;
        if (r.status === 204) {
          server.config.logger.info(`tune: wrote ${r.message}`, { timestamp: true });
          return res.end();
        }
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(r.message);
      });
    },
  };
}
