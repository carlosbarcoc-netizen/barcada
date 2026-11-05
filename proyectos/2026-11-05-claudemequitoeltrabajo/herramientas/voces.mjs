// Voz de diálogo: una llamada a ElevenLabs por frase con la voz de su personaje; se unen con pausas y se escribe
// voz/voz.mp3 + voz/tiempos.json en el mismo formato que nucleo/voz.mjs.
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const RAIZ = "/home/user/barcada";
const c = await import(join(RAIZ, "nucleo/comun.mjs"));
c.cargarClaves();
const dir = process.argv[2];
const p = c.leerJSON(join(dir, "proyecto.json")), pref = c.leerJSON(join(RAIZ, "preferencias.json"));
const dv = c.asegurar(join(dir, "voz")), tmp = c.asegurar(join(dv, "partes"));
const base = { modelo: "eleven_multilingual_v2", estabilidad: 0.32, similitud: 0.8, estilo: 0.55, velocidad: 1.1 };
const dur = (f) => { const r = c.spawnSyncSafe ? null : null; return null; };
import { spawnSync } from "node:child_process";
const durar = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout.toString());
const frases = [], lista = []; let t = 0.15;
lista.push(`file '${join(tmp, "sil-ini.wav")}'`);
spawnSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.15", join(tmp, "sil-ini.wav")]);
for (const [n, f] of p.frases.entries()) {
  const voz = { ...base, ...(f.quien === "editor" ? pref.voz : {}), ...p.voces[f.quien] };
  const mp3 = join(tmp, `f${n + 1}.mp3`), js = join(tmp, `f${n + 1}.json`), txt = f.dicho || f.texto;
  let j;
  if (existsSync(js) && c.leerJSON(js).txt === txt && c.leerJSON(js).id === voz.id) j = c.leerJSON(js);
  else {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz.id}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ text: txt, model_id: voz.modelo, voice_settings: { stability: voz.estabilidad, similarity_boost: voz.similitud, style: voz.estilo, speed: voz.velocidad } }),
    });
    if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 200)}`);
    j = await r.json(); j.txt = txt; j.id = voz.id;
    writeFileSync(mp3, Buffer.from(j.audio_base64, "base64")); delete j.audio_base64; c.guardarJSON(js, j);
  }
  const wav = join(tmp, `f${n + 1}.wav`);
  spawnSync("ffmpeg", ["-y", "-v", "error", "-i", mp3, "-ac", "1", "-ar", "44100", wav]);
  const d = durar(wav), a = j.alignment;
  const palabras = []; let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) palabras.push(cur); cur = null; return; }
    if (!cur) cur = { texto: "", inicio: t + a.character_start_times_seconds[i], fin: 0 };
    cur.texto += ch; cur.fin = t + a.character_end_times_seconds[i];
  });
  if (cur) palabras.push(cur);
  const vistas = f.texto.split(/\s+/).filter(Boolean);
  const ini = palabras[0].inicio, fin = palabras.at(-1).fin;
  const ps = vistas.map((w, i) => vistas.length === palabras.length ? { texto: w, inicio: palabras[i].inicio, fin: palabras[i].fin }
    : { texto: w, inicio: ini + ((fin - ini) * i) / vistas.length, fin: ini + ((fin - ini) * (i + 1)) / vistas.length });
  frases.push({ n: n + 1, quien: f.quien, texto: f.texto, clave: f.clave || "", inicio: ini, fin, palabras: ps });
  lista.push(`file '${wav}'`);
  const pausa = n === p.frases.length - 1 ? 0.4 : (p.frases[n + 1].quien !== f.quien ? 0.35 : 0.5);
  const sil = join(tmp, `sil${n + 1}.wav`);
  spawnSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(pausa), sil]);
  lista.push(`file '${sil}'`);
  t += d + pausa;
}
writeFileSync(join(tmp, "lista.txt"), lista.join("\n") + "\n");
const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", join(tmp, "lista.txt"), "-c:a", "libmp3lame", "-b:a", "192k", join(dv, "voz.mp3")]);
if (r.status) throw new Error(r.stderr.toString());
const res = { huella: "dialogo", duracion: Math.max(...frases.map((f) => f.fin)) + 0.6, frases };
c.guardarJSON(join(dv, "tiempos.json"), res);
for (const f of frases) console.log(`${String(f.n).padStart(2)} ${f.quien.padEnd(6)} ${f.inicio.toFixed(2)}–${f.fin.toFixed(2)}  ${f.palabras.map((w) => `${w.texto}@${w.inicio.toFixed(2)}`).join(" ")}`);
console.log(`voz: ${join(dv, "voz.mp3")} (${res.duracion.toFixed(1)} s, total mp3 ${durar(join(dv, "voz.mp3")).toFixed(1)} s)`);
