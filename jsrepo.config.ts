export default {
  registry: {
    name: "odyn",
    items: [
      { name: "styles", type: "styles", add: "when-added", files: [{ path: "src/styles" }] },
      {
        name: "layout",
        type: "layouts",
        add: "when-added",
        dependencyResolution: "manual",
        files: [
          { path: "src/layouts/Base.astro" },
          { path: "src/components/Seo.astro" },
          { path: "src/components/Header.astro" },
          { path: "src/components/Footer.astro" },
          { path: "src/components/ThemeToggle.astro" },
        ],
      },
      { name: "config", type: "config", add: "when-added", files: [{ path: "src/config" }] },
      {
        name: "devkit",
        type: "devkit",
        add: "when-added",
        files: [{ path: "packages/devkit/src/index.ts" }],
      },
      {
        name: "element-skeleton",
        type: "templates",
        add: "when-added",
        files: [{ path: "scripts/_templates/element.ts.tpl", role: "example" }],
      },
    ],
    excludeDeps: ["astro", "gsap"],
    outputs: [],
  },
  registries: [],
  providers: [],
  languages: [],
  transforms: [],
  paths: {},
  build: { transforms: [] },
};
