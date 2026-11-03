# El guion

Un reel se ve hasta el final si cada frase trae algo que el que mira no esperaba, y se comparte si al final entiende
algo nuevo. Escribe para el oído y para el ojo a la vez: cada frase tiene que poder enseñarse con una imagen.

## El gancho (las 1-2 primeras frases, ≤ 6 s)

Tiene que decir **de qué va el video** con el nombre de la cosa, como lo diría la gente. Fórmulas que funcionan:
- La pregunta que todos se han hecho: «¿Por qué el café te quita el sueño?»
- El mito roto: «El chocolate no nació en México.»
- Lo que parece imposible: «Esta fruta crece pegada al tronco.»
- La cifra con algo de casa: «Una taza de café necesita 140 litros de agua.»

Evita: empezar con fechas, lugares o «en este video te cuento»; frases tibias («uno de los más…»); hablar de ti.

## El tono de Barcada: movido, alegre y cercano

La voz no narra un documental: **te lo cuenta un amigo emocionado**. Para que suene así, el guion ayuda tanto como la
voz:
- Háblale a **una** persona, de tú: «¿Tú sabías…?», «Mira esto», «Imagínate que…», «Ojo con esto».
- Frases cortas y con ritmo (6-12 palabras). Mejor dos frases cortas que una larga con comas.
- Exclamaciones y preguntas donde haya sorpresa: «¡Noventa y cinco miligramos!», «¿Y sabes qué pasa?».
- Conectores de conversación: «pero ojo», «y aquí viene lo bueno», «o sea», «¿ves?».
- Nada de tono de noticiero ni de palabras de libro («asimismo», «cabe destacar», «se procede a»).
- Los puntos y comas de más hacen pausas largas: úsalos solo donde quieras que respire.

La voz se pide con más energía por defecto (`estabilidad` 0,32, `estilo` 0,55, `velocidad` 1,1). Si en algún video
suena exagerada, se baja `estilo` en `proyecto.json` → `voz`; si suena lenta, `velocidad` hasta 1,2.

## El cuerpo

- Frases cortas (8-16 palabras), como se habla. Conectores: «pero», «por eso», «así que».
- Cada frase responde lo que dejó la anterior y abre la siguiente.
- Un paso del proceso por frase. Las listas, de 3 cosas como mucho.
- Cada cosa siempre con el mismo nombre.
- Los números, como se dicen («dos millones y medio»). Si algo se pronuncia distinto de como se escribe, va en
  `dicho` (lo que lee la voz), y `texto` es lo que sale en el subtítulo.

## El remate y el cierre

- El remate responde del todo al gancho, en una frase que se pueda repetir.
- El cierre es el de `preferencias.json`, tal cual.

## La clave de cada frase

Una palabra por frase, la que importa (`clave`). Leídas seguidas, las claves cuentan el video.
