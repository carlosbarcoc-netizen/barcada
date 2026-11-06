# Tu Jarvis gratis con OpenJarvis

Estado del proyecto (se actualiza en cada paso).

- [x] 1. Investigación → notas.md
- [x] 2. Guion aprobado
- [x] 3. Voz
- [x] 4. Tomas aprobadas (revisar/tomas.jpg)
- [x] 5. Borrador aprobado
- [x] 6. Final, portada y descripciones entregados

Para seguir en otra conversación: «sigue el proyecto 2026-11-06-tujarvisgratisconopenjarvis».

Nota: marca de agua grande en el centro (pedida por el usuario). Se pone encima del video con ffmpeg después de `final`:
`ffmpeg -i entrega/video-sin-marca.mp4 -vf "drawtext=fontfile=../../fuentes/Poppins-ExtraBold.ttf:text='@carlosbarcoc':fontsize=w*0.105:fontcolor=white@0.38:borderw=4:bordercolor=black@0.28:x=(w-tw)/2:y=(h-th)/2" -c:a copy entrega/video.mp4`
