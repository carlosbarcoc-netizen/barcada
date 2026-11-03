// Barcada 2D · la biblioteca de piezas. Cada pieza es una función (o) → SVG en coordenadas locales, centrada en
// (0, 0) y de unos 400 px de alto a escala 1. Parámetros comunes: o.color (una paleta de estilo.mjs) y o.t (el segundo,
// para lo que se mueve solo: vapor, llamas, brillo). Los parámetros propios de cada pieza están en PARAMETROS.
// Todas usan la misma luz (arriba a la izquierda), el mismo contorno y la misma sombra de dos tonos.
import { TINTA, brillo, caja, circulo, elipse, forma, paletaDe, sombraSuelo, trazo, uid } from "./estilo.mjs";

const lim = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u ?? 0));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ondas = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");

export const PIEZAS = {
  // ------------------------------------------------------------------ comida y agro
  taza(o) { // vapor (0-1)
    const v = lim(o.vapor ?? 1), t = o.t || 0;
    return `${sombraSuelo(0, 175, 230)}
    ${forma("M -170 -90 L 170 -90 L 150 140 Q 145 175 110 175 L -110 175 Q -145 175 -150 140 Z", o.color || "ceramica")}
    ${forma("M 165 -40 Q 265 -40 260 40 Q 255 115 150 105 L 155 70 Q 220 70 222 38 Q 222 0 162 4 Z", o.color || "ceramica", { sombra: 14, rim: 5 })}
    ${forma("M -158 -86 Q 0 -50 158 -86 Q 0 -122 -158 -86 Z", o.liquido || "cafe", { sombra: 10, rim: 4, borde: 5 })}
    ${brillo(-95, -10, 26, 70, 0.55, 0)}
    ${v > 0 ? ondas(3, (i) => { const x = -60 + i * 68, f = t * 2 + i; return `<path d="M ${x} -120 q ${-40 + 12 * Math.sin(f)} -60 0 -120 q ${40 + 12 * Math.cos(f)} -60 0 -130" fill="none" stroke="#fff" stroke-width="${16 - i * 2}" stroke-linecap="round" opacity="${0.55 * v}" style="filter:blur(3px)"/>`; }) : ""}`;
  },
  mazorca(o) { // abre (0-1): se parte y enseña los granos con su pulpa
    const a = lim(o.abre);
    const d = "M 0 -250 C 120 -230 150 -60 130 60 C 110 180 55 245 0 250 C -55 245 -110 180 -130 60 C -150 -60 -120 -230 0 -250 Z";
    const costillas = [-80, -40, 0, 40, 80].map((x) => `<path d="M 0 -250 Q ${x * 1.5} 0 0 250" fill="none" stroke="#a8401a" stroke-width="7" opacity="0.45"/>`).join("");
    if (a <= 0.001) return `${sombraSuelo(0, 250, 150)}${forma(d, o.color || "mazorca", { sombra: 34, rim: 9, extra: costillas })}${brillo(-55, -110, 22, 90, 0.5, 8)}
      ${forma("M -8 -250 Q -30 -300 -12 -330 L 12 -326 Q 0 -298 14 -248 Z", "hoja", { sombra: 6, rim: 3, borde: 5 })}`;
    const sep = 150 * a, ci = uid("mz"), cd = uid("mz"), granos = ondas(14, (i) => { const c = i % 2, f = Math.floor(i / 2); return PIEZAS.grano({ estado: 0, pulpa: 1, escala: 1 }).replace("<g>", `<g transform="translate(${(c ? 34 : -34)} ${-170 + f * 55}) scale(0.32) rotate(${c ? 80 : 100})">`); });
    return `${sombraSuelo(0, 250, 150 + sep * 0.6)}
      ${elipse(0, 0, 95, 225, "blanco", { sombra: 10, rim: 4 })}${granos}
      <g transform="translate(${-sep} 0) rotate(${-12 * a})"><clipPath id="${ci}"><rect x="-200" y="-300" width="200" height="600"/></clipPath><g clip-path="url(#${ci})">${forma(d, o.color || "mazorca", { sombra: 34, rim: 9, extra: costillas })}</g></g>
      <g transform="translate(${sep} 0) rotate(${12 * a})"><clipPath id="${cd}"><rect x="0" y="-300" width="200" height="600"/></clipPath><g clip-path="url(#${cd})">${forma(d, o.color || "mazorca", { sombra: 34, rim: 9, extra: costillas })}</g></g>`;
  },
  grano(o) { // estado 0 fresco · 1 fermentado · 2 seco · 3 tostado; pulpa (0-1); tipo "cacao" | "cafe"
    const e = lim(o.estado ?? 3, 0, 3), cols = [["#d9a7c0", "#a0607e", "#5c2a43"], ["#b4507a", "#7a2450", "#40102a"], ["#b58a62", "#7d5534", "#432914"], ["#8a4f2a", "#552a14", "#2a1208"]];
    const i = Math.min(2, Math.floor(e)), u = e - i, mx = (a, b) => { const h = (s) => [1, 3, 5].map((k) => parseInt(s.slice(k, k + 2), 16)); const A = h(a), B = h(b); return "#" + A.map((x, j) => Math.round(x + (B[j] - x) * u).toString(16).padStart(2, "0")).join(""); };
    const pal = [0, 1, 2].map((j) => mx(cols[i][j], cols[i + 1][j])).concat("#9fe2ff");
    const cafe = o.tipo === "cafe";
    return `<g>${elipse(0, 0, cafe ? 120 : 140, cafe ? 90 : 88, pal, { sombra: 22, rim: 7 })}
      ${trazo(cafe ? "M -95 -6 Q 0 26 95 -6" : "M -110 0 Q 0 16 110 0", TINTA, 6, 0.7)}
      ${brillo(-50, -40, 46, 14, 0.25 + 0.3 * (e / 3), -10)}
      ${o.pulpa ? elipse(0, 0, 160, 108, "blanco", { sombra: 14, rim: 4, contorno: true }).replace("<g>", `<g opacity="${0.92 * lim(o.pulpa)}">`) : ""}</g>`;
  },
  chocolate(o) { // partida (0-1); color: "cafe" (negro), "leche", "blanco"
    const p = lim(o.partida), pal = o.color === "blanco" ? "blanco" : o.color === "leche" ? ["#c98a5a", "#9a5c34", "#5c3018", "#ffd9a8"] : ["#7a4528", "#4a2412", "#24100a", "#ffb98a"];
    const tableta = (x0, cols) => ondas(cols * 4, (k) => { const c = k % cols, f = Math.floor(k / cols); return caja(x0 + c * 70 + 6, -150 + f * 75 + 6, 58, 63, 10, pal, { sombra: 12, rim: 4, borde: 4 }); });
    const fondo = (x0, w) => caja(x0, -150, w, 300, 16, pal, { sombra: 20, rim: 6 });
    if (p < 0.001) return `${sombraSuelo(0, 160, 160)}${fondo(-140, 280)}${tableta(-140, 4)}${brillo(-70, -110, 60, 10, 0.4, -5)}`;
    const s = 40 * p, r = 10 * p;
    return `${sombraSuelo(0, 160, 170)}<g transform="translate(${-s} ${6 * p}) rotate(${-r})">${fondo(-140, 140)}${tableta(-140, 2)}</g>
      <g transform="translate(${s} ${-6 * p}) rotate(${r})">${fondo(0, 140)}${tableta(0, 2)}</g>`;
  },
  hoja(o) {
    return forma("M 0 -200 C 150 -150 160 80 0 200 C -160 80 -150 -150 0 -200 Z", o.color || "hoja", { sombra: 30, rim: 8,
      extra: trazo("M 0 -190 L 0 190", "#22672b", 7, 0.6) + ondas(4, (i) => trazo(`M 0 ${-110 + i * 70} l ${70} ${-40}`, "#22672b", 5, 0.5) + trazo(`M 0 ${-90 + i * 70} l ${-70} ${-40}`, "#22672b", 5, 0.5)) });
  },
  planta(o) { // crece (0-1)
    const c = lim(o.crece ?? 1);
    return `${sombraSuelo(0, 200, 160)}${caja(-120, 60, 240, 150, 28, o.maceta || "naranja")}
      <g transform="translate(0 70) scale(${c}) translate(0 -70)">${trazo("M 0 70 C 0 0 -10 -80 0 -170", "#2d7a35", 14)}
      <g transform="translate(-60 -60) rotate(-50) scale(0.45)">${PIEZAS.hoja({})}</g><g transform="translate(60 -110) rotate(50) scale(0.45)">${PIEZAS.hoja({})}</g>
      <g transform="translate(0 -200) scale(0.4)">${PIEZAS.hoja({})}</g></g>`;
  },
  arbol(o) {
    return `${sombraSuelo(0, 260, 220)}${caja(-35, 40, 70, 220, 20, "madera")}
      ${circulo(-90, -60, 120, o.color || "verde")}${circulo(90, -50, 115, o.color || "verde")}${circulo(0, -150, 140, o.color || "verde")}${brillo(-40, -210, 60, 24, 0.4)}`;
  },
  gota(o) { // de agua (o color: "oro" para aceite/manteca)
    return `${forma("M 0 -200 C 60 -100 140 -20 140 60 C 140 150 75 200 0 200 C -75 200 -140 150 -140 60 C -140 -20 -60 -100 0 -200 Z", o.color || "agua", { sombra: 34, rim: 9 })}${brillo(-55, 30, 22, 55, 0.7, 20)}`;
  },
  frasco(o) { // lleno (0-1); contenido: una paleta
    const l = lim(o.lleno ?? 0.7), h = 300 * l;
    return `${sombraSuelo(0, 205, 150)}
      ${l > 0 ? caja(-118, 190 - h, 236, h, 20, o.contenido || "oro", { contorno: false, sombra: 20 }) : ""}
      <path d="M -130 -100 Q -130 -130 -100 -130 L 100 -130 Q 130 -130 130 -100 L 130 170 Q 130 200 100 200 L -100 200 Q -130 200 -130 170 Z" fill="#dff4ff" opacity="0.28" stroke="${TINTA}" stroke-width="6"/>
      ${caja(-100, -190, 200, 70, 14, "metal")}${brillo(-85, 20, 14, 110, 0.75, 0)}`;
  },
  // ------------------------------------------------------------------ cuerpo y salud
  cerebro(o) { // brilla (0-1)
    const d = "M -150 40 C -210 30 -215 -60 -160 -90 C -170 -160 -90 -200 -40 -170 C -10 -215 80 -210 100 -160 C 170 -175 220 -100 185 -50 C 230 0 200 80 140 85 C 130 140 50 150 20 115 C -20 150 -110 140 -110 90 C -140 90 -160 70 -150 40 Z";
    const surcos = ["M -150 -20 q 40 -40 90 -10 t 90 -20", "M -110 -130 q 30 40 -5 90", "M -10 -175 q -20 60 25 110", "M 100 -150 q -20 50 25 95", "M -130 60 q 60 -30 120 0 t 110 -15", "M 40 20 q 30 30 80 10"].map((p) => trazo(p, "#b4485e", 9, 0.75)).join("");
    return `${o.brilla ? `<circle r="260" fill="#ffd6e0" opacity="${0.5 * lim(o.brilla)}" style="filter:blur(40px)"/>` : ""}${forma(d, o.color || "rosa", { sombra: 30, rim: 9, extra: surcos })}${brillo(-70, -120, 60, 22, 0.5, -15)}`;
  },
  corazon(o) { // late (0-1): se hincha
    const s = 1 + 0.12 * lim(o.late);
    return `<g transform="scale(${s})">${forma("M 0 190 C -60 140 -220 40 -220 -60 C -220 -150 -150 -200 -90 -200 C -40 -200 -10 -170 0 -140 C 10 -170 40 -200 90 -200 C 150 -200 220 -150 220 -60 C 220 40 60 140 0 190 Z", o.color || "rojo", { sombra: 36, rim: 10 })}${brillo(-110, -120, 50, 26, 0.6, -30)}</g>`;
  },
  celula(o) {
    return `${forma("M -200 0 C -200 -130 -100 -200 10 -195 C 140 -190 210 -100 200 10 C 190 130 100 200 -10 195 C -140 190 -200 120 -200 0 Z", o.color || "morado", { sombra: 34, rim: 9 })}
      ${circulo(30, 10, 70, "rosa")}${circulo(-110, -60, 18, "verde")}${circulo(-80, 100, 14, "amarillo")}${circulo(120, -100, 16, "verde")}${brillo(-90, -120, 50, 20, 0.5)}`;
  },
  mano(o) { // gesto: "palma" | "senala" | "pulgar"
    const g = o.gesto || "palma";
    const palma = caja(-110, -40, 220, 230, 70, o.color || "piel");
    const dedo = (x, y, h, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})">${caja(-26, -h, 52, h + 30, 26, o.color || "piel", { sombra: 10, rim: 4 })}</g>`;
    const dedos = g === "senala" ? dedo(-45, -20, 200) + ondas(3, (i) => dedo(5 + i * 44, 10, 70)) : g === "pulgar" ? dedo(-120, 20, 150, -60) + ondas(4, (i) => dedo(-60 + i * 44, 20, 60)) : ondas(4, (i) => dedo(-78 + i * 52, -10, 150 - Math.abs(i - 1.5) * 25)) + dedo(-130, 70, 110, -50);
    return `${dedos}${palma}`;
  },
  persona(o) { // pose: "quieta" | "saluda" | "piensa" | "celebra"; color: la ropa
    const pose = o.pose || "quieta", ropa = o.color || "azul", t = o.t || 0;
    const brazo = (lado, ang) => `<g transform="translate(${lado * 95} -40) rotate(${ang})">${caja(-24, 0, 48, 170, 24, ropa, { sombra: 10, rim: 4 })}${circulo(0, 180, 30, "piel")}</g>`;
    const a = pose === "saluda" ? [20, -150 + 15 * Math.sin(t * 8)] : pose === "celebra" ? [-155, 155] : pose === "piensa" ? [20, -135] : [15, -15];
    return `${sombraSuelo(0, 300, 140)}
      ${caja(-70, 150, 60, 150, 26, "negro", { sombra: 10 })}${caja(10, 150, 60, 150, 26, "negro", { sombra: 10 })}
      ${brazo(-1, a[0])}${brazo(1, a[1])}
      ${caja(-110, -60, 220, 240, 70, ropa)}
      ${circulo(0, -160, 95, "piel")}
      ${forma("M -95 -175 C -100 -270 100 -280 95 -180 C 60 -215 -40 -230 -95 -175 Z", o.pelo || "cafe", { sombra: 10, rim: 4 })}
      ${circulo(-33, -160, 11, "negro", { sombra: 2, rim: 1, borde: 3 })}${circulo(33, -160, 11, "negro", { sombra: 2, rim: 1, borde: 3 })}
      ${trazo(pose === "piensa" ? "M -25 -110 L 25 -112" : "M -32 -118 Q 0 -90 32 -118", TINTA, 6)}`;
  },
  // ------------------------------------------------------------------ dinero y negocios
  moneda(o) { // gira (0-1): vuelta completa
    const g = Math.cos(lim(o.gira) * Math.PI * 2);
    return `${sombraSuelo(0, 150, 150 * Math.abs(g) + 20)}<g transform="scale(${Math.max(0.06, Math.abs(g))} 1)">
      ${circulo(0, 0, 150, "oro", { sombra: 30, rim: 9 })}${circulo(0, 0, 105, "oro", { sombra: -16, rim: -5, borde: 5 })}
      <text x="0" y="48" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="140" fill="#b07a12" stroke="${TINTA}" stroke-width="5">${o.signo || "$"}</text></g>${brillo(-60, -80, 40, 18, 0.7, -35)}`;
  },
  billete(o) {
    return `<g transform="rotate(${o.rot ?? -6})">${caja(-220, -110, 440, 220, 18, o.color || "verde")}${caja(-185, -78, 370, 156, 12, "verde", { sombra: -10, rim: -3, borde: 4 })}
      ${circulo(0, 0, 58, "verde", { borde: 4 })}<text x="0" y="22" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="64" fill="#1d6b3f">${o.signo || "$"}</text></g>`;
  },
  grafico(o) { // valores: [0-1, …] (alturas); crece (0-1): las barras suben; tendencia: dibuja la flecha
    const vs = o.valores || [0.3, 0.5, 0.45, 0.8], c = lim(o.crece ?? 1), n = vs.length, w = 360 / n;
    return `${sombraSuelo(0, 205, 220)}${caja(-230, -220, 460, 430, 30, "papel")}
      ${vs.map((v, i) => { const h = Math.max(4, 330 * v * Math.min(1, Math.max(0, c * n - i * 0.6))); return caja(-180 + i * w + 8, 170 - h, w - 22, h, 10, i === n - 1 ? "verde" : "azul", { sombra: 10, rim: 4, borde: 5 }); }).join("")}
      ${trazo("M -200 172 L 200 172", TINTA, 6)}
      ${o.tendencia ? trazo(`M -170 120 L -40 40 L 40 70 L ${-170 + 340 * lim(o.tendencia)} ${120 - 260 * lim(o.tendencia)}`, "#e5483a", 14) : ""}`;
  },
  alcancia(o) {
    return `${sombraSuelo(0, 180, 200)}${elipse(0, 20, 210, 150, o.color || "rosa")}${elipse(190, 10, 50, 60, "rosa", { sombra: 10 })}
      ${caja(-150, 120, 50, 70, 20, "rosa")}${caja(90, 120, 50, 70, 20, "rosa")}${forma("M -80 -120 L -40 -180 L -10 -120 Z", "rosa", { sombra: 6 })}
      ${caja(-50, -120, 100, 16, 8, "negro", { sombra: 2, rim: 1, borde: 3 })}${circulo(120, -30, 12, "negro", { borde: 3 })}${brillo(-80, -70, 60, 22, 0.5)}`;
  },
  // ------------------------------------------------------------------ tecnología
  celular(o) { // pantalla: texto corto; encendida (0-1)
    const e = lim(o.encendida ?? 1);
    return `${sombraSuelo(0, 250, 150)}${caja(-150, -280, 300, 560, 50, o.color || "negro")}
      <rect x="-128" y="-250" width="256" height="500" rx="32" fill="${e > 0 ? "#1d3d6b" : "#0b0d12"}" stroke="${TINTA}" stroke-width="5"/>
      ${e > 0 ? `<rect x="-128" y="-250" width="256" height="500" rx="32" fill="#7ad7ff" opacity="${0.35 * e}"/>` : ""}
      ${o.pantalla ? `<text x="0" y="10" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="${Math.min(90, 420 / Math.max(3, String(o.pantalla).length))}" fill="#fff" opacity="${e}">${o.pantalla}</text>` : ""}
      ${caja(-40, -238, 80, 22, 11, "negro", { sombra: 2, rim: 1, borde: 3 })}${brillo(-90, -180, 18, 120, 0.25, 0)}`;
  },
  laptop(o) {
    return `${sombraSuelo(0, 175, 300)}${caja(-250, -230, 500, 330, 24, o.color || "gris")}
      <rect x="-222" y="-205" width="444" height="280" rx="10" fill="#1d3d6b" stroke="${TINTA}" stroke-width="5"/>
      ${o.pantalla ? `<text x="0" y="-45" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="70" fill="#fff">${o.pantalla}</text>` : ""}
      ${forma("M -300 110 L 300 110 L 330 170 L -330 170 Z", "gris", { sombra: 10, rim: 4 })}`;
  },
  bombilla(o) { // encendida (0-1)
    const e = lim(o.encendida ?? 1);
    return `${e > 0 ? `<circle cy="-60" r="250" fill="#fff3a0" opacity="${0.6 * e}" style="filter:blur(45px)"/>` : ""}
      ${forma("M 0 -230 C 110 -230 170 -150 170 -70 C 170 0 110 40 85 90 L -85 90 C -110 40 -170 0 -170 -70 C -170 -150 -110 -230 0 -230 Z", e > 0.5 ? "amarillo" : "blanco", { sombra: 34, rim: 9 })}
      ${trazo("M -40 80 L -40 -30 Q 0 -70 40 -30 L 40 80", e > 0.5 ? "#c48a0c" : "#9aa3ae", 7)}
      ${caja(-90, 90, 180, 110, 18, "metal", { extra: ondas(3, (i) => trazo(`M -100 ${115 + i * 28} L 100 ${115 + i * 28}`, "#5b6470", 5, 0.6)) })}${brillo(-80, -140, 30, 60, 0.6, 20)}`;
  },
  engranaje(o) { // gira (vueltas)
    const n = 10, R = 200, r = 150, puntos = [];
    for (let i = 0; i < n * 4; i++) { const a = (i / (n * 4)) * Math.PI * 2, rr = i % 4 < 2 ? R : r; puntos.push(`${Math.cos(a) * rr} ${Math.sin(a) * rr}`); }
    return `<g transform="rotate(${(o.gira || 0) * 360})">${forma(`M ${puntos.join(" L ")} Z M 60 0 A 60 60 0 1 0 -60 0 A 60 60 0 1 0 60 0 Z`, o.color || "metal", { sombra: 26, rim: 8 })}</g>`;
  },
  robot(o) {
    return `${sombraSuelo(0, 260, 170)}${caja(-140, -40, 280, 260, 40, o.color || "metal")}${caja(-120, -260, 240, 190, 50, o.color || "metal")}
      ${caja(-90, -215, 180, 100, 30, "negro", { sombra: 6 })}${circulo(-40, -165, 20, "agua", { borde: 4 })}${circulo(40, -165, 20, "agua", { borde: 4 })}
      ${trazo("M 0 -260 L 0 -310", TINTA, 7)}${circulo(0, -320, 18, "rojo", { borde: 4 })}${caja(-60, 40, 120, 60, 14, "azul", { sombra: 6 })}`;
  },
  // ------------------------------------------------------------------ naturaleza, ciencia y espacio
  sol(o) {
    const g = (o.t || 0) * 12;
    return `<circle r="300" fill="#ffe28a" opacity="0.55" style="filter:blur(50px)"/>
      <g transform="rotate(${g})">${ondas(12, (i) => `<g transform="rotate(${i * 30})">${forma("M -24 -205 L 0 -265 L 24 -205 Z", "amarillo", { sombra: 4, rim: 2, borde: 5 })}</g>`)}</g>
      ${circulo(0, 0, 180, "amarillo", { sombra: 34, rim: 10 })}${brillo(-60, -70, 60, 26, 0.6)}`;
  },
  luna(o) {
    return `${forma("M 60 -190 C -80 -170 -150 -60 -140 40 C -125 160 -10 220 110 190 C -20 140 -60 20 -20 -80 C 0 -130 30 -170 60 -190 Z", o.color || "papel", { sombra: 26, rim: 8 })}`;
  },
  planeta(o) { // tierra (true) o con anillo (anillo: true)
    const tierra = o.tierra ?? !o.anillo;
    const cont = tierra ? ["M -120 -90 q 50 -40 90 0 t 40 70 q -60 30 -110 -10 z", "M 40 30 q 60 -20 110 30 q -10 70 -80 60 q -50 -20 -30 -90 z", "M -150 60 q 40 10 50 60 q -40 20 -60 -10 z"].map((p) => forma(p, "verde", { sombra: 8, rim: 3, borde: 4 })).join("") : "";
    const clip = uid("pl");
    return `<defs><clipPath id="${clip}"><circle r="200"/></clipPath></defs>
      ${o.anillo ? `<ellipse rx="330" ry="70" fill="none" stroke="#e8c98a" stroke-width="34" transform="rotate(-15)" opacity="0.9"/>` : ""}
      ${circulo(0, 0, 200, o.color || (tierra ? "agua" : "naranja"), { sombra: 40, rim: 10 })}
      <g clip-path="url(#${clip})">${cont}</g><circle r="200" fill="none" stroke="${TINTA}" stroke-width="6"/>
      ${o.anillo ? `<path d="M -318 85 A 330 70 -15 0 0 318 -85" fill="none" stroke="#e8c98a" stroke-width="34" transform="rotate(0)" opacity="0.95"/>` : ""}${brillo(-80, -90, 60, 30, 0.45)}`;
  },
  nube(o) {
    return `${forma("M -200 60 C -260 60 -260 -30 -190 -40 C -190 -120 -80 -140 -40 -80 C -10 -160 120 -150 130 -60 C 210 -80 250 20 190 60 Z", o.color || "blanco", { sombra: 20, rim: 7 })}`;
  },
  rayo(o) {
    return `<path d="M 30 -260 L -120 30 L 0 30 L -40 260 L 130 -40 L 10 -40 Z" fill="#fff3a0" opacity="0.6" style="filter:blur(20px)"/>${forma("M 30 -260 L -120 30 L 0 30 L -40 260 L 130 -40 L 10 -40 Z", "amarillo", { sombra: 18, rim: 6 })}`;
  },
  fuego(o) {
    const t = o.t || 0, w = (k) => 18 * Math.sin(t * 9 + k);
    return `<circle cy="40" r="210" fill="#ffb347" opacity="0.5" style="filter:blur(40px)"/>
      ${forma(`M 0 200 C -150 200 -180 60 -110 -30 C -90 40 -40 40 -40 0 C -60 -100 ${-10 + w(1)} -180 ${20 + w(2)} -250 C 40 -150 160 -110 150 40 C 145 150 90 200 0 200 Z`, "naranja", { sombra: 26, rim: 8 })}
      ${forma(`M 0 190 C -80 190 -95 110 -55 60 C -40 100 -10 90 -10 60 C -20 0 ${10 + w(3)} -60 ${25 + w(4)} -100 C 40 -40 95 0 90 90 C 85 150 50 190 0 190 Z`, "amarillo", { sombra: 14, rim: 5, borde: 5 })}`;
  },
  montana(o) {
    return `${forma("M -320 200 L -60 -220 L 60 -60 L 140 -160 L 340 200 Z", o.color || "gris", { sombra: 40, rim: 10 })}${forma("M -60 -220 L -120 -125 L -80 -140 L -50 -110 L -20 -150 L 10 -130 Z", "blanco", { sombra: 6, rim: 2, borde: 5 })}`;
  },
  molecula(o) {
    const at = [[0, 0, 90, "rojo"], [-170, -110, 60, "blanco"], [170, -110, 60, "blanco"], [0, 190, 60, "azul"]];
    return `${at.slice(1).map(([x, y]) => trazo(`M 0 0 L ${x} ${y}`, TINTA, 26) + trazo(`M 0 0 L ${x} ${y}`, "#d8d0c4", 14)).join("")}${at.map(([x, y, r, c]) => circulo(x, y, r, c)).join("")}`;
  },
  lupa(o) {
    return `<g transform="rotate(-35)">${caja(-28, 150, 56, 200, 24, "madera")}${circulo(0, 0, 170, "metal")}<circle r="128" fill="#dff4ff" opacity="0.5" stroke="${TINTA}" stroke-width="6"/>${brillo(-50, -50, 40, 18, 0.8)}</g>`;
  },
  reloj(o) { // hora (0-12)
    const h = o.hora ?? 3, am = (h % 12) * 30, mm = ((h * 60) % 60) * 6;
    return `${circulo(0, 0, 200, o.color || "rojo")}${circulo(0, 0, 160, "blanco", { sombra: -14, rim: -4 })}
      ${ondas(12, (i) => trazo(`M 0 -140 L 0 -120`, TINTA, 7).replace("<path", `<path transform="rotate(${i * 30})"`))}
      ${trazo("M 0 0 L 0 -80", TINTA, 12).replace("<path", `<path transform="rotate(${am})"`)}${trazo("M 0 0 L 0 -120", TINTA, 8).replace("<path", `<path transform="rotate(${mm})"`)}${circulo(0, 0, 14, "negro", { borde: 3 })}`;
  },
  // ------------------------------------------------------------------ lugares y cosas
  casa(o) {
    return `${sombraSuelo(0, 205, 260)}${caja(-200, -40, 400, 245, 12, o.color || "papel")}${forma("M -240 -20 L 0 -230 L 240 -20 Z", "rojo", { sombra: 20, rim: 7 })}
      ${caja(-45, 70, 90, 135, 10, "madera")}${caja(-165, 20, 80, 80, 8, "agua", { borde: 5 })}${caja(85, 20, 80, 80, 8, "agua", { borde: 5 })}`;
  },
  fabrica(o) {
    const t = o.t || 0;
    return `${sombraSuelo(0, 205, 300)}${caja(-280, -30, 560, 235, 12, o.color || "gris")}${forma("M -280 -30 L -280 -110 L -170 -30 L -170 -110 L -60 -30 L -60 -110 L 50 -30 Z", "gris", { sombra: 10 })}
      ${caja(120, -260, 80, 230, 10, "rojo")}${ondas(3, (i) => `<circle cx="${160 + i * 30 + 10 * Math.sin(t * 2 + i)}" cy="${-300 - i * 60 - ((t * 40) % 60)}" r="${40 + i * 14}" fill="#fff" opacity="${0.5 - i * 0.12}" style="filter:blur(4px)"/>`)}
      ${ondas(4, (i) => caja(-240 + i * 100, 40, 70, 70, 8, "amarillo", { borde: 5 }))}`;
  },
  caja(o) {
    return `${sombraSuelo(0, 180, 220)}${forma("M -200 -60 L 0 -140 L 200 -60 L 200 160 L 0 230 L -200 160 Z", o.color || "madera", { sombra: 30, rim: 8, extra: trazo("M 0 -60 L 0 230 M -200 -60 L 0 10 L 200 -60", TINTA, 5, 0.5) })}`;
  },
  // ------------------------------------------------------------------ signos y gráficos
  flecha(o) { // largo (px), color
    const L = o.largo || 380;
    return forma(`M ${-L / 2} -40 L ${L / 2 - 110} -40 L ${L / 2 - 110} -100 L ${L / 2} 0 L ${L / 2 - 110} 100 L ${L / 2 - 110} 40 L ${-L / 2} 40 Z`, o.color || "amarillo", { sombra: 16, rim: 6 });
  },
  signo(o) { // tipo: "check" | "x" | "distinto" | "mas" | "pregunta" | "exclama" | "igual"
    const tipo = o.tipo || "check", col = o.color || ({ check: "verde", x: "rojo", distinto: "amarillo", pregunta: "amarillo", exclama: "rojo" }[tipo] || "amarillo");
    const fondo = circulo(0, 0, 170, col, { sombra: 30, rim: 9 });
    const marcas = {
      check: trazo("M -80 0 L -20 65 L 90 -70", "#fff", 40),
      x: trazo("M -70 -70 L 70 70 M 70 -70 L -70 70", "#fff", 40),
      mas: trazo("M 0 -85 L 0 85 M -85 0 L 85 0", "#fff", 40),
      igual: trazo("M -80 -35 L 80 -35 M -80 35 L 80 35", "#fff", 36),
      distinto: trazo("M -80 -35 L 80 -35 M -80 35 L 80 35 M 45 -95 L -45 95", "#fff", 32),
      pregunta: `<text y="70" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="210" fill="#fff">?</text>`,
      exclama: `<text y="72" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="210" fill="#fff">!</text>`,
    };
    return `${fondo}${marcas[tipo] || marcas.check}${brillo(-60, -90, 50, 18, 0.5)}`;
  },
  numero(o) { // texto: "40 %", "1.500"... grande, en una pastilla
    const tx = String(o.texto ?? "0"), w = Math.max(220, tx.length * 70 + 80);
    return `${caja(-w / 2, -95, w, 190, 60, o.color || "negro")}<text y="45" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="130" fill="${o.tinta || "#FFD23F"}">${tx}</text>`;
  },
  texto(o) { // un letrero suelto: texto, tamano
    const tam = o.tamano || 110;
    return `<text y="${tam * 0.35}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="${tam}" fill="${o.tinta || "#fff"}" stroke="${TINTA}" stroke-width="${tam * 0.09}" paint-order="stroke" stroke-linejoin="round">${o.texto || ""}</text>`;
  },
  // ------------------------------------------------------------------ el estilo Barcada: marcadores, contadores y HUD
  // Lo que hace que un video se sienta como un juego: quién va ganando, cuánto falta, cuánto queda.
  titular(o) { // el titular enorme y condensado: texto (dorado) y debajo (blanco, más pequeño); tamano
    const tam = o.tamano || 170, sub = o.debajo || "", col = o.tinta || "#F7C65A";
    return `<text y="0" text-anchor="middle" font-family="Anton" font-size="${tam}" fill="${col}" stroke="${TINTA}" stroke-width="${tam * 0.07}" paint-order="stroke" stroke-linejoin="round" letter-spacing="1">${esc(o.texto || "")}</text>
      ${sub ? `<text y="${tam * 0.62}" text-anchor="middle" font-family="Anton" font-size="${tam * 0.42}" fill="#fff" stroke="${TINTA}" stroke-width="${tam * 0.035}" paint-order="stroke" letter-spacing="2">${esc(sub)}</text>` : ""}`;
  },
  pildora(o) { // una etiqueta en píldora de color: texto, color (dos tonos: naranja, azul, verde, morado, rojo)
    const tx = esc(o.texto || "SEMANA 1"), tam = o.tamano || 54, w = Math.max(160, tx.length * tam * 0.62 + 80), h = tam * 1.55;
    const tonos = { naranja: ["#ffb347", "#ff6a3d"], azul: ["#5cc2ff", "#3a6bff"], verde: ["#7be07b", "#1fae6b"], morado: ["#c08bff", "#7a3fe0"], rojo: ["#ff8a7a", "#e5323a"], amarillo: ["#ffe27a", "#ffb41f"], negro: ["#4a4f5c", "#1c1f26"] };
    const [a, b] = tonos[o.color] || tonos.naranja, id = uid("pd");
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#${id})" stroke="${TINTA}" stroke-width="6"/>
      <rect x="${-w / 2 + 10}" y="${-h / 2 + 7}" width="${w - 20}" height="${h * 0.32}" rx="${h * 0.16}" fill="#fff" opacity="0.25"/>
      <text y="${tam * 0.36}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="${tam}" fill="#fff" stroke="${TINTA}" stroke-width="${tam * 0.1}" paint-order="stroke">${tx}</text>`;
  },
  etiqueta(o) { // mayúsculas espaciadas, pequeñas y limpias (TÚ, MAMÁ, UN DÍA · DOS CAMINOS): texto, tinta
    const tam = o.tamano || 44;
    return `<text text-anchor="middle" font-family="Poppins" font-weight="800" font-size="${tam}" letter-spacing="${tam * 0.32}" fill="${o.tinta || "#fff"}" opacity="${o.tenue ? 0.75 : 1}" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.45))">${esc(o.texto || "")}</text>`;
  },
  marcador(o) { // el marcador de un duelo: a y b (números), colores colorA/colorB
    const A = o.a ?? 0, B = o.b ?? 0, cA = o.colorA || "#3a6bff", cB = o.colorB || "#1fae6b";
    const caja1 = (x, v, c) => `<rect x="${x}" y="-62" width="118" height="124" rx="26" fill="${c}" stroke="${TINTA}" stroke-width="6"/><rect x="${x + 10}" y="-52" width="98" height="34" rx="17" fill="#fff" opacity="0.22"/>
      <text x="${x + 59}" y="36" text-anchor="middle" font-family="Anton" font-size="100" fill="#fff" stroke="${TINTA}" stroke-width="7" paint-order="stroke">${Math.round(v)}</text>`;
    return `<rect x="-170" y="-80" width="340" height="160" rx="40" fill="#141821" stroke="${TINTA}" stroke-width="6"/>${caja1(-150, A, cA)}${caja1(32, B, cB)}
      <text y="22" text-anchor="middle" font-family="Anton" font-size="70" fill="#fff">-</text>`;
  },
  contador(o) { // un número grande que corre: valor (se anima con params), decimales, antes, despues ("%", " cm"), tinta
    const v = Number(o.valor ?? 0), d = o.decimales ?? 0, txt = `${o.antes || ""}${v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })}${o.despues || ""}`;
    const tam = o.tamano || 160;
    return `<text y="${tam * 0.35}" text-anchor="middle" font-family="Anton" font-size="${tam}" fill="${o.tinta || "#fff"}" stroke="${TINTA}" stroke-width="${tam * 0.08}" paint-order="stroke" stroke-linejoin="round">${esc(txt)}</text>`;
  },
  bateria(o) { // nivel 0-1 (cambia de verde a rojo), con el porcentaje
    const n = lim(o.nivel ?? 0.6), col = n > 0.5 ? "#3fd37a" : n > 0.2 ? "#ffc23f" : "#ff4d4d", w = 250;
    return `<rect x="-140" y="-62" width="${w + 30}" height="124" rx="26" fill="#141821" stroke="${TINTA}" stroke-width="6"/>
      <rect x="${w - 110 + 22}" y="-26" width="22" height="52" rx="8" fill="#141821" stroke="${TINTA}" stroke-width="5"/>
      <rect x="-122" y="-44" width="${Math.max(6, (w - 6) * n)}" height="88" rx="16" fill="${col}"/>
      <rect x="-114" y="-38" width="${Math.max(4, (w - 22) * n)}" height="22" rx="11" fill="#fff" opacity="0.3"/>
      <text x="${w / 2 - 123}" y="22" text-anchor="middle" font-family="Anton" font-size="66" fill="#fff" stroke="${TINTA}" stroke-width="6" paint-order="stroke">${Math.round(n * 100)}%</text>`;
  },
  lista(o) { // una lista de tareas: items [..], hechos (cuántos van marcados, se anima), titulo
    const items = o.items || ["Tarea 1", "Tarea 2", "Tarea 3"], h = Math.floor(o.hechos ?? 0), alto = 90 + items.length * 70;
    return `<rect x="-260" y="${-alto / 2}" width="520" height="${alto}" rx="30" fill="#141821" opacity="0.92" stroke="#7fb6ff" stroke-width="4"/>
      <text x="-220" y="${-alto / 2 + 62}" font-family="Poppins" font-weight="800" font-size="36" letter-spacing="6" fill="#7fb6ff">${esc(o.titulo || "HOY")}</text>
      <text x="220" y="${-alto / 2 + 62}" text-anchor="end" font-family="Anton" font-size="44" fill="#fff">${h}/${items.length}</text>
      ${items.map((it, i) => { const y = -alto / 2 + 120 + i * 70, ok = i < h; return `<rect x="-220" y="${y - 22}" width="44" height="44" rx="10" fill="${ok ? "#3fd37a" : "none"}" stroke="${ok ? "#3fd37a" : "#7f8aa3"}" stroke-width="4"/>
        ${ok ? trazo(`M ${-210} ${y} L ${-200} ${y + 10} L ${-184} ${y - 10}`, "#fff", 6) : ""}<text x="-150" y="${y + 14}" font-family="Nunito" font-weight="900" font-size="40" fill="${ok ? "#fff" : "#a9b3c7"}" ${ok ? 'text-decoration="line-through"' : ""}>${esc(it)}</text>`; }).join("")}`;
  },
  cronometro(o) { // segundos (se anima), limite (para el color), formato m:ss
    const s = Math.max(0, o.segundos ?? 0), txt = `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, mal = o.limite && s > o.limite;
    return `${caja(-26, -150, 52, 40, 10, "negro", { sombra: 6, rim: 2, borde: 5 })}${circulo(0, 0, 130, "blanco", { sombra: 18, rim: 6 })}
      <circle r="104" fill="none" stroke="${mal ? "#ff4d4d" : "#ffd23f"}" stroke-width="12" stroke-dasharray="${(653 * Math.min(1, (s % 60) / 60)).toFixed(1)} 700" transform="rotate(-90)"/>
      <text y="30" text-anchor="middle" font-family="Anton" font-size="84" fill="${mal ? "#e5323a" : "#c48a0c"}" stroke="${TINTA}" stroke-width="5" paint-order="stroke">${txt}</text>`;
  },
  encuesta(o) { // la pregunta al público: pregunta, a, b (las dos respuestas), colorA, colorB
    const boton = (x, tx, c) => `<rect x="${x - 150}" y="20" width="300" height="96" rx="48" fill="${c}" stroke="${TINTA}" stroke-width="5"/><text x="${x}" y="84" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="46" fill="#fff">${esc(tx)}</text>`;
    return `<rect x="-360" y="-120" width="720" height="270" rx="40" fill="#fff" stroke="${TINTA}" stroke-width="6" style="filter:drop-shadow(0 18px 24px rgba(0,0,0,.35))"/>
      <text y="-40" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="${Math.min(58, Math.round(1150 / Math.max(8, String(o.pregunta || "¿QUIÉN GANA?").length)))}" fill="#1c1f26">${esc(o.pregunta || "¿QUIÉN GANA?")}</text>
      ${boton(-170, o.a || "A", o.colorA || "#3a6bff")}${boton(170, o.b || "B", o.colorB || "#1fae6b")}`;
  },
  orbe(o) { // una luz que representa a alguien o algo (TÚ, MAMÁ): color, texto, brillo 0-1, hilo (línea hacia abajo)
    const c = o.tinta || "#ffcf7a", b = lim(o.brillo ?? 1), r = o.radio || 34;
    return `${o.hilo !== false ? `<path d="M 0 0 C 8 220 -10 420 4 ${o.largo || 700}" fill="none" stroke="${c}" stroke-width="5" opacity="${0.75 * b}" style="filter:drop-shadow(0 0 6px ${c})"/>` : ""}
      <circle r="${r * 4}" fill="${c}" opacity="${0.35 * b}" style="filter:blur(${r * 1.2}px)"/><circle r="${r}" fill="${c}" opacity="${0.9 * b}" style="filter:blur(4px)"/><circle r="${r * 0.4}" fill="#fff" opacity="${b}"/>
      ${o.texto ? `<text y="${-r - 30}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="38" letter-spacing="10" fill="#fff" opacity="${0.4 + 0.6 * b}">${esc(o.texto)}</text>` : ""}`;
  },
  panel(o) { // un marco de pantalla partida (UN DÍA · DOS CAMINOS): ancho, alto, titulo, sub, tinta
    const w = o.ancho || 960, h = o.alto || 760;
    return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="34" fill="#1a2236" opacity="0.55" stroke="#9fc4ff" stroke-width="4"/>
      ${o.titulo ? `<text y="${-h / 2 + 70}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="50" letter-spacing="14" fill="${o.tinta || "#fff"}">${esc(o.titulo)}</text>` : ""}
      ${o.sub ? `<rect x="-120" y="${-h / 2 + 92}" width="240" height="44" rx="22" fill="#2b3550"/><text y="${-h / 2 + 124}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#c9d8ff">${esc(o.sub)}</text>` : ""}`;
  },
  burbuja(o) { // un globo de diálogo: texto
    const tx = esc(o.texto || "¡VAMOS!"), w = Math.max(220, tx.length * 30 + 80);
    return `<path d="M ${-w / 2 + 30} -60 H ${w / 2 - 30} Q ${w / 2} -60 ${w / 2} -30 V 30 Q ${w / 2} 60 ${w / 2 - 30} 60 H -10 L -50 100 L -40 60 H ${-w / 2 + 30} Q ${-w / 2} 60 ${-w / 2} 30 V -30 Q ${-w / 2} -60 ${-w / 2 + 30} -60 Z" fill="#fff" stroke="${TINTA}" stroke-width="6"/>
      <text y="18" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="52" fill="#1c1f26">${tx}</text>`;
  },
  aro(o) { // un aro que resalta algo (se dibuja con «dibuja» 0-1): radio, tinta
    const r = o.radio || 120, u = lim(o.dibuja ?? 1), L = 2 * Math.PI * r;
    return `<circle r="${r}" fill="none" stroke="${o.tinta || "#FFD23F"}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(L * u).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90)" style="filter:drop-shadow(0 0 10px ${o.tinta || "#FFD23F"})"/>`;
  },
  diana(o) { // una mira que apunta: radio, tinta
    const r = o.radio || 140, c = o.tinta || "#ff4d4d";
    return `<circle r="${r}" fill="none" stroke="${c}" stroke-width="10"/><circle r="${r * 0.55}" fill="none" stroke="${c}" stroke-width="8"/>${trazo(`M 0 ${-r - 40} V ${-r * 0.35} M 0 ${r * 0.35} V ${r + 40} M ${-r - 40} 0 H ${-r * 0.35} M ${r * 0.35} 0 H ${r + 40}`, c, 10)}`;
  },
  cinta(o) { // una cinta métrica que rodea algo: largo, medida (texto, p. ej. "92 cm")
    const L = o.largo || 700;
    return `${caja(-L / 2, -28, L, 56, 12, "amarillo", { sombra: 8, rim: 3 })}${Array.from({ length: Math.floor(L / 20) }, (_, i) => trazo(`M ${-L / 2 + 10 + i * 20} -26 v ${i % 5 ? 16 : 28}`, "#7a5a0c", 3)).join("")}
      ${o.medida ? `<g transform="translate(0 100)">${PIEZAS.numero({ texto: o.medida, color: "negro", tinta: o.tinta || "#ff4d4d" })}</g>` : ""}`;
  },
};

