// El montaje: cuándo empieza y acaba cada toma (según las palabras de la voz) y el video con movimiento de cámara,
// color, grano, subtítulos, rótulos, voz, efectos y música.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALTO, ANCHO, FUENTES, RAIZ, asegurar, enParalelo, ffmpeg, leerJSON, sinTildes } from "./comun.mjs";
import { ESTILOS, hacerImagenes } from "./imagenes.mjs";
import { escribirASS } from "./subtitulos.mjs";

// El modo juego (Barcada 2.0) de un proyecto, si lo tiene: piel, HUD, títulos, subtítulos dentro del cuadro y mundo.
export async function contextoJuego(p, tiempos, tomas) {
  if (!p.juego) return null;
  const { prepararJuego } = await import("./2d/juego.mjs");
  const pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  const J = { ...p.juego };
  if (!J.avatar && pref.avatar && existsSync(join(RAIZ, pref.avatar))) J.avatar = `data:image/${pref.avatar.endsWith(".png") ? "png" : "jpeg"};base64,${readFileSync(join(RAIZ, pref.avatar)).toString("base64")}`;
  return prepararJuego({ ...p, juego: J }, tiempos, tomas, (ref) => cuando(tiempos, ref), pref);
}

// «desde» de una toma: 0 / un número de frase (2) / "frase:palabra" ("2:fermenta") / "palabra" (la primera en la voz).
export function cuando(tiempos, desde) {
  if (desde === undefined || desde === null || desde === 0 || desde === "0") return 0;
  if (typeof desde === "number") return tiempos.frases[desde - 1].inicio;
  const [a, b] = String(desde).includes(":") ? String(desde).split(":") : [null, String(desde)];
  const frases = a ? [tiempos.frases[Number(a) - 1]] : tiempos.frases;
  if (a && !frases[0]) throw new Error(`No hay frase ${a}.`);
  if (a && !b) return frases[0].inicio;
  const [pal, nth] = b.split("#"); let vistas = 0;
  for (const f of frases) for (const w of f.palabras) if (sinTildes(w.texto) === sinTildes(pal) && ++vistas === Number(nth || 1)) return w.inicio;
  throw new Error(`No encuentro la palabra «${b}»${a ? ` en la frase ${a}` : ""}.`);
}

// Las tomas, en orden, con su inicio y fin.
export function lineaDeTiempo(p, tiempos) {
  const tomas = p.escenas.flatMap((e, ie) => e.tomas.map((t) => ({ ...t, escena: ie + 1 })));
  tomas.forEach((t, i) => { t.n = i + 1; t.inicio = i === 0 ? 0 : cuando(tiempos, t.desde) - 0.06; });
  tomas.forEach((t, i) => { t.fin = i < tomas.length - 1 ? tomas[i + 1].inicio : tiempos.duracion; });
  for (const t of tomas) if (t.fin - t.inicio < 0.8) console.log(`⚠ La toma ${t.n} dura solo ${(t.fin - t.inicio).toFixed(2)} s: mejor juntarla con otra o darle más voz.`);
  return tomas;
}

// El movimiento de cámara sobre una imagen fija: zoompan con curva suave, sobre la imagen al doble de tamaño (sin
// temblor). mov: acercar, alejar, izquierda, derecha, subir, bajar, quieto. fuerza: cuánto (0,1 = 10 %).
function filtroMovimiento(mov = "acercar", frames, fps, fuerza = 0.14) {
  const W = ANCHO * 2, H = ALTO * 2, u = `(on/${Math.max(1, frames - 1)})`, s = `(${u}*${u}*(3-2*${u}))`;
  const zIn = `1+${fuerza}*${s}`, zOut = `${1 + fuerza}-${fuerza}*${s}`, zFijo = `${1 + fuerza}`;
  const cx = "iw/2-(iw/zoom/2)", cy = "ih/2-(ih/zoom/2)";
  const m = {
    acercar: [zIn, cx, cy], alejar: [zOut, cx, cy], quieto: ["1.02", cx, cy],
    izquierda: [zFijo, `(iw-iw/zoom)*(1-${s})`, cy], derecha: [zFijo, `(iw-iw/zoom)*${s}`, cy],
    subir: [zFijo, cx, `(ih-ih/zoom)*(1-${s})`], bajar: [zFijo, cx, `(ih-ih/zoom)*${s}`],
  }[mov] || [zIn, cx, cy];
  return `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},zoompan=z='${m[0]}':x='${m[1]}':y='${m[2]}':d=${frames}:s=${ANCHO}x${ALTO}:fps=${fps},setsar=1`;
}

