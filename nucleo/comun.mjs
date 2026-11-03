// Barco Viral · utilidades comunes: rutas, claves, ejecutar ffmpeg y leer/guardar JSON.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const FUENTES = join(RAIZ, "fuentes");
export const ANCHO = 1080, ALTO = 1920, FPS = 30;

// ---------------------------------------------------------------- claves
// Las claves viven en claves.env (KEY=valor por línea). Nunca se imprimen.
export function cargarClaves() {
  const f = join(RAIZ, "claves.env");
  if (!existsSync(f)) return;
  for (const linea of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?([^"'\s#]+)/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
export const hayClave = (nombre) => Boolean(process.env[nombre] && !/^pega|^tu_|x{4}/i.test(process.env[nombre]));

// ---------------------------------------------------------------- archivos
export const leerJSON = (f) => JSON.parse(readFileSync(f, "utf8"));
export function guardarJSON(f, datos) { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(datos, null, 2) + "\n"); }
export const asegurar = (d) => { mkdirSync(d, { recursive: true }); return d; };

// La carpeta de un proyecto, a partir de su nombre o ruta.
export function carpetaProyecto(arg) {
  if (!arg) throw new Error("Falta el proyecto: node bv.mjs <orden> <proyecto>");
  for (const c of [resolve(arg), join(RAIZ, "proyectos", arg)]) if (existsSync(join(c, "proyecto.json"))) return c;
  // también vale el final del nombre («prueba» encuentra proyectos/2026-10-27-prueba); el más reciente
  const d = join(RAIZ, "proyectos");
  const hallados = existsSync(d) ? readdirSync(d).filter((x) => x.endsWith(arg) && existsSync(join(d, x, "proyecto.json"))).sort() : [];
  if (hallados.length) return join(d, hallados.at(-1));
  throw new Error(`No encuentro el proyecto «${arg}» (busco proyecto.json en proyectos/${arg}).`);
}

// ---------------------------------------------------------------- comandos
export function hay(cmd) { return spawnSync(cmd, ["-version"], { stdio: "ignore" }).status === 0; }

// ffmpeg con sus argumentos; si falla, enseña el final de su salida.
export function ffmpeg(args, { silencio = true } = {}) {
  return new Promise((ok, mal) => {
    const p = spawn("ffmpeg", ["-hide_banner", "-nostdin", "-loglevel", silencio ? "error" : "info", "-y", ...args]);
    if (process.env.BV_DEPURAR) console.error("ffmpeg " + args.join(" "));
    let err = "";
    p.stderr.on("data", (d) => { err += d; if (err.length > 20000) err = err.slice(-20000); });
    p.on("close", (c) => (c === 0 ? ok() : mal(new Error(`ffmpeg falló (${c}):\n${err.slice(-3000)}`))));
  });
}

export function duracion(archivo) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", archivo], { encoding: "utf8" });
  return parseFloat(r.stdout) || 0;
}

// Varias tareas a la vez, como mucho n.
export async function enParalelo(lista, n, fn) {
  const res = new Array(lista.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, lista.length) }, async () => { while (i < lista.length) { const j = i++; res[j] = await fn(lista[j], j); } }));
  return res;
}

export const sinTildes = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
export const fmtT = (t) => `${t.toFixed(2)} s`;
