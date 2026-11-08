// Barcada 2.0 · el modo juego: tres «pieles» que convierten el reel en una partida que se ve hasta el final.
//   neon   · fondo negro con cuadrícula, cian eléctrico, barra de pasos con chips arriba y título con la palabra
//            resaltada en una caja (explicar tecnología, procesos, «cómo funciona»).
//   voxel  · un mundo de islas flotantes de bloques en un cielo claro; título gordo con contorno; fichas numeradas
//            abajo que se llenan («TU APP VIVE EN: 3/6») (mapas, listas de N sitios, «las 6 partes de…»).
//   arcade · pixel art de 8 bits; arriba la barra de vida/progreso en % y el TIEMPO en cuenta atrás; abajo el cuadro de
//            diálogo con el texto a máquina; pantallas de WARNING, VS y ¿CONTINUAR? (retos, «gratis antes de que
//            acabe este video», comparaciones de poder).
//
// En proyecto.json:
//   "juego": {
//     "piel": "neon",
//     "progreso": { "titulo": "TU SERVIDOR", "etiqueta": "TU APP VIVE EN:",
//                   "pasos": [{ "texto": "24 H", "en": "4:alquilas" }, { "texto": "LLAVE", "en": "8:llave", "apaga": "9:roba" }],
//                   "final": { "texto": "VIVA", "en": "14:viva" } },
//     "tiempo": true,                        // arcade: la cuenta atrás (segundos que quedan de video)
//     "firma": "@tucuenta",                  // abajo (por defecto, la de preferencias.json)
//     "musica": true, "sonidos": true,        // música y efectos creados por el sintetizador
//     "mundo": { "camara": [...], "elementos": [...] }   // piezas que viven en todas las tomas (tiempos absolutos)
//   }
// Y en cada toma: "titulo": "Un ordenador que|*NUNCA* se apaga" (| = otra línea; *x* resaltado; !x! en rojo),
// "tituloEn": [0, "2:agente"] (cuándo entra cada línea), "subtitulo": "cada uno con su nombre", "alerta": true
// (pantalla roja + sacudida), "sacude": true.
import { sinTildes } from "../comun.mjs";

