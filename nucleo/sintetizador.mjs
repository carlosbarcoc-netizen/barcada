// Barcada · el sintetizador: la música de fondo y los efectos de los videos «modo juego», creados aquí mismo, nota a
// nota (sin pagar créditos, sin bancos de sonido y sin derechos de nadie: son tuyos).
//   - musica(piel, segundos, salida): un bucle original para la piel (neon: synth tecnológico · bloques: alegre y
//     saltarín · arcade: chiptune de 8 bits). Cambia de semilla en cada proyecto para que no suenen todos igual.
//   - efecto(nombre, salida): un efecto corto (blip, clic, pop, tecleo, nivel, moneda, error, alarma, whoosh…).
// Todo sale en WAV 44,1 kHz mono.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SR = 44100;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- utilidades
function wav(muestras, salida) {
  // normaliza a -1 dBFS y escribe PCM de 16 bits
  let pico = 0; for (const x of muestras) pico = Math.max(pico, Math.abs(x));
  const g = pico > 0 ? 0.89 / pico : 1, n = muestras.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(muestras[i] * g * 32767))), 44 + i * 2);
  mkdirSync(dirname(salida), { recursive: true });
  writeFileSync(salida, buf);
  return salida;
}
// un generador pseudoaleatorio con semilla (mismo proyecto → misma música)
function azar(semilla = 1) { let s = semilla >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const nota = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// osciladores (fase en ciclos)
const cuadrada = (f, dut = 0.5) => (f % 1 < dut ? 1 : -1);
const triangulo = (f) => 4 * Math.abs((f % 1) - 0.5) - 1;
const sierra = (f) => 2 * (f % 1) - 1;
// una envolvente simple: ataque, caída exponencial
const env = (t, a, d) => (t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / d));

// Pone un sonido en la pista: fn(tLocal) → muestra, durante dur s, empezando en t0.
function poner(pista, t0, dur, fn, vol = 1) {
  const i0 = Math.max(0, Math.round(t0 * SR)), i1 = Math.min(pista.length, Math.round((t0 + dur) * SR));
  for (let i = i0; i < i1; i++) pista[i] += vol * fn((i - i0) / SR);
}
// filtro paso bajo de un polo, en el sitio
function pasoBajo(x, corte) { const a = Math.exp(-TAU * corte / SR); let y = 0; for (let i = 0; i < x.length; i++) { y = (1 - a) * x[i] + a * y; x[i] = y; } return x; }
function pasoAlto(x, corte) { const a = Math.exp(-TAU * corte / SR); let y = 0, px = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - px); px = x[i]; x[i] = y; } return x; }

// ---------------------------------------------------------------- instrumentos de percusión
const bombo = (vol = 1) => (t) => vol * Math.sin(TAU * (50 * t + 90 * 0.05 * (1 - Math.exp(-t / 0.05)))) * env(t, 0.002, 0.11);
function caja(rnd, vol = 1, tono = 190) { return (t) => vol * ((rnd() * 2 - 1) * env(t, 0.001, 0.07) * 0.8 + Math.sin(TAU * tono * t) * env(t, 0.001, 0.05) * 0.5); }
function charles(rnd, vol = 1, dur = 0.03) { let p = 0; return (t) => { const n = rnd() * 2 - 1, y = n - p; p = n; return vol * y * env(t, 0.0005, dur); }; }
function palmas(rnd, vol = 1) { return (t) => { const e = env(t, 0.001, 0.012) + env(t - 0.012, 0.001, 0.012) + env(t - 0.024, 0.001, 0.06); return vol * (rnd() * 2 - 1) * e * 0.6; }; }

// cuerda pulsada (Karplus-Strong): suena a guitarra/ukelele de juguete
function pulsada(f, dur, rnd, brillo = 0.5) {
  const n = Math.max(2, Math.round(SR / f)), linea = Float32Array.from({ length: n }, () => rnd() * 2 - 1), out = new Float32Array(Math.round(dur * SR));
  let k = 0;
  for (let i = 0; i < out.length; i++) { const a = linea[k], b = linea[(k + 1) % n]; linea[k] = (a + b) * 0.5 * (0.993 + 0.006 * brillo); out[i] = a; k = (k + 1) % n; }
  return out;
}

