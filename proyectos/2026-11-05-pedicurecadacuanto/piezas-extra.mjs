// Piezas y fondo propios de este video (no están en la biblioteca de Barcada): la señora, los pies que hablan, la
// pedicurista, la tina, la uña, el talón, el calendario, la alarma… Se añaden a la biblioteca solo mientras se monta
// este proyecto (hacer.mjs), sin tocar nucleo/. Mismo sello: contorno entintado, volumen de dos tonos y luz de borde.
import { PIEZAS } from "../../nucleo/2d/piezas.mjs";
import { FONDOS } from "../../nucleo/2d/fondos.mjs";
import { TINTA, brillo, caja, circulo, elipse, forma, sombraSuelo, trazo } from "../../nucleo/2d/estilo.mjs";

const lim = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u ?? 0));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const n = (k, f) => Array.from({ length: k }, (_, i) => f(i)).join("");
const ESMALTE = ["#ff9ac4", "#ff4f98", "#b81f63", "#ffe0ef"];

// Ojos grandes y expresivos (de dibujo animado). abre: 0-1; mira: desplazamiento de la pupila.
function ojo(x, y, r, { abre = 1, mira = [0, 0], pest = false, feliz = false, enfado = 0, cejaY = -1.5, triste = 0 } = {}) {
  if (feliz) return trazo(`M ${x - r} ${y + r * 0.2} Q ${x} ${y - r * 1.1} ${x + r} ${y + r * 0.2}`, TINTA, r * 0.32);
  const ry = r * 1.15 * Math.max(0.12, abre);
  return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}" fill="#fff" stroke="${TINTA}" stroke-width="${r * 0.18}"/>
    <ellipse cx="${x + mira[0] * r * 0.35}" cy="${y + mira[1] * r * 0.35}" rx="${r * 0.52}" ry="${Math.min(ry, r * 0.6)}" fill="${TINTA}"/>
    <circle cx="${x + mira[0] * r * 0.35 - r * 0.18}" cy="${y + mira[1] * r * 0.35 - r * 0.2}" r="${r * 0.17}" fill="#fff"/>
    ${pest ? trazo(`M ${x - r * 0.9} ${y - ry * 0.7} l ${-r * 0.35} ${-r * 0.3} M ${x - r * 0.4} ${y - ry * 0.95} l ${-r * 0.15} ${-r * 0.4}`, TINTA, r * 0.14) : ""}
    ${trazo(`M ${x - r} ${y + r * cejaY + enfado * r * 0.1 * Math.sign(x) - triste * r * 0.3} L ${x + r} ${y + r * cejaY - enfado * r * 0.5 + triste * r * 0.3}`, TINTA, r * 0.24)}`;
}
// Una boca: tipo sonrisa | o | grita | duda | risa | linea; abre 0-1 (para hablar)
function boca(x, y, w, tipo = "sonrisa", abre = 0) {
  const a = lim(abre);
  if (tipo === "grita" || (tipo !== "o" && a > 0.15)) {
    const h = tipo === "grita" ? w * (0.55 + 0.35 * a) : w * 0.5 * a;
    return `<path d="M ${x - w / 2} ${y} Q ${x} ${y - h * 0.25} ${x + w / 2} ${y} Q ${x + w * 0.42} ${y + h * 1.4} ${x} ${y + h * 1.45} Q ${x - w * 0.42} ${y + h * 1.4} ${x - w / 2} ${y} Z" fill="#7a1f2e" stroke="${TINTA}" stroke-width="${w * 0.07}" stroke-linejoin="round"/>
      <ellipse cx="${x}" cy="${y + h * 1.05}" rx="${w * 0.22}" ry="${h * 0.3}" fill="#ff7a8a"/>
      <path d="M ${x - w * 0.36} ${y + 2} Q ${x} ${y + h * 0.18} ${x + w * 0.36} ${y + 2} L ${x + w * 0.3} ${y + h * 0.28} Q ${x} ${y + h * 0.4} ${x - w * 0.3} ${y + h * 0.28} Z" fill="#fff"/>`;
  }
  if (tipo === "o") return `<ellipse cx="${x}" cy="${y + w * 0.15}" rx="${w * 0.2}" ry="${w * 0.26}" fill="#7a1f2e" stroke="${TINTA}" stroke-width="${w * 0.07}"/>`;
  if (tipo === "duda") return trazo(`M ${x - w * 0.35} ${y + w * 0.08} Q ${x - w * 0.05} ${y - w * 0.05} ${x + w * 0.35} ${y + w * 0.12}`, TINTA, w * 0.08);
  if (tipo === "linea") return trazo(`M ${x - w * 0.3} ${y} L ${x + w * 0.3} ${y}`, TINTA, w * 0.08);
  if (tipo === "risa") return `<path d="M ${x - w / 2} ${y - w * 0.05} Q ${x} ${y + w * 0.75} ${x + w / 2} ${y - w * 0.05} Z" fill="#7a1f2e" stroke="${TINTA}" stroke-width="${w * 0.07}" stroke-linejoin="round"/><path d="M ${x - w * 0.4} ${y} L ${x + w * 0.4} ${y} L ${x + w * 0.3} ${y + w * 0.12} L ${x - w * 0.3} ${y + w * 0.12} Z" fill="#fff"/>`;
  return trazo(`M ${x - w / 2} ${y} Q ${x} ${y + w * 0.45} ${x + w / 2} ${y}`, TINTA, w * 0.08); // sonrisa
}
// Habla: la boca se abre y se cierra con el tiempo (si habla es 1)
const hablando = (o, vel = 13) => (o.habla ? 0.25 + 0.75 * Math.abs(Math.sin((o.t || 0) * vel)) * (0.6 + 0.4 * Math.sin((o.t || 0) * 5.3)) : 0);
const parpadeo = (t) => ((t * 1000) % 3700 < 120 ? 0.1 : 1);

// Un pie visto de frente (los dedos arriba), con cara. lado: 1 = pie izquierdo (dedo gordo a la derecha), -1 = derecho.
function unPie(o, lado) {
  const d = lim(o.descuido), t = o.t || 0, ex = o.expresion || "normal";
  const cuerpo = "M -70 160 C -92 80 -100 -20 -92 -90 C -80 -150 70 -160 94 -105 C 106 -60 94 -10 66 40 C 48 80 58 130 52 160 C 38 196 -56 196 -70 160 Z";
  const dedos = [[-64, -112, 21], [-38, -134, 24], [-8, -146, 26], [24, -150, 28], [62, -142, 37]];
  const una = ([x, y, r], i) => {
    const largo = r * 0.62 + d * r * 0.3, w = r * 0.62;
    const fresca = o.brilla ? `<ellipse cx="${x - w * 0.3}" cy="${y - r * 0.55}" rx="${w * 0.18}" ry="${largo * 0.3}" fill="#fff" opacity="0.85"/>` : "";
    // el esmalte: con descuido, solo queda en la mitad de abajo (crecido) y algo despintado
    const esm = `<path d="M ${x - w / 2} ${y - r * 0.15} Q ${x - w / 2} ${y - r * 0.15 - largo} ${x} ${y - r * 0.15 - largo - 4} Q ${x + w / 2} ${y - r * 0.15 - largo} ${x + w / 2} ${y - r * 0.15} Z" fill="${d > 0.2 ? "#f6e6dc" : ESMALTE[1]}" stroke="${TINTA}" stroke-width="4"/>
      ${d > 0.2 ? `<path d="M ${x - w / 2 + 2} ${y - r * 0.15} L ${x - w / 2 + 2} ${y - r * 0.15 - largo * 0.45} L ${x - w * 0.1} ${y - r * 0.15 - largo * 0.35} L ${x + w * 0.15} ${y - r * 0.15 - largo * 0.5} L ${x + w / 2 - 2} ${y - r * 0.15 - largo * 0.3} L ${x + w / 2 - 2} ${y - r * 0.15} Z" fill="${ESMALTE[1]}" opacity="${i % 2 ? 0.75 : 0.9}"/>` : ""}`;
    return circulo(x, y, r, "piel", { borde: 5 }) + esm + fresca;
  };
  const sudor = ex === "grita" ? `<path d="M 70 -60 q 14 22 0 30 q -14 -8 0 -30 Z" fill="#9fe2ff" stroke="${TINTA}" stroke-width="3" transform="translate(${4 * Math.sin(t * 9)} ${((t * 60) % 30)})"/>` : "";
  const lagrimas = ex === "llora" ? n(2, (i) => `<path d="M ${i ? 30 : -30} -10 q ${i ? 8 : -8} 40 ${i ? 4 : -4} ${70 + 10 * Math.sin(t * 6 + i)}" fill="none" stroke="#7fd3ff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>`) : "";
  const mira = [(o.miraX || 0) * lado, o.miraY || 0];
  const cara = `${ojo(-28, -32, 21, { abre: ex === "grita" ? 0.85 : parpadeo(t + lado), mira, feliz: ex === "feliz", enfado: ex === "grita" ? 1 : 0, triste: ex === "llora" ? 1 : 0 })}
    ${ojo(28, -32, 21, { abre: ex === "grita" ? 0.85 : parpadeo(t + lado), mira, feliz: ex === "feliz", enfado: ex === "grita" ? -1 : 0, triste: ex === "llora" ? -1 : 0 })}
    ${boca(0, 30, ex === "grita" ? 74 : 52, ex === "grita" ? "grita" : ex === "feliz" ? "risa" : ex === "llora" ? "o" : "sonrisa", hablando(o, ex === "grita" ? 16 : 12))}
    <ellipse cx="-50" cy="12" rx="16" ry="9" fill="#ff8aa8" opacity="0.55"/><ellipse cx="50" cy="12" rx="16" ry="9" fill="#ff8aa8" opacity="0.55"/>`;
  // el talón reseco (suave, sin nada desagradable): unas rayitas claras abajo
  const seco = d > 0.3 ? trazo("M -40 150 l 10 -14 l 8 10 l 10 -12 M 20 152 l 8 -10 l 8 8", "#fff6ea", 5, 0.8) : "";
  return `<g transform="scale(${lado} 1)">${forma(cuerpo, "piel")}${n(5, (i) => una(dedos[i], i))}${brillo(-45, -70, 22, 46, 0.45, -15)}${seco}</g>
    <g>${cara}${sudor}${lagrimas}</g>`;
}