export const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lim = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u ?? 0));
const rebote = (u) => { u = lim(u); const c = 1.70158 * 1.6, c3 = c + 1; return 1 + c3 * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

// ---------------------------------------------------------------- las pieles
export const PIELES = {
  neon: {
    nombre: "Neón", para: "tecnología, procesos y «cómo funciona»; serio pero vivo",
    fondo: "neon", acento: "#2EE6F5", rojo: "#FF3B5C", verde: "#3BF58C", amarillo: "#FFC93C", texto: "#FFFFFF", apagado: "#5B6676", tinta: "#04121A",
    titulo: "Poppins", hud: "Space Mono", sub: "Poppins",
    sonidos: { corte: ["whoosh", -24], aparece: ["clic", -15], titulo: ["tecleo", -17], paso: ["nivel", -14], alerta: ["error", -10], fin: ["exito", -12] },
  },
  voxel: {
    nombre: "Bloques", para: "listas de N partes, mapas, «dónde vive…»; alegre y familiar",
    fondo: "bloques", acento: "#FFD23F", rojo: "#FF5A4E", verde: "#54D46A", amarillo: "#FFD23F", texto: "#FFFFFF", apagado: "#F4F1E8", tinta: "#1B2433",
    titulo: "Lilita One", hud: "Lilita One", sub: "Lilita One",
    colores: ["#F07A3E", "#4A78D8", "#FFC93C", "#E9493F", "#45C46A", "#8B5CF6", "#F58BB0", "#2EC4D6"],
    sonidos: { corte: ["whoosh", -22], aparece: ["bloop", -13], titulo: ["pop", -12], paso: ["moneda", -12], alerta: ["error", -10], fin: ["exito", -12] },
  },
  arcade: {
    nombre: "Arcade", para: "retos, «antes de que acabe este video», comparaciones de poder; videojuego retro",
    fondo: "arcade", acento: "#FFD84A", cian: "#3FE0F0", rojo: "#FF3B4E", verde: "#4BF06A", amarillo: "#FFD84A", texto: "#FFFFFF", apagado: "#5E6275", tinta: "#05061A",
    titulo: "Press Start 2P", hud: "Press Start 2P", sub: "Space Mono",
    sonidos: { corte: ["blip", -18], aparece: ["blip", -17], titulo: ["salto", -15], paso: ["nivel", -12], alerta: ["alarma", -12], fin: ["moneda", -12] },
  },
  // la piel de marca de NativoTerrus: papel crema, letra condensada Oswald y terracota (como sus carruseles).
  // Las piezas se dibujan con la forma de «bloques» (planas, con cara y lado) y los colores de la marca.
  nativo: {
    nombre: "NativoTerrus", para: "la marca @nativoterrus: crema, Oswald y terracota; limpio y editorial",
    fondo: "nativo", piezas: "voxel", musica: "voxel",
    acento: "#C8694A", cian: "#C8694A", rojo: "#B23A2B", verde: "#6E8B4E", amarillo: "#D9A441", texto: "#1C1A17", apagado: "#DCCFBE", tinta: "#1C1A17",
    gris: "#5A5650", arena: "#DCCFBE", papel: "#F3F1EC",
    titulo: "Oswald", hud: "Oswald", sub: "Oswald",
    colores: ["#C8694A", "#C8694A", "#C8694A", "#C8694A", "#C8694A", "#C8694A"],
    sonidos: { corte: ["whoosh", -24], aparece: ["bloop", -15], titulo: ["pop", -14], paso: ["moneda", -13], alerta: ["error", -11], fin: ["exito", -12] },
  },
};
export const piel = (n) => PIELES[n] || PIELES.neon;

// ---------------------------------------------------------------- utilidades de dibujo compartidas
// Un bloque de HTML dentro del SVG (lo pinta el navegador: así el texto se mide y se ajusta solo).
export const html = (x, y, w, h, interior, estilo = "") =>
  `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;${estilo}">${interior}</div></foreignObject>`;

// aclarar/oscurecer un color hex (f > 1 aclara, < 1 oscurece)
export function tono(hex, f) {
  const h = hex.replace("#", ""), n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return "#" + n.map((c) => Math.round(f >= 1 ? c + (255 - c) * (f - 1) : c * f).toString(16).padStart(2, "0")).join("");
}

// *resaltado* y !rojo! dentro de un texto → HTML (estilo según la piel)
export function marcado(texto, P, pielN, { caja = true } = {}) {
  return String(texto).split(/(\*[^*]+\*|![^!]+!)/).filter(Boolean).map((s) => {
    const k = s.startsWith("*") ? "a" : s.startsWith("!") && s.endsWith("!") && s.length > 2 ? "r" : null;
    if (!k) return esc(s);
    const t = esc(s.slice(1, -1)), c = k === "a" ? P.acento : P.rojo;
    if (pielN === "neon" && caja) return `<span style="background:${c};color:${k === "a" ? P.tinta : "#fff"};padding:0 10px;box-decoration-break:clone;-webkit-box-decoration-break:clone">${t}</span>`;
    return `<span style="color:${pielN === "arcade" && k === "a" ? P.verde : c}">${t}</span>`;
  }).join("");
}

// ---------------------------------------------------------------- los fondos del modo juego
const estrellas = (n, t, semilla, color = "#fff", alto = 1920) => Array.from({ length: n }, (_, i) => {
  const x = (i * 197 + semilla * 31) % 1080, y = (i * 331 + semilla * 17) % alto, s = 4 + (i % 3) * 2;
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${color}" opacity="${(0.25 + 0.6 * Math.abs(Math.sin(t * 1.3 + i * 1.7))).toFixed(2)}"/>`;
}).join("");
const nubesBloque = (t, lista) => lista.map(([x, y, w, v]) => {
  const xx = ((x + t * v) % 1400) - 160;
  return `<g transform="translate(${xx.toFixed(1)} ${y})" opacity="0.92"><rect x="0" y="0" width="${w}" height="34" fill="#ffffff"/><rect x="${w * 0.18}" y="-26" width="${w * 0.5}" height="28" fill="#ffffff"/><rect x="0" y="34" width="${w}" height="10" fill="#dfeef6"/></g>`;
}).join("");
const rayos = (cx, cy, n, color, op, giro) => Array.from({ length: n }, (_, i) => {
  const a0 = ((i * 2) * Math.PI) / n + giro, a1 = ((i * 2 + 1) * Math.PI) / n + giro, R = 2400;
  return `<path d="M ${cx} ${cy} L ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} L ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z" fill="${color}" opacity="${op}"/>`;
}).join("");

export const FONDOS_JUEGO = {
  // NativoTerrus: papel crema liso, con una luz blanca muy suave en el centro y un suelo de arena apenas marcado
  nativo: ({ suelo = 1330 }) => `<defs><radialGradient id="fNat" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stop-color="#FBFAF7"/><stop offset="1" stop-color="#F3F1EC"/></radialGradient></defs>
    <rect width="1080" height="1920" fill="url(#fNat)"/><rect y="${suelo}" width="1080" height="${1920 - suelo}" fill="#EDE7DD"/><rect y="${suelo}" width="1080" height="4" fill="#DCCFBE"/>`,
  // negro azulado con cuadrícula fina y un halo central; tono: "rojo" para el problema
  neon: ({ t = 0, tono: tn, rejilla = 54 }) => {
    const [c0, c1] = tn === "rojo" ? ["#3a0e18", "#14050a"] : tn === "verde" ? ["#0b2a1c", "#050d09"] : ["#0e1726", "#05080e"];
    return `<defs><radialGradient id="fNeon" cx="0.5" cy="0.45" r="0.85"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></radialGradient>
      <pattern id="rejNeon" width="${rejilla}" height="${rejilla}" patternUnits="userSpaceOnUse"><path d="M ${rejilla} 0 L 0 0 0 ${rejilla}" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="2"/></pattern></defs>
      <rect width="1080" height="1920" fill="url(#fNeon)"/><rect width="1080" height="1920" fill="url(#rejNeon)"/>
      ${Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 233) % 1080}" cy="${((i * 419) % 1920 - t * (8 + (i % 4) * 4) + 1920) % 1920}" r="${1.5 + (i % 3)}" fill="#7feaff" opacity="${0.08 + (i % 4) * 0.04}"/>`).join("")}`;
  },
  // cielo de día con nubes de bloques (el mundo de islas va encima, como piezas)
  bloques: ({ t = 0, noche = false }) => noche
    ? `<defs><linearGradient id="fBn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f4a"/><stop offset="0.6" stop-color="#2c2f6e"/><stop offset="1" stop-color="#4b3d7a"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#fBn)"/>${estrellas(70, t, 3, "#fff", 1400)}
      <rect x="760" y="230" width="120" height="120" fill="#fff6c9"/><rect x="740" y="250" width="20" height="80" fill="#fff6c9"/><rect x="800" y="210" width="60" height="20" fill="#fff6c9"/>`
    : `<defs><linearGradient id="fBq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46b4e8"/><stop offset="0.5" stop-color="#9fdcf2"/><stop offset="0.82" stop-color="#e9f1e2"/><stop offset="1" stop-color="#f6e2b8"/></linearGradient></defs>
      <rect width="1080" height="1920" fill="url(#fBq)"/>${nubesBloque(t, [[60, 260, 200, 9], [700, 420, 260, 6], [300, 760, 180, 11], [980, 1040, 230, 7], [520, 1320, 160, 10]])}`,
  // arcade: azul noche con estrellas de píxel (y rayos que giran, si rayos: true)
  arcade: ({ t = 0, rayos: r = false, color = "#1b2470" }) => `<defs><radialGradient id="fAr" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#070a26"/></radialGradient></defs>
    <rect width="1080" height="1920" fill="url(#fAr)"/>${r ? rayos(540, 620, 18, "#4a5ad8", 0.22, t * 0.15) : ""}${estrellas(60, t, 1)}`,
  // arcade: la sala (pared de azulejos azules y suelo), como un nivel de juego
  "arcade-sala": ({ t = 0, suelo = 1300 }) => `<rect width="1080" height="1920" fill="#16206e"/>
    <defs><pattern id="azArc" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#1d2a8c"/><rect x="0" y="0" width="90" height="90" fill="none" stroke="#2c3cb0" stroke-width="6"/><rect x="6" y="6" width="20" height="6" fill="#3a4ccc"/></pattern></defs>
    <rect y="0" width="1080" height="${suelo}" fill="url(#azArc)"/>${estrellas(26, t, 5, "#5ee8ff", suelo)}
    <rect x="40" y="0" width="16" height="${suelo}" fill="#0f1650"/><rect x="1024" y="0" width="16" height="${suelo}" fill="#0f1650"/>
    <rect y="${suelo}" width="1080" height="${1920 - suelo}" fill="#0b1040"/><rect y="${suelo}" width="1080" height="10" fill="#3a4ccc"/>`,
  // arcade: atardecer por bandas (el «mañana») con sol de píxel
  "arcade-atardecer": ({ t = 0, suelo = 1300 }) => ["#2a1a5e", "#4a2470", "#7a2e78", "#b03e6e", "#e05a5a", "#f08a4a"].map((c, i) => `<rect y="${i * (suelo / 6)}" width="1080" height="${suelo / 6 + 2}" fill="${c}"/>`).join("")
    + `<g transform="translate(760 ${suelo - 330 + 6 * Math.sin(t)})">${[[-60, -100, 120], [-90, -80, 180], [-100, -50, 200], [-100, -10, 200], [-90, 30, 180], [-60, 60, 120]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="40" fill="#ffd84a"/>`).join("")}</g>`
    + `<rect y="${suelo}" width="1080" height="${1920 - suelo}" fill="#1c0f33"/><rect y="${suelo}" width="1080" height="10" fill="#ff8a5a"/>`,
  // arcade: escenario con focos y suelo de damero
  "arcade-escenario": ({ t = 0, suelo = 1250 }) => `<rect width="1080" height="1920" fill="#2a1450"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${60 + i * 130}" y="120" width="60" height="14" fill="#ffd84a" opacity="${0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i))}"/>`).join("")}
    <path d="M 160 140 L 20 ${suelo} L 420 ${suelo} Z" fill="#ffffff" opacity="0.06"/><path d="M 920 140 L 660 ${suelo} L 1060 ${suelo} Z" fill="#ffffff" opacity="0.06"/>
    <rect y="${suelo}" width="1080" height="${1920 - suelo}" fill="#3a1d6a"/>
    ${Array.from({ length: 27 }, (_, i) => `<rect x="${(i % 9) * 120 + (Math.floor(i / 9) % 2) * 60}" y="${suelo + Math.floor(i / 9) * 50}" width="60" height="50" fill="#5a2e9a"/>`).join("")}`,
};
export const FONDOS_VIVOS = new Set(["neon", "bloques", "arcade", "arcade-sala", "arcade-atardecer", "arcade-escenario"]);

// ---------------------------------------------------------------- preparar el juego de un proyecto
// Convierte la configuración (con palabras de la voz) en tiempos y devuelve las capas que van encima de cada cuadro.
// cuando(ref) → segundos. tomas: la línea de tiempo (con inicio y fin). pref: preferencias.json.
export function prepararJuego(p, tiempos, tomas, cuando, pref = {}) {
  const J = p.juego || {}, N = J.piel && PIELES[J.piel] ? J.piel : "neon", P = { ...piel(N), ...(J.acento ? { acento: J.acento } : {}) };
  const T = (ref) => (typeof ref === "number" ? ref : cuando(ref));
  const prog = J.progreso ? {
    ...J.progreso,
    pasos: (J.progreso.pasos || []).map((s) => (typeof s === "string" ? { texto: s } : s)).map((s) => ({ ...s, t: s.en !== undefined ? T(s.en) : Infinity, tApaga: s.apaga !== undefined ? T(s.apaga) : Infinity })),
    tFinal: J.progreso.final?.en !== undefined ? T(J.progreso.final.en) : Infinity,
  } : null;
  // los títulos: cada toma hereda el de la anterior si no trae uno ("" lo quita)
  let previo = null;
  const titulos = tomas.map((tm) => {
    if (tm.titulo === undefined) return previo;
    if (!tm.titulo) return (previo = null);
    const lineas = String(tm.titulo).split("|"), en = tm.tituloEn || [];
    const nuevo = { texto: tm.titulo, lineas: lineas.map((l, i) => ({ l, t: en[i] !== undefined ? (typeof en[i] === "number" ? tm.inicio + en[i] : T(en[i])) : tm.inicio })), sub: tm.subtitulo, tSub: tm.inicio + 0.25 };
    // si la toma repite el título de la anterior, no se vuelve a escribir
    if (previo && previo.texto === nuevo.texto) { nuevo.lineas = previo.lineas; nuevo.tSub = previo.tSub; }
    return (previo = nuevo);
  });
  const tomaEn = (t) => { let k = 0; for (let i = 0; i < tomas.length; i++) if (t >= tomas[i].inicio - 1e-3) k = i; return k; };
  // los subtítulos, por bloques
  const bloques = [];
  const todas = tiempos.frases.flatMap((f) => f.palabras.map((w) => ({ ...w, clave: f.clave && sinTildes(w.texto) === sinTildes(f.clave) })));
  if (N === "arcade") {
    for (const f of tiempos.frases) {
      let g = [];
      const cerrar = () => { if (g.length) bloques.push(g); g = []; };
      for (const w of f.palabras) { if (g.map((x) => x.texto).join(" ").length + w.texto.length > 74) cerrar(); g.push(todas.find((x) => x.inicio === w.inicio && x.texto === w.texto)); }
      cerrar();
    }
  } else {
    // grupos cortos dentro de cada frase (nunca cruzan de una frase a otra), cortando mejor tras una coma
    for (const f of tiempos.frases) {
      let g = [];
      for (const w0 of f.palabras) {
        const w = todas.find((x) => x.inicio === w0.inicio && x.texto === w0.texto);
        const largo = g.map((x) => x.texto).join(" ").length + w.texto.length;
        if (g.length && (g.length >= 4 || largo > (N === "voxel" ? 20 : 24))) { bloques.push(g); g = []; }
        g.push(w);
        if (/[,.;:?!…]$/.test(w.texto) && g.length >= 2) { bloques.push(g); g = []; }
      }
      if (g.length) bloques.push(g);
    }
  }
  bloques.forEach((b, i) => { b.t0 = b[0].inicio - 0.06; b.t1 = i < bloques.length - 1 ? Math.min(bloques[i + 1][0].inicio - 0.06, b.at(-1).fin + (N === "arcade" ? 1.2 : 0.6)) : b.at(-1).fin + 0.8; });
  const firma = J.firma ?? (pref.redes && Object.values(pref.redes).find(Boolean)) ?? (pref.marca ? `@${String(pref.marca).toLowerCase().replace(/\s+/g, "")}` : "");
  const ctx = { N, P, prog, titulos, tomas, tomaEn, bloques, firma, duracion: tiempos.duracion, subtitulos: p.subtitulos !== false, J, avatar: J.avatar || null };
  ctx.capa = (t) => capaJuego(ctx, t);
  return ctx;
}

// ---------------------------------------------------------------- la capa de encima: alerta, HUD, título, subtítulos, firma
function capaJuego(ctx, t) {
  const { N, P } = ctx, k = ctx.tomaEn(t), tm = ctx.tomas[k], partes = [];
  if (tm?.alerta) { const u = t - tm.inicio; partes.push(`<rect width="1080" height="1920" fill="${P.rojo}" opacity="${(0.22 + 0.25 * Math.exp(-u * 6)).toFixed(3)}"/>`); }
  if (ctx.prog) partes.push(HUD[N](ctx, t));
  if (ctx.titulos[k]) partes.push(TITULO[N](ctx, ctx.titulos[k], t));
  if (ctx.subtitulos) partes.push(SUBS[N](ctx, t));
  if (ctx.firma) partes.push(FIRMA[N](ctx));
  return partes.join("");
}

// el estado del progreso en t: [{texto, activo, uPop}], hechos, final
function estado(ctx, t) {
  const pasos = ctx.prog.pasos.map((s) => ({ ...s, activo: t >= s.t && t < s.tApaga, uPop: lim((t - s.t) / 0.35) }));
  return { pasos, hechos: pasos.filter((s) => s.activo).length, final: t >= ctx.prog.tFinal, uFinal: lim((t - ctx.prog.tFinal) / 0.4) };
}
const popEscala = (u) => (u >= 1 ? 1 : 1 + 0.35 * Math.sin(Math.PI * u) * (1 - u));

const HUD = {
  // NativoTerrus: arriba, la etiqueta espaciada a la izquierda y «02 / 04» a la derecha (como sus carruseles); debajo,
  // las fichas de los pasos: blancas con borde arena, y en terracota cuando se encienden
  nativo(ctx, t) {
    const { P } = ctx, e = estado(ctx, t), n = e.pasos.length, gap = 14, w = (920 - gap * (n - 1)) / n, col = e.final ? P.verde : P.acento;
    const fichas = e.pasos.map((s, i) => {
      const on = s.activo || e.final, c = e.final ? P.verde : P.acento;
      return `<div style="width:${w}px;height:74px;margin-right:${i < n - 1 ? gap : 0}px;border:3px solid ${on ? c : P.arena};border-radius:14px;background:${on ? c : "#fff"};box-shadow:0 6px 0 ${on ? tono(c, 0.8) : "#E9E3D9"};box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:10px;transform:scale(${popEscala(on ? (e.final ? e.uFinal : s.uPop) : 1).toFixed(3)});color:${on ? "#fff" : P.gris}">
        <span style="font:700 40px Oswald;color:${on ? "#fff" : P.acento}">${i + 1}</span><span style="font:700 ${n > 4 ? 20 : 25}px Oswald;letter-spacing:1px;text-transform:uppercase">${esc(s.texto)}</span></div>`;
    }).join("");
    return html(80, 120, 920, 50, `<div style="display:flex;justify-content:space-between;align-items:center;height:100%;font:400 30px Oswald;letter-spacing:5px;color:${P.gris};text-transform:uppercase">
      <span>${esc(ctx.prog.titulo || "")}</span><span style="letter-spacing:3px"><b style="color:${col};font-weight:700">${String(e.final ? n : e.hechos).padStart(2, "0")}</b> / ${String(n).padStart(2, "0")}${e.final && ctx.prog.final?.texto ? ` · <b style="color:${col}">${esc(ctx.prog.final.texto)}</b>` : ""}</span></div>`)
      + html(80, 186, 920, 90, `<div style="display:flex">${fichas}</div>`);
  },
  neon(ctx, t) {
    const { P } = ctx, e = estado(ctx, t), total = e.pasos.length, col = e.final ? P.verde : P.acento;
    const chips = e.pasos.map((s) => `<span style="display:inline-block;padding:3px 12px;margin-right:10px;border:2px solid ${s.activo ? col : "#283444"};border-radius:6px;background:${s.activo ? col : "transparent"};color:${s.activo ? P.tinta : "#4d5a6b"};transform:scale(${popEscala(s.activo ? s.uPop : 1).toFixed(3)});${s.activo ? `box-shadow:0 0 18px ${col}` : ""}">${esc(s.texto)}</span>`).join("");
    return html(40, 150, 1000, 84, `<div style="display:flex;align-items:center;height:100%;padding:0 26px;box-sizing:border-box;font:700 22px 'Space Mono';letter-spacing:1px;white-space:nowrap">
      <span style="color:#8a97a8;margin-right:22px">${esc(ctx.prog.titulo || "")}</span>${chips}<span style="margin-left:auto;color:${col};font-size:28px">${e.final && ctx.prog.final?.texto ? esc(ctx.prog.final.texto) + " · " : ""}${e.hechos}/${total}</span></div>`,
      `border:2px solid #1d5d6c;border-radius:16px;background:rgba(9,14,22,.88);box-sizing:border-box;box-shadow:0 0 22px rgba(46,230,245,.08)`);
  },
  voxel(ctx, t) {
    const { P } = ctx, e = estado(ctx, t), n = e.pasos.length, gap = 12, w = Math.min(170, (1000 - gap * (n - 1)) / n);
    const fichas = e.pasos.map((s, i) => {
      const c = e.final ? P.verde : P.colores[i % P.colores.length], on = s.activo || e.final;
      return `<div style="width:${w}px;height:112px;margin:0 ${gap / 2}px;border:5px solid ${P.tinta};border-radius:18px;background:${on ? c : "#f4f1e8"};box-shadow:0 8px 0 ${P.tinta};box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:scale(${popEscala(on ? (e.final ? e.uFinal : s.uPop) : 1).toFixed(3)});color:${on ? "#fff" : P.tinta};${on ? `-webkit-text-stroke:3px ${P.tinta};paint-order:stroke fill` : ""}">
        <div style="font:52px 'Lilita One';line-height:1">${i + 1}</div><div style="font:${n > 6 ? 16 : 19}px 'Lilita One';line-height:1.1;text-transform:uppercase;text-align:center;padding:0 4px;-webkit-text-stroke:${on ? 2 : 0}px ${P.tinta}">${esc(s.texto)}</div></div>`;
    }).join("");
    const etiqueta = `${esc(ctx.prog.etiqueta || ctx.prog.titulo || "")} <span style="color:${P.acento}">${e.hechos}/${n}${e.final && ctx.prog.final?.texto ? " · " + esc(ctx.prog.final.texto) : ""}</span>`;
    return html(0, 1440, 1080, 70, `<div style="text-align:center;font:46px 'Lilita One';color:#fff;-webkit-text-stroke:9px ${P.tinta};paint-order:stroke fill;text-transform:uppercase">${etiqueta}</div>`)
      + html(30, 1508, 1020, 140, `<div style="display:flex;justify-content:center;align-items:flex-start;padding-top:6px">${fichas}</div>`);
  },
  arcade(ctx, t) {
    const { P } = ctx, e = estado(ctx, t), n = Math.max(1, e.pasos.length), pct = Math.round((100 * e.hechos) / n), lleno = e.final || pct >= 100, col = lleno ? P.verde : P.cian;
    const segs = Array.from({ length: n }, (_, i) => `<div style="flex:1;height:26px;margin-right:${i < n - 1 ? 4 : 0}px;background:${i < e.hechos ? col : "#1e2a6e"};${i < e.hechos ? `box-shadow:0 0 10px ${col}` : ""}"></div>`).join("");
    const resto = Math.max(0, Math.ceil(ctx.duracion - t));
    return html(30, 168, 1020, 76, `<div style="display:flex;align-items:center;height:100%;padding:0 22px;box-sizing:border-box;font:20px 'Press Start 2P';color:#fff;white-space:nowrap">
      <span>${esc(ctx.prog.titulo || "")}</span><div style="display:flex;width:330px;margin:0 18px;border:4px solid #2b3a8a;padding:3px;background:#0a0d24">${segs}</div>
      <span style="color:${lleno ? P.verde : "#cfd6ff"}">${pct}%</span>${ctx.J.tiempo !== false ? `<span style="margin-left:auto">TIEMPO ${String(resto).padStart(2, "0")}</span>` : ""}</div>`,
      "background:rgba(5,7,26,.86);box-sizing:border-box");
  },
};

