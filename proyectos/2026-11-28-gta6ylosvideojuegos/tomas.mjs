// Las tomas de «GTA 6 y los videojuegos violentos» (16:9, estilo relato). Genera proyecto.json → escenas.
// node proyectos/2026-11-28-gta6ylosvideojuegos/tomas.mjs   (después: node barcada.mjs tomas <proyecto>)
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
const HIJO = "joven", HIJO_C = "joven-capucha", PAPA = "padre", MAMA = "madre", NINO = "chico";
const fig = (v, o = {}) => ({ pieza: "figura", ...(typeof v === "string" ? { vestuario: v } : v), x: 960, y: 540, escala: 1.6, entra: "aparece", dura: 0.8, ...o });
const medio = (v, o = {}) => fig(v, { y: 640, escala: 2.3, ...o });
const cerca = (v, o = {}) => fig(v, { y: 820, escala: 3.2, ...o });
const pz = (pieza, o = {}) => ({ pieza, x: 960, y: 540, entra: "aparece", dura: 0.8, ...o });
const globo = (texto, o = {}) => pz("globo", { texto, y: 210, tamano: 48, entra: "rebote", dura: 0.5, ...o });
const dato = (o = {}) => pz("dato", { y: 880, tamano: 96, entra: "rebote", dura: 0.5, ...o });
const doc = (titulo, lineas, o = {}) => pz("documento", { titulo, lineas, y: 560, escala: 0.95, ancho: 640, alto: 760, rot: -2, ...o });
const tele = (o = {}) => pz("pantalla", { x: 1240, y: 470, escala: 1.15, ...o });
const cam = (tipo, d, x = 960, y = 540) => ({
  quieto: [[0, { zoom: 1.02, x, y }]],
  acerca: [[0, { zoom: 1, x, y }], [d, { zoom: 1.12, x, y }]],
  aleja: [[0, { zoom: 1.14, x, y }], [d, { zoom: 1, x, y }]],
  izq: [[0, { zoom: 1.1, x: x + 90, y }], [d, { zoom: 1.1, x: x - 90, y }]],
  der: [[0, { zoom: 1.1, x: x - 90, y }], [d, { zoom: 1.1, x: x + 90, y }]],
  baja: [[0, { zoom: 1.12, x, y: y - 70 }], [d, { zoom: 1.12, x, y: y + 70 }]],
  sube: [[0, { zoom: 1.12, x, y: y + 70 }], [d, { zoom: 1.12, x, y: y - 70 }]],
}[tipo]);
const CANAL = "@dulcepatriarca", LEMA = "Fe y familia, sin miedo a la verdad";
const cta = (n, a, b) => ({ f: n, fondo: "relato-sagrado", cam: "acerca", els: [pz("suscribir", { canal: CANAL, lema: LEMA, escala: 1.25, y: 520, entra: "rebote", params: { pulsa: [[a, 0], [b, 1]] } })] });
// el hijo jugando de noche en su cuarto (la imagen que vuelve una y otra vez)
const jugando = (o = {}, t = {}) => [tele(t), fig(HIJO, { x: 620, y: 560, cara: "atenta", ...o }), pz("control", { x: 760, y: 640, escala: 0.45, rot: -8, ...(o.en !== undefined ? { en: o.en } : {}) })];
const familia = (o = {}) => [fig(PAPA, { x: 560, y: 560, ...o }), fig(MAMA, { x: 900, y: 560, ...o }), fig(NINO, { x: 1220, y: 600, ...o })];
const pecado = (nombre, o = {}) => globo(nombre, { y: 215, tamano: 60, halo: "#ff7a5a", ...o });

