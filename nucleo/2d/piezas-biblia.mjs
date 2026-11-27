// Barcada 2D · las piezas de historia bíblica (vidas de santos, Evangelio, catequesis), en el mismo estilo que
// piezas.mjs: contorno entintado, sombra de dos tonos, luz de borde y brillo. Centradas en (0, 0); los personajes
// tienen los pies en y ≈ 300 (unos 600 px de alto a escala 1, como «persona»).
//
// Personajes: jose, maria, jesus (edad bebe | nino | adulto), angel, pastor, rey, anciano, mago.
//   pose: quieta | reza | camina | saluda | senala | carga | trabaja | abre (brazos abiertos) | duerme (acostado)
//   lleva (con pose carga): nino | tablas | lampara | paloma | rollo · aureola 0-1 · mira -1 (mira a la izquierda)
//   ojos: abiertos | cerrados · boca: sonrie | seria | habla (se mueve sola)
import { PALETA, TINTA, brillo, caja, circulo, elipse, forma, sombraSuelo, trazo, uid } from "./estilo.mjs";

const lim = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u ?? 0));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");

// Paletas de la época: [claro, medio, oscuro, luz de borde]
export const TELAS = {
  lino: ["#fbf1dc", "#e6d2ae", "#b39a72", "#ffe9b8"],
  arena: ["#f2d9a8", "#d4ae72", "#8f6a3c", "#ffe6b0"],
  pardo: ["#c99a6a", "#8f5f36", "#4e2f17", "#ffd29a"],
  marron: ["#a8754a", "#6e4426", "#3a2212", "#ffc98a"],
  celeste: ["#bfe3ff", "#5f9fe0", "#2a5a9f", "#fff0c0"],
  azulmaria: ["#8fb8f0", "#3b6fc4", "#1d3a7a", "#ffe6a6"],
  rosado: ["#ffe1e4", "#f2b6bf", "#c27a88", "#fff3d6"],
  blanco: ["#ffffff", "#f4efe6", "#cfc4b2", "#ffe9a8"],
  oliva: ["#c9cf8a", "#8f9a4a", "#4f5a22", "#fff2b0"],
  vino: ["#e8889a", "#a8324a", "#5c1424", "#ffd9a8"],
  purpura: ["#c9a2f0", "#7a3fb8", "#3e1a6e", "#ffe6a6"],
  rojo: ["#ff9a86", "#d2412f", "#7f1c14", "#ffe08a"],
  verdeoscuro: ["#8fd0a0", "#3f8f5a", "#1f4f30", "#fff0b0"],
  oro: ["#fff1a6", "#f5c33b", "#b07a12", "#ffffff"],
  piel: ["#ffdcbf", "#eaa97c", "#a9643d", "#ffe2c0"],
  pielmorena: ["#e9b48a", "#c07f52", "#7a4527", "#ffd9b0"],
  pelo: ["#7a4b2a", "#4f2c16", "#2a160a", "#c98a5a"],
  pelonegro: ["#5a4636", "#33241a", "#170f0a", "#a88a70"],
  canas: ["#ffffff", "#dcd8d0", "#a39d92", "#ffffff"],
  rubio: ["#ffe7a0", "#f0c25a", "#a8761e", "#ffffff"],
  madera: ["#e0a872", "#a8683a", "#5e3418", "#ffd9a8"],
  maderaclara: ["#f3cf98", "#d09a5a", "#8a5a2a", "#fff0c8"],
  barro: ["#e8a070", "#c06a3a", "#6e3216", "#ffd0a0"],
  adobe: ["#f6dcb0", "#dcb37a", "#9c7442", "#fff0cf"],
  piedra: ["#ece4d4", "#c4b89e", "#857a62", "#fff6e0"],
  paja: ["#fff0a0", "#e8c65a", "#a88420", "#ffffff"],
  burro: ["#c9beb4", "#8f8378", "#4f463e", "#ffe6c8"],
  lana: ["#ffffff", "#f3eee4", "#c9bfae", "#fff2c8"],
  hoja: ["#a5e36a", "#4fae3f", "#22672b", "#ffe08a"],
  metal: ["#f3f5f7", "#aab3bd", "#5b6470", "#ffd9a8"],
  negro: ["#5b5f6a", "#2e323b", "#14161b", "#7fd3ff"],
};
// las telas que no existen en la paleta común se añaden (así forma(), caja() y circulo() las entienden por su nombre)
for (const [k, v] of Object.entries(TELAS)) if (!PALETA[k]) PALETA[k] = v;
const T = (n) => (Array.isArray(n) ? n : TELAS[n] || TELAS.lino);

// ------------------------------------------------------------------------------------------------ la figura
// Una figura con túnica y manto, de frente, de proporciones tiernas (cabeza grande). Todo lo de un personaje.
const PERSONAJES = {
  jose: { tunica: "arena", manto: "pardo", mantoTipo: "hombro", piel: "piel", pelo: "pelo", barba: true, cinto: "marron" },
  maria: { tunica: "rosado", manto: "azulmaria", mantoTipo: "velo", piel: "piel", pelo: "pelo", barba: false, cinto: null, velo: "blanco" },
  jesus: { tunica: "blanco", manto: "rojo", mantoTipo: "hombro", piel: "piel", pelo: "pelo", barba: false, cinto: "arena" },
  angel: { tunica: "blanco", manto: "oro", mantoTipo: "faja", piel: "piel", pelo: "rubio", barba: false, cinto: null, alas: true, flota: true },
  pastor: { tunica: "oliva", manto: "lana", mantoTipo: "hombro", piel: "pielmorena", pelo: "pelonegro", barba: true, cinto: "marron", tocado: "arena" },
  rey: { tunica: "purpura", manto: "vino", mantoTipo: "capa", piel: "piel", pelo: "pelonegro", barba: true, cinto: "oro", corona: true },
  anciano: { tunica: "blanco", manto: "celeste", mantoTipo: "velo", piel: "piel", pelo: "canas", barba: true, cinto: null, velo: "celeste", larga: true },
  mago: { tunica: "verdeoscuro", manto: "oro", mantoTipo: "capa", piel: "pielmorena", pelo: "pelonegro", barba: true, cinto: "oro", turbante: "blanco" },
};

function aureola(a, y = -170, r = 128) {
  if (!a) return "";
  return `<g opacity="${lim(a)}"><circle cx="0" cy="${y}" r="${r * 1.35}" fill="#ffe9a0" opacity="0.45" style="filter:blur(26px)"/>
    <circle cx="0" cy="${y}" r="${r}" fill="#fff6c8" opacity="0.55"/><circle cx="0" cy="${y}" r="${r}" fill="none" stroke="#f5c33b" stroke-width="9"/>
    <circle cx="0" cy="${y}" r="${r - 14}" fill="none" stroke="#fff" stroke-width="3" opacity="0.8"/></g>`;
}

function alas(t, abre = 1) {
  const bat = 6 * Math.sin(t * 2.4);
  const ala = (s) => `<g transform="scale(${s} 1) rotate(${-8 + bat})">${forma("M 40 -60 C 120 -230 290 -260 330 -170 C 300 -150 300 -120 320 -90 C 280 -80 270 -50 285 -20 C 240 -15 220 15 225 45 C 170 40 130 50 100 60 C 70 20 50 -20 40 -60 Z", "blanco", { sombra: 26, rim: 7,
    extra: trazo("M 90 -40 C 160 -110 230 -150 300 -165", "#cfc4b2", 6, 0.8) + trazo("M 100 10 C 160 -40 220 -70 290 -88", "#cfc4b2", 6, 0.8) + trazo("M 110 50 C 150 20 190 0 230 -10", "#cfc4b2", 6, 0.8) })}</g>`;
  return `<g transform="translate(0 -40) scale(${0.4 + 0.6 * lim(abre)})">${ala(-1)}${ala(1)}</g>`;
}