// el título: se escribe letra a letra (neón, arcade) o entra con un bote (bloques)
function tipeo(lineas, t, P, N, vel = 42) {
  return lineas.map(({ l, t: t0 }) => {
    if (t < t0) return "";
    const n = Math.floor((t - t0) * vel), plano = l.replace(/[*!]/g, "");
    if (n >= plano.length) return `<div>${marcado(l, P, N)}</div>`;
    // corta el texto con marcas en la letra n (lo que falta, invisible: el título no salta)
    let vistos = 0, dentro = null, out = "", oculto = "";
    for (const ch of l) {
      if (ch === "*" || ch === "!") { dentro = dentro === ch ? null : ch; (vistos < n ? (out += ch) : (oculto += ch)); continue; }
      if (vistos < n) out += ch; else oculto += ch;
      vistos++;
    }
    if (dentro && out.endsWith(dentro) === false) out += dentro; // cierra la marca abierta
    if (dentro) oculto = dentro + oculto;
    return `<div>${marcado(out, P, N)}<span style="visibility:hidden">${marcado(oculto, P, N)}</span></div>`;
  }).join("");
}
const TITULO = {
  // NativoTerrus: Oswald 700 en mayúsculas, a la izquierda, casi negro con la palabra en terracota y la raya arena debajo
  nativo(ctx, ti, t) {
    const { P } = ctx;
    const lineas = ti.lineas.filter((x) => t >= x.t).map((x) => { const u = lim((t - x.t) / 0.35), d = 40 * (1 - u) * (1 - u); return `<div style="transform:translateY(${d.toFixed(1)}px);opacity:${u.toFixed(3)}">${marcado(x.l, P, "nativo", { caja: false })}</div>`; }).join("");
    const uRaya = lim((t - (ti.lineas[0]?.t ?? 0) - 0.2) / 0.4);
    return html(80, 300, 920, 330, `<div style="font:700 92px/1.08 Oswald;color:${P.tinta};text-transform:uppercase;letter-spacing:0.5px">${lineas}</div>
      <div style="margin-top:22px;width:${Math.round(120 * uRaya)}px;height:8px;background:${P.arena}"></div>
      ${ti.sub && t >= ti.tSub ? `<div style="margin-top:16px;font:300 40px Oswald;color:${P.gris};opacity:${lim((t - ti.tSub) * 4)}">${esc(ti.sub)}</div>` : ""}`);
  },
  neon(ctx, ti, t) {
    return html(60, 270, 960, 360, `<div style="font:800 82px/1.1 Poppins;color:#fff;letter-spacing:-0.5px">${tipeo(ti.lineas, t, ctx.P, "neon")}</div>
      ${ti.sub && t >= ti.tSub ? `<div style="margin-top:14px;font:700 34px 'Space Mono';color:#8a97a8">${esc(ti.sub)}</div>` : ""}`);
  },
  voxel(ctx, ti, t) {
    const { P } = ctx;
    const lineas = ti.lineas.filter((x) => t >= x.t).map((x) => { const u = (t - x.t) / 0.4, s = Math.max(0.01, rebote(u)); return `<div style="transform:scale(${s.toFixed(3)});opacity:${lim(u * 4)}">${marcado(x.l, P, "voxel", { caja: false })}</div>`; }).join("");
    return html(40, 150, 1000, 380, `<div style="text-align:center;font:100px/0.98 'Lilita One';color:#fff;-webkit-text-stroke:14px ${P.tinta};paint-order:stroke fill;text-transform:uppercase;filter:drop-shadow(0 8px 0 ${P.tinta})">${lineas}</div>
      ${ti.sub && t >= ti.tSub ? `<div style="text-align:center;margin-top:18px;font:46px 'Lilita One';color:#fff;-webkit-text-stroke:9px ${P.tinta};paint-order:stroke fill;opacity:${lim((t - ti.tSub) * 4)}">${esc(ti.sub)}</div>` : ""}`);
  },
  arcade(ctx, ti, t) {
    return html(40, 290, 1000, 260, `<div style="text-align:center;font:46px/1.35 'Press Start 2P';color:${ctx.P.acento};text-shadow:5px 5px 0 #000;text-transform:uppercase">${tipeo(ti.lineas, t, ctx.P, "arcade", 30)}</div>
      ${ti.sub && t >= ti.tSub ? `<div style="text-align:center;margin-top:10px;font:22px 'Press Start 2P';color:#fff;text-shadow:3px 3px 0 #000">${esc(ti.sub)}</div>` : ""}`);
  },
};

