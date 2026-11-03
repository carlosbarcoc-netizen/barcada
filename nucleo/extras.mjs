// Lo demás: revisar la instalación, crear un proyecto, los efectos de sonido propios y la portada.
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALTO, ANCHO, FUENTES, RAIZ, asegurar, ffmpeg, guardarJSON, hay, hayClave, leerJSON, sinTildes } from "./comun.mjs";
import { ESTILOS, bancoDeStock, hacerImagenes, proveedor, textoCreditos } from "./imagenes.mjs";
import { lineaDeTiempo } from "./montaje.mjs";

// ---------------------------------------------------------------- revisar
export async function revisar() {
  const filas = [];
  const fila = (ok, que, nota) => filas.push(`${ok === true ? "✓" : ok === false ? "✗" : "·"} ${que.padEnd(16)} ${nota}`);
  const [maj, min] = process.versions.node.split(".").map(Number);
  fila(maj > 18 || (maj === 18 && min >= 17), "node", process.versions.node + (maj < 18 ? " (hace falta 18 o más)" : ""));
  fila(hay("ffmpeg"), "ffmpeg", hay("ffmpeg") ? "instalado" : "falta: instálalo (Mac: brew install ffmpeg · Windows: winget install Gyan.FFmpeg)");
  fila(existsSync(join(FUENTES, "Poppins-ExtraBold.ttf")), "letras", "Poppins");
  fila(existsSync(join(RAIZ, "claves.env")), "claves.env", existsSync(join(RAIZ, "claves.env")) ? "existe" : "falta: copia claves.env.ejemplo como claves.env y pega tus claves");
  fila(hayClave("ELEVENLABS_API_KEY") || null, "voz", hayClave("ELEVENLABS_API_KEY") ? "clave de ElevenLabs puesta" : "sin clave: la voz sale en modo prueba (silencio)");
  const prov = proveedor();
  fila(prov !== "prueba" || null, "imágenes IA", prov === "fal" ? "fal.ai (FLUX)" : prov === "openai" ? "OpenAI (gpt-image-1)" : "sin clave (opcional si usas stock)");
  const banco = bancoDeStock();
  fila(banco ? true : null, "stock gratis", banco === "pexels" ? "Pexels" + (hayClave("PIXABAY_API_KEY") ? " + Pixabay" : "") : banco === "pixabay" ? "Pixabay" : "sin clave (opcional: Pexels o Pixabay, gratis)");
  if (prov === "prueba" && !banco) fila(false, "", "hace falta al menos una: fal.ai, OpenAI, Pexels o Pixabay");
  fila(existsSync(join(RAIZ, "node_modules", "playwright")) || (await (async () => { try { await (await import("./2d/navegador.mjs")).chromium(); return true; } catch { return false; } })()) || null, "dibujante 2D", "para el estilo 2D: npm install y npx playwright install chromium");
  fila(existsSync(join(RAIZ, "sonidos", "transicion.mp3")) || null, "efectos", existsSync(join(RAIZ, "sonidos", "transicion.mp3")) ? "biblioteca lista" : "aún no: node bv.mjs sonidos (los crea con ElevenLabs, una vez)");
  fila(existsSync(join(RAIZ, "preferencias.json")) || null, "preferencias", existsSync(join(RAIZ, "preferencias.json")) ? "guardadas" : "aún no: se preguntan al configurar");
  console.log(filas.join("\n"));
}

// ---------------------------------------------------------------- nuevo proyecto
export function nuevo(idea, { estilo = "documental", nombre } = {}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const slug = nombre || sinTildes(idea.split(/\s+/).slice(0, 5).join("-").replace(/\s+/g, "-")).slice(0, 40) || "video";
  const dir = join(RAIZ, "proyectos", `${hoy}-${slug}`);
  if (existsSync(join(dir, "proyecto.json"))) throw new Error(`Ya existe ${dir}`);
  asegurar(dir);
  guardarJSON(join(dir, "proyecto.json"), {
    titulo: idea, estilo, calidad: "normal",
    sujeto: "",
    frases: [{ texto: "", clave: "" }],
    escenas: [{ nombre: "gancho", tomas: [{ desde: 0, imagen: "", movimiento: "acercar", rotulo: "" }] }],
  });
  writeFileSync(join(dir, "SEGUIR.md"), `# ${idea}\n\nEstado del proyecto (se actualiza en cada paso).\n\n- [ ] 1. Investigación → notas.md\n- [ ] 2. Guion aprobado\n- [ ] 3. Voz\n- [ ] 4. Tomas aprobadas (revisar/tomas.jpg)\n- [ ] 5. Borrador aprobado\n- [ ] 6. Final, portada y descripciones entregados\n\nPara seguir en otra conversación: «sigue el proyecto ${hoy}-${slug}».\n`);
  writeFileSync(join(dir, "notas.md"), `# ${idea}\n\n## Datos (cada uno con su fuente)\n\n- \n`);
  console.log(dir);
  return dir;
}

