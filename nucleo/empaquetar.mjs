// El paquete de venta: un .zip limpio de Barcada, sin nada del vendedor (claves, preferencias, efectos, proyectos,
// calendarios), con las carpetas vacías listas y un aprendido.md de fábrica.
// node barcada.mjs empaquetar  →  dist/Barcada-v<versión>.zip
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";
import { RAIZ } from "./comun.mjs";

// Lo que se vende (todo lo demás se queda fuera).
const INCLUIR = ["barcada.mjs", "package.json", "AGENTS.md", "CLAUDE.md", "METODO.md", "LEEME.md", "LICENCIA.md", "VERSION.md",
  "claves.env.ejemplo", "nucleo", "estilos", "fuentes", "guias", "ejemplos"];
// Dentro de esas carpetas, lo que no va (pruebas internas).
const FUERA = [/nucleo\/2d\/prueba-look\.mjs$/, /\.DS_Store$/, /node_modules/];
const VACIAS = ["proyectos", "sonidos", "calendario", "series"];
// Lo que nunca puede ir en el paquete: si aparece, se para.
const PROHIBIDO = [/^claves\.env$/, /^preferencias\.json$/, /sk_[A-Za-z0-9]{20,}/];

const APRENDIDO = `# Lo aprendido

Errores que no se repiten y lo que el usuario corrige «para siempre». Se lee antes de cada video. Solo entra lo que el
usuario aprueba.

- Los textos dentro de los dibujos, cortos y grandes: lo que se explica va en el rótulo o en un titular, no en letra pequeña.
- Portadas: el título siempre centrado y con colores vivos; el fondo, desenfocado y oscurecido en el centro.
`;

export function empaquetar() {
  const version = (readFileSync(join(RAIZ, "VERSION.md"), "utf8").match(/^## (\d+\.\d+(\.\d+)?)/m) || [, "1.0"])[1];
  const nombre = `Barcada-v${version}`, dist = join(RAIZ, "dist"), dir = join(dist, nombre);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  for (const x of INCLUIR) cpSync(join(RAIZ, x), join(dir, x), { recursive: true, filter: (src) => !FUERA.some((r) => r.test(src.replace(/\\/g, "/"))) });
  for (const v of VACIAS) { mkdirSync(join(dir, v), { recursive: true }); writeFileSync(join(dir, v, ".gitkeep"), ""); }
  writeFileSync(join(dir, "aprendido.md"), APRENDIDO);
  writeFileSync(join(dir, "temas-usados.md"), "# Temas usados\n\nUno por línea: fecha · tema · proyecto.\n");
  writeFileSync(join(dir, ".gitignore"), "claves.env\nnode_modules/\nproyectos/*/.montaje/\nproyectos/*/revisar/\ndist/\n.DS_Store\n");
  // revisión: nada prohibido dentro
  const todos = []; const recorrer = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? recorrer(p) : todos.push(p); } }; recorrer(dir);
  for (const f of todos) {
    const rel = relative(dir, f).replace(/\\/g, "/");
    if (PROHIBIDO[0].test(rel) || PROHIBIDO[1].test(rel)) throw new Error(`El paquete no puede llevar ${rel}`);
    if (/\.(mjs|js|json|md|env|ejemplo|txt)$/.test(f) && PROHIBIDO[2].test(readFileSync(f, "utf8"))) throw new Error(`Hay una clave dentro de ${rel}: revísalo antes de vender.`);
  }
  // el .zip
  const zip = join(dist, `${nombre}.zip`);
  rmSync(zip, { force: true });
  let r = spawnSync("zip", ["-rqX", `${nombre}.zip`, nombre], { cwd: dist });
  if (r.status !== 0) r = spawnSync("python3", ["-c", `import shutil; shutil.make_archive(${JSON.stringify(join(dist, nombre))}, "zip", ${JSON.stringify(dist)}, ${JSON.stringify(nombre)})`]);
  if (r.status !== 0) r = spawnSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${dir}' -DestinationPath '${zip}' -Force`]);
  if (!existsSync(zip)) throw new Error("No pude crear el .zip (hace falta zip, python3 o PowerShell).");
  rmSync(dir, { recursive: true, force: true });
  const mb = (statSync(zip).size / 1048576).toFixed(1);
  console.log(`✓ ${zip} (${mb} MB, ${todos.length} archivos)`);
  return zip;
}
