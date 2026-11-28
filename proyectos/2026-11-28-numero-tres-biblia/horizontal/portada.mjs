// Portada horizontal 1280 × 720 → entrega/portada.jpg
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FUENTES } from "../../../nucleo/comun.mjs";
import { chromium } from "../../../nucleo/2d/navegador.mjs";
const AQUI = dirname(fileURLToPath(import.meta.url)), b64 = (f) => readFileSync(f).toString("base64");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(data:font/ttf;base64,${b64(join(FUENTES, "Anton-Regular.ttf"))})}
@font-face{font-family:Cormorant;font-weight:700;src:url(data:font/woff2;base64,${b64(join(AQUI, "fuentes", "cormorant-garamond-latin-700-normal.woff2"))})}
@font-face{font-family:Poppins;font-weight:600;src:url(data:font/ttf;base64,${b64(join(FUENTES, "Poppins-SemiBold.ttf"))})}
body{margin:0;width:1280px;height:720px;overflow:hidden;background:#120c1e;font-family:Anton}
.bg{position:absolute;inset:-40px;background:radial-gradient(ellipse at 50% 70%,#ff9a3c 0%,#7a2e5a 35%,#1d1238 70%,#0b0816 100%);filter:blur(6px)}
.rayos{position:absolute;left:-660px;top:-900px;width:2600px;height:2600px;background:repeating-conic-gradient(rgba(255,220,150,.13) 0 4deg,transparent 4deg 12deg);-webkit-mask-image:radial-gradient(circle,#000,transparent 60%);transform-origin:50% 50%}
.tres{position:absolute;left:0;right:0;top:-150px;text-align:center;font:700 900px Cormorant;color:rgba(255,205,110,.22);filter:blur(5px)}
.cruces{position:absolute;left:0;right:0;bottom:0;height:260px}
.oscuro{position:absolute;inset:0;background:radial-gradient(ellipse 55% 50% at 50% 50%,rgba(0,0,0,.6),transparent 100%)}
.tit{position:absolute;left:0;right:0;top:0;bottom:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.l1{font-size:104px;color:#fff;line-height:1;letter-spacing:1px;text-shadow:0 6px 0 rgba(0,0,0,.45),0 0 40px rgba(0,0,0,.6)}
.banda{margin-top:12px;background:#C2185B;padding:6px 36px 2px;transform:rotate(-2deg);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.l2{font-size:138px;line-height:1;color:#FFD23F;text-shadow:0 5px 0 #7a0f3a}
.sello{margin-top:26px;background:#FFD23F;color:#1a1208;font:600 30px Poppins;letter-spacing:2px;padding:10px 28px 8px;border-radius:12px;transform:rotate(1.5deg)}
</style></head><body><div class="bg"></div><div class="rayos"></div><div class="tres">3</div>
<svg class="cruces" viewBox="0 0 1280 260"><path d="M0 260 Q 640 150 1280 260 Z" fill="#0b0816"/>${[[500, 200, 80], [640, 180, 115], [780, 200, 80]].map(([x, y, h]) => `<rect x="${x - 7}" y="${y - h}" width="11" height="${h + 20}" fill="#0b0816"/><rect x="${x - h * 0.3}" y="${y - h * 0.75}" width="${h * 0.6}" height="10" fill="#0b0816"/>`).join("")}</svg>
<div class="oscuro"></div><div class="tit"><div class="l1">¿POR QUÉ DIOS ELIGIÓ</div><div class="banda"><div class="l2">EL NÚMERO 3?</div></div><div class="sello">LO QUE CASI NADIE SABE</div></div></body></html>`;
const nav = await (await chromium()).launch(), pg = await nav.newPage({ viewport: { width: 1280, height: 720 } });
await pg.setContent(html); await pg.evaluate(() => document.fonts.ready);
const out = join(AQUI, "..", "entrega", "portada.jpg");
await pg.screenshot({ path: out, type: "jpeg", quality: 92 }); await nav.close(); console.log("✓ " + out);
