// Lo que se ve en cada toma. Tres fuentes:
// - "ia": una imagen realista generada a medida (fal.ai FLUX u OpenAI gpt-image-1). Cuesta centavos por imagen.
// - "foto": una foto real de banco gratuito (Pexels o Pixabay; licencia de uso comercial gratis). Sin costo.
// - "clip": un video real de banco gratuito (Pexels o Pixabay). Sin costo.
// La fuente sale de la toma (fuente), del proyecto o de preferencias.json; si no, de las claves que haya.
// Sin ninguna clave, «modo prueba»: un fondo con el texto de la toma, para revisar tiempos y montaje.
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
export const bancoDeStock = () => (hayClave("PEXELS_API_KEY") ? "pexels" : hayClave("PIXABAY_API_KEY") ? "pixabay" : null);

// La fuente de una toma: la suya, la del proyecto, la de las preferencias o, si no, la mejor que permitan las claves.
export function fuenteDe(toma, p, pref = {}) {
  const f = toma.fuente || p.fuente || pref.fuente;
  if (f === "ia" && proveedor() !== "prueba") return "ia";
  if ((f === "foto" || f === "clip") && bancoDeStock()) return f;
  if (!f || f === "auto") return proveedor() !== "prueba" ? "ia" : bancoDeStock() ? "foto" : "prueba";
  // la que pidió no tiene clave: la que se pueda
  return proveedor() !== "prueba" ? "ia" : bancoDeStock() ? "foto" : "prueba";
}

// ---------------------------------------------------------------- bancos de stock
// Lo que se busca: «buscar» de la toma (pocas palabras en inglés) o, si no, el principio de su prompt.
const busqueda = (toma) => (toma.buscar || String(toma.imagen).split(/[,.]/)[0]).trim().split(/\s+/).slice(0, 6).join(" ");
async function descargar(url) { const r = await fetch(url); if (!r.ok) throw new Error(`No pude descargar ${url} (${r.status})`); return Buffer.from(await r.arrayBuffer()); }

async function pexels(tipo, q, i) {
  const url = tipo === "clip"
    ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&orientation=portrait&per_page=15`
    : `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=portrait&per_page=15`;
  const r = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
  if (!r.ok) throw new Error(`Pexels dijo ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json(), lista = tipo === "clip" ? j.videos : j.photos;
  if (!lista?.length) return null;
  const x = lista[i % lista.length];
  if (tipo === "clip") {
    const archivos = x.video_files.filter((v) => v.file_type === "video/mp4" && v.height >= v.width).sort((a, b) => Math.abs(a.height - 1920) - Math.abs(b.height - 1920));
    const v = archivos[0] || x.video_files[0];
    return { datos: await descargar(v.link), ext: "mp4", credito: { banco: "Pexels", autor: x.user?.name, enlace: x.url } };
  }
  return { datos: await descargar(`${x.src.original}?auto=compress&cs=tinysrgb&fit=crop&w=1080&h=1920`), ext: "jpg", credito: { banco: "Pexels", autor: x.photographer, enlace: x.url } };
}

