// El montaje de este video: añade las piezas propias (piezas-extra.mjs) y usa el motor de Barcada tal cual.
// Uso (desde la carpeta de Barcada):
//   node proyectos/2026-11-05-pedicurecadacuanto/hacer.mjs tomas      → revisar/tomas.jpg
//   node proyectos/2026-11-05-pedicurecadacuanto/hacer.mjs borrador   → revisar/borrador.mp4 (con marca de agua)
//   node proyectos/2026-11-05-pedicurecadacuanto/hacer.mjs final      → entrega/video.mp4 (1080×1920) y video-4k.mp4
//   node proyectos/2026-11-05-pedicurecadacuanto/hacer.mjs foto <n>   → revisar/toma-<n>.jpg (un cuadro de esa toma)
// La marca de agua (Azurre_estudiodebelleza) va encima de todo el video, centrada, al 30 % (marca.mjs).
import { renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "./piezas-extra.mjs";
import { asegurar, ffmpeg, leerJSON } from "../../nucleo/comun.mjs";
import { hojaDeTomas, lineaDeTiempo, montar, cuando } from "../../nucleo/montaje.mjs";
import { marcaDeAgua } from "./marca.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const [orden, arg] = process.argv.slice(2);

async function conMarca(entrada, salida, { borrador = false, cuatroK = null } = {}) {
  const png = await marcaDeAgua(join(asegurar(join(DIR, ".montaje")), "marca.png"));
  const esc = borrador ? "[1:v]scale=540:960[m];[0:v][m]" : "[0:v][1:v]";
  await ffmpeg(["-i", entrada, "-i", png, "-filter_complex", `${esc}overlay=0:0:format=auto[v]`, "-map", "[v]", "-map", "0:a", "-c:v", "libx264",
    "-preset", borrador ? "veryfast" : "slow", "-crf", borrador ? "27" : "16", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", salida]);
  if (cuatroK) await ffmpeg(["-i", salida, "-vf", "scale=2160:3840:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", cuatroK]);
  console.log(`✓ ${salida}${cuatroK ? `\n✓ ${cuatroK}` : ""}`);
}

if (orden === "tomas") await hojaDeTomas(DIR);
else if (orden === "borrador") {
  const v = await montar(DIR, { borrador: true });
  const sin = v.replace(/\.mp4$/, "-sinmarca.mp4"); renameSync(v, sin);
  await conMarca(sin, v, { borrador: true });
} else if (orden === "final") {
  const e = asegurar(join(DIR, "entrega")), sin = join(DIR, "revisar", "final-sinmarca.mp4");
  await montar(DIR, { salida: sin });
  await conMarca(sin, join(e, "video.mp4"), { cuatroK: join(e, "video-4k.mp4") });
} else if (orden === "foto") {
  const p = leerJSON(join(DIR, "proyecto.json")), tiempos = leerJSON(join(DIR, "voz", "tiempos.json"));
  const tomas = lineaDeTiempo(p, tiempos), lista = arg ? [tomas[Number(arg) - 1]] : tomas;
  const { crearCuadro } = await import("../../nucleo/2d/escena.mjs"), { foto, cerrarNavegador } = await import("../../nucleo/2d/dibujante.mjs");
  for (const t of lista) {
    const f = join(asegurar(join(DIR, "revisar")), `toma-${t.n}.jpg`);
    await foto(crearCuadro(t.dibujo, t, (ref) => cuando(tiempos, ref))(t.inicio + (t.fin - t.inicio) * Number(process.argv[4] ?? 0.7)), f, 0.5);
    console.log(`✓ ${f}`);
  }
  await cerrarNavegador();
} else console.log("Órdenes: tomas | borrador | final | foto [n] [fracción]");
