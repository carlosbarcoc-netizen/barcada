// La voz: ElevenLabs con tiempos por palabra. Se pide UNA vez con el guion aprobado (cada vez cuesta créditos).
// Sin clave, «modo prueba»: un silencio con tiempos estimados, para poder montar el video antes de pagar la voz.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, asegurar, duracion, ffmpeg, guardarJSON, hayClave, leerJSON } from "./comun.mjs";

// La voz se elige al configurar (node barcada.mjs voces) y se guarda en preferencias.json → voz. Si no hay ninguna, una voz
// de las que trae toda cuenta de ElevenLabs («Adam»), que habla español con acento neutro-americano.
export const VOZ_RESPALDO = "pNInz6obpgDQGcFmaJgB";
const MODELO = "eleven_multilingual_v2";
const LIMITE_BLOQUE = 2500; // letras por petición (los videos largos se piden por bloques)

const texto = (f) => f.dicho || f.texto;

export async function hacerVoz(dir, { rehacer = false } = {}) {
  const p = leerJSON(join(dir, "proyecto.json"));
  if (!p.frases?.length || p.frases.some((f) => !f.texto)) throw new Error("El guion está vacío: escribe las frases en proyecto.json.");
  const pref = existsSync(join(RAIZ, "preferencias.json")) ? leerJSON(join(RAIZ, "preferencias.json")) : {};
  // el tono de Barcada: movido, alegre y cercano (menos estabilidad = más expresiva; más estilo = más energía; un poco
  // más rápida). Se cambia en preferencias.json → voz o en el proyecto.
  const voz = { id: VOZ_RESPALDO, modelo: MODELO, estabilidad: 0.32, similitud: 0.8, estilo: 0.55, velocidad: 1.1, ...(pref.voz || {}), ...(p.voz || {}) };
  const huella = createHash("sha1").update(JSON.stringify([p.frases.map(texto), voz])).digest("hex").slice(0, 12);
  const dv = asegurar(join(dir, "voz")), tiempos = join(dv, "tiempos.json");
  if (!rehacer && existsSync(tiempos) && leerJSON(tiempos).huella === huella) { console.log("La voz ya está hecha con este guion (no se vuelve a pagar)."); return leerJSON(tiempos); }

  const unido = p.frases.map(texto).join(" ");
  let chars;
  if (hayClave("ELEVENLABS_API_KEY")) {
    // Los videos largos (más de ~2.500 letras) se piden por bloques de frases enteras: ElevenLabs tiene un límite por
    // petición, y si algo falla a mitad no se vuelve a pagar lo que ya está hecho (cada bloque se guarda en voz/partes/).
    // Cada bloque se pide con el texto de antes y de después, para que la entonación siga igual entre bloques.
    const bloques = [];
    for (const f of p.frases.map(texto)) {
      const b = bloques.at(-1);
      if (b && (b.join(" ").length + f.length + 1) <= LIMITE_BLOQUE) b.push(f); else bloques.push([f]);
    }
    const dp = asegurar(join(dv, "partes")), partes = [];
    for (const [i, b] of bloques.entries()) {
      const txt = b.join(" "), antes = (bloques[i - 1] || []).join(" ").slice(-600), despues = (bloques[i + 1] || []).join(" ").slice(0, 600);
      const hp = createHash("sha1").update(JSON.stringify([txt, antes, despues, voz])).digest("hex").slice(0, 12);
      const fa = join(dp, `parte-${String(i + 1).padStart(2, "0")}.mp3`), fj = fa.replace(/\.mp3$/, ".json");
      let a;
      if (!rehacer && existsSync(fj) && existsSync(fa) && leerJSON(fj).huella === hp) a = leerJSON(fj).alignment;
      else {
        if (bloques.length > 1) console.log(`voz: bloque ${i + 1} de ${bloques.length} (${txt.length} letras)…`);
        const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz.id}/with-timestamps?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
          body: JSON.stringify({ text: txt, model_id: voz.modelo, ...(antes ? { previous_text: antes } : {}), ...(despues ? { next_text: despues } : {}),
            voice_settings: { stability: voz.estabilidad, similarity_boost: voz.similitud, style: voz.estilo, speed: voz.velocidad } }),
        });
        if (!r.ok) throw new Error(`ElevenLabs dijo ${r.status} en el bloque ${i + 1}: ${(await r.text()).slice(0, 300)}`);
        const j = await r.json();
        writeFileSync(fa, Buffer.from(j.audio_base64, "base64"));
        a = j.alignment;
        guardarJSON(fj, { huella: hp, alignment: a });
      }
      partes.push({ fa, a });
    }
    // se unen los bloques: cada uno empieza donde acaba el audio del anterior
    chars = []; let off = 0;
    for (const { fa, a } of partes) {
      if (chars.length) chars.push({ c: " ", t0: off, t1: off });
      for (const [i, c] of a.characters.entries()) chars.push({ c, t0: off + a.character_start_times_seconds[i], t1: off + a.character_end_times_seconds[i] });
      off += duracion(fa);
    }
    if (partes.length === 1) writeFileSync(join(dv, "voz.mp3"), readFileSync(partes[0].fa));
    else {
      writeFileSync(join(dp, "lista.txt"), partes.map(({ fa }) => `file '${fa.replace(/'/g, "'\\''")}'`).join("\n") + "\n");
      await ffmpeg(["-f", "concat", "-safe", "0", "-i", join(dp, "lista.txt"), "-c:a", "libmp3lame", "-b:a", "160k", join(dv, "voz.mp3")]);
    }
  } else {
    console.log("⚠ Sin ELEVENLABS_API_KEY: modo prueba (silencio con tiempos estimados).");
    let t = 0.15;
    chars = [...unido].map((c) => { const d = /[.,:;?!]/.test(c) ? 0.12 : c === " " ? 0.03 : 0.058; const o = { c, t0: t, t1: t + d }; t += d; return o; });
    await ffmpeg(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", (t + 0.3).toFixed(2), "-c:a", "libmp3lame", join(dv, "voz.mp3")]);
  }

  // de letras a palabras, y cada palabra a su frase
  const palabras = []; let cur = null;
  for (const ch of chars) {
    if (/\s/.test(ch.c)) { if (cur) palabras.push(cur); cur = null; continue; }
    if (!cur) cur = { texto: "", inicio: ch.t0, fin: ch.t1 };
    cur.texto += ch.c; cur.fin = ch.t1;
  }
  if (cur) palabras.push(cur);
  // las palabras de lo dicho y las del texto pueden diferir (dicho): se reparten por frase según su número
  const frases = []; let k = 0;
  for (const [n, f] of p.frases.entries()) {
    const nDicho = texto(f).split(/\s+/).filter(Boolean).length, vistas = f.texto.split(/\s+/).filter(Boolean);
    const suyas = palabras.slice(k, k + nDicho); k += nDicho;
    const ini = suyas[0]?.inicio ?? 0, fin = suyas.at(-1)?.fin ?? ini;
    // reparte las palabras escritas (las del subtítulo) sobre el tiempo de lo dicho
    const ps = vistas.map((w, i) => {
      if (vistas.length === suyas.length) return { texto: w, inicio: suyas[i].inicio, fin: suyas[i].fin };
      const a = ini + ((fin - ini) * i) / vistas.length, b = ini + ((fin - ini) * (i + 1)) / vistas.length;
      return { texto: w, inicio: a, fin: b };
    });
    frases.push({ n: n + 1, texto: f.texto, clave: f.clave || "", inicio: ini, fin, palabras: ps });
  }
  const res = { huella, duracion: Math.max(...frases.map((f) => f.fin)) + 0.6, frases };
  guardarJSON(tiempos, res);
  for (const f of frases) console.log(`${String(f.n).padStart(2)}  ${f.inicio.toFixed(2)}–${f.fin.toFixed(2)}  ${f.palabras.map((w) => `${w.texto}@${w.inicio.toFixed(2)}`).join(" ")}`);
  console.log(`voz: ${join(dv, "voz.mp3")} (${res.duracion.toFixed(1)} s)`);
  return res;
}

// Voces de la biblioteca de ElevenLabs en español, para elegir una al configurar.
export async function buscarVoces({ acento = "", genero = "" } = {}) {
  if (!hayClave("ELEVENLABS_API_KEY")) throw new Error("Falta ELEVENLABS_API_KEY en claves.env.");
  const q = new URLSearchParams({ page_size: "30", language: "es", sort: "usage_character_count_1y" });
  if (genero) q.set("gender", genero);
  // «latin» es «latin american» en ElevenLabs; también valen «mexican», «argentine», «colombian», «peninsular»…
  if (acento) q.set("accent", acento === "latin" || acento === "latino" ? "latin american" : acento);
  const r = await fetch(`https://api.elevenlabs.io/v1/shared-voices?${q}`, { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } });
  if (!r.ok) throw new Error(`ElevenLabs dijo ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  return (j.voices || []).map((v) => ({ id: v.voice_id, nombre: v.name, acento: v.accent, genero: v.gender, edad: v.age, uso: v.use_case, muestra: v.preview_url, descripcion: (v.description || "").slice(0, 120) }));
}
