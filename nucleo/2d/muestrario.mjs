// El muestrario: todas las piezas en hojas, con su nombre (para revisar el look y para la guía).
// node nucleo/2d/muestrario.mjs <carpeta de salida>            → las piezas 2D con volumen
// node nucleo/2d/muestrario.mjs <carpeta de salida> neon       → las piezas del modo juego en esa piel (neon, voxel, arcade)
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { PIEZAS as PIEZAS_2D, LISTA } from "./piezas.mjs";
import { FONDOS } from "./escena.mjs";
import { PIEZAS_JUEGO } from "./piezas-juego.mjs";
import { piel as pielDe } from "./juego.mjs";
import { cerrarNavegador, foto } from "./dibujante.mjs";

const salida = process.argv[2] || "muestrario", piel = process.argv[3] || null;
mkdirSync(salida, { recursive: true });
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
    return `${clip}<g clip-path="url(#cel${i})"><g transform="translate(${x} ${y - 20}) scale(${esc})">${PZ[n]({ t: 0.5, tl: 2, piel: piel ? pielDe(piel).piezas || piel : piel, pielReal: piel, ...ej })}</g></g>
      <text x="${x}" y="${y + 200}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="34" fill="#fff" stroke="#2b1a14" stroke-width="7" paint-order="stroke">${n}</text>`;
  }).join("");
  const fondo = piel ? FONDOS[pielDe(piel).fondo]({ t: 0 }) : FONDOS.estudio({ t: 0, suelo: 2400 });
  const f = join(salida, `${piel ? piel + "-" : ""}piezas-${h + 1}.jpg`);
  await foto(fondo + celdas, f);
  console.log(f);
}
await cerrarNavegador();
