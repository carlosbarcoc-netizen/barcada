// Las tomas de «Tres santas vieron el infierno» (16:9, estilo relato). Genera proyecto.json → escenas.
// node proyectos/2026-11-27-tres-santas-infierno/tomas.mjs   (después: node barcada.mjs tomas <proyecto>)
// Una toma por frase (casi siempre): `f` es el número de frase donde empieza; los tiempos dentro de la toma van en
// segundos desde que empieza o como "frase:palabra".
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const p = JSON.parse(readFileSync(join(DIR, "proyecto.json"), "utf8"));
const T = JSON.parse(readFileSync(join(DIR, "voz", "tiempos.json"), "utf8"));
const ini = (n) => (n === "fin" ? T.duracion : T.frases[n - 1].inicio);

// ---------------------------------------------------------------- piezas y cámaras
const TERESA = "monja", JACINTA = "nina", FRANCISCO = "nino", FAUSTINA = "religiosa";
const LUCIA = { vestuario: "nina", color: "#4f6fa6" }, LUCIA_MONJA = { vestuario: "religiosa", color: "#5a5866" };
const fig = (v, o = {}) => ({ pieza: "figura", ...(typeof v === "string" ? { vestuario: v } : v), x: 960, y: 480, escala: 1.6, entra: "aparece", dura: 0.8, ...o });
const medio = (v, o = {}) => fig(v, { y: 610, escala: 2.3, ...o });          // de cintura arriba
const cerca = (v, o = {}) => fig(v, { y: 800, escala: 3.2, ...o });          // la cara llena el cuadro
const pz = (pieza, o = {}) => ({ pieza, x: 960, y: 540, entra: "aparece", dura: 0.8, ...o });
const globo = (texto, o = {}) => pz("globo", { texto, y: 150, tamano: 48, entra: "rebote", dura: 0.5, ...o });
const dato = (o = {}) => pz("dato", { y: 860, tamano: 96, entra: "rebote", dura: 0.5, ...o });
const doc = (titulo, lineas, o = {}) => pz("documento", { titulo, lineas, y: 580, escala: 0.95, ancho: 640, alto: 760, rot: -2, ...o });
const almas = (n, o = {}) => Array.from({ length: n }, (_, i) => pz("alma", { x: 260 + (i * 1400) / Math.max(1, n - 1), y: 420 + ((i * 137) % 260), escala: 0.7 + ((i * 53) % 40) / 100, accion: "flota", tono: i % 3 ? "bronceada" : "negra", en: 0.2 + i * 0.25, ...o }));
// cámaras: un movimiento suave que dura toda la toma
const cam = (tipo, d, x = 960, y = 540) => ({
  quieto: [[0, { zoom: 1.02, x, y }]],
  acerca: [[0, { zoom: 1, x, y }], [d, { zoom: 1.12, x, y }]],
  aleja: [[0, { zoom: 1.14, x, y }], [d, { zoom: 1, x, y }]],
  izq: [[0, { zoom: 1.1, x: x + 90, y }], [d, { zoom: 1.1, x: x - 90, y }]],
  der: [[0, { zoom: 1.1, x: x - 90, y }], [d, { zoom: 1.1, x: x + 90, y }]],
  baja: [[0, { zoom: 1.12, x, y: y - 70 }], [d, { zoom: 1.12, x, y: y + 70 }]],
  sube: [[0, { zoom: 1.12, x, y: y + 70 }], [d, { zoom: 1.12, x, y: y - 70 }]],
}[tipo]);
const suelo = { "relato-campo": 780, "relato-noche": 734, "relato-monasterio": 864 };
const lista = (k) => ["1. La pérdida de Dios", "2. El remordimiento", "3. Que nunca cambia", "4. Un fuego espiritual", "5. Oscuridad y ahogo", "6. La compañía de Satanás", "7. La desesperación"].slice(0, k);
const tres = (o = {}) => [fig(TERESA, { x: 520, ...o }), fig(JACINTA, { x: 960, y: 560, ...o, en: (o.en ?? 0) + 0.3 }), fig(FAUSTINA, { x: 1400, ...o, en: (o.en ?? 0) + 0.6 })];
const cta = (n, a, b) => ({ f: n, fondo: "relato-noche", cam: "acerca", els: [pz("suscribir", { canal: "@tiempoparaDios", escala: 1.25, y: 520, entra: "rebote", params: { pulsa: [[a, 0], [b, 1]] } }), pz("resplandor", { y: 520, radio: 900, opacidad: 0.25, capa: -1 })] });

