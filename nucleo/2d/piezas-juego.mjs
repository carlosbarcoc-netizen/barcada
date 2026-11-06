// Barcada 2.0 · las piezas del modo juego. Planas y nítidas (nada de contorno entintado ni grano): bloques de color,
// neón que brilla y píxeles. Cada pieza recibe o.piel ("neon" | "voxel" | "arcade") y se adapta a ella; o.t (segundo
// del video) y o.tl (segundos desde que entró la pieza) para lo que se mueve solo.
// Centradas en (0, 0); a escala 1 miden unos 300-450 px.
import { PIELES, esc, html, tono } from "./juego.mjs";

const lim = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u ?? 0));
const P = (o) => PIELES[o.piel] || PIELES.neon;
const fuente = (o) => P(o).titulo;

// Colores planos: [base, sombra, luz]
export const JCOL = {
  blanco: ["#F3EEE4", "#D3C9B8", "#FFFFFF"], naranja: ["#F07A3E", "#C65826", "#FF9E6A"], azul: ["#4A78D8", "#3256A6", "#76A0F2"],
  amarillo: ["#FFC93C", "#D9A01C", "#FFE27C"], rojo: ["#E9493F", "#B52E28", "#FF7468"], verde: ["#45C46A", "#2C914E", "#78E294"],
  rosa: ["#F58BB0", "#CB5F88", "#FFB3CD"], morado: ["#8B5CF6", "#6439CE", "#AE88FF"], gris: ["#9AA3AE", "#6C7480", "#C6CCD4"],
  cian: ["#2EE6F5", "#13A6B3", "#93F6FF"], marron: ["#A0623A", "#70401F", "#C98557"], negro: ["#2D313C", "#1A1D25", "#474D5C"],
  lila: ["#C3B5F5", "#9A88D8", "#E0D7FF"], cafe: ["#7A4A2C", "#53301A", "#9E6842"], cacao: ["#C0682E", "#8E4519", "#E08A4C"],
};
const col = (c, def = "blanco") => (Array.isArray(c) ? c : JCOL[c] || (typeof c === "string" && c.startsWith("#") ? [c, tono(c, 0.75), tono(c, 1.3)] : JCOL[def]));
const OSCURO = "#14161F";

