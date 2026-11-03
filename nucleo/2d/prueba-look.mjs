// Prueba del look 2D: un cuadro fijo con cuatro piezas, para aprobar el estilo antes de construir la biblioteca.
// node nucleo/2d/prueba-look.mjs <salida.png>
import { chromium as cargar } from "./navegador.mjs";
const chromium = await cargar();
import { DEFS_COMUNES, TINTA, brillo, forma, sombraSuelo } from "./estilo.mjs";

// --- las piezas de prueba (en coordenadas locales, centradas en 0,0)
const taza = () => `
  ${sombraSuelo(0, 175, 230)}
  ${forma("M -170 -90 L 170 -90 L 150 140 Q 145 175 110 175 L -110 175 Q -145 175 -150 140 Z", "ceramica")}
  ${forma("M 165 -40 Q 265 -40 260 40 Q 255 115 150 105 L 155 70 Q 220 70 222 38 Q 222 0 162 4 Z", "ceramica", { sombra: 14, rim: 5 })}
  ${forma("M -158 -86 Q 0 -50 158 -86 Q 0 -122 -158 -86 Z", "cafe", { sombra: 10, rim: 4, borde: 5 })}
  ${brillo(-95, -10, 26, 70, 0.55, 0)}
  ${[-60, 10, 75].map((x, i) => `<path d="M ${x} -120 q -40 -60 0 -120 q 40 -60 0 -130" fill="none" stroke="#fff" stroke-width="${16 - i * 2}" stroke-linecap="round" opacity="0.55" style="filter:blur(3px)"/>`).join("")}`;

const mazorca = () => `
  ${sombraSuelo(0, 250, 150)}
  ${forma("M 0 -250 C 120 -230 150 -60 130 60 C 110 180 55 245 0 250 C -55 245 -110 180 -130 60 C -150 -60 -120 -230 0 -250 Z", "mazorca", { sombra: 34, rim: 9,
    extra: [-80, -40, 0, 40, 80].map((x) => `<path d="M 0 -250 Q ${x * 1.5} 0 0 250" fill="none" stroke="#a8401a" stroke-width="7" opacity="0.45"/>`).join("") })}
  ${brillo(-55, -110, 22, 90, 0.5, 8)}
  ${forma("M -8 -250 Q -30 -300 -12 -330 L 12 -326 Q 0 -298 14 -248 Z", "hoja", { sombra: 6, rim: 3, borde: 5 })}`;

const cerebro = () => {
  const d = "M -150 40 C -210 30 -215 -60 -160 -90 C -170 -160 -90 -200 -40 -170 C -10 -215 80 -210 100 -160 C 170 -175 220 -100 185 -50 C 230 0 200 80 140 85 C 130 140 50 150 20 115 C -20 150 -110 140 -110 90 C -140 90 -160 70 -150 40 Z";
  return `${forma(d, "rosa", { sombra: 30, rim: 9, extra: ["M -120 -40 q 40 -30 80 0 t 80 0", "M -60 -120 q 20 40 0 80", "M 60 -140 q -10 50 20 90", "M -100 50 q 50 -20 100 10 t 90 -10"].map((p) => `<path d="${p}" fill="none" stroke="#b4485e" stroke-width="9" stroke-linecap="round" opacity="0.7"/>`).join("") })}
  ${brillo(-70, -110, 60, 26, 0.55, -15)}`;
};

const moneda = () => `
  ${sombraSuelo(0, 150, 150)}
  ${forma("M 0 -150 A 150 150 0 1 1 -0.1 -150 Z", "oro", { sombra: 30, rim: 9 })}
  ${forma("M 0 -105 A 105 105 0 1 1 -0.1 -105 Z", "oro", { sombra: -16, rim: -5, borde: 5 })}
  <text x="0" y="45" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="140" fill="#b07a12" stroke="${TINTA}" stroke-width="5">$</text>
  ${brillo(-60, -80, 40, 18, 0.7, -35)}`;

const fondo = () => `
  <defs><radialGradient id="cielo" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#ffe3b3"/><stop offset="0.5" stop-color="#f6a96b"/><stop offset="1" stop-color="#5a2e45"/></radialGradient>
  <linearGradient id="mesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4632"/><stop offset="1" stop-color="#3a1c22"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#cielo)"/>
  ${[[180, 400, 160, "#ffd59a"], [880, 600, 220, "#ffc38a"], [760, 260, 120, "#fff0cf"], [120, 900, 200, "#f59c72"]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="0.55" filter="url(#muyBlando)"/>`).join("")}
  <path d="M -20 1380 Q 540 1300 1100 1380 L 1100 1940 L -20 1940 Z" fill="url(#mesa)"/>
  <path d="M -20 1380 Q 540 1300 1100 1380" fill="none" stroke="${TINTA}" stroke-width="6"/>
  <path d="M -20 1392 Q 540 1314 1100 1392" fill="none" stroke="#ffc9a0" stroke-width="5" opacity="0.6"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>${DEFS_COMUNES}</defs>
  ${fondo()}
  <g transform="translate(290 640) rotate(-8) scale(0.92)">${mazorca()}</g>
  <g transform="translate(790 660) scale(0.95)">${cerebro()}</g>
  <g transform="translate(320 1210) scale(0.95)">${taza()}</g>
  <g transform="translate(790 1220) scale(0.9)">${moneda()}</g>
  <rect width="1080" height="1920" filter="url(#grano)" style="mix-blend-mode:multiply"/>
</svg>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 } });
const fuente = new URL("../../fuentes/Poppins-ExtraBold.ttf", import.meta.url).href;
await pagina.setContent(`<html><head><style>@font-face{font-family:Poppins;font-weight:800;src:url(${fuente})}body{margin:0}</style></head><body>${svg}</body></html>`);
await pagina.screenshot({ path: process.argv[2] || "look.png" });
await navegador.close();
console.log("ok");
