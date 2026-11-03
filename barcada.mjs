#!/usr/bin/env node
// Barcada · la herramienta. Todas las órdenes: node barcada.mjs ayuda
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { cargarClaves, carpetaProyecto, guardarJSON, leerJSON } from "./nucleo/comun.mjs";

// Detrás de un proxy (empresas, entornos en la nube), el fetch de Node lo usa solo con NODE_USE_ENV_PROXY=1.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_NO_WARNINGS: "1" } });
  process.exit(r.status ?? 1);
}

cargarClaves();
const [orden, ...resto] = process.argv.slice(2);
const opcion = (nombre, def = null) => { const i = resto.indexOf(`--${nombre}`); return i >= 0 ? resto[i + 1] ?? true : def; };
const marca = (nombre) => resto.includes(`--${nombre}`);
const primero = resto.find((x) => !x.startsWith("--"));

const AYUDA = `Barcada · órdenes (todas desde esta carpeta):

  node barcada.mjs revisar                         qué está instalado y qué falta
  node barcada.mjs voces [--acento latin] [--genero male]   voces de ElevenLabs en español para elegir
  node barcada.mjs sonidos                         crea tu biblioteca de efectos con ElevenLabs (una vez)
  node barcada.mjs nuevo "<idea>" [--estilo documental]     crea el proyecto en proyectos/
  node barcada.mjs voz <proyecto> [--rehacer]      la voz con sus tiempos (una vez, con el guion aprobado)
  node barcada.mjs tomas <proyecto>                genera las imágenes y la hoja revisar/tomas.jpg
  node barcada.mjs otra <proyecto> <n> [<n>...]    otra versión de esas tomas (nueva imagen)
  node barcada.mjs borrador <proyecto> [--hasta s] video rápido en baja calidad → revisar/borrador.mp4
  node barcada.mjs final <proyecto> [--fps 60]     video final 1080×1920 → entrega/video.mp4
  node barcada.mjs portada <proyecto> "Título con *clave*|segunda línea" [--toma n] [--etiqueta "¡nadie te lo dijo!"]
  node barcada.mjs estilos                         los estilos visuales disponibles
`;

try {
  switch (orden) {
    case "revisar": await (await import("./nucleo/extras.mjs")).revisar(); break;
    case "estilos": { const { ESTILOS } = await import("./nucleo/imagenes.mjs"); for (const [k, e] of Object.entries(ESTILOS)) console.log(`${k.padEnd(12)} ${e.nombre} — ${e.para}`); break; }
    case "voces": {
      const vs = await (await import("./nucleo/voz.mjs")).buscarVoces({ acento: opcion("acento", ""), genero: opcion("genero", "") });
      for (const v of vs) console.log(`${v.id}  ${v.nombre} · ${v.genero} · ${v.edad} · ${v.acento} · ${v.uso}\n   ${v.descripcion}\n   muestra: ${v.muestra}`);
      break;
    }
    case "sonidos": await (await import("./nucleo/extras.mjs")).crearSonidos({ rehacer: marca("rehacer") }); break;
    case "nuevo": (await import("./nucleo/extras.mjs")).nuevo(primero, { estilo: opcion("estilo", "documental"), nombre: opcion("nombre") }); break;
    case "voz": await (await import("./nucleo/voz.mjs")).hacerVoz(carpetaProyecto(primero), { rehacer: marca("rehacer") }); break;
    case "tomas": await (await import("./nucleo/montaje.mjs")).hojaDeTomas(carpetaProyecto(primero)); break;
    case "otra": {
      const dir = carpetaProyecto(primero), f = join(dir, "proyecto.json"), p = leerJSON(f);
      const nums = resto.filter((x) => /^\d+$/.test(x)).map(Number), tomas = p.escenas.flatMap((e) => e.tomas);
      for (const n of nums) { const t = tomas[n - 1]; if (!t) throw new Error(`No hay toma ${n}.`); t.semilla = Math.floor(Math.random() * 1e9); }
      guardarJSON(f, p);
      await (await import("./nucleo/montaje.mjs")).hojaDeTomas(dir);
      break;
    }
    case "borrador": { const h = opcion("hasta"); await (await import("./nucleo/montaje.mjs")).montar(carpetaProyecto(primero), { borrador: true, hasta: h ? Number(h) : null, salida: opcion("salida") || undefined }); break; }
    case "final": {
      const dir = carpetaProyecto(primero);
      await (await import("./nucleo/montaje.mjs")).montar(dir, { fps: Number(opcion("fps", 30)), salida: join(dir, "entrega", opcion("nombre", "video.mp4")) });
      break;
    }
    case "portada": {
      const titulo = resto.filter((x) => !x.startsWith("--"))[1];
      if (!titulo) throw new Error('Falta el título: node barcada.mjs portada <proyecto> "Título con *clave*"');
      await (await import("./nucleo/extras.mjs")).portada(carpetaProyecto(primero), titulo, { toma: Number(opcion("toma", 1)), acento: opcion("acento"), etiqueta: opcion("etiqueta") });
      break;
    }
    default: console.log(AYUDA);
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