// ---------------------------------------------------------------- efectos de sonido propios
// Se generan con ElevenLabs en la cuenta del usuario (son suyos) y se guardan en sonidos/. Se hace una vez.
export const BIBLIOTECA = {
  transicion: "fast cinematic whoosh transition, airy swish, short",
  pop: "soft UI pop, clean subtle click for text appearing",
  impacto: "deep cinematic impact boom, short punchy hit",
  subida: "short cinematic riser swell, tension building, 1 second",
  burbujas: "liquid bubbles popping softly, close up",
  vertido: "thick liquid pouring, glossy chocolate pour, close up",
  crujido: "crisp snap of a chocolate bar breaking",
  polvo: "soft powder puff, dust burst",
  maquina: "industrial grinder machine running, short loop",
  campana: "bright notification chime, positive",
};
export async function crearSonidos({ rehacer = false } = {}) {
  if (!hayClave("ELEVENLABS_API_KEY")) throw new Error("Falta ELEVENLABS_API_KEY en claves.env.");
  const d = asegurar(join(RAIZ, "sonidos"));
  for (const [nombre, prompt] of Object.entries(BIBLIOTECA)) {
    const f = join(d, `${nombre}.mp3`);
    if (existsSync(f) && !rehacer) continue;
    const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ text: prompt, duration_seconds: nombre === "maquina" ? 2.5 : nombre === "subida" ? 1.5 : 1, prompt_influence: 0.5 }),
    });
    if (!r.ok) throw new Error(`ElevenLabs dijo ${r.status}: ${(await r.text()).slice(0, 300)}`);
    writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    console.log(`✓ sonidos/${nombre}.mp3`);
  }
}

// ---------------------------------------------------------------- portada
// Una imagen de una toma, con el título enorme arriba: *palabra* en el color de acento, sobre un degradado oscuro.
export async function portada(dir, titulo, { toma = 1, acento } = {}) {
  const p = leerJSON(join(dir, "proyecto.json")), pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  const imgs = await hacerImagenes(dir);
  // una toma 2D: su cuadro, casi al final de la toma (con todo ya en escena)
  if (!imgs[toma - 1]) {
    const tiempos = leerJSON(join(dir, "voz", "tiempos.json")), t = lineaDeTiempo(p, tiempos)[toma - 1];
    const { crearCuadro } = await import("./2d/escena.mjs"), { foto, cerrarNavegador } = await import("./2d/dibujante.mjs"), { cuando } = await import("./montaje.mjs");
    imgs[toma - 1] = join(asegurar(join(dir, ".montaje")), "portada-cuadro.jpg");
    await foto(crearCuadro(t.dibujo, t, (ref) => cuando(tiempos, ref))(t.fin - 0.25), imgs[toma - 1]);
    await cerrarNavegador();
  }
  const ac = (acento || pref.acento || "#FFD23F").replace("#", ""), BGR = `&H00${ac.slice(4, 6)}${ac.slice(2, 4)}${ac.slice(0, 2)}`.toUpperCase();
  const lineas = titulo.split("|").map((l) => l.trim().replace(/\*([^*]+)\*/g, `{\\c${BGR}\\fs170}$1{\\c&H00FFFFFF&\\fs104}`));
  const ass = join(asegurar(join(dir, ".montaje")), "portada.ass");
  writeFileSync(ass, `[Script Info]\nScriptType: v4.00+\nPlayResX: ${ANCHO}\nPlayResY: ${ALTO}\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: T,Poppins ExtraBold,104,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,8,6,8,70,70,300,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:05.00,T,,0,0,0,,${lineas.join("\\N")}\n`);
  const out = join(asegurar(join(dir, "entrega")), "portada.jpg");
  const est = ESTILOS[p.estilo] || ESTILOS.documental;
  await ffmpeg([...(/\.(mp4|mov|webm)$/i.test(imgs[toma - 1]) ? ["-ss", "1"] : []), "-i", imgs[toma - 1], "-vf",
    `scale=${ANCHO}:${ALTO}:force_original_aspect_ratio=increase,crop=${ANCHO}:${ALTO},${est.color},drawbox=y=0:w=iw:h=900:color=black@0.35:t=fill,vignette=PI/4,subtitles=filename='${ass}':fontsdir='${FUENTES}'`,
    "-frames:v", "1", "-q:v", "2", out]);
  console.log(`✓ ${out}`);
  return out;
}

// Los créditos del stock, junto a la entrega.
export function escribirCreditos(dir) {
  const t = textoCreditos(dir);
  if (!t) return null;
  const f = join(asegurar(join(dir, "entrega")), "creditos.md");
  writeFileSync(f, `# Créditos de imágenes y clips\n\nFotos y videos de bancos con licencia gratuita de uso comercial. Mencionar a los autores no es obligatorio, pero se agradece (puedes pegarlo en la descripción).\n\n${t}\n`);
  return f;
}

export { lineaDeTiempo };