Object.assign(PIEZAS, {
  // los pies (el personaje): expresion normal|grita|llora|feliz; habla (0/1, mueve la boca); descuido 0-1 (uñas
  // crecidas y esmalte despintado); brilla (recién pintadas); pancarta (texto de su cartel de protesta); salta 0/1
  pies(o) {
    const t = o.t || 0, sal = o.salta ? Math.abs(Math.sin(t * 7)) * 40 : 0, temb = o.expresion === "grita" ? 3 * Math.sin(t * 50) : 0;
    const cartel = o.pancarta ? (() => {
      const tx = esc(o.pancarta), w = Math.max(360, tx.length * 34 + 70), y0 = -470 + 10 * Math.sin(t * 9);
      return `${trazo(`M -60 ${y0 + 120} L -90 -60 M 60 ${y0 + 120} L 90 -60`, "#8a5a32", 16)}
        <g transform="rotate(${4 * Math.sin(t * 6)} 0 ${y0 + 60})">${caja(-w / 2, y0, w, 130, 14, "papel")}
        <text x="0" y="${y0 + 88}" text-anchor="middle" font-family="Anton" font-size="78" fill="#e5306f" stroke="${TINTA}" stroke-width="3" paint-order="stroke">${tx}</text></g>`;
    })() : "";
    const destellos = o.brilla ? n(4, (i) => { const a = t * 3 + i * 1.6, s = 0.6 + 0.4 * Math.abs(Math.sin(a)); return `<path transform="translate(${[-200, 210, -150, 170][i]} ${[-190, -160, 60, 90][i]}) scale(${s})" d="M 0 -26 Q 4 -4 26 0 Q 4 4 0 26 Q -4 4 -26 0 Q -4 -4 0 -26 Z" fill="#fff6a8" stroke="${TINTA}" stroke-width="3"/>`; }) : "";
    return `${sombraSuelo(0, 190, 260)}${cartel}<g transform="translate(${temb} ${-sal})"><g transform="translate(-112 0) rotate(-4)">${unPie(o, -1)}</g><g transform="translate(112 0) rotate(4)">${unPie(o, 1)}</g></g>${destellos}`;
  },

  // la señora: expresion tranquila|sorpresa|duda|risa; habla 0/1; camina 0/1; mano relax|abanica|menton|celebra;
  // mira [x, y] (pupilas)
  mujer(o) {
    const t = o.t || 0, ex = o.expresion || "tranquila", cam = o.camina ? Math.sin(t * 7) : 0, mano = o.mano || "relax";
    const pierna = (lado) => `<g transform="translate(${lado * 42} 150) rotate(${cam * 16 * lado})">${caja(-24, 0, 48, 190, 22, "piel", { sombra: 8, rim: 3 })}
      ${caja(-34, 178, 82 * 1, 26, 12, "rosa", { sombra: 5, rim: 2, borde: 5 })}${trazo("M -22 186 Q 6 160 34 186", "#e5306f", 8)}
      ${n(3, (i) => `<ellipse cx="${-14 + i * 16}" cy="${176}" rx="6" ry="5" fill="${ESMALTE[1]}" stroke="${TINTA}" stroke-width="2"/>`)}</g>`;
    const brazo = (lado, ang) => `<g transform="translate(${lado * 92} -150) rotate(${ang})">${caja(-20, 0, 40, 170, 20, "piel", { sombra: 8, rim: 3 })}${circulo(0, 178, 26, "piel")}</g>`;
    const angs = mano === "abanica" ? [18, -140 + 25 * Math.sin(t * 9)] : mano === "menton" ? [18, -158] : mano === "celebra" ? [-150, 150] : [14 + 3 * cam, -14 - 3 * cam];
    const ojos = (x) => ojo(x, -322, 20, { abre: ex === "tranquila" ? 0.55 : ex === "sorpresa" ? 1.15 : parpadeo(t), mira: [o.miraX || 0, o.miraY || 0], pest: true, feliz: ex === "risa", cejaY: ex === "sorpresa" ? -2.1 : ex === "duda" ? (x > 0 ? -2 : -1.4) : -1.6 });
    const bt = ex === "sorpresa" ? "o" : ex === "duda" ? "duda" : ex === "risa" ? "risa" : "sonrisa";
    return `${sombraSuelo(0, 380, 170)}
      ${forma("M -120 -330 C -170 -200 -150 -60 -105 -40 L 105 -40 C 150 -60 170 -200 120 -330 Z", "cafe", { sombra: 20, rim: 6 })}
      ${pierna(-1)}${pierna(1)}
      ${brazo(-1, angs[0])}
      ${forma("M -82 -185 Q 0 -205 82 -185 L 104 -40 Q 150 120 168 170 Q 0 200 -168 170 Q -150 120 -104 -40 Z", "rosa")}
      ${trazo("M -96 -40 Q 0 -20 96 -40", "#fff", 10, 0.85)}
      ${brazo(1, angs[1])}
      ${caja(-26, -230, 52, 50, 20, "piel", { sombra: 6, rim: 2 })}
      ${circulo(0, -320, 112, "piel")}
      ${forma("M -118 -300 C -140 -420 -40 -470 20 -450 C 100 -440 150 -380 118 -290 C 90 -360 30 -380 -20 -370 C -70 -362 -100 -330 -118 -300 Z", "cafe", { sombra: 12, rim: 5 })}
      ${circulo(-112, -290, 9, "oro", { borde: 3 })}${circulo(112, -290, 9, "oro", { borde: 3 })}
      ${ojos(-40)}${ojos(40)}
      <ellipse cx="-70" cy="-275" rx="20" ry="11" fill="#ff8aa8" opacity="0.6"/><ellipse cx="70" cy="-275" rx="20" ry="11" fill="#ff8aa8" opacity="0.6"/>
      ${boca(0, -262, 58, bt, hablando(o))}`;
  },

  // la pedicurista: uniforme blanco, guantes, moño; sostiene una lima (gesto: lima | pulgar)
  pedicurista(o) {
    const t = o.t || 0, lima = (o.gesto || "lima") === "lima";
    const brazo = (lado, ang) => `<g transform="translate(${lado * 92} -150) rotate(${ang})">${caja(-20, 0, 40, 160, 20, "blanco", { sombra: 8, rim: 3 })}${circulo(0, 170, 26, "agua")}</g>`;
    return `${sombraSuelo(0, 380, 160)}
      ${caja(-70, 150, 56, 220, 24, "rosa", { sombra: 8 })}${caja(14, 150, 56, 220, 24, "rosa", { sombra: 8 })}
      ${brazo(-1, 16)}
      ${caja(-108, -190, 216, 360, 60, "blanco")}${caja(-70, -40, 140, 150, 20, "rosa", { sombra: 10, rim: 3, borde: 5 })}
      <g transform="translate(92 -150) rotate(${lima ? -120 + 20 * Math.sin(t * 10) : -150})">${caja(-20, 0, 40, 160, 20, "blanco", { sombra: 8, rim: 3 })}${circulo(0, 170, 26, "agua")}
        ${lima ? `<g transform="translate(0 175) rotate(90)">${caja(-12, -110, 24, 150, 12, "rosa", { sombra: 4, rim: 2, borde: 4 })}</g>` : ""}</g>
      ${circulo(0, -300, 100, "piel")}
      ${circulo(0, -420, 52, "negro")}${forma("M -102 -300 C -110 -400 110 -410 102 -300 C 70 -360 -60 -370 -102 -300 Z", "negro", { sombra: 8, rim: 4 })}
      ${ojo(-36, -300, 17, { abre: parpadeo(t + 1), pest: true })}${ojo(36, -300, 17, { abre: parpadeo(t + 1), pest: true })}
      <ellipse cx="-62" cy="-262" rx="16" ry="9" fill="#ff8aa8" opacity="0.55"/><ellipse cx="62" cy="-262" rx="16" ry="9" fill="#ff8aa8" opacity="0.55"/>
      ${boca(0, -250, 50, "sonrisa", hablando(o))}`;
  },

  // la tina de pedicure: agua con burbujas que suben y pétalos que flotan
  tina(o) {
    const t = o.t || 0;
    return `${sombraSuelo(0, 150, 300)}${forma("M -300 -60 L 300 -60 L 260 130 Q 250 160 220 160 L -220 160 Q -250 160 -260 130 Z", "blanco")}
      ${elipse(0, -60, 300, 46, "agua", { borde: 6 })}
      ${n(7, (i) => { const y = -60 - ((t * 50 + i * 23) % 70), x = -230 + i * 75 + 8 * Math.sin(t * 3 + i); return `<circle cx="${x}" cy="${y}" r="${7 + (i % 3) * 4}" fill="#fff" opacity="0.8" stroke="#5cc8f0" stroke-width="2"/>`; })}
      ${n(4, (i) => `<ellipse cx="${-180 + i * 120 + 10 * Math.sin(t * 1.5 + i)}" cy="${-62 + 6 * Math.cos(t * 2 + i)}" rx="22" ry="12" fill="#ff8fb8" stroke="${TINTA}" stroke-width="3" transform="rotate(${i * 40})"/>`)}
      ${trazo("M -240 40 Q 0 70 240 40", "#ffc2d8", 14)}`;
  },

  // la uña del dedo gordo, en primer plano: crece 0-1 (de cuidada a demasiado larga); esmalte 0/1; lima 0/1 (la lima
  // pasa por el borde)
  una(o) {
    const c = lim(o.crece), t = o.t || 0, L = 60 + c * 120;
    return `${forma("M -150 260 L -150 -40 Q -150 -190 0 -195 Q 150 -190 150 -40 L 150 260 Z", "piel")}
      ${trazo("M -110 150 Q 0 175 110 150", "#a9643d", 6, 0.5)}
      <path d="M -100 -40 Q -100 ${-110 - L} 0 ${-120 - L} Q 100 ${-110 - L} 100 -40 Q 0 -10 -100 -40 Z" fill="${o.esmalte ? ESMALTE[1] : "#ffe7dc"}" stroke="${TINTA}" stroke-width="7" stroke-linejoin="round"/>
      ${c > 0.3 ? `<path d="M -98 ${-120 - L * 0.55} Q 0 ${-140 - L * 0.55} 98 ${-120 - L * 0.55}" fill="none" stroke="#fff" stroke-width="6" opacity="0.8"/>` : ""}
      ${brillo(-45, -100 - L * 0.4, 16, 40, 0.75, -10)}
      ${o.lima ? `<g transform="translate(${60 * Math.sin(t * 12)} ${-125 - L}) rotate(-8)">${caja(-180, -14, 360, 28, 14, "rosa", { sombra: 5, rim: 2, borde: 5 })}</g>` : ""}`;
  },

  // el talón en primer plano: seco 0-1 (durezas y piel muerta, en suave); escamas que caen; crema 0-1 (se suaviza)
  talon(o) {
    const s = lim(o.seco), t = o.t || 0, cr = lim(o.crema);
    return `${sombraSuelo(0, 230, 230)}${forma("M -105 -300 L -118 -80 Q -190 40 -172 160 Q -145 262 0 268 Q 145 262 172 160 Q 190 40 118 -80 L 105 -300 Z", "piel")}${trazo("M -60 -120 Q 0 -100 60 -120", "#a9643d", 5, 0.4)}
      ${s > 0 ? `<ellipse cx="0" cy="165" rx="140" ry="80" fill="#fff4e4" opacity="${0.75 * s * (1 - cr)}"/>
        ${trazo("M -90 150 l 25 -20 l 20 18 l 25 -22 M 10 200 l 22 -18 l 18 16 M -60 210 l 18 -12", "#d9b8a0", 6, s * (1 - cr))}
        ${n(9, (i) => { const y = 230 + ((t * 90 + i * 37) % 120), x = -120 + i * 30; return `<rect x="${x}" y="${y}" width="10" height="6" rx="2" fill="#fff4e4" opacity="${0.8 * s * (1 - cr)}" transform="rotate(${i * 25} ${x} ${y})"/>`; })}` : ""}
      ${cr > 0 ? `<ellipse cx="0" cy="165" rx="${140 * cr}" ry="${80 * cr}" fill="#fff" opacity="0.45"/>${brillo(-60, 60, 50, 22, 0.8 * cr)}` : ""}`;
  },

  // el calendario: titulo arriba; marca 0-2 (1: rodea el día 1, la cita; 2: rodea el día 25, la siguiente, con flecha)
  calendario(o) {
    const m = o.marca ?? 0;
    const celda = (f, c) => { const x = -210 + c * 60, y = -60 + f * 62, dia = f * 7 + c + 1; return dia > 30 ? "" : `<text x="${x + 30}" y="${y + 40}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#6b5560">${dia}</text>`; };
    return `${sombraSuelo(0, 290, 240)}${caja(-240, -230, 480, 500, 34, "papel")}${caja(-240, -230, 480, 140, 34, "rosa", { sombra: 12, rim: 4 })}
      ${n(2, (i) => caja(-150 + i * 260, -262, 40, 70, 18, "metal", { sombra: 6, rim: 2, borde: 5 }))}
      <text y="-130" text-anchor="middle" font-family="Anton" font-size="78" fill="#fff" stroke="${TINTA}" stroke-width="5" paint-order="stroke">${esc(o.titulo || "NOVIEMBRE")}</text>
      ${n(5, (f) => n(7, (c) => celda(f, c)))}
      ${[1, 25].map((dia, k) => { const u = lim(m - k); if (u <= 0) return ""; const c = (dia - 1) % 7, f = Math.floor((dia - 1) / 7), cx = -180 + c * 60, cy = -60 + f * 62 + 28;
        return `<circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#e5306f" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(189 * u).toFixed(1)} 189" transform="rotate(-90 ${cx} ${cy})"/>`; }).join("")}
      ${m > 1.2 ? trazo(`M -150 -20 C -70 30 -80 120 -34 140`, "#e5306f", 7, lim(m - 1.2)) : ""}`;
  },

  // la sirena de alarma: luz roja que gira
  alarma(o) {
    const t = o.t || 0, a = (t * 540) % 360, on = Math.sin(t * 18) > 0;
    return `<g transform="rotate(${a})" opacity="${on ? 0.55 : 0.25}"><path d="M 0 -40 L 520 -150 L 520 70 Z" fill="#ff4d4d" style="filter:blur(10px)"/><path d="M 0 -40 L -520 -150 L -520 70 Z" fill="#ff4d4d" style="filter:blur(10px)"/></g>
      ${caja(-90, 40, 180, 50, 14, "negro", { sombra: 8, rim: 3 })}
      ${forma("M -70 40 L -70 -40 Q -70 -110 0 -110 Q 70 -110 70 -40 L 70 40 Z", on ? "rojo" : ["#ff6a6a", "#c02525", "#6e1010", "#ffe08a"])}
      ${brillo(-30, -60, 16, 30, 0.8, -10)}`;
  },

  // un destello que llena el cuadro (alarma): color; late con el tiempo
  destello(o) {
    const t = o.t || 0;
    return `<rect x="-1200" y="-1200" width="2400" height="2400" fill="${o.tinta || "#ff2a4f"}" opacity="${(0.28 * Math.abs(Math.sin(t * 9))).toFixed(3)}"/>`;
  },

  // el disquete de «guardar»
  guardar(o) {
    return `${caja(-130, -130, 260, 260, 26, o.color || "morado")}${caja(-80, -130, 160, 95, 10, "metal", { sombra: 8, rim: 3, borde: 5 })}${caja(20, -118, 34, 70, 6, "negro", { sombra: 3, rim: 1, borde: 3 })}
      ${caja(-95, 10, 190, 120, 12, "papel", { sombra: 8, rim: 3, borde: 5 })}${trazo("M -70 50 H 70 M -70 85 H 40", "#c3cad4", 8)}`;
  },

  // un frasco de esmalte
  esmalte(o) {
    return `${sombraSuelo(0, 150, 110)}${caja(-30, -200, 60, 120, 16, "negro")}${forma("M -95 -80 L 95 -80 Q 120 -80 120 -40 L 120 110 Q 120 150 80 150 L -80 150 Q -120 150 -120 110 L -120 -40 Q -120 -80 -95 -80 Z", ESMALTE)}${brillo(-70, 20, 16, 60, 0.7, 0)}`;
  },
});

