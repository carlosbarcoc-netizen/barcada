import json, sys
P = sys.argv[1] + "/proyecto.json"
p = json.load(open(P))
ROBOT = "naranja"; ROPA = "azul"
def robot(x, y, s, en=0, entra="aparece", **k):
    # el robot y sus ojos que brillan (dos orbes en los ojos)
    r = [{"pieza": "robot", "x": x, "y": y, "escala": s, "color": ROBOT, "entra": entra, "en": en, **k}]
    for dx in (-40, 40):
        r.append({"pieza": "orbe", "x": x + dx * s, "y": y - 165 * s, "radio": 13 * s, "tinta": "#bff4ff", "hilo": False,
                  "entra": "aparece", "en": en if isinstance(en, str) else en + 0.3, "capa": 5,
                  "params": {"brillo": 1}})
    return r
def persona(x, y, s, en=0, entra="aparece", **k):
    return [{"pieza": "persona", "x": x, "y": y, "escala": s, "color": ROPA, "pelo": "negro", "entra": entra, "en": en, **k}]
def toma(desde, elementos, camara=None, fondo="noche", **k):
    d = {"fondo": fondo, "fondoOpts": {"suelo": 1500}, "elementos": elementos}
    if camara: d["camara"] = camara
    return {"desde": desde, "dibujo": d, **k}
