// La marca de agua: «Azurre» en letra elegante (Playfair Display cursiva) y debajo «_estudiodebelleza» en letras
// pequeñas y espaciadas. Rosa pálido al 30 %, centrada, en un PNG transparente de 1080×1920 que va encima del video.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../../nucleo/2d/navegador.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const f = (n) => `data:font/woff2;base64,${readFileSync(join(DIR, "marca", n)).toString("base64")}`;

export async function marcaDeAgua(salida, { opacidad = 0.3, y = 960 } = {}) {
  if (existsSync(salida)) return salida;
  const nav = await (await chromium()).launch();
  const pag = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  await pag.setContent(`<html><head><style>
    @font-face{font-family:Marca;font-style:italic;font-weight:500;src:url(${f("playfair-display-latin-500-italic.woff2")})}
    @font-face{font-family:Marca;font-style:normal;font-weight:400;src:url(${f("playfair-display-latin-400-normal.woff2")})}
    html,body{margin:0;background:transparent;width:1080px;height:1920px;overflow:hidden}
    .m{position:absolute;left:0;width:1080px;top:${y}px;transform:translateY(-50%);text-align:center;opacity:${opacidad};color:#ffe6f0;
       text-shadow:0 0 2px rgba(60,20,40,.55),0 2px 12px rgba(60,20,40,.4)}
    .a{font:italic 500 168px/1 Marca;letter-spacing:2px}
    .b{margin-top:22px;font:400 40px/1 Marca;letter-spacing:13px;display:flex;align-items:center;justify-content:center;gap:22px}
    .b i{display:inline-block;width:70px;height:2px;background:#ffe6f0}
  </style></head><body><div class="m"><div class="a">Azurre</div><div class="b"><i></i>_estudiodebelleza<i></i></div></div></body></html>`);
  await pag.evaluate(async () => { await document.fonts.load("italic 500 40px Marca"); await document.fonts.load("400 40px Marca"); await document.fonts.ready; });
  writeFileSync(salida, await pag.screenshot({ type: "png", omitBackground: true }));
  await nav.close();
  return salida;
}
