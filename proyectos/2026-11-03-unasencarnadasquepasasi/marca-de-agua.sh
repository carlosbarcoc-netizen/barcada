#!/bin/sh
# Marca de agua suave «@Azzure» abajo al centro: sh marca-de-agua.sh <entrada.mp4> <salida.mp4>
F=/home/user/barcoviral/fuentes/Poppins-ExtraBold.ttf
ffmpeg -loglevel error -y -i "$1" -vf "drawtext=fontfile=$F:text='@Azzure':fontsize=h*0.026:fontcolor=white@0.45:shadowcolor=black@0.25:shadowx=2:shadowy=2:x=(w-tw)/2:y=h*0.93" -c:a copy -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -movflags +faststart "$2"