// Los efectos de sonido: primero la biblioteca del usuario (sonidos/, los genera `node barcada.mjs sonidos`); si no
// está, los del sintetizador del modo juego (sonidos/juego/, se crean solos: blip, clic, pop, nivel, moneda, error…).
function sonido(nombre) {
  const d = join(RAIZ, "sonidos");
  const f = existsSync(d) ? readdirSync(d).find((x) => x.startsWith(nombre + ".")) : null;
  if (f) return join(d, f);
  const j = join(d, "juego", `${nombre}.wav`);
  return existsSync(j) ? j : null;
}

export async function montar(dir, { borrador = false, hasta = null, salida, fps } = {}) {
  const p = leerJSON(join(dir, "proyecto.json"));
  const tiempos = leerJSON(join(dir, "voz", "tiempos.json"));
  const pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  const FPSv = fps || (borrador ? 24 : 30);
  const imgs = await hacerImagenes(dir);
  const tomas = lineaDeTiempo(p, tiempos).filter((t) => hasta === null || t.inicio < hasta);
  const fin = hasta === null ? tiempos.duracion : Math.min(hasta, tiempos.duracion);
  tomas.at(-1).fin = Math.min(tomas.at(-1).fin, fin);
  const tmp = asegurar(join(dir, ".montaje"));
  const juego = await contextoJuego(p, tiempos, lineaDeTiempo(p, tiempos));
  if (juego) (await import("./sintetizador.mjs")).asegurarEfectos(join(RAIZ, "sonidos", "juego"));

  // 1. un clip por toma (las 2D, de dos en dos: cada una ocupa un navegador)
  const { cpus } = await import("node:os");
  await enParalelo(tomas, tomas.some((t) => t.dibujo) ? Math.max(2, Math.min(4, cpus().length)) : 3, async (t) => {
    const frames = Math.max(2, Math.round((t.fin - t.inicio) * FPSv)), src = imgs[t.n - 1];
    const salidaClip = ["-frames:v", String(frames), "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", borrador ? "28" : "16", "-pix_fmt", "yuv420p", join(tmp, `clip-${t.n}.mp4`)];
    if (t.dibujo) {
      // una toma 2D: se dibuja cuadro a cuadro (borrador a media resolución)
      const { crearCuadro } = await import("./2d/escena.mjs"), { grabar } = await import("./2d/dibujante.mjs");
      await grabar(crearCuadro(t.dibujo, t, (ref) => cuando(tiempos, ref), juego), t.inicio, t.inicio + frames / FPSv, FPSv, join(tmp, `clip-${t.n}.mp4`), { escala: borrador ? 0.5 : 1, crf: borrador ? 26 : 16 });
    } else if (/\.(mp4|mov|webm)$/i.test(src)) {
      // un clip de video: se encuadra en vertical, se repite si es corto y, si se pide, va más lento (lenta: 0,5 = mitad)
      const lento = t.lenta ? `setpts=PTS/${t.lenta},` : "";
      await ffmpeg(["-stream_loop", "-1", "-ss", String(t.desdeClip || 0), "-i", src,
        "-vf", `${lento}scale=${ANCHO}:${ALTO}:force_original_aspect_ratio=increase,crop=${ANCHO}:${ALTO},fps=${FPSv},setsar=1`, ...salidaClip]);
    } else {
      await ffmpeg(["-loop", "1", "-framerate", String(FPSv), "-i", src, "-vf", filtroMovimiento(t.movimiento, frames, FPSv, t.fuerza ?? 0.14), ...salidaClip]);
    }
  });
  writeFileSync(join(tmp, "lista.txt"), tomas.map((t) => `file 'clip-${t.n}.mp4'`).join("\n") + "\n");
  await ffmpeg(["-f", "concat", "-safe", "0", "-i", join(tmp, "lista.txt"), "-c", "copy", join(tmp, "mudo.mp4")]);
  if (tomas.some((t) => t.dibujo)) await (await import("./2d/dibujante.mjs")).cerrarNavegador();

  // 2. subtítulos y rótulos
  const ass = join(tmp, "textos.ass");
  // (en el modo juego, los subtítulos y los títulos ya van dibujados dentro de cada cuadro)
  escribirASS(ass, tiempos, juego ? [] : tomas, { acento: pref.acento || p.acento || "#FFD23F", subtitulos: !juego && p.subtitulos !== false });

  // 3. el sonido: voz + efectos (un «whoosh» en cada corte, un «pop» en cada rótulo, los de cada toma) + música
  const entradas = ["-i", join(tmp, "mudo.mp4"), "-i", join(dir, "voz", "voz.mp3")], mezcla = [];
  let n = 2;
  const pon = (archivo, t, db) => { if (!archivo || t >= fin) return; entradas.push("-i", archivo); mezcla.push(`[${n}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${db}dB[s${n}]`); n++; };
  if (juego && p.efectos !== false && p.juego.sonidos !== false) {
    // modo juego: los efectos salen solos de lo que pasa en pantalla (cortes, piezas que entran, títulos, pasos)
    const { sonidosJuego } = await import("./2d/juego.mjs");
    for (const e of sonidosJuego(juego, tomas, (ref) => cuando(tiempos, ref))) pon(sonido(e.nombre), e.t, e.db);
    tomas.forEach((t) => { if (t.sonido) pon(sonido(t.sonido), t.inicio + (t.sonidoEn || 0.1), t.sonidoDb ?? -12); });
  } else if (p.efectos !== false) {
    tomas.slice(1).forEach((t) => pon(sonido("transicion"), Math.max(0, t.inicio - 0.12), -14));
    tomas.forEach((t) => { if (t.rotulo) pon(sonido("pop"), t.inicio + 0.15, -16); if (t.sonido) pon(sonido(t.sonido), t.inicio + (t.sonidoEn || 0.1), t.sonidoDb ?? -12); });
  }
  let musica = p.musica ? join(dir, p.musica) : pref.musica ? join(RAIZ, pref.musica) : null;
  // modo juego sin música propia: el sintetizador compone una para la piel (original, sin derechos de nadie)
  if (juego && !musica && p.juego.musica !== false) {
    musica = join(tmp, `musica-${juego.N}.wav`);
    const semilla = [...(p.titulo || "barcada")].reduce((a, c) => a + c.charCodeAt(0), 0) + (p.juego.semilla || 0);
    (await import("./sintetizador.mjs")).musica(juego.P.musica || juego.N, tiempos.duracion + 1, musica, semilla);
  }
  let mus = "", voz = "[1:a]";
  if (musica && existsSync(musica)) {
    entradas.push("-stream_loop", "-1", "-i", musica);
    mus = `[${n}:a]volume=${p.musicaDb ?? (juego ? -17 : -22)}dB,afade=t=out:st=${Math.max(0, fin - 1.5)}:d=1.5[musb];`;
    // la música baja sola cuando habla la voz (y sube en los silencios)
    mus += `[1:a]asplit=2[vz][vzc];[musb][vzc]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=350[mus];`;
    voz = "[vz]"; n++;
  }
  const ss = mezcla.map((_, i) => `[s${i + 2}]`).join("");
  const audio = `${mezcla.join(";")}${mezcla.length ? ";" : ""}${mus}${voz}${ss}${mus ? "[mus]" : ""}amix=inputs=${1 + mezcla.length + (mus ? 1 : 0)}:normalize=0:duration=first,alimiter=limit=0.95[a]`;

  // 4. el color del estilo, viñeta, grano, textos y salida
  const est = ESTILOS[p.estilo] || ESTILOS.documental, es2d = p.estilo === "2d";
  const esc = borrador ? `,scale=${ANCHO / 2}:${ALTO / 2}` : "";
  // el 2D ya trae su color, su viñeta y su grano: solo se le ponen los textos
  const acabado = es2d ? "null" : `${est.color},vignette=PI/5,noise=alls=${borrador ? 0 : 5}:allf=t`;
  const video = `[0:v]${acabado},subtitles=filename='${ass.replace(/'/g, "\\'")}':fontsdir='${FUENTES}'${esc}[v]`;
  const out = salida || join(dir, "revisar", `${borrador ? "borrador" : "final"}.mp4`);
  asegurar(join(out, ".."));
  await ffmpeg([...entradas, "-filter_complex", `${video};${audio}`, "-map", "[v]", "-map", "[a]", "-t", fin.toFixed(2),
    "-c:v", "libx264", "-preset", borrador ? "veryfast" : "slow", "-crf", borrador ? "27" : "17", "-pix_fmt", "yuv420p", "-r", String(FPSv),
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  console.log(`✓ ${out} (${fin.toFixed(1)} s, ${tomas.length} tomas)`);
  return out;
}

// La hoja de tomas (storyboard): todas las imágenes en una sola imagen, con su número y cuándo salen. Se aprueba esto
// antes de montar: cambiar una imagen aquí es barato; en el video, caro.
export async function hojaDeTomas(dir) {
  const p = leerJSON(join(dir, "proyecto.json")), tiempos = leerJSON(join(dir, "voz", "tiempos.json"));
  const imgs = await hacerImagenes(dir), tomas = lineaDeTiempo(p, tiempos), juego = await contextoJuego(p, tiempos, tomas);
  const tmp = asegurar(join(dir, ".montaje")), cols = Math.min(5, tomas.length), filas = Math.ceil(tomas.length / cols);
  // las tomas 2D: su cuadro del medio, como imagen
  for (const t of tomas.filter((x) => x.dibujo)) {
    const { crearCuadro } = await import("./2d/escena.mjs"), { foto } = await import("./2d/dibujante.mjs");
    const f = join(tmp, `cuadro-${t.n}.jpg`);
    const cu = crearCuadro(t.dibujo, t, (ref) => cuando(tiempos, ref), juego);
    await foto({ preparar: cu.preparar, cuadro: () => cu(t.inicio + (t.fin - t.inicio) * 0.7) }, f, 0.5);
    imgs[t.n - 1] = f;
  }
  if (tomas.some((t) => t.dibujo)) await (await import("./2d/dibujante.mjs")).cerrarNavegador();
  await enParalelo(tomas, 4, (t) => ffmpeg([...(/\.(mp4|mov|webm)$/i.test(imgs[t.n - 1]) ? ["-ss", "0.8"] : []), "-i", imgs[t.n - 1], "-vf",
    `scale=360:640:force_original_aspect_ratio=increase,crop=360:640,drawbox=y=0:w=iw:h=86:color=black@0.6:t=fill,drawtext=fontfile=${join(FUENTES, "Poppins-ExtraBold.ttf")}:text='${t.n}  ${t.inicio.toFixed(1)}s${/\.(mp4|mov|webm)$/i.test(imgs[t.n - 1]) ? "  VIDEO" : ""}':fontcolor=0xFFD23F:fontsize=40:x=18:y=22`,
    "-frames:v", "1", join(tmp, `mini-${String(t.n).padStart(2, "0")}.png`)]));
  const out = join(asegurar(join(dir, "revisar")), "tomas.jpg");
  await ffmpeg(["-framerate", "1", "-i", join(tmp, "mini-%02d.png"), "-vf", `tile=${cols}x${filas}:padding=8:color=0x111111`, "-frames:v", "1", "-q:v", "3", out]);
  console.log(`✓ ${out}`);
  return out;
}
