export const SITE = {
  // astro.config site, canonical and sitemap URLs
  url: "https://example.com",

  // Seo.astro
  name: "Odyn Astro Starter",
  titleSeparator: " :: ",
  tagline: "A starting point for experiential sites",
  // pages/site.webmanifest.ts
  shortName: "Starter",
  // Seo.astro
  description:
    "A personal Astro starter. Vanilla TypeScript, SCSS, GSAP, a transition conductor, lazy engines and a Cloudflare Worker deploy.",
  // Seo.astro, Footer.astro
  author: "Your Name",
  // Base.astro, Seo.astro, the manifest
  locale: "en",
  // Seo.astro
  ogLocale: "en_US",
  // Seo.astro
  ogImage: "/og-default.png",
  // Seo.astro
  twitterHandle: "",

  // Base.astro, lib/theme.ts
  theme: "dark" as "system" | "light" | "dark",
  // Seo.astro, the manifest
  themeColor: { light: "#f2f2f1", dark: "#141414" },

  // astro.config sitemap filter, Seo.astro
  noindex: ["/example"],

  // Header.astro
  nav: [
    { label: "Example", href: "/example" },
    { label: "Notes", href: "/notes" },
  ],

  // Seo.astro, Footer.astro
  socials: {
    github: "",
    x: "",
    linkedin: "",
  },

  // pages/rss.xml.ts
  feed: { title: "Notes", description: "Notes from this site." },
} as const;

export const SOCIAL_LINKS = Object.values(SITE.socials).filter(Boolean) as string[];
