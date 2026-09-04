type Env = { ASSETS: { fetch: (req: Request) => Promise<Response> } };

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      // The _headers file never applies to Worker responses, so the API sets its own.
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      ...init.headers,
    },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD") {
        return json({ error: "method not allowed" }, { status: 405, headers: { allow: "GET, HEAD" } });
      }
      if (url.pathname === "/api/health") {
        return json({ ok: true, time: new Date().toISOString() });
      }
      if (url.pathname.startsWith("/api/")) {
        return json({ error: "not found" }, { status: 404 });
      }
    } catch (e) {
      console.error(e);
      return json({ error: "internal" }, { status: 500 });
    }
    return env.ASSETS.fetch(request);
  },
};
