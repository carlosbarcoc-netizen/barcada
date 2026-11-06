// Barcada 2D · el dibujante: un navegador sin ventana que convierte cuadros SVG en imágenes, y de ahí a video.
// Cada cuadro se arma en Node (escena → SVG) y el navegador solo lo pinta y lo fotografía.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALTO, ANCHO, FUENTES } from "../comun.mjs";
import { chromium as cargar } from "./navegador.mjs";
import { DEFS_COMUNES } from "./estilo.mjs";
import { VINETA } from "./escena.mjs";

// Un solo navegador para todo (se guarda la promesa: si dos tomas lo piden a la vez, no se abren dos).
let navegador = null;
export function abrirNavegador() {
  if (!navegador) navegador = cargar().then((c) => c.launch());
  return navegador;
}
export async function cerrarNavegador() { const n = navegador; navegador = null; if (n) await (await n).close(); }

// Una hoja en blanco lista para pintar cuadros. escala: 1 (1080 × 1920) o 0,5 (borradores).
export async function hoja(escala = 1) {
  const nav = await abrirNavegador();
  const pagina = await nav.newPage({ viewport: { width: Math.round(ANCHO * escala), height: Math.round(ALTO * escala) } });
  // las letras, incrustadas (una página en blanco no puede leer archivos del disco)
  const f = (nombre) => `data:font/ttf;base64,${readFileSync(join(FUENTES, `${nombre}.ttf`)).toString("base64")}`;
  await pagina.setContent(`<html><head><style>
    @font-face{font-family:Poppins;font-weight:800;src:url(${f("Poppins-ExtraBold")})}
    @font-face{font-family:Poppins;font-weight:700;src:url(${f("Poppins-Bold")})}
    @font-face{font-family:Nunito;font-weight:900;src:url(${f("Nunito-Black")})}
    @font-face{font-family:Nunito;font-weight:800;src:url(${f("Nunito-ExtraBold")})}
    @font-face{font-family:Anton;src:url(${f("Anton-Regular")})}
    @font-face{font-family:'Press Start 2P';src:url(${f("PressStart2P-Regular")})}
    @font-face{font-family:'Lilita One';src:url(${f("LilitaOne-Regular")})}
    @font-face{font-family:'Space Mono';font-weight:700;src:url(${f("SpaceMono-Bold")})}
    html,body{margin:0;background:#000;overflow:hidden} svg{display:block}</style></head>
    <body><div id="c"></div><span style="font:800 40px Poppins;position:absolute;opacity:0">Áa</span><span style="font:700 40px Poppins;position:absolute;opacity:0">Áa</span><span style="font:40px 'Press Start 2P';position:absolute;opacity:0">Áa</span><span style="font:40px 'Lilita One';position:absolute;opacity:0">Áa</span><span style="font:700 40px 'Space Mono';position:absolute;opacity:0">Áa</span></body></html>`);
  await pagina.evaluate(async () => { await document.fonts.load("800 40px Poppins"); await document.fonts.load("700 40px Poppins"); await document.fonts.load("900 40px Nunito"); await document.fonts.load("40px Anton"); await document.fonts.load("40px 'Press Start 2P'"); await document.fonts.load("40px 'Lilita One'"); await document.fonts.load("700 40px 'Space Mono'"); await document.fonts.ready; });
  return {
    async pinta(interior) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO * escala}" height="${ALTO * escala}" viewBox="0 0 ${ANCHO} ${ALTO}"><defs>${DEFS_COMUNES}${VINETA}</defs>${interior}</svg>`;
      await pagina.evaluate((s) => { document.getElementById("c").innerHTML = s; }, svg);
      return pagina.screenshot({ type: "jpeg", quality: 92 });
    },
    // Una capa fija (el fondo, el grano) pintada una sola vez, como imagen PNG en data URI: así no se recalcula en
    // cada cuadro, que es lo que más tarda.
    async capa(interior, transparente = false) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO * escala}" height="${ALTO * escala}" viewBox="0 0 ${ANCHO} ${ALTO}"><defs>${DEFS_COMUNES}${VINETA}</defs>${interior}</svg>`;
      await pagina.evaluate(([s, tr]) => { for (const el of [document.documentElement, document.body]) el.style.background = tr ? "transparent" : "#000"; document.getElementById("c").innerHTML = s; }, [svg, transparente]);
      const png = await pagina.screenshot({ type: "png", omitBackground: transparente });
      await pagina.evaluate(() => { for (const el of [document.documentElement, document.body]) el.style.background = "#000"; });
      return `data:image/png;base64,${png.toString("base64")}`;
    },
    cerrar: () => pagina.close(),
  };
}

// Un video a partir de una función cuadro(t) → SVG interior, de t0 a t1, a fps. Escribe salida (mp4, sin audio).
export async function grabar(cuadro, t0, t1, fps, salida, { escala = 1, crf = 18 } = {}) {
  const h = await hoja(escala), n = Math.max(1, Math.round((t1 - t0) * fps));
  if (cuadro.preparar) await cuadro.preparar(h);
  const ff = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-vf", `scale=${ANCHO}:${ALTO}:flags=lanczos,setsar=1`, "-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-pix_fmt", "yuv420p", salida]);
  let err = ""; ff.stderr.on("data", (d) => (err += d));
  const fin = new Promise((ok, mal) => ff.on("close", (c) => (c === 0 ? ok() : mal(new Error("ffmpeg 2D: " + err.slice(-1500))))));
  for (let i = 0; i < n; i++) {
    const buf = await h.pinta(cuadro(t0 + i / fps));
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await fin;
  await h.cerrar();
}

// Una sola imagen (para la hoja de tomas, la portada o el muestrario).
export async function foto(interior, salida, escala = 1) {
  const h = await hoja(escala);
  const { writeFileSync } = await import("node:fs");
  if (interior.preparar) { await interior.preparar(h); interior = interior.cuadro(); }
  writeFileSync(salida, await h.pinta(interior));
  await h.cerrar();
}