// Los parámetros propios de cada pieza (para la guía y para la IA).
export const PARAMETROS = {
  taza: "vapor 0-1, liquido (paleta)", mazorca: "abre 0-1", grano: "estado 0-3 (fresco→tostado), pulpa 0-1, tipo cacao|cafe",
  chocolate: "partida 0-1, color cafe|leche|blanco", planta: "crece 0-1, maceta", frasco: "lleno 0-1, contenido (paleta)",
  cerebro: "brilla 0-1", corazon: "late 0-1", mano: "gesto palma|senala|pulgar", persona: "pose quieta|saluda|piensa|celebra, color (ropa), pelo",
  moneda: "gira 0-1, signo", billete: "signo, rot", grafico: "valores [..], crece 0-1, tendencia 0-1", celular: "pantalla (texto), encendida 0-1",
  laptop: "pantalla (texto)", bombilla: "encendida 0-1", engranaje: "gira (vueltas)", planeta: "tierra, anillo", reloj: "hora 0-12",
  titular: "texto, debajo, tamano, tinta", pildora: "texto, color (naranja|azul|verde|morado|rojo|amarillo|negro)", etiqueta: "texto, tamano, tinta",
  marcador: "a, b (se animan), colorA, colorB", contador: "valor (se anima), decimales, antes, despues, tamano, tinta", bateria: "nivel 0-1",
  lista: "items [..], hechos (se anima), titulo", cronometro: "segundos (se anima), limite", encuesta: "pregunta, a, b, colorA, colorB",
  orbe: "texto, tinta, brillo 0-1, radio, hilo, largo", panel: "ancho, alto, titulo, sub", burbuja: "texto", aro: "radio, dibuja 0-1, tinta",
  diana: "radio, tinta", cinta: "largo, medida",
  flecha: "largo, color", signo: "tipo check|x|distinto|mas|igual|pregunta|exclama", numero: "texto, color, tinta", texto: "texto, tamano, tinta",
};
export const LISTA = Object.keys(PIEZAS);
