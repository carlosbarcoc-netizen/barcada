// Barco Viral 2D · la escena: convierte la descripción de una toma 2D (proyecto.json → toma.dibujo) en una función
// cuadro(t) → SVG, con las piezas entrando, moviéndose y cambiando al ritmo de la voz.
//
//   "dibujo": {
//     "fondo": "estudio",                       // estudio, cielo, naturaleza, noche, espacio, cocina, oficina, oscuro, liso
//     "camara": [[0, { "zoom": 1 }], ["3:prensa", { "zoom": 1.25, "x": 540, "y": 900 }]],
//     "elementos": [
//       { "pieza": "mazorca", "x": 540, "y": 1000, "escala": 1.3,
//         "entra": "rebote", "en": 0.1,          // aparece | rebote | cae | sube | izquierda | derecha | crece | gira
//         "accion": "flota",                      // flota | late | gira | tiembla | balancea
//         "params": { "abre": [["2:comienza", 0], ["2:grano", 1]] },   // un valor fijo o claves [cuándo, valor]
//         "mueve": [["2:grano", { "x": 300, "escala": 0.8 }]],
//         "sale": "aparece", "hasta": "2:tuesta" }
//     ]
//   }
// «cuándo»: segundos desde que empieza la toma (0.5) o una palabra de la voz ("frase:palabra", "palabra").
import { PIEZAS } from "./piezas.mjs";
import { fondo as pintarFondo, FONDOS } from "./fondos.mjs";
import { TINTA } from "./estilo.mjs";

