// El navegador que dibuja los cuadros 2D (Chromium, a través de Playwright).
// Se busca primero en la carpeta (npm install) y, si no, en la instalación global de Node.
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

export async function chromium() {
  try { return (await import("playwright")).chromium; } catch {}
  try {
    const global = execSync("npm root -g", { encoding: "utf8" }).trim();
    return createRequire(global + "/")("playwright").chromium;
  } catch {}
  throw new Error("Falta el dibujante 2D: en esta carpeta, npm install y luego npx playwright install chromium");
}
