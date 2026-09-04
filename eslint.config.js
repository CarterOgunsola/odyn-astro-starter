import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", ".astro/**", "node_modules/**", ".wrangler/**", "test-results/**"] },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["../../*"], message: "Use @/ or @root/ instead of ../../" }] },
      ],
    },
  },
  {
    files: ["packages/**", "tests/**"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
];
