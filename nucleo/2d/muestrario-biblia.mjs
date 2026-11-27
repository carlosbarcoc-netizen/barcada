// El muestrario de historia bíblica: las piezas, los fondos y unas escenas de ejemplo, para aprobar el look antes de
// gastar voz. node nucleo/2d/muestrario-biblia.mjs <carpeta de salida>
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { PIEZAS_BIBLIA } from "./piezas-biblia.mjs";
import { FONDOS_BIBLIA } from "./fondos-biblia.mjs";
import { FONDOS } from "./fondos.mjs";
import { crearCuadro } from "./escena.mjs";
import { cerrarNavegador, foto } from "./dibujante.mjs";
import { usarFormato } from "../comun.mjs";

const salida = process.argv[2] || "muestrario", HZ = process.argv[3] === "horizontal";
mkdirSync(salida, { recursive: true });
const nombre = (x, y, n, tam = 34) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="${tam}" fill="#fff" stroke="#2b1a14" stroke-width="7" paint-order="stroke">${n}</text>`;

// 1. las piezas, de 12 en 12
const ejemplos = {
  jose: [{ pose: "quieta", aureola: 0.8 }, 0.5], maria: [{ pose: "reza", aureola: 0.8 }, 0.5], jesus: [{ edad: "bebe" }, 0.8], angel: [{ pose: "abre" }, 0.42],
  pastor: [{ pose: "saluda" }, 0.5], rey: [{}, 0.5], anciano: [{ pose: "carga", lleva: "nino" }, 0.5], mago: [{ pose: "carga", lleva: "cofre" }, 0.5],
  burro: [{ carga: "maria_nino" }, 0.38], oveja: [{}, 0.6], paloma: [{}, 0.6], camello: [{}, 0.38], martillo: [{ giro: 30 }, 0.6], serrucho: [{}, 0.55],
  tablas: [{}, 0.5], banco: [{}, 0.42], silla: [{}, 0.45], casaadobe: [{ luz: 1 }, 0.42], pesebre: [{ nino: true }, 0.45], estrella: [{ cola: 0.3 }, 0.55],
  haz: [{ largo: 400 }, 0.7], piramide: [{}, 0.36], palmera: [{}, 0.45], olivo: [{}, 0.5], templo: [{}, 0.34], lampara: [{}, 0.6], pergamino: [{ texto: "MATEO 1" }, 0.5],
  lirio: [{}, 0.55], vara: [{}, 0.5], cofrecito: [{}, 0.6], corona: [{}, 0.6], cruz: [{}, 0.5], corazones: [{}, 0.55], zzz: [{}, 0.8], nubesueno: [{ dentro: "angel", dentroParams: { pose: "senala" } }, 0.5], rotulo: [{ texto: "NAZARET" }, 0.5],
};
const lista = Object.keys(PIEZAS_BIBLIA), porHoja = 12, cols = 3, celW = 360, celH = 480;
for (let h = 0; h * porHoja < lista.length; h++) {
  const celdas = lista.slice(h * porHoja, (h + 1) * porHoja).map((n, i) => {
    const x = (i % cols) * celW + celW / 2, y = Math.floor(i / cols) * celH + celH / 2 + 10, [ej, esc] = ejemplos[n] || [{}, 0.5];
    return `<clipPath id="cel${i}"><rect x="${x - celW / 2 + 6}" y="${y - celH / 2 + 6}" width="${celW - 12}" height="${celH - 12}"/></clipPath>
      <g clip-path="url(#cel${i})"><g transform="translate(${x} ${y - 10}) scale(${esc})">${PIEZAS_BIBLIA[n]({ t: 0.5, ...ej })}</g></g>${nombre(x, y + 205, n)}`;
  }).join("");
  const f = join(salida, `biblia-piezas-${h + 1}.jpg`);
  await foto(FONDOS.estudio({ t: 0, suelo: 2400 }) + celdas, f, 0.75);
  console.log(f);
}

// 2. los fondos, en miniatura (3 × 4)
{
  const fs = Object.keys(FONDOS_BIBLIA), w = 340, hgt = 604;
  const celdas = fs.map((n, i) => {
    const x = 15 + (i % 3) * (w + 15), y = 15 + Math.floor(i / 3) * (hgt + 15);
    return `<clipPath id="fc${i}"><rect x="${x}" y="${y}" width="${w}" height="${hgt}"/></clipPath><g clip-path="url(#fc${i})"><g transform="translate(${x} ${y}) scale(${w / 1080})">${FONDOS_BIBLIA[n]({ t: 0 }).replace(/id="([a-z]+)"/g, `id="$1${i}"`).replace(/url\(#([a-z]+)\)/g, `url(#$1${i})`)}</g></g>
      <rect x="${x}" y="${y}" width="${w}" height="${hgt}" fill="none" stroke="#fff" stroke-width="4"/>${nombre(x + w / 2, y + hgt - 30, n, 40)}`;
  }).join("");
  const f = join(salida, "biblia-fondos.jpg");
  await foto(`<rect width="1080" height="1920" fill="#1a1210"/>${celdas}`, f, 0.75);
  console.log(f);
}

// 3. escenas de ejemplo, como saldrían en el video
const escenas = {
  "1-taller": { fondo: "taller", elementos: [
    { pieza: "banco", x: 640, y: 1380, escala: 1 }, { pieza: "jose", x: 330, y: 1390, escala: 1.25, pose: "trabaja" },
    { pieza: "jesus", x: 820, y: 1400, escala: 1, edad: "nino", pose: "senala", mira: -1, aureola: 0.6 }, { pieza: "tablas", x: 860, y: 1520, escala: 0.6 }] },
  "2-camino-a-belen": { fondo: "camino", elementos: [
    { pieza: "burro", x: 600, y: 1420, escala: 1.15, carga: "maria", camina: true }, { pieza: "jose", x: 250, y: 1440, escala: 1.2, pose: "camina" },
    { pieza: "rotulo", x: 900, y: 1300, escala: 0.55, texto: "BELÉN" }] },
  "3-sueno": { fondo: "casanoche", elementos: [
    { pieza: "jose", x: 560, y: 1330, escala: 1.25, pose: "duerme" }, { pieza: "nubesueno", x: 620, y: 760, escala: 1.15, dentro: "angel", dentroParams: { pose: "senala" }, dentroEscala: 0.5 },
    { pieza: "lampara", x: 880, y: 1600, escala: 0.55 }] },
  "4-nacimiento": { fondo: "establo", elementos: [
    { pieza: "estrella", x: 540, y: 380, escala: 0.6, cola: 0.4 }, { pieza: "pesebre", x: 540, y: 1300, escala: 1.05, nino: true },
    { pieza: "jose", x: 220, y: 1350, escala: 1.1, pose: "reza", aureola: 0.8 }, { pieza: "maria", x: 860, y: 1350, escala: 1.1, pose: "reza", aureola: 0.8, mira: -1 },
    { pieza: "oveja", x: 160, y: 1640, escala: 0.6 }] },
  "5-huida-a-egipto": { fondo: "egipto", elementos: [
    { pieza: "palmera", x: 900, y: 1450, escala: 1.3 }, { pieza: "burro", x: 500, y: 1450, escala: 1.15, carga: "maria_nino", camina: true },
    { pieza: "jose", x: 160, y: 1470, escala: 1.15, pose: "camina" }] },
  "6-angel": { fondo: "gloria", elementos: [{ pieza: "angel", x: 540, y: 1150, escala: 1.6, pose: "abre", boca: "habla" }, { pieza: "lirio", x: 860, y: 1560, escala: 0.9 }, { pieza: "lirio", x: 200, y: 1560, escala: 0.9 }] },
};
// en horizontal (1920 × 1080): el suelo está en y 864; los personajes, con los pies ahí y a escala ~0,85
const escenasH = {
  "1-taller": { fondo: "taller", elementos: [
    { pieza: "banco", x: 1000, y: 880, escala: 0.8 }, { pieza: "jose", x: 620, y: 900, escala: 1, pose: "trabaja" },
    { pieza: "jesus", x: 1380, y: 910, escala: 0.95, edad: "nino", pose: "senala", mira: -1, aureola: 0.6 }, { pieza: "silla", x: 1700, y: 900, escala: 0.6 }] },
  "2-camino-a-belen": { fondo: "camino", elementos: [
    { pieza: "burro", x: 1020, y: 920, escala: 0.95, carga: "maria", camina: true }, { pieza: "jose", x: 640, y: 930, escala: 1, pose: "camina" },
    { pieza: "rotulo", x: 1600, y: 860, escala: 0.5, texto: "BELÉN" }] },
  "3-sueno": { fondo: "casanoche", elementos: [
    { pieza: "jose", x: 620, y: 860, escala: 1.35, pose: "duerme" }, { pieza: "nubesueno", x: 1250, y: 380, escala: 0.95, dentro: "angel", dentroParams: { pose: "senala" }, dentroEscala: 0.5 },
    { pieza: "lampara", x: 220, y: 960, escala: 0.5 }] },
  "4-nacimiento": { fondo: "establo", elementos: [
    { pieza: "estrella", x: 960, y: 150, escala: 0.4, cola: 0.25 }, { pieza: "pesebre", x: 960, y: 860, escala: 0.9, nino: true },
    { pieza: "jose", x: 560, y: 900, escala: 1, pose: "reza", aureola: 0.8 }, { pieza: "maria", x: 1360, y: 900, escala: 1, pose: "reza", aureola: 0.8, mira: -1 },
    { pieza: "oveja", x: 250, y: 960, escala: 0.55 }, { pieza: "burro", x: 1700, y: 900, escala: 0.65, mira: -1 }] },
  "5-huida-a-egipto": { fondo: "egipto", elementos: [
    { pieza: "palmera", x: 1600, y: 900, escala: 1.05 }, { pieza: "burro", x: 1050, y: 920, escala: 0.95, carga: "maria_nino", camina: true },
    { pieza: "jose", x: 620, y: 930, escala: 1, pose: "camina" }] },
  "6-angel": { fondo: "gloria", elementos: [{ pieza: "angel", x: 960, y: 640, escala: 1.25, pose: "abre", boca: "habla" }, { pieza: "lirio", x: 1500, y: 860, escala: 0.75 }, { pieza: "lirio", x: 420, y: 860, escala: 0.75 }] },
  "7-nazaret": { fondo: "nazaret", elementos: [{ pieza: "casaadobe", x: 1450, y: 880, escala: 0.75 }, { pieza: "olivo", x: 300, y: 900, escala: 0.9 },
    { pieza: "jose", x: 800, y: 910, escala: 1, pose: "saluda" }, { pieza: "maria", x: 1080, y: 910, escala: 1, mira: -1 }] },
  "8-templo": { fondo: "templo", elementos: [{ pieza: "anciano", x: 1200, y: 910, escala: 1, pose: "carga", lleva: "nino", mira: -1 },
    { pieza: "jose", x: 520, y: 910, escala: 1, pose: "carga", lleva: "paloma" }, { pieza: "maria", x: 800, y: 910, escala: 1, pose: "reza" }] },
};
// en las escenas de arriba, «y» es dónde pisan; las piezas tienen la base 300 px (× escala) por debajo de su centro
for (const d of Object.values(escenasH)) for (const e of d.elementos) if (e.y >= 850) e.y = Math.round(e.y + 60 - (e.pieza === "oveja" ? 230 : 300) * (e.escala ?? 1));
if (HZ) usarFormato("horizontal");
for (const [n, dibujo] of Object.entries(HZ ? escenasH : escenas)) {
  const cu = crearCuadro(dibujo, { inicio: 0, fin: 4 }, () => 0);
  const f = join(salida, `biblia-${HZ ? "h-" : ""}escena-${n}.jpg`);
  await foto({ preparar: cu.preparar, cuadro: () => cu(1.3) }, f, HZ ? 0.6 : 0.75);
  console.log(f);
}
await cerrarNavegador();