// ---------------------------------------------------------------- las tomas
const tomas = [
  // ===== el gancho
  { f: 1, fondo: "relato-sala", fondoOpts: { lampara: 0.15 }, cam: "acerca", els: [pz("relojpared", { x: 1500, y: 300, escala: 0.55, params: { horas: [[0, 10.9], [3, 11]] } })] },
  { f: 2, fondo: "relato-sala", cam: "izq", fondoOpts: { lampara: 0.6 }, els: [fig(PAPA, { x: 760, y: 560, cara: "serena" }), fig(MAMA, { x: 1100, y: 560, cara: "serena" })] },
  { f: 3, fondo: "relato-pasillo", cam: "acerca", els: [] },
  { f: 4, fondo: "relato-cuarto", cam: "acerca", els: [...jugando({ pose: "quieta" }, { escena: "persecucion", rango: 3, params: { puntos: [["4:ganar", 0], [ini(5) - ini(4), 500]] } })] },
  { f: 5, fondo: "relato-cuarto", cam: "acerca", els: [tele({ x: 960, y: 500, escala: 1.9, escena: "persecucion", puntos: 500, rango: 3 })] },
  { f: 6, fondo: "relato-ciudad", cam: "der", els: [dato({ texto: "GTA 6", tamano: 130, y: 300, en: "6:gta" })] },
  { f: 7, fondo: "relato-noche", cam: "acerca", els: [fig("obispo", { x: 960, y: 520, pose: "bendice", brillo: 0.5 }), pz("multitud", { x: 960, y: 760, ancho: 2300, alto: 340, densidad: 0.7, entra: "ninguna" })] },
  { f: 8, fondo: "relato-pasillo", cam: "acerca", els: [fig(PAPA, { x: 520, y: 560, cara: "serena", escala: 1.5 })] },
  { f: 9, fondo: "relato-madera", cam: "der", els: [doc("Hoy", ["1. La ciencia", "2. La Iglesia", "3. Qué hacer en casa"], { params: { progreso: [[0.3, 0], ["9:hacer", 1]] } }), pz("vela", { x: 1460, y: 760 })] },
  cta(10, "10:suscríbete", "10:gratis"),
  { f: 11, fondo: "relato-ciudad", cam: "acerca", els: [] },
  // ===== 1. un fenómeno sin precedentes
  { f: 12, fondo: "relato-ciudad", cam: "izq", els: [dato({ texto: "19 de noviembre", tamano: 90, y: 300, en: 0.4 })] },
  { f: 13, fondo: "relato-madera", cam: "acerca", els: [pz("billetes", { y: 640, escala: 1.4, params: { vuelan: [["13:día", 0], ["13:dólares", 1]] } }), dato({ valor: 3790, unidad: "millones de USD", y: 230, tamano: 100, en: "13:vendió", params: { valor: [["13:vendió", 0], ["13:dólares", 3790]] } })] },
  { f: 14, fondo: "relato-noche", cam: "acerca", els: [pz("multitud", { x: 960, y: 640, ancho: 2300, alto: 460, luces: 0.25, densidad: 0.8, entra: "ninguna" }), globo("El estreno más grande del entretenimiento", { tamano: 44, en: "14:estreno" })] },
  { f: 15, fondo: "relato-noche", cam: "aleja", els: [pz("multitud", { x: 960, y: 560, ancho: 2400, alto: 520, luces: 0.4, densidad: 0.7, entra: "ninguna" }), dato({ texto: "+10 años de espera", tamano: 80, y: 260, en: "15:diez" })] },
  { f: 16, fondo: "relato-rojo", cam: "acerca", els: [dato({ texto: "Para adultos", tamano: 120, y: 520, en: "16:adultos" })] },
  { f: 17, fondo: "relato-rojo", cam: "der", els: [globo("violencia", { x: 520, y: 360, en: "17:violencia", halo: "#ff7a5a" }), globo("lenguaje", { x: 960, y: 560, en: "17:lenguaje", halo: "#ff7a5a" }), globo("contenido sexual", { x: 1400, y: 760, en: "17:sexual", halo: "#ff7a5a" })] },
  { f: 18, fondo: "relato-cuarto", cam: "acerca", els: [fig(HIJO, { x: 700, y: 560, cara: "atenta", en: "18:adolescentes" }), fig(NINO, { x: 1100, y: 620, cara: "feliz", en: "18:niños" })] },
  { f: 19, fondo: "relato-cuarto", cam: "izq", els: [pz("control", { x: 560, y: 540, escala: 0.8, en: "19:regalo", entra: "rebote" }), fig(HIJO, { x: 1000, y: 560, cara: "feliz", en: "19:primo" }), pz("pantalla", { x: 1460, y: 470, escala: 0.8, en: "19:consola" })] },
  { f: 20, fondo: "relato-pasillo", cam: "acerca", els: [] },
  // ===== 2. un mundo que premia el mal
  { f: 21, fondo: "relato-cuarto", cam: "acerca", els: jugando() },
  { f: 22, fondo: "relato-ciudad", cam: "der", els: [fig(HIJO_C, { x: 960, y: 560, escala: 1.3, cara: "atenta" })] },
  { f: 23, fondo: "relato-ciudad", cam: "aleja", els: [fig(HIJO_C, { x: 960, y: 560, escala: 1.3, cara: "atenta", brazos: 0.9 })] },
  { f: 24, fondo: "relato-ciudad", cam: "acerca", els: [pz("carro", { x: 960, y: 850, escala: 1.1, color: "#e0483a", mueve: [[ini(25) - ini(24), { x: 1300 }]] }), globo("el delito te hace avanzar", { tamano: 46, en: "24:delito", halo: "#ff7a5a" })] },
  { f: 25, fondo: "relato-ciudad", cam: "der", els: [pz("billetes", { x: 480, y: 520, escala: 0.8, en: "25:robar", params: { vuelan: [["25:robar", 0], ["25:dinero", 1]] } }), globo("respeto", { x: 960, y: 420, en: "25:respeto" }), pz("carro", { x: 1440, y: 820, escala: 0.8, color: "#e8e8ee", sirena: true, en: "25:escapar" })] },
  { f: 26, fondo: "relato-cuarto", cam: "acerca", els: [tele({ x: 960, y: 480, escala: 1.7, escena: "persecucion", puntos: 1500, rango: 4 })] },
  { f: 27, fondo: "relato-cuarto", cam: "acerca", els: [tele({ x: 960, y: 480, escala: 1.7, escena: "ciudad", rango: 5, params: { puntos: [[0, 1500], [ini(28) - ini(27), 9800]] } })] },
  { f: 28, fondo: "relato-madera", cam: "acerca", els: [pz("vela", { x: 960, y: 700, escala: 1.4 })] },
  { f: 29, fondo: "relato-rojo", cam: "acerca", els: [globo("No solo te deja hacer el mal.", { y: 380, tamano: 52, en: 0.2 }), globo("Te lo premia.", { y: 620, tamano: 72, halo: "#ff7a5a", en: "29:premia" })] },
  { f: 30, fondo: "relato-cuarto", cam: "aleja", els: [tele({ escena: "persecucion", puntos: 9800, rango: 5 }), fig(HIJO, { x: 620, y: 560, cara: "feliz" })] },
  { f: 31, fondo: "relato-campo", cam: "der", els: [fig(NINO, { x: 620, y: 700, cara: "feliz", en: "31:niño" }), pz("balon", { x: 1100, y: 840, escala: 0.6, en: "31:hábito" })] },
  { f: 32, fondo: "relato-monasterio", cam: "acerca", els: [pz("vela", { x: 760, y: 720 }), pz("vela", { x: 1160, y: 720 })] },
  { f: 33, fondo: "relato-rojo", cam: "acerca", els: [dato({ texto: "Pecados capitales", tamano: 110, y: 520, en: "33:pecados" })] },
  // ===== 3. los siete pecados en un control
  { f: 34, fondo: "relato-madera", cam: "acerca", els: [doc("Catecismo", ["n.º 1866"], { params: { progreso: [[0.2, 0], ["34:sesenta", 1]] } })] },
  { f: 35, fondo: "relato-pergamino", cam: "quieto", els: [pz("globos", { y: 520, ancho: 1500, alto: 640, textos: ["soberbia", "avaricia", "envidia", "ira", "lujuria", "gula", "pereza"], tamano: 52, halo: "#ff7a5a", desde: [0, 260], params: { progreso: [["35:soberbia", 0], ["35:pereza", 1]] } })] },
  { f: 36, fondo: "relato-pergamino", cam: "acerca", els: [doc("Pecados capitales", ["la cabeza de", "otros pecados"], { params: { progreso: [[0.2, 0], ["36:cabeza", 1]] } })] },
  { f: 37, fondo: "relato-ciudad", cam: "acerca", els: [] },
  { f: 38, fondo: "relato-madera", cam: "acerca", els: [pecado("Avaricia", { en: 0.2 }), pz("billetes", { y: 640, escala: 1.3, params: { vuelan: [[0.5, 0], ["38:robas", 1]] } })] },
  { f: 39, fondo: "relato-rojo", cam: "acerca", els: [pecado("Ira", { en: 0.2 }), tele({ x: 960, y: 600, escala: 1.4, escena: "persecucion", rango: 5 })] },
  { f: 40, fondo: "relato-rojo", cam: "acerca", els: [pecado("Lujuria", { en: 0.2 }), fig("silueta", { x: 960, y: 620, escala: 1.4, opacidad: 0.7, en: "40:cuerpo" })] },
  { f: 41, fondo: "relato-ciudad", cam: "aleja", els: [pecado("Soberbia", { en: 0.2 }), fig(HIJO_C, { x: 960, y: 600, escala: 1.6, pose: "esconde", cara: "atenta" })] },
  { f: 42, fondo: "relato-ciudad", cam: "der", els: [pecado("Envidia", { en: 0.2 }), pz("carro", { x: 700, y: 850, escala: 0.8, color: "#2a8ad4", en: "42:carro" }), pz("carro", { x: 1300, y: 850, escala: 0.8, color: "#f2c14e", en: "42:casa" })] },
  { f: 43, fondo: "relato-cuarto", cam: "acerca", els: [pecado("Gula y pereza", { en: 0.2 }), ...jugando({ pose: "esconde" }), pz("relojpared", { x: 260, y: 220, escala: 0.4, params: { horas: [[0, 20], [ini(44) - ini(43), 24]] } })] },
  { f: 44, fondo: "relato-cuarto", cam: "quieto", els: jugando({ cara: "serena" }) },
  { f: 45, fondo: "relato-noche", cam: "acerca", els: [cerca(HIJO, { cara: "atenta", brillo: 0.3 })] },
  { f: 46, fondo: "relato-cuarto", cam: "acerca", els: [fig(HIJO, { x: 620, y: 560, cara: "sorprendida" }), tele({ escena: "persecucion" })] },
  { f: 47, fondo: "relato-cuarto", cam: "aleja", els: [...jugando({ cara: "serena" }), globo("no el escándalo, sino la costumbre", { tamano: 44, en: "47:costumbre" })] },
  // ===== 4. qué dice la ciencia
  { f: 48, fondo: "relato-madera", cam: "acerca", els: [pz("vela", { x: 960, y: 720, escala: 1.3 })] },
  { f: 49, fondo: "relato-madera", cam: "der", els: [doc("Psicología (APA)", ["Resolución", "del año 2020"], { tamano: 40, params: { progreso: [[0.3, 0], ["49:veinte", 1]] } }), dato({ texto: "2020", x: 1500, y: 300, en: "49:veinte" })] },
  { f: 50, fondo: "relato-madera", cam: "acerca", els: [doc("Lo que encontró", ["una relación pequeña", "pero constante", "con más agresividad"], { params: { progreso: [["50:relación", 0], ["50:agresividad", 1]] } })] },
  { f: 51, fondo: "relato-rojo", cam: "acerca", els: [globo("más pensamientos agresivos", { y: 300, en: "51:pensamientos" }), globo("más enojo", { y: 480, en: "51:enojo" }), globo("menos empatía", { y: 660, en: "51:empatía", halo: "#ff7a5a" })] },
  { f: 52, fondo: "relato-madera", cam: "acerca", els: [doc("También dijo", ["no hay pruebas de que", "conviertan a alguien", "en un criminal"], { params: { progreso: [["52:pruebas", 0], ["52:criminal", 1]] } })] },
  { f: 53, fondo: "relato-noche", cam: "acerca", els: [medio(HIJO, { cara: "serena" }), globo("pueden endurecer el corazón", { tamano: 44, en: "53:endurecer" })] },
  { f: 54, fondo: "relato-noche", cam: "acerca", els: [pz("relojpared", { escala: 1.2, params: { horas: [[0, 9], [ini(55) - ini(54), 11]] } })] },
  { f: 55, fondo: "relato-madera", cam: "acerca", els: [doc("OMS · CIE-11", ["Trastorno por", "videojuegos"], { params: { progreso: [[0.3, 0], ["55:enfermedad", 1]] } }), dato({ texto: "2022", x: 1500, y: 300, en: "55:veintidós" })] },
  { f: 56, fondo: "relato-cuarto", cam: "acerca", els: [...jugando({ cara: "preocupada" }), globo("escuela", { x: 500, y: 230, tamano: 38, en: "56:escuela" }), globo("familia", { x: 960, y: 200, tamano: 38, en: "56:familia" }), globo("sueño", { x: 1400, y: 230, tamano: 38, en: "56:sueño" })] },
  { f: 57, fondo: "relato-cuarto", cam: "acerca", els: [...jugando({ cara: "atenta" }), globo("un ratito más…", { x: 620, y: 220, tamano: 46, en: "57:ratito" })] },
  { f: 58, fondo: "relato-sala", cam: "acerca", els: [fig(PAPA, { x: 960, y: 560, cara: "preocupada" })] },
  { f: 59, fondo: "relato-sala", cam: "izq", els: [pz("relojpared", { x: 1500, y: 250, escala: 0.5, params: { horas: [[0, 20], [ini(60) - ini(59), 25]] } }), fig(MAMA, { x: 760, y: 560, cara: "preocupada" })] },
  { f: 60, fondo: "relato-sagrado", cam: "acerca", els: [globo("👍 Me gusta y compártelo", { y: 460, tamano: 56, en: "60:gusta" })] },
  // ===== 5. qué dice la Iglesia
  { f: 61, fondo: "relato-noche", cam: "aleja", els: [pz("fachada", { x: 960, y: 820, escala: 0.85, entra: "ninguna", luz: 1, emblema: "llaves" })] },
  { f: 62, fondo: "relato-noche", cam: "acerca", els: [pz("fachada", { x: 960, y: 820, escala: 0.85, entra: "ninguna", figura: "papa", brazos: 0.6 }), dato({ texto: "2007", y: 220, en: "62:siete" })] },
  { f: 63, fondo: "relato-madera", cam: "acerca", els: [doc("Los niños y los medios", ["Benedicto XVI", "2007"], { progreso: 1 })] },
  { f: 64, fondo: "relato-madera", cam: "acerca", els: [doc("Los niños y los medios", ["no a lo que exalta", "la violencia", "ni a lo que banaliza", "la sexualidad"], { params: { progreso: [["64:criticó", 0], ["64:jóvenes", 1]] } })] },
  { f: 65, fondo: "relato-sala", cam: "acerca", els: [...familia({ cara: "serena" }), globo("padres · Iglesia · escuela", { tamano: 44, en: "65:padres" })] },
  { f: 66, fondo: "relato-sala", cam: "acerca", els: [fig(PAPA, { x: 760, y: 560, cara: "feliz" }), fig(MAMA, { x: 1100, y: 560, cara: "feliz" }), dato({ texto: "Los padres, primero", tamano: 80, y: 220, en: "66:primero" })] },
  { f: 67, fondo: "relato-noche", cam: "aleja", els: [pz("multitud", { x: 960, y: 520, ancho: 2400, alto: 560, luces: 0.4, brazos: 0.2, banderas: 18, entra: "ninguna" }), dato({ texto: "Cracovia", tamano: 90, y: 230, en: "67:cracovia" })] },
  { f: 68, fondo: "relato-sala", cam: "acerca", els: [fig(HIJO, { x: 960, y: 560, pose: "esconde", cara: "serena" }), globo("No vivas la vida a través de una pantalla", { tamano: 42, en: "68:vida" })] },
  { f: 69, fondo: "relato-monasterio", cam: "acerca", els: [fig("obispo", { y: 560, cara: "preocupada", brillo: 0.4 }), dato({ texto: "Australia", tamano: 70, y: 200, en: 0.4 }), globo("deshumanizan", { x: 1450, y: 400, tamano: 44, halo: "#ff7a5a", en: "69:deshumanizan" })] },
  { f: 70, fondo: "relato-sagrado", cam: "aleja", els: [pz("cruz", { y: 520, escala: 1.2, material: "oro", brillo: 1 })] },
  // ===== 6. la batalla que no se ve
  { f: 71, fondo: "relato-noche", cam: "acerca", els: [pz("vela", { y: 700, escala: 1.4 })] },
  { f: 72, fondo: "relato-sagrado", cam: "acerca", els: [fig("angel", { x: 960, y: 520, escala: 1.4, en: "72:batalla" })] },
  { f: 73, fondo: "relato-madera", cam: "acerca", els: [doc("Efesios 6, 12", ["no es contra la carne", "y la sangre…"], { params: { progreso: [["73:carne", 0], ["73:tinieblas", 1]] } })] },
  { f: 74, fondo: "relato-pasillo", cam: "acerca", els: [] },
  { f: 75, fondo: "relato-cuarto", cam: "acerca", els: [...jugando({ cara: "feliz" }, { escena: "persecucion", rango: 5 })] },
  { f: 76, fondo: "relato-sala", cam: "izq", fondoOpts: { lampara: 0.3 }, els: [fig(PAPA, { x: 520, y: 560, cara: "serena", opacidad: 0.6 }), fig(MAMA, { x: 820, y: 560, cara: "serena", opacidad: 0.6 }), pz("cruz", { x: 1500, y: 360, escala: 0.6, material: "madera", opacidad: 0.6 })] },
  { f: 77, fondo: "relato-monasterio", cam: "acerca", els: [fig("monje", { x: 620, y: 600, pose: "reza" }), fig("obispo", { x: 1300, y: 580, cara: "preocupada" })] },
  { f: 78, fondo: "relato-puerta", fondoOpts: { abierta: 0.25 }, cam: "acerca", els: [] },
  { f: 79, fondo: "relato-pasillo", cam: "acerca", els: [] },
  // ===== 7. el aislamiento en casa
  { f: 80, fondo: "relato-sala", cam: "aleja", els: [...familia({ cara: "serena" })] },
  { f: 81, fondo: "relato-sala", cam: "der", els: [fig(PAPA, { x: 480, y: 560, cara: "atenta", en: "81:papá" }), pz("telefono", { x: 640, y: 560, escala: 0.4, en: "81:celular" }), fig(MAMA, { x: 960, y: 560, cara: "atenta", en: "81:mamá" }), pz("pantalla", { x: 1180, y: 300, escala: 0.4, en: "81:televisión", peana: false }), fig(HIJO, { x: 1440, y: 560, cara: "atenta", en: "81:hijo" }), pz("control", { x: 1560, y: 640, escala: 0.35, en: "81:consola" })] },
  { f: 82, fondo: "relato-sala", cam: "acerca", els: [fig(PAPA, { x: 480, y: 560, cara: "atenta" }), pz("telefono", { x: 640, y: 560, escala: 0.4 }), fig(MAMA, { x: 960, y: 560, cara: "atenta" }), fig(HIJO, { x: 1440, y: 560, cara: "atenta" }), pz("control", { x: 1560, y: 640, escala: 0.35 })] },
  { f: 83, fondo: "relato-sala", cam: "aleja", fondoOpts: { lampara: 0.3 }, els: [fig(PAPA, { x: 300, y: 560, cara: "serena" }), fig(MAMA, { x: 960, y: 560, cara: "serena" }), fig(HIJO, { x: 1620, y: 560, cara: "serena" })] },
  { f: 84, fondo: "relato-pasillo", cam: "acerca", els: [fig(MAMA, { x: 520, y: 560, cara: "preocupada", escala: 1.5 }), globo("¿a qué juega?", { x: 560, y: 220, tamano: 38, en: "84:juegan" }), globo("¿con quién habla?", { x: 1000, y: 320, tamano: 38, en: "84:hablan" }), globo("¿cuántas horas?", { x: 1440, y: 220, tamano: 38, en: "84:horas" })] },
  { f: 85, fondo: "relato-sala", cam: "acerca", fondoOpts: { lampara: 0.5 }, els: [fig(PAPA, { x: 760, y: 560, cara: "serena", pose: "esconde" }), fig(MAMA, { x: 1100, y: 560, cara: "serena" })] },
  { f: 86, fondo: "relato-cuarto", cam: "acerca", els: [cerca(HIJO, { x: 760, cara: "serena", brillo: 0 }), tele({ x: 1460, escala: 0.9 })] },
  { f: 87, fondo: "relato-ciudad", cam: "aleja", els: [] },
  // ===== 8. qué hacer desde esta noche
  { f: 88, fondo: "relato-casa", cam: "acerca", els: [fig(PAPA, { x: 760, y: 560, cara: "atenta" }), fig(MAMA, { x: 1100, y: 560, cara: "atenta" })] },
  { f: 89, fondo: "relato-madera", cam: "acerca", els: [dato({ texto: "1 · Horarios claros", tamano: 90, y: 200, en: 0.2 }), pz("relojpared", { y: 640, escala: 1, params: { horas: [[0, 6], [ini(90) - ini(89), 8]] } })] },
  { f: 90, fondo: "relato-sala", cam: "acerca", els: [pz("pantalla", { x: 960, y: 420, escala: 0.8 }), ...familia({ cara: "feliz", y: 620 })] },
  { f: 91, fondo: "relato-sala", cam: "acerca", els: [dato({ texto: "2 · Conoce lo que juegan", tamano: 80, y: 180, en: 0.2 }), fig(PAPA, { x: 700, y: 580, cara: "atenta" }), fig(HIJO, { x: 1100, y: 580, cara: "feliz" }), pz("control", { x: 1220, y: 660, escala: 0.4 })] },
  { f: 92, fondo: "relato-rojo", cam: "acerca", els: [dato({ texto: "Para adultos", tamano: 110, y: 380, en: 0.2 }), fig(NINO, { x: 960, y: 700, cara: "atenta", escala: 1.4 })] },
  { f: 93, fondo: "relato-campo", cam: "der", els: [dato({ texto: "3 · Aire libre", tamano: 90, y: 180, en: 0.2 }), dato({ valor: 60, unidad: "min al día", y: 400, x: 960, tamano: 90, en: "93:hora", params: { valor: [["93:hora", 0], [ini(94) - ini(93), 60]] } })] },
  { f: 94, fondo: "relato-campo", cam: "izq", els: [pz("bicicleta", { x: 520, y: 760, escala: 0.8, en: "94:bicicleta" }), pz("balon", { x: 960, y: 860, escala: 0.6, en: "94:balón" }), ...[[1300, PAPA], [1500, NINO], [1700, MAMA]].map(([x, v]) => fig(v, { x, y: 640, escala: 1.2, cara: "feliz", en: "94:caminata" }))] },
  { f: 95, fondo: "relato-casa", cam: "acerca", els: [dato({ texto: "4 · La fe en casa", tamano: 80, y: 160, en: 0.2 }), pz("mesa", { y: 860, escala: 1.1, en: "95:mesa" }), ...familia({ cara: "serena", pose: "reza", y: 600, en: "95:oración" })] },
  { f: 96, fondo: "relato-casa", cam: "aleja", els: [dato({ texto: "5 · El ejemplo", tamano: 80, y: 160, en: 0.2 }), fig(PAPA, { x: 760, y: 580, pose: "reza", cara: "serena" }), fig(NINO, { x: 1100, y: 640, pose: "reza", cara: "serena", en: "96:hacen#2" })] },
  // ===== 9. el santo que jugaba videojuegos
  { f: 97, fondo: "relato-sagrado", cam: "acerca", els: [fig(HIJO, { y: 520, cara: "feliz", aureola: true, brillo: 0.6, en: "97:carlo" })] },
  { f: 98, fondo: "relato-cuarto", fondoOpts: { brillo: 0.5 }, cam: "der", els: [fig(HIJO, { x: 760, y: 560, cara: "feliz" }), pz("telefono", { x: 1100, y: 500, escala: 0.4, en: "98:computación" }), pz("control", { x: 1400, y: 560, escala: 0.5, en: "98:videojuegos" })] },
  { f: 99, fondo: "relato-madera", cam: "acerca", els: [pz("control", { x: 600, y: 560, escala: 0.9 }), dato({ texto: "1 hora", unidad: "a la semana", x: 1260, y: 540, tamano: 110, en: "99:hora" })] },
  { f: 100, fondo: "relato-monasterio", cam: "acerca", els: [pz("relojpared", { x: 960, y: 420, escala: 0.8, params: { horas: [[0, 10], [ini(101) - ini(100), 11]] } }), pz("vela", { x: 560, y: 760 }), pz("vela", { x: 1360, y: 760 })] },
  { f: 101, fondo: "relato-campo", cam: "der", els: [fig(HIJO, { x: 520, y: 640, cara: "feliz", en: 0.2 }), fig("campesino", { x: 860, y: 640, cara: "feliz", en: "101:pobres" }), pz("telefono", { x: 1400, y: 560, escala: 0.5, en: "101:página" }), pz("resplandor", { x: 1400, y: 560, radio: 300, capa: -1, en: "101:milagros" })] },
  { f: 102, fondo: "relato-noche", cam: "acerca", els: [pz("fachada", { x: 960, y: 820, escala: 0.85, entra: "ninguna", figura: "papa", brazos: 1 }), pz("multitud", { x: 960, y: 780, ancho: 2300, alto: 300, luces: 0.3, densidad: 0.7, entra: "ninguna" }), dato({ texto: "7 · 9 · 2025", tamano: 80, y: 200, en: "102:siete" })] },
  { f: 103, fondo: "relato-sagrado", cam: "aleja", els: [fig(HIJO, { y: 520, cara: "serena", aureola: true, brillo: 0.8 }), pz("control", { x: 1400, y: 620, escala: 0.4, opacidad: 0.8 })] },
  // ===== el cierre
  { f: 104, fondo: "relato-ciudad", cam: "acerca", els: [fig(HIJO_C, { x: 960, y: 600, escala: 1.4, cara: "serena", opacidad: 0.85 })] },
  { f: 105, fondo: "relato-casa", cam: "acerca", els: [fig(PAPA, { x: 680, y: 560, pose: "abraza", cara: "feliz", en: "105:papá" }), fig(MAMA, { x: 1240, y: 560, pose: "abraza", cara: "feliz", en: "105:mamá" }), fig(HIJO, { x: 960, y: 600, cara: "feliz" }), pz("resplandor", { y: 300, radio: 700, capa: -1, opacidad: 0.4, en: "105:dios" })] },
  { f: 106, fondo: "relato-pasillo", cam: "acerca", els: [fig(PAPA, { x: 620, y: 560, cara: "serena", mueve: [["106:toca", { x: 860 }]] })] },
  { f: 107, fondo: "relato-cuarto", fondoOpts: { brillo: 0.3 }, cam: "acerca", els: [pz("pantalla", { x: 1460, y: 470, escala: 0.8, escena: "apagada" }), fig(PAPA, { x: 620, y: 560, pose: "abraza", cara: "feliz" }), fig(HIJO, { x: 960, y: 580, cara: "feliz" })] },
  cta(108, "108:suscríbete", "108:comparte"),
  // la pantalla final (15 s sin voz): la tarjeta arriba y abajo espacio libre para los elementos de fin de YouTube
  { f: "fin", fondo: "relato-sagrado", cam: "quieto", els: [pz("suscribir", { canal: CANAL, lema: LEMA, escala: 0.9, y: 190, entra: "aparece", pulsa: 1 }), globo("Que Dios bendiga a tu familia", { y: 330, tamano: 40, en: 0.6, halo: "#fff1c4" })] },
];
p.pantallaFinal = 15;

// ---------------------------------------------------------------- a proyecto.json
const escenas = [{ nombre: "video", tomas: [] }];
tomas.forEach((t, i) => {
  const fin = i < tomas.length - 1 ? ini(tomas[i + 1].f) : T.duracion + (p.pantallaFinal || 0), d = Math.max(1, fin - ini(t.f));
  // lo que no tiene un momento propio (en) ya está en el cuadro al cortar: sin fundido de entrada
  const dibujo = { fondo: t.fondo, camara: cam(t.cam || "acerca", d), elementos: t.els.map((e) => (e.en === undefined && e.entra === "aparece" ? { ...e, entra: "ninguna" } : { ...e })) };
  if (t.fondoOpts) dibujo.fondoOpts = t.fondoOpts;
  escenas[0].tomas.push({ desde: t.f === 1 ? 0 : t.f, dibujo });
});
p.escenas = escenas;
writeFileSync(join(DIR, "proyecto.json"), JSON.stringify(p, null, 2) + "\n");
console.log(`${tomas.length} tomas`);