// un rectángulo con volumen de bloque según la piel: neón (plano con borde que brilla), bloques (cara de arriba más
// clara y lado más oscuro), arcade (contorno negro de píxel)
function bloque(o, x, y, w, h, c, { prof = 0.18, borde = true } = {}) {
  const [b, s, l] = col(c);
  if (o.piel === "voxel") {
    const d = Math.min(w, h) * prof, sd = d * 0.55;
    return `<path d="M ${x} ${y} L ${x + sd} ${y - d} L ${x + w + sd} ${y - d} L ${x + w} ${y} Z" fill="${l}"/>
      <path d="M ${x + w} ${y} L ${x + w + sd} ${y - d} L ${x + w + sd} ${y + h - d} L ${x + w} ${y + h} Z" fill="${s}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${b}"/>`;
  }
  if (o.piel === "arcade") return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${b}" ${borde ? `stroke="${OSCURO}" stroke-width="7"` : ""}/><rect x="${x + w * 0.78}" y="${y}" width="${w * 0.22}" height="${h}" fill="${s}"/><rect x="${x}" y="${y}" width="${w}" height="${Math.max(6, h * 0.08)}" fill="${l}"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${b}"/><rect x="${x + w * 0.8}" y="${y}" width="${w * 0.2}" height="${h}" fill="${s}"/><rect x="${x}" y="${y}" width="${w}" height="${Math.max(5, h * 0.07)}" fill="${l}"/>`;
}
// una caja de neón: fondo oscuro, borde de color que brilla
const neonCaja = (x, y, w, h, c, { r = 14, relleno = "#0d1520", ancho = 4, brillo = 1 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${relleno}" stroke="${c}" stroke-width="${ancho}" style="filter:drop-shadow(0 0 ${10 * brillo}px ${c})"/>`;
const sombraPiso = (y, rx, o) => (o.piel === "neon" ? "" : `<ellipse cx="0" cy="${y}" rx="${rx}" ry="${rx * 0.16}" fill="#000" opacity="${o.piel === "voxel" ? 0.18 : 0.3}"/>`);
const texto = (x, y, t, { tam = 40, color = "#fff", f = "Space Mono", peso = 700, ancla = "middle", borde = null, bw = 0, sp = 0 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${ancla}" font-family="'${f}'" font-weight="${peso}" font-size="${tam}" fill="${color}" letter-spacing="${sp}" ${borde ? `stroke="${borde}" stroke-width="${bw}" paint-order="stroke" stroke-linejoin="round"` : ""}>${esc(t)}</text>`;

// ---------------------------------------------------------------- los píxeles: iconos de 12 × 12
// Cada letra es un color de la paleta del icono; «.» es vacío.
const ICONOS = {
  correo: ["............", "BBBBBBBBBBBB", "BWWWWWWWWWWB", "BBWWWWWWWWBB", "BWBWWWWWWBWB", "BWWBWWWWBWWB", "BWWWBBBBWWWB", "BWWWWWWWWWWB", "BWWWWWWWWWWB", "BBBBBBBBBBBB", "............", "............"],
  calendario: ["..R....R....", "RRRRRRRRRRRR", "RRRRRRRRRRRR", "WWWWWWWWWWWW", "WBBWBBWBBWBW", "WWWWWWWWWWWW", "WBBWBBWBBWBW", "WWWWWWWWWWWW", "WBBWBBWBBWWW", "WWWWWWWWWWWW", "............", "............"],
  llave: ["............", ".YYYY.......", "YY..YY......", "Y....Y......", "Y....YYYYYYY", "YY..YY..Y.YY", ".YYYY...Y..Y", "............", "............", "............", "............", "............"],
  candado: ["...BBBBBB...", "..BB....BB..", "..B......B..", "..B......B..", ".YYYYYYYYYY.", ".YYYYYYYYYY.", ".YYYYBBYYYY.", ".YYYYBBYYYY.", ".YYYYYBYYYY.", ".YYYYYYYYYY.", ".DDDDDDDDDD.", "............"],
  corazon: ["............", ".RRR...RRR..", "RRWRR.RRRRR.", "RWRRRRRRRRR.", "RRRRRRRRRRR.", "RRRRRRRRRRR.", ".RRRRRRRRR..", "..RRRRRRR...", "...RRRRR....", "....RRR.....", ".....R......", "............"],
  estrella: [".....Y......", ".....Y......", "....YYY.....", "YYYYYYYYYYY.", ".YYYYYYYYY..", "..YYYYYYY...", "..YYYYYYY...", ".YYYY.YYYY..", ".YYY...YYY..", ".Y.......Y..", "............", "............"],
  moneda: ["...YYYYY....", "..YWYYYYY...", ".YWYYDDYYY..", ".YYYYDYYYY..", ".YYYYDDYYY..", ".YYYYYYDYY..", ".YYYYDDYYY..", ".YYYYYDYYY..", "..YYYYYYY...", "...YYYYY....", "............", "............"],
  rayo: [".....YYYY...", "....YYYY....", "...YYYY.....", "..YYYYYYYY..", ".....YYYY...", "....YYYY....", "...YYY......", "..YYY.......", ".YY.........", "............", "............", "............"],
  check: ["............", "..........GG", ".........GGG", "........GGG.", "GG.....GGG..", "GGG...GGG...", ".GGG.GGG....", "..GGGGG.....", "...GGG......", "....G.......", "............", "............"],
  equis: ["............", "RR.......RR.", "RRR.....RRR.", ".RRR...RRR..", "..RRR.RRR...", "...RRRRR....", "...RRRRR....", "..RRR.RRR...", ".RRR...RRR..", "RRR.....RRR.", "RR.......RR.", "............"],
  pregunta: ["...WWWWW....", "..WW...WW...", "..WW...WW...", ".......WW...", "......WW....", ".....WW.....", ".....WW.....", "............", ".....WW.....", ".....WW.....", "............", "............"],
  exclama: [".....RR.....", ".....RR.....", ".....RR.....", ".....RR.....", ".....RR.....", ".....RR.....", "............", ".....RR.....", ".....RR.....", "............", "............", "............"],
  reloj: ["...BBBBB....", "..BWWWWWB...", ".BWWWBWWWB..", "BWWWWBWWWWB.", "BWWWWBWWWWB.", "BWWWWBBBWWB.", "BWWWWWWWWWB.", ".BWWWWWWWB..", "..BWWWWWB...", "...BBBBB....", "............", "............"],
  dinero: ["............", "GGGGGGGGGGGG", "GLLLLLLLLLLG", "GLGLLWWLLGLG", "GLLLWLLWLLLG", "GLLLWLLWLLLG", "GLGLLWWLLGLG", "GLLLLLLLLLLG", "GGGGGGGGGGGG", "............", "............", "............"],
  casa: [".....RR.....", "....RRRR....", "...RRRRRR...", "..RRRRRRRR..", ".RRRRRRRRRR.", "..WWWWWWWW..", "..WBBWWDDW..", "..WBBWWDDW..", "..WWWWWDDW..", "..WWWWWDDW..", "............", "............"],
  carpeta: ["............", "YYYY........", "YYYYY.......", "YYYYYYYYYYYY", "YDDDDDDDDDDY", "YYYYYYYYYYYY", "YYYYYYYYYYYY", "YYYYYYYYYYYY", "YYYYYYYYYYYY", "YYYYYYYYYYYY", "............", "............"],
  cohete: [".....W......", "....WWW.....", "....WCW.....", "....WWW.....", "....WWW.....", "...RWWWR....", "..RRWWWRR...", "....YOY.....", ".....Y......", "............", "............", "............"],
  fuego: [".....R......", "....RR......", "...RRR..R...", "..RRORR.RR..", "..ROOORRRR..", ".RROOYORRR..", ".ROOYYYOOR..", ".ROYYYYYOR..", "..ROYYYOR...", "...RRRRR....", "............", "............"],
  chispa: [".....W......", ".....W......", "....WWW.....", "WWWWWWWWWW..", "....WWW.....", ".....W......", ".....W......", "............", "............", "............", "............", "............"],
  mundo: ["...CCCCC....", "..CGGCCCC...", ".CGGGGCCCC..", ".CCGGGCCGC..", "CCCCGCCGGGC.", "CCCCCCGGGGC.", "CCGGCCCGGCC.", ".CGGGCCCCC..", ".CCGCCCCCC..", "..CCCCCCC...", "...CCCCC....", "............"],
  bombilla: ["...YYYYY....", "..YWYYYYY...", ".YWYYYYYYY..", ".YYYYYYYYY..", ".YYYYYYYYY..", "..YYYYYYY...", "...YYYYY....", "...BBBBB....", "...BBBBB....", "....BBB.....", "............", "............"],
  cerebro: ["...RRRRR....", "..RRWRRRRR..", ".RRRRRWRRRR.", ".RWRRRRRRWR.", ".RRRRWRRRRR.", ".RRRRRRRWRR.", "..RRRRRRRR..", "....RRR.....", ".....RR.....", "............", "............", "............"],
  telefono: ["..BBBBBBB...", "..BCCCCCB...", "..BCCCCCB...", "..BCCCCCB...", "..BCCCCCB...", "..BCCCCCB...", "..BCCCCCB...", "..BBBWBBB...", "..BBBBBBB...", "............", "............", "............"],
  regalo: ["...R..R.....", "....RR......", "YYYYRRYYYYY.", "YYYYRRYYYYY.", ".YYYRRYYYY..", ".YYYRRYYYY..", ".YYYRRYYYY..", ".YYYRRYYYY..", ".YYYRRYYYY..", "............", "............", "............"],
  bandera: ["B...........", "BRRRRRRR....", "BRRRRRRR....", "BRRRRRRR....", "BRRRRRRR....", "B...........", "B...........", "B...........", "B...........", "BB..........", "............", "............"],
};
const PAL_ICONO = { B: "#1E2233", W: "#FFFFFF", R: "#E9493F", Y: "#FFC93C", D: "#B5821A", G: "#3FCF68", L: "#B8F0C6", C: "#2EB8F5", O: "#FF8A2A" };
// dibuja una rejilla de letras como rectángulos (une los del mismo color en fila)
function pixeles(grid, tam, pal, { cx = true } = {}) {
  const w = grid[0].length * tam, h = grid.length * tam, ox = cx ? -w / 2 : 0, oy = cx ? -h / 2 : 0;
  let out = "";
  grid.forEach((fila, j) => {
    let i = 0;
    while (i < fila.length) {
      const ch = fila[i]; if (ch === ".") { i++; continue; }
      let k = i; while (k < fila.length && fila[k] === ch) k++;
      out += `<rect x="${ox + i * tam}" y="${oy + j * tam}" width="${(k - i) * tam + 0.5}" height="${tam + 0.5}" fill="${pal[ch] || ch}"/>`;
      i = k;
    }
  });
  return out;
}
function icono(o, nombre, tam = 14) {
  const g = ICONOS[nombre] || ICONOS.estrella, pal = { ...PAL_ICONO, ...(o.colores || {}) }, base = pixeles(g, tam, pal);
  if (o.piel === "neon") return `<g style="filter:drop-shadow(0 0 ${tam * 0.8}px ${o.brillo || "#2EE6F5"}88)">${base}</g>`;
  if (o.piel === "voxel") return `<g transform="translate(${tam * 0.6} ${tam * 0.6})" opacity="0.35">${pixeles(g, tam, Object.fromEntries(Object.keys(pal).map((k) => [k, "#000"])))}</g>${base}`;
  return `<g transform="translate(${tam * 0.5} ${tam * 0.5})">${pixeles(g, tam, Object.fromEntries(Object.keys(pal).map((k) => [k, "#000"])))}</g>${base}`;
}

// ---------------------------------------------------------------- el personaje (la mascota-cubo: «tú»)
// cara: normal | feliz | triste | sorprendido | dormido | enfadado | guino | asustado · color · gorro: casco | gorra | corona
// gafas: sol | nerd · antena: true · brazo: saluda | arriba · camina: true · habla: true · quieto: true (sin respirar)
function personaje(o) {
  const t = o.t || 0, tl = o.tl ?? t, [b, s, l] = col(o.color || "blanco"), pz = o.piel || "neon", ojo = "#20222B";
  const resp = o.quieto ? 0 : Math.sin(tl * 3.2 + (o.semilla || 0)) * 4;
  const parpadea = !o.quieto && ((tl + (o.semilla || 0) * 0.7) % 3.4) < 0.12;
  const cara = o.cara || "normal";
  const pasos = o.camina ? Math.sin(tl * 12) : 0;
  const W = 190, H = 170, x0 = -W / 2, y0 = -H / 2 - 40 + resp;
  // piernas
  let s1 = `<rect x="-58" y="${y0 + H - 4 - Math.max(0, pasos) * 12}" width="38" height="${52 + Math.max(0, pasos) * 12}" fill="${s}"/>
    <rect x="20" y="${y0 + H - 4 - Math.max(0, -pasos) * 12}" width="38" height="${52 + Math.max(0, -pasos) * 12}" fill="${s}"/>`;
  if (pz === "arcade") s1 = s1.replace(/\/>/g, ` stroke="${OSCURO}" stroke-width="6"/>`);
  // brazos
  const bd = o.brazo === "saluda" ? `<g transform="translate(${W / 2 + 4} ${y0 + 70}) rotate(${-130 + 22 * Math.sin(tl * 9)})"><rect x="0" y="-15" width="58" height="30" fill="${b}"/></g>`
    : o.brazo === "arriba" ? `<rect x="${W / 2 + 2}" y="${y0 - 20}" width="30" height="70" fill="${b}"/>` : `<rect x="${W / 2}" y="${y0 + 82}" width="30" height="30" fill="${b}"/>`;
  const bi = o.brazo === "arriba" ? `<rect x="${-W / 2 - 32}" y="${y0 - 20}" width="30" height="70" fill="${b}"/>` : `<rect x="${-W / 2 - 30}" y="${y0 + 82}" width="30" height="30" fill="${b}"/>`;
  // cuerpo
  const cuerpo = bloque(o, x0, y0, W, H, o.color || "blanco", { prof: 0.2 });
  // ojos y boca
  const ex = [-48, 24], ey = y0 + 52;
  let caraSVG = "";
  const ojoRect = (x, h = 40, w = 24) => `<rect x="${x}" y="${ey + (40 - h) / 2}" width="${w}" height="${h}" fill="${ojo}"/><rect x="${x + 4}" y="${ey + (40 - h) / 2 + 4}" width="7" height="7" fill="#fff" opacity="${h > 12 ? 0.9 : 0}"/>`;
  if (parpadea && !["dormido", "feliz"].includes(cara)) caraSVG = ex.map((x) => `<rect x="${x}" y="${ey + 18}" width="24" height="6" fill="${ojo}"/>`).join("");
  else if (cara === "feliz") caraSVG = ex.map((x) => `<path d="M ${x - 2} ${ey + 30} L ${x + 12} ${ey + 14} L ${x + 26} ${ey + 30}" fill="none" stroke="${ojo}" stroke-width="9" stroke-linejoin="miter"/>`).join("") + `<rect x="-14" y="${ey + 56}" width="28" height="8" fill="${ojo}"/><rect x="-22" y="${ey + 48}" width="8" height="8" fill="${ojo}"/><rect x="14" y="${ey + 48}" width="8" height="8" fill="${ojo}"/>`;
  else if (cara === "triste") caraSVG = ex.map((x, i) => ojoRect(x, 30) + `<rect x="${x - 4}" y="${ey - 14 + (i ? 6 : 0)}" width="32" height="7" fill="${ojo}" transform="rotate(${i ? -18 : 18} ${x + 12} ${ey - 10})"/>`).join("") + `<rect x="-16" y="${ey + 56}" width="32" height="7" fill="${ojo}"/><rect x="-24" y="${ey + 63}" width="8" height="8" fill="${ojo}"/><rect x="16" y="${ey + 63}" width="8" height="8" fill="${ojo}"/>`;
  else if (cara === "sorprendido" || cara === "asustado") caraSVG = ex.map((x) => ojoRect(x - 3, 46, 30)).join("") + `<rect x="-12" y="${ey + 58}" width="24" height="26" fill="${ojo}"/>`;
  else if (cara === "dormido") caraSVG = ex.map((x) => `<rect x="${x}" y="${ey + 20}" width="26" height="7" fill="${ojo}"/>`).join("")
    + [0, 1, 2].map((i) => { const u = ((tl * 0.6 + i / 3) % 1); return `<text x="${W / 2 + 10 + u * 50}" y="${y0 - 10 - u * 90}" font-family="'Press Start 2P'" font-size="${20 + i * 6}" fill="#fff" opacity="${(1 - u).toFixed(2)}">z</text>`; }).join("");
  else if (cara === "enfadado") caraSVG = ex.map((x, i) => ojoRect(x, 30) + `<rect x="${x - 4}" y="${ey - 12}" width="34" height="8" fill="${ojo}" transform="rotate(${i ? 20 : -20} ${x + 12} ${ey - 8})"/>`).join("") + `<rect x="-16" y="${ey + 58}" width="32" height="7" fill="${ojo}"/>`;
  else if (cara === "guino") caraSVG = ojoRect(ex[0]) + `<rect x="${ex[1]}" y="${ey + 18}" width="26" height="7" fill="${ojo}"/><rect x="-14" y="${ey + 56}" width="28" height="7" fill="${ojo}"/>`;
  else caraSVG = ex.map((x) => ojoRect(x)).join("");
  if (o.habla && !["feliz", "triste", "sorprendido", "enfadado"].includes(cara)) { const a = 4 + 14 * Math.abs(Math.sin(tl * 14)); caraSVG += `<rect x="-12" y="${ey + 56}" width="24" height="${a.toFixed(1)}" fill="${ojo}"/>`; }
  if (["feliz", "guino"].includes(cara) || o.mejillas) caraSVG += `<rect x="-78" y="${ey + 44}" width="20" height="12" fill="#FF8FA3" opacity="0.8"/><rect x="58" y="${ey + 44}" width="20" height="12" fill="#FF8FA3" opacity="0.8"/>`;
  if (cara === "asustado") caraSVG += `<rect x="60" y="${ey - 10}" width="10" height="18" fill="#7fd3ff"/><rect x="62" y="${ey + 8}" width="6" height="6" fill="#7fd3ff"/>`;
  // accesorios
  let acc = "";
  if (o.gafas === "sol") acc += `<rect x="-70" y="${ey + 4}" width="140" height="12" fill="${ojo}"/><rect x="-64" y="${ey + 4}" width="56" height="34" fill="${ojo}"/><rect x="10" y="${ey + 4}" width="56" height="34" fill="${ojo}"/><rect x="-56" y="${ey + 10}" width="14" height="6" fill="#fff" opacity="0.5"/>`;
  if (o.gafas === "nerd") acc += `<rect x="-66" y="${ey - 4}" width="56" height="50" fill="none" stroke="${ojo}" stroke-width="8"/><rect x="8" y="${ey - 4}" width="56" height="50" fill="none" stroke="${ojo}" stroke-width="8"/><rect x="-12" y="${ey + 14}" width="22" height="7" fill="${ojo}"/>`;
  if (o.gorro === "casco") acc += `<path d="M ${-W / 2 + 12} ${y0 + 4} L ${-W / 2 + 12} ${y0 - 30} Q 0 ${y0 - 78} ${W / 2 - 12} ${y0 - 30} L ${W / 2 - 12} ${y0 + 4} Z" fill="#FFC93C"/><rect x="${-W / 2 - 4}" y="${y0 - 6}" width="${W + 8}" height="16" fill="#D9A01C"/><rect x="-10" y="${y0 - 66}" width="20" height="60" fill="#FFE27C"/>`;
  if (o.gorro === "gorra") acc += `<rect x="${-W / 2 + 6}" y="${y0 - 34}" width="${W - 12}" height="40" fill="${col(o.colorGorro || "rojo")[0]}"/><rect x="${-W / 2 + 6}" y="${y0 - 2}" width="${W + 40}" height="14" fill="${col(o.colorGorro || "rojo")[1]}"/>`;
  if (o.gorro === "corona") acc += pixeles(["Y..Y..Y..Y", "YY.YYYY.YY", "YYYYYYYYYY", "YRYYGYYRYY", "YYYYYYYYYY"], 14, PAL_ICONO).replace(/<rect x="(-?[\d.]+)" y="(-?[\d.]+)"/g, (m, x, y) => `<rect x="${x}" y="${(+y + y0 - 46).toFixed(1)}"`);
  if (o.antena) acc += `<rect x="-4" y="${y0 - 56}" width="8" height="56" fill="${s}"/><rect x="-14" y="${y0 - 80}" width="28" height="28" fill="#2EE6F5" style="filter:drop-shadow(0 0 10px #2EE6F5)"/>`;
  return `${sombraPiso(y0 + H + 48 - resp, 120, o)}${s1}${bi}${cuerpo}${bd}${caraSVG}${acc}`;
}

// el robot (la IA): cabeza con pantalla y ojos de luz. cara: normal | feliz | error | dormido | corazon · brilla 0-1
function robot(o) {
  const tl = o.tl ?? o.t ?? 0, [b, s, l] = col(o.color || "azul"), br = lim(o.brilla ?? 1), luz = o.luz || "#5FF2FF", resp = o.quieto ? 0 : Math.sin(tl * 2.6) * 5;
  const y0 = -170 + resp, cara = o.cara || "normal", parp = ((tl + 1.3) % 3.8) < 0.12 && cara === "normal";
  const ojo = (x) => cara === "error" ? `<path d="M ${x - 20} ${y0 + 66} l 40 40 m 0 -40 l -40 40" stroke="#FF3B5C" stroke-width="10"/>`
    : cara === "feliz" ? `<path d="M ${x - 22} ${y0 + 100} L ${x} ${y0 + 76} L ${x + 22} ${y0 + 100}" fill="none" stroke="${luz}" stroke-width="11"/>`
    : cara === "dormido" ? `<rect x="${x - 22}" y="${y0 + 86}" width="44" height="9" fill="${luz}" opacity="0.6"/>`
    : cara === "corazon" ? pixeles(ICONOS.corazon.slice(1, 10), 4.5, PAL_ICONO).replace(/<rect x="(-?[\d.]+)" y="(-?[\d.]+)"/g, (m, xx, yy) => `<rect x="${(+xx + x).toFixed(1)}" y="${(+yy + y0 + 88).toFixed(1)}"`)
    : `<rect x="${x - 22}" y="${y0 + (parp ? 86 : 66)}" width="44" height="${parp ? 8 : 44}" fill="${luz}"/>`;
  return `${sombraPiso(150, 130, o)}
    <rect x="-6" y="${y0 - 52}" width="12" height="52" fill="${s}"/><rect x="-16" y="${y0 - 76}" width="32" height="28" fill="${luz}" opacity="${0.5 + 0.5 * Math.abs(Math.sin(tl * 3))}" style="filter:drop-shadow(0 0 12px ${luz})"/>
    ${bloque(o, -120, y0, 240, 180, o.color || "azul")}
    <rect x="-96" y="${y0 + 32}" width="192" height="116" fill="#141A33"/>
    <g style="filter:drop-shadow(0 0 ${14 * br}px ${luz})" opacity="${0.4 + 0.6 * br}">${ojo(-44)}${ojo(44)}</g>
    ${bloque(o, -80, y0 + 190, 160, 100, o.color || "azul")}
    <rect x="-22" y="${y0 + 218}" width="44" height="44" fill="${luz}" opacity="${0.5 + 0.5 * br}" style="filter:drop-shadow(0 0 ${16 * br}px ${luz})"/>
    <rect x="-150" y="${y0 + 200}" width="56" height="34" fill="${s}"/><rect x="94" y="${y0 + 200}" width="56" height="34" fill="${s}"/>
    <rect x="-60" y="${y0 + 290}" width="40" height="${30 - resp}" fill="${s}"/><rect x="20" y="${y0 + 290}" width="40" height="${30 - resp}" fill="${s}"/>`;
}

// ---------------------------------------------------------------- texto de juego (adaptado a la piel)
// letrero: un rótulo en la letra de la piel. estilo: caja (por defecto) | plano | pildora | sello
function letrero(o) {
  const p = P(o), pz = o.piel || "neon", tx = o.texto || "TEXTO", tam = o.tamano || (pz === "arcade" ? 30 : pz === "voxel" ? 44 : 34), c = o.tinta || (o.color ? col(o.color)[0] : p.acento), estilo = o.estilo || "caja";
  let css;
  if (estilo === "plano") css = pz === "voxel" ? `color:${o.tinta || "#fff"};-webkit-text-stroke:${tam * 0.18}px ${p.tinta};paint-order:stroke fill;font:${tam}px 'Lilita One'` : pz === "arcade" ? `color:${c};font:${tam}px 'Press Start 2P';text-shadow:4px 4px 0 #000` : `color:${c};font:700 ${tam}px 'Space Mono';letter-spacing:2px;text-shadow:0 0 14px ${c}`;
  else if (estilo === "sello") css = `background:${o.fondo || p.verde};color:${p.tinta};font:${pz === "arcade" ? `${tam}px 'Press Start 2P'` : pz === "voxel" ? `${tam}px 'Lilita One'` : `800 ${tam}px Poppins`};padding:${tam * 0.35}px ${tam * 0.6}px;border:5px solid ${p.tinta};transform:rotate(${o.giro ?? -8}deg);box-shadow:5px 5px 0 ${p.tinta}`;
  else if (pz === "voxel") css = `background:${o.fondo || "#fff"};color:${p.tinta};font:${tam}px 'Lilita One';padding:${tam * 0.18}px ${tam * 0.55}px;border-radius:${estilo === "pildora" ? tam : tam * 0.35}px;border:4px solid ${p.tinta};box-shadow:0 6px 0 ${p.tinta};text-transform:uppercase`;
  else if (pz === "arcade") css = `background:${o.fondo || "#000"};color:${c};font:${tam}px 'Press Start 2P';padding:${tam * 0.55}px ${tam * 0.7}px;border:5px solid ${o.fondo ? p.tinta : "#fff"};text-transform:uppercase`;
  else css = `background:${o.fondo || "rgba(9,14,22,.9)"};color:${c};font:700 ${tam}px 'Space Mono';letter-spacing:2px;padding:${tam * 0.22}px ${tam * 0.6}px;border:3px solid ${c};border-radius:${estilo === "pildora" ? tam : 10}px;box-shadow:0 0 18px ${c}66;text-transform:uppercase`;
  return html(-500, -150, 1000, 300, `<span style="${css};white-space:pre-line;text-align:center;display:inline-block;line-height:1.15">${esc(tx)}</span>`, "display:flex;align-items:center;justify-content:center");
}
// cifra: un número grande que corre (valor se anima con params), en la letra de la piel
function cifra(o) {
  const p = P(o), pz = o.piel || "neon", v = Number(o.valor ?? 0), d = o.decimales ?? 0;
  const tx = `${o.antes || ""}${v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })}${o.despues || ""}`, tam = o.tamano || (pz === "arcade" ? 90 : 170), c = o.tinta || (o.color ? col(o.color)[0] : pz === "arcade" ? p.rojo : p.acento);
  if (pz === "voxel") return texto(0, tam * 0.35, tx, { tam, color: c, f: "Lilita One", peso: 400, borde: p.tinta, bw: tam * 0.12 });
  if (pz === "arcade") return `<g>${texto(6, tam * 0.4 + 6, tx, { tam, color: "#000", f: "Press Start 2P", peso: 400 })}${texto(0, tam * 0.4, tx, { tam, color: c, f: "Press Start 2P", peso: 400 })}</g>`;
  return `<g style="filter:drop-shadow(0 0 18px ${c}aa)">${texto(0, tam * 0.35, tx, { tam, color: c, f: "Poppins", peso: 800 })}</g>`;
}
// dialogo: un globo con texto (cola: abajo | izq | der)
function dialogo(o) {
  const p = P(o), pz = o.piel || "neon", tam = o.tamano || (pz === "arcade" ? 24 : 40);
  const css = pz === "arcade" ? `background:#fff;color:#000;font:${tam}px 'Press Start 2P';padding:20px 26px;border:6px solid #000;box-shadow:6px 6px 0 #000`
    : pz === "voxel" ? `background:#fff;color:${p.tinta};font:${tam}px 'Lilita One';padding:14px 28px;border:5px solid ${p.tinta};border-radius:26px;box-shadow:0 7px 0 ${p.tinta}`
    : `background:#0d1520;color:#fff;font:700 ${tam}px 'Space Mono';padding:14px 24px;border:3px solid ${p.acento};border-radius:14px;box-shadow:0 0 18px ${p.acento}55`;
  const cx = o.cola === "izq" ? -120 : o.cola === "der" ? 120 : 0, cc = pz === "neon" ? p.acento : pz === "voxel" ? p.tinta : "#000";
  return html(-480, -170, 960, 300, `<span style="${css};display:inline-block;text-align:center;line-height:1.2;max-width:820px">${esc(o.texto || "¡Hola!")}</span>`, "display:flex;align-items:flex-end;justify-content:center")
    + `<path d="M ${cx - 22} 128 L ${cx} 166 L ${cx + 22} 128 Z" fill="${pz === "neon" ? "#0d1520" : "#fff"}" stroke="${cc}" stroke-width="5"/>`;
}
// cta: el cierre de «Comenta "PALABRA" y te paso…»
function cta(o) {
  const p = P(o), pz = o.piel || "neon", pal = esc(o.palabra || "IA"), tx = esc(o.texto || ""), bt = o.boton ? esc(o.boton) : "";
  if (pz === "voxel") return html(-460, -230, 920, 460, `<div style="background:#fff;border:7px solid ${p.tinta};border-radius:36px;box-shadow:0 12px 0 ${p.tinta};padding:30px 34px;text-align:center;color:${p.tinta}">
      <div style="font:78px/1 'Lilita One'">Comenta <span style="color:#3A6BFF">"${pal}"</span></div>${tx ? `<div style="font:38px/1.15 'Lilita One';margin-top:16px">${tx}</div>` : ""}
      ${bt ? `<div style="display:inline-block;margin-top:20px;background:#3A6BFF;color:#fff;font:30px 'Lilita One';padding:8px 26px;border-radius:30px">${bt}</div>` : ""}</div>`, "display:flex;align-items:center;justify-content:center");
  if (pz === "arcade") return html(-460, -230, 920, 460, `<div style="background:#fff;border:8px solid #000;box-shadow:10px 10px 0 #000;padding:34px 30px;text-align:center;color:#000">
      <div style="font:46px/1.4 'Press Start 2P'">COMENTA<br/>"${pal}"</div>${tx ? `<div style="font:700 30px/1.3 'Space Mono';margin-top:14px">${tx}</div>` : ""}</div>`, "display:flex;align-items:center;justify-content:center");
  // neón: una tarjeta de comentario con su corazón
  const u = lim(((o.tl ?? 1) - 0.4) / 0.3);
  return html(-440, -150, 880, 300, `<div style="background:#101826;border:3px solid #283444;border-radius:20px;padding:24px 30px;display:flex;align-items:center;gap:22px;box-shadow:0 0 30px rgba(46,230,245,.12)">
      <div style="width:76px;height:76px;border-radius:50%;background:#2b3646;display:flex;align-items:center;justify-content:center;font:800 34px Poppins;color:#8a97a8">TÚ</div>
      <div style="flex:1"><div style="font:700 22px 'Space Mono';color:#8a97a8">${esc(o.nombre || "TÚ · ahora")}</div><div style="font:800 64px/1.05 Poppins;color:#fff">${pal}</div></div>
      <div style="font:58px Poppins;color:${p.rojo};transform:scale(${(1 + 0.4 * Math.sin(Math.PI * u)).toFixed(2)})">&#9829;</div></div>
      ${tx ? `<div style="text-align:center;margin-top:18px;font:700 34px Poppins;color:#fff">${tx}</div>` : ""}`);
}
// barra: una barra de progreso con etiqueta y cuenta («BANDEJA DE ENTRADA · 40 SIN LEER»): valor 0-1 (se anima)
function barra(o) {
  const p = P(o), pz = o.piel || "neon", v = lim(o.valor ?? 0.5), w = o.ancho || 760, c = o.tinta || (o.color ? col(o.color)[0] : v > 0.66 ? p.rojo : p.acento);
  const fnt = pz === "arcade" ? `20px 'Press Start 2P'` : pz === "voxel" ? `34px 'Lilita One'` : `700 26px 'Space Mono'`;
  return html(-w / 2, -70, w, 140, `<div style="display:flex;justify-content:space-between;font:${fnt};color:#fff;margin-bottom:12px;text-transform:uppercase;${pz === "voxel" ? `-webkit-text-stroke:6px ${p.tinta};paint-order:stroke fill` : ""}"><span>${esc(o.texto || "")}</span><span style="color:${c}">${esc(o.cuenta || "")}</span></div>
    <div style="height:40px;border:${pz === "arcade" ? "5px solid #fff" : pz === "voxel" ? `5px solid ${p.tinta}` : `3px solid #283444`};border-radius:${pz === "arcade" ? 0 : 12}px;background:${pz === "voxel" ? "#fff" : "#0a0f18"};padding:4px;box-sizing:border-box">
    <div style="height:100%;width:${(v * 100).toFixed(1)}%;background:${c};border-radius:${pz === "arcade" ? 0 : 7}px;${pz === "neon" ? `box-shadow:0 0 14px ${c}` : ""}"></div></div>`);
}

// ---------------------------------------------------------------- las piezas
export const PIEZAS_JUEGO = {
  // personajes
  personaje, robot,
  // texto y marcadores
  letrero, cifra, dialogo, cta, barra,
  icono(o) { return icono(o, o.nombre || "estrella", o.tam || 16); },
  muchos(o) { // muchos iconos en rejilla: icono, n (se anima), columnas, separa
    const n = Math.round(o.n ?? 12), c = o.columnas || 6, sep = o.separa || 120, filas = Math.ceil(n / c);
    return Array.from({ length: n }, (_, i) => `<g transform="translate(${((i % c) - (c - 1) / 2) * sep} ${(Math.floor(i / c) - (filas - 1) / 2) * sep * 0.85})">${icono(o, o.icono || "correo", o.tam || 7)}</g>`).join("");
  },
  sello(o) { return letrero({ ...o, estilo: "sello" }); },
  rayos(o) { // un sol de rayos que gira detrás de lo importante
    const c = o.tinta || (o.color ? col(o.color)[0] : P(o).acento), n = o.n || 14, R = o.radio || 700, g = (o.tl ?? 0) * (o.gira ?? 0.25);
    return Array.from({ length: n }, (_, i) => { const a0 = (i * 2 * Math.PI) / n + g, a1 = a0 + Math.PI / n; return `<path d="M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} L ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z" fill="${c}" opacity="${o.opacidadRayos ?? 0.28}"/>`; }).join("");
  },
  confeti(o) { // píxeles de colores que caen (una celebración)
    const cs = ["#FFC93C", "#2EE6F5", "#F58BB0", "#45C46A", "#8B5CF6", "#F07A3E"], tl = o.tl ?? 0, n = o.n || 40;
    return Array.from({ length: n }, (_, i) => { const x = ((i * 157) % 1000) - 500, y = -700 + ((tl * (260 + (i % 5) * 60) + (i * 97) % 300)) % 1400, r = (tl * 200 + i * 40) % 360; return `<rect x="${x}" y="${y.toFixed(1)}" width="18" height="12" fill="${cs[i % cs.length]}" transform="rotate(${r} ${x + 9} ${y + 6})"/>`; }).join("");
  },
  explosion(o) { // un estallido de píxeles (al entrar)
    const u = lim((o.tl ?? 0) / 0.6), c = o.tinta || P(o).amarillo;
    return Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, r = 40 + 260 * u, s = 26 * (1 - u) + 4; return `<rect x="${(r * Math.cos(a) - s / 2).toFixed(1)}" y="${(r * Math.sin(a) - s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${i % 2 ? c : "#fff"}" opacity="${(1 - u * 0.8).toFixed(2)}"/>`; }).join("")
      + `<rect x="${-70 * (1 - u)}" y="${-70 * (1 - u)}" width="${140 * (1 - u)}" height="${140 * (1 - u)}" fill="#fff" opacity="${1 - u}"/>`;
  },

  // ------------------------------------------------ objetos de interfaz (sirven en las tres pieles; brillan en neón)
  ventana(o) { // un panel con barra de título: titulo, texto, lineas, ancho, alto
    const p = P(o), w = o.ancho || 560, h = o.alto || 360, c = o.tinta || (o.color ? col(o.color)[0] : p.acento), pz = o.piel;
    const marco = pz === "voxel" ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="20" fill="#fff" stroke="${p.tinta}" stroke-width="7"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="52" rx="20" fill="${c}" stroke="${p.tinta}" stroke-width="7"/>`
      : pz === "arcade" ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#05061A" stroke="#fff" stroke-width="7"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="50" fill="${c}"/>`
      : neonCaja(-w / 2, -h / 2, w, h, c) + `<rect x="${-w / 2 + 2}" y="${-h / 2 + 2}" width="${w - 4}" height="48" rx="12" fill="${c}" opacity="0.14"/>`;
    const tc = pz === "voxel" ? "#fff" : pz === "arcade" ? "#000" : c;
    return `${marco}${[0, 1, 2].map((i) => `<rect x="${-w / 2 + 22 + i * 26}" y="${-h / 2 + 17}" width="16" height="16" rx="${pz === "arcade" ? 0 : 8}" fill="${["#FF5F57", "#FFBD2E", "#28C840"][i]}"/>`).join("")}
      ${o.titulo ? texto(w / 2 - 22, -h / 2 + 34, o.titulo, { tam: 20, color: tc, ancla: "end", sp: 1 }) : ""}
      ${o.texto ? html(-w / 2 + 20, -h / 2 + 60, w - 40, h - 80, `<div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;font:${pz === "arcade" ? "34px 'Press Start 2P'" : pz === "voxel" ? "54px 'Lilita One'" : "800 54px Poppins"};color:${pz === "voxel" ? p.tinta : "#fff"};line-height:1.15">${esc(o.texto)}</div>`)
        : Array.from({ length: o.lineas ?? 3 }, (_, i) => `<rect x="${-w / 2 + 40}" y="${-h / 2 + 90 + i * 52}" width="${(w - 80) * [0.85, 0.6, 0.72, 0.5][i % 4]}" height="18" rx="9" fill="${pz === "voxel" ? "#d9d3c4" : "#2b3646"}"/>`).join("")}`;
  },
  terminal(o) { // una consola que escribe: texto (\n = otra línea), escribe 0-1 (por defecto, a 26 letras/s desde que entra)
    const p = P(o), w = o.ancho || 640, h = o.alto || 300, todo = String(o.texto || "> hola"), tl = o.tl ?? 9;
    const n = o.escribe !== undefined ? Math.round(lim(o.escribe) * todo.length) : Math.floor(tl * (o.velocidad || 26));
    const vis = todo.slice(0, n), cur = Math.floor((o.t || 0) * 2.5) % 2 ? "█" : " ";
    const c = o.tinta || (o.piel === "arcade" ? "#fff" : p.acento);
    const marco = o.piel === "arcade" ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#000" stroke="#fff" stroke-width="6"/>` : o.piel === "voxel" ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#1B2433" stroke="${p.tinta}" stroke-width="7"/>` : neonCaja(-w / 2, -h / 2, w, h, c, { brillo: 0.8 });
    return `${marco}${[0, 1, 2].map((i) => `<circle cx="${-w / 2 + 26 + i * 24}" cy="${-h / 2 + 24}" r="7" fill="${["#FF5F57", "#FFBD2E", "#28C840"][i]}"/>`).join("")}
      ${o.titulo ? texto(-w / 2 + 110, -h / 2 + 31, o.titulo, { tam: 20, color: "#8a97a8", ancla: "start" }) : ""}
      ${html(-w / 2 + 26, -h / 2 + 50, w - 52, h - 64, `<div style="font:700 ${o.tamano || 30}px/1.35 'Space Mono';color:#e9f4ff;white-space:pre-wrap;word-break:break-word">${esc(vis).replace(/^(&gt;|\$)/gm, `<span style="color:${c}">$1</span>`)}<span style="color:${c}">${cur}</span></div>`)}`;
  },
  edificio(o) { // una torre de servidores: pisos, columnas, resalta (n.º de ventana), placa (texto: una IP), cartel (arriba), base (abajo)
    const p = P(o), pisos = o.pisos || 6, cols = o.columnas || 3, w = o.ancho || 300, h = o.alto || 440, c = o.tinta || p.acento, t = o.t || 0, pz = o.piel;
    const vw = (w - 40 - (cols - 1) * 14) / cols, vh = (h - 120 - (pisos - 1) * 14) / pisos;
    const vent = Array.from({ length: pisos * cols }, (_, i) => {
      const x = -w / 2 + 20 + (i % cols) * (vw + 14), y = -h / 2 + 24 + Math.floor(i / cols) * (vh + 14), on = i === o.resalta;
      const leds = [0, 1, 2].map((k) => `<rect x="${x + 8 + k * 11}" y="${y + 8}" width="7" height="7" fill="${(i * 7 + k * 3) % 5 === 0 ? "#3BF58C" : c}" opacity="${((i * 13 + k * 7 + Math.floor(t * 3)) % 4) ? 0.85 : 0.2}"/>`).join("");
      return `<rect x="${x}" y="${y}" width="${vw}" height="${vh}" rx="${pz === "arcade" ? 0 : 5}" fill="${on ? c : pz === "voxel" ? "#2a3550" : "#141c29"}" stroke="${on ? c : pz === "voxel" ? p.tinta : "#2a3646"}" stroke-width="3" ${on ? `style="filter:drop-shadow(0 0 12px ${c})"` : ""}/>${on ? "" : leds}<rect x="${x + 8}" y="${y + vh - 14}" width="${vw - 16}" height="5" fill="#2f3b4d"/>`;
    }).join("");
    const cuerpo = pz === "voxel" ? bloque(o, -w / 2, -h / 2, w, h, "gris", { prof: 0.12 }) : pz === "arcade" ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#1a2266" stroke="#fff" stroke-width="6"/>` : neonCaja(-w / 2, -h / 2, w, h, c, { r: 8, relleno: "#0e1724" });
    return `${sombraPiso(h / 2 + 6, w * 0.6, o)}${cuerpo}${vent}<rect x="-34" y="${h / 2 - 80}" width="68" height="80" fill="${pz === "voxel" ? "#2a3550" : "#0a0f18"}" stroke="${pz === "neon" ? "#2a3646" : p.tinta}" stroke-width="3"/>
      ${o.placa ? `<rect x="${-w / 2 + 10}" y="${h / 2 - 150}" width="${w - 20}" height="52" rx="8" fill="#FFF8E7" stroke="${p.acento}" stroke-width="3"/>${texto(0, h / 2 - 113, o.placa, { tam: 26, color: "#14161F" })}` : ""}
      ${o.cartel ? `<rect x="${-w / 2 + 10}" y="${-h / 2 - 54}" width="${w - 20}" height="58" rx="6" fill="${p.rojo}"/>${texto(0, -h / 2 - 14, o.cartel, { tam: 30, color: "#fff", f: fuente(o) === "Lilita One" ? "Lilita One" : "Space Mono" })}` : ""}
      ${o.base ? `<rect x="${-w / 2 - 30}" y="${h / 2 + 2}" width="${w + 60}" height="50" rx="6" fill="#0d1520" stroke="${c}" stroke-width="4"/>${texto(0, h / 2 + 38, o.base, { tam: 28, color: c })}` : ""}`;
  },
  servidor(o) { // una caja de servidor pequeña con luces que parpadean: filas
    const p = P(o), n = o.filas || 3, t = o.t || 0, c = o.tinta || p.acento, w = 260, h = n * 56 + 30;
    return `${o.piel === "neon" ? neonCaja(-w / 2, -h / 2, w, h, c, { r: 12 }) : bloque(o, -w / 2, -h / 2, w, h, "negro")}
      ${Array.from({ length: n }, (_, i) => `<rect x="${-w / 2 + 18}" y="${-h / 2 + 18 + i * 56}" width="${w - 36}" height="42" rx="6" fill="#141c29" stroke="#2a3646" stroke-width="2"/>
        ${[0, 1, 2].map((k) => `<circle cx="${-w / 2 + 40 + k * 22}" cy="${-h / 2 + 39 + i * 56}" r="6" fill="${k === 2 ? "#3BF58C" : c}" opacity="${(Math.floor(t * 4 + i * 3 + k) % 3) ? 1 : 0.25}"/>`).join("")}
        <rect x="${-w / 2 + 120}" y="${-h / 2 + 34 + i * 56}" width="100" height="8" rx="4" fill="#2f3b4d"/>`).join("")}`;
  },
  puerta(o) { // una entrada con candado: cartel (arriba), abierto 0-1
    const p = P(o), a = lim(o.abierto ?? 0), pz = o.piel, c = p.acento;
    const marco = pz === "neon" ? `<rect x="-200" y="-170" width="400" height="340" rx="8" fill="#121a26" stroke="#2a3646" stroke-width="4"/>` : bloque(o, -200, -170, 400, 340, pz === "voxel" ? "gris" : "negro", { prof: 0.08 });
    return `${marco}<rect x="-80" y="-110" width="160" height="280" fill="#0b1119" stroke="${pz === "neon" ? "#2a3646" : p.tinta}" stroke-width="4"/>
      <rect x="-80" y="-110" width="${160 * (1 - a * 0.85)}" height="280" fill="${pz === "voxel" ? "#8a5a3a" : "#1a2433"}" stroke="${pz === "neon" ? "#34445a" : p.tinta}" stroke-width="4"/>
      <g transform="translate(${36 - a * 100} 40) scale(0.9)">${PIEZAS_JUEGO.candado({ ...o, abierto: a })}</g>
      ${o.cartel ? `<g transform="translate(0 -150)">${letrero({ ...o, texto: o.cartel, tamano: 30 })}</g>` : ""}`;
  },
  candado(o) { // abierto 0-1
    const a = lim(o.abierto ?? 0), p = P(o);
    return `<path d="M -34 -10 L -34 -48 Q -34 -84 0 -84 Q 34 -84 34 -48 L 34 ${-10 - a * 30}" transform="translate(0 ${-a * 26})" fill="none" stroke="${o.piel === "neon" ? "#c9a227" : "#9AA3AE"}" stroke-width="13"/>
      <rect x="-52" y="-14" width="104" height="84" rx="${o.piel === "arcade" ? 0 : 10}" fill="${p.amarillo}" ${o.piel === "neon" ? `style="filter:drop-shadow(0 0 14px ${p.amarillo}88)"` : `stroke="${P(o).tinta}" stroke-width="${o.piel === "voxel" ? 5 : 6}"`}/>
      <circle cx="0" cy="18" r="11" fill="#5a3d00"/><rect x="-5" y="20" width="10" height="26" fill="#5a3d00"/>`;
  },
  llave(o) {
    const p = P(o);
    return `<g ${o.piel === "neon" ? `style="filter:drop-shadow(0 0 14px ${p.amarillo}aa)"` : ""}><circle cx="-80" cy="0" r="46" fill="none" stroke="${p.amarillo}" stroke-width="26"/><rect x="-36" y="-13" width="170" height="26" fill="${p.amarillo}"/><rect x="92" y="10" width="20" height="34" fill="${p.amarillo}"/><rect x="122" y="10" width="14" height="24" fill="${p.amarillo}"/></g>`;
  },
  chip(o) { // un campo pequeño: sub (arriba, en gris), texto (grande); activo: brilla
    const p = P(o), c = o.activo === false ? "#3a4656" : o.tinta || p.acento, pz = o.piel;
    const fs = pz === "arcade" ? `24px 'Press Start 2P'` : pz === "voxel" ? `40px 'Lilita One'` : `700 34px 'Space Mono'`;
    return html(-300, -100, 600, 200, `<div style="display:inline-block;padding:12px 22px;border:3px solid ${c};border-radius:${pz === "arcade" ? 0 : 12}px;background:${pz === "voxel" ? "#fff" : "#0d1520"};${o.activo !== false && pz === "neon" ? `box-shadow:0 0 18px ${c}66` : ""};text-align:center">
      ${o.sub ? `<div style="font:700 18px 'Space Mono';color:${pz === "voxel" ? "#6b7280" : "#8a97a8"};letter-spacing:2px;margin-bottom:6px">${esc(o.sub)}</div>` : ""}<div style="font:${fs};color:${pz === "voxel" ? p.tinta : c};letter-spacing:3px">${esc(o.texto || "••••••")}</div></div>`,
      "display:flex;align-items:center;justify-content:center");
  },
  pulso(o) { // monitor de vida: titulo, estado vivo | muerto
    const p = P(o), vivo = (o.estado || "vivo") !== "muerto", c = vivo ? p.verde : p.rojo, t = o.t || 0, w = 340;
    const pts = Array.from({ length: 40 }, (_, i) => { const x = -w / 2 + 20 + i * ((w - 40) / 39); const f = ((i / 39) * 2 + t * 1.2) % 1; const y = vivo ? (f > 0.45 && f < 0.5 ? -38 : f > 0.5 && f < 0.55 ? 30 : f > 0.55 && f < 0.6 ? -10 : 0) : 0; return `${x.toFixed(1)},${(y + 26).toFixed(1)}`; }).join(" ");
    return `${neonCaja(-w / 2, -70, w, 140, c, { r: 10, ancho: 3, brillo: 0.7 })}${texto(-w / 2 + 18, -36, (o.titulo || "AGENTE") + "  •  " + (vivo ? (o.vivo || "VIVO") : (o.muerto || "MUERTO")), { tam: 20, color: c, ancla: "start", sp: 1 })}
      <polyline points="${pts}" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px ${c})"/>`;
  },
  dispositivo(o) { // celular | laptop | monitor | tablet: pantalla (texto)
    const p = P(o), c = o.tinta || p.acento, tipo = o.tipo || "celular", pz = o.piel;
    const marco = (x, y, w, h, r) => pz === "neon" ? neonCaja(x, y, w, h, c, { r, ancho: 4, brillo: 0.6 }) : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${pz === "arcade" ? 0 : r}" fill="#1B2433" stroke="${pz === "arcade" ? "#fff" : p.tinta}" stroke-width="6"/>`;
    const pant = (x, y, w, h) => o.pantalla ? html(x, y, w, h, `<div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;font:${pz === "arcade" ? "22px 'Press Start 2P'" : pz === "voxel" ? "36px 'Lilita One'" : "700 28px 'Space Mono'"};color:#fff">${esc(o.pantalla)}</div>`) : `<rect x="${x + w * 0.15}" y="${y + h * 0.3}" width="${w * 0.7}" height="10" rx="5" fill="${c}" opacity="0.6"/><rect x="${x + w * 0.15}" y="${y + h * 0.5}" width="${w * 0.45}" height="10" rx="5" fill="${c}" opacity="0.4"/>`;
    if (tipo === "laptop") return `${marco(-170, -130, 340, 220, 12)}${pant(-150, -112, 300, 184)}<path d="M -210 100 L 210 100 L 190 130 L -190 130 Z" fill="${pz === "neon" ? "#0d1520" : "#9AA3AE"}" stroke="${pz === "neon" ? c : p.tinta}" stroke-width="4"/>`;
    if (tipo === "monitor") return `${marco(-200, -150, 400, 260, 10)}${pant(-180, -130, 360, 220)}<rect x="-20" y="110" width="40" height="50" fill="#2b3646"/><rect x="-80" y="156" width="160" height="14" fill="#2b3646"/>`;
    if (tipo === "tablet") return `${marco(-140, -190, 280, 380, 22)}${pant(-120, -160, 240, 320)}`;
    return `${marco(-90, -170, 180, 340, 26)}${pant(-72, -140, 144, 270)}<rect x="-24" y="-158" width="48" height="8" rx="4" fill="#2b3646"/>`;
  },
  linea(o) { // una línea de puntos de (0,0) a (dx,dy) que se dibuja (dibuja 0-1) con un punto que viaja
    const c = o.tinta || P(o).acento, dx = o.dx ?? 300, dy = o.dy ?? 0, u = lim(o.dibuja ?? 1), L = Math.hypot(dx, dy), f = ((o.t || 0) * 0.8) % 1;
    return `<path d="M 0 0 L ${dx * u} ${dy * u}" stroke="${c}" stroke-width="5" stroke-dasharray="14 12" opacity="0.8"/>${o.punto !== false && u >= 1 ? `<circle cx="${dx * f}" cy="${dy * f}" r="9" fill="${c}" style="filter:drop-shadow(0 0 8px ${c})"/>` : ""}${L ? "" : ""}`;
  },
  balanza(o) { // inclina -1..1 (positivo: pesa más la izquierda), izq, der (etiquetas)
    const p = P(o), a = (o.inclina ?? 0) * 14, c = o.piel === "neon" ? "#9aa3ae" : p.tinta, rad = (a * Math.PI) / 180;
    const plato = (x, et) => { const yy = x * Math.sin(rad); return `<g transform="translate(${x * Math.cos(rad)} ${yy - 120})"><path d="M -10 0 L -90 110 M 10 0 L 90 110" stroke="${c}" stroke-width="4"/><rect x="-110" y="108" width="220" height="16" rx="8" fill="${c}"/>${et ? `<g transform="translate(0 80)">${letrero({ ...o, texto: et, tamano: 22, estilo: "plano" })}</g>` : ""}</g>`; };
    return `<rect x="-10" y="-120" width="20" height="300" fill="${c}"/><rect x="-90" y="170" width="180" height="20" fill="${c}"/><g transform="rotate(${a} 0 -120)"><rect x="-260" y="-128" width="520" height="16" rx="8" fill="${c}"/></g>${plato(-250, o.izq)}${plato(250, o.der)}<circle cx="0" cy="-120" r="16" fill="${c}"/>`;
  },
  esfera(o) { // un reloj de aguja: hora 0-12 (se anima) o gira: true (vueltas rápidas, «el tiempo pasa»)
    const p = P(o), h = o.gira ? ((o.tl ?? 0) * 3) % 12 : o.hora ?? 3, a = (h / 12) * 360 - 90, r = 130;
    return `<circle r="${r}" fill="${o.piel === "voxel" ? "#fff" : "#141c29"}" stroke="${o.piel === "neon" ? "#3a4656" : p.tinta}" stroke-width="8"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="-3" y="${-r + 14}" width="6" height="${i % 3 ? 10 : 20}" fill="${o.piel === "voxel" ? p.tinta : "#5b6676"}" transform="rotate(${i * 30})"/>`).join("")}
      <rect x="0" y="-5" width="${r * 0.72}" height="10" rx="5" fill="${o.piel === "voxel" ? p.rojo : "#fff"}" transform="rotate(${a})"/><circle r="12" fill="${p.acento}"/>`;
  },
  temporizador(o) { // un círculo que cuenta: segundos (se anima), total
    const p = P(o), s = Math.max(0, o.segundos ?? 59), tot = o.total || 60, u = lim(s / tot), r = 110, L = 2 * Math.PI * r;
    const tx = `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    return `<circle r="${r + 16}" fill="${o.piel === "voxel" ? "#fff" : "#0d1520"}" stroke="${o.piel === "neon" ? "#2a3646" : p.tinta}" stroke-width="6"/>
      <circle r="${r}" fill="none" stroke="${s < tot * 0.2 ? p.rojo : p.acento}" stroke-width="14" stroke-dasharray="${(L * u).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90)"/>
      ${texto(0, 20, tx, { tam: o.piel === "arcade" ? 40 : 62, color: o.piel === "voxel" ? p.tinta : "#fff", f: o.piel === "arcade" ? "Press Start 2P" : o.piel === "voxel" ? "Lilita One" : "Space Mono", peso: o.piel === "neon" ? 700 : 400 })}`;
  },
  paquete(o) { // una caja de cartón con cinta: abierto 0-1
    const a = lim(o.abierto ?? 0), p = P(o);
    return `${sombraPiso(110, 170, o)}${bloque(o, -150, -60, 300, 170, "marron")}<rect x="-20" y="-60" width="40" height="170" fill="${p.acento}"/>
      <g transform="rotate(${-a * 70} -150 -60)">${bloque(o, -160, -100, 320, 44, "marron")}<rect x="-20" y="-100" width="40" height="44" fill="${p.acento}"/></g>`;
  },
  libros(o) { // una fila de libros de colores (una biblioteca): n, texto (debajo)
    const p = P(o), n = o.n || 6, cs = ["#3A6BFF", "#2EE6F5", "#FFC93C", "#45C46A", "#F07A3E", "#F58BB0", "#8B5CF6"], w = 52;
    return Array.from({ length: n }, (_, i) => { const h = 200 + ((i * 37) % 60); return `<rect x="${-n * w / 2 + i * w}" y="${100 - h}" width="${w - 6}" height="${h}" fill="${cs[i % cs.length]}" ${o.piel === "neon" ? "" : `stroke="${p.tinta}" stroke-width="4"`}/><rect x="${-n * w / 2 + i * w + 8}" y="${100 - h + 20}" width="${w - 22}" height="8" fill="#fff" opacity="0.6"/>`; }).join("")
      + (o.texto ? `<g transform="translate(0 150)">${letrero({ ...o, texto: o.texto, tamano: 26, estilo: "plano", tinta: "#fff" })}</g>` : "");
  },

  // ------------------------------------------------ el mundo de bloques (piel voxel)
  isla(o) { // una isla flotante de hierba y tierra: ancho, alto (de la tierra), detalles
    const w = o.ancho || 440, h = o.alto || 150, d = o.profundo || 70, [b, s, l] = col(o.color || "verde"), tierra = ["#8A5A36", "#6A4226", "#A87048"];
    const pasos = 4, fondo = Array.from({ length: pasos }, (_, i) => { const iw = w * (1 - (i + 1) * 0.18), x = -iw / 2 + ((i * 37) % 30) - 15, y = h * (i + 1) / pasos * 0.9 + 40; return `<rect x="${x}" y="${y}" width="${iw}" height="${h / pasos + 4}" fill="${i % 2 ? tierra[1] : tierra[0]}"/>`; }).join("");
    const deco = o.detalles === false ? "" : Array.from({ length: 4 }, (_, i) => { const x = -w / 2 + 40 + ((i * 131) % (w - 100)), z = -d * (0.2 + ((i * 53) % 60) / 100); return `<rect x="${x}" y="${z - 26}" width="30" height="30" fill="${s}"/><rect x="${x}" y="${z - 26}" width="30" height="9" fill="${l}"/>`; }).join("");
    return `<path d="M ${-w / 2} 0 L ${-w / 2 + d * 0.5} ${-d} L ${w / 2 + d * 0.5} ${-d} L ${w / 2} 0 Z" fill="${b}"/>
      <path d="M ${w / 2} 0 L ${w / 2 + d * 0.5} ${-d} L ${w / 2 + d * 0.5} ${40 - d} L ${w / 2} 40 Z" fill="${s}"/>
      ${fondo}<rect x="${-w / 2}" y="0" width="${w}" height="40" fill="${tierra[2]}"/><rect x="${-w / 2}" y="0" width="${w}" height="16" fill="${s}"/>${deco}`;
  },
  nubebloque(o) { const w = o.ancho || 260; return `<rect x="${-w / 2}" y="-20" width="${w}" height="44" fill="#fff"/><rect x="${-w * 0.3}" y="-52" width="${w * 0.5}" height="36" fill="#fff"/><rect x="${-w / 2}" y="24" width="${w}" height="12" fill="#dfeef6"/>`; },
  cubo(o) { // un cubo de color (con cara, si se pide: cara: normal | feliz…)
    const s = o.lado || 120;
    return `${sombraPiso(s / 2 + 8, s * 0.6, o)}${bloque({ ...o, piel: o.piel === "neon" ? "voxel" : o.piel }, -s / 2, -s / 2, s, s, o.color || "naranja", { prof: 0.3 })}${o.cara ? `<rect x="${-s * 0.25}" y="${-s * 0.15}" width="${s * 0.12}" height="${s * 0.2}" fill="#20222B"/><rect x="${s * 0.13}" y="${-s * 0.15}" width="${s * 0.12}" height="${s * 0.2}" fill="#20222B"/>` : ""}`;
  },
  arbolbloque(o) {
    return `${sombraPiso(150, 90, o)}${bloque({ ...o, piel: "voxel" }, -24, 30, 48, 120, "marron")}${bloque({ ...o, piel: "voxel" }, -110, -150, 220, 180, o.color || "verde", { prof: 0.25 })}${bloque({ ...o, piel: "voxel" }, -70, -220, 140, 80, o.color || "verde", { prof: 0.3 })}`;
  },
  tienda(o) { // una tienda con toldo de rayas: letrero (texto encima), color (del toldo)
    const p = P(o), [tb] = col(o.color || "rojo"), pv = { ...o, piel: o.piel === "neon" ? "voxel" : o.piel };
    return `${sombraPiso(160, 260, o)}${bloque(pv, -220, -40, 440, 200, "blanco", { prof: 0.12 })}<rect x="-180" y="0" width="360" height="160" fill="#BFE8F7" opacity="0.85"/><rect x="-180" y="0" width="360" height="12" fill="#fff" opacity="0.7"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${-240 + i * 60}" y="-110" width="60" height="70" fill="${i % 2 ? "#fff" : tb}"/>`).join("")}<path d="M -240 -110 L -210 -150 L 270 -150 L 240 -110 Z" fill="${tono(tb, 1.2)}"/>
      ${o.letrero ? `<g transform="translate(0 -205)">${letrero({ ...o, texto: o.letrero, tamano: 34 })}</g>` : ""}`;
  },
  escritorio(o) { // la mesa con el monitor de código (el «taller»)
    const p = P(o), t = o.t || 0, cs = ["#2EE6F5", "#FFC93C", "#F58BB0", "#45C46A", "#fff"];
    const lineas = Array.from({ length: 6 }, (_, i) => `<rect x="${-120 + (i % 3) * 20}" y="${-170 + i * 22}" width="${60 + ((i * 47 + Math.floor(t * 2) * 13) % 120)}" height="10" fill="${cs[i % cs.length]}"/>`).join("");
    return `${sombraPiso(150, 220, o)}${bloque({ ...o, piel: "voxel" }, -200, 40, 400, 40, "marron")}<rect x="-180" y="80" width="30" height="70" fill="#6A4226"/><rect x="150" y="80" width="30" height="70" fill="#6A4226"/>
      <rect x="-150" y="-200" width="300" height="190" fill="#1B2433" stroke="${p.tinta}" stroke-width="7"/>${lineas}<rect x="-20" y="-10" width="40" height="50" fill="#2b3646"/>`;
  },
  cofre(o) { // abierto 0-1 (con brillo dentro)
    const a = lim(o.abierto ?? 0), p = P(o), pv = { ...o, piel: o.piel === "neon" ? "voxel" : o.piel };
    return `${sombraPiso(100, 170, o)}${a > 0 ? `<g opacity="${a}">${PIEZAS_JUEGO.rayos({ ...o, tinta: p.amarillo, radio: 320, n: 10, opacidadRayos: 0.4 })}</g>` : ""}${bloque(pv, -150, -20, 300, 120, "marron")}<rect x="-150" y="20" width="300" height="16" fill="${p.amarillo}"/>
      <g transform="rotate(${-a * 60} -150 -20)">${bloque(pv, -150, -90, 300, 70, "marron")}<rect x="-150" y="-50" width="300" height="14" fill="${p.amarillo}"/></g><rect x="-20" y="0" width="40" height="44" fill="${p.amarillo}" stroke="${p.tinta}" stroke-width="4"/>`;
  },
  pedestal(o) { // un pilar con un objeto que brilla encima: icono (nombre), brilla 0-1
    const p = P(o), br = lim(o.brilla ?? 1), t = o.t || 0;
    return `${sombraPiso(160, 130, o)}${bloque({ ...o, piel: o.piel === "neon" ? "voxel" : o.piel }, -90, 0, 180, 160, "gris", { prof: 0.2 })}${bloque({ ...o, piel: o.piel === "neon" ? "voxel" : o.piel }, -110, -20, 220, 30, "gris")}
      <rect x="-70" y="-300" width="140" height="270" fill="${p.amarillo}" opacity="${0.18 * br}"/><g transform="translate(0 ${-150 + 10 * Math.sin(t * 2)})">${icono(o, o.icono || "llave", 14)}</g>`;
  },
  estante(o) { // una estantería con cubos de colores (datos): n (se anima)
    const n = Math.round(o.n ?? 6), cs = ["amarillo", "verde", "rosa", "azul", "naranja", "morado"], pv = { ...o, piel: "voxel" };
    return `${sombraPiso(170, 240, o)}${[0, 1, 2].map((k) => bloque(pv, -220, -150 + k * 130, 440, 18, "marron")).join("")}<rect x="-220" y="-150" width="16" height="300" fill="#6A4226"/><rect x="204" y="-150" width="16" height="300" fill="#6A4226"/>
      ${Array.from({ length: n }, (_, i) => `<g transform="translate(${-160 + (i % 4) * 105} ${-185 + Math.floor(i / 4) * 130})">${bloque(pv, -38, -38, 76, 76, cs[i % cs.length], { prof: 0.25 })}<rect x="-18" y="-16" width="10" height="16" fill="#20222B"/><rect x="8" y="-16" width="10" height="16" fill="#20222B"/></g>`).join("")}`;
  },
  cajas(o) { // una pila de cajas con su etiqueta (HOY · AYER · ANTEAYER): items, n (cuántas se ven, se anima)
    const items = o.items || ["HOY", "AYER", "ANTEAYER"], n = Math.min(items.length, Math.round(o.n ?? items.length)), p = P(o), pv = { ...o, piel: o.piel === "neon" ? "voxel" : o.piel };
    return `${sombraPiso(150, 150, o)}` + Array.from({ length: n }, (_, i) => { const y = 60 - i * 120; return `${bloque(pv, -120, y - 50, 240, 110, "lila", { prof: 0.15 })}${texto(0, y + 18, items[items.length - n + i] ?? "", { tam: 38, color: p.tinta, f: "Lilita One", peso: 400 })}`; }).reverse().join("");
  },
  app(o) { // un celular con la app (MI APP): titulo
    const p = P(o), cs = ["#3A6BFF", "#FFC93C", "#45C46A", "#F58BB0"];
    return `<rect x="-120" y="-220" width="240" height="440" rx="${o.piel === "arcade" ? 0 : 30}" fill="#1B2433" stroke="${o.piel === "neon" ? p.acento : p.tinta}" stroke-width="7"/><rect x="-100" y="-190" width="200" height="380" rx="${o.piel === "arcade" ? 0 : 16}" fill="#fff"/>
      <rect x="-80" y="-170" width="160" height="54" rx="10" fill="${p.rojo}"/>${texto(0, -133, o.titulo || "MI APP", { tam: 28, color: "#fff", f: o.piel === "arcade" ? "Press Start 2P" : "Lilita One", peso: 400 })}
      ${cs.map((c, i) => `<rect x="${-80 + (i % 2) * 86}" y="${-96 + Math.floor(i / 2) * 96}" width="74" height="80" rx="14" fill="${c}"/>`).join("")}`;
  },

  // ------------------------------------------------ el salón recreativo (piel arcade)
  maquina(o) { // una máquina arcade: titulo (arriba), texto (pantalla), precio
    const p = P(o), t = o.t || 0;
    return `${sombraPiso(330, 200, o)}<rect x="-170" y="-330" width="340" height="660" fill="#2a2a8a" stroke="#000" stroke-width="8"/><rect x="-190" y="-350" width="380" height="90" fill="#3a3ab0" stroke="#000" stroke-width="8"/>
      ${texto(0, -290, o.titulo || "PLAY", { tam: 34, color: p.amarillo, f: "Press Start 2P", peso: 400 })}
      <rect x="-140" y="-230" width="280" height="230" fill="#05061A" stroke="#000" stroke-width="8"/>${html(-130, -220, 260, 210, `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;font:${Math.min(22, Math.floor(250 / Math.max(...String(o.texto || "PLAY").split("|").map((l) => l.length))))}px/1.5 'Press Start 2P';color:#fff">${esc(o.texto || "PLAY").replace(/\|/g, "<br/>")}${o.precio ? `<div style="color:${p.amarillo};font-size:18px;margin-top:10px">${esc(o.precio)}</div>` : ""}</div>`)}
      <rect x="-170" y="20" width="340" height="90" fill="#22226e" stroke="#000" stroke-width="8"/><rect x="-90" y="40" width="16" height="40" fill="#222"/><circle cx="-82" cy="40" r="16" fill="${p.rojo}"/>
      ${["#FF3B4E", "#FFD84A", "#3FE0F0", "#4BF06A"].map((c, i) => `<circle cx="${10 + i * 38}" cy="66" r="13" fill="${c}"/>`).join("")}
      <rect x="-40" y="160" width="80" height="60" fill="#05061A"/><rect x="-14" y="176" width="28" height="8" fill="${(Math.floor(t * 2) % 2) ? p.amarillo : "#555"}"/>`;
  },
  monitor(o) { // una tele de tubo: texto (| = otra línea), logo (círculo de luz), sello («GRATIS»)
    const p = P(o), t = o.t || 0;
    return `<rect x="-260" y="-200" width="520" height="400" fill="#4a4f6a" stroke="#000" stroke-width="8"/><rect x="-220" y="-160" width="440" height="270" fill="#0a0d24"/>
      <rect x="-220" y="-160" width="440" height="14" fill="${p.cian}"/>
      ${o.logo !== false ? `<circle cx="-110" cy="-20" r="58" fill="${p.cian}" style="filter:drop-shadow(0 0 18px ${p.cian})"/><rect x="-124" y="-34" width="28" height="28" fill="#fff"/>` : ""}
      ${(() => { const w = o.logo !== false ? 250 : 420, largo = Math.max(...String(o.texto || "HOLA").split("|").map((l) => l.length)), tam = Math.min(34, Math.floor((w - 10) / largo)); return html(o.logo !== false ? -40 : -210, -150, w, 250, `<div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;font:${tam}px/1.4 'Press Start 2P';color:#fff">${esc(o.texto || "HOLA").replace(/\|/g, "<br/>")}</div>`); })()}
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${-200 + i * 29}" y="140" width="18" height="22" fill="${(i + Math.floor(t * 4)) % 5 ? p.amarillo : "#806a10"}"/>`).join("")}
      ${o.sello ? `<g transform="translate(150 90)">${letrero({ ...o, texto: o.sello, estilo: "sello", tamano: 26, fondo: p.verde, giro: -10 })}</g>` : ""}`;
  },
  ficha(o) { // una ficha de datos que se rellena: filas [["NOMBRE","OPEN X"],…], n (cuántas se ven, se anima), colores [..]
    const p = P(o), filas = o.filas || [["NOMBRE", "?"]], n = Math.round(o.n ?? filas.length), w = o.ancho || 860, h = 60 + filas.length * 74;
    const cs = o.colores || [p.cian, p.rojo, "#fff", p.verde];
    return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#05061A" stroke="#fff" stroke-width="7"/>`
      + filas.slice(0, n).map(([k, v], i) => { const y = -h / 2 + 70 + i * 74; return texto(-w / 2 + 34, y, k, { tam: 20, color: "#8a8fae", f: "Press Start 2P", peso: 400, ancla: "start" }) + texto(w / 2 - 34, y + 4, v, { tam: 28, color: cs[i % cs.length], f: "Press Start 2P", peso: 400, ancla: "end" }); }).join("");
  },
  mejora(o) { // el aviso de logro: titulo («MEJORA CONSEGUIDA»), texto («CEREBRO»), icono
    const p = P(o), u = lim((o.tl ?? 1) / 0.25);
    return `<g transform="scale(${(0.6 + 0.4 * u).toFixed(3)})"><rect x="-400" y="-90" width="800" height="180" fill="#0a0d40" stroke="${p.cian}" stroke-width="7" style="filter:drop-shadow(0 0 16px ${p.cian})"/>
      <circle cx="-310" cy="0" r="46" fill="${p.cian}"/><g transform="translate(-310 0)">${o.icono ? icono({ ...o, piel: "arcade" }, o.icono, 6) : `<rect x="-14" y="-14" width="28" height="28" fill="#fff"/>`}</g>
      ${texto(-230, -18, o.titulo || "MEJORA CONSEGUIDA", { tam: 22, color: "#fff", f: "Press Start 2P", peso: 400, ancla: "start" })}${texto(-230, 40, o.texto || "", { tam: 34, color: p.cian, f: "Press Start 2P", peso: 400, ancla: "start" })}</g>`;
  },
  advertencia(o) { // la pantalla de WARNING con franjas (ponla en x 540, y 960)
    const p = P(o), t = o.tl ?? 0, on = Math.floor(t * 4) % 2 === 0, desp = (t * 120) % 120;
    const franja = (y) => `<g><clipPath id="adv${y}"><rect x="-540" y="${y}" width="1080" height="110"/></clipPath><g clip-path="url(#adv${y})"><rect x="-540" y="${y}" width="1080" height="110" fill="#111"/>${Array.from({ length: 14 }, (_, i) => `<path d="M ${-640 + i * 120 + desp} ${y + 110} L ${-580 + i * 120 + desp} ${y} L ${-520 + i * 120 + desp} ${y} L ${-580 + i * 120 + desp} ${y + 110} Z" fill="${p.amarillo}"/>`).join("")}</g></g>`;
    return `<rect x="-540" y="-960" width="1080" height="1920" fill="#120508" opacity="0.92"/>${franja(-330)}${franja(220)}
      ${texto(0, 30, o.texto || "WARNING", { tam: 92, color: on ? p.rojo : "#7a1020", f: "Press Start 2P", peso: 400 })}${o.sub ? texto(0, 130, o.sub, { tam: 26, color: "#fff", f: "Press Start 2P", peso: 400 }) : ""}`;
  },
  vs(o) { // la pantalla partida de VERSUS (ponla en x 540, y 960): izq, der, subIzq, subDer, colorIzq, colorDer
    const p = P(o), t = o.tl ?? 0, temb = Math.sin(t * 40) * 6 * Math.exp(-t * 3);
    return `<path d="M -540 -960 L 120 -960 L -120 960 L -540 960 Z" fill="${o.colorIzq || "#5a1a8a"}"/><path d="M 120 -960 L 540 -960 L 540 960 L -120 960 Z" fill="${o.colorDer || "#0a2a6a"}"/>
      <path d="M 120 -960 L -120 960" stroke="#fff" stroke-width="10"/>
      ${texto(-300, -640, o.izq || "ELLOS", { tam: 34, color: p.amarillo, f: "Press Start 2P", peso: 400 })}${o.subIzq ? texto(-300, -580, o.subIzq, { tam: 22, color: "#fff", f: "Press Start 2P", peso: 400 }) : ""}
      ${texto(300, -640, o.der || "TÚ", { tam: 34, color: p.cian, f: "Press Start 2P", peso: 400 })}${o.subDer ? texto(300, -580, o.subDer, { tam: 22, color: "#fff", f: "Press Start 2P", peso: 400 }) : ""}
      <g transform="translate(${temb} 0)">${texto(8, 48, "VS", { tam: 150, color: "#000", f: "Press Start 2P", peso: 400 })}${texto(0, 40, "VS", { tam: 150, color: p.rojo, f: "Press Start 2P", peso: 400 })}</g>`;
  },
  continuar(o) { // ¿CONTINUAR? con la cuenta atrás: n (se anima), sub
    const p = P(o), n = Math.max(0, Math.ceil(o.n ?? 5));
    return `${texto(0, -120, o.texto || "¿CONTINUAR?", { tam: 52, color: "#fff", f: "Press Start 2P", peso: 400 })}${texto(6, 86, String(n), { tam: 170, color: "#000", f: "Press Start 2P", peso: 400 })}${texto(0, 80, String(n), { tam: 170, color: p.rojo, f: "Press Start 2P", peso: 400 })}
      ${o.sub ? texto(0, 210, o.sub, { tam: 32, color: p.amarillo, f: "Press Start 2P", peso: 400 }) : ""}`;
  },
};

