// Lo demás: revisar la instalación, crear un proyecto, los efectos de sonido propios y la portada.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALTO, ANCHO, FUENTES, RAIZ, asegurar, ffmpeg, guardarJSON, hay, hayClave, leerJSON, sinTildes } from "./comun.mjs";
import { ESTILOS, hacerImagenes, proveedor } from "./imagenes.mjs";
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
  fila(prov !== "prueba" || null, "imágenes IA", prov === "fal" ? "fal.ai (FLUX)" : prov === "openai" ? "OpenAI (gpt-image-1)" : "sin clave (opcional: solo para el estilo realista)");
  fila(existsSync(join(RAIZ, "node_modules", "playwright")) || (await (async () => { try { await (await import("./2d/navegador.mjs")).chromium(); return true; } catch { return false; } })()) || null, "dibujante 2D", "para el estilo 2D: npm install y npx playwright install chromium");
  fila(existsSync(join(RAIZ, "sonidos", "transicion.mp3")) || null, "efectos", existsSync(join(RAIZ, "sonidos", "transicion.mp3")) ? "biblioteca lista" : "aún no: node barcada.mjs sonidos (los crea con ElevenLabs, una vez)");
  fila(existsSync(join(RAIZ, "preferencias.json")) || null, "preferencias", existsSync(join(RAIZ, "preferencias.json")) ? "guardadas" : "aún no: se preguntan al configurar");
  console.log(filas.join("\n"));
}