// La cara: ojos, cejas, mejillas, boca y lo que lleve en la cabeza.
function cara(c, o, hy, R) {
  const t = o.t || 0, cerr = o.ojos === "cerrados" || o.pose === "reza" || o.pose === "duerme";
  // parpadeo suave cada pocos segundos
  const parp = !cerr && (t * 0.37 + (o.semilla || 0)) % 1 > 0.965;
  const ojo = (x) => cerr || parp ? trazo(`M ${x - 15} ${hy + 4} Q ${x} ${hy + 16} ${x + 15} ${hy + 4}`, TINTA, 6)
    : `<ellipse cx="${x}" cy="${hy}" rx="11" ry="14" fill="${TINTA}"/><circle cx="${x + 4}" cy="${hy - 5}" r="4.5" fill="#fff"/>`;
  const habla = o.boca === "habla" ? 0.5 + 0.5 * Math.abs(Math.sin(t * 11)) : 0;
  const boca = o.boca === "seria" ? trazo(`M -16 ${hy + 46} L 16 ${hy + 46}`, TINTA, 6)
    : habla ? `<ellipse cx="0" cy="${hy + 48}" rx="14" ry="${4 + 9 * habla}" fill="#7a2a22" stroke="${TINTA}" stroke-width="5"/>`
    : c.barba ? `<path d="M -16 ${hy + 44} Q 0 ${hy + 58} 16 ${hy + 44} Z" fill="#a84a42" stroke="${TINTA}" stroke-width="4" stroke-linejoin="round"/>`
    : trazo(`M -20 ${hy + 40} Q 0 ${hy + 58} 20 ${hy + 40}`, TINTA, 6);
  const mej = `<ellipse cx="-50" cy="${hy + 28}" rx="20" ry="12" fill="#ff8a8a" opacity="0.35"/><ellipse cx="50" cy="${hy + 28}" rx="20" ry="12" fill="#ff8a8a" opacity="0.35"/>`;
  const cejas = c.barba ? trazo(`M -46 ${hy - 26} Q -32 ${hy - 34} -18 ${hy - 28}`, T(c.pelo)[2], 7) + trazo(`M 18 ${hy - 28} Q 32 ${hy - 34} 46 ${hy - 26}`, T(c.pelo)[2], 7) : "";
  // la barba cubre la boca por abajo: se dibuja antes que la boca para que la boca quede encima
  const barba = c.barba ? forma(`M ${-R + 6} ${hy - 6} C ${-R + 2} ${hy + 70} -50 ${hy + 112} 0 ${hy + 116} C 50 ${hy + 112} ${R - 2} ${hy + 70} ${R - 6} ${hy - 6} C ${R - 30} ${hy + 30} 40 ${hy + 34} 26 ${hy + 34} C 12 ${hy + 30} -12 ${hy + 30} -26 ${hy + 34} C -40 ${hy + 34} ${-R + 30} ${hy + 30} ${-R + 6} ${hy - 6} Z`, c.pelo, { sombra: 12, rim: 4, borde: 5 })
    + forma(`M -34 ${hy + 34} Q -18 ${hy + 24} 0 ${hy + 30} Q 18 ${hy + 24} 34 ${hy + 34} Q 18 ${hy + 42} 0 ${hy + 36} Q -18 ${hy + 42} -34 ${hy + 34} Z`, c.pelo, { sombra: 4, rim: 2, borde: 4 }) : "";
  return `${barba}${mej}${ojo(-32)}${ojo(32)}${cejas}${boca}`;
}

function cabeza(c, o, hy = -170, R = 88) {
  const pelo = T(c.pelo);
  // el pelo de detrás (melena), la cabeza, el pelo de delante
  const melenaLarga = c.mantoTipo === "velo" || c.alas || (o.edad === "adulto");
  const atras = c.mantoTipo === "velo"
    ? forma(`M ${-R - 34} ${hy + 10} C ${-R - 40} ${hy - 130} ${R + 40} ${hy - 130} ${R + 34} ${hy + 10} L ${R + 52} ${hy + 150} C 40 ${hy + 120} -40 ${hy + 120} ${-R - 52} ${hy + 150} Z`, c.velo || c.manto, { sombra: 20, rim: 6 })
    : melenaLarga ? forma(`M ${-R - 8} ${hy} C ${-R - 10} ${hy - 110} ${R + 10} ${hy - 110} ${R + 8} ${hy} L ${R + 14} ${hy + 90} Q 0 ${hy + 110} ${-R - 14} ${hy + 90} Z`, c.pelo, { sombra: 14, rim: 5 }) : "";
  const frente = c.mantoTipo === "velo"
    ? forma(`M ${-R - 4} ${hy + 6} C ${-R - 6} ${hy - 104} ${R + 6} ${hy - 104} ${R + 4} ${hy + 6} C ${R - 10} ${hy - 50} 40 ${hy - 70} 0 ${hy - 70} C -40 ${hy - 70} ${-R + 10} ${hy - 50} ${-R - 4} ${hy + 6} Z`, c.velo || c.manto, { sombra: 14, rim: 5 })
      + forma(`M -46 ${hy - 66} Q 0 ${hy - 84} 46 ${hy - 66} Q 20 ${hy - 50} 0 ${hy - 52} Q -20 ${hy - 50} -46 ${hy - 66} Z`, c.pelo, { sombra: 4, rim: 2, borde: 4 })
    : forma(`M ${-R - 4} ${hy + 4} C ${-R - 12} ${hy - 120} ${R + 12} ${hy - 120} ${R + 4} ${hy + 4} C ${R - 12} ${hy - 40} 30 ${hy - 62} 10 ${hy - 50} C -10 ${hy - 70} ${-R + 10} ${hy - 44} ${-R - 4} ${hy + 4} Z`, c.pelo, { sombra: 14, rim: 5 });
  let sobre = "";
  if (c.corona) sobre += forma(`M -70 ${hy - 70} L -78 ${hy - 150} L -40 ${hy - 110} L 0 ${hy - 165} L 40 ${hy - 110} L 78 ${hy - 150} L 70 ${hy - 70} Z`, "oro", { sombra: 12, rim: 4 }) + circulo(0, hy - 120, 12, "rojo") + brillo(-40, hy - 110, 10, 22, 0.7, 0);
  if (c.tocado) sobre += forma(`M ${-R - 10} ${hy - 20} C ${-R - 14} ${hy - 130} ${R + 14} ${hy - 130} ${R + 10} ${hy - 20} C 40 ${hy - 70} -40 ${hy - 70} ${-R - 10} ${hy - 20} Z`, c.tocado, { sombra: 12, rim: 4 }) + trazo(`M ${-R} ${hy - 40} Q 0 ${hy - 80} ${R} ${hy - 40}`, "#8f6a3c", 9);
  if (c.turbante) sobre += forma(`M ${-R - 14} ${hy - 30} C ${-R - 20} ${hy - 170} ${R + 20} ${hy - 170} ${R + 14} ${hy - 30} C 40 ${hy - 60} -40 ${hy - 60} ${-R - 14} ${hy - 30} Z`, c.turbante, { sombra: 14, rim: 5, extra: trazo(`M ${-R} ${hy - 60} Q 0 ${hy - 120} ${R} ${hy - 90}`, "#cfc4b2", 7) + trazo(`M ${-R} ${hy - 90} Q 0 ${hy - 150} ${R - 10} ${hy - 120}`, "#cfc4b2", 7) }) + circulo(0, hy - 92, 14, "rojo");
  return `${atras}${circulo(0, hy, R, c.piel, { sombra: 14 })}${cara(c, o, hy + 6, R)}${frente}${sobre}${brillo(-40, hy - 46, 26, 12, 0.35, -20)}`;
}