// Los parámetros de cada pieza del modo juego (para la guía y para la IA).
export const PARAMETROS_JUEGO = {
  personaje: "cara normal|feliz|triste|sorprendido|asustado|dormido|enfadado|guino, color, gorro casco|gorra|corona, gafas sol|nerd, antena, brazo saluda|arriba, camina, habla, mejillas, quieto",
  robot: "cara normal|feliz|error|dormido|corazon, brilla 0-1, color, luz",
  letrero: "texto, tamano, estilo caja|plano|pildora|sello, color/tinta, fondo", cifra: "valor (se anima), antes, despues, decimales, tamano, color",
  dialogo: "texto, cola abajo|izq|der, tamano", cta: "palabra, texto, boton (bloques), nombre (neón)", barra: "valor 0-1 (se anima), texto, cuenta, ancho, color",
  icono: `nombre (${Object.keys(ICONOS).join(", ")}), tam`, muchos: "icono, n (se anima), columnas, separa, tam", sello: "texto, fondo, giro",
  rayos: "color, n, radio, gira", confeti: "n", explosion: "tinta",
  ventana: "titulo, texto, lineas, ancho, alto, color", terminal: "texto (\\n), escribe 0-1 o velocidad, titulo, ancho, alto, tamano",
  edificio: "pisos, columnas, resalta, placa, cartel, base, ancho, alto", servidor: "filas", puerta: "cartel, abierto 0-1", candado: "abierto 0-1", llave: "—",
  chip: "texto, sub, activo", pulso: "titulo, estado vivo|muerto", dispositivo: "tipo celular|laptop|monitor|tablet, pantalla",
  linea: "dx, dy, dibuja 0-1, punto", balanza: "inclina -1..1, izq, der", esfera: "hora 0-12 (se anima), gira", temporizador: "segundos (se anima), total",
  paquete: "abierto 0-1", libros: "n, texto",
  isla: "ancho, alto, profundo, color, detalles", nubebloque: "ancho", cubo: "color, lado, cara", arbolbloque: "color", tienda: "letrero, color",
  escritorio: "—", cofre: "abierto 0-1", pedestal: "icono, brilla", estante: "n (se anima)", cajas: "items, n (se anima)", app: "titulo",
  maquina: "titulo, texto, precio", monitor: "texto (|), logo, sello", ficha: "filas [[clave, valor]], n (se anima), colores, ancho",
  mejora: "titulo, texto, icono", advertencia: "texto, sub (en x 540 y 960)", vs: "izq, der, subIzq, subDer, colorIzq, colorDer (en x 540 y 960)", continuar: "n (se anima), texto, sub",
};
export const LISTA_ICONOS = Object.keys(ICONOS);
