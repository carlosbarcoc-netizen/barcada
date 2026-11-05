// La música de este video y dos efectos que no estaban en la biblioteca (alarma y boing), con ElevenLabs. Una vez.
// Uso: node proyectos/2026-11-05-pedicurecadacuanto/audio-extra.mjs
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RAIZ, asegurar, cargarClaves } from "../../nucleo/comun.mjs";
cargarClaves();
const DIR = dirname(fileURLToPath(import.meta.url)), H = { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" };
const efectos = {
  alarma: "Cartoon comedy alarm siren, short exaggerated emergency whoop, funny",
  boing: "Cartoon boing spring bounce, comedic",
};
for (const [n, prompt] of Object.entries(efectos)) {
  const f = join(asegurar(join(RAIZ, "sonidos")), `${n}.mp3`);
  if (existsSync(f)) continue;
  const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", { method: "POST", headers: H, body: JSON.stringify({ text: prompt, duration_seconds: 1.6, prompt_influence: 0.6 }) });
  if (!r.ok) { console.log(`✗ ${n}: ${r.status} ${(await r.text()).slice(0, 200)}`); continue; }
  writeFileSync(f, Buffer.from(await r.arrayBuffer())); console.log(`✓ sonidos/${n}.mp3`);
}
const m = join(DIR, "musica.mp3");
if (!existsSync(m)) {
  const r = await fetch("https://api.elevenlabs.io/v1/music", { method: "POST", headers: H, body: JSON.stringify({
    prompt: "Playful upbeat Latin comedy background music for a funny beauty salon short video: bouncy pizzicato, light cumbia percussion, marimba, cheerful and quirky, instrumental only, no vocals, steady energy",
    music_length_ms: 50000, force_instrumental: true }) });
  if (!r.ok) console.log(`✗ música: ${r.status} ${(await r.text()).slice(0, 300)}`);
  else { writeFileSync(m, Buffer.from(await r.arrayBuffer())); console.log("✓ musica.mp3"); }
}
