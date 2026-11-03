// El muestrario: todas las piezas en hojas, con su nombre (para revisar el look y para la guía).
// node nucleo/2d/muestrario.mjs <carpeta de salida>
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { PIEZAS, LISTA } from "./piezas.mjs";
import { fondo } from "./fondos.mjs";
import { cerrarNavegador, foto } from "./dibujante.mjs";

const salida = process.argv[2] || "muestrario";
mkdirSync(salida, { recursive: true });
const porHoja = 12, cols = 3, celW = 360, celH = 480;
const ejemplos = { mazorca: { abre: 0.8 }, grano: { estado: 2.2 }, chocolate: { partida: 0.6 }, grafico: { tendencia: 1 }, celular: { pantalla: "+40%" }, laptop: { pantalla: "IA" }, numero: { texto: "70 %" }, texto: { texto: "¡HOLA!" }, persona: { pose: "saluda" }, signo: { tipo: "distinto" }, planeta: {}, reloj: { hora: 10.2 }, mano: { gesto: "senala" } };
for (let h = 0; h * porHoja < LISTA.length; h++) {
  const piezas = LISTA.slice(h * porHoja, (h + 1) * porHoja);
  const celdas = piezas.map((n, i) => {
    const x = (i % cols) * celW + celW / 2, y = Math.floor(i / cols) * celH + celH / 2 + 10;
    return `<g transform="translate(${x} ${y - 20}) scale(0.62)">${PIEZAS[n]({ t: 0.5, ...(ejemplos[n] || {}) })}</g>
      <text x="${x}" y="${y + 200}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="34" fill="#fff" stroke="#2b1a14" stroke-width="7" paint-order="stroke">${n}</text>`;
  }).join("");
  await foto(fondo("estudio", { suelo: 2400 }) + celdas, join(salida, `piezas-${h + 1}.jpg`));
  console.log(join(salida, `piezas-${h + 1}.jpg`));
}
await cerrarNavegador();
