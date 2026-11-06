# Barcada 2.0 · el modo juego

El reel se cuenta como **una partida**: hay una barra que se llena, un personaje que eres «tú», un mundo que no se
corta y una recompensa al final. Es el estilo por defecto de los videos nuevos (`preferencias.json` → `"piel"`).
Funciona con el mismo flujo de siempre (`METODO.md`): guion → voz → tomas → borrador → final. Todo se dibuja y suena en
tu computadora: no hay que pagar imágenes, ni música, ni efectos.

## Las tres pieles

| Piel | Se ve | Para | Firma visual |
|---|---|---|---|
| `neon` | Negro azulado con cuadrícula fina, cian eléctrico, letras Poppins y Space Mono | Tecnología, procesos, «cómo funciona», «lo que nadie te explica» | Barra de **chips** arriba (`TU SERVIDOR · 24 H · LLAVE · IP · 2/4`), título a la izquierda con la **palabra resaltada en una caja**, subtítulos con la palabra que suena en cian y lo que falta en gris |
| `voxel` | Cielo claro, **islas flotantes** de bloques, nubes cuadradas, letra Lilita One con contorno | Listas de N partes, mapas, «dónde vive…», «las 6 piezas de…»; alegre y familiar | Título gordo centrado, **fichas numeradas** abajo que se llenan de color (`TU APP VIVE EN: 3/6`), la cámara viaja de isla en isla |
| `arcade` | Pixel art de 8 bits, azul noche con estrellas, rayos, tele de tubo | Retos, «gratis antes de que acabe este video», ricos contra tú, trucos | **HUD** arriba (nombre · barra en % · `TIEMPO 48` que baja), **cuadro de diálogo** abajo con el texto a máquina, pantallas de `WARNING`, `VS` y `¿CONTINUAR?` |

Elige la piel por el tema (si el usuario no la pide): tecnología/proceso → `neon`; lista o mapa de partes → `voxel`;
reto, duelo o «antes de que acabe» → `arcade`. Usa la misma piel en todo el video.

## Lo que hace viral este formato (y cómo se pide)

1. **Una barra que se llena** (`juego.progreso`): el cerebro quiere ver el 4/4. Cada paso se enciende en la palabra que
   lo nombra (`"en": "5:alquilas"`) con su sonido de «nivel». 3 a 6 pasos, con nombres de 1-2 palabras.
2. **«Tú» es el personaje** (`personaje`): un cubo con cara que vive lo que cuenta la voz. Siempre el mismo color en
   todo el video; los rivales o ayudantes, de otro color (`robot` para la IA).
3. **Metáforas con nombre:** cada concepto técnico es un sitio o un objeto de casa: «el taller» (el código), «el
   archivo» (las versiones), «el escaparate» (la web), «la cocina» (el servidor), «el almacén» (los datos), «la llave»
   (la clave). Se anuncian con número: `1 · EL TALLER`.
4. **Un mundo, no cortes:** las piezas siguen en su sitio y la cámara se mueve o el título cambia. En `voxel`, pon las
   islas en `juego.mundo` y mueve solo la cámara. En `neon`, la misma escena va sumando piezas.
5. **El problema, en rojo:** la toma del dolor lleva `"alerta": true` (pantalla roja, sacudida y sonido de error) o el
   título con `!PALABRA!` en rojo («…y tu agente !SE MUERE!»).
6. **Un reloj en contra:** en `arcade`, el `TIEMPO` baja con el video; promete algo «antes de que acabe este video».
7. **El giro:** a 2/3 del video, `advertencia` (WARNING) o `vs` en `arcade`; `alerta` en `neon`.
8. **El final vuelve al principio:** la última escena repite la primera, pero arreglada («Cierras el portátil… y tu
   agente sigue !DESPIERTO!»). Bucle perfecto: se ve dos veces.
9. **El CTA de palabra:** «Comenta "IA" y te paso…» con la pieza `cta` (o `continuar` en `arcade`, con la cuenta atrás).
   Solo si el usuario tiene algo que enviar; si no, su cierre de `preferencias.json`.

## proyecto.json

