// El muestrario: todas las piezas en hojas, con su nombre (para revisar el look y para la guía).
// node nucleo/2d/muestrario.mjs <carpeta de salida>            → las piezas 2D con volumen
// node nucleo/2d/muestrario.mjs <carpeta de salida> neon       → las piezas del modo juego en esa piel (neon, voxel, arcade)
// node nucleo/2d/muestrario.mjs <carpeta de salida> relato     → las piezas y los fondos del estilo relato (en 16:9)
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { PIEZAS as PIEZAS_2D, LISTA } from "./piezas.mjs";
import { FONDOS } from "./escena.mjs";
import { PIEZAS_JUEGO } from "./piezas-juego.mjs";
import { piel as pielDe } from "./juego.mjs";
import { cerrarNavegador, foto } from "./dibujante.mjs";
import { PIEZAS_RELATO } from "./relato.mjs";
import { usarFormato } from "../comun.mjs";

const salida = process.argv[2] || "muestrario", piel = process.argv[3] || null;
mkdirSync(salida, { recursive: true });
if (piel === "relato") { await relato(); process.exit(0); }
const porHoja = 12, cols = 3, celW = 360, celH = 480;
const ejemplos2d = { mazorca: { abre: 0.8 }, grano: { estado: 2.2 }, chocolate: { partida: 0.6 }, grafico: { tendencia: 1 }, celular: { pantalla: "+40%" }, laptop: { pantalla: "IA" }, numero: { texto: "70 %" }, texto: { texto: "¡HOLA!" }, persona: { pose: "saluda" }, signo: { tipo: "distinto" }, planeta: {}, reloj: { hora: 10.2 }, mano: { gesto: "senala" } };
// ejemplos del modo juego: [parámetros, escala en la celda]
const ejemplosJuego = {
  personaje: [{ cara: "feliz", antena: true }, 0.8], robot: [{ cara: "normal" }, 0.65], letrero: [{ texto: "1 · TALLER" }, 0.6], cifra: [{ valor: 1820, tamano: 120 }, 0.7],
  dialogo: [{ texto: "¡Buenos días!" }, 0.6], cta: [{ palabra: "IA", texto: "y te paso la guía" }, 0.36], barra: [{ valor: 0.7, texto: "BANDEJA", cuenta: "40 SIN LEER" }, 0.42],
  icono: [{ nombre: "correo" }, 1], muchos: [{ icono: "correo", n: 12, columnas: 4, separa: 100 }, 0.75], sello: [{ texto: "GRATIS" }, 0.7], rayos: [{ radio: 200 }, 0.8],
  confeti: [{ tl: 1.2 }, 0.3], explosion: [{ tl: 0.2 }, 0.7], ventana: [{ titulo: "AGENTE", texto: "24/7" }, 0.55], terminal: [{ texto: "> monta mi agente 24 h\n✓ listo", tl: 9 }, 0.5],
  edificio: [{ resalta: 7, placa: "203.0.113.10" }, 0.6], servidor: [{}, 0.8], puerta: [{ cartel: "¿ERES TÚ?" }, 0.55], candado: [{}, 1.1], llave: [{}, 0.9], chip: [{ sub: "CONTRASEÑA", texto: "••••••" }, 0.7],
  pulso: [{ titulo: "AGENTE" }, 0.8], dispositivo: [{ tipo: "laptop", pantalla: "IA" }, 0.7], linea: [{ dx: 260, dy: -120 }, 0.9], balanza: [{ inclina: 0.6, izq: "MENÚ", der: "VPS" }, 0.5],
  esfera: [{ hora: 4 }, 0.9], temporizador: [{ segundos: 59 }, 0.9], paquete: [{ abierto: 0.4 }, 0.7], libros: [{ texto: "BIBLIOTECA" }, 0.7],
  isla: [{}, 0.65], nubebloque: [{}, 0.9], cubo: [{ cara: true }, 1], arbolbloque: [{}, 0.75], tienda: [{ letrero: "TIENDA" }, 0.55], escritorio: [{}, 0.6], cofre: [{ abierto: 0.6 }, 0.7],
  pedestal: [{ icono: "llave" }, 0.6], estante: [{ n: 7 }, 0.55], cajas: [{}, 0.55], app: [{}, 0.6], maquina: [{ titulo: "TU IA", texto: "PLAY", precio: "GRATIS" }, 0.48], monitor: [{ texto: "OPEN|IA", sello: "GRATIS" }, 0.5],
  ficha: [{ filas: [["NOMBRE", "OPEN IA"], ["HECHO EN", "LA U"]], ancho: 700 }, 0.42], mejora: [{ texto: "CEREBRO", icono: "cerebro" }, 0.38], advertencia: [{ tl: 0.1 }, 0.3], vs: [{ izq: "RICO", der: "TÚ" }, 0.3], continuar: [{ n: 5 }, 0.5],
};
const lista = piel ? Object.keys(PIEZAS_JUEGO) : LISTA;
const PZ = piel ? PIEZAS_JUEGO : PIEZAS_2D;
for (let h = 0; h * porHoja < lista.length; h++) {
  const piezas = lista.slice(h * porHoja, (h + 1) * porHoja);
  const celdas = piezas.map((n, i) => {
    const x = (i % cols) * celW + celW / 2, y = Math.floor(i / cols) * celH + celH / 2 + 10;
    const [ej, esc] = piel ? ejemplosJuego[n] || [{}, 0.6] : [ejemplos2d[n] || {}, 0.62];
    const clip = `<clipPath id="cel${i}"><rect x="${x - celW / 2 + 6}" y="${y - celH / 2 + 6}" width="${celW - 12}" height="${celH - 12}"/></clipPath>`;
    return `${clip}<g clip-path="url(#cel${i})"><g transform="translate(${x} ${y - 20}) scale(${esc})">${PZ[n]({ t: 0.5, tl: 2, piel, ...ej })}</g></g>
      <text x="${x}" y="${y + 200}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="34" fill="#fff" stroke="#2b1a14" stroke-width="7" paint-order="stroke">${n}</text>`;
  }).join("");
  const fondo = piel ? FONDOS[pielDe(piel).fondo]({ t: 0 }) : FONDOS.estudio({ t: 0, suelo: 2400 });
  const f = join(salida, `${piel ? piel + "-" : ""}piezas-${h + 1}.jpg`);
  await foto(fondo + celdas, f);
  console.log(f);
}
await cerrarNavegador();