// los subtítulos: neón (la palabra que suena en cian, lo que falta en gris), bloques (palabra a palabra con bote) y
// arcade (cuadro de diálogo con el texto a máquina)
const bloqueEn = (ctx, t) => ctx.bloques.find((b) => t >= b.t0 && t < b.t1);
const SUBS = {
  // NativoTerrus: en una tarjeta blanca con borde arena (como las de sus carruseles); lo dicho en tinta, lo que falta en
  // arena y la palabra que suena (y la clave) en terracota
  nativo(ctx, t) {
    const b = bloqueEn(ctx, t); if (!b) return "";
    const { P } = ctx;
    const pal = b.map((w, i) => { const dicha = t >= w.inicio - 0.04, actual = dicha && (i === b.length - 1 || t < b[i + 1].inicio - 0.04); return `<span style="color:${actual || (dicha && w.clave) ? P.acento : dicha ? P.tinta : "#C4B8A8"}">${esc(w.texto)}</span>`; }).join(" ");
    return html(80, 1440, 920, 190, `<div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;padding:0 30px;box-sizing:border-box;font:700 62px/1.15 Oswald;text-transform:uppercase;letter-spacing:0.5px"><div>${pal}</div></div>`,
      `border:3px solid ${P.arena};border-radius:22px;background:#fff;box-sizing:border-box;box-shadow:0 8px 0 #E9E3D9`);
  },
  neon(ctx, t) {
    const b = bloqueEn(ctx, t); if (!b) return "";
    const { P } = ctx;
    const pal = b.map((w, i) => { const dicha = t >= w.inicio - 0.04, actual = dicha && (i === b.length - 1 || t < b[i + 1].inicio - 0.04); return `<span style="color:${actual || (dicha && w.clave) ? P.acento : dicha ? "#fff" : "#5b6676"}">${esc(w.texto)}</span>`; }).join(" ");
    return html(60, 1450, 960, 170, `<div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;font:700 58px/1.15 Poppins"><div>${pal}</div></div>`);
  },
  voxel(ctx, t) {
    const b = bloqueEn(ctx, t); if (!b) return "";
    const { P } = ctx;
    const pal = b.map((w, i) => { const u = (t - w.inicio + 0.04) / 0.16, dicha = u >= 0; const s = dicha ? 1 + 0.25 * Math.max(0, 1 - u) : 1; return `<span style="display:inline-block;visibility:${dicha ? "visible" : "hidden"};transform:scale(${s.toFixed(3)});color:${w.clave ? P.acento : "#fff"}">${esc(w.texto)}</span>`; }).join(" ");
    return html(40, 1230, 1000, 190, `<div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;font:68px/1.1 'Lilita One';-webkit-text-stroke:11px ${P.tinta};paint-order:stroke fill;filter:drop-shadow(0 6px 0 ${P.tinta})"><div>${pal}</div></div>`);
  },
  arcade(ctx, t) {
    const b = bloqueEn(ctx, t), { P } = ctx;
    const caja = `<rect x="40" y="1400" width="1000" height="240" fill="#000" stroke="#fff" stroke-width="7"/>`;
    if (!b) return caja;
    const completo = t >= b.at(-1).fin;
    const pal = b.map((w) => { const dicha = t >= w.inicio - 0.04; return `<span style="color:${dicha ? (w.clave ? P.acento : "#fff") : "#555a70"}">${esc(w.texto)}</span>`; }).join(" ");
    return caja + html(70, 1418, 940, 204, `<div style="display:flex;align-items:center;height:100%;font:700 42px/1.4 'Space Mono'"><div>${pal}</div></div>`)
      + (completo && Math.floor(t * 3) % 2 ? `<rect x="1000" y="1606" width="16" height="16" fill="${P.rojo}"/>` : "");
  },
};

