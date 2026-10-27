// Subtítulos y rótulos en formato ASS (los dibuja ffmpeg con libass).
// - Subtítulos: grupos de 2-4 palabras en el tercio de arriba; cada palabra se enciende al decirse (amarilla y con un
//   pequeño rebote), las que faltan quedan invisibles pero guardan su sitio, y la palabra clave de la frase queda
//   amarilla. Así el texto nunca salta.
// - Rótulos: el texto grande de cada toma (rotulo), abajo, en una banda oscura, con *palabras* en amarillo.
import { writeFileSync } from "node:fs";
import { ALTO, ANCHO, sinTildes } from "./comun.mjs";

const hexASS = (hex, alfa = 0) => { const h = hex.replace("#", ""); return `&H${alfa.toString(16).padStart(2, "0").toUpperCase()}${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}`.toUpperCase(); };
const tiempo = (t) => { t = Math.max(0, t); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return `${h}:${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`; };
const limpio = (s) => String(s).replace(/[{}\\]/g, "");

// Parte las palabras de una frase en grupos cortos, cortando mejor tras una coma o un punto.
function grupos(palabras, max = 4, maxLetras = 20) {
  const gs = []; let g = [];
  for (const w of palabras) {
    const largo = g.map((x) => x.texto).join(" ").length + w.texto.length;
    if (g.length && (g.length >= max || largo > maxLetras)) { gs.push(g); g = []; }
    g.push(w);
    if (/[,.;:?!]$/.test(w.texto) && g.length >= 2) { gs.push(g); g = []; }
  }
  if (g.length) gs.push(g);
  return gs;
}

export function escribirASS(archivo, tiempos, tomas, { acento = "#FFD23F", subtitulos = true } = {}) {
  const AMA = hexASS(acento), BLA = "&H00FFFFFF";
  const cab = `[Script Info]
ScriptType: v4.00+
PlayResX: ${ANCHO}
PlayResY: ${ALTO}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Poppins ExtraBold,82,${BLA},${BLA},&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,3,8,90,90,560,1
Style: Rotulo,Poppins ExtraBold,62,${BLA},${BLA},&H28100A06,&H28100A06,0,0,0,0,100,100,0,0,3,22,0,2,80,80,520,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const ev = [];
  if (subtitulos) for (const f of tiempos.frases) {
    const clave = sinTildes(f.clave);
    for (const g of grupos(f.palabras)) {
      const finGrupo = g.at(-1).fin + 0.25;
      g.forEach((w, i) => {
        const t0 = w.inicio - 0.05, t1 = i < g.length - 1 ? g[i + 1].inicio - 0.05 : Math.min(finGrupo, nextStart(tiempos, w));
        if (t1 <= t0) return;
        const txt = g.map((x, j) => {
          const esClave = clave && sinTildes(x.texto) === clave;
          if (j > i) return `{\\alpha&HFF&}${limpio(x.texto)}{\\alpha&H00&}`;
          if (j === i) return `{\\c${AMA}\\fscx118\\fscy118\\t(0,90,\\fscx100\\fscy100)}${limpio(x.texto)}{\\c${esClave ? AMA : BLA}\\fscx100\\fscy100}`;
          return esClave ? `{\\c${AMA}}${limpio(x.texto)}{\\c${BLA}}` : limpio(x.texto);
        }).join(" ");
        ev.push(`Dialogue: 1,${tiempo(t0)},${tiempo(t1)},Sub,,0,0,0,,${txt}`);
      });
    }
  }
  // los rótulos: *palabra* en amarillo; entran con un fundido corto
  for (const t of tomas) if (t.rotulo) {
    const txt = limpio(t.rotulo).replace(/\*([^*]+)\*/g, `{\\c${AMA}}$1{\\c${BLA}}`).replace(/\|/g, "\\N");
    ev.push(`Dialogue: 0,${tiempo(t.inicio + 0.15)},${tiempo(t.fin - 0.05)},Rotulo,,0,0,0,,{\\fad(180,120)}${txt}`);
  }
  writeFileSync(archivo, cab + ev.join("\n") + "\n");
}

// Cuándo empieza la palabra siguiente a w en toda la voz (para que un grupo no se quede encima del siguiente).
function nextStart(tiempos, w) {
  let ver = false;
  for (const f of tiempos.frases) for (const x of f.palabras) { if (ver) return x.inicio - 0.05; if (x === w) ver = true; }
  return w.fin + 0.4;
}
