# El modo largo (8 minutos o más, YouTube 16:9)

Para historias que se escuchan enteras: vidas de santos, pasajes del Evangelio, biografías. Es el 2D con volumen
(`guias/2d.md`) con las piezas y fondos de historia bíblica, en **horizontal 1920 × 1080** (`formato: "horizontal"`,
lo normal para YouTube) o en vertical 1080 × 1920 (`--vertical`), a 24 cuadros por segundo.

**Lo barato:** las imágenes se dibujan con código ($0). Solo se paga la voz de ElevenLabs: unas 1.100-1.300 palabras
(≈ 7.000-8.500 letras) por cada 8 minutos. La música la compone el sintetizador (estilo `calma`, sin derechos de nadie).

**Lo que aprueba el usuario: dos cosas.** El guion (por capítulos) y el video final. Las tomas y el borrador los revisas
tú: extrae fotogramas, mira la hoja de tomas y corrige antes de enseñar nada.

## Los pasos

1. `node barcada.mjs nuevo "<idea>" --largo`. En `proyecto.json` pon la `marcaAgua` (la cuenta: `@…`, sin espacios).
2. Investiga y escribe `notas.md` como siempre. En historias de fe: lo que dice la Biblia, con su cita (Mt 1,18-25);
   lo que viene de la tradición o de los apócrifos, dicho como tal («según la tradición…»). Nada inventado.
3. **El guion ✋**: 4 a 7 capítulos, cada uno con su título (`capitulos`: `{ "titulo", "desde": n.º de frase }`).
   Unas 110-160 frases de 8-16 palabras. Gancho en la primera frase; al final de cada capítulo, una frase que abra el
   siguiente. El cierre, el del usuario. Enséñalo por capítulos, con los minutos aproximados (≈ 150 palabras por minuto).
4. `node barcada.mjs voz <proyecto>`: se pide por bloques de ~2.500 letras; si se corta, al repetirla no se vuelve a
   pagar lo que ya estaba (`voz/partes/`).
5. Las tomas: una cada **4-7 s** (≈ 90-110 para 8 minutos), por escenas (una por capítulo). Cada toma, con su `dibujo`
   (`guias/2d.md`). `node barcada.mjs tomas <proyecto>` y **mira tú** `revisar/tomas.jpg`; arregla lo que no se entienda.
6. `node barcada.mjs borrador <proyecto> --hasta 60` (el primer minuto, para revisar ritmo y textos) y luego
   `node barcada.mjs final <proyecto>` (≈ 4 min de dibujo por cada minuto de video). Saca 6-8 fotogramas y revísalos.
7. Entrega: el video, la portada, el título, la descripción con los capítulos (`entrega/capitulos.txt`) y las etiquetas.

## Lo propio del modo largo (`proyecto.json`)

- `largo: true` · `formato: "horizontal"` · `marcaAgua: "@cuenta"` (arriba a la derecha en horizontal, abajo en vertical) · `sintetizar: "calma"` · `musicaDb: -24`
- `efectos: false` (sin «whoosh» en cada corte: en un video largo cansan). En horizontal los subtítulos van abajo al
  centro y los rótulos arriba; en vertical, los rótulos bajo los subtítulos (`rotulos: "abajo"` para cambiarlo).
- `voz`: más pausada que en los reels (`estabilidad` 0,5, `estilo` 0,3, `velocidad` 1,0). Tono cálido y cercano, como
  quien cuenta una historia que quiere.

## Las piezas de historia bíblica (`nucleo/2d/piezas-biblia.mjs`)

Muestrario: `node barcada.mjs muestrario biblia` → `muestrario/biblia-*.jpg` (las escenas en horizontal:
`node nucleo/2d/muestrario-biblia.mjs muestrario horizontal`).

| Grupo | Piezas | Parámetros |
|---|---|---|
| Personajes | `jose`, `maria`, `jesus` (`edad` bebe/nino/adulto), `angel`, `pastor`, `rey`, `anciano`, `mago` | `pose` quieta/camina/reza/carga/saluda/senala/abre/trabaja/duerme · `lleva` nino/tablas/lampara/paloma/rollo/cofre · `aureola` 0-1 · `mira` -1 · `boca` habla/seria · `ojos` cerrados |
| Animales | `burro` (`carga` maria/maria_nino/bultos, `camina`), `oveja`, `paloma` (`vuela`), `camello` (`camina`) | |
| Taller | `martillo`, `serrucho`, `tablas`, `banco`, `silla` | `giro`, `n`, `largo` |
| Lugares y cosas | `casaadobe` (`luz`), `pesebre` (`nino`, `luz`), `estrella` (`cola`), `haz` (luz del cielo), `piramide`, `palmera`, `olivo`, `templo`, `lampara`, `pergamino` (`texto`), `lirio`, `vara` (`florece`), `cofrecito`, `corona`, `cruz`, `corazones`, `zzz`, `nubesueno` (`dentro`: otra pieza), `rotulo` (`texto`: lugares) | |

Fondos: `nazaret`, `camino`, `desierto`, `egipto`, `belen`, `establo`, `taller`, `templo`, `casanoche`, `gloria`.

- Las piezas que pisan (personajes, animales, casas, árboles) tienen la base **300 px × escala por debajo de su «y»**.
  - **Horizontal (1920 × 1080):** el horizonte está en y 864. Para que pisen en y ≈ 960: `y = 960 − 300 × escala`
    (escala 1 → y 660; escala 0,85 → y 705). Lo principal entre x 400 y 1520; tres o cuatro piezas como mucho.
    Los objetos del cielo (estrella, nube del sueño) arriba, entre y 150 y 450. Cámara: `x` 960, `y` 540 en reposo.
  - **Vertical (1080 × 1920):** `y` ≈ 1350-1450 y escala 1,1-1,3.
- Los sueños: `jose` con `pose: "duerme"` + `nubesueno` con `dentro: "angel"` encima.
- Los viajes: `burro` con `carga: "maria"` (o `maria_nino`) y `camina: true`, y `jose` con `pose: "camina"` al lado.
- Nada de violencia gráfica: lo duro (la matanza de los inocentes, la cruz) se cuenta con la voz y se enseña con un
  símbolo (una `lampara` que se apaga, la `cruz` sola, un `haz` de luz).
