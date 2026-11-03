// Barco Viral 2D · los fondos: cada uno con profundidad (degradado, manchas de luz desenfocadas y un suelo o
// horizonte), en 1080 × 1920. fondo(nombre, { t, paleta }) → SVG.
import { TINTA } from "./estilo.mjs";

const manchas = (lista, t = 0) => lista.map(([x, y, r, c, op = 0.55], i) =>
  `<circle cx="${x + 18 * Math.sin(t * 0.4 + i)}" cy="${y + 12 * Math.cos(t * 0.3 + i)}" r="${r}" fill="${c}" opacity="${op}" style="filter:blur(${Math.round(r * 0.45)}px)"/>`).join("");
const suelo = (y, c0, c1, luz = "#ffc9a0") => `
  <defs><linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>
  <path d="M -20 ${y} Q 540 ${y - 80} 1100 ${y} L 1100 1940 L -20 1940 Z" fill="url(#suelo)"/>
  <path d="M -20 ${y} Q 540 ${y - 80} 1100 ${y}" fill="none" stroke="${TINTA}" stroke-width="6"/>
  <path d="M -20 ${y + 12} Q 540 ${y - 66} 1100 ${y + 12}" fill="none" stroke="${luz}" stroke-width="5" opacity="0.55"/>`;
const cielo = (id, stops, cx = 0.35, cy = 0.3) => `<defs><radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.95">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</radialGradient></defs><rect width="1080" height="1920" fill="url(#${id})"/>`;

export const FONDOS = {
  estudio: ({ t, suelo: s = 1380 }) => cielo("fe", [[0, "#ffe3b3"], [0.5, "#f6a96b"], [1, "#5a2e45"]]) + manchas([[180, 400, 160, "#ffd59a"], [880, 600, 220, "#ffc38a"], [760, 260, 120, "#fff0cf"], [120, 900, 200, "#f59c72"]], t) + suelo(s, "#7a4632", "#3a1c22"),
  cielo: ({ t, suelo: s = 1500 }) => cielo("fc", [[0, "#fff7d6"], [0.45, "#9fdcff"], [1, "#3a7fd0"]], 0.7, 0.15) + manchas([[200, 500, 140, "#ffffff", 0.7], [800, 800, 180, "#ffffff", 0.6], [500, 300, 110, "#fff3c0", 0.6]], t) + suelo(s, "#7fcf5a", "#2f7a3a", "#eaffc0"),
  naturaleza: ({ t, suelo: s = 1420 }) => cielo("fn", [[0, "#fff1c4"], [0.5, "#bfe8a0"], [1, "#2f6b4a"]], 0.5, 0.2)
    + `<path d="M -20 1250 Q 250 1050 560 1220 T 1100 1180 L 1100 1500 L -20 1500 Z" fill="#5aa860" opacity="0.8" style="filter:blur(3px)"/>` + manchas([[160, 380, 120, "#fff6cf"], [900, 520, 160, "#e6ffd0"]], t) + suelo(s, "#6aa84f", "#2b5e33", "#eaffc0"),
  noche: ({ t, suelo: s = 1460 }) => cielo("fo", [[0, "#5c4a9a"], [0.5, "#26245a"], [1, "#0d0f26"]], 0.6, 0.2)
    + Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 197) % 1080}" cy="${(i * 331) % 1300}" r="${1.5 + (i % 3)}" fill="#fff" opacity="${0.4 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))}"/>`).join("") + suelo(s, "#2d2a55", "#121233", "#9fb4ff"),
  espacio: ({ t }) => cielo("fs", [[0, "#3b2a7a"], [0.55, "#130f33"], [1, "#05040f"]], 0.4, 0.35) + manchas([[250, 600, 260, "#6a3fd0", 0.35], [850, 1300, 300, "#d04f9a", 0.25]], t)
    + Array.from({ length: 120 }, (_, i) => `<circle cx="${(i * 173) % 1080}" cy="${(i * 389) % 1920}" r="${1 + (i % 3) * 0.8}" fill="#fff" opacity="${0.35 + 0.55 * Math.abs(Math.sin(t + i * 1.3))}"/>`).join(""),
  cocina: ({ t, suelo: s = 1400 }) => cielo("fk", [[0, "#fff4e0"], [0.6, "#f3cf9e"], [1, "#a86a45"]]) + `<g opacity="0.35">${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 140 - 20}" y="300" width="120" height="120" rx="10" fill="#fff"/><rect x="${i * 140 + 50}" y="440" width="120" height="120" rx="10" fill="#fff"/>`).join("")}</g>` + manchas([[300, 500, 150, "#fff8e8"]], t) + suelo(s, "#c08452", "#6b3d22", "#ffe0b8"),
  oficina: ({ t, suelo: s = 1420 }) => cielo("fof", [[0, "#eef6ff"], [0.6, "#bcd3ea"], [1, "#4c6688"]]) + `<rect x="120" y="260" width="840" height="560" rx="16" fill="#ffffff" opacity="0.35"/>` + manchas([[800, 400, 170, "#ffffff", 0.6]], t) + suelo(s, "#8a9bb3", "#3b4a63", "#e8f1ff"),
  oscuro: ({ t, suelo: s = 1440 }) => cielo("fd", [[0, "#5a3a2a"], [0.55, "#24140f"], [1, "#0b0605"]], 0.5, 0.35) + manchas([[540, 760, 320, "#ff9a4a", 0.25]], t) + suelo(s, "#3a2218", "#120806", "#ffb07a"),
  liso: ({ paleta = ["#ffe9c7", "#f3b77e"] }) => cielo("fl", [[0, paleta[0]], [1, paleta[1]]], 0.5, 0.4),
};
export const LISTA_FONDOS = Object.keys(FONDOS);
export const fondo = (nombre = "estudio", o = {}) => (FONDOS[nombre] || FONDOS.estudio)({ t: 0, ...o });
