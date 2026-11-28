# El significado del número tres en la Biblia

Estado del proyecto (se actualiza en cada paso).

- [x] 1. Investigación → notas.md
- [x] 2. Guion aprobado
- [x] 3. Voz (4 partes, cálida: estabilidad 0.5, estilo 0.25, velocidad 1.0; unidas en voz/tiempos.json; voz/voz.wav se rehace uniendo partes/p*/voz/voz.mp3 con 0,5 s de silencio)
- [ ] 4. Tomas aprobadas (revisar/tomas.jpg)
- [ ] 5. Borrador aprobado
- [ ] 6. Final, portada y descripciones entregados

Para seguir en otra conversación: «sigue el proyecto 2026-11-28-numero-tres-biblia».

## Decisiones
- Marca: @tiempoparaDios (no la de preferencias): marca de agua suave centrada (se pone al final con ffmpeg), sin firma abajo.
- Sin subtítulos (`subtitulos: false`). Duración ≥ 10 min.
- La voz de ElevenLabs acepta ~10.000 caracteres por pedido: el video se hace en 4 partes (proyectos hermanos) que se unen al final.
- Guion: guion.md (aprobado).
- Formato HORIZONTAL 1920×1080 (el usuario no quiere vertical). Montaje propio en horizontal/: escenas.mjs (tomas), dibujos.js, render.mjs (hoja | borrador | final), portada.mjs.
- Tomas: revisar/tomas-1..3.jpg. Portada y descripciones en entrega/. Pendiente: aprobar borrador y `node render.mjs final`.