// El brazo: del hombro (x, y) con un ángulo (0 = colgando; + gira hacia la izquierda de la pantalla) y una mano.
const brazo = (c, x, y, ang, largo = 165) => `<g transform="translate(${x} ${y}) rotate(${ang})">${caja(-27, -6, 54, largo, 27, c.tunica, { sombra: 10, rim: 4 })}${caja(-31, largo - 40, 62, 40, 16, c.tunica, { sombra: 6, rim: 3, borde: 5 })}${circulo(0, largo + 10, 27, c.piel, { sombra: 5 })}</g>`;
const mano = (c, x, y) => circulo(x, y, 27, c.piel, { sombra: 5 });

// Lo que lleva en brazos (pose carga), dibujado delante del pecho.
function cosaEnBrazos(que, o) {
  switch (que) {
    case "nino": return `<g transform="translate(0 40) rotate(-12) scale(0.62)">${PIEZAS_BIBLIA.jesus({ ...o, edad: "bebe", aureola: o.aureolaNino ?? o.aureola ?? 0, mira: 1 })}</g>`;
    case "tablas": return `<g transform="translate(0 30) rotate(-18)">${PIEZAS_BIBLIA.tablas({ n: 3, largo: 360 })}</g>`;
    case "lampara": return `<g transform="translate(0 20) scale(0.55)">${PIEZAS_BIBLIA.lampara(o)}</g>`;
    case "paloma": return `<g transform="translate(0 20) scale(0.45)">${PIEZAS_BIBLIA.paloma(o)}</g><g transform="translate(40 10) scale(0.42) scale(-1 1)">${PIEZAS_BIBLIA.paloma(o)}</g>`;
    case "rollo": return `<g transform="translate(0 30) rotate(-8) scale(0.5)">${PIEZAS_BIBLIA.pergamino({ texto: o.textoRollo || "" })}</g>`;
    case "cofre": return `<g transform="translate(0 40) scale(0.4)">${PIEZAS_BIBLIA.cofrecito(o)}</g>`;
    default: return "";
  }
}

function figura(c, o) {
  const pose = o.pose || "quieta", t = o.t || 0;
  if (pose === "duerme") return acostado(c, o);
  const larga = c.larga || o.edad === "adulto";
  const camina = pose === "camina", paso = camina ? Math.sin(t * 6) : 0;
  const bob = camina ? -8 * Math.abs(Math.sin(t * 6)) : 0;
  const flota = c.flota ? 14 * Math.sin(t * 1.8) - 30 : 0;
  // brazos: [izquierdo, derecho] en grados (0 = colgando)
  const A = {
    quieta: [14, -14], camina: [14 + 16 * paso, -14 + 16 * paso], reza: [-38, 38], carga: [-55, 55],
    saluda: [14, -150 + 18 * Math.sin(t * 7)], senala: [14, -100], abre: [62, -62],
    trabaja: [-30, -120 + 55 * Math.max(0, Math.sin(t * 5))],
  }[pose] || [14, -14];
  const hy = -170;
  const hombro = -55;
  const tun = T(c.tunica);
  // la túnica: de los hombros al suelo, un poco acampanada
  const bajo = c.flota ? `L 118 230 Q 80 260 40 236 Q 0 262 -40 236 Q -80 260 -118 230` : `L 128 288 Q 0 300 -128 288`;
  const tunica = forma(`M -82 ${hombro} Q -96 ${hombro - 14} -70 ${hombro - 22} L 70 ${hombro - 22} Q 96 ${hombro - 14} 82 ${hombro} ${bajo} Z`, c.tunica, { sombra: 30, rim: 8,
    extra: trazo("M -20 40 Q -26 160 -36 280", tun[2], 6, 0.35) + trazo("M 30 60 Q 36 170 44 280", tun[2], 6, 0.35) });
  const cinto = c.cinto ? caja(-92, 52, 184, 26, 12, c.cinto, { sombra: 5, rim: 2, borde: 5 }) + trazo("M 30 78 Q 34 120 24 150", T(c.cinto)[2], 8) : "";
  let manto = "";
  if (c.mantoTipo === "hombro") manto = forma(`M -92 ${hombro - 6} Q -136 110 -124 ${c.flota ? 228 : 286} L -56 ${c.flota ? 234 : 292} Q -40 120 70 ${hombro - 18} Q 0 ${hombro - 40} -92 ${hombro - 6} Z`, c.manto, { sombra: 22, rim: 6, extra: trazo("M -90 20 Q -100 140 -96 280", T(c.manto)[2], 6, 0.4) });
  if (c.mantoTipo === "velo") manto = forma(`M -100 ${hombro - 10} Q -150 120 -138 290 L -86 292 Q -84 130 -60 ${hombro + 20} Z`, c.manto, { sombra: 18, rim: 6 }) + forma(`M 100 ${hombro - 10} Q 150 120 138 290 L 86 292 Q 84 130 60 ${hombro + 20} Z`, c.manto, { sombra: 18, rim: 6 });
  if (c.mantoTipo === "capa") manto = forma(`M -96 ${hombro - 10} Q -160 120 -146 292 L 146 292 Q 160 120 96 ${hombro - 10} Z`, c.manto, { sombra: 30, rim: 8 });
  if (c.mantoTipo === "faja") manto = forma(`M -84 ${hombro - 4} Q 0 40 92 150 L 100 110 Q 20 10 -60 ${hombro - 20} Z`, c.manto, { sombra: 10, rim: 4 });
  const pies = c.flota ? "" : `<g transform="translate(${-36 + 10 * paso} ${camina ? -6 * Math.max(0, paso) : 0})">${elipse(0, 292, 34, 16, "marron", { sombra: 4, rim: 2, borde: 5 })}${elipse(4, 284, 22, 12, c.piel, { sombra: 3, rim: 1, borde: 4 })}</g>
    <g transform="translate(${36 - 10 * paso} ${camina ? -6 * Math.max(0, -paso) : 0})">${elipse(0, 292, 34, 16, "marron", { sombra: 4, rim: 2, borde: 5 })}${elipse(-4, 284, 22, 12, c.piel, { sombra: 3, rim: 1, borde: 4 })}</g>`;
  const delante = pose === "reza" ? `${brazo(c, -88, hombro + 10, A[0], 120)}${brazo(c, 88, hombro + 10, A[1], 120)}
      ${forma("M -10 10 Q -40 -40 -6 -60 L 6 -60 Q 40 -40 10 10 Q 0 20 -10 10 Z", c.piel, { sombra: 6, rim: 3, borde: 5 }).replace("<g>", `<g transform="translate(0 52)">`)}`
    : pose === "carga" ? `${brazo(c, -88, hombro + 10, A[0], 130)}${cosaEnBrazos(o.lleva || "nino", o)}${brazo(c, 88, hombro + 10, A[1], 130)}`
    : pose === "trabaja" ? `${brazo(c, -88, hombro + 10, A[0], 150)}<g transform="translate(88 ${hombro + 10}) rotate(${A[1]})">${caja(-27, -6, 54, 165, 27, c.tunica, { sombra: 10, rim: 4 })}${circulo(0, 175, 27, c.piel, { sombra: 5 })}<g transform="translate(0 175) rotate(90) scale(0.55)">${PIEZAS_BIBLIA.martillo({})}</g></g>`
    : `${brazo(c, -88, hombro + 10, A[0])}${brazo(c, 88, hombro + 10, A[1])}`;
  const cuerpo = `${c.alas ? alas(t, o.alas ?? 1) : ""}${aureola(o.aureola ?? (c.alas ? 0.7 : 0), hy - 10)}
    ${pies}${c.mantoTipo === "capa" ? manto : ""}${tunica}${cinto}${c.mantoTipo !== "capa" ? manto : ""}
    ${caja(-26, hombro - 50, 52, 50, 20, c.piel, { sombra: 6, rim: 2 })}${cabeza(c, o, hy)}${delante}
    ${c.alas ? `<circle cx="0" cy="0" r="330" fill="#fff6c8" opacity="${0.18 + 0.06 * Math.sin(t * 2)}" style="filter:blur(50px)"/>` : ""}`;
  const sombra = c.flota ? sombraSuelo(0, 300, 110, 18, 0.18) : sombraSuelo(0, 300, 150);
  const escalaEdad = o.edad === "nino" ? 0.72 : 1;
  return `${sombra}<g transform="translate(0 ${bob + flota + (1 - escalaEdad) * 300}) scale(${(o.mira ?? 1) < 0 ? -escalaEdad : escalaEdad} ${escalaEdad})">${cuerpo}</g>`;
}