// ---------------------------------------------------------------- la música
// Cada estilo: tempo, tonalidad, progresión (grados en semitonos sobre la tónica) y cómo suena cada compás.
const ESTILOS_MUSICA = {
  // neón: synth tecnológico, menor, pads suaves + arpegio de pulsos + bombo a negras suaves
  neon: { bpm: 104, raiz: 50, prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]] },
  // bloques: alegre, mayor, cuerdas pulsadas + marimba + palmas
  voxel: { bpm: 116, raiz: 60, prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]] },
  // arcade: chiptune, cuadradas y triangular, rápido
  arcade: { bpm: 136, raiz: 57, prog: [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-2, 2, 5]] },
};

export function musica(piel, segundos, salida, semilla = 7) {
  const e = ESTILOS_MUSICA[piel] || ESTILOS_MUSICA.neon, rnd = azar(semilla * 7919 + piel.length);
  const negra = 60 / e.bpm, compas = negra * 4, total = segundos + 1, pista = new Float32Array(Math.ceil(total * SR));
  const pad = new Float32Array(pista.length);
  // una melodía corta que se repite con variaciones (8 corcheas por compás, notas del acorde o de paso)
  const motivo = Array.from({ length: 16 }, () => (rnd() < 0.72 ? Math.floor(rnd() * 4) : -1));
  const nCompases = Math.ceil(total / compas);
  for (let c = 0; c < nCompases; c++) {
    const t0 = c * compas, ac = e.prog[c % e.prog.length], raiz = e.raiz, seccion = Math.floor(c / 4) % 4; // 0 intro, 1-3 cuerpo
    const intro = c < 2;
    if (piel === "arcade") {
      for (let k = 0; k < 16; k++) { // arpegio en semicorcheas, cuadrada 25 %
        const m = raiz + 12 + ac[[0, 1, 2, 1][k % 4]] + (k % 8 >= 4 ? 12 : 0), f = nota(m);
        poner(pista, t0 + k * negra / 4, negra / 4, (t) => cuadrada(f * t, 0.25) * env(t, 0.002, 0.06), intro ? 0.10 : 0.13);
      }
      for (let k = 0; k < 8; k++) { // bajo triangular en corcheas, tónica / octava
        const f = nota(raiz - 12 + ac[0] + (k % 2 ? 12 : 0));
        poner(pista, t0 + k * negra / 2, negra / 2 * 0.9, (t) => triangulo(f * t) * env(t, 0.003, 0.25), 0.32);
      }
      if (!intro) {
        for (let k = 0; k < 8; k++) { // melodía: cuadrada 50 %
          const g = motivo[(k + (seccion % 2) * 8) % 16]; if (g < 0) continue;
          const f = nota(raiz + 24 + [ac[0], ac[1], ac[2], ac[0] + 12][g]);
          poner(pista, t0 + k * negra / 2, negra / 2 * 0.85, (t) => cuadrada(f * t * (1 + 0.004 * Math.sin(TAU * 6 * t)), 0.5) * env(t, 0.004, 0.18), 0.09);
        }
        for (let k = 0; k < 4; k++) { poner(pista, t0 + k * negra, 0.25, k % 2 ? caja(rnd, 0.35) : bombo(0.7)); }
        for (let k = 0; k < 8; k++) poner(pista, t0 + k * negra / 2 + negra / 4, 0.05, charles(rnd, 0.12));
      }
    } else if (piel === "voxel") {
      for (let k = 0; k < 8; k++) { // cuerda pulsada en corcheas, arpegio
        const m = raiz + ac[[0, 1, 2, 1, 0, 2, 1, 2][k]] + (k >= 4 ? 12 : 0), s = pulsada(nota(m), negra, rnd);
        const i0 = Math.round((t0 + k * negra / 2) * SR); for (let i = 0; i < s.length && i0 + i < pista.length; i++) pista[i0 + i] += 0.22 * s[i];
      }
      for (let k = 0; k < 4; k++) { // bajo de marimba en negras
        const f = nota(raiz - 12 + ac[k % 2 ? 2 : 0] - (k % 2 ? 12 : 0));
        poner(pista, t0 + k * negra, negra, (t) => (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 4 * f * t) * env(t, 0.001, 0.03)) * env(t, 0.002, 0.22), 0.4);
      }
      if (!intro) {
        for (let k = 0; k < 8; k++) { // melodía de marimba
          const g = motivo[(k + (seccion % 2) * 8) % 16]; if (g < 0) continue;
          const f = nota(raiz + 12 + [ac[0], ac[1], ac[2], ac[0] + 12][g]);
          poner(pista, t0 + k * negra / 2, negra, (t) => (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 3.99 * f * t) * env(t, 0.001, 0.04)) * env(t, 0.002, 0.25), 0.16);
        }
        poner(pista, t0, 0.3, bombo(0.6)); poner(pista, t0 + 2 * negra, 0.3, bombo(0.6));
        poner(pista, t0 + negra, 0.2, palmas(rnd, 0.5)); poner(pista, t0 + 3 * negra, 0.2, palmas(rnd, 0.5));
        for (let k = 0; k < 16; k++) poner(pista, t0 + k * negra / 4, 0.04, charles(rnd, k % 2 ? 0.05 : 0.09, 0.02));
      }
    } else { // neon
      for (const g of ac) { // pad: dos sierras desafinadas, todo el compás, al canal del pad (se filtra)
        const f = nota(raiz + g);
        poner(pad, t0, compas + 0.05, (t) => (sierra(f * t) + sierra(f * 1.006 * t + 0.3)) * Math.min(1, t / 0.4, (compas + 0.05 - t) / 0.3), 0.07);
      }
      for (let k = 0; k < 16; k++) { // arpegio de pulsos
        const m = raiz + 12 + ac[[0, 2, 1, 2][k % 4]] + (k % 8 >= 4 ? 12 : 0), f = nota(m);
        poner(pista, t0 + k * negra / 4, negra / 4, (t) => (triangulo(f * t) * 0.7 + cuadrada(f * t, 0.3) * 0.3) * env(t, 0.002, 0.07), intro ? 0.08 : 0.12);
      }
      for (let k = 0; k < 4; k++) { // bajo
        const f = nota(raiz - 12 + ac[0]);
        poner(pista, t0 + k * negra, negra * 0.9, (t) => (sierra(f * t) * 0.5 + Math.sin(TAU * f * t)) * env(t, 0.004, 0.3), 0.22);
      }
      if (!intro) {
        for (let k = 0; k < 4; k++) poner(pista, t0 + k * negra, 0.3, bombo(0.65));
        poner(pista, t0 + negra, 0.2, palmas(rnd, 0.32)); poner(pista, t0 + 3 * negra, 0.2, palmas(rnd, 0.32));
        for (let k = 0; k < 4; k++) poner(pista, t0 + k * negra + negra / 2, 0.06, charles(rnd, 0.14, 0.04));
      }
    }
  }
  if (piel === "neon") { pasoBajo(pad, 900); for (let i = 0; i < pista.length; i++) pista[i] += pad[i]; }
  pasoAlto(pista, 30);
  // entrada y salida suaves
  const fi = 0.4 * SR, fo = 1.6 * SR, n = Math.round(segundos * SR);
  for (let i = 0; i < pista.length; i++) pista[i] *= Math.min(1, i / fi, Math.max(0, (n - i) / fo + 0.0));
  return wav(pista.subarray(0, n), salida);
}