T = []
# 1 · el editor llega y encuentra a Claude en su silla
T.append(toma(0, [
    *robot(720, 1180, 1.0, en=0, entra="ninguna"),
    {"pieza": "laptop", "x": 720, "y": 1390, "escala": 0.7, "capa": 3, "pantalla": "REEL", "entra": "ninguna"},
    {"pieza": "etiqueta", "texto": "CLAUDE", "x": 720, "y": 780, "entra": "aparece", "en": "1:Claude…"},
    *persona(270, 1200, 1.0, en=0.05, entra="izquierda", accion="tiembla"),
    {"pieza": "etiqueta", "texto": "EDITOR", "x": 270, "y": 800, "entra": "aparece", "en": 0.5},
    {"pieza": "signo", "tipo": "pregunta", "x": 300, "y": 640, "escala": 0.6, "entra": "rebote", "en": "1:silla?"},
], camara=[[0, {"zoom": 1.0}], ["1:silla?", {"zoom": 1.18, "x": 540, "y": 1050}]]))
# 2 · Claude: me contrataron
T.append(toma("2:Me", [
    *robot(540, 1230, 1.6, entra="ninguna"),
    {"pieza": "pildora", "texto": "NUEVO EDITOR", "color": "naranja", "x": 540, "y": 1600, "entra": "rebote", "en": "2:videos", "capa": 6},
], camara=[[0, {"zoom": 1.0}], ["2:yo.", {"zoom": 1.12, "y": 1050}]], sonido="pop"))
# 3 · ¿¡Qué!?
T.append(toma("3:¿¡Qué!?", [
    *persona(540, 1250, 1.7, entra="ninguna", accion="tiembla", pose="piensa"),
    {"pieza": "signo", "tipo": "exclama", "x": 860, "y": 700, "escala": 0.8, "entra": "rebote", "en": 0.05, "capa": 6},
], camara=[[0, {"zoom": 1.25, "y": 950}], ["3:existieras!", {"zoom": 1.05}]], sonido="impacto"))
# 4 · tres días por reel
T.append(toma("4:Ajá.", [
    *robot(300, 1250, 1.1, entra="ninguna"),
    {"pieza": "reloj", "x": 760, "y": 900, "escala": 0.8, "entra": "rebote", "en": "4:tardabas", "params": {"hora": [["4:tardabas", 0], ["4:reel.", 12]]}},
    {"pieza": "numero", "texto": "3 DÍAS", "x": 740, "y": 1330, "escala": 0.75, "entra": "rebote", "en": "4:tres", "capa": 6},
]))
# 5 · ¡los guiones los escribo yo!
T.append(toma("5:¡Pero", [
    *persona(380, 1260, 1.4, entra="ninguna", pose="saluda"),
    {"pieza": "celular", "x": 800, "y": 1050, "escala": 0.7, "pantalla": "GUION", "entra": "rebote", "en": "5:guiones", "rot": 8},
], camara=[[0, {"zoom": 1.1, "y": 1000}], ["5:yo!", {"zoom": 1.0}]]))
# 6 · los escribo yo; tú cambias los emojis
T.append(toma("6:Los", [
    {"pieza": "laptop", "x": 540, "y": 1080, "escala": 1.5, "pantalla": "GUION ✓", "entra": "aparece", "en": 0},
    {"pieza": "etiqueta", "texto": "HECHO POR CLAUDE", "x": 540, "y": 720, "tinta": "#ffb347", "entra": "aparece", "en": "6:escribo"},
    {"pieza": "pildora", "texto": "TÚ: CAMBIAR EMOJIS", "color": "azul", "x": 540, "y": 1450, "tamano": 46, "entra": "rebote", "en": "6:Tú", "capa": 6},
], camara=[[0, {"zoom": 1.15, "y": 1000}], ["6:emojis.", {"zoom": 1.0}]], sonido="pop", sonidoEn=0.9))
# 7 · ¿y los subtítulos, las animaciones, la voz?
T.append(toma("7:¿Y", [
    *persona(260, 1300, 1.1, entra="ninguna", pose="piensa"),
    {"pieza": "pildora", "texto": "SUBTÍTULOS", "color": "morado", "x": 720, "y": 820, "tamano": 46, "entra": "rebote", "en": "7:subtítulos?"},
    {"pieza": "pildora", "texto": "ANIMACIONES", "color": "verde", "x": 720, "y": 980, "tamano": 46, "entra": "rebote", "en": "7:animaciones?"},
    {"pieza": "pildora", "texto": "VOZ", "color": "rojo", "x": 720, "y": 1140, "tamano": 46, "entra": "rebote", "en": "7:voz?"},
]))
# 8 · Yo. Mientras tú buscabas la canción
T.append(toma("8:Yo.", [
    *robot(300, 1300, 0.95, entra="ninguna"),
    {"pieza": "lista", "titulo": "CLAUDE", "items": ["SUBTÍTULOS", "ANIMACIONES", "VOZ"], "x": 720, "y": 900, "escala": 0.85,
     "entra": "aparece", "en": 0, "params": {"hechos": [[0, 0], [0.9, 3.4]]}},
    {"pieza": "celular", "x": 770, "y": 1400, "escala": 0.5, "pantalla": "♪ ...", "entra": "sube", "en": "8:Mientras", "accion": "balancea"},
], sonido="campana", sonidoEn=0.9))
# 9 · ¿y ahora qué le digo a mi jefe?
T.append(toma("9:…¿Y", [
    *persona(540, 1250, 1.6, entra="ninguna", pose="piensa"),
    {"pieza": "signo", "tipo": "pregunta", "x": 830, "y": 680, "escala": 0.7, "entra": "rebote", "en": "9:jefe?", "accion": "flota"},
], camara=[[0, {"zoom": 1.0}], ["9:jefe?", {"zoom": 1.2, "y": 950}]]))
# 10 · director creativo
T.append(toma("10:Dile", [
    *robot(540, 1350, 1.1, entra="ninguna"),
    {"pieza": "titular", "texto": "DIRECTOR", "debajo": "CREATIVO", "x": 540, "y": 790, "tamano": 170, "entra": "rebote", "en": "10:«director", "capa": 6},
], sonido="subida", sonidoEn=0.8))
# 11 · ¿me enseñas a hacerlos?
T.append(toma("11:…Oye,", [
    *persona(300, 1220, 1.1, entra="ninguna", pose="saluda"),
    *robot(780, 1220, 1.1, entra="ninguna"),
    {"pieza": "burbuja", "texto": "¿ME ENSEÑAS?", "x": 380, "y": 690, "escala": 0.85, "entra": "rebote", "en": "11:enseñas"},
], camara=[[0, {"zoom": 1.1, "x": 450}], ["11:hacerlos?", {"zoom": 1.0, "x": 540}]]))
# 12 · el CTA: escribe «Claude»
T.append(toma("12:Escribe", [
    {"pieza": "etiqueta", "texto": "ESCRIBE EN LOS COMENTARIOS", "x": 540, "y": 700, "tamano": 36, "entra": "aparece", "en": 0},
    {"pieza": "burbuja", "texto": "Claude", "x": 560, "y": 900, "escala": 1.6, "entra": "rebote", "en": "12:«Claude»", "accion": "late", "capa": 6},
    *robot(540, 1380, 0.9, entra="sube", en=0.1),
], sonido="pop", sonidoEn=0.6, rotulo="COMENTA *CLAUDE*"))
# 13 · el giro: este video también lo hizo Claude
T.append(toma("13:Que,", [
    *robot(540, 1250, 1.6, entra="ninguna"),
    {"pieza": "pildora", "texto": "HECHO CON IA", "color": "naranja", "x": 540, "y": 620, "entra": "rebote", "en": "13:yo.", "capa": 6},
], camara=[[0, {"zoom": 1.0}], ["13:yo.", {"zoom": 1.1, "y": 960}]], sonido="impacto", sonidoEn=1.6))
p["escenas"] = [{"nombre": "el sketch", "tomas": T}]
json.dump(p, open(P, "w"), ensure_ascii=False, indent=2)
print(len(T), "tomas")
