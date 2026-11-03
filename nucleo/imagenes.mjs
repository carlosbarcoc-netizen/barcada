// Lo que se ve en cada toma del estilo realista (el 2D se dibuja: nucleo/2d/). Una imagen generada a medida con IA
// (fal.ai FLUX u OpenAI gpt-image-1, centavos por imagen), o una foto o video propio del creador (toma.archivo).
// Sin clave, «modo prueba»: un fondo con el texto de la toma, para revisar tiempos y montaje.
// Cada archivo se guarda en imagenes/ con su huella: si nada cambia, no se vuelve a pedir ni a pagar.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALTO, ANCHO, FUENTES, RAIZ, asegurar, enParalelo, ffmpeg, hayClave, leerJSON } from "./comun.mjs";

export const ESTILOS = leerJSON(join(RAIZ, "estilos", "estilos.json"));

// El prompt completo de una toma: el sujeto del video (para que todo se parezca), lo que se ve y el estilo.
export function promptDe(p, toma) {
  const est = ESTILOS[p.estilo] || ESTILOS.documental;
  return [toma.imagen, p.sujeto ? `Visual continuity: ${p.sujeto}` : "", "vertical 9:16 composition, main subject centered and large", est.sufijo].filter(Boolean).join(". ");
}

export function proveedor() {
  if (hayClave("FAL_KEY")) return "fal";
  if (hayClave("OPENAI_API_KEY")) return "openai";
  return "prueba";
}
// La fuente de una toma: "ia" si hay clave de fal.ai u OpenAI; si no, «prueba».
export function fuenteDe() { return proveedor() !== "prueba" ? "ia" : "prueba"; }

// Modo prueba: un degradado con el número de la toma y su descripción.
async function deMuestra(archivo, n, toma) {
  const palabras = String(toma.imagen).split(/\s+/), lineas = [];
  for (const w of palabras) { if (!lineas.length || (lineas.at(-1) + " " + w).length > 26) lineas.push(w); else lineas[lineas.length - 1] += " " + w; }
  const txt = archivo + ".txt";
  writeFileSync(txt, `TOMA ${n}\n\n${lineas.slice(0, 8).join("\n")}`);
  await ffmpeg(["-f", "lavfi", "-i", `gradients=s=${ANCHO}x${ALTO}:c0=0x3a2214:c1=0x0e0805:x0=200:y0=300:x1=900:y1=1700:d=1`, "-frames:v", "1",
    "-vf", `drawtext=fontfile=${join(FUENTES, "Poppins-Bold.ttf")}:textfile=${txt}:fontcolor=white@0.85:fontsize=54:x=(w-tw)/2:y=(h-th)/2:line_spacing=14`, archivo]);
  unlinkSync(txt);
}

// Consigue lo que falte de cada toma. Devuelve la lista de archivos por toma (.jpg o .mp4).
export async function hacerImagenes(dir, { calidad } = {}) {
  const p = leerJSON(join(dir, "proyecto.json")), di = asegurar(join(dir, "imagenes"));
  const pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  const tomas = p.escenas.flatMap((e) => e.tomas);
  const prov = proveedor(), cal = calidad || p.calidad || "normal";
  const fuentes = tomas.map((t) => (t.dibujo ? "2d" : fuenteDe(t, p, pref)));
  if (fuentes.includes("prueba")) console.log("⚠ Sin clave de imágenes IA (fal.ai u OpenAI): imágenes de prueba (no se paga nada).");
  const base = parseInt(createHash("sha1").update(p.titulo || "bv").digest("hex").slice(0, 6), 16);
  const archivos = await enParalelo(tomas, 3, async (toma, i) => {
    const n = i + 1, nn = String(n).padStart(2, "0"), fuente = fuentes[i];
    if (toma.dibujo) return null;                                    // una toma 2D: se dibuja, no se busca
    if (toma.archivo) return join(dir, toma.archivo);                // una foto o video propio del creador
    const prompt = promptDe(p, toma), semilla = toma.semilla ?? base + n;
    const clave = fuente === "ia" ? [prompt, semilla, prov, cal] : ["prueba", toma.imagen];
    const h = createHash("sha1").update(JSON.stringify(clave)).digest("hex").slice(0, 8);
    const hecho = readdirSync(di).find((x) => x.startsWith(`toma-${nn}-${h}.`));
    if (hecho) return join(di, hecho);
    // las versiones anteriores de esta toma se borran
    for (const viejo of readdirSync(di)) if (viejo.startsWith(`toma-${nn}-`)) unlinkSync(join(di, viejo));
    let f = join(di, `toma-${nn}-${h}.jpg`);
    if (fuente === "prueba") await deMuestra(f, n, toma);
    else writeFileSync(f, prov === "fal" ? await conFal(prompt, semilla, cal) : await conOpenAI(prompt, semilla, cal));
    console.log(`toma ${n}/${tomas.length} ✓ [${fuente}] ${toma.imagen.slice(0, 60)}`);
    return f;
  });
  return archivos;
}