// ---------------------------------------------------------------- los efectos
export const EFECTOS = {
  blip: [0.1, (t) => cuadrada((t < 0.035 ? 988 : 1319) * t, 0.5) * env(t, 0.001, 0.05)],
  clic: [0.05, (t, r) => ((r() * 2 - 1) * env(t, 0.0003, 0.004) + Math.sin(TAU * 2400 * t) * env(t, 0.0005, 0.012) * 0.6)],
  pop: [0.14, (t) => Math.sin(TAU * (180 * t + 2400 * 0.025 * (1 - Math.exp(-t / 0.025)))) * env(t, 0.001, 0.05)],
  bloop: [0.16, (t) => Math.sin(TAU * (300 * t + 900 * t * t / 0.16)) * env(t, 0.002, 0.06)],
  tecla: [0.04, (t, r) => (r() * 2 - 1) * env(t, 0.0003, 0.006) * 0.8 + Math.sin(TAU * 1800 * t) * env(t, 0.0003, 0.008) * 0.3],
  tecleo: [0.5, (t, r) => { const k = Math.floor(t / 0.055), u = t - k * 0.055 - (k * 7 % 3) * 0.006; return (r() * 2 - 1) * env(u, 0.0003, 0.006) * (0.6 + 0.4 * ((k * 5) % 3) / 2); }],
  nivel: [0.42, (t) => { const k = Math.min(3, Math.floor(t / 0.07)), f = [523, 659, 784, 1047][k]; return cuadrada(f * t, 0.25) * env(t - k * 0.07, 0.002, k === 3 ? 0.14 : 0.05); }],
  moneda: [0.4, (t) => cuadrada((t < 0.07 ? 988 : 1319) * t, 0.5) * (t < 0.07 ? 1 : env(t - 0.07, 0.001, 0.12))],
  exito: [0.7, (t) => [523, 659, 784].reduce((a, f, i) => a + Math.sin(TAU * f * t) * env(t - i * 0.06, 0.002, 0.25), 0) * 0.5],
  error: [0.42, (t) => (cuadrada(196 * t, 0.5) + cuadrada(207 * t, 0.5)) * 0.5 * (t < 0.17 ? env(t, 0.002, 0.2) : env(t - 0.2, 0.002, 0.12))],
  alarma: [0.75, (t) => cuadrada((Math.floor(t / 0.125) % 2 ? 660 : 880) * t, 0.5) * Math.min(1, (0.75 - t) / 0.1)],
  salto: [0.18, (t) => cuadrada((300 + 2600 * t) * t, 0.5) * env(t, 0.002, 0.08)],
  tic: [0.04, (t) => Math.sin(TAU * 1500 * t) * env(t, 0.0005, 0.01)],
  golpe: [0.35, (t, r) => Math.sin(TAU * (45 * t + 160 * 0.04 * (1 - Math.exp(-t / 0.04)))) * env(t, 0.001, 0.12) + (r() * 2 - 1) * env(t, 0.001, 0.02) * 0.5],
  glitch: [0.28, (t, r) => cuadrada([220, 1760, 440, 3520, 880][Math.floor(t / 0.028) % 5] * t, 0.3) * (Math.floor(t / 0.014) % 3 ? 1 : 0) * 0.7 * Math.min(1, (0.28 - t) / 0.05)],
  whoosh: [0.5, null], // ruido filtrado (se hace aparte)
  brillo: [0.6, (t) => [1568, 2093, 2637, 3136].reduce((a, f, i) => a + Math.sin(TAU * f * t) * env(t - i * 0.05, 0.001, 0.12), 0) * 0.4],
};

