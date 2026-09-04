type Nav = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

export function gate(): boolean {
  if (new URLSearchParams(location.search).get("gl") === "off") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 2) return false;
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2");
  if (!gl) return false;
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}
