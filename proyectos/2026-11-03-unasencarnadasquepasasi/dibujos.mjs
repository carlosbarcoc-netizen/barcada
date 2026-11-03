// Construye las tomas 2D del proyecto de uñas encarnadas (dibujos a medida del dedo y la uña).
import { readFileSync, writeFileSync } from "node:fs";
import { forma, TINTA } from "/home/user/barcoviral/nucleo/2d/estilo.mjs";
const P = "/home/user/barcoviral/proyectos/2026-11-03-unasencarnadasquepasasi/proyecto.json";
let n = 0;
const svg = (s) => { n++; return "</text>" + s.replace(/id="([a-z])(\d+)/g, `id="az${n}$1$2`).replace(/url\(#([a-z])(\d+)/g, `url(#az${n}$1$2`) + "<text>"; };
const lin = (d, c = TINTA, w = 6, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
// el dedo gordo visto desde arriba
const DEDO = "M -170 330 L -170 -40 C -170 -250 170 -250 170 -40 L 170 330 Z";
const dedo = (col = "piel") => svg(forma(DEDO, col, { sombra: 30, rim: 9 }) + lin("M -120 300 C -80 270 80 270 120 300", "#a9643d", 5) + lin("M -60 250 C -20 238 20 238 60 250", "#a9643d", 4));
const UNA_OK = "M -110 -150 L 110 -150 L 112 50 C 70 85 -70 85 -112 50 Z";
const unaOk = () => svg(forma(UNA_OK, ["#fff4f0", "#f6cfc4", "#d9a597", "#ffffff"], { sombra: 14, rim: 5, borde: 5 }) + `<path d="M -110 -150 L 110 -150 L 110 -125 L -110 -125 Z" fill="#fffdf8" stroke="${TINTA}" stroke-width="4"/>` + `<ellipse cx="-50" cy="-60" rx="22" ry="60" fill="#fff" opacity="0.5"/>`);
const UNA_CORTA = "M -55 -95 C -20 -105 20 -105 55 -95 C 95 -80 112 -40 112 0 L 112 50 C 70 85 -70 85 -112 50 L -112 0 C -112 -40 -95 -80 -55 -95 Z";
const unaCorta = () => svg(forma(UNA_CORTA, ["#fff4f0", "#f6cfc4", "#d9a597", "#ffffff"], { sombra: 14, rim: 5, borde: 5 }) + `<ellipse cx="-45" cy="-20" rx="20" ry="45" fill="#fff" opacity="0.5"/>` + lin("M -120 -20 C -150 -110 -140 -170 -120 -200", "#a9643d", 5) + lin("M 120 -20 C 150 -110 140 -170 120 -200", "#a9643d", 5));
const espina = () => svg(forma("M -112 10 L -175 -75 L -100 -35 Z", ["#fff4f0", "#f6cfc4", "#d9a597", "#ffffff"], { sombra: 6, rim: 3, borde: 5 }));
const rojo = (r = 150, op = 0.65) => svg(`<circle r="${r}" fill="#ff2a2a" opacity="${op}" style="filter:blur(${r * 0.3}px)"/>`);
const bulto = () => svg(forma("M -60 0 C -60 -70 60 -70 60 0 C 60 60 -60 60 -60 0 Z", "carne", { sombra: 14, rim: 5, borde: 5 }));
const pus = () => svg(forma("M -38 0 C -38 -45 38 -45 38 0 C 38 35 -38 35 -38 0 Z", ["#fffbd0", "#f4e27a", "#b9a032", "#ffffff"], { sombra: 8, rim: 3, borde: 5 }) + `<ellipse cx="-12" cy="-14" rx="12" ry="7" fill="#fff" opacity="0.8"/>`);
const tijera = () => svg(
  forma("M -20 -10 L 260 -40 L 270 -20 L -10 20 Z", "metal", { sombra: 8, rim: 3, borde: 5 }) +
  forma("M -20 10 L 260 40 L 270 20 L -10 -20 Z", "metal", { sombra: 8, rim: 3, borde: 5 }) +
  forma("M -40 -30 C -90 -100 -200 -80 -190 -30 C -180 10 -90 0 -40 -30 Z", "rosa", { sombra: 12, rim: 4, borde: 5 }) +
  forma("M -40 30 C -90 100 -200 80 -190 30 C -180 -10 -90 0 -40 30 Z", "rosa", { sombra: 12, rim: 4, borde: 5 }) +
  `<circle r="12" fill="${TINTA}"/>`);
const pared = () => svg(forma("M -60 -260 C -60 -300 60 -300 60 -260 L 60 300 L -60 300 Z", "negro", { sombra: 18, rim: 6 }) + lin("M -20 -220 L -20 260", "#5b5f6a", 6, 'stroke-dasharray="20 18"'));
const corte = () => svg(lin("M -170 0 L 170 0", "#FFD23F", 10, 'stroke-dasharray="26 20"'));
// rayos X: el contorno del dedo y el hueso
const xray = () => svg(`<path d="${DEDO}" fill="#2b4a6b" opacity="0.55" stroke="#9fd6ff" stroke-width="8"/>` +
  forma("M -60 -120 C -95 -170 -40 -200 0 -170 C 40 -200 95 -170 60 -120 L 50 40 C 90 70 70 110 30 95 L 0 85 L -30 95 C -70 110 -90 70 -50 40 Z", "blanco", { sombra: 14, rim: 5, borde: 5 }) +
  forma("M -55 150 C -90 120 -50 100 -20 125 L 20 125 C 50 100 90 120 55 150 L 50 300 L -50 300 Z", "blanco", { sombra: 14, rim: 5, borde: 5 }));
const pegar = (x, y, s, entra, en, extra = {}) => ({ x, y, escala: s, entra, en, ...extra });
const T = (texto, x, y, s, entra, en, extra = {}) => ({ pieza: "texto", texto, tamano: 1, ...pegar(x, y, s, entra, en, extra) });

const DX = 540, DY = 1000; // dónde va el dedo
const escenas = [{ nombre: "uñas encarnadas", tomas: [
  { desde: 0, rotulo: "¿BIEN *CORTITAS*?", sonido: "crujido", sonidoEn: 1.9, dibujo: { fondo: "estudio",
    camara: [[0, { zoom: 1.15, y: 950 }], ["1:cortitas", { zoom: 1.3, y: 880 }], ["1:mas", { zoom: 1.1, y: 960 }]],
    elementos: [
      T(dedo(), DX, DY, 1.25, "sube", 0),
      T(unaOk(), DX, DY, 1.25, "aparece", 0, { hasta: "1:cortitas", duraSale: 0.1 }),
      T(unaCorta(), DX, DY, 1.25, "ninguna", "1:cortitas"),
      T(tijera(), 900, 760, 1, "derecha", 0.3, { rot: 180, mueve: [["1:bien", { x: 760, y: 820, escala: 1 }], ["1:cortitas", { x: 700, y: 870, escala: 1 }], ["1:mas", { x: 1500, y: 700, escala: 1 }]] }),
      { pieza: "aro", x: DX, y: 870, radio: 200, tinta: "#ff4d4d", entra: "aparece", en: "1:duren", params: { dibuja: [["1:duren", 0], ["1:mas", 1]] } },
    ] } },
  { desde: 2, sonido: "impacto", sonidoEn: 1.4, dibujo: { fondo: "estudio",
    camara: [[0, { zoom: 1.1, y: 960 }], ["2:infeccion", { zoom: 1.35, x: 420, y: 900 }]],
    elementos: [
      T(rojo(170, 0.7), DX - 140, 900, 1.25, "crece", "2:infeccion", { dura: 0.8, accion: "late" }),
      T(dedo(), DX, DY, 1.25, "ninguna", 0),
      T(unaCorta(), DX, DY, 1.25, "ninguna", 0),
      { pieza: "signo", tipo: "exclama", x: 680, y: 720, escala: 0.55, entra: "rebote", en: "2:terminar" },
      { pieza: "pildora", texto: "INFECCIÓN", color: "rojo", x: 540, y: 1460, entra: "sube", en: "2:infeccion" },
    ] } },
  { desde: 3, rotulo: "UÑA CORTA + ZAPATO = *PRESIÓN*", dibujo: { fondo: "estudio",
    camara: [[0, { zoom: 1 }], ["3:zapato", { zoom: 1.12, y: 940 }]],
    elementos: [
      T(dedo(), DX, DY, 1.15, "ninguna", 0),
      T(unaCorta(), DX, DY, 1.15, "ninguna", 0),
      { pieza: "aro", x: DX - 125, y: 900, radio: 75, tinta: "#ff4d4d", entra: "aparece", en: "3:redondeas", params: { dibuja: [["3:redondeas", 0], ["3:esquinas", 1]] } },
      { pieza: "aro", x: DX + 125, y: 900, radio: 75, tinta: "#ff4d4d", entra: "aparece", en: "3:redondeas", params: { dibuja: [["3:redondeas", 0], ["3:esquinas", 1]] } },
      T(pared(), 80, DY, 1, "izquierda", "3:zapato", { mueve: [["3:empuja", { x: 80, y: DY, escala: 1 }], ["3:piel", { x: 280, y: DY, escala: 1 }]] }),
      T(pared(), 1000, DY, 1, "derecha", "3:zapato", { mueve: [["3:empuja", { x: 1000, y: DY, escala: 1 }], ["3:piel", { x: 800, y: DY, escala: 1 }]] }),
      { pieza: "flecha", x: 170, y: 640, escala: 0.6, largo: 300, color: "rojo", entra: "izquierda", en: "3:empuja" },
      { pieza: "flecha", x: 910, y: 640, escala: 0.6, largo: 300, color: "rojo", rot: 180, entra: "derecha", en: "3:empuja" },
    ] } },
  { desde: 4, rotulo: "UÑA *ENCARNADA*", sonido: "impacto", sonidoEn: 0.75, dibujo: { fondo: "estudio",
    camara: [[0, { zoom: 1.15, y: 950 }], ["4:clava", { zoom: 1.6, x: 380, y: 900 }], ["4:encarna", { zoom: 1.45, x: 420, y: 920 }]],
    elementos: [
      T(rojo(120, 0.75), DX - 180, 930, 1.3, "crece", "4:encarna", { dura: 0.6, accion: "late" }),
      T(dedo(), DX, DY, 1.3, "ninguna", 0),
      T(unaCorta(), DX, DY, 1.3, "ninguna", 0),
      T(espina(), DX, DY, 1.3, "crece", "4:clava", { dura: 0.6 }),
      { pieza: "aro", x: DX - 175, y: 925, radio: 80, tinta: "#FFD23F", entra: "aparece", en: "4:astilla", params: { dibuja: [["4:astilla", 0], ["4:y", 1]] } },
    ] } },
  { desde: 5, dibujo: { fondo: "estudio",
    camara: [[0, { zoom: 1.05, y: 960 }]],
    elementos: [
      T(rojo(220, 0.6), DX - 150, 920, 1.2, "crece", "5:dolor", { accion: "late" }),
      T(dedo(), DX, DY + 60, 1.1, "ninguna", 0, { accion: "late" }),
      T(unaCorta(), DX, DY + 60, 1.1, "ninguna", 0, { accion: "late" }),
      T(espina(), DX, DY + 60, 1.1, "ninguna", 0, { accion: "late" }),
      T(bulto(), DX - 175, 960, 1.3, "rebote", "5:hinchazon"),
      { pieza: "pildora", texto: "DOLOR", color: "rojo", x: 300, y: 640, entra: "rebote", en: "5:dolor" },
      { pieza: "pildora", texto: "ENROJECIMIENTO", color: "naranja", x: 600, y: 540, entra: "rebote", en: "5:enrojecimiento" },
      { pieza: "pildora", texto: "HINCHAZÓN", color: "morado", x: 760, y: 680, entra: "rebote", en: "5:hinchazon" },
    ] } },
  { desde: 6, rotulo: "BACTERIAS → *PUS*", sonido: "burbujas", sonidoEn: 2.4, dibujo: { fondo: "estudio",
    camara: [[0, { zoom: 1.1, y: 950 }], ["6:pus", { zoom: 1.5, x: 400, y: 920 }]],
    elementos: [
      T(rojo(200, 0.6), DX - 160, 930, 1.2, "ninguna", 0, { accion: "late" }),
      T(dedo(), DX, DY, 1.2, "ninguna", 0),
      T(unaCorta(), DX, DY, 1.2, "ninguna", 0),
      T(espina(), DX, DY, 1.2, "ninguna", 0),
      T(bulto(), DX - 185, 960, 1.4, "ninguna", 0),
      { pieza: "celula", color: "verde", x: 120, y: 620, escala: 0.28, entra: "izquierda", en: "6:entran", accion: "tiembla", mueve: [["6:bacterias", { x: 120, y: 620, escala: 0.28 }], ["6:pus", { x: 330, y: 880, escala: 0.22 }]] },
      { pieza: "celula", color: "verde", x: 80, y: 1150, escala: 0.24, entra: "izquierda", en: "6:bacterias", accion: "tiembla", mueve: [["6:y", { x: 80, y: 1150, escala: 0.24 }], ["6:pus", { x: 300, y: 1000, escala: 0.2 }]] },
      { pieza: "celula", color: "verde", x: 200, y: 450, escala: 0.22, entra: "aparece", en: "6:bacterias", accion: "tiembla", mueve: [["6:y", { x: 200, y: 450, escala: 0.22 }], ["6:pus", { x: 380, y: 830, escala: 0.18 }]] },
      T(pus(), DX - 195, 940, 1.2, "rebote", "6:pus"),
    ] } },
  { desde: 7, dibujo: { fondo: "luces",
    elementos: [
      { pieza: "titular", texto: "¿Y SI NO HACES NADA?", tamano: 120, x: 540, y: 900, entra: "rebote", en: 0.05 },
      { pieza: "signo", tipo: "pregunta", x: 540, y: 1200, escala: 0.7, entra: "rebote", en: "7:nada", accion: "balancea" },
    ] } },
  { desde: 8, rotulo: "HASTA EL *HUESO*", sonido: "impacto", sonidoEn: 1.3, dibujo: { fondo: "oscuro",
    camara: [[0, { zoom: 1.05 }], ["8:hueso", { zoom: 1.25, y: 1000 }]],
    elementos: [
      T(xray(), DX, DY, 1.2, "aparece", 0),
      T(rojo(110, 0.95), DX - 150, 880, 1.2, "crece", 0.1, { mueve: [["8:llegar", { x: DX - 150, y: 880, escala: 1.2 }], ["8:hueso", { x: DX - 20, y: 950, escala: 1.7 }]] }),
      { pieza: "diana", x: DX, y: 860, radio: 110, entra: "gira", en: "8:hueso" },
    ] } },
  { desde: 9, dibujo: { fondo: "interfaz",
    elementos: [
      { pieza: "pildora", texto: "CON DIABETES", color: "rojo", x: 540, y: 560, entra: "rebote", en: "9:diabetes" },
      { pieza: "titular", texto: "MÁS GRAVE", tamano: 130, x: 540, y: 770, entra: "rebote", en: "9:grave" },
      { pieza: "etiqueta", texto: "SENSIBILIDAD", x: 300, y: 930, tamano: 40, entra: "aparece", en: "9:siente" },
      { pieza: "bateria", x: 300, y: 1170, escala: 0.75, entra: "rebote", en: "9:siente", params: { nivel: [["9:siente", 1], ["9:menos", 0.2]] } },
      { pieza: "etiqueta", texto: "SANGRE", x: 780, y: 930, tamano: 40, entra: "aparece", en: "9:recibe" },
      { pieza: "gota", color: "rojo", x: 780, y: 1170, escala: 0.8, entra: "rebote", en: "9:recibe", mueve: [["9:menos#2", { x: 780, y: 1170, escala: 0.8 }], ["9:sangre", { x: 780, y: 1210, escala: 0.35 }]] },
    ] } },
  { desde: 10, rotulo: "CORTE *RECTO*", sonido: "crujido", sonidoEn: 0.9, dibujo: { fondo: "estudio", fondoOpts: { paleta: ["#e6f7ee", "#c9ead8"] },
    camara: [[0, { zoom: 1.1, y: 940 }], ["10:cortas", { zoom: 1, y: 960 }]],
    elementos: [
      T(dedo(), DX, DY, 1.2, "sube", 0),
      T(unaOk(), DX, DY, 1.2, "aparece", "10:cortalas"),
      T(corte(), DX, DY - 165, 1.2, "crece", "10:cortalas"),
      T(tijera(), 1200, 760, 0.8, "ninguna", 0, { rot: 180, mueve: [["10:cortalas", { x: 1200, y: 760, escala: 0.8 }], ["10:rectas", { x: 820, y: 805, escala: 0.8 }], ["10:redondear", { x: 450, y: 805, escala: 0.8 }]] }),
      { pieza: "signo", tipo: "check", x: 860, y: 1330, escala: 0.45, entra: "rebote", en: "10:cortas" },
    ] } },
  { desde: 11, sonido: "vertido", sonidoEn: 0.1, dibujo: { fondo: "estudio", fondoOpts: { paleta: ["#e6f3ff", "#cfe4f7"] },
    elementos: [
      { pieza: "lista", titulo: "PIES SANOS", items: ["LAVAR", "SECAR BIEN", "ZAPATO AMPLIO"], x: 540, y: 1000, escala: 1.5, entra: "rebote", en: 0.05, params: { hechos: [["11:lava", 0], ["11:pies", 1], ["11:secalos", 1], ["11:dedos", 2], ["11:zapatos", 2], ["11:espacio", 3]] } },
      { pieza: "gota", color: "agua", x: 200, y: 600, escala: 0.4, entra: "cae", en: "11:lava", accion: "flota" },
      { pieza: "gota", color: "agua", x: 880, y: 620, escala: 0.32, entra: "cae", en: "11:pies", accion: "flota" },
    ] } },
  { desde: 12, rotulo: "VE CON UN *ESPECIALISTA*", dibujo: { fondo: "estudio",
    elementos: [
      { pieza: "pildora", texto: "PUS", color: "amarillo", x: 300, y: 620, entra: "rebote", en: "12:pus" },
      { pieza: "pildora", texto: "MUCHO DOLOR", color: "rojo", x: 720, y: 620, entra: "rebote", en: "12:dolor" },
      { pieza: "persona", color: "blanco", pelo: "negro", pose: "saluda", x: 540, y: 1080, escala: 1.15, entra: "sube", en: "12:ve" },
      { pieza: "signo", tipo: "check", x: 820, y: 860, escala: 0.4, entra: "rebote", en: "12:especialista" },
    ] } },
  { desde: 13, dibujo: { fondo: "luces",
    elementos: [
      { pieza: "titular", texto: "SÍGUEME", debajo: "PARA APRENDER MÁS", tamano: 170, x: 540, y: 880, entra: "rebote", en: 0.05 },
      { pieza: "pildora", texto: "@Azzure", color: "morado", x: 540, y: 1180, entra: "sube", en: "13:aprender" },
    ] } },
] }];
const p = JSON.parse(readFileSync(P, "utf8"));
for (const t of escenas[0].tomas) for (const e of t.dibujo.elementos) if (e.mueve) e.mueve = e.mueve.map(([k, v]) => [k, { rot: e.rot ?? 0, ...v }]);
p.escenas = escenas; delete p.sujeto;
writeFileSync(P, JSON.stringify(p, null, 1));
console.log("ok");