export function efecto(nombre, salida) {
  const def = EFECTOS[nombre]; if (!def) throw new Error(`No hay efecto «${nombre}». Hay: ${Object.keys(EFECTOS).join(", ")}`);
  const [dur, fn] = def, r = azar(nombre.length * 131), x = new Float32Array(Math.round(dur * SR));
  if (nombre === "whoosh") {
    // ruido que pasa por un filtro que sube y baja (suena a aire)
    let y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const t = i / SR, u = t / dur, fc = 300 + 3200 * Math.sin(Math.PI * u), f = 2 * Math.sin(Math.PI * fc / SR), q = 0.35;
      const inp = r() * 2 - 1; y2 += f * y1; const hp = inp - y2 - q * y1; y1 += f * hp;
      x[i] = y1 * Math.pow(Math.sin(Math.PI * u), 1.5);
    }
  } else for (let i = 0; i < x.length; i++) x[i] = fn(i / SR, r);
  return wav(x, salida);
}

// Los efectos que faltan en la carpeta, creados de una vez. Devuelve la carpeta.
export function asegurarEfectos(carpeta) {
  for (const n of Object.keys(EFECTOS)) { const f = join(carpeta, `${n}.wav`); if (!existsSync(f)) efecto(n, f); }
  return carpeta;
}
