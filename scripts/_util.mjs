export const kebab = (raw) =>
  raw
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Za-z])(\d)/g, "$1-$2")
    .replaceAll(/(\d)([A-Za-z])/g, "$1-$2")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

export const pascal = (k) => k.replaceAll(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
