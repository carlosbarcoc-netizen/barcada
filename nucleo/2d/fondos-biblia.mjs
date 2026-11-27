// Barcada 2D · los fondos de historia bíblica, en 1080 × 1920 y con la misma profundidad que fondos.mjs
// (degradado, manchas de luz, capas lejanas y un suelo). Cada uno: ({ t, suelo }) → SVG.
//   nazaret (atardecer en las colinas), desierto, egipto (pirámides y el Nilo), belen (noche con la estrella),
//   establo (la cueva por dentro), taller (el taller de José), templo (por dentro), casanoche (dentro, de noche:
//   los sueños), gloria (cielo dorado: ángeles), camino (sendero entre colinas, de día).
import { TINTA } from "./estilo.mjs";

const manchas = (lista, t = 0) => lista.map(([x, y, r, c, op = 0.55], i) =>
  `<circle cx="${x + 14 * Math.sin(t * 0.4 + i)}" cy="${y + 10 * Math.cos(t * 0.3 + i)}" r="${r}" fill="${c}" opacity="${op}" style="filter:blur(${Math.round(r * 0.45)}px)"/>`).join("");
const lineal = (id, stops, vertical = true) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs>`;
const cieloLineal = (id, stops) => `${lineal(id, stops)}<rect width="1080" height="1920" fill="url(#${id})"/>`;
const suelo = (id, y, c0, c1, luz = "#ffe0b0", curva = 70) => `${lineal(id, [[0, c0], [1, c1]])}
  <path d="M -20 ${y} Q 540 ${y - curva} 1100 ${y} L 1100 1940 L -20 1940 Z" fill="url(#${id})"/>
  <path d="M -20 ${y} Q 540 ${y - curva} 1100 ${y}" fill="none" stroke="${TINTA}" stroke-width="6"/>
  <path d="M -20 ${y + 12} Q 540 ${y - curva + 12} 1100 ${y + 12}" fill="none" stroke="${luz}" stroke-width="5" opacity="0.5"/>`;
// colinas: una línea ondulada rellena (capa lejana), con su color
const colinas = (y, amp, color, semilla = 1, op = 1) => {
  let d = `M -20 1940 L -20 ${y}`;
  for (let x = 0; x <= 1120; x += 140) d += ` Q ${x + 70} ${y - amp * (0.6 + 0.4 * Math.sin(x * 0.013 + semilla))} ${x + 140} ${y - amp * 0.2 * Math.cos(x * 0.02 + semilla)}`;
  return `<path d="${d} L 1120 1940 Z" fill="${color}" opacity="${op}"/>`;
};
// casitas planas a lo lejos (Nazaret, Belén): luces 0-1 enciende ventanas
const pueblo = (x0, y, n, color, luces = 0, escala = 1) => Array.from({ length: n }, (_, i) => {
  const w = (60 + ((i * 37) % 50)) * escala, h = (50 + ((i * 53) % 60)) * escala, x = x0 + i * 70 * escala, yy = y - ((i * 29) % 30) * escala;
  return `<rect x="${x}" y="${yy - h}" width="${w}" height="${h}" fill="${color}"/>${luces ? `<rect x="${x + w * 0.35}" y="${yy - h * 0.6}" width="${10 * escala}" height="${12 * escala}" fill="#ffd27a" opacity="${luces * ((i % 3) ? 0.9 : 0.4)}"/>` : ""}`;
}).join("");
const estrellas = (n, t, alto = 1100) => Array.from({ length: n }, (_, i) => `<circle cx="${(i * 197) % 1080}" cy="${(i * 331) % alto}" r="${1.4 + (i % 3)}" fill="#fff" opacity="${0.35 + 0.55 * Math.abs(Math.sin(t * 1.2 + i))}"/>`).join("");
const pared = (id, c0, c1) => cieloLineal(id, [[0, c0], [1, c1]]) + Array.from({ length: 26 }, (_, i) => `<rect x="${(i * 173) % 1080 - 40}" y="${(i * 241) % 1300}" width="${90 + (i % 4) * 30}" height="${44 + (i % 3) * 10}" rx="10" fill="#000" opacity="0.05"/>`).join("");

export const FONDOS_BIBLIA = {
  nazaret: ({ t, suelo: s = 1440 }) => cieloLineal("bnz", [[0, "#ffcf8a"], [0.35, "#ffb07a"], [0.65, "#f3c99a"], [1, "#d9a06a"]])
    + `<circle cx="760" cy="760" r="150" fill="#fff3c0"/><circle cx="760" cy="760" r="300" fill="#ffe0a0" opacity="0.45" style="filter:blur(60px)"/>`
    + manchas([[200, 420, 140, "#ffe6c0", 0.6], [900, 300, 120, "#fff0d0", 0.5]], t)
    + colinas(1000, 140, "#d99a6a", 1, 0.8) + pueblo(80, 1010, 6, "#e8b88a", 0, 0.9) + pueblo(640, 990, 5, "#e3b080", 0, 0.8)
    + colinas(1180, 120, "#b9865a", 3) + colinas(1300, 90, "#a8784e", 5)
    + suelo("bnzs", s, "#d8b07a", "#8f6a3c"),
  camino: ({ t, suelo: s = 1440 }) => cieloLineal("bcm", [[0, "#9fd4ff"], [0.6, "#d8eeff"], [1, "#fff2d0"]])
    + manchas([[220, 380, 120, "#ffffff", 0.75], [820, 520, 160, "#ffffff", 0.6]], t)
    + colinas(1080, 150, "#b9c98a", 2, 0.85) + colinas(1240, 120, "#9cb070", 4)
    + suelo("bcms", s, "#e3c48e", "#a8824e")
    + `<path d="M 380 1920 Q 520 1600 540 ${s - 20} Q 560 1600 760 1920 Z" fill="#f3dcae" opacity="0.8"/>`,
  desierto: ({ t, suelo: s = 1460 }) => cieloLineal("bds", [[0, "#ffd98a"], [0.5, "#ffe9b8"], [1, "#fff4dc"]])
    + `<circle cx="300" cy="520" r="120" fill="#fffbe0"/><circle cx="300" cy="520" r="260" fill="#fff0b0" opacity="0.5" style="filter:blur(60px)"/>`
    + colinas(1150, 110, "#f0cd8e", 2) + colinas(1300, 90, "#e3b878", 6) + suelo("bdss", s, "#eccb8e", "#b8894e", "#fff0c8", 90),
  egipto: ({ t, suelo: s = 1460 }) => cieloLineal("beg", [[0, "#ffc27a"], [0.5, "#ffdca0"], [1, "#fff0d0"]])
    + `<circle cx="820" cy="640" r="110" fill="#fff6d0"/><circle cx="820" cy="640" r="240" fill="#ffd890" opacity="0.5" style="filter:blur(60px)"/>`
    + `<path d="M 120 1180 L 330 860 L 540 1180 Z" fill="#e0b070"/><path d="M 330 860 L 540 1180 L 400 1180 Z" fill="#c8945a"/>`
    + `<path d="M 470 1180 L 620 950 L 770 1180 Z" fill="#e6b878"/><path d="M 620 950 L 770 1180 L 670 1180 Z" fill="#cd9a60"/>`
    + colinas(1200, 50, "#ecc68a", 1) + `<path d="M -20 1290 Q 540 1250 1100 1300 L 1100 1340 Q 540 1290 -20 1330 Z" fill="#5fb0d8" opacity="0.85"/>`
    + suelo("begs", s, "#e8c48a", "#b0844a", "#fff0c8", 60),
  belen: ({ t, suelo: s = 1460 }) => cieloLineal("bbl", [[0, "#1a1f4a"], [0.55, "#2c2f6e"], [1, "#5a4a8a"]]) + estrellas(70, t)
    + `<circle cx="780" cy="330" r="60" fill="#fff6c8"/><circle cx="780" cy="330" r="220" fill="#fff0a0" opacity="0.4" style="filter:blur(50px)"/>`
    + `<path d="M 760 330 L 800 330 L 980 1300 L 600 1300 Z" fill="#fff6c8" opacity="0.12" style="filter:blur(12px)"/>`
    + colinas(1100, 130, "#3a3a78", 2) + pueblo(120, 1130, 9, "#2a2a5e", 0.9, 1)
    + colinas(1260, 100, "#2c2c62", 5) + suelo("bbls", s, "#3a3466", "#16142e", "#9fb4ff"),
  establo: ({ t, suelo: s = 1480 }) => cieloLineal("bes", [[0, "#3a2418"], [0.5, "#5a3624"], [1, "#2a160e"]])
    + `<path d="M -20 1940 L -20 500 Q 540 120 1100 500 L 1100 1940 Z" fill="#6e4430"/>`
    + `<path d="M 60 1940 L 60 620 Q 540 300 1020 620 L 1020 1940 Z" fill="#8a5a3a"/>`
    + Array.from({ length: 5 }, (_, i) => `<rect x="${110 + i * 200}" y="560" width="40" height="1000" fill="#5e3418" opacity="0.75"/>`).join("")
    + `<rect x="60" y="640" width="960" height="44" fill="#5e3418"/>`
    + manchas([[540, 1100, 380, "#ffc36a", 0.45], [540, 900, 200, "#fff0b0", 0.35]], t)
    + suelo("bess", s, "#d8b060", "#7a5a24", "#fff0a0", 40)
    + Array.from({ length: 40 }, (_, i) => `<path d="M ${(i * 131) % 1080} ${s + 30 + (i * 47) % 300} l ${i % 2 ? 26 : -26} -18" stroke="#f3d27a" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`).join(""),
  taller: ({ t, suelo: s = 1460 }) => pared("bta", "#e8c49a", "#b0804e")
    + `<rect x="640" y="380" width="260" height="300" rx="20" fill="#ffe9b8"/><rect x="640" y="380" width="260" height="300" rx="20" fill="none" stroke="${TINTA}" stroke-width="8"/>`
    + `<path d="M 770 380 L 770 680 M 640 530 L 900 530" stroke="${TINTA}" stroke-width="8"/>`
    + `<path d="M 640 380 L 900 380 L 640 ${s} L 120 ${s} Z" fill="#fff2c0" opacity="0.28" style="filter:blur(14px)"/>`
    + `<rect x="80" y="520" width="420" height="24" fill="#8a5a2a"/><rect x="80" y="760" width="420" height="24" fill="#8a5a2a"/>`
    + `<rect x="110" y="440" width="30" height="80" rx="6" fill="#a8683a"/><rect x="160" y="460" width="70" height="60" rx="10" fill="#c06a3a"/><rect x="260" y="430" width="40" height="90" rx="6" fill="#d09a5a"/><rect x="330" y="470" width="120" height="50" rx="8" fill="#a8683a"/>`
    + `<rect x="120" y="690" width="160" height="70" rx="10" fill="#c06a3a"/><rect x="310" y="680" width="40" height="80" rx="6" fill="#5e3418"/>`
    + manchas([[770, 520, 200, "#fff6d0", 0.5]], t)
    + suelo("btas", s, "#a8683a", "#5e3418", "#ffd9a8", 30)
    + Array.from({ length: 12 }, (_, i) => `<path d="M ${-60 + i * 100} ${s + 40} L ${-60 + i * 100 + 200} 1940" stroke="#4e2a12" stroke-width="4" opacity="0.35"/>`).join(""),
  templo: ({ t, suelo: s = 1480 }) => cieloLineal("btp", [[0, "#f6e6c4"], [0.6, "#e3c98e"], [1, "#a8824e"]])
    + Array.from({ length: 4 }, (_, i) => `<rect x="${60 + i * 270}" y="300" width="120" height="1200" fill="#fff8e8"/><rect x="${60 + i * 270}" y="300" width="120" height="1200" fill="none" stroke="#c4b89e" stroke-width="6"/><rect x="${40 + i * 270}" y="280" width="160" height="40" fill="#e3d2a8"/>`).join("")
    + `<rect x="-20" y="200" width="1120" height="90" fill="#d8b860"/><rect x="-20" y="200" width="1120" height="90" fill="none" stroke="#a8824e" stroke-width="6"/>`
    + manchas([[540, 700, 320, "#fff2b0", 0.5]], t)
    + `<path d="M 380 0 L 700 0 L 980 ${s} L 100 ${s} Z" fill="#fff6c8" opacity="0.2" style="filter:blur(18px)"/>`
    + suelo("btps", s, "#e8d8b4", "#9c8a62", "#fff6e0", 20)
    + Array.from({ length: 8 }, (_, i) => `<path d="M -20 ${s + 60 + i * 60} L 1100 ${s + 60 + i * 60}" stroke="#857a62" stroke-width="3" opacity="0.35"/>`).join(""),
  casanoche: ({ t, suelo: s = 1480 }) => pared("bcn", "#3a3a6a", "#1c1a38")
    + `<rect x="650" y="420" width="240" height="280" rx="120" fill="#1a2350"/><circle cx="790" cy="520" r="44" fill="#fff6d8"/><circle cx="790" cy="520" r="120" fill="#fff6d8" opacity="0.2" style="filter:blur(30px)"/>`
    + `<rect x="650" y="420" width="240" height="280" rx="120" fill="none" stroke="${TINTA}" stroke-width="8"/>`
    + manchas([[240, 1200, 300, "#ffb35a", 0.28]], t)
    + suelo("bcns", s, "#4a3a5a", "#1c1428", "#c9b4ff", 30),
  gloria: ({ t }) => `<defs><radialGradient id="bgl" cx="0.5" cy="0.32" r="0.9"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.35" stop-color="#ffe39a"/><stop offset="0.75" stop-color="#f5b860"/><stop offset="1" stop-color="#c47a3a"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#bgl)"/>`
    + Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2 + t * 0.03; return `<path d="M 540 620 L ${540 + Math.cos(a) * 2200} ${620 + Math.sin(a) * 2200} L ${540 + Math.cos(a + 0.09) * 2200} ${620 + Math.sin(a + 0.09) * 2200} Z" fill="#fff" opacity="0.18"/>`; }).join("")
    + manchas([[150, 1500, 260, "#ffffff", 0.75], [540, 1650, 320, "#ffffff", 0.8], [930, 1500, 260, "#ffffff", 0.75], [300, 400, 140, "#ffffff", 0.5], [850, 300, 120, "#ffffff", 0.5]], t),
};
export const LISTA_FONDOS_BIBLIA = Object.keys(FONDOS_BIBLIA);
