// El montaje: cuándo empieza y acaba cada toma (según las palabras de la voz) y el video con movimiento de cámara,
// color, grano, subtítulos, rótulos, voz, efectos y música.
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALTO, ANCHO, FUENTES, RAIZ, asegurar, enParalelo, ffmpeg, leerJSON, sinTildes } from "./comun.mjs";
import { ESTILOS, hacerImagenes } from "./imagenes.mjs";
import { escribirASS } from "./subtitulos.mjs";

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

// Los efectos de sonido de la biblioteca del usuario (sonidos/, los genera `node bv.mjs sonidos`).
function sonido(nombre) {
  const d = join(RAIZ, "sonidos");
  if (!existsSync(d)) return null;
  const f = readdirSync(d).find((x) => x.startsWith(nombre + "."));
  return f ? join(d, f) : null;
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

  // 1. un clip por toma
  await enParalelo(tomas, 3, async (t) => {
    const frames = Math.max(2, Math.round((t.fin - t.inicio) * FPSv));
    await ffmpeg(["-loop", "1", "-framerate", String(FPSv), "-i", imgs[t.n - 1], "-frames:v", String(frames),
      "-vf", filtroMovimiento(t.movimiento, frames, FPSv, t.fuerza ?? 0.14), "-c:v", "libx264", "-preset", "veryfast", "-crf", borrador ? "28" : "16", "-pix_fmt", "yuv420p", join(tmp, `clip-${t.n}.mp4`)]);
  });
  writeFileSync(join(tmp, "lista.txt"), tomas.map((t) => `file 'clip-${t.n}.mp4'`).join("\n") + "\n");
  await ffmpeg(["-f", "concat", "-safe", "0", "-i", join(tmp, "lista.txt"), "-c", "copy", join(tmp, "mudo.mp4")]);

  // 2. subtítulos y rótulos
  const ass = join(tmp, "textos.ass");
  escribirASS(ass, tiempos, tomas, { acento: pref.acento || p.acento || "#FFD23F", subtitulos: p.subtitulos !== false });

  // 3. el sonido: voz + efectos (un «whoosh» en cada corte, un «pop» en cada rótulo, los de cada toma) + música
  const entradas = ["-i", join(tmp, "mudo.mp4"), "-i", join(dir, "voz", "voz.mp3")], mezcla = [];
  let n = 2;
  const pon = (archivo, t, db) => { if (!archivo || t >= fin) return; entradas.push("-i", archivo); mezcla.push(`[${n}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${db}dB[s${n}]`); n++; };
  if (p.efectos !== false) {
    tomas.slice(1).forEach((t) => pon(sonido("transicion"), Math.max(0, t.inicio - 0.12), -14));
    tomas.forEach((t) => { if (t.rotulo) pon(sonido("pop"), t.inicio + 0.15, -16); if (t.sonido) pon(sonido(t.sonido), t.inicio + (t.sonidoEn || 0.1), t.sonidoDb ?? -12); });
  }
  const musica = p.musica ? join(dir, p.musica) : pref.musica ? join(RAIZ, pref.musica) : null;
  let mus = "";
  if (musica && existsSync(musica)) { entradas.push("-stream_loop", "-1", "-i", musica); mus = `[${n}:a]volume=${p.musicaDb ?? -22}dB,afade=t=out:st=${Math.max(0, fin - 1.5)}:d=1.5[mus];`; n++; }
  const ss = mezcla.map((_, i) => `[s${i + 2}]`).join("");
  const audio = `${mezcla.join(";")}${mezcla.length ? ";" : ""}${mus}[1:a]${ss}${mus ? "[mus]" : ""}amix=inputs=${1 + mezcla.length + (mus ? 1 : 0)}:normalize=0:duration=first,alimiter=limit=0.95[a]`;

  // 4. el color del estilo, viñeta, grano, textos y salida
  const est = ESTILOS[p.estilo] || ESTILOS.documental;
  const esc = borrador ? `,scale=${ANCHO / 2}:${ALTO / 2}` : "";
  const video = `[0:v]${est.color},vignette=PI/5,noise=alls=${borrador ? 0 : 5}:allf=t,subtitles=filename='${ass.replace(/'/g, "\\'")}':fontsdir='${FUENTES}'${esc}[v]`;
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
  const imgs = await hacerImagenes(dir), tomas = lineaDeTiempo(p, tiempos);
  const tmp = asegurar(join(dir, ".montaje")), cols = Math.min(5, tomas.length), filas = Math.ceil(tomas.length / cols);
  await enParalelo(tomas, 4, (t) => ffmpeg(["-i", imgs[t.n - 1], "-vf",
    `scale=360:640:force_original_aspect_ratio=increase,crop=360:640,drawbox=y=0:w=iw:h=86:color=black@0.6:t=fill,drawtext=fontfile=${join(FUENTES, "Poppins-ExtraBold.ttf")}:text='${t.n}  ${t.inicio.toFixed(1)}s':fontcolor=0xFFD23F:fontsize=40:x=18:y=22`,
    "-frames:v", "1", join(tmp, `mini-${String(t.n).padStart(2, "0")}.png`)]));
  const out = join(asegurar(join(dir, "revisar")), "tomas.jpg");
  await ffmpeg(["-framerate", "1", "-i", join(tmp, "mini-%02d.png"), "-vf", `tile=${cols}x${filas}:padding=8:color=0x111111`, "-frames:v", "1", "-q:v", "3", out]);
  console.log(`✓ ${out}`);
  return out;
}
