// Barcada 2D · los fondos de historia bíblica, con la misma profundidad que fondos.mjs (degradado, manchas de luz,
// capas lejanas y un suelo). Se dibujan para cualquier formato: ({ t, suelo, W, H }) → SVG en W × H
// (1080 × 1920 en vertical, 1920 × 1080 en horizontal). El suelo, por defecto, al 75 % del alto (80 % en horizontal).
//   nazaret (atardecer en las colinas), camino, desierto, egipto (pirámides y el Nilo), belen (noche con la estrella),
//   establo (la cueva por dentro), taller (el taller de José), templo (por dentro), casanoche (dentro, de noche: los
//   sueños), gloria (cielo dorado: ángeles).
import { TINTA } from "./estilo.mjs";

const manchas = (lista, t = 0) => lista.map(([x, y, r, c, op = 0.55], i) =>
  `<circle cx="${x + 14 * Math.sin(t * 0.4 + i)}" cy="${y + 10 * Math.cos(t * 0.3 + i)}" r="${r}" fill="${c}" opacity="${op}" style="filter:blur(${Math.round(r * 0.45)}px)"/>`).join("");
const lineal = (id, stops) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs>`;
const cielo = (id, stops, W, H) => `${lineal(id, stops)}<rect width="${W}" height="${H}" fill="url(#${id})"/>`;
const sueloSVG = (id, y, c0, c1, W, H, luz = "#ffe0b0", curva = 70) => `${lineal(id, [[0, c0], [1, c1]])}
  <path d="M -20 ${y} Q ${W / 2} ${y - curva} ${W + 20} ${y} L ${W + 20} ${H + 20} L -20 ${H + 20} Z" fill="url(#${id})"/>
  <path d="M -20 ${y} Q ${W / 2} ${y - curva} ${W + 20} ${y}" fill="none" stroke="${TINTA}" stroke-width="6"/>
  <path d="M -20 ${y + 12} Q ${W / 2} ${y - curva + 12} ${W + 20} ${y + 12}" fill="none" stroke="${luz}" stroke-width="5" opacity="0.5"/>`;
// colinas: una línea ondulada rellena (capa lejana)
const colinas = (y, amp, color, W, H, semilla = 1, op = 1) => {
  let d = `M -20 ${H + 20} L -20 ${y}`;
  for (let x = 0; x <= W + 40; x += 140) d += ` Q ${x + 70} ${y - amp * (0.6 + 0.4 * Math.sin(x * 0.013 + semilla))} ${x + 140} ${y - amp * 0.2 * Math.cos(x * 0.02 + semilla)}`;
  return `<path d="${d} L ${W + 40} ${H + 20} Z" fill="${color}" opacity="${op}"/>`;
};
// casitas planas a lo lejos (Nazaret, Belén): luces 0-1 enciende ventanas
const pueblo = (x0, y, n, color, luces = 0, escala = 1) => Array.from({ length: n }, (_, i) => {
  const w = (60 + ((i * 37) % 50)) * escala, h = (50 + ((i * 53) % 60)) * escala, x = x0 + i * 70 * escala, yy = y - ((i * 29) % 30) * escala;
  return `<rect x="${x}" y="${yy - h}" width="${w}" height="${h}" fill="${color}"/>${luces ? `<rect x="${x + w * 0.35}" y="${yy - h * 0.6}" width="${10 * escala}" height="${12 * escala}" fill="#ffd27a" opacity="${luces * ((i % 3) ? 0.9 : 0.4)}"/>` : ""}`;
}).join("");
const estrellas = (n, t, W, alto) => Array.from({ length: n }, (_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 331) % alto}" r="${1.4 + (i % 3)}" fill="#fff" opacity="${0.35 + 0.55 * Math.abs(Math.sin(t * 1.2 + i))}"/>`).join("");
const pared = (id, c0, c1, W, H) => cielo(id, [[0, c0], [1, c1]], W, H) + Array.from({ length: Math.round(W * H / 80000) }, (_, i) => `<rect x="${(i * 173) % W - 40}" y="${(i * 241) % H}" width="${90 + (i % 4) * 30}" height="${44 + (i % 3) * 10}" rx="10" fill="#000" opacity="0.05"/>`).join("");

// el suelo por defecto y el «horizonte» (lo lejano se pone por encima del suelo, a la distancia de siempre)
const base = ({ W = 1080, H = 1920, suelo }) => { const s = suelo ?? Math.round(H * (W > H ? 0.8 : 0.75)); return { W, H, s, cx: W / 2 }; };

