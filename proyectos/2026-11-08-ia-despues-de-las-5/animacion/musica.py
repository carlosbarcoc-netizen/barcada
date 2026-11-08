#!/usr/bin/env python3
"""Base instrumental suave (sin letra) + whoosh suaves en los cortes; sube en la escena 5.
Uso: musica.py salida.wav DURACION inicio_cierre corte1,corte2,..."""
import sys, numpy as np, soundfile as sf
out_path, T, up = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
cuts = [float(c) for c in sys.argv[4].split(",")]
sr = 44100; n = int(sr * T); L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(3)
bpm = 96; beat = 60 / bpm; bar = beat * 4
def add(sig, at, g=1.0, pan=0.0):
    i = int(at * sr); j = min(n, i + len(sig))
    if j <= i: return
    L[i:j] += g * (1 - pan) * sig[:j - i]; R[i:j] += g * (1 + pan) * sig[:j - i]
def hz(m): return 440 * 2 ** ((m - 69) / 12)
# Am - F - C - G (cálido, optimista)
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
bass = [45, 41, 48, 43]
for b in range(int(T / bar) + 1):
    t0 = b * bar; c = chords[b % 4]; Ln = int(bar * sr * 1.1); tl = np.arange(Ln) / sr
    env = np.minimum(1, tl / 0.6) * np.exp(-tl * 0.25)
    pad = sum(np.sin(2 * np.pi * hz(m) * tl + .4 * np.sin(2 * np.pi * .3 * tl)) + .25 * np.sin(2 * np.pi * hz(m) * 2.003 * tl) for m in c)
    add(pad * env * 0.045, t0, pan=-.1)
    add(np.sin(2 * np.pi * hz(bass[b % 4]) * tl) * np.minimum(1, tl / .05) * np.exp(-tl * 1.2) * 0.22, t0)
    # arpegio suave en corcheas (pluck)
    arp = [c[0] + 12, c[1] + 12, c[2] + 12, c[3] + 12, c[2] + 12, c[1] + 12, c[2] + 12, c[3] + 12]
    for k, m in enumerate(arp):
        at = t0 + k * beat / 2; Lp = int(.6 * sr); tp = np.arange(Lp) / sr
        pl = (np.sin(2 * np.pi * hz(m) * tp) + .3 * np.sin(2 * np.pi * hz(m) * 2 * tp)) * np.exp(-tp * 7) * np.minimum(1, tp / .004)
        late = at >= up
        add(pl * (0.07 if late else 0.045), at, pan=.25 if k % 2 else -.25)
    # pulso muy suave (bombo blando + shaker) — solo desde el segundo compás
    if b >= 1:
        for k in range(4):
            at = t0 + k * beat; Lk = int(.3 * sr); tk = np.arange(Lk) / sr
            add(np.sin(2 * np.pi * (48 + 50 * np.exp(-tk * 25)) * tk) * np.exp(-tk * 10) * 0.18, at)
            sh = rng.standard_normal(int(.06 * sr)) * np.exp(-np.arange(int(.06 * sr)) / sr * 60)
            sh = np.convolve(sh, [1, -1], 'same')
            add(sh * 0.035, at + beat / 2, pan=.3)
# capa brillante en el cierre
tl = np.arange(n) / sr
shine = sum(np.sin(2 * np.pi * hz(m) * tl) for m in [76, 79, 84]) * 0.018
shine *= np.clip((tl - up) / 1.5, 0, 1)
L += shine; R += shine
# whoosh suaves en los cortes
for c in cuts:
    Lw = int(.4 * sr); F = np.fft.rfft(rng.standard_normal(Lw)); fr = np.fft.rfftfreq(Lw, 1 / sr)
    w = np.fft.irfft(F * np.exp(-((fr - 1800) / 2000) ** 2), Lw); w /= np.abs(w).max()
    add(w * np.sin(np.pi * np.arange(Lw) / sr / .4) ** 2 * .12, c - .22)
# envolvente general: entra rápido, sube en el cierre (+5 dB), sale al final
g = np.clip(tl / 0.4, 0, 1) * (1 + 0.78 * np.clip((tl - up) / 1.2, 0, 1)) * np.clip((T - tl) / 1.6, 0, 1)
L *= g; R *= g
m = max(np.abs(L).max(), np.abs(R).max())
sf.write(out_path, np.stack([L, R], 1) / m * .9, sr)
print("ok", out_path)
