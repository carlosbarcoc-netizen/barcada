// Video horizontal (1920 × 1080) del proyecto «El número tres en la Biblia».
// Barcada dibuja en vertical; este montaje es propio del proyecto (no toca nucleo/).
//   node render.mjs hoja                          → revisar/tomas.jpg (una foto por toma)
//   node render.mjs borrador [--desde s] [--hasta s] → revisar/borrador.mp4 (960 × 540)
//   node render.mjs final                         → entrega/video.mp4 (1920 × 1080, con marca de agua)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FUENTES, RAIZ, ffmpeg, sinTildes } from "../../../nucleo/comun.mjs";
import { chromium } from "../../../nucleo/2d/navegador.mjs";
import { TOMAS } from "./escenas.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url)), DIR = join(AQUI, "..");
const W = 1920, H = 1080, MARCA = "@tiempoparaDios";
const args = process.argv.slice(2), modo = args[0] || "borrador";
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d; };
const tiempos = JSON.parse(readFileSync(join(DIR, "voz", "tiempos.json"), "utf8"));

// ---------------------------------------------------------------- tiempos de cada toma
function cuando(ref) {
  if (typeof ref === "number") return tiempos.frases[ref - 1].inicio;
  const [a, b] = String(ref).split(":"), f = tiempos.frases[Number(a) - 1];
  if (!f) throw new Error(`No hay frase ${a}`);
  const w = f.palabras.find((x) => sinTildes(x.texto) === sinTildes(b));
  if (!w) throw new Error(`No encuentro «${b}» en la frase ${a}: ${f.texto}`);
  return w.inicio;
}
const marcado = (titulo) => titulo.split("|").map((linea) => {
  const out = []; let oro = false;
  for (const parte of linea.split(/(\*)/)) { if (parte === "*") { oro = !oro; continue; } for (const w of parte.split(/\s+/).filter(Boolean)) out.push(`<span class="w${oro ? " o" : ""}">${w}</span>`); }
  return out.reduce((a, w) => a + (a && !/^<span class="w[^"]*">[?!,.:;»…]+<\/span>$/.test(w) ? " " : "") + w, "");
}).join("<br>");
let isla = 0;
const tomas = TOMAS.map(([desde, ilus, titulo, ref, ex = {}], i) => {
  if (ex.isla) isla = ex.isla;
  const p = { ...(ex.p || {}) };
  for (const k in p) if (typeof p[k] === "string" && /^\d+:/.test(p[k])) p[k] = cuando(p[k]);
  if (ex.cuenta) p.cuentaT = ex.cuenta.map(cuando);
  const largo = Math.max(...titulo.replace(/\*/g, "").split("|").map((l) => l.length));
  return { t0: i === 0 ? 0 : cuando(desde) - 0.15, ilus, html: marcado(titulo), ref: ref || "", p, isla, centro: !!ex.centro,
    tam: Math.round(Math.max(74, Math.min(108, 880 / (largo * 0.43)))) };
});
tomas.forEach((t, i) => (t.t1 = i < tomas.length - 1 ? tomas[i + 1].t0 : tiempos.duracion));
for (const t of tomas) { if (!t.ilus || !t.html) throw new Error("toma vacía"); if (t.t1 - t.t0 < 1.2) console.log(`⚠ toma corta (${(t.t1 - t.t0).toFixed(2)} s): ${t.html.replace(/<[^>]+>/g, "")}`); }

// ---------------------------------------------------------------- la página que dibuja
const b64 = (f) => readFileSync(f).toString("base64");
const PAGINA = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Poppins;font-weight:600;src:url(data:font/ttf;base64,${b64(join(FUENTES, "Poppins-SemiBold.ttf"))})}
@font-face{font-family:Cormorant;font-weight:700;src:url(data:font/woff2;base64,${b64(join(AQUI, "fuentes", "cormorant-garamond-latin-700-normal.woff2"))})}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#0b0f1d}
#escena{position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;transform-origin:0 0}
#bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 29% 58%,#4a3320 0%,#25203a 45%,#0d1122 78%,#080a14 100%)}
#rayos{position:absolute;left:-740px;top:-760px;width:2600px;height:2600px;background:repeating-conic-gradient(from 0deg,rgba(255,226,160,.07) 0deg 5deg,rgba(255,226,160,0) 5deg 15deg);border-radius:50%;-webkit-mask-image:radial-gradient(circle,#000 0%,transparent 62%)}
.d{position:absolute;width:6px;height:6px;border-radius:50%;background:#FFE3A0;box-shadow:0 0 10px #FFD27A}
.toma{position:absolute;inset:0;display:none}
.ilus{position:absolute;left:250px;top:250px;width:620px;height:620px;filter:drop-shadow(0 0 18px rgba(244,201,107,.35))}
.ilus svg{width:100%;height:100%;overflow:visible}
.tit{position:absolute;left:960px;width:880px;top:120px;bottom:120px;display:flex;flex-direction:column;justify-content:center}
.t{font-family:Cormorant;font-weight:700;line-height:1.06;color:#FFF3DC;text-shadow:0 4px 30px rgba(0,0,0,.55)}
.w{display:inline-block}.o{color:#F6C766;text-shadow:0 0 34px rgba(246,199,102,.45),0 4px 30px rgba(0,0,0,.5)}
.ref{margin-top:34px;align-self:flex-start;font:600 26px Poppins;letter-spacing:3px;color:#F4C96B;border:2px solid rgba(244,201,107,.6);border-radius:40px;padding:8px 26px 6px;text-transform:uppercase}
.centro .ilus{left:650px;top:90px}.centro .tit{left:0;width:${W}px;top:640px;bottom:140px;align-items:center;text-align:center}.centro .ref{display:none}
.puntos{position:absolute;left:250px;width:620px;top:900px;display:flex;justify-content:center;gap:46px}
.pt{width:30px;height:30px;border-radius:50%;border:3px solid #F4C96B;box-sizing:border-box}
#mapa{position:absolute;top:34px;left:0;width:${W}px;display:flex;justify-content:center;gap:16px;font:600 19px Poppins;letter-spacing:3px}
.m{display:flex;align-items:center;gap:10px;color:rgba(244,201,107,.38);padding:7px 18px 5px;border-radius:30px;border:2px solid rgba(244,201,107,.18)}
.m.h{color:rgba(244,201,107,.8);border-color:rgba(244,201,107,.4)}.m.a{color:#1a1208;background:#F4C96B;border-color:#F4C96B}
#vin{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)}
</style></head><body><div id="escena"><div id="bg"></div><div id="rayos"></div><div id="polvo"></div><div id="tomas"></div><div id="mapa"></div><div id="vin"></div></div>
<script>${readFileSync(join(AQUI, "dibujos.js"), "utf8")}</script>
<script>
const TOMAS = ${JSON.stringify(tomas)}, ISLAS = ["TESTIGOS", "TERCER DÍA", "TRES VECES", "EL TRONO", "TU DÍA"];
const lim = (u) => Math.max(0, Math.min(1, u)), su = (u) => { u = lim(u); return u * u * (3 - 2 * u); };
const rb = (u) => { u = lim(u); const c = 1.6, c3 = c + 1; return 1 + c3 * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const polvo = document.getElementById("polvo"), P = [];
let sem = 7; const rnd = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 46; i++) { const d = document.createElement("div"); d.className = "d"; polvo.appendChild(d); P.push({ d, x: rnd() * 1920, y: rnd() * 1080, v: 8 + rnd() * 22, s: 0.4 + rnd() * 1.1, f: rnd() * 6 }); }
const mapa = document.getElementById("mapa");
mapa.innerHTML = ISLAS.map((n, i) => '<div class="m">' + (i + 1) + ' · ' + n + '</div>').join("");
const cont = document.getElementById("tomas"), els = [];
TOMAS.forEach((tm, i) => { const e = document.createElement("div"); e.className = "toma" + (tm.centro ? " centro" : "");
  e.innerHTML = '<div class="ilus"><svg viewBox="-300 -300 600 600"></svg></div><div class="tit"><div class="t" style="font-size:' + (tm.centro ? 150 : tm.tam) + 'px">' + tm.html + '</div>' + (tm.ref ? '<div class="ref">' + tm.ref + '</div>' : '') + '</div>' + (tm.p.cuentaT ? '<div class="puntos"><div class="pt"></div><div class="pt"></div><div class="pt"></div></div>' : '');
  cont.appendChild(e); els.push({ e, svg: e.querySelector("svg"), ilus: e.querySelector(".ilus"), ws: [...e.querySelectorAll(".w")], ref: e.querySelector(".ref"), pts: [...e.querySelectorAll(".pt")] }); });
let vis = new Set();
window.render = (t) => {
  document.getElementById("rayos").style.transform = "rotate(" + (t * 1.2) + "deg)";
  for (const q of P) { const y = ((q.y - t * q.v) % 1180 + 1180) % 1180 - 50, x = q.x + Math.sin(t * 0.4 + q.f) * 30; q.d.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + q.s + ")"; q.d.style.opacity = (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + q.f))).toFixed(2); }
  let i = TOMAS.findIndex((x) => t >= x.t0 && t < x.t1); if (i < 0) i = TOMAS.length - 1;
  const ahora = new Set([i]); const X = 0.7; if (i > 0 && t < TOMAS[i].t0 + X) ahora.add(i - 1);
  for (const j of vis) if (!ahora.has(j)) els[j].e.style.display = "none";
  for (const j of ahora) { const tm = TOMAS[j], E = els[j], tl = t - tm.t0; E.e.style.display = "block";
    const a = j === i ? su(tl / X) : 1 - su((t - TOMAS[i].t0) / X); E.e.style.opacity = a.toFixed(3);
    const s = (j === i ? 0.93 + 0.07 * su(tl / 1.1) : 1 + 0.03 * (1 - a)) * (1 + 0.012 * Math.sin(t * 0.8));
    E.ilus.style.transform = "translateY(" + (Math.sin(t * 0.9) * 8).toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
    E.svg.innerHTML = window.DIBUJOS[tm.ilus](tl, tm.p, t);
    E.ws.forEach((w, k) => { const u = su((tl - 0.25 - k * 0.07) / 0.45); w.style.opacity = u.toFixed(3); w.style.transform = "translateY(" + ((1 - u) * 26).toFixed(1) + "px)"; });
    if (E.ref) { const u = su((tl - 0.7) / 0.5); E.ref.style.opacity = u.toFixed(3); }
    E.pts.forEach((pt, k) => { const c = tm.p.cuentaT[k], on = t >= c, u = on ? rb((t - c) / 0.35) : 1; pt.style.background = on ? "#F4C96B" : "transparent"; pt.style.boxShadow = on ? "0 0 22px #F4C96B" : "none"; pt.style.transform = "scale(" + (on ? u * 1.15 : 1) + ")"; });
  }
  vis = ahora;
  const isla = TOMAS[i].isla; [...mapa.children].forEach((m, k) => { m.className = "m" + (k + 1 === isla ? " a" : k + 1 < isla ? " h" : ""); });
  mapa.style.opacity = isla ? 1 : 0.55;
};
</script></body></html>`;

// ---------------------------------------------------------------- grabar
async function abrir(nav, esc) {
  const pg = await nav.newPage({ viewport: { width: Math.round(W * esc), height: Math.round(H * esc) } });
  await pg.setContent(PAGINA);
  await pg.evaluate(async (e) => { document.getElementById("escena").style.transform = `scale(${e})`; await document.fonts.load("700 40px Cormorant"); await document.fonts.load("600 20px Poppins"); await document.fonts.ready; }, esc);
  return pg;
}
async function tramo(nav, t0, t1, fps, esc, salida) {
  const pg = await abrir(nav, esc), n = Math.round((t1 - t0) * fps);
  const ff = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", esc < 1 ? "24" : "15", "-pix_fmt", "yuv420p", salida]);
  let err = ""; ff.stderr.on("data", (d) => (err += d));
  const fin = new Promise((ok, mal) => ff.on("close", (c) => (c === 0 ? ok() : mal(new Error(err.slice(-1000))))));
  for (let k = 0; k < n; k++) {
    await pg.evaluate((t) => window.render(t), t0 + k / fps);
    const buf = await pg.screenshot({ type: "jpeg", quality: esc < 1 ? 85 : 94 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end(); await fin; await pg.close();
}

// ---------------------------------------------------------------- música propia (pad cálido + campanitas)
function musica(seg, salida) {
  const sr = 44100, N = Math.ceil(seg * sr), buf = new Float32Array(N), hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const prog = [[38, 50, 54, 57, 62], [35, 47, 50, 54, 59], [31, 43, 50, 55, 59], [33, 45, 49, 52, 57]], dur = 8;
  for (let c = 0; c * dur < seg + dur; c++) {
    const notas = prog[c % 4], a = c * dur - 2, b = (c + 1) * dur + 2;
    for (const [v, m] of notas.entries()) { const f = hz(m), amp = v === 0 ? 0.09 : 0.045;
      for (let i = Math.max(0, Math.floor(a * sr)); i < Math.min(N, b * sr); i++) { const t = i / sr, u = (t - a) / (b - a), env = Math.sin(Math.PI * u) ** 1.5;
        buf[i] += amp * env * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.002 * t) + 0.5 * Math.sin(2 * Math.PI * (f + 0.18) * t)); } }
  }
  const penta = [74, 76, 78, 81, 83, 86]; let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let t0 = 1.5; t0 < seg; t0 += 2 + r() * 3) { const f = hz(penta[Math.floor(r() * penta.length)]);
    for (let i = Math.floor(t0 * sr); i < Math.min(N, (t0 + 3) * sr); i++) { const t = i / sr - t0; buf[i] += 0.035 * Math.exp(-t * 1.6) * Math.sin(2 * Math.PI * f * t) * Math.min(1, t * 200); } }
  const pcm = Buffer.alloc(N * 2); for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf[i] * 0.8 * 32767))), i * 2);
  const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  writeFileSync(salida, Buffer.concat([h, pcm]));
}

// ---------------------------------------------------------------- órdenes
const tmp = join(DIR, ".montaje"); mkdirSync(tmp, { recursive: true }); mkdirSync(join(DIR, "revisar"), { recursive: true });
const nav = await (await chromium()).launch();
try {
  if (modo === "hoja") {
    const pg = await abrir(nav, 0.25), fotos = [];
    for (const [i, tm] of tomas.entries()) { await pg.evaluate((t) => window.render(t), tm.t0 + Math.min(2.6, (tm.t1 - tm.t0) * 0.8)); const f = join(tmp, `h-${String(i + 1).padStart(3, "0")}.jpg`); writeFileSync(f, await pg.screenshot({ type: "jpeg", quality: 85 })); fotos.push(f); }
    const fs = await import("node:fs"); for (const f of fs.readdirSync(tmp).filter((x) => x.startsWith("hn-"))) rmSync(join(tmp, f));
    for (const [i, f] of fotos.entries()) await ffmpeg(["-i", f, "-vf", `drawbox=y=0:w=iw:h=34:color=black@0.6:t=fill,drawtext=fontfile=${join(FUENTES, "Poppins-Bold.ttf")}:text='${i + 1}  ${tomas[i].t0.toFixed(0)}s':fontcolor=0xF4C96B:fontsize=24:x=10:y=4`, join(tmp, `hn-${String(i + 1).padStart(3, "0")}.jpg`)]);
    const porHoja = 40, hojas = Math.ceil(fotos.length / porHoja);
    for (let h = 0; h < hojas; h++) { const out = join(DIR, "revisar", `tomas-${h + 1}.jpg`);
      await ffmpeg(["-framerate", "1", "-start_number", String(h * porHoja + 1), "-i", join(tmp, "hn-%03d.jpg"), "-frames:v", "1", "-vf", "tile=5x8:padding=6:color=0x111111", "-q:v", "3", out]); console.log(`✓ ${out}`); }
  } else {
    const final = modo === "final", esc = final ? 1 : 0.5, fps = final ? 30 : 24;
    const desde = opt("desde", 0), hasta = Math.min(opt("hasta", tiempos.duracion), tiempos.duracion), n = Math.max(1, Math.min(cpus().length, 4));
    const corte = Array.from({ length: n + 1 }, (_, k) => desde + ((hasta - desde) * k) / n).map((x) => Math.round(x * fps) / fps);
    const inicio = Date.now();
    await Promise.all(Array.from({ length: n }, (_, k) => tramo(nav, corte[k], corte[k + 1], fps, esc, join(tmp, `tramo-${k}.mp4`))));
    console.log(`imagen: ${((Date.now() - inicio) / 1000).toFixed(0)} s`);
    writeFileSync(join(tmp, "tramos.txt"), Array.from({ length: n }, (_, k) => `file 'tramo-${k}.mp4'`).join("\n") + "\n");
    await ffmpeg(["-f", "concat", "-safe", "0", "-i", join(tmp, "tramos.txt"), "-c", "copy", join(tmp, "mudo.mp4")]);
    const mus = join(tmp, "musica.wav"); if (!existsSync(mus)) musica(tiempos.duracion + 2, mus);
    const lar = hasta - desde, out = final ? join(DIR, "entrega", "video.mp4") : join(DIR, "revisar", "borrador.mp4"); mkdirSync(dirname(out), { recursive: true });
    const fs2 = Math.round(54 * esc);
    const marca = `drawtext=fontfile=${join(FUENTES, "Poppins-SemiBold.ttf")}:text='${MARCA}':fontsize=${fs2}:fontcolor=white@0.16:x=(w-text_w)/2:y=(h-text_h)/2`;
    await ffmpeg(["-i", join(tmp, "mudo.mp4"), "-ss", String(desde), "-t", lar.toFixed(2), "-i", join(DIR, "voz", "voz.wav"), "-ss", String(desde), "-t", lar.toFixed(2), "-i", mus,
      "-filter_complex", `[0:v]${marca}[v];[2:a]aecho=0.8:0.75:180|330|520:0.32|0.22|0.14,lowpass=f=3800,volume=-15dB,afade=t=in:d=2,afade=t=out:st=${Math.max(0, lar - 4)}:d=4[mb];[1:a]asplit=2[vz][vzc];[mb][vzc]sidechaincompress=threshold=0.03:ratio=4:attack=30:release=600[m];[vz][m]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]`,
      "-map", "[v]", "-map", "[a]", "-t", lar.toFixed(2), "-c:v", "libx264", "-preset", final ? "medium" : "veryfast", "-crf", final ? "18" : "26", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
    console.log(`✓ ${out} (${lar.toFixed(1)} s)`);
  }
} finally { await nav.close(); }
