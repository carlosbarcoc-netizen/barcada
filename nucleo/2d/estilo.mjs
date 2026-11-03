// Barco Viral 2D · el sello visual: ilustración vectorial con volumen.
// - Contorno entintado (marrón muy oscuro, trazo redondo), nunca negro puro.
// - Volumen en tres capas: degradado base, una sombra «cel» de dos tonos recortada por la forma, y luz de borde de
//   color frío en el lado contrario a la luz (la luz principal viene de arriba a la izquierda).
// - Brillo especular blando y grano de impresión sobre todo el cuadro.
// Cada pieza es una función que devuelve SVG; usa `vol()` para sus degradados y así todas comparten la misma luz.

export const TINTA = "#2b1a14";
export const BORDE = 6;
let contador = 0;
export const uid = (p = "g") => `${p}${++contador}`;

// Paletas de cada material: [claro, medio, oscuro, luz de borde]
export const PALETA = {
  cacao: ["#e9a15a", "#b8622c", "#6e2f14", "#7fd3e0"],
  mazorca: ["#ffd25e", "#f08a24", "#a8401a", "#86e0d2"],
  cafe: ["#9a6440", "#5e3520", "#2e170b", "#8fd0ff"],
  ceramica: ["#fffaf0", "#e9dcc8", "#b9a48a", "#9fe2ff"],
  hoja: ["#a5e36a", "#4fae3f", "#22672b", "#ffe08a"],
  oro: ["#fff1a6", "#f5c33b", "#b07a12", "#ffffff"],
  rosa: ["#ffc2c8", "#f08592", "#b4485e", "#a6e9ff"],
  azul: ["#9fe0ff", "#3f9be0", "#1f4f8f", "#ffe6a6"],
  metal: ["#f3f5f7", "#aab3bd", "#5b6470", "#ffd9a8"],
  piel: ["#ffd6b0", "#e7a374", "#a9643d", "#a6e9ff"],
  rojo: ["#ff9a7a", "#e5483a", "#8f1f1f", "#ffe08a"],
};

// Los degradados de volumen de un material: devuelve { defs, base, sombra, borde } (base y sombra son url(#…)).
export function vol(paleta, { ang = 35 } = {}) {
  const [c, m, o, b] = Array.isArray(paleta) ? paleta : PALETA[paleta];
  const id = uid("v"), rad = (ang * Math.PI) / 180, x2 = 0.5 + Math.cos(rad) * 0.5, y2 = 0.5 + Math.sin(rad) * 0.5;
  const defs = `
    <linearGradient id="${id}b" x1="${1 - x2}" y1="${1 - y2}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${c}"/><stop offset="0.55" stop-color="${m}"/><stop offset="1" stop-color="${o}"/></linearGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o}" stop-opacity="0.0"/><stop offset="1" stop-color="${o}" stop-opacity="0.85"/></linearGradient>`;
  return { defs, base: `url(#${id}b)`, sombra: `url(#${id}s)`, borde: b, claro: c, medio: m, oscuro: o };
}

// Una forma con volumen, en capas recortadas por la propia forma:
//   1. luz de borde (color frío) en todo;  2. la sombra, desplazada un poco hacia la luz (deja el borde de luz abajo a
//   la derecha);  3. el degradado, desplazado más (deja la media luna de sombra «cel»);  4. el contorno entintado.
// d: el camino SVG. luz/sombra: cuánto se desplazan (px). Devuelve SVG.
export function forma(d, paleta, { borde = 6, sombra = 26, rim = 7, contorno = true, extra = "" } = {}) {
  const v = vol(paleta), clip = uid("c");
  return `<g>
    <defs>${v.defs}<clipPath id="${clip}"><path d="${d}"/></clipPath></defs>
    <g clip-path="url(#${clip})">
      <path d="${d}" fill="${v.borde}"/>
      <path d="${d}" fill="${v.oscuro}" transform="translate(${-rim} ${-rim})"/>
      <path d="${d}" fill="${v.base}" transform="translate(${-sombra} ${-sombra * 0.8})"/>
      ${extra}
    </g>
    ${contorno ? `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${borde}" stroke-linejoin="round" stroke-linecap="round"/>` : ""}
  </g>`;
}

// Los filtros y texturas comunes de todo el cuadro (se ponen una vez en el SVG).
export const DEFS_COMUNES = `
  <filter id="grano" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.16"/></feComponentTransfer>
  </filter>
  <filter id="blando" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="muyBlando" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
  <filter id="sombraSuelo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>`;

// Un brillo especular blando (encima de una pieza): una elipse blanca difuminada.
export const brillo = (x, y, rx, ry, op = 0.6, rot = -25) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(${rot} ${x} ${y})" filter="url(#blando)" style="filter:blur(${Math.max(2, rx * 0.12)}px)"/>`;

// La sombra en el suelo bajo una pieza.
export const sombraSuelo = (x, y, rx, ry = rx * 0.18, op = 0.35) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TINTA}" opacity="${op}" filter="url(#sombraSuelo)"/>`;
