#!/usr/bin/env node
// Barco Viral · la herramienta. Todas las órdenes: node bv.mjs ayuda
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

const AYUDA = `Barco Viral · órdenes (todas desde esta carpeta):

  node bv.mjs revisar                         qué está instalado y qué falta
  node bv.mjs voces [--acento latin] [--genero male]   voces de ElevenLabs en español para elegir
  node bv.mjs sonidos                         crea tu biblioteca de efectos con ElevenLabs (una vez)
  node bv.mjs nuevo "<idea>" [--estilo documental]     crea el proyecto en proyectos/
  node bv.mjs voz <proyecto> [--rehacer]      la voz con sus tiempos (una vez, con el guion aprobado)
  node bv.mjs tomas <proyecto>                genera las imágenes y la hoja revisar/tomas.jpg
  node bv.mjs otra <proyecto> <n> [<n>...]    otra versión de esas tomas (nueva imagen)
  node bv.mjs borrador <proyecto> [--hasta s] video rápido en baja calidad → revisar/borrador.mp4
  node bv.mjs final <proyecto> [--fps 60]     video final 1080×1920 → entrega/video.mp4
  node bv.mjs portada <proyecto> "Título con *clave*|segunda línea" [--toma n]
  node bv.mjs estilos                         los estilos visuales disponibles
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
      // IA: otra semilla · stock: el siguiente resultado de la búsqueda
      for (const n of nums) { const t = tomas[n - 1]; if (!t) throw new Error(`No hay toma ${n}.`); t.semilla = Math.floor(Math.random() * 1e9); t.elegida = (t.elegida || 0) + 1; }
      guardarJSON(f, p);
      await (await import("./nucleo/montaje.mjs")).hojaDeTomas(dir);
      break;
    }
    case "borrador": { const h = opcion("hasta"); await (await import("./nucleo/montaje.mjs")).montar(carpetaProyecto(primero), { borrador: true, hasta: h ? Number(h) : null, salida: opcion("salida") || undefined }); break; }
    case "final": {
      const dir = carpetaProyecto(primero);
      await (await import("./nucleo/montaje.mjs")).montar(dir, { fps: Number(opcion("fps", 30)), salida: join(dir, "entrega", opcion("nombre", "video.mp4")) });
      const c = (await import("./nucleo/extras.mjs")).escribirCreditos(dir);
      if (c) console.log(`✓ ${c}`);
      break;
    }
    case "portada": {
      const titulo = resto.filter((x) => !x.startsWith("--"))[1];
      if (!titulo) throw new Error('Falta el título: node bv.mjs portada <proyecto> "Título con *clave*"');
      await (await import("./nucleo/extras.mjs")).portada(carpetaProyecto(primero), titulo, { toma: Number(opcion("toma", 1)), acento: opcion("acento") });
      break;
    }
    default: console.log(AYUDA);
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