// El relato: una hoja con los fondos y hojas de piezas, en 16:9 (1920 × 1080), con un ejemplo de cada una.
async function relato() {
  usarFormato("16:9");
  const nombres = Object.keys(FONDOS).filter((n) => n.startsWith("relato-")), cw = 1920 / 4, ch = 1080 / 3;
  const celdasF = nombres.map((n, i) => { const x = (i % 4) * cw, y = Math.floor(i / 4) * ch;
    return `<clipPath id="f${i}"><rect x="${x + 4}" y="${y + 4}" width="${cw - 8}" height="${ch - 8}"/></clipPath><g clip-path="url(#f${i})"><g transform="translate(${x} ${y}) scale(0.25 ${1 / 3})">${FONDOS[n]({ t: 1 })}</g></g>
      <text x="${x + cw / 2}" y="${y + ch - 22}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="30" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke">${n}</text>`; }).join("");
  await foto(`<rect width="1920" height="1080" fill="#111"/>${celdasF}`, join(salida, "relato-fondos.jpg"));
  console.log(join(salida, "relato-fondos.jpg"));
  // [parámetros, escala, desplazamiento y]
  const ej = {
    globo: [{ texto: "Sia lodato Gesù Cristo!" }, 0.55, 0], globos: [{ progreso: 1, ancho: 900, alto: 520 }, 0.5, 0],
    dato: [{ valor: 26, unidad: "idiomas" }, 0.6, 0], multitud: [{ ancho: 1000, alto: 420, luces: 0.08, brazos: 0.2 }, 0.45, -100],
    fachada: [{ ancho: 1500, alto: 620, figura: "papa", brazos: 1 }, 0.28, 120], balcon: [{ figura: "papa", brazos: 1 }, 0.3, 0],
    figura: [{ vestuario: "monje", pose: "carga" }, 0.65, 0], avion: [{ estela: true }, 0.5, 0], vela: [{}, 0.7, 40],
    resplandor: [{ radio: 400 }, 0.5, 0], documento: [{ titulo: "Mémoire", lineas: ["sur les instruments", "de la Passion — 1870"], trazo: "cruz", progreso: 1 }, 0.4, 0],
    mapa: [{ puntos: [[-0.6, 0.2], [-0.1, -0.3], [0.4, 0.1], [0.7, -0.4]], rutas: true, etiqueta: "siglo IV", progreso: 1 }, 0.32, 0],
    senalar: [{}, 0.35, 0], cruz: [{ material: "oro" }, 0.6, 0], aureola: [{}, 1, 0],
  };
  const lista = Object.keys(PIEZAS_RELATO), cols = 5, w = 1920 / cols, h = 1080 / 3;
  for (let hj = 0; hj * 15 < lista.length; hj++) {
    const celdas = lista.slice(hj * 15, hj * 15 + 15).map((n, i) => {
      const [o, e, dy] = ej[n] || [{}, 0.5, 0], x = (i % cols) * w + w / 2, y = Math.floor(i / cols) * h + h / 2;
      return `<clipPath id="c${i}"><rect x="${x - w / 2 + 4}" y="${y - h / 2 + 4}" width="${w - 8}" height="${h - 8}"/></clipPath><g clip-path="url(#c${i})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="#1c1a2e"/><g transform="translate(${x} ${y - 10 + dy * e}) scale(${e})">${PIEZAS_RELATO[n]({ t: 1, tl: 2, ...o })}</g></g>
        <text x="${x}" y="${y + h / 2 - 16}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="28" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke">${n}</text>`;
    }).join("");
    const f = join(salida, `relato-piezas-${hj + 1}.jpg`);
    await foto(`<rect width="1920" height="1080" fill="#111"/>${celdas}`, f);
    console.log(f);
  }
  await cerrarNavegador();
}