export const FONDOS_BIBLIA = {
  nazaret: (o) => { const { W, H, s } = base(o), t = o.t || 0;
    return cielo("bnz", [[0, "#ffcf8a"], [0.35, "#ffb07a"], [0.65, "#f3c99a"], [1, "#d9a06a"]], W, H)
      + `<circle cx="${W * 0.7}" cy="${s - 680}" r="150" fill="#fff3c0"/><circle cx="${W * 0.7}" cy="${s - 680}" r="300" fill="#ffe0a0" opacity="0.45" style="filter:blur(60px)"/>`
      + manchas([[W * 0.18, Math.max(120, s - 1020), 140, "#ffe6c0", 0.6], [W * 0.83, Math.max(100, s - 1140), 120, "#fff0d0", 0.5]], t)
      + colinas(s - 440, 140, "#d99a6a", W, H, 1, 0.8) + pueblo(W * 0.07, s - 430, Math.round(W / 180), "#e8b88a", 0, 0.9) + pueblo(W * 0.6, s - 450, Math.round(W / 220), "#e3b080", 0, 0.8)
      + colinas(s - 260, 120, "#b9865a", W, H, 3) + colinas(s - 140, 90, "#a8784e", W, H, 5)
      + sueloSVG("bnzs", s, "#d8b07a", "#8f6a3c", W, H); },
  camino: (o) => { const { W, H, s, cx } = base(o), t = o.t || 0;
    return cielo("bcm", [[0, "#9fd4ff"], [0.6, "#d8eeff"], [1, "#fff2d0"]], W, H)
      + manchas([[W * 0.2, Math.max(120, s - 1060), 120, "#ffffff", 0.75], [W * 0.76, Math.max(200, s - 920), 160, "#ffffff", 0.6]], t)
      + colinas(s - 360, 150, "#b9c98a", W, H, 2, 0.85) + colinas(s - 200, 120, "#9cb070", W, H, 4)
      + sueloSVG("bcms", s, "#e3c48e", "#a8824e", W, H)
      + `<path d="M ${cx - 160} ${H + 10} Q ${cx - 20} ${s + 100} ${cx} ${s - 20} Q ${cx + 20} ${s + 100} ${cx + 220} ${H + 10} Z" fill="#f3dcae" opacity="0.8"/>`; },
  desierto: (o) => { const { W, H, s } = base(o);
    return cielo("bds", [[0, "#ffd98a"], [0.5, "#ffe9b8"], [1, "#fff4dc"]], W, H)
      + `<circle cx="${W * 0.28}" cy="${Math.max(150, s - 940)}" r="120" fill="#fffbe0"/><circle cx="${W * 0.28}" cy="${Math.max(150, s - 940)}" r="260" fill="#fff0b0" opacity="0.5" style="filter:blur(60px)"/>`
      + colinas(s - 310, 110, "#f0cd8e", W, H, 2) + colinas(s - 160, 90, "#e3b878", W, H, 6) + sueloSVG("bdss", s, "#eccb8e", "#b8894e", W, H, "#fff0c8", 90); },
  egipto: (o) => { const { W, H, s } = base(o);
    const pir = (x, h, w) => `<path d="M ${x - w} ${s - 280} L ${x} ${s - 280 - h} L ${x + w} ${s - 280} Z" fill="#e0b070"/><path d="M ${x} ${s - 280 - h} L ${x + w} ${s - 280} L ${x + w * 0.33} ${s - 280} Z" fill="#c8945a"/>`;
    return cielo("beg", [[0, "#ffc27a"], [0.5, "#ffdca0"], [1, "#fff0d0"]], W, H)
      + `<circle cx="${W * 0.76}" cy="${Math.max(160, s - 820)}" r="110" fill="#fff6d0"/><circle cx="${W * 0.76}" cy="${Math.max(160, s - 820)}" r="240" fill="#ffd890" opacity="0.5" style="filter:blur(60px)"/>`
      + pir(W * 0.3, 320, 210) + pir(W * 0.57, 230, 150) + (W > H ? pir(W * 0.12, 160, 110) : "")
      + colinas(s - 260, 50, "#ecc68a", W, H, 1) + `<path d="M -20 ${s - 170} Q ${W / 2} ${s - 210} ${W + 20} ${s - 160} L ${W + 20} ${s - 120} Q ${W / 2} ${s - 170} -20 ${s - 130} Z" fill="#5fb0d8" opacity="0.85"/>`
      + sueloSVG("begs", s, "#e8c48a", "#b0844a", W, H, "#fff0c8", 60); },
  belen: (o) => { const { W, H, s } = base(o), t = o.t || 0, ex = W * 0.72, ey = Math.max(160, s - 1130);
    return cielo("bbl", [[0, "#1a1f4a"], [0.55, "#2c2f6e"], [1, "#5a4a8a"]], W, H) + estrellas(Math.round(W * H / 30000), t, W, s - 300)
      + `<circle cx="${ex}" cy="${ey}" r="60" fill="#fff6c8"/><circle cx="${ex}" cy="${ey}" r="220" fill="#fff0a0" opacity="0.4" style="filter:blur(50px)"/>`
      + `<path d="M ${ex - 20} ${ey} L ${ex + 20} ${ey} L ${ex + 200} ${s - 160} L ${ex - 180} ${s - 160} Z" fill="#fff6c8" opacity="0.12" style="filter:blur(12px)"/>`
      + colinas(s - 360, 130, "#3a3a78", W, H, 2) + pueblo(W * 0.11, s - 330, Math.round(W / 120), "#2a2a5e", 0.9, 1)
      + colinas(s - 200, 100, "#2c2c62", W, H, 5) + sueloSVG("bbls", s, "#3a3466", "#16142e", W, H, "#9fb4ff"); },
  establo: (o) => { const { W, H, s, cx } = base(o), t = o.t || 0, top = s - (W > H ? 820 : 1340);
    return cielo("bes", [[0, "#3a2418"], [0.5, "#5a3624"], [1, "#2a160e"]], W, H)
      + `<path d="M -20 ${H + 20} L -20 ${top + 380} Q ${cx} ${top} ${W + 20} ${top + 380} L ${W + 20} ${H + 20} Z" fill="#6e4430"/>`
      + `<path d="M 60 ${H + 20} L 60 ${top + 500} Q ${cx} ${top + 180} ${W - 60} ${top + 500} L ${W - 60} ${H + 20} Z" fill="#8a5a3a"/>`
      + Array.from({ length: Math.round(W / 210) }, (_, i) => `<rect x="${110 + i * 200}" y="${top + 440}" width="40" height="${s - top - 440}" fill="#5e3418" opacity="0.75"/>`).join("")
      + `<rect x="60" y="${top + 520}" width="${W - 120}" height="44" fill="#5e3418"/>`
      + manchas([[cx, s - 340, 380, "#ffc36a", 0.45], [cx, s - 540, 200, "#fff0b0", 0.35]], t)
      + sueloSVG("bess", s, "#d8b060", "#7a5a24", W, H, "#fff0a0", 40)
      + Array.from({ length: Math.round(W / 27) }, (_, i) => `<path d="M ${(i * 131) % W} ${s + 30 + (i * 47) % Math.max(40, H - s - 40)} l ${i % 2 ? 26 : -26} -18" stroke="#f3d27a" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`).join(""); },
  taller: (o) => { const { W, H, s } = base(o), t = o.t || 0, vx = W * 0.6, vy = s - (W > H ? 680 : 1080), r0 = W > H ? s - 560 : s - 940;
    return pared("bta", "#e8c49a", "#b0804e", W, H)
      + `<rect x="${vx}" y="${vy}" width="260" height="300" rx="20" fill="#ffe9b8"/><rect x="${vx}" y="${vy}" width="260" height="300" rx="20" fill="none" stroke="${TINTA}" stroke-width="8"/>`
      + `<path d="M ${vx + 130} ${vy} L ${vx + 130} ${vy + 300} M ${vx} ${vy + 150} L ${vx + 260} ${vy + 150}" stroke="${TINTA}" stroke-width="8"/>`
      + `<path d="M ${vx} ${vy} L ${vx + 260} ${vy} L ${vx} ${s} L ${vx - 520} ${s} Z" fill="#fff2c0" opacity="0.28" style="filter:blur(14px)"/>`
      + `<g transform="translate(${W > H ? W * 0.06 : 0} ${r0 - 520})">`
      + `<rect x="80" y="520" width="420" height="24" fill="#8a5a2a"/><rect x="80" y="760" width="420" height="24" fill="#8a5a2a"/>`
      + `<rect x="110" y="440" width="30" height="80" rx="6" fill="#a8683a"/><rect x="160" y="460" width="70" height="60" rx="10" fill="#c06a3a"/><rect x="260" y="430" width="40" height="90" rx="6" fill="#d09a5a"/><rect x="330" y="470" width="120" height="50" rx="8" fill="#a8683a"/>`
      + `<rect x="120" y="690" width="160" height="70" rx="10" fill="#c06a3a"/><rect x="310" y="680" width="40" height="80" rx="6" fill="#5e3418"/></g>`
      + manchas([[vx + 130, vy + 140, 200, "#fff6d0", 0.5]], t)
      + sueloSVG("btas", s, "#a8683a", "#5e3418", W, H, "#ffd9a8", 30)
      + Array.from({ length: Math.round(W / 90) }, (_, i) => `<path d="M ${-60 + i * 100} ${s + 40} L ${-60 + i * 100 + 200} ${H + 20}" stroke="#4e2a12" stroke-width="4" opacity="0.35"/>`).join(""); },
  templo: (o) => { const { W, H, s, cx } = base(o), t = o.t || 0, top = W > H ? 60 : 200;
    return cielo("btp", [[0, "#f6e6c4"], [0.6, "#e3c98e"], [1, "#a8824e"]], W, H)
      + Array.from({ length: Math.round(W / 270) }, (_, i) => `<rect x="${60 + i * 270}" y="${top + 100}" width="120" height="${s - top}" fill="#fff8e8"/><rect x="${60 + i * 270}" y="${top + 100}" width="120" height="${s - top}" fill="none" stroke="#c4b89e" stroke-width="6"/><rect x="${40 + i * 270}" y="${top + 80}" width="160" height="40" fill="#e3d2a8"/>`).join("")
      + `<rect x="-20" y="${top}" width="${W + 40}" height="90" fill="#d8b860"/><rect x="-20" y="${top}" width="${W + 40}" height="90" fill="none" stroke="#a8824e" stroke-width="6"/>`
      + manchas([[cx, s - 740, 320, "#fff2b0", 0.5]], t)
      + `<path d="M ${cx - 160} 0 L ${cx + 160} 0 L ${cx + 440} ${s} L ${cx - 440} ${s} Z" fill="#fff6c8" opacity="0.2" style="filter:blur(18px)"/>`
      + sueloSVG("btps", s, "#e8d8b4", "#9c8a62", W, H, "#fff6e0", 20)
      + Array.from({ length: 8 }, (_, i) => `<path d="M -20 ${s + 60 + i * 60} L ${W + 20} ${s + 60 + i * 60}" stroke="#857a62" stroke-width="3" opacity="0.35"/>`).join(""); },
  casanoche: (o) => { const { W, H, s } = base(o), t = o.t || 0, vx = W * 0.6, vy = s - (W > H ? 680 : 1060);
    return pared("bcn", "#3a3a6a", "#1c1a38", W, H)
      + `<rect x="${vx}" y="${vy}" width="240" height="280" rx="120" fill="#1a2350"/><circle cx="${vx + 140}" cy="${vy + 100}" r="44" fill="#fff6d8"/><circle cx="${vx + 140}" cy="${vy + 100}" r="120" fill="#fff6d8" opacity="0.2" style="filter:blur(30px)"/>`
      + `<rect x="${vx}" y="${vy}" width="240" height="280" rx="120" fill="none" stroke="${TINTA}" stroke-width="8"/>`
      + manchas([[W * 0.22, s - 280, 300, "#ffb35a", 0.28]], t)
      + sueloSVG("bcns", s, "#4a3a5a", "#1c1428", W, H, "#c9b4ff", 30); },
  gloria: (o) => { const { W, H } = base(o), t = o.t || 0, cx = W / 2, cy = H * 0.32, R = Math.max(W, H) * 1.2;
    return `<defs><radialGradient id="bgl" cx="0.5" cy="0.32" r="0.9"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.35" stop-color="#ffe39a"/><stop offset="0.75" stop-color="#f5b860"/><stop offset="1" stop-color="#c47a3a"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#bgl)"/>`
      + Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2 + t * 0.03; return `<path d="M ${cx} ${cy} L ${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R} L ${cx + Math.cos(a + 0.09) * R} ${cy + Math.sin(a + 0.09) * R} Z" fill="#fff" opacity="0.18"/>`; }).join("")
      + manchas([[W * 0.14, H * 0.78, 260, "#ffffff", 0.75], [cx, H * 0.86, 320, "#ffffff", 0.8], [W * 0.86, H * 0.78, 260, "#ffffff", 0.75], [W * 0.28, H * 0.2, 140, "#ffffff", 0.5], [W * 0.79, H * 0.16, 120, "#ffffff", 0.5]], t); },
};
export const LISTA_FONDOS_BIBLIA = Object.keys(FONDOS_BIBLIA);