// ---------------------------------------------------------------- nuevo proyecto
export function nuevo(idea, { estilo = "documental", nombre, piel = null } = {}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const slug = nombre || sinTildes(idea.split(/\s+/).slice(0, 5).join("-").replace(/\s+/g, "-")).slice(0, 40) || "video";
  const dir = join(RAIZ, "proyectos", `${hoy}-${slug}`);
  if (existsSync(join(dir, "proyecto.json"))) throw new Error(`Ya existe ${dir}`);
  asegurar(dir);
  // modo juego (Barcada 2.0): una piel (neon, voxel, arcade) con su barra de progreso, títulos y mundo
  if (piel && !["neon", "voxel", "arcade"].includes(piel)) throw new Error(`No hay piel «${piel}». Hay: neon, voxel, arcade`);
  guardarJSON(join(dir, "proyecto.json"), piel ? {
    titulo: idea, estilo: "2d",
    frases: [{ texto: "", clave: "" }],
    juego: { piel, progreso: { titulo: "", etiqueta: "", pasos: [{ texto: "", en: "" }] }, ...(piel === "arcade" ? { tiempo: true } : {}) },
    escenas: [{ nombre: "partida", tomas: [{ desde: 0, titulo: "", dibujo: { elementos: [] } }] }],
  } : {
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
export async function portada(dir, titulo, { toma = 1, acento, etiqueta } = {}) {
  const p = leerJSON(join(dir, "proyecto.json")), pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  const imgs = await hacerImagenes(dir);
  // una toma 2D: su cuadro, casi al final de la toma (con todo ya en escena)
  if (!imgs[toma - 1]) {
    const tiempos = leerJSON(join(dir, "voz", "tiempos.json")), t = lineaDeTiempo(p, tiempos)[toma - 1];
    const { crearCuadro } = await import("./2d/escena.mjs"), { foto, cerrarNavegador } = await import("./2d/dibujante.mjs"), { cuando, contextoJuego } = await import("./montaje.mjs");
    imgs[toma - 1] = join(asegurar(join(dir, ".montaje")), "portada-cuadro.jpg");
    const juego = await contextoJuego(p, tiempos, lineaDeTiempo(p, tiempos));
    if (juego) { juego.subtitulos = false; juego.titulos = juego.titulos.map(() => null); }   // la portada lleva su propio título
    const cu = crearCuadro(t.dibujo, t, (ref) => cuando(tiempos, ref), juego);
    await foto({ preparar: cu.preparar, cuadro: () => cu(t.fin - 0.25) }, imgs[toma - 1]);
    await cerrarNavegador();
  }
  // la imagen de fondo, a 1080 × 1920, con más color
  const tmp = asegurar(join(dir, ".montaje")), fondoJpg = join(tmp, "portada-fondo.jpg");
  const est = ESTILOS[p.estilo] || ESTILOS.documental;
  await ffmpeg([...(/\.(mp4|mov|webm)$/i.test(imgs[toma - 1]) ? ["-ss", "1"] : []), "-i", imgs[toma - 1], "-vf",
    `scale=${ANCHO}:${ALTO}:force_original_aspect_ratio=increase,crop=${ANCHO}:${ALTO},${est.color === "null" ? "null" : est.color},eq=saturation=1.3:contrast=1.08`, "-frames:v", "1", "-q:v", "2", fondoJpg]);
  const out = join(asegurar(join(dir, "entrega")), "portada.jpg");
  const { foto, cerrarNavegador } = await import("./2d/dibujante.mjs");
  await foto(svgPortada(titulo, `data:image/jpeg;base64,${readFileSync(fondoJpg).toString("base64")}`, { acento: acento || pref.acento, etiqueta }), out);
  await cerrarNavegador();
  console.log(`✓ ${out}`);
  return out;
}

// La portada de Barcada: el título CENTRADO (en horizontal y en el centro de la imagen, dentro del recorte 3:4 del
// perfil), en Anton enorme, con colores vivos. La línea con *clave* va más grande, en un degradado amarillo→naranja,
// sobre una franja de color intenso un poco girada; las demás, blancas con contorno grueso. Cada línea se ajusta a lo
// ancho para que nada se corte. etiqueta: un sello pequeño debajo («¡NADIE TE LO DIJO!»).
const ESC = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function svgPortada(titulo, fondo, { acento = "#FFD23F", franja = "#FF2E63", etiqueta = null } = {}) {
  const lineas = titulo.split("|").map((l) => l.trim()).filter(Boolean);
  const ancho = 940, info = lineas.map((l) => {
    const clave = /\*[^*]+\*/.test(l), limpio = l.replace(/\*/g, "").toUpperCase();
    const base = clave ? 210 : 128, tam = Math.min(base, ancho / Math.max(1, limpio.length * 0.5));
    return { l, clave, limpio, tam };
  });
  const alto = info.reduce((a, x) => a + x.tam * 1.08, 0) + (etiqueta ? 190 : 0);
  let y = 900 - alto / 2;                                   // el bloque, centrado en el medio de la imagen
  const filas = info.map((x) => {
    y += x.tam * 0.98;
    const sw = (x.tam * 0.085).toFixed(1);
    const partes = x.l.split(/(\*[^*]+\*)/).filter(Boolean).map((seg) => {
      const k = seg.startsWith("*");
      return `<tspan ${k ? 'fill="url(#vivo)"' : 'fill="#ffffff"'}>${ESC(seg.replace(/\*/g, "").toUpperCase())}</tspan>`;
    }).join("");
    const w = Math.min(ancho, x.limpio.length * x.tam * 0.5) + 70;
    const fila = `${x.clave ? `<rect x="${540 - w / 2}" y="${y - x.tam * 0.88}" width="${w}" height="${x.tam * 1.06}" rx="${x.tam * 0.16}" fill="${franja}" stroke="#160b06" stroke-width="10" transform="rotate(-3 540 ${y - x.tam * 0.35})" style="filter:drop-shadow(0 14px 0 #160b06)"/>` : ""}
      <text x="540" y="${y}" text-anchor="middle" font-family="Anton" font-size="${x.tam.toFixed(0)}" stroke="#160b06" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round" letter-spacing="2"
        ${x.limpio.length * x.tam * 0.5 > ancho ? `textLength="${ancho}" lengthAdjust="spacingAndGlyphs"` : ""} style="filter:drop-shadow(0 10px 0 #160b06)" ${x.clave ? `transform="rotate(-3 540 ${y - x.tam * 0.35})"` : ""}>${partes}</text>`;
    y += x.tam * 0.1;
    return fila;
  }).join("");
  const we = Math.min(900, etiqueta ? etiqueta.length * 31 + 90 : 0);
  const sello = etiqueta ? `<g transform="translate(540 ${y + 140}) rotate(3)"><rect x="${-we / 2}" y="-48" width="${we}" height="96" rx="48" fill="${acento}" stroke="#160b06" stroke-width="8" style="filter:drop-shadow(0 8px 0 #160b06)"/>
    <text y="20" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="54" fill="#160b06">${ESC(etiqueta.toUpperCase())}</text></g>` : "";
  return `<defs><linearGradient id="vivo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF36B"/><stop offset="0.55" stop-color="${acento}"/><stop offset="1" stop-color="#FF8A00"/></linearGradient>
      <radialGradient id="foco" cx="0.5" cy="0.47" r="0.6"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.7" stop-color="#000" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
      <radialGradient id="halo" cx="0.5" cy="0.47" r="0.45"><stop offset="0" stop-color="${franja}" stop-opacity="0.45"/><stop offset="1" stop-color="${franja}" stop-opacity="0"/></radialGradient></defs>
    <image href="${fondo}" x="-40" y="-40" width="1160" height="2000" preserveAspectRatio="xMidYMid slice" style="filter:blur(5px) saturate(1.2)"/>
    <rect width="1080" height="1920" fill="url(#foco)"/><rect width="1080" height="1920" fill="url(#halo)"/>
    ${filas}${sello}`;
}

export { lineaDeTiempo };