// Acostado durmiendo (para los sueños de José): sobre una estera, con una manta y la cabeza en una almohada.
function acostado(c, o) {
  const t = o.t || 0, resp = 1 + 0.025 * Math.sin(t * 2);
  const zz = o.zzz === false ? "" : rep(3, (i) => { const u = ((t * 0.5 + i / 3) % 1); return `<text x="${-170 + 60 * u + i * 10}" y="${40 - 220 * u}" font-family="Poppins" font-weight="800" font-size="${44 + 26 * u}" fill="#fff" stroke="${TINTA}" stroke-width="5" paint-order="stroke" opacity="${Math.sin(Math.PI * u).toFixed(2)}">z</text>`; });
  return `${sombraSuelo(20, 300, 300)}
    ${caja(-300, 240, 600, 60, 20, "paja", { sombra: 10, rim: 3 })}${rep(9, (i) => trazo(`M ${-280 + i * 66} 250 l 0 40`, "#a88420", 5, 0.6))}
    ${elipse(-215, 215, 100, 42, "lino", { sombra: 10, rim: 4 })}
    <g transform="translate(-205 150) rotate(-22) scale(0.78)">${cabeza(c, { ...o, ojos: "cerrados", pose: "duerme" }, 0)}</g>
    <g transform="translate(60 200) scale(1 ${resp})">${forma("M -190 40 C -200 -30 -120 -70 -40 -64 C 60 -90 220 -70 250 -20 C 270 20 260 60 240 80 L -190 80 Z", c.manto, { sombra: 22, rim: 6,
      extra: trazo("M -100 -50 Q -80 20 -110 76", T(c.manto)[2], 6, 0.35) + trazo("M 80 -70 Q 100 0 70 76", T(c.manto)[2], 6, 0.35) })}</g>
    ${aureola(o.aureola, 120, 100)}${zz}`;
}