// la firma (tu cuenta), con un avatar redondo: la imagen de juego.avatar o tus iniciales
function avatar(ctx, r, borde) {
  const ini = esc(String(ctx.firma || "?").replace(/^@/, "").slice(0, 1).toUpperCase());
  return ctx.avatar ? `<img src="${ctx.avatar}" style="width:${r * 2}px;height:${r * 2}px;border-radius:50%;object-fit:cover;border:${borde}"/>`
    : `<div style="width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:${ctx.P.acento};color:${ctx.P.tinta};display:flex;align-items:center;justify-content:center;font:800 ${r}px Poppins;border:${borde};box-sizing:border-box">${ini}</div>`;
}
const FIRMA = {
  nativo: (ctx) => html(80, 1690, 920, 70, `<div style="display:flex;align-items:center;justify-content:space-between;height:100%;font:400 32px Oswald;color:${ctx.P.gris};letter-spacing:1px">
    <span style="display:flex;align-items:center;gap:14px">${ctx.avatar ? avatar(ctx, 24, `2px solid ${ctx.P.arena}`) : ""}${esc(ctx.firma)}</span><span>Sigue →</span></div>`),
  neon: (ctx) => html(0, 1690, 1080, 70, `<div style="display:flex;align-items:center;justify-content:center;gap:14px;height:100%;font:700 28px 'Space Mono';color:#fff">${avatar(ctx, 26, "2px solid #2b3646")}${esc(ctx.firma)}</div>`),
  voxel: (ctx) => html(0, 1690, 1080, 80, `<div style="display:flex;justify-content:center;height:100%"><div style="display:flex;align-items:center;gap:12px;padding:6px 26px 6px 8px;border-radius:40px;background:rgba(27,36,51,.88);font:34px 'Lilita One';color:#fff">${avatar(ctx, 28, "3px solid #fff")}${esc(ctx.firma)}</div></div>`),
  arcade: (ctx) => html(0, 1690, 1080, 60, `<div style="display:flex;align-items:center;justify-content:center;gap:12px;height:100%;font:700 26px 'Space Mono';color:#c9cde0">${avatar(ctx, 22, "2px solid #fff")}${esc(ctx.firma)}</div>`),
};