// ---------------------------------------------------------------- las tomas
const tomas = [
  // ===== el gancho
  { f: 1, fondo: "relato-noche", cam: "acerca", els: [fig("silueta", { x: 520, en: 0.2 }), fig("silueta", { x: 960, en: "1:conocieron", escala: 1.3, y: 560 }), fig("silueta", { x: 1400, en: "1:vieron" })] },
  { f: 2, fondo: "relato-pergamino", cam: "quieto", els: [pz("mapa", { escala: 1.3, y: 520, puntos: [[-0.55, 0.15], [-0.78, 0.25], [0.55, -0.4]], semilla: 4, params: { progreso: [["2:españa", 0], ["2:españa", 0.34], ["2:portugal", 0.34], ["2:portugal", 0.67], ["2:polonia", 0.67], ["2:polonia", 1]] } }),
    globo("España", { x: 560, y: 520, tamano: 34, en: "2:españa" }), globo("Portugal", { x: 400, y: 640, tamano: 34, en: "2:portugal" }), globo("Polonia", { x: 1380, y: 250, tamano: 34, en: "2:polonia" })] },
  { f: 3, fondo: "relato-madera", cam: "aleja", els: [doc("Libro de la Vida", ["Teresa de Jesús"], { x: 470, escala: 0.75, rot: -6, en: 0.1 }), doc("Memorias", ["Lucía de Fátima"], { x: 960, escala: 0.75, rot: 2, en: "3:países" }), doc("Diario", ["Faustina Kowalska"], { x: 1450, escala: 0.75, rot: 5, en: "3:idiomas" })] },
  { f: 4, fondo: "relato-noche", cam: "acerca", els: tres({ cara: "serena" }) },
  { f: 6, fondo: "relato-fuego", cam: "aleja", els: [] },
  { f: 7, fondo: "relato-callejon", cam: "acerca", els: [fig("silueta", { y: 640, escala: 0.6, en: "7:luz" })] },
  { f: 8, fondo: "relato-noche", cam: "acerca", els: [pz("alma", { escala: 1.9, y: 600, accion: "flota" })] },
  { f: 9, fondo: "relato-rojo", cam: "acerca", els: [fig("silueta", { pose: "esconde", y: 520 })] },
  { f: 10, fondo: "relato-madera", cam: "der", els: [doc("Libro de la Vida", ["cap. 32"], { x: 560, escala: 0.8, rot: -5 }), doc("Diario", ["n.º 741"], { x: 1300, escala: 0.8, rot: 4, en: "10:propias" }), pz("vela", { x: 960, y: 760, escala: 1.1 })] },
  { f: 11, fondo: "relato-campo", cam: "izq", els: [pz("convento", { x: 1350, y: 600, escala: 1.1 }), fig(JACINTA, { x: 620, y: 560, pose: "reza", en: "11:hicieron" })] },
  { f: 12, fondo: "relato-sagrado", cam: "aleja", els: tres({ cara: "feliz", aureola: true }) },
  cta(13, "13:suscríbete", "13:gratis"),
  { f: 14, fondo: "relato-monasterio", cam: "acerca", els: [pz("vela", { x: 960, y: 700, escala: 1.3 })] },
  // ===== 1. Teresa
  { f: 15, fondo: "relato-campo", cam: "der", els: [pz("convento", { x: 760, y: 600, escala: 0.9 }), pz("convento", { x: 1220, y: 620, escala: 0.7 }), dato({ texto: "Ávila · siglo XVI", tamano: 70, en: 0.6 })] },
  { f: 16, fondo: "relato-monasterio", cam: "acerca", els: [fig(TERESA, { y: 620, pose: "reza", brillo: 0.5 }), pz("vela", { x: 1380, y: 760, escala: 1.1 })] },
  { f: 17, fondo: "relato-monasterio", cam: "acerca", els: [medio(TERESA, { brillo: 0.4 }), globo("Teresa de Jesús", { en: "17:teresa", y: 140 })] },
  { f: 18, fondo: "relato-monasterio", cam: "quieto", els: [medio(TERESA, { cara: "feliz", brazos: 0.15 })] },
  { f: 19, fondo: "relato-monasterio", cam: "acerca", els: [medio(TERESA, { pose: "reza", params: { brillo: [["19:oraba", 0], ["19:olvidar", 1]] } }), pz("resplandor", { y: 360, radio: 700, capa: -1, en: "19:paso", opacidad: 0.5 })] },
  { f: 20, fondo: "relato-madera", cam: "acerca", els: [doc("Libro de la Vida", ["Teresa de Jesús", "", "Capítulo 32"], { params: { progreso: [["20:escribió", 0], ["20:dos", 1]] } }), pz("vela", { x: 1460, y: 760 })] },
  { f: 21, fondo: "relato-callejon", cam: "aleja", els: [fig(TERESA, { y: 700, escala: 0.75, cara: "sorprendida", entra: "crece", en: "21:repente" })] },
  { f: 22, fondo: "relato-callejon", cam: "acerca", els: [fig(TERESA, { y: 760, escala: 0.6, cara: "preocupada" })] },
  { f: 23, fondo: "relato-callejon", cam: "acerca", els: [globo("«un callejón muy largo y estrecho»", { en: "23:callejón" })] },
  { f: 24, fondo: "relato-callejon", cam: "acerca", els: [fig(TERESA, { y: 820, escala: 1, cara: "preocupada", mueve: [["25:olor", { x: 960, y: 640, escala: 0.45 }]] })] },
  { f: 26, fondo: "relato-callejon", cam: "acerca", els: [fig(TERESA, { x: 1180, y: 660, escala: 0.6, cara: "preocupada", pose: "esconde", en: "26:metieron" }), globo("un hueco en la pared", { tamano: 40, en: "26:hueco" })] },
  { f: 27, fondo: "relato-callejon", cam: "acerca", els: [] },
  { f: 28, fondo: "relato-rojo", cam: "acerca", els: [medio(TERESA, { cara: "preocupada", pose: "esconde" })] },
  { f: 29, fondo: "relato-callejon", cam: "quieto", els: [fig(TERESA, { y: 700, escala: 0.8, cara: "preocupada", brillo: 0.9 })] },
  { f: 30, fondo: "relato-noche", cam: "acerca", els: [pz("alma", { escala: 1.7, y: 600 }), globo("«un fuego en el alma»", { en: "30:fuego" })] },
  { f: 31, fondo: "relato-monasterio", cam: "quieto", els: [medio(TERESA, { cara: "preocupada", pose: "esconde" })] },
  { f: 32, fondo: "relato-rojo", cam: "acerca", els: [pz("alma", { escala: 1.6, y: 580, tono: "negra", accion: "tiembla" })] },
  { f: 33, fondo: "relato-madera", cam: "acerca", els: [doc("Libro de la Vida", ["cap. 32"], { escala: 0.9 }), pz("vela", { x: 1420, y: 760 })] },
  { f: 34, fondo: "relato-callejon", cam: "acerca", els: [globo("«No hay luz, sino todo tinieblas oscurísimas»", { tamano: 40, en: "34:luz", halo: "#c8b48a" })] },
  { f: 35, fondo: "relato-monasterio", cam: "acerca", els: [cerca(TERESA, { cara: "sorprendida" })] },
  { f: 36, fondo: "relato-callejon", cam: "quieto", els: [globo("«Yo no entiendo cómo puede ser esto,", { tamano: 38, y: 330, en: "36:entiendo" }), globo("que con no haber luz… todo se ve»", { tamano: 38, y: 470, en: "36:luz" })] },
  { f: 37, fondo: "relato-callejon", cam: "acerca", els: [fig(TERESA, { y: 660, escala: 1, cara: "atenta" })] },
  { f: 38, fondo: "relato-callejon", cam: "acerca", els: [cerca(TERESA, { cara: "atenta", opacidad: 0.92 })] },
  { f: 39, fondo: "relato-sagrado", cam: "aleja", els: [fig(TERESA, { y: 560, escala: 1.2, pose: "reza", brillo: 0.7 })] },
  { f: 40, fondo: "relato-monasterio", cam: "acerca", els: [medio(TERESA, { cara: "serena", brillo: 0.3 })] },
  { f: 42, fondo: "relato-monasterio", cam: "quieto", els: [medio(TERESA, { cara: "atenta" })] },
  { f: 43, fondo: "relato-campo", cam: "der", els: [fig(TERESA, { x: 420, y: 500, escala: 1.4, mueve: [["43:demás", { x: 1100, y: 500, escala: 1.4 }]] }), pz("convento", { x: 1500, y: 600, escala: 0.9, en: "43:nadie" })] },
  { f: 44, fondo: "relato-campo", cam: "aleja", els: [pz("convento", { x: 520, y: 600, escala: 0.6, entra: "sube", en: "44:fundar" }), pz("convento", { x: 960, y: 640, escala: 0.75, entra: "sube", en: "44:pequeños" }), pz("convento", { x: 1400, y: 610, escala: 0.65, entra: "sube", en: "44:oración" })] },
  { f: 45, fondo: "relato-campo", cam: "acerca", els: [pz("convento", { y: 560, escala: 1.3 }), pz("resplandor", { y: 420, radio: 700, capa: -1, opacidad: 0.35 })] },
  // ===== 2. Jacinta
  { f: 46, fondo: "relato-pergamino", cam: "acerca", els: [pz("mapa", { escala: 1.3, y: 520, puntos: [[-0.78, 0.25]], semilla: 4, params: { progreso: [["46:portugal", 0], ["46:portugal", 1]] } }), dato({ texto: "1917", en: "46:mil" })] },
  { f: 47, fondo: "relato-campo", cam: "der", els: [pz("encina", { x: 1560, y: 520, escala: 1 }), pz("oveja", { x: 380, y: 760, escala: 0.6 }), pz("oveja", { x: 640, y: 800, escala: 0.5, mira: "derecha" }), pz("oveja", { x: 1180, y: 790, escala: 0.55 }),
    fig(LUCIA, { x: 820, y: 560, escala: 1.1, en: "47:niños" }), fig(FRANCISCO, { x: 960, y: 560, escala: 1.1, en: "47:niños" }), fig(JACINTA, { x: 1080, y: 580, escala: 1.0, en: "47:niños" })] },
  { f: 48, fondo: "relato-campo", cam: "quieto", els: [fig(LUCIA, { x: 560, y: 520, escala: 1.5, en: "48:lucía", cara: "atenta" }), fig(FRANCISCO, { x: 960, y: 520, escala: 1.5, en: "48:francisco" }), fig(JACINTA, { x: 1360, y: 540, escala: 1.4, en: "48:jacinta", cara: "feliz" }),
    globo("Lucía · 10", { x: 560, y: 160, tamano: 34, en: "48:lucía" }), globo("Francisco · 9", { x: 960, y: 160, tamano: 34, en: "48:francisco" }), globo("Jacinta · 7", { x: 1360, y: 160, tamano: 34, en: "48:jacinta" })] },
  { f: 49, fondo: "relato-campo", cam: "acerca", els: [pz("encina", { x: 1300, y: 540, escala: 1 }), fig("virgen", { x: 1300, y: 210, escala: 0.6, entra: "crece", en: "49:señora" }), fig(JACINTA, { x: 640, y: 600, escala: 0.9, cara: "sorprendida" }), fig(FRANCISCO, { x: 520, y: 590, escala: 0.95 }), fig(LUCIA, { x: 760, y: 590, escala: 0.95, pose: "reza" })] },
  { f: 50, fondo: "relato-sagrado", cam: "acerca", els: [fig("virgen", { y: 500, escala: 1.6 }), dato({ texto: "13 de julio de 1917", tamano: 72, en: "50:julio" })] },
  { f: 51, fondo: "relato-monasterio", cam: "acerca", els: [fig(LUCIA_MONJA, { x: 700, y: 620, pose: "reza" }), doc("Memorias", ["13 de julio de 1917"], { x: 1300, y: 560, escala: 0.7, rot: 4, en: "51:escribiera", params: { progreso: [["51:escribiera", 0], ["52:escribió", 1]] } }), pz("vela", { x: 1000, y: 780 })] },
  { f: 53, fondo: "relato-sagrado", cam: "baja", els: [fig("virgen", { y: 460, escala: 1.5, params: { brazos: [["53:abrió", 0], ["53:manos", 0.45]] } }), pz("resplandor", { y: 900, radio: 800, en: "53:luz", capa: -1 })] },
  { f: 54, fondo: "relato-fuego", cam: "aleja", els: [globo("«un gran mar de fuego»", { en: "54:mar", halo: "#ff7a3a" })] },
  { f: 55, fondo: "relato-fuego", cam: "acerca", els: [] },
  { f: 56, fondo: "relato-fuego", cam: "acerca", els: almas(5) },
  { f: 57, fondo: "relato-fuego", cam: "acerca", els: [pz("alma", { escala: 1.6, y: 580, accion: "flota" }), globo("«como si fueran brasas transparentes»", { en: "57:brasas", halo: "#ff7a3a" })] },
  { f: 58, fondo: "relato-noche", cam: "acerca", els: [pz("alma", { escala: 2.1, y: 620 })] },
  { f: 59, fondo: "relato-rojo", cam: "acerca", els: [pz("alma", { escala: 2.4, y: 660, tono: "negra" })] },
  { f: 60, fondo: "relato-fuego", cam: "quieto", els: almas(6, { accion: "gira", velocidad: 25, mueve: undefined }).map((a, i) => ({ ...a, mueve: [["60:equilibrio", { x: a.x + (i % 2 ? 180 : -160), y: a.y + 260, escala: a.escala, rot: i % 2 ? 40 : -50 }]] })) },
  { f: 61, fondo: "relato-fuego", cam: "acerca", els: almas(4, { accion: "tiembla" }) },
  { f: 62, fondo: "relato-campo", cam: "acerca", els: [fig(LUCIA, { x: 640, y: 540, escala: 1.4, cara: "llora" }), fig(FRANCISCO, { x: 960, y: 540, escala: 1.4, cara: "sorprendida" }), fig(JACINTA, { x: 1280, y: 560, escala: 1.3, cara: "llora" })] },
  { f: 63, fondo: "relato-sagrado", cam: "aleja", els: [fig("virgen", { y: 500, escala: 1.4 })] },
  { f: 64, fondo: "relato-sagrado", cam: "acerca", els: [medio("virgen", { cara: "serena" }), globo("«Han visto el infierno,", { y: 120, tamano: 38, en: "64:visto" }), globo("adonde van las almas de los pobres pecadores»", { y: 250, tamano: 38, en: "64:adonde" })] },
  { f: 65, fondo: "relato-sagrado", cam: "acerca", els: [globo("pobres", { y: 520, tamano: 110, en: "65:pobres", halo: "#ffe6a0" })] },
  { f: 66, fondo: "relato-campo", cam: "acerca", els: [fig(LUCIA, { x: 640, y: 540, escala: 1.4, pose: "reza" }), fig(FRANCISCO, { x: 960, y: 540, escala: 1.4, pose: "reza", en: "66:rezaran" }), fig(JACINTA, { x: 1280, y: 560, escala: 1.3, pose: "reza", en: "66:sacrificaran" })] },
  { f: 67, fondo: "relato-madera", cam: "acerca", els: [doc("Memorias", ["de la hermana Lucía"], { escala: 0.9 })] },
  { f: 68, fondo: "relato-monasterio", cam: "acerca", els: [fig(LUCIA_MONJA, { y: 600, escala: 1.7 }), dato({ texto: "Venerable · 2023", tamano: 80, en: "68:venerable" })] },
  { f: 69, fondo: "relato-campo", cam: "aleja", els: [fig(FRANCISCO, { x: 760, y: 500, escala: 1.6, aureola: true }), fig(JACINTA, { x: 1160, y: 520, escala: 1.5, aureola: true, cara: "feliz" }), dato({ texto: "Santos · 2017", tamano: 80, en: "69:canonizó" })] },
  { f: 70, fondo: "relato-sagrado", cam: "acerca", els: [medio(JACINTA, { aureola: true, cara: "feliz" })] },
  { f: 71, fondo: "relato-campo", cam: "acerca", els: [fig(JACINTA, { y: 540, escala: 1.6, pose: "reza", params: { brillo: [["71:hizo", 0], ["71:bonito", 1]] } })] },
  cta(72, "72:suscríbete", "72:campanita"),
  // ===== 3. Faustina
  { f: 73, fondo: "relato-pergamino", cam: "acerca", els: [pz("mapa", { escala: 1.3, y: 520, puntos: [[0.55, -0.4]], semilla: 4, params: { progreso: [["73:polonia", 0], ["73:polonia", 1]] } }), dato({ texto: "años 30", en: "73:años" })] },
  { f: 74, fondo: "relato-monasterio", cam: "der", els: [fig(FAUSTINA, { y: 620, pose: "esconde" }), pz("vela", { x: 1360, y: 780 })] },
  { f: 75, fondo: "relato-monasterio", cam: "acerca", els: [medio(FAUSTINA, { cara: "serena" }), globo("Faustina Kowalska", { y: 140, en: "75:faustina" })] },
  { f: 76, fondo: "relato-madera", cam: "acerca", els: [doc("Diario", ["La Divina Misericordia", "en mi alma"], { params: { progreso: [["76:diario", 0], ["76:oración", 1]] } }), pz("vela", { x: 1440, y: 760 })] },
  { f: 77, fondo: "relato-madera", cam: "acerca", els: [doc("Diario", [], { escala: 0.9, x: 760 }), dato({ texto: "741", x: 1300, y: 540, tamano: 170, en: "77:setecientos" })] },
  { f: 78, fondo: "relato-sagrado", cam: "aleja", els: [fig("angel", { x: 760, y: 480, escala: 1.6, brazos: 0.3 }), fig(FAUSTINA, { x: 1220, y: 560, escala: 1.2, cara: "sorprendida" })] },
  { f: 79, fondo: "relato-fuego", cam: "aleja", els: [] },
  { f: 80, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", [], { escala: 1 })] },
  { f: 81, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", [], { x: 700 }), dato({ texto: "7 tormentos", x: 1360, y: 540, tamano: 100, en: "81:siete" })] },
  { f: 82, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", lista(1), { params: { progreso: [["82:primero", 0], ["82:dios", 1]] } })] },
  { f: 83, fondo: "relato-rojo", cam: "acerca", els: [medio("silueta", { pose: "esconde" }), globo("2. El remordimiento", { en: "83:remordimiento", halo: "#ff7a5a" })] },
  { f: 84, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", lista(3), { params: { progreso: [["84:", 0.6], ["84:nunca", 1]] } })] },
  { f: 85, fondo: "relato-fuego", cam: "acerca", els: [pz("alma", { escala: 1.6, y: 600 }), globo("4. Un fuego espiritual", { en: "85:cuarto", halo: "#ff7a3a" })] },
  { f: 86, fondo: "relato-callejon", cam: "acerca", els: [globo("5. Oscuridad y ahogo", { en: "86:quinto", halo: "#a8a0b8" })] },
  { f: 87, fondo: "relato-callejon", cam: "quieto", els: [pz("alma", { x: 700, y: 620, escala: 0.9, tono: "negra", en: "87:demonios" }), pz("alma", { x: 1220, y: 640, escala: 0.8, en: "87:almas" })] },
  { f: 88, fondo: "relato-callejon", cam: "acerca", els: [] },
  { f: 89, fondo: "relato-noche", cam: "acerca", els: [fig(TERESA, { x: 640, y: 520 }), fig(FAUSTINA, { x: 1280, y: 520, en: "89:teresa" }), dato({ texto: "casi 400 años", tamano: 72, en: "89:cuatrocientos" })] },
  { f: 90, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", lista(6), { params: { progreso: [["90:", 0.8], ["90:satanás", 1]] } })] },
  { f: 91, fondo: "relato-madera", cam: "aleja", els: [doc("Diario · 741", lista(7), { params: { progreso: [["91:", 0.85], ["91:dios", 1]] } })] },
  { f: 92, fondo: "relato-madera", cam: "aleja", els: [doc("Diario · 741", lista(7), { escala: 0.95 }), pz("vela", { x: 1460, y: 760 })] },
  { f: 93, fondo: "relato-monasterio", cam: "acerca", els: [cerca(FAUSTINA, { cara: "preocupada" })] },
  { f: 94, fondo: "relato-rojo", cam: "aleja", els: almas(8, { opacidad: 0.75 }) },
  { f: 95, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", ["…para que ninguna alma", "pueda excusarse diciendo", "que el infierno no existe."], { params: { progreso: [["95:nadie", 0], ["95:existe", 1]] } })] },
  { f: 96, fondo: "relato-monasterio", cam: "acerca", els: [fig(FAUSTINA, { y: 600, pose: "reza", brillo: 0.6 }), pz("vela", { x: 1380, y: 780 }), dato({ texto: "33 años", en: "96:treinta" })] },
  { f: 97, fondo: "relato-sagrado", cam: "aleja", els: [fig(FAUSTINA, { y: 520, escala: 1.6, aureola: true, cara: "feliz" }), dato({ texto: "Santa · 2000", en: "97:dos" })] },
  // ===== 4. Lo que coincide
  { f: 98, fondo: "relato-noche", cam: "aleja", els: tres() },
  { f: 99, fondo: "relato-noche", cam: "quieto", els: tres().map((e, i) => ({ ...e, params: { brillo: [[["99:española", "99:pastora", "99:polaca"][i], 0], [["99:española", "99:pastora", "99:polaca"][i], 0.9]] } })) },
  { f: 100, fondo: "relato-pergamino", cam: "aleja", els: [pz("mapa", { escala: 1.3, y: 520, puntos: [[-0.55, 0.15], [-0.78, 0.25], [0.55, -0.4]], semilla: 4 })] },
  { f: 101, fondo: "relato-noche", cam: "acerca", els: tres({ cara: "atenta" }) },
  { f: 102, fondo: "relato-callejon", cam: "acerca", els: [dato({ texto: "1 · La oscuridad", tamano: 84, y: 160 })] },
  { f: 103, fondo: "relato-callejon", cam: "acerca", els: [fig(TERESA, { y: 680, escala: 0.8, cara: "atenta" })] },
  { f: 104, fondo: "relato-noche", cam: "quieto", els: [dato({ texto: "2 · El fuego viene de dentro", tamano: 72, y: 140 }), pz("alma", { x: 480, y: 600, escala: 1.1, en: "104:teresa" }), pz("alma", { x: 960, y: 600, escala: 1.1, en: "104:lucía" }), pz("alma", { x: 1440, y: 600, escala: 1.1, en: "104:faustina" }),
    globo("Teresa", { x: 480, y: 880, tamano: 34, en: "104:teresa" }), globo("Lucía", { x: 960, y: 880, tamano: 34, en: "104:lucía" }), globo("Faustina", { x: 1440, y: 880, tamano: 34, en: "104:faustina" })] },
  { f: 105, fondo: "relato-noche", cam: "acerca", els: [fig("silueta", { y: 520, escala: 1.6, brillo: 1 }), pz("alma", { y: 560, escala: 0.8, opacidad: 0.8, en: "105:adentro" })] },
  { f: 106, fondo: "relato-noche", cam: "izq", els: [dato({ texto: "3 · Estar lejos de Dios", tamano: 76, y: 150 }), pz("resplandor", { x: 1560, y: 460, radio: 600 }), fig("silueta", { x: 760, y: 520, escala: 1.2, mueve: [["106:dios", { x: 420, y: 520, escala: 1.1 }]] })] },
  { f: 107, fondo: "relato-madera", cam: "acerca", els: [doc("Diario · 741", lista(1), { escala: 1.05 })] },
  { f: 108, fondo: "relato-piedra", cam: "acerca", els: [doc("Catecismo", ["de la Iglesia Católica"], { escala: 0.9, rot: 0 })] },
  { f: 109, fondo: "relato-madera", cam: "acerca", els: [doc("Catecismo", ["n.º 1033"], { x: 760, escala: 0.9 }), dato({ texto: "autoexclusión", x: 1320, y: 540, tamano: 90, en: "109:autoexclusión" })] },
  { f: 110, fondo: "relato-madera", cam: "acerca", els: [doc("Catecismo · 1033", ["«estado de autoexclusión", "definitiva de la comunión", "con Dios y con los", "bienaventurados»"], { params: { progreso: [["110:", 0], ["110:santos", 1]] } })] },
  { f: 111, fondo: "relato-puerta", fondoOpts: { abierta: 0.25 }, cam: "aleja", els: [fig("silueta", { x: 960, y: 640, escala: 1.1, en: 0.3 })] },
  { f: 112, fondo: "relato-madera", cam: "acerca", els: [doc("Catecismo · 1035", ["la pena principal:", "la separación eterna", "de Dios"], { params: { progreso: [["112:", 0], ["112:dios", 1]] } })] },
  { f: 113, fondo: "relato-noche", cam: "acerca", els: [pz("resplandor", { x: 1500, y: 460, radio: 650 }), fig("silueta", { x: 900, y: 520, escala: 1.3, mueve: [["113:espalda", { x: 560, y: 520, escala: 1.2 }]] })] },
  { f: 114, fondo: "relato-piedra", cam: "acerca", els: [globo("Ojo con esto", { y: 520, tamano: 70 })] },
  { f: 115, fondo: "relato-madera", cam: "aleja", els: [doc("Vida", [], { x: 520, escala: 0.6, rot: -6 }), doc("Memorias", [], { x: 960, escala: 0.6, rot: 2 }), doc("Diario", [], { x: 1400, escala: 0.6, rot: 5 }), dato({ texto: "Revelaciones privadas", tamano: 76, y: 920, en: "115:privadas" })] },
  { f: 116, fondo: "relato-piedra", cam: "acerca", els: [doc("Proceso", ["de canonización"], { escala: 0.85, rot: 1 }), pz("vela", { x: 1380, y: 800 })] },
  { f: 117, fondo: "relato-campo", cam: "acerca", els: [pz("encina", { x: 1100, y: 520, escala: 1 }), dato({ texto: "1930 · dignas de crédito", tamano: 72, en: "117:declaró" })] },
  { f: 118, fondo: "relato-sagrado", cam: "aleja", els: tres({ aureola: true, cara: "serena" }) },
  { f: 119, fondo: "relato-campo", cam: "der", els: tres({ escala: 1.3, y: 540 }).map((e) => ({ ...e, mueve: [["119:santidad", { x: e.x + 260, y: 540, escala: 1.3 }]] })) },
  { f: 120, fondo: "relato-sagrado", cam: "acerca", els: [] },
  // ===== 5. Lo que hicieron
  { f: 121, fondo: "relato-rojo", cam: "acerca", els: [fig("silueta", { y: 520, pose: "esconde" })] },
  { f: 122, fondo: "relato-sagrado", cam: "aleja", els: tres({ cara: "feliz" }) },
  { f: 123, fondo: "relato-campo", cam: "acerca", els: [fig(TERESA, { y: 500, escala: 1.5, cara: "feliz" })] },
  { f: 124, fondo: "relato-campo", cam: "der", els: [fig(TERESA, { x: 300, y: 520, escala: 1.3, mueve: [["125:", { x: 1000, y: 520, escala: 1.3 }]] })] },
  { f: 125, fondo: "relato-campo", cam: "der", els: [fig(TERESA, { x: 900, y: 520, escala: 1.3, mueve: [["126:", { x: 1500, y: 520, escala: 1.3 }]] }), pz("convento", { x: 1650, y: 620, escala: 0.6 })] },
  { f: 126, fondo: "relato-pergamino", cam: "aleja", els: [pz("mapa", { escala: 1.3, y: 520, semilla: 4, puntos: Array.from({ length: 17 }, (_, i) => [-0.75 + (i % 6) * 0.15 + ((i * 7) % 5) * 0.02, -0.4 + Math.floor(i / 6) * 0.35 + ((i * 3) % 4) * 0.04]), params: { progreso: [["126:fundó", 0], ["126:conventos", 1]] } }), dato({ texto: "17 conventos", en: "126:diecisiete" })] },
  { f: 127, fondo: "relato-madera", cam: "der", els: [doc("Libro de la Vida", [], { x: 480, escala: 0.6, rot: -6 }), doc("Camino de perfección", [], { x: 960, escala: 0.6, rot: 2 }), doc("Las Moradas", [], { x: 1440, escala: 0.6, rot: 5 })] },
  { f: 128, fondo: "relato-sagrado", cam: "aleja", els: [fig(TERESA, { y: 520, escala: 1.6, aureola: true, cara: "feliz" }), dato({ texto: "1970 · Doctora de la Iglesia", tamano: 70, en: "128:setenta" })] },
  { f: 129, fondo: "relato-campo", cam: "acerca", els: [medio(TERESA, { cara: "feliz", brazos: 0.4 })] },
  { f: 130, fondo: "relato-campo", cam: "acerca", els: [medio(JACINTA, { cara: "serena" })] },
  { f: 131, fondo: "relato-campo", cam: "acerca", els: [fig(JACINTA, { y: 560, escala: 1.5, pose: "reza" }), globo("«¡Pobres pecadores!»", { en: "131:pecadores" })] },
  { f: 132, fondo: "relato-noche", cam: "aleja", els: [fig("silueta", { x: 520, y: 560, escala: 0.8, opacidad: 0.7 }), fig("silueta", { x: 800, y: 580, escala: 0.75, opacidad: 0.6 }), fig("silueta", { x: 1120, y: 570, escala: 0.8, opacidad: 0.7 }), fig("silueta", { x: 1420, y: 560, escala: 0.85, opacidad: 0.6 })] },
  { f: 133, fondo: "relato-campo", cam: "acerca", els: [fig(JACINTA, { y: 560, escala: 1.5, pose: "reza", brillo: 0.6 })] },
  { f: 134, fondo: "relato-campo", cam: "quieto", els: [fig(JACINTA, { x: 760, y: 560, escala: 1.4, cara: "feliz" }), fig(FRANCISCO, { x: 1180, y: 560, escala: 1.4, color: "#8a7a6a", en: "134:niños" }), pz("oveja", { x: 1600, y: 780, escala: 0.5 })] },
  { f: 135, fondo: "relato-noche", cam: "acerca", els: [fig(JACINTA, { y: 560, escala: 1.4, pose: "reza", brillo: 0.8 }), pz("globos", { y: 280, ancho: 1500, alto: 300, textos: ["¿?", "alguien", "un desconocido", "¿quién?", "tú", "yo", "él", "ella"], tamano: 34, desde: [0, 300], params: { progreso: [["135:rezaba", 0], ["135:llamaban", 1]] } })] },
  { f: 136, fondo: "relato-sagrado", cam: "acerca", els: [medio(JACINTA, { pose: "reza", brillo: 0.8 })] },
  { f: 137, fondo: "relato-sagrado", cam: "aleja", els: [fig(JACINTA, { y: 540, escala: 1.4, aureola: true, cara: "serena" }), dato({ texto: "1910 – 1920", en: "137:nueve" })] },
  { f: 138, fondo: "relato-monasterio", cam: "acerca", els: [fig(FAUSTINA, { x: 760, y: 620 }), doc("Diario · 741", lista(7), { x: 1340, y: 520, escala: 0.6, rot: 4 })] },
  { f: 139, fondo: "relato-monasterio", cam: "acerca", els: [cerca(FAUSTINA, { cara: "atenta" })] },
  { f: 140, fondo: "relato-sagrado", cam: "aleja", els: [fig("jesus", { y: 470, escala: 1.6, entra: "crece", en: "140:misericordia" })] },
  { f: 141, fondo: "relato-sagrado", cam: "acerca", els: [fig("jesus", { y: 470, escala: 1.6, pose: "bendice" }), globo("«Jesús, en ti confío»", { y: 950, en: "141:jesús#2", halo: "#fff1c4" })] },
  { f: 142, fondo: "relato-noche", cam: "aleja", els: [pz("fachada", { x: 960, y: 760, escala: 0.85, entra: "ninguna", luz: 1 }), pz("multitud", { x: 960, y: 720, ancho: 2300, alto: 380, luces: 0.08, densidad: 0.8, entra: "ninguna" }), dato({ texto: "30 de abril de 2000", tamano: 76, y: 160, en: "142:canonizó" })] },
  { f: 143, fondo: "relato-sagrado", cam: "acerca", els: [fig(FAUSTINA, { y: 540, escala: 1.5, aureola: true, brillo: 0.8, cara: "feliz" })] },
  // ===== el cierre
  { f: 144, fondo: "relato-noche", cam: "sube", els: [] },
  { f: 146, fondo: "relato-carretera", cam: "der", els: [pz("letrero", { x: 1500, y: 520, escala: 0.8, en: "146:letrero", params: { brillo: [["146:letrero", 0], ["146:precipicio", 1]] } })] },
  { f: 147, fondo: "relato-carretera", cam: "acerca", els: [pz("letrero", { x: 1300, y: 500, escala: 1.1, brillo: 1 })] },
  { f: 148, fondo: "relato-carretera", cam: "acerca", els: [pz("letrero", { x: 1300, y: 500, escala: 1.1, brillo: 1 }), globo("No una amenaza. Una advertencia.", { x: 640, y: 300, en: "148:amenaza" })] },
  { f: 149, fondo: "relato-sagrado", cam: "acerca", els: [] },
  { f: 150, fondo: "relato-sagrado", cam: "aleja", els: tres({ cara: "feliz", brillo: 0.6 }) },
  { f: 151, fondo: "relato-noche", cam: "quieto", els: [pz("convento", { x: 480, y: 600, escala: 0.7, en: "151:teresa" }), fig(TERESA, { x: 480, y: 470, escala: 0.9, en: "151:teresa" }), fig(JACINTA, { x: 960, y: 500, escala: 0.9, pose: "reza", brillo: 0.6, en: "151:jacinta" }),
    fig("jesus", { x: 1500, y: 430, escala: 0.75, opacidad: 0.85, en: "151:faustina" }), fig(FAUSTINA, { x: 1320, y: 500, escala: 0.85, en: "151:faustina" })] },
  { f: 152, fondo: "relato-noche", cam: "izq", els: [pz("resplandor", { x: 1560, y: 460, radio: 600 }), fig("silueta", { x: 520, y: 520, escala: 1.1 })] },
  { f: 153, fondo: "relato-puerta", fondoVivo: true, cam: "acerca", fondoParams: true, els: [] },
  { f: 154, fondo: "relato-puerta", fondoOpts: { abierta: 1 }, cam: "acerca", els: [] },
  { f: 155, fondo: "relato-noche", cam: "acerca", els: tres({ cara: "feliz" }) },
  cta(156, "156:suscríbete", "156:siempre"),
  // la pantalla final (15 s sin voz): la tarjeta arriba y abajo espacio libre para los elementos de fin de YouTube
  { f: "fin", fondo: "relato-sagrado", cam: "quieto", els: [pz("suscribir", { canal: "@tiempoparaDios", escala: 0.9, y: 190, entra: "aparece", pulsa: 1 }), globo("Gracias por acompañarnos", { y: 330, tamano: 40, en: 0.6, halo: "#fff1c4" })] },
];
p.pantallaFinal = 15;

// ---------------------------------------------------------------- a proyecto.json
const escenas = [{ nombre: "video", tomas: [] }];
tomas.forEach((t, i) => {
  const fin = i < tomas.length - 1 ? ini(tomas[i + 1].f) : T.duracion + (p.pantallaFinal || 0), d = Math.max(1, fin - ini(t.f));
  const dibujo = { fondo: t.fondo, camara: cam(t.cam || "acerca", d), elementos: t.els.map((e) => ({ ...e })) };
  if (t.fondoOpts) dibujo.fondoOpts = t.fondoOpts;
  if (t.fondoVivo) dibujo.fondoVivo = true;
  // la puerta que se abre mientras se dice «la puerta sigue abierta»
  if (t.fondoParams) dibujo.fondoAnim = { abierta: [[`${t.f}:puerta`, 0], [`${t.f}:abierta`, 1]] };
  escenas[0].tomas.push({ desde: t.f === 1 ? 0 : t.f, dibujo });
});
p.escenas = escenas;
writeFileSync(join(DIR, "proyecto.json"), JSON.stringify(p, null, 2) + "\n");
console.log(`${tomas.length} tomas`);