async function pixabay(tipo, q, i) {
  const base = tipo === "clip" ? "https://pixabay.com/api/videos/" : "https://pixabay.com/api/";
  const r = await fetch(`${base}?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&per_page=20&safesearch=true${tipo === "clip" ? "" : "&image_type=photo&orientation=vertical"}`);
  if (!r.ok) throw new Error(`Pixabay dijo ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const hits = (await r.json()).hits;
  if (!hits?.length) return null;
  const x = hits[i % hits.length];
  if (tipo === "clip") { const v = x.videos.large?.url ? x.videos.large : x.videos.medium; return { datos: await descargar(v.url), ext: "mp4", credito: { banco: "Pixabay", autor: x.user, enlace: x.pageURL } }; }
  return { datos: await descargar(x.largeImageURL), ext: "jpg", credito: { banco: "Pixabay", autor: x.user, enlace: x.pageURL } };
}

async function deStock(tipo, toma) {
  const q = busqueda(toma), i = toma.elegida || 0;
  const banco = bancoDeStock();
  let res = banco === "pexels" ? await pexels(tipo, q, i) : await pixabay(tipo, q, i);
  // si no hay resultados en un banco, el otro; si no hay clips, una foto
  if (!res && banco === "pexels" && hayClave("PIXABAY_API_KEY")) res = await pixabay(tipo, q, i);
  if (!res && tipo === "clip") return deStock("foto", toma);
  if (!res) throw new Error(`No encontré nada para «${q}» (toma «${toma.imagen.slice(0, 40)}…»): cambia su «buscar» por palabras más generales en inglés.`);
  return res;
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

// Consigue lo que falte de cada toma. Devuelve la lista de archivos por toma (.jpg o .mp4).
export async function hacerImagenes(dir, { calidad } = {}) {
  const p = leerJSON(join(dir, "proyecto.json")), di = asegurar(join(dir, "imagenes"));
  const pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  const tomas = p.escenas.flatMap((e) => e.tomas);
  const prov = proveedor(), cal = calidad || p.calidad || "normal";
  const fuentes = tomas.map((t) => (t.dibujo ? "2d" : fuenteDe(t, p, pref)));
  if (fuentes.includes("prueba")) console.log("⚠ Sin claves de imágenes (fal.ai, OpenAI, Pexels o Pixabay): imágenes de prueba (no se paga nada).");
  const base = parseInt(createHash("sha1").update(p.titulo || "bv").digest("hex").slice(0, 6), 16);
  const fCred = join(di, "creditos.json"), creditos = existsSync(fCred) ? leerJSON(fCred) : {};
  const archivos = await enParalelo(tomas, 3, async (toma, i) => {
    const n = i + 1, nn = String(n).padStart(2, "0"), fuente = fuentes[i];
    if (toma.dibujo) return null;                                    // una toma 2D: se dibuja, no se busca
    if (toma.archivo) return join(dir, toma.archivo);                // una foto o video propio del creador
    const prompt = promptDe(p, toma), semilla = toma.semilla ?? base + n;
    const clave = fuente === "ia" ? [prompt, semilla, prov, cal] : fuente === "prueba" ? ["prueba", toma.imagen] : [fuente, busqueda(toma), toma.elegida || 0, bancoDeStock()];
    const h = createHash("sha1").update(JSON.stringify(clave)).digest("hex").slice(0, 8);
    const hecho = readdirSync(di).find((x) => x.startsWith(`toma-${nn}-${h}.`));
    if (hecho) return join(di, hecho);
    // las versiones anteriores de esta toma se borran
    for (const viejo of readdirSync(di)) if (viejo.startsWith(`toma-${nn}-`)) unlinkSync(join(di, viejo));
    let f = join(di, `toma-${nn}-${h}.jpg`);
    if (fuente === "prueba") await deMuestra(f, n, toma);
    else if (fuente === "ia") writeFileSync(f, prov === "fal" ? await conFal(prompt, semilla, cal) : await conOpenAI(prompt, semilla, cal));
    else {
      const r = await deStock(fuente, toma);
      f = join(di, `toma-${nn}-${h}.${r.ext}`);
      writeFileSync(f, r.datos);
      creditos[n] = r.credito;
    }
    if (fuente === "ia" || fuente === "prueba") delete creditos[n];
    console.log(`toma ${n}/${tomas.length} ✓ [${fuente}] ${(fuente === "foto" || fuente === "clip" ? busqueda(toma) : toma.imagen).slice(0, 60)}`);
    return f;
  });
  writeFileSync(fCred, JSON.stringify(creditos, null, 2) + "\n");
  return archivos;
}

// Los créditos de las fotos y clips de stock (no son obligatorios en Pexels ni Pixabay, pero es buena práctica).
export function textoCreditos(dir) {
  const f = join(dir, "imagenes", "creditos.json");
  if (!existsSync(f)) return "";
  const c = Object.entries(leerJSON(f));
  return c.length ? c.map(([n, x]) => `- Toma ${n}: ${x.autor || "autor"} en ${x.banco} (${x.enlace})`).join("\n") : "";
}