const lim = (u) => Math.max(0, Math.min(1, u));
const suave = (u) => { u = lim(u); return u * u * (3 - 2 * u); };
const salir = (u) => 1 - Math.pow(1 - lim(u), 3);
const rebote = (u) => { u = lim(u); const c = 1.70158 * 1.4, c3 = c + 1; return 1 + c3 * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const botar = (u) => { u = lim(u); const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + 0.75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + 0.9375; return n * (u -= 2.625 / d) * u + 0.984375; };
const mez = (a, b, u) => a + (b - a) * u;

// Claves [[t, valor], …] (ya en segundos): interpola con curva suave; números u objetos de números.
function claves(lista, t) {
  if (!Array.isArray(lista)) return lista;
  if (!lista.length) return undefined;
  if (t <= lista[0][0]) return lista[0][1];
  for (let i = 0; i < lista.length - 1; i++) {
    const [ta, a] = lista[i], [tb, b] = lista[i + 1];
    if (t <= tb) {
      const u = suave((t - ta) / Math.max(0.001, tb - ta));
      if (typeof a === "number") return mez(a, b, u);
      if (typeof a === "object") { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = typeof a[k] === "number" && typeof b[k] === "number" ? mez(a[k], b[k], u) : (u < 0.5 ? a[k] : b[k]) ?? a[k] ?? b[k]; return o; }
      return u < 0.5 ? a : b;
    }
  }
  return lista.at(-1)[1];
}

// Cómo entra o sale una pieza: devuelve { dx, dy, s, r, op } para u de 0 (fuera) a 1 (en su sitio).
function transicion(tipo, u) {
  switch (tipo) {
    case "rebote": return { s: rebote(u), op: lim(u * 4) };
    case "cae": return { dy: -900 * (1 - botar(u)), op: lim(u * 5) };
    case "sube": return { dy: 700 * (1 - salir(u)), op: lim(u * 3) };
    case "izquierda": return { dx: -900 * (1 - salir(u)), op: lim(u * 3) };
    case "derecha": return { dx: 900 * (1 - salir(u)), op: lim(u * 3) };
    case "crece": return { s: suave(u) };
    case "gira": return { s: salir(u), r: -200 * (1 - salir(u)), op: lim(u * 3) };
    case "ninguna": return {};
    default: return { s: mez(0.85, 1, salir(u)), op: salir(u) }; // aparece
  }
}

// La toma, ya con los tiempos de la voz: cuadro(t) → SVG (t, segundos del video).
export function crearCuadro(dibujo, toma, aSegundos) {
  const T = (ref) => (typeof ref === "number" ? toma.inicio + ref : aSegundos(ref));
  const conT = (l) => (Array.isArray(l) ? l.map(([a, v]) => [T(a), v]) : l);
  const cam = conT(dibujo.camara || [[0, { zoom: 1, x: 540, y: 960 }]]);
  const elementos = (dibujo.elementos || []).map((e, i) => {
    const params = {};
    for (const [k, v] of Object.entries(e.params || {})) params[k] = Array.isArray(v) && Array.isArray(v[0]) ? conT(v) : v;
    return {
      ...e, i, params,
      t0: T(e.en ?? 0), dura: e.dura ?? (e.entra === "cae" ? 0.8 : 0.45),
      t1: e.hasta !== undefined ? T(e.hasta) : Infinity, duraSale: e.duraSale ?? 0.35,
      mueve: e.mueve ? [[T(e.en ?? 0), { x: e.x ?? 540, y: e.y ?? 960, escala: e.escala ?? 1, rot: e.rot ?? 0 }], ...conT(e.mueve)] : null,
    };
  });
  if (!FONDOS[dibujo.fondo || "estudio"]) throw new Error(`No hay fondo «${dibujo.fondo}». Hay: ${Object.keys(FONDOS).join(", ")}`);
  for (const e of elementos) if (!PIEZAS[e.pieza]) throw new Error(`No hay pieza «${e.pieza}». Hay: ${Object.keys(PIEZAS).join(", ")}`);

  let fondoImg = null, granoImg = null;
  const cuadro = (t) => {
    const c = { zoom: 1, x: 540, y: 960, ...claves(cam, t) };
    // la cámara nunca enseña lo que hay fuera del fondo: zoom ≥ 1 y el centro dentro de lo que cabe
    c.zoom = Math.max(1, c.zoom);
    const mx = 540 / c.zoom, my = 960 / c.zoom;
    c.x = Math.min(1080 - mx, Math.max(mx, c.x)); c.y = Math.min(1920 - my, Math.max(my, c.y));
    const capas = elementos.slice().sort((a, b) => (a.capa ?? 0) - (b.capa ?? 0)).map((e) => {
      if (t < e.t0 - 0.001) return "";
      const uIn = e.entra === "ninguna" ? 1 : (t - e.t0) / e.dura, uOut = t > e.t1 ? 1 - (t - e.t1) / e.duraSale : 1;
      if (uOut <= 0) return "";
      const a = transicion(e.entra, uIn), b = uOut < 1 ? transicion(e.sale || "aparece", uOut) : {};
      const pos = e.mueve ? claves(e.mueve, t) : { x: e.x ?? 540, y: e.y ?? 960, escala: e.escala ?? 1, rot: e.rot ?? 0 };
      let { x, y, escala: s, rot: r } = pos;
      // la acción continua, desde que ha entrado
      const ta = t - e.t0, fase = e.i * 1.7;
      if (e.accion === "flota") y += 14 * Math.sin(ta * 2.2 + fase);
      if (e.accion === "late") s *= 1 + 0.06 * Math.max(0, Math.sin(ta * 6 + fase));
      if (e.accion === "gira") r += ta * (e.velocidad ?? 45);
      if (e.accion === "tiembla") x += 6 * Math.sin(ta * 45 + fase);
      if (e.accion === "balancea") r += 7 * Math.sin(ta * 2.6 + fase);
      x += (a.dx || 0) + (b.dx || 0); y += (a.dy || 0) + (b.dy || 0);
      s *= (a.s ?? 1) * (b.s ?? 1); r += (a.r || 0) + (b.r || 0);
      const op = (a.op ?? 1) * (b.op ?? 1) * (e.opacidad ?? 1);
      if (op <= 0.003 || s <= 0.003) return "";
      const p = { t, color: e.color };
      for (const [k, v] of Object.entries(e.params)) p[k] = claves(v, t);
      for (const k of ["texto", "tipo", "pose", "gesto", "pantalla", "signo", "tinta", "tamano", "largo", "valores", "liquido", "contenido", "maceta", "pelo", "anillo", "tierra"]) if (e[k] !== undefined && p[k] === undefined) p[k] = e[k];
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})" opacity="${op.toFixed(3)}">${PIEZAS[e.pieza](p)}</g>`;
    }).join("");
    const fondoSVG = fondoImg ? `<image href="${fondoImg}" width="1080" height="1920" preserveAspectRatio="none"/>` : pintarFondo(dibujo.fondo, { t, ...(dibujo.fondoOpts || {}) });
    const acabado = granoImg ? `<image href="${granoImg}" width="1080" height="1920" style="mix-blend-mode:multiply"/>` : `<rect width="1080" height="1920" filter="url(#grano)" style="mix-blend-mode:multiply"/><rect width="1080" height="1920" fill="url(#vinetaBV)"/>`;
    return `<g transform="translate(540 960) scale(${c.zoom}) translate(${-c.x} ${-c.y})">${fondoSVG}${capas}</g>${acabado}`;
  };
  // Antes de grabar: el fondo (un poco más grande, para que la cámara no le vea los bordes) y el grano con la
  // viñeta se pintan una vez y se reutilizan como imágenes.
  cuadro.preparar = async (h) => {
    fondoImg = await h.capa(pintarFondo(dibujo.fondo, { t: toma.inicio, ...(dibujo.fondoOpts || {}) }));
    granoImg = await h.capa(`<rect width="1080" height="1920" fill="#fff"/><rect width="1080" height="1920" filter="url(#grano)"/><rect width="1080" height="1920" fill="url(#vinetaBV)"/>`);
  };
  cuadro.cuadro = () => cuadro;
  return cuadro;
}

export const VINETA = `<radialGradient id="vinetaBV" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="${TINTA}" stop-opacity="0"/><stop offset="1" stop-color="${TINTA}" stop-opacity="0.45"/></radialGradient>`;