```json
{
  "titulo": "Tu servidor en 4 pasos",
  "estilo": "2d",
  "frases": [ { "texto": "Cierras el portátil… y tu agente se muere.", "clave": "muere" } ],
  "juego": {
    "piel": "neon",
    "progreso": { "titulo": "TU SERVIDOR", "pasos": [
      { "texto": "24 H", "en": "4:alquilas" }, { "texto": "LLAVE", "en": "7:llave" },
      { "texto": "IP", "en": "9:direccion" }, { "texto": "UBUNTU", "en": "11:ubuntu", "apaga": "12:borras" } ],
      "final": { "texto": "VIVO", "en": "14:despierto" } },
    "tiempo": true,
    "firma": "@tucuenta",
    "mundo": { "camara": [[0, { "zoom": 1 }]], "elementos": [ { "pieza": "isla", "x": 300, "y": 1100 } ] }
  },
  "escenas": [ { "nombre": "partida", "tomas": [
    { "desde": 0, "titulo": "Cierras el *portátil*…|…y tu agente !SE MUERE!", "tituloEn": [0, "1:agente"],
      "dibujo": { "elementos": [
        { "pieza": "personaje", "x": 300, "y": 1150, "cara": "normal" },
        { "pieza": "dispositivo", "tipo": "laptop", "x": 650, "y": 1100, "pantalla": "IA" },
        { "pieza": "pulso", "x": 540, "y": 800, "titulo": "AGENTE", "params": { "estado": [[0, "vivo"], ["1:muere", "muerto"]] } } ] } },
    { "desde": "1:muere", "alerta": true, "dibujo": { "elementos": [] } }
  ] } ]
}
```

- `juego.progreso`: `titulo` (neón y arcade) o `etiqueta` (bloques: «TU APP VIVE EN:»), `pasos` (con `en` y, si se
  pierde, `apaga`), y `final` (todo en verde, con su texto y su sonido).
- `juego.tiempo` (arcade): la cuenta atrás con los segundos que quedan. `false` la quita.
- `juego.firma`: tu cuenta abajo (por defecto, la de `preferencias.json` → `redes` o `marca`). Tu foto: guárdala en la
  carpeta y pon su nombre en `preferencias.json` → `"avatar": "mi-foto.jpg"`; si no, salen tus iniciales.
- `juego.musica` / `juego.sonidos`: `true` por defecto. La música la compone el sintetizador para la piel (original,
  sin derechos de nadie) y baja sola cuando habla la voz. Si el usuario tiene su música (`preferencias.json` →
  `musica`), se usa esa. `juego.semilla`: otro número = otra melodía.
- `juego.mundo`: piezas que están en **todas** las tomas (las islas, el escenario); sus tiempos en número cuentan desde
  el principio del video. Su `camara` vale para las tomas que no traen la suya.
- En cada toma: `titulo` (`|` = otra línea, `*x*` resaltado, `!x!` en rojo; se hereda hasta que otra toma lo cambie,
  y `""` lo quita), `tituloEn` (cuándo entra cada línea), `subtitulo` (la línea pequeña de debajo), `alerta`, `sacude`.
- Los subtítulos y los títulos se dibujan dentro del cuadro (no hace falta `rotulo`). El fondo, si no se pone, es el
  de la piel.

## Dónde va cada cosa (1080 × 1920)

| | neon | voxel | arcade |
|---|---|---|---|
| HUD / barra | y 150-235 | fichas y 1440-1650 | y 168-245 |
| Título | y 270-560 (izquierda) | y 150-450 (centro) | y 290-500 (centro) |
| **Escena (lo importante)** | **y 600-1380** | **y 520-1380** | **y 560-1370** (suelo de las salas en 1250-1300) |
| Subtítulos | y 1450-1620 | y 1230-1420 (encima de la escena) | cuadro y 1400-1640 |
| Firma | y 1690-1760 | y 1690-1770 | y 1690-1750 |

## Las piezas del modo juego

Se adaptan solas a la piel (en neón brillan, en bloques tienen cara de arriba y lado, en arcade llevan contorno de
píxel). Todas aceptan lo de siempre: `x`, `y`, `escala`, `entra`, `en`, `sale`, `hasta`, `accion`, `mueve`, `params`.
Muestrario: `node barcada.mjs muestrario neon` (o `voxel`, `arcade`).

