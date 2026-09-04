import type { Engine } from "@odyn/engines";

export const ENGINES: Engine[] = [
  {
    name: "ExampleEngine",
    when: "[data-example-engine]",
    routes: /^\/example\/?$/,
    load: () => import("@/lib/example-engine").then((m) => () => m.ExampleEngine.init()),
  },
];
