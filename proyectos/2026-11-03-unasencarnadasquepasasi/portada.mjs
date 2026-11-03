// Portada a medida: titular centrado, dedo infectado grande, sello de marca.
import { readFileSync } from "node:fs";
const R = "/home/user/barcoviral/nucleo/2d/";
const { foto, cerrarNavegador } = await import(R + "dibujante.mjs"), { PIEZAS } = await import(R + "piezas.mjs");
const dir = "/home/user/barcoviral/proyectos/2026-11-03-unasencarnadasquepasasi/";
const p = JSON.parse(readFileSync(dir + "proyecto.json"));
const el = p.escenas[0].tomas[5].dibujo.elementos; // toma 6: dedo, uña, espina, bulto, pus
const svgDe = (e) => "<text>" + e.texto + "</text>";
const [rojo, dedo, una, espina, bulto] = el.slice(0, 5).map(svgDe), pus = svgDe(el.at(-1));
const g = (x, y, s, c, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${c}</g>`;
const T = "#2b1a14", X = 600, Y = 1450, K = 1.75, k = K / 1.2;
const interior = `
<defs>
  <radialGradient id="pfondo" cx="0.5" cy="0.62" r="0.75"><stop offset="0" stop-color="#5a2a3a"/><stop offset="0.55" stop-color="#2a1424"/><stop offset="1" stop-color="#0e0810"/></radialGradient>
  <radialGradient id="pfoco" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff3b3b" stop-opacity="0.55"/><stop offset="1" stop-color="#ff3b3b" stop-opacity="0"/></radialGradient>
  <linearGradient id="poro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a6"/><stop offset="0.5" stop-color="#FFD23F"/><stop offset="1" stop-color="#f5a623"/></linearGradient>
  <linearGradient id="pbaja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0810" stop-opacity="0"/><stop offset="1" stop-color="#0e0810" stop-opacity="0.95"/></linearGradient>
</defs>
<rect width="1080" height="1920" fill="url(#pfondo)"/>
${Array.from({ length: 14 }, (_, i) => `<line x1="540" y1="1250" x2="${540 + 1400 * Math.cos(i * Math.PI / 7)}" y2="${1250 + 1400 * Math.sin(i * Math.PI / 7)}" stroke="#ffffff" stroke-opacity="0.035" stroke-width="90"/>`).join("")}
<circle cx="470" cy="1130" r="520" fill="url(#pfoco)"/>
${g(380, 1380, 2.4, rojo)}
${g(X, Y, K, dedo)}${g(X, Y, K, una)}${g(X, Y, K, espina)}
${g(X - 185 * k, Y - 40 * k, 1.4 * k, bulto)}
${g(X - 195 * k, Y - 60 * k, 1.2 * k, pus)}
${g(150, 1060, 0.34, PIEZAS.celula({ color: "verde" }), -15)}${g(110, 1560, 0.26, PIEZAS.celula({ color: "verde" }), 20)}${g(340, 930, 0.22, PIEZAS.celula({ color: "verde" }))}
${g(900, 1000, 0.55, PIEZAS.signo({ tipo: "exclama" }), 10)}
<rect y="1500" width="1080" height="420" fill="url(#pbaja)"/>
<rect y="0" width="1080" height="760" fill="#0e0810" opacity="0.35"/>
<text x="540" y="130" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="40" letter-spacing="14" fill="#ffffff" opacity="0.85">LO QUE NADIE TE DICE</text>
<text x="540" y="420" text-anchor="middle" font-family="Anton" font-size="200" fill="#ffffff" stroke="${T}" stroke-width="16" paint-order="stroke" letter-spacing="2">UÑA</text>
<text x="540" y="620" text-anchor="middle" font-family="Anton" font-size="205" fill="url(#poro)" stroke="${T}" stroke-width="16" paint-order="stroke" letter-spacing="2" style="filter:drop-shadow(0 0 30px rgba(255,180,40,0.45))">ENCARNADA</text>
<rect x="150" y="668" width="780" height="96" rx="48" fill="#e5483a" stroke="${T}" stroke-width="6"/>
<text x="540" y="733" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="50" fill="#ffffff">¿Qué pasa si no haces nada?</text>
<text x="540" y="1800" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="40" letter-spacing="4" fill="#ffffff" opacity="0.9">@azzure_estudiodebelleza</text>
<line x1="390" y1="1740" x2="690" y2="1740" stroke="#FFD23F" stroke-width="5" stroke-linecap="round"/>`;
await foto(interior, process.argv[2]);
await cerrarNavegador();
