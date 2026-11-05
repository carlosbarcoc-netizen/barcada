// Escribe las escenas (tomas 2D) en proyecto.json. Se edita aquí y se corre: node escenas.mjs
import { readFileSync, writeFileSync } from "node:fs";
const P = new URL("./proyecto.json", import.meta.url);
const p = JSON.parse(readFileSync(P, "utf8"));
const rosa = { fondo: "liso", fondoOpts: { paleta: ["#ffe1ec", "#ff8fb8"] } };
p.escenas = [
  { nombre: "gancho", tomas: [
    { desde: 0, rotulo: "¿HACE CUÁNTO NO TE HACES|EL *PEDICURE*?", sonido: "boing", sonidoEn: 0.12, dibujo: {
      fondo: "calle",
      camara: [[0, { zoom: 1.05, x: 540, y: 1000 }], ["1:llevamos", { zoom: 1.15, x: 600, y: 1060 }]],
      elementos: [
        { pieza: "mujer", x: 200, y: 1010, escala: 0.85, entra: "izquierda", en: 0, dura: 0.6,
          mueve: [["1:favor", { x: 360, y: 1010, escala: 0.85, rot: 0 }]], params: { camina: [[0, 1], ["1:favor", 1], ["1:llevamos", 0]], expresion: [[0, "tranquila"], ["1:favor", "sorpresa"]], miraX: [[0, 0], ["1:llevamos", 1]], miraY: [[0, 0], ["1:llevamos", 1]] } },
        { pieza: "pies", x: 790, y: 1200, escala: 0.75, entra: "cae", en: 0, dura: 0.5, accion: "tiembla", capa: 2,
          params: { expresion: "grita", habla: 1, descuido: 1 } },
      ] } },
    { desde: "2:ay", rotulo: "«APENAS» *2 MESES Y MEDIO*", dibujo: {
      fondo: "calle",
      camara: [[0, { zoom: 1.35, x: 480, y: 830 }], ["2:medio", { zoom: 1.15, x: 520, y: 900 }]],
      elementos: [
        { pieza: "mujer", x: 470, y: 1060, escala: 1, entra: "ninguna", params: { expresion: "tranquila", habla: 1, mano: "abanica", miraX: -0.5, miraY: -0.4 } },
        { pieza: "pies", x: 880, y: 1330, escala: 0.42, entra: "sube", en: "2:apenas", params: { expresion: "llora", descuido: 1 } },
      ] } },
    { desde: "3:dos", sonido: "alarma", sonidoEn: 0.02, sonidoDb: -9, dibujo: {
      fondo: "liso", fondoOpts: { paleta: ["#ffe08a", "#ff5f7e"] },
      camara: [[0, { zoom: 1 }], [0.22, { zoom: 1.5, x: 540, y: 1100 }], ["3:ya", { zoom: 1.5, x: 540, y: 1100 }], ["3:estamos", { zoom: 1.08, x: 540, y: 980 }]],
      elementos: [
        { pieza: "alarma", x: 190, y: 640, escala: 0.55, entra: "rebote", en: 0 },
        { pieza: "alarma", x: 890, y: 640, escala: 0.55, entra: "rebote", en: 0.1 },
        { pieza: "pies", x: 540, y: 1170, escala: 1.05, entra: "rebote", en: 0, capa: 2,
          params: { expresion: "grita", habla: 1, salta: 1, descuido: 1, pancarta: [[0, ""], ["3:pidiendo", "¡PENSIÓN YA!"]] } },
        { pieza: "destello", x: 540, y: 960, entra: "ninguna", capa: 9 },
      ] } },
  ] },
  { nombre: "explicación", tomas: [
    { desde: "4:lo", sonido: "burbujas", dibujo: {
      fondo: "salon",
      camara: [[0, { zoom: 1.12, x: 560, y: 1000 }], ["4:pedicure", { zoom: 1, x: 540, y: 960 }]],
      elementos: [
        { pieza: "lista", x: 540, y: 720, escala: 0.78, entra: "rebote", en: 0.1, titulo: "PEDICURE", items: ["Limpieza", "Corte de uñas", "Cutículas", "Exfoliación"],
          params: { hechos: [["4:recomendable", 0], ["4:mujeres", 1], ["4:hacerse", 2], ["4:un", 3], ["4:pedicure", 4]] } },
        { pieza: "pedicurista", x: 280, y: 1070, escala: 0.72, entra: "izquierda", en: 0 },
        { pieza: "pies", x: 730, y: 1190, escala: 0.5, entra: "aparece", en: 0, params: { expresion: "feliz", descuido: [[0, 1], ["4:pedicure", 0]], brilla: [[0, 0], ["4:pedicure", 1]] } },
        { pieza: "tina", x: 730, y: 1330, escala: 0.62, entra: "aparece", en: 0, capa: 2 },
      ] } },
    { desde: "4:cada", rotulo: "CADA *3 A 4* SEMANAS", sonido: "campana", sonidoEn: 0.6, dibujo: {
      fondo: "salon",
      camara: [[0, { zoom: 1.1, x: 540, y: 980 }], ["4:semanas", { zoom: 1, x: 540, y: 960 }]],
      elementos: [
        { pieza: "calendario", x: 540, y: 990, escala: 1.15, entra: "rebote", en: 0, titulo: "MI MES", params: { marca: [[0, 0], ["4:3", 1], ["4:semanas", 2.1]] } },
        { pieza: "esmalte", x: 890, y: 1260, escala: 0.45, entra: "cae", en: 0.2, rot: 10 },
      ] } },
    { desde: "5:pero", rotulo: "DEPENDE *DE TI*", dibujo: {
      ...rosa,
      camara: [[0, { zoom: 1.08 }], ["5:necesidades", { zoom: 1 }]],
      elementos: [
        { pieza: "una", x: 230, y: 960, escala: 0.6, entra: "rebote", en: "5:crecimiento", params: { crece: [["5:crecimiento", 0], ["5:unas", 0.7]] } },
        { pieza: "pildora", texto: "UÑAS", color: "morado", x: 230, y: 1200, escala: 0.9, entra: "aparece", en: "5:crecimiento" },
        { pieza: "gota", x: 540, y: 960, escala: 0.6, entra: "rebote", en: "5:piel", color: "agua", accion: "flota" },
        { pieza: "pildora", texto: "PIEL", color: "azul", x: 540, y: 1200, escala: 0.9, entra: "aparece", en: "5:piel" },
        { pieza: "corazon", x: 850, y: 960, escala: 0.55, entra: "rebote", en: "5:necesidades", color: "rosa", accion: "late" },
        { pieza: "pildora", texto: "TÚ", color: "rojo", x: 850, y: 1200, escala: 0.9, entra: "aparece", en: "5:necesidades" },
      ] } },
  ] },
  { nombre: "por qué", tomas: [
    { desde: "6:porque", sonido: "impacto", dibujo: {
      fondo: "liso", fondoOpts: { paleta: ["#f3e6ff", "#b58cff"] },
      elementos: [
        { pieza: "titular", texto: "¿POR QUÉ RESPETAR", tamano: 118, x: 540, y: 700, entra: "rebote", en: 0 },
        { pieza: "titular", texto: "LOS TIEMPOS?", tamano: 160, tinta: "#ffffff", x: 540, y: 860, entra: "rebote", en: 0.25 },
        { pieza: "reloj", x: 540, y: 1130, escala: 0.8, color: "rosa", entra: "rebote", en: "6:dejar", params: { hora: [["6:dejar", 0], ["6:favorecer", 12]] } },
      ] } },
    { desde: "6:acumulacion", rotulo: "PIEL MUERTA Y *DUREZAS*", sonido: "polvo", sonidoEn: 0.6, dibujo: {
      ...rosa,
      camara: [[0, { zoom: 1 }], ["6:durezas", { zoom: 1.15, x: 540, y: 1080 }]],
      elementos: [
        { pieza: "talon", x: 540, y: 950, escala: 1.1, entra: "aparece", en: 0, params: { seco: [[0, 0.2], ["6:muerta", 1]] } },
        { pieza: "aro", x: 540, y: 1130, radio: 190, tinta: "#e5306f", entra: "aparece", en: "6:durezas", params: { dibuja: [["6:durezas", 0], [1.6, 1]] } },
      ] } },
    { desde: "6:unas", rotulo: "UÑAS *DEMASIADO LARGAS*", dibujo: {
      ...rosa,
      camara: [[0, { zoom: 1 }], ["6:largas", { zoom: 1.12, x: 540, y: 880 }]],
      elementos: [
        { pieza: "una", x: 540, y: 1080, escala: 1.15, entra: "sube", en: 0, params: { crece: [[0, 0.3], ["6:largas", 1]] } },
        { pieza: "signo", tipo: "exclama", x: 860, y: 700, escala: 0.45, entra: "rebote", en: "6:largas" },
      ] } },
    { desde: "7:un", rotulo: "UN OJO EXPERTO *NOTA LOS CAMBIOS*", dibujo: {
      fondo: "salon",
      elementos: [
        { pieza: "pedicurista", x: 260, y: 1060, escala: 0.72, entra: "izquierda", en: 0, params: { gesto: [[0, "lima"], ["7:piel", "pulgar"]] } },
        { pieza: "pies", x: 740, y: 1220, escala: 0.5, entra: "aparece", en: 0, params: { expresion: "normal", brilla: 1, miraX: 0, miraY: -1 } },
        { pieza: "lupa", x: 640, y: 1010, escala: 0.55, entra: "rebote", en: "7:detectar", capa: 3,
          mueve: [["7:cambios", { x: 820, y: 1030, escala: 0.55, rot: 0 }], ["7:problemas", { x: 660, y: 1060, escala: 0.55, rot: 0 }]] },
        { pieza: "signo", tipo: "check", x: 870, y: 760, escala: 0.4, entra: "rebote", en: "7:piel" },
      ] } },
  ] },
  { nombre: "remate y cierre", tomas: [
    { desde: "8:entonces", dibujo: {
      fondo: "salon",
      camara: [[0, { zoom: 1.2, x: 470, y: 950 }], ["8:mes", { zoom: 1.05, x: 540, y: 1000 }]],
      elementos: [
        { pieza: "mujer", x: 400, y: 1040, escala: 0.95, entra: "ninguna", params: { expresion: "duda", habla: 1, mano: "menton", miraX: 0.7, miraY: 0.9 } },
        { pieza: "pies", x: 830, y: 1310, escala: 0.45, entra: "aparece", en: 0, params: { expresion: "normal", brilla: 1, miraX: -1, miraY: -1 } },
        { pieza: "signo", tipo: "pregunta", x: 700, y: 700, escala: 0.38, entra: "rebote", en: "8:volver", accion: "balancea" },
      ] } },
    { desde: "9:claro", sonido: "impacto", sonidoEn: 0.05, dibujo: {
      fondo: "liso", fondoOpts: { paleta: ["#fff3a8", "#ff7aa8"] },
      camara: [[0, { zoom: 1.35, x: 540, y: 1080 }], ["9:nosotros", { zoom: 1.05, x: 540, y: 980 }]],
      elementos: [
        { pieza: "pies", x: 560, y: 1170, escala: 1.05, entra: "rebote", en: 0, capa: 2,
          params: { expresion: "grita", habla: 1, salta: 1, brilla: 1, pancarta: [[0, ""], ["9:derecho", "¡VIDA DIGNA!"]] } },
        { pieza: "mujer", x: 150, y: 1300, escala: 0.45, entra: "izquierda", en: "9:tambien", params: { expresion: "risa", mano: "celebra" } },
      ] } },
    { desde: "10:guarda", sonido: "campana", sonidoEn: 0.1, dibujo: {
      fondo: "salon",
      elementos: [
        { pieza: "titular", texto: "GUÁRDALO", tamano: 170, tinta: "#ffffff", x: 460, y: 830, entra: "rebote", en: 0 },
        { pieza: "guardar", x: 900, y: 770, escala: 0.55, entra: "rebote", en: 0.15, accion: "flota" },
        { pieza: "titular", texto: "Y SÍGUENOS", tamano: 160, tinta: "#ff4f98", x: 460, y: 1090, entra: "rebote", en: "10:siguenos" },
        { pieza: "corazon", x: 910, y: 1030, escala: 0.4, color: "rosa", entra: "rebote", en: "10:siguenos", accion: "late" },
        { pieza: "pies", x: 330, y: 1390, escala: 0.42, entra: "sube", en: "10:consejos", params: { expresion: "feliz", brilla: 1, salta: 1 } },
        { pieza: "mujer", x: 790, y: 1340, escala: 0.42, entra: "sube", en: "10:consejos", params: { expresion: "risa", mano: "celebra" } },
      ] } },
  ] },
];
p.musica = "musica.mp3"; p.musicaDb = -20;
writeFileSync(P, JSON.stringify(p, null, 2) + "\n");
console.log(`✓ ${p.escenas.flatMap((e) => e.tomas).length} tomas`);