// ------------------------------------------------------------------------------------------------ el catálogo
export const PIEZAS_BIBLIA = {
  jose: (o) => figura(PERSONAJES.jose, o),
  maria: (o) => figura(PERSONAJES.maria, o),
  angel: (o) => figura(PERSONAJES.angel, o),
  pastor: (o) => figura(PERSONAJES.pastor, o),
  rey: (o) => figura(PERSONAJES.rey, o),
  anciano: (o) => figura(PERSONAJES.anciano, o),
  mago: (o) => figura(PERSONAJES.mago, o),
  jesus(o) { // edad: bebe (envuelto en pañales) | nino (unos 12 años) | adulto
    const edad = o.edad || "bebe", t = o.t || 0;
    if (edad !== "bebe") return figura({ ...PERSONAJES.jesus, larga: edad === "adulto" }, { ...o, edad });
    const c = { ...PERSONAJES.jesus, barba: false, mantoTipo: "ninguno" };
    const resp = 1 + 0.02 * Math.sin(t * 2.5);
    return `${sombraSuelo(0, 150, 150, 26, 0.25)}${aureola(o.aureola ?? 0.8, -70, 100)}
      <g transform="scale(${resp})">${forma("M -150 40 C -160 -60 -60 -90 40 -80 C 130 -70 175 0 165 60 C 155 130 60 150 -20 146 C -110 142 -146 100 -150 40 Z", "lino", { sombra: 22, rim: 6,
        extra: trazo("M -60 -70 Q -30 40 -70 140", "#cfc4b2", 8, 0.8) + trazo("M 10 -80 Q 40 30 10 146", "#cfc4b2", 8, 0.8) + trazo("M 80 -66 Q 110 30 90 130", "#cfc4b2", 8, 0.8) })}</g>
      <g transform="translate(-120 -40)">${circulo(0, 0, 72, c.piel, { sombra: 10 })}
        ${forma("M -70 -10 C -76 -90 76 -90 70 -10 C 50 -44 20 -56 0 -50 C -20 -58 -50 -44 -70 -10 Z", c.pelo, { sombra: 8, rim: 3, borde: 5 })}
        ${trazo("M -38 8 Q -26 18 -14 8", TINTA, 6)}${trazo("M 14 8 Q 26 18 38 8", TINTA, 6)}${trazo("M -12 34 Q 0 42 12 34", TINTA, 5)}
        <ellipse cx="-40" cy="28" rx="15" ry="9" fill="#ff8a8a" opacity="0.4"/><ellipse cx="40" cy="28" rx="15" ry="9" fill="#ff8a8a" opacity="0.4"/></g>`;
  },

  // ------------------------------------------------------------------ animales
  burro(o) { // carga: maria | maria_nino | bultos | (nada); camina: true (las patas se mueven); mira -1
    const t = o.t || 0, an = o.camina ? Math.sin(t * 6) : 0, bob = o.camina ? -5 * Math.abs(Math.sin(t * 6)) : 0;
    const pata = (x, f) => `<g transform="translate(${x} 110) rotate(${22 * f})">${caja(-18, 0, 36, 175, 16, "burro", { sombra: 8, rim: 3 })}${caja(-22, 160, 44, 30, 10, "negro", { sombra: 4, rim: 2, borde: 5 })}</g>`;
    const cuerpo = `${pata(-120, -an)}${pata(100, an)}
      ${forma("M 230 -70 C 230 -140 120 -150 60 -110 L -140 -110 C -230 -110 -250 -10 -230 50 C -220 110 -160 130 -100 130 L 120 130 C 200 130 240 70 230 -70 Z", "burro", { sombra: 30, rim: 8 })}
      ${pata(-60, an)}${pata(160, -an)}
      ${forma("M -230 -40 Q -290 -10 -300 80 Q -280 60 -262 70 Q -270 10 -222 0 Z", "burro", { sombra: 6, rim: 3, borde: 5 })}
      <g transform="translate(200 -110) rotate(${-30 + 4 * Math.sin(t * 1.7)})">${caja(-40, -150, 90, 170, 40, "burro", { sombra: 14, rim: 5 })}
        ${forma("M -20 -150 C -50 -260 -10 -300 10 -290 C 20 -250 20 -200 14 -150 Z", "burro", { sombra: 8, rim: 3, extra: trazo("M 0 -270 Q 6 -220 6 -160", "#ffd9d0", 10, 0.6) })}
        ${forma("M 30 -150 C 40 -260 90 -290 100 -270 C 90 -220 70 -180 54 -140 Z", "burro", { sombra: 8, rim: 3 })}</g>
      <g transform="translate(310 -230) rotate(${-10 + 4 * Math.sin(t * 1.7)})">${elipse(0, 0, 110, 76, "burro", { sombra: 16, rim: 6 })}${elipse(70, 20, 60, 50, "lana", { sombra: 10, rim: 4 })}
        <circle cx="96" cy="16" r="8" fill="${TINTA}"/><ellipse cx="-14" cy="-16" rx="12" ry="15" fill="${TINTA}"/><circle cx="-10" cy="-21" r="5" fill="#fff"/>${trazo("M 60 52 Q 90 62 112 46", TINTA, 5)}</g>
      ${forma("M -40 -150 L 160 -150 Q 190 -120 170 -40 L -60 -40 Q -80 -120 -40 -150 Z", "vino", { sombra: 12, rim: 4, extra: trazo("M -60 -60 L 172 -60", "#f5c33b", 8) })}`;
    let carga = "";
    if (o.carga === "bultos") carga = `${elipse(-10, -190, 90, 60, "arena", { sombra: 14, rim: 5 })}${elipse(110, -180, 70, 50, "pardo", { sombra: 12, rim: 4 })}${trazo("M -90 -200 Q 40 -150 170 -200", "#6e4426", 8)}`;
    if (o.carga === "maria" || o.carga === "maria_nino") {
      // María sentada de lado: el manto y la túnica caen por el costado del burro y asoman los pies
      const id = uid("jin"), corte = o.carga === "maria_nino" ? 140 : 60, y0 = -222 + 0.8 * corte - 6;
      carga = `${forma(`M -14 ${y0} Q 50 ${y0 - 14} 134 ${y0} Q 160 -40 170 70 Q 120 90 80 76 Q 40 92 -10 74 Q -30 -40 -14 ${y0} Z`, "rosado", { sombra: 22, rim: 6, extra: trazo(`M 40 ${y0 + 20} Q 50 -40 46 70`, "#c27a88", 6, 0.4) })}
        ${forma(`M -24 ${y0} Q -40 -40 -26 76 L 20 80 Q 8 -40 26 ${y0} Z`, "azulmaria", { sombra: 10, rim: 4 })}${forma(`M 124 ${y0} Q 160 -40 176 72 L 140 80 Q 120 -40 94 ${y0} Z`, "azulmaria", { sombra: 10, rim: 4 })}
        ${elipse(50, 86, 30, 14, "marron", { sombra: 3, rim: 1, borde: 5 })}${elipse(96, 90, 30, 14, "marron", { sombra: 3, rim: 1, borde: 5 })}
        <defs><clipPath id="${id}"><rect x="-400" y="-500" width="800" height="${500 + corte}"/></clipPath></defs>
        <g transform="translate(60 -222) scale(0.8)"><g clip-path="url(#${id})">${figura({ ...PERSONAJES.maria }, { ...o, pose: o.carga === "maria_nino" ? "carga" : (o.poseJinete || "quieta"), lleva: "nino", mira: 1, aureola: o.aureolaJinete ?? 0, camina: false, t: o.t })}</g></g>`;
    }
    return `${sombraSuelo(30, 300, 290)}<g transform="scale(${(o.mira ?? 1) < 0 ? -1 : 1} 1) translate(0 ${bob})"><g transform="translate(-30 0)">${cuerpo}${carga}</g></g>`;
  },
  oveja(o) {
    const t = o.t || 0;
    const lana = rep(9, (i) => { const a = (i / 9) * Math.PI * 2; return circulo(Math.cos(a) * 130, Math.sin(a) * 80, 70, "lana", { sombra: 12, rim: 4 }); });
    return `${sombraSuelo(0, 230, 190)}${rep(4, (i) => caja(-110 + i * 70, 80, 30, 150, 14, "negro", { sombra: 6, rim: 2 }))}
      ${circulo(0, 0, 140, "lana", { sombra: 20 })}${lana}${circulo(0, 0, 120, "lana", { sombra: 0, rim: 0, contorno: false })}
      <g transform="translate(170 -30) rotate(${5 * Math.sin(t * 2)})">${elipse(0, 0, 64, 80, "negro", { sombra: 10, rim: 4 })}${elipse(-50, -40, 40, 18, "negro", { sombra: 4 })}${elipse(50, -40, 40, 18, "negro", { sombra: 4 })}
        ${circulo(0, -60, 40, "lana", { sombra: 6 })}<circle cx="-22" cy="-6" r="9" fill="#fff"/><circle cx="22" cy="-6" r="9" fill="#fff"/></g>`;
  },
  paloma(o) { // vuela: true (bate las alas)
    const t = o.t || 0, bat = o.vuela ? 30 * Math.sin(t * 12) : 0;
    return `${o.vuela ? "" : sombraSuelo(0, 150, 110)}
      <g transform="rotate(${-bat}) translate(-10 -20)">${forma("M 0 0 C -40 -140 -180 -160 -220 -120 C -170 -100 -150 -60 -120 -30 Z", "blanco", { sombra: 14, rim: 4 })}</g>
      ${forma("M -170 40 C -120 -60 60 -80 130 -20 C 160 10 150 60 100 80 L -60 90 C -120 90 -160 70 -170 40 Z", "blanco", { sombra: 24, rim: 7 })}
      ${forma("M -150 50 L -250 20 L -250 90 Z", "blanco", { sombra: 8, rim: 3 })}
      ${circulo(150, -30, 54, "blanco", { sombra: 10 })}${forma("M 196 -40 L 240 -26 L 196 -14 Z", "naranja", { sombra: 3, rim: 1, borde: 4 })}
      <circle cx="164" cy="-40" r="9" fill="${TINTA}"/><circle cx="167" cy="-43" r="3" fill="#fff"/>
      ${o.vuela ? "" : `${trazo("M -10 90 l -10 60 M 40 90 l 10 60", "#d2412f", 8)}`}
      <g transform="rotate(${bat * 0.6}) translate(10 -10)">${forma("M 0 0 C 20 -130 140 -170 200 -140 C 150 -110 120 -60 90 -20 Z", "blanco", { sombra: 14, rim: 4 })}</g>`;
  },
  camello(o) {
    const t = o.t || 0, an = o.camina ? Math.sin(t * 5) : 0;
    const pata = (x, f) => `<g transform="translate(${x} 60) rotate(${18 * f})">${caja(-18, 0, 36, 230, 16, "arena", { sombra: 8, rim: 3 })}</g>`;
    return `${sombraSuelo(0, 300, 280)}${pata(-140, -an)}${pata(120, an)}
      ${forma("M -220 40 C -250 -60 -200 -120 -130 -110 C -100 -230 10 -230 30 -120 C 60 -200 160 -200 170 -90 C 220 -80 240 0 220 60 C 200 100 -190 100 -220 40 Z", "arena", { sombra: 30, rim: 8 })}
      ${pata(-80, an)}${pata(180, -an)}
      ${forma("M 190 -40 C 260 -80 280 -200 300 -280 L 360 -270 C 340 -180 310 -60 230 20 Z", "arena", { sombra: 12, rim: 5 })}
      <g transform="translate(345 -290)">${elipse(0, 0, 80, 46, "arena", { sombra: 10, rim: 4 })}<ellipse cx="-10" cy="-12" rx="10" ry="12" fill="${TINTA}"/>${elipse(-34, -40, 16, 22, "arena", { sombra: 4 })}</g>
      ${forma("M -150 -100 Q -60 -60 60 -100 L 50 -40 Q -60 -10 -150 -40 Z", "vino", { sombra: 8, rim: 3 })}`;
  },

  // ------------------------------------------------------------------ el taller de carpintero
  martillo(o) {
    return `<g transform="rotate(${o.giro || 0})">${caja(-22, -40, 44, 300, 18, "madera", { sombra: 10, rim: 4 })}
      ${forma("M -110 -110 L 90 -110 Q 120 -110 120 -80 L 120 -40 L -110 -40 Q -150 -60 -110 -110 Z", "metal", { sombra: 14, rim: 5 })}${brillo(-40, -92, 50, 8, 0.7, 0)}</g>`;
  },
  serrucho(o) {
    const dientes = rep(14, (i) => `L ${-190 + i * 26 + 13} ${92} L ${-190 + (i + 1) * 26} 70`);
    return `<g transform="rotate(${o.giro || 0})">${forma(`M -190 -40 L 170 -10 L 170 70 ${dientes.replace(/L 174 70$/, "")} L -190 70 Z`, "metal", { sombra: 12, rim: 4 })}
      ${forma("M 160 -40 L 290 -60 Q 320 -20 300 50 L 170 80 Z", "madera", { sombra: 14, rim: 5 })}${elipse(240, 0, 30, 22, "pardo", { sombra: 0, rim: 0 })}${brillo(-60, 10, 110, 10, 0.6, 4)}</g>`;
  },
  tablas(o) { // n tablas apiladas; largo
    const n = o.n || 3, L = o.largo || 520;
    return `${sombraSuelo(0, 30 + n * 10, L / 2)}${rep(n, (i) => `<g transform="translate(${(i % 2 ? 14 : -10)} ${-i * 46})">${caja(-L / 2, -22, L, 46, 8, i % 2 ? "maderaclara" : "madera", { sombra: 10, rim: 3,
      extra: trazo(`M ${-L / 2 + 40} -6 Q ${-L / 4} 4 0 -4 T ${L / 2 - 30} -2`, "#5e3418", 3, 0.4) })}</g>`)}`;
  },
  banco(o) { // la mesa de carpintero, con viruta y una tabla
    return `${sombraSuelo(0, 300, 330)}
      ${caja(-300, 40, 46, 260, 10, "madera", { sombra: 8, rim: 3 })}${caja(254, 40, 46, 260, 10, "madera", { sombra: 8, rim: 3 })}
      ${caja(-290, 190, 580, 30, 8, "madera", { sombra: 6, rim: 2 })}
      ${caja(-340, -20, 680, 70, 12, "maderaclara", { sombra: 14, rim: 4, extra: trazo("M -300 0 Q -100 10 100 -2 T 320 4", "#8a5a2a", 3, 0.5) })}
      ${o.tabla === false ? "" : `<g transform="translate(-60 -46)">${caja(-200, -16, 400, 32, 6, "madera", { sombra: 6, rim: 2 })}</g>`}
      ${rep(5, (i) => `<path d="M ${120 + i * 30} -28 q 18 -26 36 0" fill="none" stroke="#f3cf98" stroke-width="8" stroke-linecap="round"/>`)}
      ${o.herramientas === false ? "" : `<g transform="translate(220 -40) rotate(70) scale(0.4)">${PIEZAS_BIBLIA.martillo({})}</g>`}`;
  },
  silla(o) { // lo que hace José: una silla de madera
    return `${sombraSuelo(0, 300, 160)}${caja(-130, -260, 34, 560, 12, "madera", { sombra: 8, rim: 3 })}${caja(96, -260, 34, 560, 12, "madera", { sombra: 8, rim: 3 })}
      ${rep(3, (i) => caja(-110, -230 + i * 70, 220, 26, 8, "maderaclara", { sombra: 5, rim: 2 }))}
      ${caja(-150, 40, 300, 50, 10, "maderaclara", { sombra: 10, rim: 3 })}${caja(-110, 200, 220, 20, 6, "madera", { sombra: 4, rim: 2 })}`;
  },

  // ------------------------------------------------------------------ lugares y cosas
  casaadobe(o) { // de adobe, techo plano con vigas; luz: la ventana encendida (0-1)
    const l = lim(o.luz);
    return `${sombraSuelo(0, 300, 330)}
      ${forma("M -300 -150 L 300 -150 L 300 300 L -300 300 Z", o.color || "adobe", { sombra: 40, rim: 8,
        extra: rep(6, (i) => `<ellipse cx="${-220 + (i * 97) % 440}" cy="${-60 + (i * 131) % 300}" rx="${30 + (i % 3) * 14}" ry="10" fill="#9c7442" opacity="0.18"/>`) })}
      ${caja(-330, -190, 660, 50, 10, "adobe", { sombra: 10, rim: 3 })}
      ${rep(5, (i) => `<g transform="translate(${-260 + i * 130} -160)">${caja(-14, -12, 28, 28, 6, "madera", { sombra: 4, rim: 2, borde: 4 })}</g>`)}
      ${forma("M -80 300 L -80 100 Q -80 30 0 30 Q 80 30 80 100 L 80 300 Z", "marron", { sombra: 16, rim: 4 })}
      ${caja(130, -60, 110, 100, 14, "negro", { sombra: 6, rim: 2 })}
      ${l > 0 ? `<rect x="138" y="-52" width="94" height="84" rx="10" fill="#ffd27a" opacity="${l}"/><circle cx="185" cy="-10" r="120" fill="#ffc35a" opacity="${0.35 * l}" style="filter:blur(30px)"/>` : ""}`;
  },
  pesebre(o) { // con paja; nino: true pone al Niño dentro; luz 0-1
    const l = lim(o.luz ?? (o.nino ? 1 : 0));
    return `${sombraSuelo(0, 300, 260)}
      ${l ? `<circle cx="0" cy="-40" r="300" fill="#fff0b0" opacity="${0.5 * l}" style="filter:blur(50px)"/>` : ""}
      <g transform="translate(-170 120) rotate(22)">${caja(-18, -30, 36, 240, 10, "madera", { sombra: 6, rim: 2 })}</g><g transform="translate(-170 120) rotate(-22)">${caja(-18, -30, 36, 240, 10, "madera", { sombra: 6, rim: 2 })}</g>
      <g transform="translate(170 120) rotate(22)">${caja(-18, -30, 36, 240, 10, "madera", { sombra: 6, rim: 2 })}</g><g transform="translate(170 120) rotate(-22)">${caja(-18, -30, 36, 240, 10, "madera", { sombra: 6, rim: 2 })}</g>
      ${forma("M -270 -10 Q 0 30 270 -10 L 270 30 Q 0 70 -270 30 Z", "paja", { sombra: 8, rim: 3 })}
      ${rep(18, (i) => trazo(`M ${-250 + i * 28} ${-6 + (i % 3) * 4} l ${(i % 2 ? 14 : -14)} ${-40 - (i % 4) * 8}`, "#e8c65a", 6))}
      ${o.nino ? `<g transform="translate(10 -40) scale(0.85)">${PIEZAS_BIBLIA.jesus({ ...o, edad: "bebe", aureola: o.aureola ?? 0.8 })}</g>` : ""}
      ${forma("M -260 0 L 260 0 L 220 140 L -220 140 Z", "madera", { sombra: 22, rim: 6, extra: trazo("M -240 50 L 240 50", "#5e3418", 5, 0.5) + trazo("M -230 95 L 230 95", "#5e3418", 5, 0.5) })}`;
  },
  estrella(o) { // la estrella de Belén: cola (0-1) la estela de luz hacia abajo
    const t = o.t || 0, cola = lim(o.cola ?? 1), pul = 1 + 0.06 * Math.sin(t * 3);
    const puntas = (n, R, r) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r : R; d += `${i ? "L" : "M"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `; } return d + "Z"; };
    return `${cola ? `<path d="M -30 0 L 30 0 L 140 ${900 * cola} L -140 ${900 * cola} Z" fill="url(#colaEst)" opacity="0.7"/><defs><linearGradient id="colaEst" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient></defs>` : ""}
      <circle r="${200 * pul}" fill="#fff3b0" opacity="0.45" style="filter:blur(40px)"/>
      <g transform="scale(${pul}) rotate(${3 * Math.sin(t)})">${forma(puntas(4, 190, 40), "oro", { sombra: 20, rim: 6 })}<g transform="rotate(45) scale(0.55)">${forma(puntas(4, 190, 40), "oro", { sombra: 14, rim: 5 })}</g>${circulo(0, 0, 36, "blanco", { sombra: 4 })}</g>`;
  },
  haz(o) { // un haz de luz que baja del cielo (apariciones): ancho, largo, brillo 0-1
    const b = lim(o.brillo ?? 1), w = o.ancho || 420, L = o.largo || 1400, t = o.t || 0, id = uid("hz");
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.95"/><stop offset="0.7" stop-color="#fff2b0" stop-opacity="0.45"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></linearGradient></defs>
      <path d="M ${-w * 0.25} ${-L} L ${w * 0.25} ${-L} L ${w / 2} 0 L ${-w / 2} 0 Z" fill="url(#${id})" opacity="${b * (0.75 + 0.08 * Math.sin(t * 2))}" style="filter:blur(10px)"/>
      ${rep(14, (i) => { const u = ((t * 0.15 + i / 14) % 1); return `<circle cx="${(-w / 2 + ((i * 97) % w)) * (0.4 + 0.6 * u)}" cy="${-L * (1 - u)}" r="${3 + (i % 3) * 2}" fill="#fff" opacity="${(b * Math.sin(Math.PI * u)).toFixed(2)}"/>`; })}`;
  },
  piramide(o) {
    return `${sombraSuelo(0, 300, 440)}${forma("M 0 -320 L 420 300 L -420 300 Z", "arena", { sombra: 0, rim: 0 })}
      ${forma("M 0 -320 L 420 300 L 90 300 Z", ["#d4ae72", "#b08850", "#8f6a3c", "#ffe6b0"], { sombra: 0, rim: 0 })}
      ${rep(8, (i) => { const y = -240 + i * 68, x = 420 * ((y + 320) / 620); return trazo(`M ${-x} ${y} L ${x} ${y}`, "#8f6a3c", 4, 0.45); })}`;
  },
  palmera(o) {
    const t = o.t || 0, v = 4 * Math.sin(t * 1.3);
    const hoja = (r) => `<g transform="rotate(${r + v})">${forma("M 0 0 C 80 -60 200 -50 270 30 C 200 0 120 10 0 22 Z", "hoja", { sombra: 12, rim: 4, extra: trazo("M 10 10 C 100 -20 190 -10 260 26", "#22672b", 5, 0.6) })}</g>`;
    return `${sombraSuelo(0, 300, 160)}${forma("M -30 300 C -20 100 10 -100 30 -330 L 66 -326 C 50 -100 40 100 36 300 Z", "pardo", { sombra: 14, rim: 4,
      extra: rep(10, (i) => trazo(`M -30 ${260 - i * 60} q 40 14 70 0`, "#4e2f17", 5, 0.5)) })}
      <g transform="translate(46 -330)">${hoja(-170)}${hoja(-130)}${hoja(-60)}${hoja(-20)}${hoja(20)}${hoja(-100)}${circulo(0, 10, 30, "pardo", { sombra: 6 })}</g>`;
  },
  olivo(o) {
    return `${sombraSuelo(0, 300, 220)}${forma("M -40 300 C -30 180 -90 100 -30 0 L 20 0 C 60 80 30 180 50 300 Z", "pardo", { sombra: 16, rim: 5 })}
      ${circulo(-120, -80, 130, "oliva")}${circulo(110, -70, 125, "oliva")}${circulo(0, -170, 150, "oliva")}${circulo(-10, -40, 110, "oliva")}
      ${rep(10, (i) => `<ellipse cx="${-160 + (i * 67) % 320}" cy="${-220 + (i * 53) % 240}" rx="14" ry="6" fill="#4f5a22" opacity="0.55" transform="rotate(${(i * 40) % 180} ${-160 + (i * 67) % 320} ${-220 + (i * 53) % 240})"/>`)}`;
  },
  templo(o) {
    return `${sombraSuelo(0, 300, 420)}
      ${rep(3, (i) => caja(-420 + i * 30, 230 - i * 40, 840 - i * 60, 50, 6, "piedra", { sombra: 8, rim: 3 }))}
      ${caja(-330, -210, 660, 330, 8, "piedra", { sombra: 30, rim: 6 })}
      ${rep(6, (i) => caja(-300 + i * 112, -190, 50, 340, 12, "blanco", { sombra: 14, rim: 4, extra: trazo(`M ${-285 + i * 112} -180 L ${-285 + i * 112} 140`, "#cfc4b2", 4, 0.6) }))}
      ${forma("M -380 -210 L 0 -380 L 380 -210 Z", "piedra", { sombra: 20, rim: 5 })}${caja(-380, -240, 760, 40, 6, "oro", { sombra: 8, rim: 3 })}
      ${forma("M -60 150 L -60 0 Q -60 -60 0 -60 Q 60 -60 60 0 L 60 150 Z", "oro", { sombra: 14, rim: 5 })}`;
  },
  lampara(o) { // la lámpara de aceite de barro, con llama que tiembla
    const t = o.t || 0, f = 1 + 0.12 * Math.sin(t * 13) + 0.06 * Math.sin(t * 29);
    return `<circle cx="150" cy="-60" r="${180 * f}" fill="#ffc35a" opacity="0.35" style="filter:blur(40px)"/>${sombraSuelo(0, 100, 220)}
      ${forma("M -200 0 C -200 -70 -60 -90 40 -70 C 120 -56 180 -40 220 -40 C 230 -10 200 20 150 30 C 80 90 -160 100 -200 0 Z", "barro", { sombra: 26, rim: 6 })}
      ${elipse(-40, -60, 60, 16, "negro", { sombra: 0, rim: 0 })}
      ${forma("M -230 -10 Q -290 -50 -260 -100 Q -250 -60 -200 -40 Z", "barro", { sombra: 6, rim: 3 })}
      <g transform="translate(200 -48) scale(${f.toFixed(3)})"><path d="M 0 0 C -36 -30 -20 -90 0 -130 C 20 -90 36 -30 0 0 Z" fill="#ffb02e" stroke="${TINTA}" stroke-width="5"/><path d="M 0 -8 C -16 -26 -8 -60 0 -84 C 8 -60 16 -26 0 -8 Z" fill="#fff4b0"/></g>`;
  },
  pergamino(o) { // texto (opcional, corto)
    return `${sombraSuelo(0, 220, 300)}${caja(-280, -180, 560, 380, 20, "lino", { sombra: 20, rim: 5,
      extra: rep(7, (i) => o.texto ? "" : trazo(`M -200 ${-110 + i * 44} L ${150 - (i % 3) * 50} ${-110 + i * 44}`, "#b39a72", 8, 0.7)) })}
      ${elipse(-290, 10, 40, 210, "madera", { sombra: 10, rim: 4 })}${elipse(290, 10, 40, 210, "madera", { sombra: 10, rim: 4 })}
      ${o.texto ? `<text y="30" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="${Math.min(70, Math.round(900 / Math.max(6, String(o.texto).length)))}" fill="#5e3418">${esc(o.texto)}</text>` : ""}`;
  },
  lirio(o) { // el lirio de San José; abre 0-1
    const a = lim(o.abre ?? 1);
    const petalo = (r) => `<g transform="rotate(${r}) scale(${0.3 + 0.7 * a})">${forma("M 0 0 C -40 -60 -30 -150 0 -200 C 30 -150 40 -60 0 0 Z", "blanco", { sombra: 12, rim: 4, extra: trazo("M 0 -10 L 0 -170", "#e6d2ae", 5, 0.7) })}</g>`;
    return `${forma("M -6 300 C -12 150 0 0 6 -100 L 20 -100 C 14 0 10 150 14 300 Z", "hoja", { sombra: 6, rim: 2, borde: 5 })}
      <g transform="translate(-10 120) rotate(-40)">${PIEZAS_BIBLIA_HOJA()}</g><g transform="translate(20 40) rotate(40) scale(-1 1)">${PIEZAS_BIBLIA_HOJA()}</g>
      <g transform="translate(12 -110)">${petalo(-70)}${petalo(70)}${petalo(-25)}${petalo(25)}${petalo(0)}
        ${rep(3, (i) => `<g transform="rotate(${-20 + i * 20})">${trazo("M 0 0 L 0 -90", "#8f9a4a", 4)}${elipse(0, -96, 10, 16, "naranja", { sombra: 2, rim: 1, borde: 3 })}</g>`)}</g>`;
  },
  vara(o) { // la vara florecida de José (tradición): florece 0-1
    const f = lim(o.florece ?? 1);
    return `${forma("M -14 300 C -20 100 -10 -150 0 -330 L 20 -330 C 26 -150 22 100 18 300 Z", "madera", { sombra: 8, rim: 3, borde: 5 })}
      ${f > 0 ? `<g transform="translate(10 -330) scale(${0.25 * f})">${PIEZAS_BIBLIA.lirio({ abre: f })}</g>` : ""}
      ${rep(3, (i) => f > 0.2 * (i + 1) ? `<g transform="translate(${i % 2 ? 30 : -14} ${-240 + i * 70}) scale(${0.16 * f})">${PIEZAS_BIBLIA.lirio({ abre: f })}</g>` : "")}`;
  },
  cofrecito(o) { // los regalos de los magos
    return `${sombraSuelo(0, 150, 200)}${caja(-180, -40, 360, 190, 16, "madera", { sombra: 20, rim: 5 })}${forma("M -190 -40 Q 0 -170 190 -40 Z", "oro", { sombra: 16, rim: 5 })}
      ${caja(-190, -50, 380, 30, 8, "oro", { sombra: 6, rim: 2 })}${caja(-26, 20, 52, 60, 10, "oro", { sombra: 6, rim: 2 })}${brillo(-80, -70, 40, 10, 0.7, -10)}`;
  },
  corona(o) {
    return `${forma("M -200 120 L -230 -120 L -100 0 L 0 -170 L 100 0 L 230 -120 L 200 120 Z", "oro", { sombra: 26, rim: 7 })}${circulo(0, 40, 30, "rojo")}${circulo(-120, 60, 22, "azulmaria")}${circulo(120, 60, 22, "verdeoscuro")}${brillo(-100, -10, 20, 50, 0.6, 20)}`;
  },
  cruz(o) {
    return `${caja(-34, -300, 68, 600, 12, "madera", { sombra: 14, rim: 4 })}${caja(-180, -170, 360, 64, 12, "madera", { sombra: 12, rim: 4 })}`;
  },
  corazones(o) { // el corazón de la Sagrada Familia: llama encima
    const t = o.t || 0, f = 1 + 0.1 * Math.sin(t * 10);
    return `<g transform="translate(0 -230) scale(${f})"><path d="M 0 0 C -50 -40 -30 -110 0 -160 C 30 -110 50 -40 0 0 Z" fill="#ffb02e" stroke="${TINTA}" stroke-width="6"/></g>
      ${forma("M 0 190 C -60 140 -220 40 -220 -60 C -220 -150 -150 -200 -90 -200 C -40 -200 -10 -170 0 -140 C 10 -170 40 -200 90 -200 C 150 -200 220 -150 220 -60 C 220 40 60 140 0 190 Z", "rojo", { sombra: 36, rim: 10 })}${brillo(-110, -120, 50, 26, 0.6, -30)}`;
  },
  zzz(o) { // z que suben (sueños)
    const t = o.t || 0;
    return rep(3, (i) => { const u = ((t * 0.5 + i / 3) % 1); return `<text x="${60 * u + i * 20}" y="${-260 * u}" font-family="Poppins" font-weight="800" font-size="${60 + 40 * u}" fill="#fff" stroke="${TINTA}" stroke-width="6" paint-order="stroke" opacity="${Math.sin(Math.PI * u).toFixed(2)}">z</text>`; });
  },
  nubesueno(o) { // la nube del sueño: dentro, otra pieza (dentro: "angel", "burro"…, con sus params en dentroParams)
    const t = o.t || 0, d = o.dentro && PIEZAS_BIBLIA[o.dentro];
    const bolas = [[-200, 20, 120], [-80, -70, 150], [80, -80, 150], [210, 10, 120], [0, 60, 170], [-150, 110, 100], [160, 110, 100]];
    return `${circulo(-260, 230, 26, "blanco", { sombra: 4 })}${circulo(-300, 300, 16, "blanco", { sombra: 3 })}
      <g transform="translate(0 ${6 * Math.sin(t * 1.5)})">${bolas.map(([x, y, r]) => circulo(x, y, r, "blanco", { sombra: 14, rim: 4 })).join("")}
      ${bolas.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 6}" fill="#fff"/>`).join("")}
      ${d ? `<g transform="translate(0 20) scale(${o.dentroEscala || 0.42})">${d({ t, ...(o.dentroParams || {}) })}</g>` : ""}</g>`;
  },
  rotulo(o) { // un cartel de época (madera) con texto: lugares y fechas («NAZARET», «AÑO 1»)
    const tx = esc(o.texto || "NAZARET"), w = Math.max(320, tx.length * 44 + 120);
    return `${caja(-14, 40, 28, 260, 8, "madera", { sombra: 6, rim: 2 })}${caja(-w / 2, -70, w, 130, 18, "maderaclara", { sombra: 14, rim: 4 })}
      <text y="20" text-anchor="middle" font-family="Anton" font-size="78" letter-spacing="4" fill="#5e3418">${tx}</text>`;
  },
};
function PIEZAS_BIBLIA_HOJA() { return forma("M 0 0 C 30 -40 90 -40 130 -10 C 90 0 40 10 0 0 Z", "hoja", { sombra: 6, rim: 2, borde: 5 }); }

export const PARAMETROS_BIBLIA = {
  jose: "pose quieta|camina|reza|carga|saluda|senala|abre|trabaja|duerme, lleva nino|tablas|lampara|paloma|rollo|cofre, aureola 0-1, mira -1|1, ojos cerrados, boca habla|seria",
  maria: "igual que jose", angel: "igual que jose (flota, alas 0-1)", pastor: "igual que jose", rey: "igual que jose", anciano: "igual que jose", mago: "igual que jose (lleva cofre)",
  jesus: "edad bebe|nino|adulto, aureola 0-1 (y las poses si no es bebé)", burro: "carga maria|maria_nino|bultos, camina true, mira -1",
  oveja: "—", paloma: "vuela true", camello: "camina true", martillo: "giro", serrucho: "giro", tablas: "n, largo", banco: "tabla false, herramientas false", silla: "—",
  casaadobe: "luz 0-1, color", pesebre: "nino true, luz 0-1, aureola", estrella: "cola 0-1", haz: "brillo 0-1, ancho, largo", piramide: "—", palmera: "—", olivo: "—", templo: "—",
  lampara: "—", pergamino: "texto", lirio: "abre 0-1", vara: "florece 0-1", cofrecito: "—", corona: "—", cruz: "—", corazones: "—", zzz: "—",
  nubesueno: "dentro (otra pieza), dentroParams, dentroEscala", rotulo: "texto",
};