// El salón de belleza: pared rosada con luces suaves, espejo de arco, repisa con frascos y piso claro.
FONDOS.salon = ({ t = 0, suelo: s = 1420 }) => `
  <defs><radialGradient id="fsal" cx="0.5" cy="0.3" r="0.95"><stop offset="0" stop-color="#fff0f5"/><stop offset="0.55" stop-color="#ffc9dc"/><stop offset="1" stop-color="#d9779e"/></radialGradient>
  <linearGradient id="fsalPiso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dccb"/><stop offset="1" stop-color="#c98f86"/></linearGradient>
  <linearGradient id="fsalEsp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9eef7"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#fsal)"/>
  <path d="M 330 1000 L 330 520 Q 330 330 540 330 Q 750 330 750 520 L 750 1000 Z" fill="url(#fsalEsp)" stroke="#e9b04f" stroke-width="16" opacity="0.75"/>
  <path d="M 420 520 L 520 420 M 450 600 L 600 450" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity="0.7"/>
  ${[[90, 760], [990, 760]].map(([x, y]) => `<rect x="${x - 80}" y="${y}" width="160" height="16" rx="8" fill="#e9b04f"/>${[0, 1, 2].map((i) => `<rect x="${x - 70 + i * 50}" y="${y - 70 + (i % 2) * 20}" width="36" height="${70 - (i % 2) * 20}" rx="10" fill="${["#ff6fa8", "#ffd23f", "#9a62e8"][i]}" stroke="${TINTA}" stroke-width="4"/>`).join("")}`).join("")}
  ${[[180, 420, 140, "#fff"], [900, 520, 170, "#ffe0ec"], [540, 1150, 260, "#ffd6e6"]].map(([x, y, r, c], i) => `<circle cx="${x + 15 * Math.sin(t * 0.4 + i)}" cy="${y}" r="${r}" fill="${c}" opacity="0.45" style="filter:blur(${r * 0.45}px)"/>`).join("")}
  <path d="M -20 ${s} Q 540 ${s - 70} 1100 ${s} L 1100 1940 L -20 1940 Z" fill="url(#fsalPiso)"/>
  <path d="M -20 ${s} Q 540 ${s - 70} 1100 ${s}" fill="none" stroke="${TINTA}" stroke-width="6"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M ${i * 216 - 60} 1940 L ${540 + (i - 2.5) * 120} ${s - 30}" stroke="#fff" stroke-width="3" opacity="0.35"/>`).join("")}`;

// La calle de un día de sol (pastel): cielo, casitas de colores al fondo y andén.
FONDOS.calle = ({ t = 0, suelo: s = 1460 }) => `
  <defs><linearGradient id="fcal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe0ff"/><stop offset="0.7" stop-color="#fff1d6"/><stop offset="1" stop-color="#ffd7b0"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#fcal)"/>
  <circle cx="860" cy="330" r="110" fill="#fff3a0" opacity="0.9" style="filter:blur(6px)"/>
  ${[["#ff9ac4", 0, 330], ["#ffd23f", 220, 420], ["#7fd3c0", 470, 360], ["#9a62e8", 700, 450], ["#ff9a3c", 900, 380]].map(([c, x, h]) => `<rect x="${x}" y="${s - h}" width="${200}" height="${h}" fill="${c}" opacity="0.55" stroke="${TINTA}" stroke-width="5"/>
    <rect x="${x + 40}" y="${s - h + 50}" width="50" height="60" rx="8" fill="#fff" opacity="0.7"/><rect x="${x + 115}" y="${s - h + 50}" width="50" height="60" rx="8" fill="#fff" opacity="0.7"/>`).join("")}
  <rect x="-20" y="${s}" width="1120" height="${1940 - s}" fill="#e8cdb0"/><rect x="-20" y="${s}" width="1120" height="14" fill="#c9a888"/>
  <path d="M -20 ${s} H 1100" stroke="${TINTA}" stroke-width="6"/>`;
