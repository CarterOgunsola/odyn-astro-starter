import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";
import { SITE } from "./src/config/site";
import { tunePlugin } from "./scripts/vite-tune.mjs";

export default defineConfig({
  site: SITE.url,
  output: "static",
  session: false,
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Geist",
      cssVariable: "--font-sans",
      fallbacks: ["system-ui", "-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      options: {
        variants: [
          { src: ["./src/assets/fonts/geist-latin-wght-normal.woff2"], weight: "100 900", style: "normal" },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/geist-mono-latin-wght-normal.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => {
        const p = new URL(page).pathname;
        const listed = SITE.noindex.some((n) => p === n || p === `${n}/`);
        return !listed && !/(?:-v2|-old|\/old-)[^/]*\/?$/.test(p);
      },
    }),
  ],
  vite: {
    plugins: [tunePlugin()],
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [fileURLToPath(new URL("./src/styles", import.meta.url))],
        },
      },
    },
    server: {
      proxy: {
        "/api": { target: "http://localhost:8787", changeOrigin: true },
      },
    },
  },
});