| Grupo | Piezas | Parámetros |
|---|---|---|
| **Personajes** | `personaje` (el cubo: «tú»), `robot` (la IA) | `cara` normal/feliz/triste/sorprendido/asustado/dormido/enfadado/guino · `color` (blanco, cafe, cacao, naranja, azul, rosa, verde, morado…) · `gorro` casco/gorra/corona · `gafas` sol/nerd · `antena` · `brazo` saluda/arriba · `camina` · `habla` — robot: `cara` normal/feliz/error/dormido/corazon, `brilla` |
| **Texto y marcadores** | `letrero`, `cifra`, `dialogo`, `cta`, `barra`, `sello` | `texto`, `estilo` caja/plano/pildora/sello · `valor` (cifra y barra: se anima) `antes`/`despues` · `cola` · `palabra`/`texto`/`boton` · `cuenta` |
| **Iconos de píxel** | `icono`, `muchos` | `nombre`: correo, calendario, llave, candado, corazon, estrella, moneda, rayo, check, equis, pregunta, exclama, reloj, dinero, casa, carpeta, cohete, fuego, chispa, mundo, bombilla, cerebro, telefono, regalo, bandera · `n` (se anima: 3 → 40 correos) |
| **Interfaz** | `ventana`, `terminal`, `edificio`, `servidor`, `puerta`, `candado`, `llave`, `chip`, `pulso`, `dispositivo`, `linea`, `balanza`, `esfera`, `temporizador`, `paquete`, `libros` | `terminal.texto` se escribe solo · `edificio.resalta/placa/cartel/base` · `puerta.cartel/abierto` · `pulso.estado` vivo/muerto · `dispositivo.tipo` celular/laptop/monitor/tablet · `linea.dx/dy/dibuja` · `balanza.inclina/izq/der` |
| **Mundo de bloques** | `isla`, `nubebloque`, `cubo`, `arbolbloque`, `tienda`, `escritorio`, `cofre`, `pedestal`, `estante`, `cajas`, `app` | `isla.ancho` · `tienda.letrero` · `cofre.abierto` · `pedestal.icono` · `estante.n` · `cajas.items/n` |
| **Salón arcade** | `maquina`, `monitor`, `ficha`, `mejora`, `advertencia`, `vs`, `continuar` | `monitor.texto/sello` · `ficha.filas/n` (se rellena) · `mejora.titulo/texto/icono` · `advertencia` y `vs` en x 540 y 960 (pantalla entera) · `continuar.n` |
| **Efectos** | `rayos`, `confeti`, `explosion` | detrás de lo importante (`capa` -1) o al celebrar |

Fondos: `neon` (`fondoOpts.tono`: rojo/verde), `bloques` (`fondoOpts.noche: true`), `arcade` (`fondoOpts.rayos:
true`), `arcade-sala`, `arcade-atardecer`, `arcade-escenario`. Los de siempre (estudio, cocina…) también valen.

## El sonido (automático)

Sin escribir nada, el video ya suena como un juego:
- **Música** de la piel (neón: synth tecnológico · bloques: cuerdas pulsadas y marimba · arcade: chiptune), con la voz
  por encima (baja sola cuando se habla).
- **Efectos:** en cada corte (whoosh o blip), cuando entra una pieza (clic, bloop o blip), cuando se escribe un título
  (tecleo), cuando se enciende un paso (nivel o moneda), en la alerta (error o alarma) y al completar todo (éxito).
- Para uno concreto, en la pieza: `"sonido": "moneda"` (o `false` para que no suene). Efectos: blip, clic, pop, bloop,
  tecla, tecleo, nivel, moneda, exito, error, alarma, salto, tic, golpe, glitch, whoosh, brillo (y los de tu
  biblioteca de ElevenLabs).

## Reglas para que se vea como las referencias

- **Una acción por frase:** algo entra, se enciende o cambia en la palabra que lo nombra.
- **Pocas piezas y grandes:** el personaje + 1-2 objetos. Mucho aire negro (neón) o cielo (bloques).
- **Los títulos cortos** (2-6 palabras por línea, máximo 2 líneas) y con UNA palabra resaltada.
- **Los números corren** (`cifra` o `barra` con `params`), nunca aparecen hechos.
- **Los mismos colores siempre:** «tú» = blanco (o el del usuario); lo malo = rojo; lo logrado = verde.
- **Nada de logos ni marcas reales** dibujados: los nombres de herramientas van como texto (`letrero`), sin logo.
- Revisa la hoja de tomas: que el título no tape la escena, que el subtítulo se lea y que nada se salga del cuadro.
