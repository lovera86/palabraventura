/* Palabraventura · La expedición de las palabras perdidas · contenido del nivel «El puente mágico».
   Solo datos: para cambiar el escenario, la palabra o las pistas no hace falta tocar el motor.
   Unidades del mundo: el alto visible es 360 y el suelo está en y = 300 (y crece hacia abajo).
   - solidos: bloques que no se atraviesan (suelo, rocas, tocones).
   - plataformas: se puede saltar a través de ellas desde abajo y aterrizar encima.
   - deco: adornos sin colisión; «capa» 0 = detrás del jugador, 1 = delante. */
PV.EXPEDICION_NIVELES = PV.EXPEDICION_NIVELES || {};
PV.EXPEDICION_NIVELES.puente = {
  id: "puente",
  titulo: "La expedición de las palabras perdidas",
  intro: "¡El puente mágico ha desaparecido! Encuentra las letras para reconstruirlo.",
  ancho: 3000,
  inicio: { x: 280 },
  // Bordes por los que no se puede pasar: así el personaje nunca queda debajo del joystick o del botón de salto.
  limites: [210, 2790],
  cielo: ["#bfe7ff", "#eaf8ff"],
  solidos: [
    { x: 0, y: 300, w: 3000, h: 60, tipo: "suelo" },
    { x: 660, y: 262, w: 64, h: 38, tipo: "roca" },
    { x: 1180, y: 244, w: 70, h: 56, tipo: "tocon" },
    { x: 1250, y: 270, w: 50, h: 30, tipo: "roca" },
    { x: 2050, y: 250, w: 74, h: 50, tipo: "tocon" }
  ],
  plataformas: [
    { x: 360, y: 214, w: 150 },
    { x: 540, y: 150, w: 120 },
    { x: 860, y: 196, w: 140 },
    { x: 1420, y: 210, w: 130 },
    { x: 1600, y: 140, w: 150 },
    { x: 1800, y: 200, w: 120 },
    { x: 2300, y: 205, w: 160 },
    { x: 2520, y: 150, w: 130 }
  ],
  deco: [
    { x: 40, y: 300, e: "🌳", tam: 120, capa: 0 }, { x: 300, y: 300, e: "🌲", tam: 96, capa: 0 },
    { x: 560, y: 300, e: "🍄", tam: 30, capa: 1 }, { x: 760, y: 300, e: "🌳", tam: 130, capa: 0 },
    { x: 980, y: 300, e: "🌼", tam: 26, capa: 1 }, { x: 1080, y: 300, e: "🌲", tam: 110, capa: 0 },
    { x: 1380, y: 300, e: "🌷", tam: 26, capa: 1 }, { x: 1550, y: 300, e: "🌳", tam: 124, capa: 0 },
    { x: 1700, y: 300, e: "🍄", tam: 28, capa: 1 }, { x: 1950, y: 300, e: "🌲", tam: 100, capa: 0 },
    { x: 2200, y: 300, e: "🌼", tam: 26, capa: 1 }, { x: 2420, y: 300, e: "🌳", tam: 120, capa: 0 },
    { x: 2700, y: 300, e: "🌲", tam: 104, capa: 0 }, { x: 2860, y: 300, e: "🪧", tam: 44, capa: 0 },
    { x: 200, y: 60, e: "☁️", tam: 54, capa: 0, nube: true }, { x: 900, y: 40, e: "☁️", tam: 64, capa: 0, nube: true },
    { x: 1700, y: 70, e: "☁️", tam: 50, capa: 0, nube: true }, { x: 2500, y: 45, e: "☁️", tam: 60, capa: 0, nube: true }
  ]
  // Fase 2: letras P-U-E-N-T-E repartidas, río y mascota. Fase 3: reto { palabra, pistas }. Fase 4: puente y meta.
};