// el acabado fijo de cada piel (encima de todo, pintado una vez): viñeta suave; en arcade, líneas de tubo de TV
export function acabadoJuego(N) {
  const vin = (op) => `<defs><radialGradient id="vinJ" cx="0.5" cy="0.5" r="0.75"><stop offset="0.65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#vinJ)"/>`;
  if (N === "arcade") return vin(0.45) + `<defs><pattern id="crt" width="4" height="6" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity="0.16"/></pattern></defs><rect width="1080" height="1920" fill="url(#crt)"/>`;
  if (N === "voxel") return vin(0.12);
  if (N === "nativo") return "";
  return vin(0.5);
}

// los efectos de sonido automáticos de un video modo juego: [{ t, nombre, db }]
export function sonidosJuego(ctx, tomas, cuando) {
  const S = ctx.P.sonidos, ev = [];
  const T = (tm, ref) => (typeof ref === "number" ? tm.inicio + ref : ref === undefined ? tm.inicio : cuando(ref));
  tomas.slice(1).forEach((tm) => ev.push({ t: tm.inicio - 0.08, s: S.corte }));
  tomas.forEach((tm, i) => {
    for (const e of tm.dibujo?.elementos || []) {
      if (e.sonido === false) continue;
      const t0 = T(tm, e.en ?? 0);
      if (e.sonido) ev.push({ t: t0 + (e.sonidoEn || 0), s: [e.sonido, e.sonidoDb ?? -12], fijo: true });
      else if (e.entra !== "ninguna" && t0 > tm.inicio + 0.05) ev.push({ t: t0, s: S.aparece });
    }
    const ti = ctx.titulos[i], ant = ctx.titulos[i - 1];
    if (ti && ti !== ant) ti.lineas.forEach((l) => { if (!ant || !ant.lineas.includes(l)) ev.push({ t: l.t, s: S.titulo }); });
    if (tm.alerta) ev.push({ t: tm.inicio, s: S.alerta, fijo: true });
  });
  if (ctx.prog) { for (const s of ctx.prog.pasos) if (Number.isFinite(s.t)) ev.push({ t: s.t, s: S.paso, fijo: true }); if (Number.isFinite(ctx.prog.tFinal)) ev.push({ t: ctx.prog.tFinal, s: S.fin, fijo: true }); }
  // sin amontonar: los automáticos, separados al menos 0,18 s
  ev.sort((a, b) => a.t - b.t);
  const out = []; let ult = -9;
  for (const e of ev) { if (!e.fijo && e.t - ult < 0.18) continue; out.push({ t: Math.max(0, e.t), nombre: e.s[0], db: e.s[1] }); if (!e.fijo) ult = e.t; }
  return out;
}
