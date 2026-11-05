# ¿Cada cuánto debes hacerte el pedicure? (Azurre_estudiodebelleza)

Estado del proyecto (se actualiza en cada paso).

- [x] 1. Investigación → notas.md
- [x] 2. Guion aprobado (guion del usuario, tal cual)
- [x] 3. Voz → voces.mjs (tres voces: narradora Linda Gómez, la señora Valentina, los pies El Boga)
- [x] 4. Tomas (13, en 2D, con piezas propias: piezas-extra.mjs) → revisar/tomas.jpg
- [x] 5. Borrador → revisar/borrador.mp4 (pendiente del visto bueno del usuario)
- [x] 6. Final → entrega/video.mp4 (1080×1920), entrega/video-4k.mp4 (reescalado), descripciones.md

Este video es distinto a los demás (varias voces, marca de agua, piezas propias). Se rehace así, desde la carpeta de
Barcada:
- `node proyectos/2026-11-05-pedicurecadacuanto/voces.mjs` (solo pide a ElevenLabs las frases que cambiaron)
- `node proyectos/2026-11-05-pedicurecadacuanto/escenas.mjs` tras editar las tomas
- `node proyectos/2026-11-05-pedicurecadacuanto/hacer.mjs tomas | borrador | final`

Música (musica.mp3) y efectos alarma/boing creados con ElevenLabs en la cuenta del usuario (audio-extra.mjs).

Para seguir en otra conversación: «sigue el proyecto 2026-11-05-pedicurecadacuanto».
