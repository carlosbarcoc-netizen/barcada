# Cómo se hace un video con Barco Viral

Seis pasos. El usuario decide en tres (✋). Marca cada paso en el `SEGUIR.md` del proyecto al terminarlo.

## 1. La idea y los datos

1. `node bv.mjs nuevo "<la idea>" --estilo <el de sus preferencias o el que pida el tema>`.
2. Investiga en la web hasta la fuente original. En `notas.md`, cada dato con su enlace, y debajo:
   - **Lo que sorprende** (lo que contradice lo que la gente cree).
   - **El proceso o la causa, paso a paso** (es lo que se va a ver).
   - **Una o dos comparaciones con cosas de casa** («del tamaño de un grano de arroz»).
   - **El video en una frase.** Lo que no sirva a esa frase, fuera.

## 2. El guion ✋

Lee `guias/guion.md`. En `proyecto.json` → `frases`: de 8 a 14 frases, 130-170 palabras en total (≈ 50-60 s), cada una
con su `clave` (la palabra que se resalta). La primera es el gancho. La última, el cierre de sus preferencias.

Enséñale el guion numerado y, debajo, en una línea, la primera imagen. **Espera su visto bueno.** Si el usuario trae
su propio texto, ese es el guion: solo avisa si algo es falso o si dura más de 60 s, y propón la versión recortada.

## 3. La voz

`node bv.mjs voz <proyecto>`, **una vez**, con el guion aprobado (cada vez cuesta créditos). Imprime cada palabra con
su segundo: con eso se colocan las tomas. Si una frase suena mal, se cambia la frase y se rehace (`--rehacer`).

## 4. Las tomas ✋

Lee `guias/imagenes.md`. En `proyecto.json` → `sujeto` y `escenas[].tomas[]`:
- una toma cada **2-4 s**, que empieza en la palabra que trae lo que se ve (`"desde": "3:prensa"`);
- su `imagen` (prompt en inglés), su `movimiento` y, si ayuda a entender, su `rotulo` corto (`"PASTA → *COCOA*"`);
- un `sonido` de la biblioteca si algo pasa con fuerza (`impacto`, `crujido`, `vertido`…).

`node bv.mjs tomas <proyecto>` genera las imágenes y la hoja `revisar/tomas.jpg`. **Mírala tú primero**: si una imagen
tiene texto, deformaciones, manos raras o no se entiende, `node bv.mjs otra <proyecto> <n>` (o mejora su prompt). Luego
enséñasela al usuario y **espera su visto bueno**. Cambiar una imagen aquí cuesta centavos; después, mucho más.

## 5. El borrador ✋

`node bv.mjs borrador <proyecto>` (≈ 1 min). Míralo: extrae 4-6 fotogramas con ffmpeg y revisa que el subtítulo se
lea, que ningún rótulo tape lo importante, que cada imagen llegue con lo que dice la voz y que no haya tomas de menos
de 1,5 s. Enséñaselo y **espera su visto bueno**. Junta todos sus cambios en una sola ronda.

Mientras lo mira, prepara:
- **La portada:** `node bv.mjs portada <proyecto> "Título con *clave*|segunda línea" --toma <la más fuerte>`
  (`guias/portadas-y-textos.md`).
- **Las descripciones** de cada red en `entrega/descripciones.md` (misma guía).

## 6. El final

`node bv.mjs final <proyecto>` → `entrega/video.mp4`. Entrega en un mensaje: el video, la portada y las descripciones
listas para copiar. Apunta el tema en `temas-usados.md`. Propón en 2 líneas qué guardar en `aprendido.md` (solo con
su visto bueno).
