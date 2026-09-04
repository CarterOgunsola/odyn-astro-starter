import type { APIRoute } from "astro";
import { SITE } from "@/config/site";

export const GET: APIRoute = () => {
  const color = SITE.themeColor[SITE.theme === "dark" ? "dark" : "light"];
  const manifest = {
    name: SITE.name,
    short_name: SITE.shortName,
    lang: SITE.locale,
    id: "/",
    start_url: "/",
    display: "standalone",
    background_color: color,
    theme_color: color,
    icons: [{ src: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
  };
  return new Response(JSON.stringify(manifest, null, 2) + "\n", {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
};
