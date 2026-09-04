import type { APIContext } from "astro";
import { SITE } from "@/config/site";

export function GET(context: APIContext) {
  const site = (context.site ?? new URL(SITE.url)).href.replace(/\/$/, "");
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${site}/sitemap-index.xml`, ""].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
