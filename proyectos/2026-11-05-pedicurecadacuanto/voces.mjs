// La voz de este video con TRES personajes (la narradora, la señora y los pies): una petición a ElevenLabs por frase,
// cada una con la voz de su personaje, y luego todo pegado con pausas cortas en voz/voz.mp3 y voz/tiempos.json
// (el mismo formato que deja `node barcada.mjs voz`, así el montaje funciona igual).
// Uso (desde la carpeta de Barcada): node proyectos/2026-11-05-pedicurecadacuanto/voces.mjs [--rehacer]
// Cada frase se guarda aparte (voz/frases/) y solo se vuelve a pedir si cambia su texto o su voz.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { asegurar, cargarClaves, ffmpeg, guardarJSON, hayClave, leerJSON } from "../../nucleo/comun.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const p = leerJSON(join(DIR, "proyecto.json"));
cargarClaves();
const rehacer = process.argv.includes("--rehacer");
if (!hayClave("ELEVENLABS_API_KEY")) throw new Error("Falta ELEVENLABS_API_KEY en claves.env.");
const dv = asegurar(join(DIR, "voz")), df = asegurar(join(dv, "frases"));
const dicho = (f) => f.dicho || f.texto;

const res = [];
for (const [i, f] of p.frases.entries()) {
  const v = { modelo: "eleven_multilingual_v2", similitud: 0.8, ...p.personajes[f.quien] };
  const h = createHash("sha1").update(JSON.stringify([dicho(f), v])).digest("hex").slice(0, 10);
  const mp3 = join(df, `${i + 1}-${h}.mp3`), js = join(df, `${i + 1}-${h}.json`);
  if (rehacer || !existsSync(js)) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ text: dicho(f), model_id: v.modelo, voice_settings: { stability: v.estabilidad, similarity_boost: v.similitud, style: v.estilo, speed: v.velocidad } }),
    });
    if (!r.ok) throw new Error(`ElevenLabs dijo ${r.status} en la frase ${i + 1}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
    guardarJSON(js, j.alignment);
    console.log(`· frase ${i + 1} (${f.quien}) pedida`);
  }
  res.push({ f, mp3, a: JSON.parse(readFileSync(js, "utf8")) });
}

// Palabras de cada frase con sus tiempos (dentro de su propio audio)
const palabrasDe = (a) => {
  const out = []; let cur = null;
  a.characters.forEach((c, k) => {
    if (/\s/.test(c)) { if (cur) out.push(cur); cur = null; return; }
    if (!cur) cur = { texto: "", inicio: a.character_start_times_seconds[k], fin: a.character_end_times_seconds[k] };
    cur.texto += c; cur.fin = a.character_end_times_seconds[k];
  });
  if (cur) out.push(cur);
  return out;
};

// Se pega todo: cada frase recortada a su voz (sin silencios de los bordes) y una pausa corta entre frases; entre
// personajes que discuten, más corta (ritmo de comedia).
const tmp = asegurar(join(DIR, ".montaje")), partes = [], frases = [];
let t = 0.15;
const silencio = async (s, n) => { const a = join(tmp, `sil-${n}.wav`); await ffmpeg(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", s.toFixed(3), a]); partes.push(a); };
await silencio(0.15, "ini");
for (const [i, { f, mp3, a }] of res.entries()) {
  const ps = palabrasDe(a), ini = Math.max(0, ps[0].inicio - 0.04), fin = ps.at(-1).fin + 0.08;
  const wav = join(tmp, `frase-${i + 1}.wav`);
  // misma sonoridad para las tres voces
  await ffmpeg(["-ss", ini.toFixed(3), "-to", fin.toFixed(3), "-i", mp3, "-af", `loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100`, "-ac", "1", wav]);
  partes.push(wav);
  const vistas = f.texto.split(/\s+/).filter(Boolean), d0 = t - ini;
  const pal = vistas.map((w, k) => ps.length === vistas.length
    ? { texto: w, inicio: ps[k].inicio + d0, fin: ps[k].fin + d0 }
    : { texto: w, inicio: t + ((fin - ini) * k) / vistas.length, fin: t + ((fin - ini) * (k + 1)) / vistas.length });
  frases.push({ n: i + 1, texto: f.texto, clave: f.clave || "", quien: f.quien, inicio: pal[0].inicio, fin: pal.at(-1).fin, palabras: pal });
  t += fin - ini;
  const sig = res[i + 1]?.f;
  if (sig) { const pausa = f.pausa ?? (sig.quien !== f.quien ? 0.22 : 0.3); await silencio(pausa, i + 1); t += pausa; }
}
await silencio(1.4, "fin"); t += 1.4;
writeFileSync(join(tmp, "voces.txt"), partes.map((x) => `file '${x}'`).join("\n") + "\n");
await ffmpeg(["-f", "concat", "-safe", "0", "-i", join(tmp, "voces.txt"), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "160k", join(dv, "voz.mp3")]);
const tiempos = { huella: "varias-voces", duracion: t - 0.6, frases };
guardarJSON(join(dv, "tiempos.json"), tiempos);
for (const f of frases) console.log(`${String(f.n).padStart(2)} ${f.quien.padEnd(9)} ${f.inicio.toFixed(2)}–${f.fin.toFixed(2)}  ${f.palabras.map((w) => `${w.texto}@${w.inicio.toFixed(2)}`).join(" ")}`);
console.log(`voz: ${join(dv, "voz.mp3")} (${tiempos.duracion.toFixed(1)} s)`);
