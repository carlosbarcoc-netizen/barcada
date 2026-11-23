# Videos largos para YouTube (16:9, mínimo 8 minutos)

Cuando el usuario pide un video **para YouTube** (no un reel ni un Short), se hace así, sin preguntar el estilo:
**horizontal 1920 × 1080, 8 minutos o más, estilo realista con fotos reales de Pexels** y la voz de sus preferencias
(`preferencias.json` → `youtube`). Los reels y Shorts siguen siendo verticales y en modo juego (`guias/juego.md`).

Mismo flujo de siempre (`METODO.md`), con estos cambios:

## 1. El proyecto

```
node barcada.mjs nuevo "<la idea>" --estilo documental --formato horizontal --nombre <tema>-youtube
```

Nunca `--piel`: el modo juego y el 2D son solo verticales.

## 2. El guion ✋

- **1.350-1.500 palabras** (≈ 8,5-9 min con la voz a velocidad 1,1). Por debajo de 1.300 no llega a 8 minutos.
- **Máximo 9.500 caracteres** en total (lo dicho): ElevenLabs no acepta más de 10.000 en una sola voz.
- 80-100 frases, cada una con su `clave`, agrupadas en bloques con título (gancho, qué es, paso 1…, errores
  comunes, resumen, cierre). Guárdalo también en `guion.md` con los bloques, para enseñárselo al usuario.
- El gancho igual que en un reel (≤ 6 s); una pregunta al público a mitad («déjamelo en los comentarios»).
- Los números con decimales van en `dicho` («uno coma treinta y cuatro») y «pH» se dice «pe hache».

## 3. La voz

`node barcada.mjs voz <proyecto>` (una vez). Avisa al usuario de cuántos caracteres gasta.

## 4. Las tomas ✋ · fotos de Pexels

Si no hay clave de imágenes IA (lo normal), las imágenes son **fotos libres de Pexels**:

1. Busca con la búsqueda web limitada a `pexels.com` («pexels photo strawberry jam jar», «pexels photo digital
   scale weighing»…). Cada foto tiene un número al final de su dirección: `pexels.com/photo/…-1435296/`.
2. Descárgalas: `node barcada.mjs pexels <proyecto> 1435296 5964491 …` → `imagenes/pexels-<n>.jpg` y su crédito
   en `notas.md` (no hace falta clave).
3. **Mira cada foto antes de usarla** (haz una hoja de contacto con ffmpeg): fuera las que tengan **caras
   reconocibles**, **marcas, logos o etiquetas con texto**, o que no se entiendan.
4. Unas 30-40 fotos distintas bastan: una toma por frase (`"desde": <n.º de frase>`), y una misma foto puede volver
   con otro `movimiento`, pero nunca dos veces seguidas. `"fuerza": 0.1` (movimiento suave).
5. En cada toma: `"archivo": "imagenes/pexels-<n>.jpg"`, `"imagen": "Pexels <n>"` y un `rotulo` corto con la cifra o
   el paso («PASO 1 · El *límite*», «10 g × 1,34 = *13,4 g*»). En horizontal, los rótulos salen arriba y los
   subtítulos abajo.

`node barcada.mjs tomas <proyecto>` → `revisar/tomas.jpg` para que lo apruebe.

## 5. El borrador ✋

`node barcada.mjs borrador <proyecto>` (≈ 8 min para un video de 8 min). Revisa 6 fotogramas repartidos.

Mientras lo mira:
- **Portada** (miniatura 16:9): `node barcada.mjs portada <proyecto> "Título|con *clave*" --toma <n> --etiqueta "…"`.
- **Descripción** en `entrega/descripciones.md`: título (≤ 100 caracteres, palabra clave primero), descripción con
  la fórmula o la idea clave, **capítulos con su minuto** (sácalos de `voz/tiempos.json`: el inicio de la primera
  frase de cada bloque; el primero es 0:00), fuentes, «Imágenes: Pexels (licencia libre)», el cierre y 3-5
  hashtags; etiquetas; comentario fijado; categoría (Educación) y si es contenido sintético.
- Si lo pide, el **prompt para ChatGPT** de la miniatura (16:9, título centrado con su palabra resaltada, sin caras
  ni marcas).

## 6. El final

`node barcada.mjs final <proyecto>` → `entrega/video.mp4` a 1920 × 1080 (≈ 25 MB por minuto).
