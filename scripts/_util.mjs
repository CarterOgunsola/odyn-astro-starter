export const kebab = (raw) =>
  raw
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .replace(/(\d)([A-Za-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const pascal = (k) => k.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
