// Barcada · el estilo «relato» (guias/relato.md): ilustración vectorial limpia, SIN contornos, con volumen de degradados
// suaves e iluminada como una película (una luz cálida con brillo difuso sobre un ambiente más oscuro, desenfoque de
// profundidad). Aquí están sus fondos, sus piezas, su acabado y sus subtítulos dibujados dentro del cuadro.
//
// En proyecto.json: "estilo": "2d", "look": "relato" (y casi siempre "formato": "16:9").
// Las piezas se usan como cualquier pieza 2D (guias/2d.md); sus parámetros están en PARAMETROS_RELATO.
import { ALTO, ANCHO, horizontal, sinTildes } from "../comun.mjs";
import { uid } from "./estilo.mjs";
import { esc, html } from "./juego.mjs";

const lim = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u ?? 0));
const suave = (u) => { u = lim(u); return u * u * (3 - 2 * u); };
const rebote = (u) => { u = lim(u); const c = 1.70158 * 1.3, c3 = c + 1; return 1 + c3 * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
// azar con semilla (siempre el mismo dibujo para la misma semilla)
const azar = (semilla = 1) => { let x = (semilla * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
const n1 = (v) => Number(v).toFixed(1);
// degradados
const lin = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</linearGradient>`;
const rad = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</radialGradient>`;
// una luz: un círculo difuminado (el «bloom» del estilo)
const luz = (x, y, r, color, op = 0.6) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${color}" opacity="${op}" style="filter:blur(${Math.round(r * 0.55)}px)"/>`;
const alfa = (hex, a) => { const h = hex.replace("#", ""); const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return `rgba(${n.join(",")},${a})`; };

// ================================================================== FONDOS
// Todos a la medida del cuadro (9:16 o 16:9). suelo: la altura del suelo (por defecto, la de cada fondo).
const cielo = (id, stops) => `<defs>${lin(id, stops)}</defs><rect width="${ANCHO}" height="${ALTO}" fill="url(#${id})"/>`;
const estrellas = (n, alto, semilla = 3, t = 0, vivas = false) => {
  const r = azar(semilla);
  return Array.from({ length: n }, (_, i) => { const x = r() * ANCHO, y = r() * alto, s = 0.8 + r() * 1.8, f = r() * 6;
    const op = (0.25 + r() * 0.6) * (vivas ? 0.6 + 0.4 * Math.sin(t * 1.7 + f) : 1);
    return `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(s)}" fill="#fff" opacity="${op.toFixed(2)}"/>`; }).join("");
};
const vetas = (x, y, w, h, n, color, semilla = 5, op = 0.18) => {
  const r = azar(semilla);
  return Array.from({ length: n }, () => { const x0 = x + r() * w, y0 = y + r() * h, l = 60 + r() * 220;
    return `<path d="M ${n1(x0)} ${n1(y0)} q ${n1(l * 0.3)} ${n1(-20 + r() * 40)} ${n1(l * 0.5)} ${n1(-10 + r() * 30)} t ${n1(l * 0.5)} ${n1(-15 + r() * 30)}" fill="none" stroke="${color}" stroke-width="${n1(1 + r() * 2.2)}" opacity="${op}"/>`; }).join("");
};
const area = () => (ANCHO * ALTO) / (1080 * 1920);

export const FONDOS_RELATO = {
  // la noche: cielo azul marino con estrellas y una plaza oscura (para fachadas, balcones, multitudes)
  "relato-noche": ({ t = 0, suelo = ALTO * 0.68 }) => cielo("rN", [[0, "#080b22"], [0.45, "#141a3e"], [1, "#2b2b52"]])
    + estrellas(Math.round(160 * area()), suelo * 0.85, 7, t)
    + luz(ANCHO / 2, suelo, ANCHO * 0.45, "#6a5a8a", 0.35)
    + `<defs>${lin("rNs", [[0, "#3a2c22"], [0.35, "#22180f"], [1, "#0e0906"]])}</defs><rect y="${n1(suelo)}" width="${ANCHO}" height="${n1(ALTO - suelo)}" fill="url(#rNs)"/>`
    + luz(ANCHO / 2, suelo + 60, ANCHO * 0.3, "#c98a4a", 0.25),
  // el atardecer sobre las nubes: azul marino → morado → naranja → melocotón, con nubes rosadas desenfocadas abajo
  "relato-atardecer": ({ t = 0, nubes = true }) => cielo("rA", [[0, "#141a3d"], [0.28, "#3d2a63"], [0.5, "#7d3f6e"], [0.68, "#e0795a"], [0.82, "#f5b088"], [1, "#f6d3bb"]])
    + luz(ANCHO * 0.5, ALTO * 0.72, ANCHO * 0.35, "#ffd9a0", 0.55)
    + (nubes ? (() => { const r = azar(11); return Array.from({ length: 14 }, (_, i) => { const x = (i / 13) * ANCHO * 1.2 - ANCHO * 0.1 + Math.sin(t * 0.2 + i) * 20, y = ALTO * (0.78 + r() * 0.2), rx = ANCHO * (0.12 + r() * 0.12), ry = rx * 0.45;
      return `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${["#f3c3b4", "#eab0a6", "#f8d6c6", "#e6a39c"][i % 4]}" style="filter:blur(${Math.round(ry * 0.35)}px)"/>`
        + `<ellipse cx="${n1(x - rx * 0.2)}" cy="${n1(y - ry * 0.35)}" rx="${n1(rx * 0.5)}" ry="${n1(ry * 0.4)}" fill="#fff3e8" opacity="0.5" style="filter:blur(${Math.round(ry * 0.3)}px)"/>`; }).join(""); })() : ""),
  // la piedra cálida: un muro de mármol beige con pilastras y cornisa (para primeros planos de balcones y palacios)
  "relato-piedra": ({ suelo = ALTO }) => {
    const W = ANCHO, H = ALTO, pw = Math.min(W, H) * 0.12;
    const pil = (x) => `<rect x="${n1(x)}" y="${n1(H * 0.12)}" width="${n1(pw)}" height="${n1(H)}" fill="url(#rPp)"/>`
      + Array.from({ length: 4 }, (_, i) => `<rect x="${n1(x + pw * (0.15 + i * 0.2))}" y="${n1(H * 0.15)}" width="${n1(pw * 0.06)}" height="${n1(H)}" fill="#a88f6a" opacity="0.35"/>`).join("");
    return cielo("rP", [[0, "#d9c6a4"], [1, "#b09474"]])
      + `<defs>${lin("rPp", [[0, "#ecdcbc"], [0.5, "#d8c29c"], [1, "#b49a74"]], 0, 0, 1, 0)}</defs>`
      + vetas(0, 0, W, H, 40, "#8c7458", 5, 0.22)
      + `<rect width="${W}" height="${n1(H * 0.06)}" fill="#c8b18c"/><rect y="${n1(H * 0.06)}" width="${W}" height="${n1(H * 0.025)}" fill="#a48b68"/><rect y="${n1(H * 0.1)}" width="${W}" height="${n1(H * 0.015)}" fill="#e8d8b8"/>`
      + pil(W * 0.04) + pil(W - W * 0.04 - pw)
      + luz(W / 2, H * 0.45, Math.min(W, H) * 0.45, "#ffcf8a", 0.35)
      + (suelo < H ? `<rect y="${n1(suelo)}" width="${W}" height="${n1(H - suelo)}" fill="#8a7256"/>` : "");
  },
  // el monasterio: muro de piedra fría de noche, arcos al fondo y antorchas que calientan el muro
  "relato-monasterio": ({ suelo = ALTO * 0.8 }) => {
    const W = ANCHO, H = ALTO, r = azar(21), bw = 120, bh = 56;
    let ladrillos = "";
    for (let y = 0, f = 0; y < suelo; y += bh, f++) for (let x = (f % 2) * -bw / 2; x < W; x += bw) {
      const c = ["#2d2a44", "#332f4c", "#29263f", "#383352"][Math.floor(r() * 4)];
      ladrillos += `<rect x="${n1(x + 2)}" y="${n1(y + 2)}" width="${bw - 4}" height="${bh - 4}" rx="6" fill="${c}"/>`;
    }
    const arco = (cx, w, h) => `<path d="M ${n1(cx - w / 2)} ${n1(suelo)} V ${n1(suelo - h + w / 2)} A ${n1(w / 2)} ${n1(w / 2)} 0 0 1 ${n1(cx + w / 2)} ${n1(suelo - h + w / 2)} V ${n1(suelo)} Z" fill="#141226"/>`;
    const n = horizontal() ? 3 : 2;
    return `<rect width="${W}" height="${H}" fill="#1f1c33"/>${ladrillos}`
      + Array.from({ length: n }, (_, i) => arco((W * (i + 0.5)) / n, Math.min(W / n * 0.55, 420), Math.min(H * 0.55, 720))).join("")
      + [0.18, 0.82].map((fx) => luz(W * fx, suelo - H * 0.42, Math.min(W, H) * 0.22, "#ff9a3c", 0.45) + `<rect x="${n1(W * fx - 8)}" y="${n1(suelo - H * 0.4)}" width="16" height="70" rx="4" fill="#3b2a1c"/>` + `<ellipse cx="${n1(W * fx)}" cy="${n1(suelo - H * 0.42)}" rx="14" ry="26" fill="#ffd27a"/>`).join("")
      + `<defs>${lin("rMs", [[0, "#2a2238"], [1, "#100d18"]])}</defs><rect y="${n1(suelo)}" width="${W}" height="${n1(H - suelo)}" fill="url(#rMs)"/>`;
  },
  // la mesa de madera: tablones cálidos vistos desde arriba (para documentos, cartas, objetos)
  "relato-madera": () => {
    const W = ANCHO, H = ALTO, r = azar(31), tw = horizontal() ? H / 5 : W / 4;
    let tablas = "";
    if (horizontal()) for (let y = 0, i = 0; y < H; y += tw, i++) tablas += `<rect y="${n1(y)}" width="${W}" height="${n1(tw - 4)}" fill="${["#6b3d21", "#74431f", "#633820"][i % 3]}"/>`;
    else for (let x = 0, i = 0; x < W; x += tw, i++) tablas += `<rect x="${n1(x)}" width="${n1(tw - 4)}" height="${H}" fill="${["#6b3d21", "#74431f", "#633820"][i % 3]}"/>`;
    const vetasM = Array.from({ length: 70 }, () => { const x = r() * W, y = r() * H, l = 120 + r() * 380;
      return horizontal() ? `<path d="M ${n1(x)} ${n1(y)} q ${n1(l / 2)} ${n1(r() * 10 - 5)} ${n1(l)} 0" stroke="#3b1f0e" stroke-width="2" fill="none" opacity="0.3"/>` : `<path d="M ${n1(x)} ${n1(y)} q ${n1(r() * 10 - 5)} ${n1(l / 2)} 0 ${n1(l)}" stroke="#3b1f0e" stroke-width="2" fill="none" opacity="0.3"/>`; }).join("");
    return `<rect width="${W}" height="${H}" fill="#2c170b"/>${tablas}${vetasM}` + luz(W / 2, H * 0.4, Math.min(W, H) * 0.5, "#ffc27a", 0.35);
  },
  // lo sagrado: casi negro, con una gran luz dorada en el centro y rayos suaves
  "relato-sagrado": ({ t = 0, cx = 0.5, cy = 0.45 }) => {
    const W = ANCHO, H = ALTO, X = W * cx, Y = H * cy, R = Math.hypot(W, H);
    const rayos = Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI * 2 + t * 0.03, b = a + 0.07;
      return `<path d="M ${n1(X)} ${n1(Y)} L ${n1(X + Math.cos(a) * R)} ${n1(Y + Math.sin(a) * R)} L ${n1(X + Math.cos(b) * R)} ${n1(Y + Math.sin(b) * R)} Z" fill="#ffd27a" opacity="${i % 2 ? 0.05 : 0.09}"/>`; }).join("");
    return cielo("rS", [[0, "#1c120a"], [1, "#0c0704"]]) + rayos + luz(X, Y, Math.min(W, H) * 0.42, "#ffb64a", 0.55) + luz(X, Y, Math.min(W, H) * 0.16, "#fff1c4", 0.6);
  },
  // el conflicto: rojo oscuro, con una luz roja dura y sombras
  "relato-rojo": () => {
    const W = ANCHO, H = ALTO;
    return cielo("rR", [[0, "#3c0b12"], [0.6, "#220509"], [1, "#0f0204"]]) + luz(W / 2, H * 0.45, Math.min(W, H) * 0.5, "#c3202e", 0.4)
      + `<path d="M ${n1(W * 0.1)} 0 L ${n1(W * 0.35)} 0 L ${n1(W * 0.6)} ${H} L ${n1(W * 0.2)} ${H} Z" fill="#ff6a5a" opacity="0.06"/>`;
  },
  // el pergamino: una hoja antigua que llena el cuadro (para mapas y documentos a pantalla completa)
  "relato-pergamino": () => {
    const W = ANCHO, H = ALTO, r = azar(41);
    return cielo("rG", [[0, "#efdcb2"], [1, "#dcc092"]])
      + Array.from({ length: 16 }, () => luz(r() * W, r() * H, 60 + r() * 160, "#b8925a", 0.18)).join("")
      + `<defs>${rad("rGb", [[0.6, "#5a3a18", 0], [1, "#3a220c", 0.75]], 0.5, 0.5, 0.75)}</defs><rect width="${W}" height="${H}" fill="url(#rGb)"/>`;
  },
  // el campo: cielo claro, montañas azuladas y colinas verdes (para monasterios, pueblos, caminos)
  "relato-campo": ({ suelo = ALTO * 0.72 }) => {
    const W = ANCHO, H = ALTO, m = (y, c, amp, sem) => { const r = azar(sem); let d = `M -20 ${n1(y)}`; for (let x = 0; x <= W + 40; x += W / 6) d += ` L ${n1(x)} ${n1(y - r() * amp)}`; return `<path d="${d} L ${W + 20} ${H} L -20 ${H} Z" fill="${c}"/>`; };
    return cielo("rC", [[0, "#9fc4e8"], [0.6, "#d8e6ee"], [1, "#f4ead2"]])
      + m(suelo - H * 0.12, "#8a9bb4", H * 0.18, 3) + m(suelo - H * 0.05, "#7690a8", H * 0.1, 8)
      + `<path d="M -20 ${n1(suelo)} Q ${n1(W * 0.3)} ${n1(suelo - H * 0.06)} ${n1(W * 0.6)} ${n1(suelo)} T ${W + 20} ${n1(suelo - H * 0.02)} L ${W + 20} ${H} L -20 ${H} Z" fill="#6aa04a"/>`
      + `<defs>${lin("rCs", [[0, "#5d9440"], [1, "#3c6b2c"]])}</defs><rect y="${n1(suelo + H * 0.04)}" width="${W}" height="${H}" fill="url(#rCs)"/>`;
  },
  // el mar al atardecer: horizonte, sol bajo y su reflejo (para barcos y viajes)
  "relato-mar": ({ t = 0, suelo = ALTO * 0.62 }) => {
    const W = ANCHO, H = ALTO;
    const olas = Array.from({ length: 18 }, (_, i) => { const y = suelo + ((i + 1) / 19) * (H - suelo), w = 40 + i * 10;
      return Array.from({ length: 6 }, (_, k) => `<rect x="${n1(((k * 337 + i * 151 + t * 20) % (W + 200)) - 100)}" y="${n1(y)}" width="${w}" height="3" rx="1.5" fill="#ffd2a0" opacity="${0.15 + 0.15 * (i / 18)}"/>`).join(""); }).join("");
    return cielo("rMr", [[0, "#1a1d44"], [0.35, "#563a73"], [0.55, "#d4705c"], [0.62, "#f6b07a"]])
      + luz(W / 2, suelo, Math.min(W, H) * 0.2, "#ffe0a0", 0.75)
      + `<defs>${lin("rMa", [[0, "#2a3a6a"], [1, "#0e1530"]])}</defs><rect y="${n1(suelo)}" width="${W}" height="${n1(H - suelo)}" fill="url(#rMa)"/>`
      + `<rect x="${n1(W / 2 - 60)}" y="${n1(suelo)}" width="120" height="${n1(H - suelo)}" fill="#ffd9a0" opacity="0.2" style="filter:blur(18px)"/>` + olas;
  },
};
export const VIVOS_RELATO = new Set(["relato-sagrado", "relato-mar"]);

// ================================================================== PIEZAS
// Cada una en coordenadas locales, centrada en (0, 0), unos 400 px de alto a escala 1 (salvo las grandes, que lo
// dicen). Sin contornos: el volumen sale de degradados y de luces.

// la burbuja de pergamino (una sola): HTML, para que el texto se mida solo
function burbuja(texto, { tam = 46, halo = "#ffc76a", cola = "izq", fuerza = 1 } = {}) {
  const colaHTML = cola === "ninguna" ? "" : `<div style="position:absolute;${cola === "der" ? "right" : "left"}:${tam * 0.8}px;bottom:${-tam * 0.32}px;width:0;height:0;border-left:${tam * 0.2}px solid transparent;border-right:${tam * 0.2}px solid transparent;border-top:${tam * 0.36}px solid #e3cfa6"></div>`;
  return `<div style="position:relative;display:inline-block;padding:${tam * 0.3}px ${tam * 0.55}px;border-radius:${tam * 0.42}px;white-space:nowrap;
    background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.55),transparent 55%),radial-gradient(circle at 80% 70%,rgba(160,110,60,.18),transparent 40%),linear-gradient(180deg,#f8eed8,#e3cfa6);
    color:#3a2414;font:700 ${tam}px/1.15 Poppins;box-shadow:0 0 ${tam * 0.7 * fuerza}px ${tam * 0.12 * fuerza}px ${alfa(halo, 0.65)},0 0 ${tam * 0.18}px ${alfa(halo, 0.9)},inset 0 ${-tam * 0.08}px 0 rgba(120,80,40,.22),0 ${tam * 0.15}px ${tam * 0.3}px rgba(0,0,0,.35)">${esc(texto)}${colaHTML}</div>`;
}
const centrado = (w, h, interior) => html(-w / 2, -h / 2, w, h, `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${interior}</div>`);

const VOCES = ["¡Hola!", "Hello", "Bonjour", "Ciao", "Olá", "Hallo", "Привет", "こんにちは", "你好", "Merhaba", "Γειά σου", "Shalom", "Salve", "Hej", "Dzień dobry", "Namaste", "Jambo", "Kia ora", "Saluton", "Ahoj"];

// la figura: un personaje simple (cuerpo de una forma, cara mínima) con su vestuario
const VESTUARIOS = {
  monje: { tunica: ["#9a673c", "#5e3a1e"], manga: "#7d5230", capucha: "#8a5a32", cinto: "#efe2c4" },
  papa: { tunica: ["#fbf8f1", "#cfc7b8"], manga: "#efeae0", capa: "#c42a2a", gorro: "#ffffff", cruz: true },
  reina: { tunica: ["#7b4bb3", "#43226e"], manga: "#6a3d9e", pelo: "#5a3420", corona: true },
  rey: { tunica: ["#b3262e", "#6a1016"], manga: "#9c1f27", armino: true, corona: true, barba: "castaña" },
  campesino: { tunica: ["#6f93c2", "#3e5d8a"], manga: "#5f82b0", cinto: "#4a3020", pelo: "#3a2616", barba: "oscura" },
  mujer: { tunica: ["#e48aa6", "#a84d6c"], manga: "#d77898", pelo: "#4a2a18" },
  soldado: { tunica: ["#b8322c", "#6e1a16"], manga: "#a32a25", casco: true },
  nino: { tunica: ["#a77c52", "#6b4a2c"], manga: "#946b44", pelo: "#4a2c16", nino: true },
  silueta: { silueta: true },
};
const PIEL = ["#f6cfa8", "#d99a70"];

export const PIEZAS_RELATO = {
  globo(o) { // texto, tamano (px de la letra), halo (color), cola izq|der|ninguna, fuerza (del halo)
    const tam = o.tamano ?? 46, w = Math.max(400, String(o.texto ?? "").length * tam * 0.7 + tam * 3);
    return centrado(w, tam * 3.2, burbuja(o.texto ?? "¡Hola!", { tam, halo: o.halo, cola: o.cola, fuerza: o.fuerza ?? 1 }));
  },
  globos(o) { // muchas voces: textos [..], progreso 0-1 (cuántas han salido), ancho, alto, tamano, desde [x, y], semilla
    const textos = o.textos || VOCES, n = textos.length, p = lim(o.progreso ?? 1) * n, w = o.ancho ?? 1400, h = o.alto ?? 700;
    const r = azar(o.semilla ?? 9), t = o.t || 0, [ox, oy] = o.desde || [0, h * 0.4];
    const items = textos.map((tx, i) => ({ tx, i, x: (r() - 0.5) * w, y: (r() - 0.5) * h, d: r(), rot: (r() - 0.5) * 16 }));
    items.sort((a, b) => a.d - b.d);   // los lejanos (pequeños) primero
    return items.map(({ tx, i, x, y, d, rot }) => {
      const u = lim(p - i); if (u <= 0) return "";
      const e = rebote(u), sx = ox + (x - ox) * suave(u), sy = oy + (y - oy) * suave(u) + 10 * Math.sin(t * 1.2 + i * 1.7);
      const s = (0.45 + 0.75 * d) * e, tam = o.tamano ?? 44, bw = Math.max(300, tx.length * tam * 0.7 + tam * 3);
      return `<g transform="translate(${n1(sx)} ${n1(sy)}) rotate(${n1(rot)}) scale(${s.toFixed(3)})" opacity="${(0.55 + 0.45 * d).toFixed(2)}" ${d < 0.22 ? `style="filter:blur(${n1((0.22 - d) * 14)}px)"` : ""}>${centrado(bw, tam * 3.2, burbuja(tx, { tam, halo: o.halo, cola: i % 2 ? "der" : "izq", fuerza: 0.6 }))}</g>`;
    }).join("");
  },
  dato(o) { // la cifra en vidrio oscuro: valor (se anima), unidad, decimales, texto (en vez del número), tamano
    const tam = o.tamano ?? 120, dec = o.decimales ?? 0;
    const num = o.texto ?? Number(o.valor ?? 0).toLocaleString("es", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const uni = o.unidad ? `<span style="font:700 ${tam * 0.42}px Poppins;margin-left:${tam * 0.14}px;opacity:.95">${esc(o.unidad)}</span>` : "";
    return centrado(tam * 9, tam * 2.2, `<div style="display:inline-flex;align-items:baseline;padding:${tam * 0.1}px ${tam * 0.32}px;border-radius:${tam * 0.26}px;background:rgba(22,20,26,.62);border:2px solid rgba(255,255,255,.12);box-shadow:0 ${tam * 0.1}px ${tam * 0.4}px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08);color:#fff;white-space:nowrap">
      <span style="font:800 ${tam}px/1.1 Poppins;letter-spacing:-1px">${esc(num)}</span>${uni}</div>`);
  },
  multitud(o) { // GRANDE: desde la fila del fondo (y 0) hasta la de delante (y = alto). ancho, alto, densidad, luces 0-1, brazos 0-1, banderas (n), semilla
    const W = o.ancho ?? ANCHO * 1.2, H = o.alto ?? ALTO * 0.4, filas = o.filas ?? 16, dens = o.densidad ?? 1, t = o.t || 0;
    const r = azar(o.semilla ?? 4), partes = [];
    partes.push(`<defs>${lin(`mh${o.semilla ?? 4}`, [[0, "#c9a070", 0.35], [0.4, "#3a2a1e", 0]])}</defs><rect x="${-W / 2}" y="-20" width="${W}" height="${n1(H * 0.5)}" fill="url(#mh${o.semilla ?? 4})"/>`);
    let banderas = o.banderas ?? 14, nLuces = 0;
    for (let f = 0; f < filas; f++) {
      const u = f / (filas - 1), y = H * Math.pow(u, 1.25), s = 7 + 34 * Math.pow(u, 1.5), dx = s * 1.55 / dens;
      const tono = 22 + Math.round(u * 6);
      for (let x = -W / 2 + r() * dx; x < W / 2; x += dx * (0.7 + r() * 0.6)) {
        const yy = y + (r() - 0.5) * s * 0.6, c = `hsl(${20 + r() * 15},${15 + r() * 10}%,${tono * 0.45 + r() * 6}%)`;
        partes.push(`<path d="M ${n1(x - s * 0.55)} ${n1(yy + s * 2.2)} Q ${n1(x - s * 0.6)} ${n1(yy + s * 0.5)} ${n1(x)} ${n1(yy + s * 0.45)} Q ${n1(x + s * 0.6)} ${n1(yy + s * 0.5)} ${n1(x + s * 0.55)} ${n1(yy + s * 2.2)} Z" fill="${c}"/><circle cx="${n1(x)}" cy="${n1(yy)}" r="${n1(s * 0.38)}" fill="${c}"/>`);
        const q = r();
        if (u > 0.35 && q < (o.brazos ?? 0.06) * (0.6 + 0.4 * Math.sin(t * 2 + x))) partes.push(`<path d="M ${n1(x - s * 0.35)} ${n1(yy + s * 0.6)} L ${n1(x - s * 0.75)} ${n1(yy - s * 0.7)} M ${n1(x + s * 0.35)} ${n1(yy + s * 0.6)} L ${n1(x + s * 0.75)} ${n1(yy - s * 0.7)}" stroke="#d9c7ad" stroke-width="${n1(Math.max(1.2, s * 0.16))}" stroke-linecap="round" opacity="0.75"/>`);
        else if (q < (o.brazos ?? 0.06) + (o.luces ?? 0.06)) {
          const op = (0.55 + 0.45 * Math.sin(t * 3 + x * 0.1)).toFixed(2), lx = x + s * 0.4, ly = yy - s * 0.3;
          partes.push(`<rect x="${n1(lx - s * 0.12)}" y="${n1(ly - s * 0.2)}" width="${n1(s * 0.24)}" height="${n1(s * 0.4)}" rx="2" fill="#fffbea" opacity="${op}"/>`);
          if (nLuces++ < 70) partes.push(`<circle cx="${n1(lx)}" cy="${n1(ly)}" r="${n1(s * 1.6)}" fill="#fff6dc" opacity="${(op * 0.35).toFixed(2)}" style="filter:blur(${n1(s * 0.8)}px)"/>`);
        } else if (banderas > 0 && r() < 0.012 && u > 0.2) {
          banderas--;
          const cols = [["#d22", "#fff", "#1f8a4c"], ["#000", "#d00", "#fc0"], ["#fff", "#d11"], ["#fd0", "#fff"], ["#0055a4", "#fff", "#ef4135"], ["#c60b1e", "#ffc400", "#c60b1e"]][Math.floor(r() * 6)];
          const fx = x + s * 0.3, fy = yy - s * 1.6, fw = s * 1.3, fh = s * 0.85, ond = Math.sin(t * 4 + x) * s * 0.08;
          partes.push(`<line x1="${n1(fx)}" y1="${n1(yy + s)}" x2="${n1(fx)}" y2="${n1(fy)}" stroke="#ddd" stroke-width="${n1(Math.max(1, s * 0.08))}"/>`
            + cols.map((c, k) => `<rect x="${n1(fx)}" y="${n1(fy + (k * fh) / cols.length + ond)}" width="${n1(fw)}" height="${n1(fh / cols.length + 0.5)}" fill="${c}"/>`).join(""));
        }
      }
    }
    return partes.join("");
  },
  fachada(o) { // GRANDE, apoyada en el suelo (y 0 = la base). ancho, alto, cupula (true), columnas, luz 0-1 (el balcón), emblema llaves|cruz|ninguno, figura (vestuario o null), brazos 0-1
    const W = o.ancho ?? 1500, H = o.alto ?? 520, nc = o.columnas ?? 10, L = lim(o.luz ?? 1), id = uid("fa");
    const cw = W * 0.024, colX = (i) => -W / 2 + W * 0.06 + (i * (W * 0.88)) / (nc - 1);
    const partes = [`<defs>${lin(id + "m", [[0, "#bba783"], [0.6, "#d6c39c"], [1, "#e6d3ae"]])}${lin(id + "c", [[0, "#f6e8c8"], [0.5, "#ddc8a2"], [1, "#a8916c"]], 0, 0, 1, 0)}${lin(id + "d", [[0, "#dfe6ee"], [0.6, "#9aa6b6"], [1, "#6b7688"]], 0, 0, 1, 0.3)}${rad(id + "b", [[0, "#ffe6a8"], [0.5, "#ffb24a"], [1, "#d06a1c"]], 0.5, 0.7, 0.75)}</defs>`];
    if (o.cupula !== false) {
      const R = W * 0.13, cy = -H - R * 0.25;
      partes.push(luz(0, cy - R * 0.3, R * 1.4, "#9fb0d8", 0.25),
        `<rect x="${n1(-R * 0.95)}" y="${n1(cy)}" width="${n1(R * 1.9)}" height="${n1(R * 0.45)}" fill="#cfc3a8"/>`,
        `<path d="M ${n1(-R)} ${n1(cy)} A ${n1(R)} ${n1(R * 1.05)} 0 0 1 ${n1(R)} ${n1(cy)} Z" fill="url(#${id}d)" opacity="0.95"/>`,
        Array.from({ length: 9 }, (_, i) => { const a = -R + (i + 1) * (R * 2) / 10; return `<path d="M ${n1(a)} ${n1(cy)} Q ${n1(a * 0.55)} ${n1(cy - R * 0.85)} 0 ${n1(cy - R * 1.02)}" fill="none" stroke="#5f6a7c" stroke-width="2" opacity="0.5"/>`; }).join(""),
        `<rect x="${n1(-R * 0.12)}" y="${n1(cy - R * 1.28)}" width="${n1(R * 0.24)}" height="${n1(R * 0.28)}" fill="#e6d6b4"/><path d="M ${n1(-R * 0.15)} ${n1(cy - R * 1.28)} Q 0 ${n1(cy - R * 1.45)} ${n1(R * 0.15)} ${n1(cy - R * 1.28)} Z" fill="#c9ccd4"/>`,
        `<path d="M 0 ${n1(cy - R * 1.42)} v ${n1(-R * 0.22)} M ${n1(-R * 0.06)} ${n1(cy - R * 1.56)} h ${n1(R * 0.12)}" stroke="#f2c14e" stroke-width="5"/>`, luz(0, cy - R * 1.2, R * 0.25, "#ffe7a6", 0.5));
    }
    partes.push(`<rect x="${-W / 2}" y="${-H}" width="${W}" height="${H}" fill="url(#${id}m)"/>`, vetas(-W / 2, -H, W, H, 26, "#9c8462", 13, 0.2),
      `<rect x="${-W / 2 - 10}" y="${-H}" width="${W + 20}" height="${H * 0.08}" fill="#bba680"/><rect x="${-W / 2 - 14}" y="${n1(-H * 0.92)}" width="${W + 28}" height="${n1(H * 0.025)}" fill="#f2e2c0"/>`,
      Array.from({ length: Math.floor(W / 44) }, (_, i) => `<rect x="${n1(-W / 2 + 10 + i * 44)}" y="${n1(-H - 18)}" width="24" height="20" fill="#c4ae88"/>`).join(""));
    // ventanas y puertas entre columnas
    for (let i = 0; i < nc - 1; i++) {
      const x0 = colX(i) + cw, x1 = colX(i + 1) - cw, m = (x0 + x1) / 2, ww = (x1 - x0) * 0.55, centro = i === Math.floor((nc - 1) / 2);
      if (centro) continue;
      partes.push(`<rect x="${n1(m - ww / 2 - 5)}" y="${n1(-H * 0.8 - 5)}" width="${n1(ww + 10)}" height="${n1(H * 0.13 + 10)}" fill="#c2ab84"/><rect x="${n1(m - ww / 2)}" y="${n1(-H * 0.8)}" width="${n1(ww)}" height="${n1(H * 0.13)}" fill="#4a3324"/>`,
        `<rect x="${n1(m - ww / 2 - 5)}" y="${n1(-H * 0.55 - 5)}" width="${n1(ww + 10)}" height="${n1(H * 0.14 + 10)}" fill="#c2ab84"/><rect x="${n1(m - ww / 2)}" y="${n1(-H * 0.55)}" width="${n1(ww)}" height="${n1(H * 0.14)}" fill="#4a3324"/>`);
      if (i % 2 === 0) { const dw = (x1 - x0) * 0.62, dh = H * 0.28; partes.push(`<path d="M ${n1(m - dw / 2)} 0 V ${n1(-dh + dw / 2)} A ${n1(dw / 2)} ${n1(dw / 2)} 0 0 1 ${n1(m + dw / 2)} ${n1(-dh + dw / 2)} V 0 Z" fill="#2a1c14"/>`); }
    }
    for (let i = 0; i < nc; i++) partes.push(`<rect x="${n1(colX(i) - cw)}" y="${n1(-H * 0.89)}" width="${n1(cw * 2)}" height="${n1(H * 0.89 - 14)}" fill="url(#${id}c)"/><rect x="${n1(colX(i) - cw * 1.3)}" y="${n1(-H * 0.9)}" width="${n1(cw * 2.6)}" height="${n1(H * 0.03)}" fill="#ead9b6"/><rect x="${n1(colX(i) - cw * 1.3)}" y="-16" width="${n1(cw * 2.6)}" height="16" fill="#cdb894"/>`);
    // el centro: frontón, balcón encendido con su tapiz y la puerta
    const bx = W * 0.055, by = -H * 0.42;
    partes.push(`<path d="M ${n1(-W * 0.13)} ${n1(-H * 0.6)} L 0 ${n1(-H * 0.72)} L ${n1(W * 0.13)} ${n1(-H * 0.6)} Z" fill="#e8d7b4" stroke="#bfa880" stroke-width="5"/>`,
      `<path d="M ${n1(-bx)} ${n1(by)} V ${n1(by - H * 0.1)} A ${n1(bx)} ${n1(bx)} 0 0 1 ${n1(bx)} ${n1(by - H * 0.1)} V ${n1(by)} Z" fill="url(#${id}b)" opacity="${0.35 + 0.65 * L}"/>`, luz(0, by - H * 0.08, bx * 2.2, "#ffbe5c", 0.55 * L));
    if (o.figura) partes.push(`<g transform="translate(0 ${n1(by + 4)}) scale(${n1(bx / 260)})">${PIEZAS_RELATO.figura({ vestuario: o.figura, brazos: o.brazos ?? 1, t: o.t, corte: true })}</g>`);
    partes.push(`<rect x="${n1(-bx * 1.25)}" y="${n1(by)}" width="${n1(bx * 2.5)}" height="${n1(H * 0.02)}" fill="#efe0c0"/>`, tapiz(0, by + H * 0.02, bx * 2.1, H * 0.12, o.emblema),
      `<path d="M ${n1(-bx * 0.8)} 0 V ${n1(-H * 0.2)} A ${n1(bx * 0.8)} ${n1(bx * 0.8)} 0 0 1 ${n1(bx * 0.8)} ${n1(-H * 0.2)} V 0 Z" fill="#2a1c14"/>`,
      // luces cálidas al pie de la fachada
      Array.from({ length: 8 }, (_, i) => luz(-W / 2 + (i + 0.5) * (W / 8), -10, W * 0.05, "#ffd08a", 0.45)).join(""));
    return partes.join("");
  },
  balcon(o) { // primer plano del balcón: ~900 × 1100 a escala 1. luz 0-1, emblema llaves|cruz|ninguno, figura (vestuario), brazos 0-1
    const L = lim(o.luz ?? 1), id = uid("bc"), w = 640, aH = 760;
    return `<defs>${rad(id, [[0, "#ffe9b0"], [0.45, "#ffb44e"], [1, "#c4621c"]], 0.5, 0.75, 0.8)}${lin(id + "p", [[0, "#f0e0bf"], [0.5, "#dcc59e"], [1, "#b39a74"]], 0, 0, 1, 0)}</defs>
      <rect x="-520" y="-640" width="1040" height="1200" fill="#d6c19c"/>${vetas(-520, -640, 1040, 1200, 18, "#9c8462", 17, 0.2)}
      <rect x="-500" y="-640" width="150" height="1200" fill="url(#${id}p)"/><rect x="350" y="-640" width="150" height="1200" fill="url(#${id}p)"/>
      <path d="M ${-w / 2 - 30} 160 V ${-aH / 2 + w / 2 - 30} A ${w / 2 + 30} ${w / 2 + 30} 0 0 1 ${w / 2 + 30} ${-aH / 2 + w / 2 - 30} V 160 Z" fill="#c7b089"/>
      <path d="M ${-w / 2} 160 V ${-aH / 2 + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${w / 2} ${-aH / 2 + w / 2} V 160 Z" fill="url(#${id})" opacity="${0.4 + 0.6 * L}"/>
      ${luz(0, -40, 360, "#ffc260", 0.5 * L)}
      ${o.figura ? `<g transform="translate(0 165) scale(0.8)">${PIEZAS_RELATO.figura({ vestuario: o.figura, brazos: o.brazos ?? 1, t: o.t, corte: true })}</g>` : ""}
      <rect x="-420" y="150" width="840" height="34" rx="6" fill="#f3e6c8"/><rect x="-420" y="178" width="840" height="10" fill="#bda57e"/>
      ${tapiz(0, 188, 620, 470, o.emblema)}`;
  },
  figura(o) { // vestuario monje|papa|reina|rey|campesino|mujer|soldado|nino|silueta; brazos 0-1 (en alto), pose quieta|senala|reza|carga; barba no|oscura|blanca|castaña; ojos cerrados|abiertos; aureola; corte (solo de cintura arriba)
    const v = VESTUARIOS[o.vestuario] || VESTUARIOS.monje, id = uid("fg"), sil = v.silueta, b = lim(o.brazos ?? 0), t = o.t || 0;
    const tun = sil ? ["#4a2a5e", "#24122e"] : v.tunica, manga = sil ? "#3a1f4a" : v.manga, k = v.nino ? 0.75 : 1;
    const piel = sil ? ["#3a1f4a", "#24122e"] : PIEL, pose = o.pose || "quieta", barba = o.barba ?? v.barba ?? "no";
    const brazo = (lado) => { // de hombro a mano; ángulo según brazos y pose
      const sx = lado * 58, sy = -78; let ang;
      if (pose === "senala" && lado === 1) ang = -8; else if (pose === "reza" || pose === "carga") ang = null; else ang = 100 - b * 150 + Math.sin(t * 2 + lado) * 3 * b;
      if (ang === null) return `<path d="M ${sx} ${sy} Q ${lado * 70} -20 ${lado * 18} -10" stroke="${manga}" stroke-width="34" fill="none" stroke-linecap="round"/>`;
      const a = (ang * Math.PI) / 180, l = 120, hx = sx + lado * Math.cos(a) * l, hy = sy + Math.sin(a) * l;
      return `<path d="M ${sx} ${sy} L ${n1(hx)} ${n1(hy)}" stroke="${manga}" stroke-width="34" stroke-linecap="round"/><circle cx="${n1(hx + lado * Math.cos(a) * 14)}" cy="${n1(hy + Math.sin(a) * 14)}" r="17" fill="${piel[0]}"/>`;
    };
    const cuerpo = `<path d="M -62 -92 Q 0 -110 62 -92 L 92 200 Q 0 214 -92 200 Z" fill="url(#${id}t)"/>`;
    const cara = `<circle cx="0" cy="-138" r="48" fill="url(#${id}p)"/>`
      + (sil ? "" : (o.ojos === "abiertos" ? `<circle cx="-16" cy="-140" r="5" fill="#2b1a14"/><circle cx="16" cy="-140" r="5" fill="#2b1a14"/>` : `<path d="M -24 -140 q 8 6 16 0 M 8 -140 q 8 6 16 0" stroke="#5a3424" stroke-width="3.5" fill="none" stroke-linecap="round"/>`)
        + `<circle cx="-26" cy="-124" r="7" fill="#f29a8a" opacity="0.45"/><circle cx="26" cy="-124" r="7" fill="#f29a8a" opacity="0.45"/><path d="M -8 -116 q 8 5 16 0" stroke="#8a4a34" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    const pelo = v.pelo && !sil ? `<path d="M -50 -140 Q -52 -196 0 -192 Q 52 -196 50 -140 Q 46 -170 0 -172 Q -46 -170 -50 -140 Z" fill="${v.pelo}"/>` + (o.vestuario === "mujer" || o.vestuario === "reina" ? `<path d="M -50 -140 Q -66 -60 -40 -40 L -30 -110 Z M 50 -140 Q 66 -60 40 -40 L 30 -110 Z" fill="${v.pelo}"/>` : "") : "";
    const barbaSVG = barba !== "no" && !sil ? `<path d="M -44 -132 Q -46 -60 0 -50 Q 46 -60 44 -132 Q 30 -108 0 -106 Q -30 -108 -44 -132 Z" fill="${{ oscura: "#3a2616", blanca: "#f4f1ea", castaña: "#6a4428" }[barba] || "#3a2616"}"/>` : "";
    const extras = [];
    if (v.capucha && !sil) extras.push(`<path d="M -66 -120 Q -70 -205 0 -206 Q 70 -205 66 -120 Q 70 -80 40 -84 Q 50 -170 0 -172 Q -50 -170 -40 -84 Q -70 -80 -66 -120 Z" fill="${v.capucha}"/>`);
    if (v.cinto && !o.corte) extras.push(`<path d="M -72 30 Q 0 42 72 30" stroke="${v.cinto}" stroke-width="8" fill="none"/><path d="M -10 36 l -6 70 M 4 38 l 4 64" stroke="${v.cinto}" stroke-width="6" stroke-linecap="round"/>`);
    if (v.capa) extras.push(`<path d="M -66 -96 Q 0 -112 66 -96 L 80 -30 Q 0 -10 -80 -30 Z" fill="${v.capa}"/>`);
    if (v.cruz) extras.push(`<path d="M 0 -60 v 34 M -10 -48 h 20" stroke="#f2c14e" stroke-width="6" stroke-linecap="round"/>`);
    if (v.armino) extras.push(`<path d="M -66 -96 Q 0 -112 66 -96 L 70 -70 Q 0 -84 -70 -70 Z" fill="#f6f2ea"/>`);
    const gorro = v.gorro && !sil ? `<path d="M -30 -182 Q 0 -200 30 -182 Q 0 -176 -30 -182 Z" fill="${v.gorro}"/>` : "";
    const corona = v.corona ? `<path d="M -36 -178 L -36 -206 L -20 -190 L 0 -214 L 20 -190 L 36 -206 L 36 -178 Z" fill="#f2c14e"/>${luz(0, -196, 30, "#ffe08a", 0.4)}` : "";
    const casco = v.casco && !sil ? `<path d="M -52 -140 Q -54 -196 0 -196 Q 54 -196 52 -140 L 40 -140 L 40 -160 L -40 -160 L -40 -140 Z" fill="#a9b1bb"/><path d="M -6 -196 Q 0 -240 40 -236 Q 20 -220 10 -196 Z" fill="#c42a2a"/>` : "";
    const bebe = pose === "carga" ? `<ellipse cx="0" cy="-20" rx="62" ry="42" fill="#f6efe2"/><circle cx="-22" cy="-30" r="26" fill="${PIEL[0]}"/><path d="M -32 -32 q 4 3 8 0 M -18 -32 q 4 3 8 0" stroke="#5a3424" stroke-width="2.5" fill="none"/>${luz(0, -20, 70, "#fff3cf", 0.35)}` : "";
    const aureola = o.aureola ? `<ellipse cx="0" cy="-150" rx="78" ry="78" fill="none" stroke="#ffd36a" stroke-width="10" opacity="0.9"/>${luz(0, -150, 95, "#ffd36a", 0.45)}` : "";
    const borde = sil ? `<path d="M -62 -92 Q 0 -110 62 -92 L 92 200" stroke="#ffb86a" stroke-width="5" fill="none" opacity="0.7"/>` : "";
    const g = `<defs>${lin(id + "t", [[0, tun[0]], [1, tun[1]]], 0, 0, 1, 0.6)}${lin(id + "p", [[0, piel[0]], [1, piel[1]]], 0.2, 0, 0.9, 1)}</defs>
      ${aureola}${!o.corte ? `<ellipse cx="0" cy="204" rx="110" ry="16" fill="#000" opacity="0.28" style="filter:blur(8px)"/>` : ""}
      ${brazo(-1)}${brazo(1)}${cuerpo}${extras.join("")}${bebe}${cara}${barbaSVG}${pelo}${gorro}${corona}${casco}${borde}`;
    return `<g transform="scale(${k}) translate(0 ${v.nino ? 60 : 0})">${g}</g>`;
  },
  avion(o) { // colores [cola], rumbo izquierda|derecha, estela
    const cols = o.colores || ["#2b5fb4", "#ffffff", "#d23c3c"], id = uid("av"), f = o.rumbo === "derecha" ? -1 : 1;
    return `<g transform="scale(${f} 1)"><defs>${lin(id, [[0, "#ffffff"], [0.6, "#e9edf2"], [1, "#b8c1cc"]])}</defs>
      ${o.estela ? `<rect x="330" y="-14" width="700" height="18" fill="#fff" opacity="0.35" style="filter:blur(6px)"/>` : ""}
      <path d="M 40 10 L 200 150 L 250 150 L 160 10 Z" fill="#aeb8c4"/>
      <path d="M -330 0 Q -360 -40 -290 -48 L 300 -48 Q 340 -48 350 -20 L 350 20 Q 340 44 300 44 L -290 44 Q -360 40 -330 0 Z" fill="url(#${id})"/>
      <path d="M -305 -18 q 14 -14 34 -14 l 0 16 z" fill="#2c3a4c"/>
      ${Array.from({ length: 20 }, (_, i) => `<rect x="${-230 + i * 26}" y="-22" width="10" height="13" rx="3" fill="#2c3a4c"/>`).join("")}
      <path d="M -300 18 H 330" stroke="${cols[0]}" stroke-width="7"/><path d="M -300 26 H 330" stroke="${cols[cols.length - 1]}" stroke-width="5"/>
      <path d="M 240 -48 L 330 -170 L 375 -170 L 340 -48 Z" fill="${cols[0]}"/>${cols.slice(1).map((c, i) => `<path d="M ${300 + i * 22} -110 L ${333 + i * 14} -170 L ${347 + i * 14} -170 L ${314 + i * 22} -110 Z" fill="${c}"/>`).join("")}
      <path d="M 20 -10 L 170 -120 L 215 -120 L 140 -10 Z" fill="#c3ccd6"/>
      <rect x="40" y="40" width="110" height="40" rx="20" fill="#9aa5b2"/><ellipse cx="44" cy="60" rx="10" ry="18" fill="#3a4656"/></g>`;
  },
  vela(o) { // alto (de la vela), brillo 0-1
    const h = o.alto ?? 220, t = o.t || 0, fl = 1 + 0.08 * Math.sin(t * 13) + 0.05 * Math.sin(t * 7.3), br = lim(o.brillo ?? 1), id = uid("vl");
    return `<defs>${lin(id, [[0, "#fffaf0"], [1, "#d9ccb4"]], 0, 0, 1, 0)}${rad(id + "f", [[0, "#ffffff"], [0.4, "#ffe27a"], [1, "#ff8a1c"]], 0.5, 0.7, 0.6)}</defs>
      ${luz(0, -h / 2 - 40, 140 * br, "#ffb24a", 0.45 * br)}
      <rect x="-28" y="${-h / 2}" width="56" height="${h}" rx="8" fill="url(#${id})"/><path d="M -28 ${-h / 2 + 4} q 10 30 6 50 q -2 10 6 0 q 6 -30 16 -40" fill="#fffdf6"/>
      <path d="M 0 ${-h / 2} v -12" stroke="#3a2a1c" stroke-width="4"/>
      <g transform="translate(0 ${-h / 2 - 14}) scale(${n1(fl)} ${n1(fl * (1 + 0.06 * Math.sin(t * 9)))})"><path d="M 0 -70 Q 22 -30 16 -8 Q 8 8 0 8 Q -8 8 -16 -8 Q -22 -30 0 -70 Z" fill="url(#${id}f)"/></g>
      ${luz(0, -h / 2 - 40, 34, "#fff1c4", 0.7)}`;
  },
  resplandor(o) { // rayos de luz: radio, rayos (n), color, velocidad (grados/s)
    const R = o.radio ?? 600, n = o.rayos ?? 20, c = o.color ?? "#ffd27a", g = ((o.t || 0) * (o.velocidad ?? 4) * Math.PI) / 180, id = uid("rs");
    return `<defs>${rad(id, [[0, "#fff", 1], [1, "#fff", 0]])}<mask id="${id}m"><circle r="${R}" fill="url(#${id})"/></mask></defs>
      <g mask="url(#${id}m)">${Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + g, b = a + (Math.PI / n) * 0.6;
        return `<path d="M 0 0 L ${n1(Math.cos(a) * R)} ${n1(Math.sin(a) * R)} L ${n1(Math.cos(b) * R)} ${n1(Math.sin(b) * R)} Z" fill="${c}" opacity="${i % 2 ? 0.25 : 0.45}"/>`; }).join("")}</g>
      ${luz(0, 0, R * 0.4, c, 0.55)}${luz(0, 0, R * 0.15, "#fffaf0", 0.7)}`;
  },
  documento(o) { // titulo, lineas [..], progreso 0-1 (se escribe solo), trazo cruz|ninguno, pie (texto pequeño abajo), ancho, alto
    const w = o.ancho ?? 560, h = o.alto ?? 720, p = lim(o.progreso ?? 1), id = uid("dc"), r = azar(o.semilla ?? 6);
    const lineas = o.lineas || [], total = lineas.reduce((a, l) => a + l.length, 0) || 1;
    let quedan = Math.round(p * total * (o.trazo && o.trazo !== "ninguno" ? 2 : 1));
    const texto = lineas.map((l, i) => { const vis = l.slice(0, Math.max(0, quedan)); quedan -= l.length; return `<text x="${-w / 2 + 50}" y="${-h / 2 + 150 + i * 52}" font-family="Nunito" font-weight="800" font-size="34" fill="#4a2e18" opacity="0.85">${esc(vis)}</text>`; }).join("");
    const pt = lim(p * 2 - 1);
    const cruz = o.trazo === "cruz" ? `<path d="M -40 -40 V -170 H 40 V -40 H 170 V 40 H 40 V 260 H -40 V 40 H -170 V -40 Z" fill="none" stroke="#4a2e18" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - pt).toFixed(3)}" transform="translate(0 40) scale(${n1(w / 700)})"/>` : "";
    return `<defs>${lin(id, [[0, "#f7ead0"], [1, "#e2cc9e"]], 0, 0, 1, 1)}</defs>
      <rect x="${-w / 2 + 14}" y="${-h / 2 + 18}" width="${w}" height="${h}" fill="#000" opacity="0.35" style="filter:blur(14px)"/>
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="url(#${id})"/>
      ${Array.from({ length: 6 }, () => luz(-w / 2 + r() * w, -h / 2 + r() * h, 30 + r() * 60, "#b08850", 0.15)).join("")}
      ${o.titulo ? `<text x="0" y="${-h / 2 + 80}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="40" fill="#4a2e18">${esc(o.titulo)}</text>` : ""}
      ${texto}${cruz}${o.pie ? `<text x="${-w / 2 + 50}" y="${h / 2 - 50}" font-family="Nunito" font-weight="800" font-size="26" font-style="italic" fill="#6a4a2c">${esc(o.pie)}</text>` : ""}`;
  },
  mapa(o) { // pergamino con mares: puntos [[x, y], ..] de -1 a 1, progreso 0-1 (cuántos se encienden), rutas (true: líneas entre puntos), etiqueta, ancho, alto, semilla
    const w = o.ancho ?? 1200, h = o.alto ?? 760, r = azar(o.semilla ?? 12), id = uid("mp"), t = o.t || 0;
    // una costa redondeada: puntos al azar alrededor de un centro, unidos con curvas suaves (por los puntos medios)
    const mancha = (cx, cy, R) => { const n = 11, P = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, rr = R * (0.65 + r() * 0.55); return [cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr * 0.8]; });
      const m = (i) => { const A = P[i % n], B = P[(i + 1) % n]; return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; };
      let d = `M ${n1(m(0)[0])} ${n1(m(0)[1])}`; for (let i = 1; i <= n; i++) d += ` Q ${n1(P[i % n][0])} ${n1(P[i % n][1])} ${n1(m(i)[0])} ${n1(m(i)[1])}`; return d + " Z"; };
    const mares = Array.from({ length: 5 }, () => `<path d="${mancha((r() - 0.5) * w * 0.8, (r() - 0.5) * h * 0.7, Math.min(w, h) * (0.1 + r() * 0.16))}" fill="#3f7fb8" stroke="#2a5a88" stroke-width="4" stroke-linejoin="round"/>`).join("");
    const pts = (o.puntos || []).map(([x, y]) => [x * w * 0.45, y * h * 0.45]), q = lim(o.progreso ?? 1) * pts.length;
    const rutas = o.rutas ? pts.slice(1).map((b, i) => { const a = pts[i], u = lim(q - i - 1); if (u <= 0) return ""; return `<line x1="${n1(a[0])}" y1="${n1(a[1])}" x2="${n1(a[0] + (b[0] - a[0]) * u)}" y2="${n1(a[1] + (b[1] - a[1]) * u)}" stroke="#ffd76a" stroke-width="5" stroke-dasharray="14 10" opacity="0.9"/>`; }).join("") : "";
    const luces = pts.map(([x, y], i) => { const u = lim(q - i); if (u <= 0) return ""; const pul = 1 + 0.5 * ((t * 0.8 + i * 0.3) % 1);
      return `${luz(x, y, 40 * u, "#ffd76a", 0.6)}<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(10 * rebote(u))}" fill="#fff4c8"/><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(26 * pul)}" fill="none" stroke="#ffe7a0" stroke-width="2.5" opacity="${(0.8 * (2 - pul)).toFixed(2)}"/>`; }).join("");
    return `<defs>${lin(id, [[0, "#eedbb0"], [1, "#d6bb8a"]], 0, 0, 1, 1)}<clipPath id="${id}c"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18"/></clipPath></defs>
      <rect x="${-w / 2 + 16}" y="${-h / 2 + 20}" width="${w}" height="${h}" rx="18" fill="#000" opacity="0.35" style="filter:blur(16px)"/>
      <g clip-path="url(#${id}c)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="url(#${id})"/>${mares}
        ${Array.from({ length: 8 }, () => luz((r() - 0.5) * w, (r() - 0.5) * h, 40 + r() * 80, "#a8824a", 0.15)).join("")}</g>
      ${rutas}${luces}${o.etiqueta ? `<g transform="translate(0 ${n1(h / 2 - 70)})">${PIEZAS_RELATO.dato({ texto: o.etiqueta, tamano: 54 })}</g>` : ""}`;
  },
  senalar(o) { // la mano que señala (acusa): la punta del dedo en (0, 0), el brazo hacia la izquierda; rot para orientarla. manga (color)
    const id = uid("sn"), manga = o.manga ?? "#6b4a34";
    return `<defs>${lin(id, [[0, PIEL[0]], [1, PIEL[1]]])}</defs>
      <rect x="-900" y="-80" width="560" height="170" rx="40" fill="${manga}"/><rect x="-380" y="-86" width="60" height="182" rx="20" fill="${manga}" opacity="0.85"/>
      <rect x="-340" y="-70" width="230" height="150" rx="56" fill="url(#${id})"/>
      <rect x="-150" y="-70" width="150" height="48" rx="24" fill="url(#${id})"/>
      <path d="M -300 -60 q 60 -50 110 -10" stroke="${PIEL[1]}" stroke-width="34" stroke-linecap="round" fill="none"/>
      ${[0, 1, 2].map((i) => `<path d="M -200 ${-10 + i * 30} h 60" stroke="${PIEL[1]}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`).join("")}`;
  },
  cruz(o) { // material madera|oro, brillo 0-1
    const oro = o.material === "oro", id = uid("cz"), br = lim(o.brillo ?? 1);
    const d = "M -34 -230 H 34 V -110 H 130 V -50 H 34 V 230 H -34 V -50 H -130 V -110 H -34 Z";
    return `<defs>${lin(id, oro ? [[0, "#fff1a6"], [0.5, "#e8b53a"], [1, "#9a6a12"]] : [[0, "#a87448"], [0.5, "#7a4e2c"], [1, "#4e2e16"]], 0, 0, 1, 0.3)}</defs>
      ${luz(0, -60, 220 * br, oro ? "#ffd66a" : "#ffc27a", 0.5 * br)}<path d="${d}" fill="url(#${id})"/>
      ${oro ? [[-0, -200], [100, -80], [-100, -80], [0, 190]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="16" fill="${["#c42a2a", "#2a6ac4", "#2a9a5a", "#c42a2a"][i]}"/>`).join("") : `<path d="M -20 -200 v 380 M 14 -180 v 360" stroke="#3a200e" stroke-width="3" opacity="0.4"/>`}`;
  },
  aureola(o) { // el halo dorado: radio
    const R = o.radio ?? 90;
    return `${luz(0, 0, R * 1.3, "#ffd36a", 0.5)}<circle r="${R}" fill="none" stroke="#ffe08a" stroke-width="${n1(R * 0.12)}"/><circle r="${R}" fill="none" stroke="#fff6d0" stroke-width="${n1(R * 0.04)}"/>`;
  },
};

// el tapiz rojo del balcón, con borde dorado y su emblema
function tapiz(cx, y, w, h, emblema = "llaves") {
  const id = uid("tz"), fl = Array.from({ length: Math.round(w / 40) }, (_, i) => `${i ? "L" : "M"} ${n1(cx - w / 2 + i * 40)} ${n1(y + h)} L ${n1(cx - w / 2 + i * 40 + 20)} ${n1(y + h + 16)}`).join(" ");
  const em = emblema === "ninguno" ? "" : emblema === "cruz" ? `<path d="M ${cx} ${n1(y + h * 0.3)} v ${n1(h * 0.4)} M ${n1(cx - h * 0.12)} ${n1(y + h * 0.42)} h ${n1(h * 0.24)}" stroke="#f2c14e" stroke-width="${n1(h * 0.05)}" stroke-linecap="round"/>`
    : `<g transform="translate(${cx} ${n1(y + h * 0.5)}) scale(${n1(h / 300)})" stroke="#f2c14e" stroke-width="12" fill="none" stroke-linecap="round"><path d="M -60 -60 L 60 60 M 60 -60 L -60 60"/><circle cx="-70" cy="-70" r="18"/><circle cx="70" cy="-70" r="18"/><path d="M 40 60 h 30 M 50 40 h 20 M -40 60 h -30 M -50 40 h -20"/></g>`;
  return `<defs>${rad(id, [[0, "#ff5a4a"], [0.7, "#d42a24"], [1, "#9a1414"]], 0.5, 0.4, 0.7)}</defs>
    <path d="M ${n1(cx - w / 2)} ${n1(y)} H ${n1(cx + w / 2)} V ${n1(y + h)} ${fl} Z" fill="url(#${id})"/>
    <rect x="${n1(cx - w / 2 + w * 0.05)}" y="${n1(y + h * 0.06)}" width="${n1(w * 0.9)}" height="${n1(h * 0.86)}" fill="none" stroke="#f2c14e" stroke-width="${n1(Math.max(3, w * 0.012))}"/>${em}`;
}

export const PARAMETROS_RELATO = {
  globo: "texto, tamano, halo (color), cola izq|der|ninguna, fuerza", globos: "textos [..], progreso 0-1 (se anima), ancho, alto, tamano, desde [x, y], halo",
  dato: "valor (se anima), unidad, decimales, texto, tamano", multitud: "GRANDE (y 0 = fila del fondo): ancho, alto, filas, densidad, luces 0-1, brazos 0-1, banderas",
  fachada: "GRANDE (y 0 = base): ancho, alto, cupula, columnas, luz 0-1, emblema llaves|cruz|ninguno, figura (vestuario), brazos 0-1",
  balcon: "luz 0-1, emblema, figura (vestuario), brazos 0-1 (≈ 1040 × 1200)", figura: "vestuario monje|papa|reina|rey|campesino|mujer|soldado|nino|silueta, brazos 0-1, pose quieta|senala|reza|carga, barba no|oscura|blanca|castaña, ojos cerrados|abiertos, aureola, corte",
  avion: "colores [..], rumbo izquierda|derecha, estela", vela: "alto, brillo 0-1", resplandor: "radio, rayos, color, velocidad",
  documento: "titulo, lineas [..], progreso 0-1 (se anima), trazo cruz|ninguno, pie, ancho, alto", mapa: "puntos [[x, y]..] (-1 a 1), progreso 0-1 (se anima), rutas, etiqueta, ancho, alto, semilla",
  senalar: "manga (color); la punta del dedo en (0, 0), usar rot para orientarla", cruz: "material madera|oro, brillo 0-1", aureola: "radio",
};

// ================================================================== ACABADO Y SUBTÍTULOS
// El acabado: viñeta suave y un grano muy fino (sin la tinta del 2D clásico).
export const acabadoRelato = () => `<defs>${rad("vinR", [[0.55, "#000", 0], [1, "#000", 0.55]], 0.5, 0.5, 0.75)}</defs><rect width="${ANCHO}" height="${ALTO}" fill="url(#vinR)"/><rect width="${ANCHO}" height="${ALTO}" filter="url(#grano)" opacity="0.35"/>`;

// Grupos cortos de palabras (como en los subtítulos ASS), cortando mejor tras una coma o un punto.
function grupos(palabras, max, maxLetras) {
  const gs = []; let g = [];
  for (const w of palabras) {
    const largo = g.map((x) => x.texto).join(" ").length + w.texto.length;
    if (g.length && (g.length >= max || largo > maxLetras)) { gs.push(g); g = []; }
    g.push(w);
    if (/[,.;:?!]$/.test(w.texto) && g.length >= 2) { gs.push(g); g = []; }
  }
  if (g.length) gs.push(g);
  return gs;
}

// El contexto del relato para un proyecto: sus subtítulos (dibujados dentro del cuadro, como en tus referencias) y
// su acabado. capa(t) → SVG de lo que va encima de la escena en el segundo t.
export function prepararRelato(p, tiempos, { subtitulos = true } = {}) {
  const H = horizontal(), lista = [];
  for (const f of tiempos.frases) {
    const clave = sinTildes(f.clave || "");
    for (const g of grupos(f.palabras, H ? 7 : 5, H ? 40 : 24)) lista.push({ t0: g[0].inicio - 0.08, fin: g.at(-1).fin, palabras: g.map((w) => ({ ...w, clave: clave && sinTildes(w.texto) === clave })) });
  }
  lista.forEach((g, i) => { g.t1 = i < lista.length - 1 ? Math.min(lista[i + 1].t0, g.fin + 0.6) : g.fin + 0.8; });
  const tam = H ? 54 : 62, y = H ? ALTO - 230 : ALTO * 0.15, w = ANCHO - (H ? 360 : 140);
  const capa = (t) => {
    if (!subtitulos || p.subtitulos === false) return "";
    const g = lista.find((x) => t >= x.t0 && t < x.t1); if (!g) return "";
    const op = Math.min(1, (t - g.t0) / 0.12, (g.t1 - t) / 0.12);
    let actual = -1; g.palabras.forEach((w, i) => { if (t >= w.inicio - 0.03) actual = i; });
    const spans = g.palabras.map((w, i) => {
      const yo = i === actual, color = yo ? "#ffffff" : "rgba(228,228,238,.66)", peso = yo ? 800 : 700;
      const txt = esc(w.texto);
      if (!w.clave) return `<span style="color:${color};font-weight:${peso}">${txt}</span>`;
      const asa = (pos) => `<span style="position:absolute;${pos};width:${tam * 0.2}px;height:${tam * 0.2}px;border-radius:50%;background:#fff;border:3px solid #3d7bff"></span>`;
      return `<span style="position:relative;display:inline-block;padding:0 ${tam * 0.14}px;margin:0 ${tam * 0.04}px;border:3px solid #3d7bff;border-radius:${tam * 0.12}px;background:rgba(18,28,70,.55);color:#fff;font-weight:800;line-height:1.1">${txt}${asa(`left:${-tam * 0.12}px;top:${-tam * 0.12}px`)}${asa(`right:${-tam * 0.12}px;bottom:${-tam * 0.12}px`)}</span>`;
    }).join(" ");
    return html((ANCHO - w) / 2, y - tam * 1.4, w, tam * 2.8, `<div style="display:flex;align-items:${H ? "flex-end" : "flex-start"};justify-content:center;width:100%;height:100%;opacity:${op.toFixed(2)}"><div style="text-align:center;font:700 ${tam}px/1.3 Poppins;padding:${tam * 0.2}px ${tam * 0.8}px;border-radius:${tam}px;background:radial-gradient(ellipse at center,rgba(0,0,0,.5),rgba(0,0,0,0) 74%);text-shadow:0 2px 14px rgba(0,0,0,.75),0 0 3px rgba(0,0,0,.6)">${spans}</div></div>`);
  };
  return { capa, acabado: acabadoRelato };
}
