// Las imágenes de cada toma, generadas con IA. Proveedores: fal.ai (FLUX) u OpenAI (gpt-image-1), según la clave que
// haya en claves.env. Sin clave, «modo prueba»: un fondo con el texto de la toma, para revisar tiempos y montaje.
// Cada imagen se guarda en imagenes/ con la huella de su prompt: si no cambia, no se vuelve a pagar.
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

async function conFal(prompt, semilla, calidad) {
  const modelo = calidad === "alta" ? "fal-ai/flux-pro/v1.1-ultra" : "fal-ai/flux/dev";
  const cuerpo = calidad === "alta"
    ? { prompt, aspect_ratio: "9:16", raw: true, seed: semilla, output_format: "jpeg", enable_safety_checker: true }
    : { prompt, image_size: { width: 1088, height: 1920 }, num_inference_steps: 30, guidance_scale: 3.5, seed: semilla, output_format: "jpeg", enable_safety_checker: true };
  const r = await fetch(`https://fal.run/${modelo}`, { method: "POST", headers: { Authorization: `Key ${process.env.FAL_KEY}`, "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
  if (!r.ok) throw new Error(`fal.ai dijo ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const url = (await r.json()).images?.[0]?.url;
  if (!url) throw new Error("fal.ai no devolvió imagen.");
  const img = await fetch(url);
  return Buffer.from(await img.arrayBuffer());
}

async function conOpenAI(prompt, _semilla, calidad) {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", quality: calidad === "alta" ? "high" : "medium", n: 1 }),
  });
  if (!r.ok) throw new Error(`OpenAI dijo ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return Buffer.from((await r.json()).data[0].b64_json, "base64");
}

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

// Genera las que falten (o las de `solo`, una lista de números de toma). Devuelve la lista de archivos por toma.
export async function hacerImagenes(dir, { solo = null, calidad } = {}) {
  const p = leerJSON(join(dir, "proyecto.json")), di = asegurar(join(dir, "imagenes"));
  const tomas = p.escenas.flatMap((e) => e.tomas);
  const prov = proveedor(), cal = calidad || p.calidad || "normal";
  if (prov === "prueba") console.log("⚠ Sin FAL_KEY ni OPENAI_API_KEY: imágenes de prueba (no se paga nada).");
  const base = parseInt(createHash("sha1").update(p.titulo || "bv").digest("hex").slice(0, 6), 16);
  const archivos = await enParalelo(tomas, 3, async (toma, i) => {
    const n = i + 1;
    if (toma.archivo) return join(dir, toma.archivo);                // una foto propia del creador
    const prompt = promptDe(p, toma), semilla = toma.semilla ?? base + n;
    const h = createHash("sha1").update(JSON.stringify([prompt, semilla, prov, cal])).digest("hex").slice(0, 8);
    const f = join(di, `toma-${String(n).padStart(2, "0")}-${h}.jpg`);
    if (existsSync(f) && !(solo && solo.includes(n))) return f;
    // las versiones anteriores de esta toma se borran
    for (const viejo of readdirSync(di)) if (viejo.startsWith(`toma-${String(n).padStart(2, "0")}-`) && join(di, viejo) !== f) unlinkSync(join(di, viejo));
    if (prov === "prueba") await deMuestra(f, n, toma);
    else writeFileSync(f, prov === "fal" ? await conFal(prompt, semilla, cal) : await conOpenAI(prompt, semilla, cal));
    console.log(`imagen ${n}/${tomas.length} ✓ ${toma.imagen.slice(0, 60)}`);
    return f;
  });
  return archivos;
}
