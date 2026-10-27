# Las imágenes (prompts) y las tomas

## El sujeto

`proyecto.json` → `sujeto`: una frase en inglés con lo que se repite en todo el video (el material, el lugar, la luz).
Se añade a todos los prompts para que las imágenes parezcan del mismo rodaje:
`"cacao beans and dark chocolate on a dark walnut table, warm side light"`.

## Un buen prompt de toma

En inglés, concreto y visual: **qué se ve + acción + encuadre + luz**. El estilo (`estilos/estilos.json`) se añade solo.

- Bien: `"extreme close-up of cocoa powder falling from a silver spoon, dust cloud backlit"`
- Mal: `"cocoa"` (vago) · `"a sign that says COCOA"` (texto: sale mal) · `"Nestlé factory"` (marca)

Reglas:
- **Una idea por imagen**, el sujeto grande y centrado (el tercio de arriba lo ocupan los subtítulos y abajo van los
  rótulos: lo importante, en el centro).
- **Nada de texto, logos, marcas ni personas reales** reconocibles. Manos, sí, sin caras.
- Procesos reales y posibles (una prensa, un molino, un horno), con materiales de verdad.
- Para comparar dos cosas: `"split composition, left: …, right: …"`.

## El movimiento

`acercar` (lo normal: entra en el detalle), `alejar` (revela el conjunto), `izquierda`/`derecha` (recorre algo
ancho), `subir`/`bajar` (algo alto o que cae), `quieto` (para un rótulo largo). Alterna: dos tomas seguidas con el
mismo movimiento se notan. `fuerza` (0,08-0,25) cambia cuánto se mueve (0,14 por defecto).

## El ritmo

- Una toma nueva cada 2-4 s, en la palabra que trae lo que se ve.
- Ninguna toma de menos de 1,5 s (la herramienta avisa).
- Rótulos solo cuando ayudan a entender un paso (`"GRANO → MOLIENDA → *PASTA*"`), 2-5 palabras, `|` para partir línea.

## Revisar la hoja de tomas

Antes de enseñarla, mira cada imagen: texto inventado, dedos de más, objetos fundidos, algo que no es lo que dice la
voz o que parece otra cosa → `node bv.mjs otra <proyecto> <n>` o mejora el prompt. `"calidad": "alta"` en
`proyecto.json` usa el modelo más realista (cuesta más por imagen): úsalo en el final si el usuario quiere el máximo.

Si el usuario tiene una foto propia para una toma (su producto, su finca), ponla en el proyecto y en la toma
`"archivo": "mi-foto.jpg"`.
