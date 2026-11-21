/* Palabraventura · La expedición de las palabras perdidas · contenido de los niveles.
   Solo datos: para cambiar escenarios, palabras, letras trampa, pistas o premios no hace falta tocar el motor.
   Unidades del mundo: el alto visible es 360 y el suelo normal está en y = 300 (y crece hacia abajo).
   - tema: colores del cielo, colinas, tierra, hierba, plataformas y agua; «techo» (cueva) y «nieve».
   - solidos: bloques que no se atraviesan (suelo, rocas, tocones). Un suelo con y < 300 es un terreno alto.
   - plataformas: se atraviesan desde abajo y se puede aterrizar encima.
   - obstaculos (en orden): cada uno se supera formando su palabra con las letras que llevan su índice «o».
       rio   → x, w; solucion «puente», «hielo», «barca» o «balsa» (hasta resolverlo, una barrera impide caerse)
       muro  → x (pared del acantilado), arriba (altura del terreno alto); solucion «escalera»
       puerta→ x; solucion «abrir»; estilo «madera» o «reja»
     reto: enunciado, imagen y definición (pista), voz, letra trampa con su explicación, botón y aviso al resolver.
   - letras: { l, x, y, o } centro de cada letra; se recogen solas al pasar cerca.
   - deco: adornos sin colisión; «capa» 0 = detrás del jugador, 1 = delante; «nube» se mueve despacio por el cielo. */
(function () {
  const suelo = (x, w, y) => ({ x, y: y === undefined ? 300 : y, w, h: 360 - (y === undefined ? 300 : y), tipo: "suelo" });
  const roca = (x, w, h) => ({ x, y: 300 - h, w, h, tipo: "roca" });
  const tocon = (x, w, h) => ({ x, y: 300 - h, w, h, tipo: "tocon" });
  const premio = { primera: { estrellas: 10, monedas: 20 }, repetir: { estrellas: 3, monedas: 5 } };
  const nubes = (xs, e) => xs.map((x, i) => ({ x, y: 40 + (i * 23) % 40, e: e || "☁️", tam: 50 + (i * 7) % 16, capa: 0, nube: true }));

  PV.EXPEDICION_ORDEN = ["puente", "lago", "acantilado", "cueva", "montana", "castillo"];
  PV.EXPEDICION_NIVELES = {

    /* ---------- 1. Bosque: PUENTE ---------- */
    puente: {
      id: "puente", nombre: "El bosque", icono: "🌉", regla: "Ordenar letras",
      titulo: "El puente mágico",
      intro: "¡El puente mágico ha desaparecido! Encuentra las letras para reconstruirlo.",
      ancho: 3600, inicio: { x: 280 }, limites: [210, 3390],
      tema: { cielo: ["#bfe7ff", "#eaf8ff"], colinas: ["#cfeccf", "#a9dca8"] },
      solidos: [suelo(0, 2440), suelo(2660, 940), roca(660, 64, 38), tocon(1180, 70, 56), roca(1250, 50, 30), tocon(2050, 74, 50)],
      plataformas: [
        { x: 360, y: 214, w: 150 }, { x: 540, y: 150, w: 120 }, { x: 860, y: 196, w: 140 }, { x: 1420, y: 210, w: 130 },
        { x: 1600, y: 140, w: 150 }, { x: 1800, y: 200, w: 120 }, { x: 2190, y: 205, w: 150 }, { x: 2860, y: 210, w: 140 }
      ],
      obstaculos: [{
        tipo: "rio", x: 2440, w: 220, solucion: "puente", palabra: "PUENTE",
        reto: { enunciado: "Ordena las letras para formar la palabra que arregla el río.", imagen: "🌉",
          definicion: "Sirve para cruzar el río sin mojarse.", decir: "puente", trampa: null,
          boton: "¡A CRUZAR! 🌉", tras: "¡El puente ha vuelto! Crúzalo hasta la meta 🏁" }
      }],
      // Repartidas en desorden: el marcador las muestra en el orden en que se recogen y no debe dar la palabra hecha.
      letras: [{ l: "T", x: 435, y: 168 }, { l: "E", x: 600, y: 104 }, { l: "N", x: 1215, y: 200 }, { l: "U", x: 1675, y: 94 }, { l: "E", x: 1960, y: 252 }, { l: "P", x: 2265, y: 160 }],
      meta: { x: 3270 },
      deco: [
        { x: 40, y: 300, e: "🌳", tam: 120, capa: 0 }, { x: 300, y: 300, e: "🌲", tam: 96, capa: 0 }, { x: 560, y: 300, e: "🍄", tam: 30, capa: 1 },
        { x: 760, y: 300, e: "🌳", tam: 130, capa: 0 }, { x: 980, y: 300, e: "🌼", tam: 26, capa: 1 }, { x: 1080, y: 300, e: "🌲", tam: 110, capa: 0 },
        { x: 1380, y: 300, e: "🌷", tam: 26, capa: 1 }, { x: 1550, y: 300, e: "🌳", tam: 124, capa: 0 }, { x: 1700, y: 300, e: "🍄", tam: 28, capa: 1 },
        { x: 1950, y: 300, e: "🌲", tam: 100, capa: 0 }, { x: 2150, y: 300, e: "🌼", tam: 26, capa: 1 }, { x: 2370, y: 300, e: "🪧", tam: 44, capa: 0 },
        { x: 2720, y: 300, e: "🌷", tam: 26, capa: 1 }, { x: 2800, y: 300, e: "🌳", tam: 120, capa: 0 }, { x: 3050, y: 300, e: "🌻", tam: 34, capa: 1 },
        { x: 3150, y: 300, e: "🌲", tam: 104, capa: 0 }, { x: 3520, y: 300, e: "🌳", tam: 120, capa: 0 },
        ...nubes([200, 900, 1700, 2500, 3200])
      ],
      premio
    },

    /* ---------- 2. Lago: BARCA (B/V) ---------- */
    lago: {
      id: "lago", nombre: "El lago", icono: "⛵", regla: "B / V",
      titulo: "La barca del lago",
      intro: "El lago es demasiado grande para cruzarlo. Recoge las letras y forma la palabra que te llevará al otro lado.",
      ancho: 3800, inicio: { x: 280 }, limites: [210, 3590],
      tema: { cielo: ["#ffd9b0", "#fff3e3"], colinas: ["#cfe8d8", "#a7d7c5"], hierba: "#7ccf6f" },
      solidos: [suelo(0, 2500), suelo(2960, 840), roca(800, 64, 38), tocon(1500, 70, 56), roca(1980, 56, 34)],
      plataformas: [
        { x: 420, y: 214, w: 140 }, { x: 600, y: 150, w: 120 }, { x: 1100, y: 205, w: 150 }, { x: 1290, y: 140, w: 120 },
        { x: 1700, y: 210, w: 140 }, { x: 2150, y: 200, w: 160 }, { x: 3120, y: 210, w: 140 }
      ],
      obstaculos: [{
        tipo: "rio", x: 2500, w: 460, solucion: "barca", palabra: "BARCA",
        reto: { enunciado: "Forma la palabra que te lleva por el lago. ¡Ojo, hay una letra de más!", imagen: "⛵",
          definicion: "Sirve para navegar por el agua, como un barco pequeño.", decir: "barca",
          trampa: { letra: "V", explicacion: "Barca se escribe con B, como barco y bote." },
          boton: "¡A NAVEGAR! ⛵", tras: "¡Tu barca te espera! Súbete y cruzará el lago ⛵" }
      }],
      letras: [{ l: "R", x: 490, y: 170 }, { l: "A", x: 660, y: 106 }, { l: "C", x: 1350, y: 96 }, { l: "B", x: 1770, y: 166 }, { l: "A", x: 2230, y: 156 }],
      meta: { x: 3420 },
      deco: [
        { x: 60, y: 300, e: "🌳", tam: 120, capa: 0 }, { x: 330, y: 300, e: "🌾", tam: 40, capa: 1 }, { x: 700, y: 300, e: "🌳", tam: 126, capa: 0 },
        { x: 1000, y: 300, e: "🌾", tam: 40, capa: 1 }, { x: 1250, y: 300, e: "🌲", tam: 104, capa: 0 }, { x: 1620, y: 300, e: "🌿", tam: 34, capa: 1 },
        { x: 1900, y: 300, e: "🌳", tam: 120, capa: 0 }, { x: 2360, y: 300, e: "🦆", tam: 34, capa: 1 }, { x: 2440, y: 300, e: "🪧", tam: 44, capa: 0 },
        { x: 3020, y: 300, e: "🌾", tam: 40, capa: 1 }, { x: 3280, y: 300, e: "🌳", tam: 124, capa: 0 }, { x: 3700, y: 300, e: "🌲", tam: 104, capa: 0 },
        ...nubes([300, 1100, 2000, 2800, 3500])
      ],
      premio
    },

    /* ---------- 3. Acantilado: ESCALERA (S / Z) ---------- */
    acantilado: {
      id: "acantilado", nombre: "El acantilado", icono: "🪜", regla: "S / Z",
      titulo: "La escalera del acantilado",
      intro: "Un acantilado altísimo corta el camino. Encuentra las letras de la palabra que te ayudará a subir.",
      ancho: 3900, inicio: { x: 280 }, limites: [210, 3690],
      tema: { cielo: ["#ffcf8a", "#ffeccc"], colinas: ["#f2c48d", "#e0a36b"], tierra: "#c47a4a", tierraOsc: "#a8643a", hierba: "#d9b25a", hierbaOsc: "#b8923f" },
      solidos: [suelo(0, 2700), suelo(2700, 1200, 130), roca(780, 64, 38), tocon(1150, 70, 56), roca(1900, 56, 34)],
      plataformas: [
        { x: 400, y: 214, w: 140 }, { x: 580, y: 150, w: 120 }, { x: 900, y: 200, w: 140 }, { x: 1250, y: 210, w: 130 },
        { x: 1430, y: 145, w: 140 }, { x: 2000, y: 205, w: 150 }, { x: 2250, y: 150, w: 130 }
      ],
      obstaculos: [{
        tipo: "muro", x: 2700, arriba: 130, solucion: "escalera", palabra: "ESCALERA",
        reto: { enunciado: "Forma la palabra que te ayuda a subir. ¡Ojo, hay una letra de más!", imagen: "🪜",
          definicion: "Tiene peldaños para subir muy alto.", decir: "escalera",
          trampa: { letra: "Z", explicacion: "Escalera se escribe con S, como escalar y escalón." },
          boton: "¡A SUBIR! 🪜", tras: "¡La escalera ya está! Sube hasta arriba 🪜" }
      }],
      letras: [
        { l: "A", x: 470, y: 170 }, { l: "L", x: 640, y: 106 }, { l: "E", x: 970, y: 156 }, { l: "S", x: 1110, y: 252 },
        { l: "E", x: 1500, y: 101 }, { l: "C", x: 1780, y: 190 }, { l: "R", x: 2075, y: 161 }, { l: "A", x: 2315, y: 106 }
      ],
      meta: { x: 3480, y: 130 },
      deco: [
        { x: 60, y: 300, e: "🌵", tam: 70, capa: 0 }, { x: 350, y: 300, e: "🪨", tam: 40, capa: 1 }, { x: 700, y: 300, e: "🌵", tam: 80, capa: 0 },
        { x: 1050, y: 300, e: "🌾", tam: 36, capa: 1 }, { x: 1350, y: 300, e: "🌵", tam: 76, capa: 0 }, { x: 1700, y: 300, e: "🪨", tam: 40, capa: 1 },
        { x: 2150, y: 300, e: "🌵", tam: 80, capa: 0 }, { x: 2600, y: 300, e: "🪧", tam: 44, capa: 0 },
        { x: 2900, y: 130, e: "🌵", tam: 72, capa: 0 }, { x: 3200, y: 130, e: "🌾", tam: 36, capa: 1 }, { x: 3650, y: 130, e: "🌵", tam: 80, capa: 0 },
        ...nubes([400, 1500, 2600, 3400], "🦅")
      ],
      premio
    },

    /* ---------- 4. Cueva: LLAVE (LL / Y) ---------- */
    cueva: {
      id: "cueva", nombre: "La cueva", icono: "🔑", regla: "LL / Y",
      titulo: "La llave de la cueva",
      intro: "Al fondo de la cueva hay una puerta cerrada. Reúne las letras y forma la palabra que la abre.",
      ancho: 3600, inicio: { x: 280 }, limites: [210, 3390],
      tema: { cielo: ["#2b2540", "#41366a"], colinas: ["#3a3156", "#4a3f6b"], tierra: "#5b4a6e", tierraOsc: "#4a3c5c", hierba: "#8a77b5", hierbaOsc: "#6c5b96",
        plataforma: "#6a5a80", techo: true, oscuro: true },
      solidos: [suelo(0, 3600), roca(800, 60, 36), roca(1150, 52, 30), roca(1700, 64, 44), roca(2450, 56, 34)],
      plataformas: [
        { x: 420, y: 214, w: 140 }, { x: 600, y: 150, w: 120 }, { x: 950, y: 205, w: 140 }, { x: 1300, y: 210, w: 130 },
        { x: 1480, y: 145, w: 140 }, { x: 1900, y: 200, w: 150 }, { x: 2200, y: 150, w: 130 }
      ],
      obstaculos: [{
        tipo: "puerta", x: 2700, solucion: "abrir", estilo: "madera", palabra: "LLAVE",
        reto: { enunciado: "Forma la palabra que abre la puerta. ¡Ojo, hay una letra de más!", imagen: "🔑",
          definicion: "Sirve para abrir puertas y candados.", decir: "llave",
          trampa: { letra: "Y", explicacion: "Llave empieza por LL, como lluvia y llama." },
          boton: "¡A ABRIR! 🔑", tras: "¡La puerta se ha abierto! Sal de la cueva 🔑" }
      }],
      letras: [{ l: "A", x: 490, y: 170 }, { l: "L", x: 660, y: 106 }, { l: "E", x: 1020, y: 161 }, { l: "L", x: 1550, y: 101 }, { l: "V", x: 2265, y: 106 }],
      meta: { x: 3250 },
      deco: [
        { x: 120, y: 300, e: "💎", tam: 34, capa: 1 }, { x: 380, y: 300, e: "🍄", tam: 30, capa: 1 }, { x: 720, y: 300, e: "🕯️", tam: 32, capa: 0 },
        { x: 1000, y: 300, e: "💎", tam: 30, capa: 1 }, { x: 1250, y: 300, e: "🍄", tam: 34, capa: 1 }, { x: 1600, y: 300, e: "🕯️", tam: 32, capa: 0 },
        { x: 2050, y: 300, e: "💎", tam: 36, capa: 1 }, { x: 2380, y: 300, e: "🍄", tam: 30, capa: 1 }, { x: 2620, y: 300, e: "🕯️", tam: 32, capa: 0 },
        { x: 2950, y: 300, e: "🌱", tam: 30, capa: 1 }, { x: 3150, y: 300, e: "🌼", tam: 28, capa: 1 },
        ...nubes([500, 1300, 2100, 2900], "🦇")
      ],
      premio
    },

    /* ---------- 5. Montaña: HIELO (H) ---------- */
    montana: {
      id: "montana", nombre: "La montaña", icono: "❄️", regla: "H",
      titulo: "El río helado",
      intro: "Un río de agua helada baja de la montaña. Forma la palabra mágica para congelarlo y cruzar.",
      ancho: 3600, inicio: { x: 280 }, limites: [210, 3390],
      tema: { cielo: ["#cfe6ff", "#f4f9ff"], colinas: ["#e8f1fb", "#d3e3f5"], tierra: "#8d9db5", tierraOsc: "#7a8aa3", hierba: "#ffffff", hierbaOsc: "#dbe7f3",
        plataforma: "#7d8fa8", agua: ["#7ec8f0", "#4fa6d8"], nieve: true },
      solidos: [suelo(0, 2450), suelo(2690, 910), roca(760, 64, 38), tocon(1200, 70, 56), roca(1950, 56, 34)],
      plataformas: [
        { x: 400, y: 214, w: 140 }, { x: 580, y: 150, w: 120 }, { x: 950, y: 205, w: 140 }, { x: 1450, y: 210, w: 130 },
        { x: 1630, y: 140, w: 140 }, { x: 2200, y: 204, w: 140 }, { x: 2900, y: 210, w: 140 }
      ],
      obstaculos: [{
        tipo: "rio", x: 2450, w: 240, solucion: "hielo", palabra: "HIELO",
        reto: { enunciado: "Forma la palabra que congela el río. ¡Ojo, hay una letra de más!", imagen: "🧊",
          definicion: "Es agua tan fría que se vuelve dura.", decir: "hielo",
          trampa: { letra: "Y", explicacion: "Hielo empieza por H: las palabras que empiezan por hie- llevan H, como hierba y hiena." },
          boton: "¡A CONGELAR! 🧊", tras: "¡El río se ha helado! Crúzalo con cuidado 🧊" }
      }],
      letras: [{ l: "L", x: 470, y: 170 }, { l: "O", x: 640, y: 106 }, { l: "H", x: 1235, y: 200 }, { l: "E", x: 1700, y: 96 }, { l: "I", x: 2270, y: 160 }],
      meta: { x: 3250 },
      deco: [
        { x: 60, y: 300, e: "🌲", tam: 110, capa: 0 }, { x: 330, y: 300, e: "⛄", tam: 50, capa: 1 }, { x: 860, y: 300, e: "🌲", tam: 100, capa: 0 },
        { x: 1100, y: 300, e: "🏔️", tam: 150, capa: 0 }, { x: 1380, y: 300, e: "🌲", tam: 106, capa: 0 }, { x: 1850, y: 300, e: "⛄", tam: 46, capa: 1 },
        { x: 2120, y: 300, e: "🌲", tam: 110, capa: 0 }, { x: 2390, y: 300, e: "🪧", tam: 44, capa: 0 }, { x: 2780, y: 300, e: "🌲", tam: 104, capa: 0 },
        { x: 3100, y: 300, e: "🏔️", tam: 150, capa: 0 }, { x: 3480, y: 300, e: "🌲", tam: 110, capa: 0 },
        ...nubes([350, 1250, 2200, 3000])
      ],
      premio
    },

    /* ---------- 6. Castillo: BALSA (S / Z) y REJA (G / J) ---------- */
    castillo: {
      id: "castillo", nombre: "El castillo", icono: "🏰", regla: "S / Z · G / J",
      titulo: "El castillo de las palabras",
      intro: "¡El último reto! Cruza el foso del castillo y abre su reja. Necesitarás dos palabras.",
      ancho: 4000, inicio: { x: 280 }, limites: [210, 3790],
      tema: { cielo: ["#c9b8ff", "#f3ecff"], colinas: ["#d6cdee", "#bcb0e0"], hierba: "#7ccf6f" },
      solidos: [suelo(0, 1800), suelo(2100, 1900), roca(760, 64, 38), tocon(1100, 70, 56), roca(2650, 60, 38)],
      plataformas: [
        { x: 400, y: 214, w: 140 }, { x: 580, y: 150, w: 120 }, { x: 900, y: 205, w: 140 }, { x: 1250, y: 210, w: 130 }, { x: 1430, y: 145, w: 140 },
        { x: 2300, y: 214, w: 140 }, { x: 2480, y: 150, w: 120 }, { x: 2800, y: 205, w: 140 }, { x: 3050, y: 150, w: 120 }
      ],
      obstaculos: [
        {
          tipo: "rio", x: 1800, w: 300, solucion: "balsa", palabra: "BALSA",
          reto: { enunciado: "Forma la palabra que cruza el foso. ¡Ojo, hay una letra de más!", imagen: "🪵",
            definicion: "Unos troncos atados que flotan en el agua.", decir: "balsa",
            trampa: { letra: "Z", explicacion: "Balsa se escribe con S." },
            boton: "¡A FLOTAR! 🪵", tras: "¡Tu balsa está lista! Súbete para cruzar el foso 🪵" }
        },
        {
          tipo: "puerta", x: 3300, solucion: "abrir", estilo: "reja", palabra: "REJA",
          reto: { enunciado: "Forma la palabra que abre la entrada del castillo. ¡Ojo, hay una letra de más!", imagen: "🏰",
            definicion: "Barrotes de hierro que cierran una entrada.", decir: "reja",
            trampa: { letra: "G", explicacion: "Reja se escribe con J, como oreja y abeja." },
            boton: "¡A ABRIR! 🏰", tras: "¡La reja se ha abierto! Entra en el castillo 🏰" }
        }
      ],
      letras: [
        { l: "S", x: 470, y: 170, o: 0 }, { l: "A", x: 640, y: 106, o: 0 }, { l: "B", x: 970, y: 161, o: 0 }, { l: "L", x: 1500, y: 101, o: 0 }, { l: "A", x: 1650, y: 252, o: 0 },
        { l: "E", x: 2370, y: 170, o: 1 }, { l: "J", x: 2540, y: 106, o: 1 }, { l: "A", x: 2870, y: 161, o: 1 }, { l: "R", x: 3110, y: 106, o: 1 }
      ],
      meta: { x: 3620 },
      deco: [
        { x: 60, y: 300, e: "🌳", tam: 116, capa: 0 }, { x: 340, y: 300, e: "🚩", tam: 40, capa: 0 }, { x: 700, y: 300, e: "🌳", tam: 120, capa: 0 },
        { x: 1050, y: 300, e: "🛡️", tam: 34, capa: 1 }, { x: 1350, y: 300, e: "🚩", tam: 40, capa: 0 }, { x: 1720, y: 300, e: "🪧", tam: 44, capa: 0 },
        { x: 2200, y: 300, e: "🚩", tam: 40, capa: 0 }, { x: 2600, y: 300, e: "🌳", tam: 116, capa: 0 }, { x: 3000, y: 300, e: "🛡️", tam: 34, capa: 1 },
        { x: 3200, y: 300, e: "🚩", tam: 40, capa: 0 }, { x: 3820, y: 300, e: "🏰", tam: 190, capa: 0 },
        ...nubes([300, 1200, 2200, 3100])
      ],
      premio
    }
  };

  /* ---------- Niveles de tildes y puntuación ----------
     Comparten el mismo recorrido de plataformas; cambian el escenario, el obstáculo y la palabra.
     En los de puntuación, los signos (¡ ! ¿ ?) se recogen como una ficha más y hay que colocarlos en su sitio. */
  const PLATAFORMAS = [
    { x: 400, y: 214, w: 140 }, { x: 580, y: 150, w: 120 }, { x: 900, y: 200, w: 140 }, { x: 1250, y: 210, w: 130 },
    { x: 1430, y: 145, w: 140 }, { x: 2000, y: 205, w: 150 }, { x: 2250, y: 150, w: 130 }
  ];
  const ROCAS = [roca(780, 64, 38), tocon(1150, 70, 56), roca(1900, 56, 34)];
  // Sitios para las letras, en orden de recorrido (encima de plataformas, en el suelo o para coger saltando).
  const SITIOS = [[470, 170], [640, 106], [970, 156], [1110, 252], [1320, 166], [1500, 101], [1780, 190], [2075, 161], [2315, 106]];
  // Reparte las letras de «orden» (ya desordenadas) por los sitios indicados.
  const repartir = (orden, sitios) => [...orden].map((l, k) => ({ l, x: SITIOS[sitios[k]][0], y: SITIOS[sitios[k]][1] }));

  Object.assign(PV.EXPEDICION_NIVELES, {

    /* ---------- 7. Selva: TABLÓN (tilde en las agudas) ---------- */
    selva: {
      id: "selva", nombre: "La selva", icono: "🌴", regla: "Tildes: agudas",
      titulo: "El tablón de la selva",
      intro: "Un río salvaje corta la selva. Busca las letras y forma la palabra que te dejará cruzarlo. ¡Fíjate en las tildes!",
      ancho: 3640, inicio: { x: 280 }, limites: [210, 3430],
      tema: { cielo: ["#c8f0d0", "#effbe8"], colinas: ["#8fd18a", "#5fb35f"], hierba: "#4fae4a", hierbaOsc: "#3d8f3a", agua: ["#4fc3c9", "#2fa3a9"] },
      solidos: [suelo(0, 2500), suelo(2740, 900), ...ROCAS],
      plataformas: [...PLATAFORMAS, { x: 2900, y: 210, w: 140 }],
      obstaculos: [{
        tipo: "rio", x: 2500, w: 240, solucion: "puente", palabra: "TABLÓN",
        reto: { enunciado: "Forma la palabra que cruza el río. ¡Ojo, hay una letra de más!", imagen: "🪵",
          definicion: "Una tabla de madera grande y fuerte.", decir: "tablón",
          trampa: { letra: "O", explicacion: "Tablón lleva tilde: es aguda (suena fuerte al final, ta-BLÓN) y termina en n." },
          boton: "¡A CRUZAR! 🌴", tras: "¡El tablón está puesto! Crúzalo hasta la meta 🌴" }
      }],
      letras: repartir("LÓTNAB", [0, 1, 2, 5, 7, 8]),
      meta: { x: 3300 },
      deco: [
        { x: 60, y: 300, e: "🌴", tam: 120, capa: 0 }, { x: 330, y: 300, e: "🌺", tam: 30, capa: 1 }, { x: 720, y: 300, e: "🌴", tam: 130, capa: 0 },
        { x: 1020, y: 300, e: "🍌", tam: 30, capa: 1 }, { x: 1300, y: 300, e: "🌴", tam: 120, capa: 0 }, { x: 1650, y: 300, e: "🐒", tam: 40, capa: 1 },
        { x: 1850, y: 300, e: "🌺", tam: 30, capa: 1 }, { x: 2180, y: 300, e: "🌴", tam: 126, capa: 0 }, { x: 2430, y: 300, e: "🪧", tam: 44, capa: 0 },
        { x: 2820, y: 300, e: "🌺", tam: 30, capa: 1 }, { x: 3100, y: 300, e: "🌴", tam: 124, capa: 0 }, { x: 3560, y: 300, e: "🌴", tam: 120, capa: 0 },
        ...nubes([400, 1400, 2400, 3300], "🦜")
      ],
      premio
    },

    /* ---------- 8. Templo: BRÚJULA (tilde en las esdrújulas) ---------- */
    templo: {
      id: "templo", nombre: "El templo", icono: "🧭", regla: "Tildes: esdrújulas",
      titulo: "La brújula del templo",
      intro: "La puerta del templo antiguo solo se abre con una palabra que lleva tilde. Recoge sus letras.",
      ancho: 3600, inicio: { x: 280 }, limites: [210, 3390],
      tema: { cielo: ["#f9e3b4", "#fff6e0"], colinas: ["#e7cf98", "#d4b679"], tierra: "#b98a55", tierraOsc: "#9c7244", hierba: "#c9a86a", hierbaOsc: "#a98a52", plataforma: "#9c7244" },
      solidos: [suelo(0, 3600), ...ROCAS],
      plataformas: PLATAFORMAS,
      obstaculos: [{
        tipo: "puerta", x: 2700, solucion: "abrir", estilo: "madera", palabra: "BRÚJULA",
        reto: { enunciado: "Forma la palabra que abre el templo. ¡Ojo, hay una letra de más!", imagen: "🧭",
          definicion: "Su aguja señala siempre el norte para no perderse.", decir: "brújula",
          trampa: { letra: "U", explicacion: "Brújula lleva tilde: es esdrújula (suena fuerte en BRÚ-ju-la) y todas las esdrújulas llevan tilde." },
          boton: "¡A ABRIR! 🧭", tras: "¡El templo se ha abierto! Entra 🧭" }
      }],
      letras: repartir("ULBAJÚR", [0, 1, 2, 3, 5, 7, 8]),
      meta: { x: 3250 },
      deco: [
        { x: 60, y: 300, e: "🌵", tam: 76, capa: 0 }, { x: 330, y: 300, e: "🏺", tam: 34, capa: 1 }, { x: 720, y: 300, e: "🗿", tam: 80, capa: 0 },
        { x: 1050, y: 300, e: "🌵", tam: 70, capa: 0 }, { x: 1370, y: 300, e: "🏺", tam: 34, capa: 1 }, { x: 1700, y: 300, e: "🗿", tam: 84, capa: 0 },
        { x: 2150, y: 300, e: "🌵", tam: 76, capa: 0 }, { x: 2550, y: 300, e: "🏺", tam: 34, capa: 1 }, { x: 2950, y: 300, e: "🌴", tam: 110, capa: 0 },
        { x: 3450, y: 300, e: "🗿", tam: 80, capa: 0 },
        ...nubes([500, 1500, 2600])
      ],
      premio
    },

    /* ---------- 9. Valle del eco: ¡ÁBRETE! (signos de exclamación) ---------- */
    eco: {
      id: "eco", nombre: "El valle del eco", icono: "📣", regla: "Signos ¡ !",
      titulo: "La puerta que escucha",
      intro: "En el valle del eco hay una puerta que solo se abre si le gritas la palabra mágica… ¡con sus signos!",
      ancho: 3600, inicio: { x: 280 }, limites: [210, 3390],
      tema: { cielo: ["#bde3ff", "#eef7ff"], colinas: ["#b7dca9", "#8cc47e"] },
      solidos: [suelo(0, 3600), ...ROCAS],
      plataformas: PLATAFORMAS,
      obstaculos: [{
        tipo: "puerta", x: 2700, solucion: "abrir", estilo: "reja", palabra: "¡ÁBRETE!",
        reto: { enunciado: "Escribe la palabra mágica con sus signos. ¡Ojo, hay un signo de más!", imagen: "📣",
          definicion: "Se grita para que una puerta mágica se abra. Al gritar, se escribe entre ¡ y !.", decir: "¡Ábrete!",
          trampa: { letra: "¿", explicacion: "Para exclamar o gritar se usan ¡ al principio y ! al final. Los signos ¿ ? son para preguntar." },
          boton: "¡A GRITAR! 📣", tras: "¡La puerta te ha oído! Pasa 📣" }
      }],
      letras: repartir("E¡T!BÁRE", [0, 1, 2, 3, 5, 6, 7, 8]),
      meta: { x: 3250 },
      deco: [
        { x: 60, y: 300, e: "🌳", tam: 116, capa: 0 }, { x: 330, y: 300, e: "🌻", tam: 34, capa: 1 }, { x: 700, y: 300, e: "🐑", tam: 40, capa: 1 },
        { x: 1000, y: 300, e: "🏔️", tam: 150, capa: 0 }, { x: 1380, y: 300, e: "🌻", tam: 34, capa: 1 }, { x: 1700, y: 300, e: "🌳", tam: 120, capa: 0 },
        { x: 2150, y: 300, e: "🐑", tam: 40, capa: 1 }, { x: 2450, y: 300, e: "🏔️", tam: 160, capa: 0 }, { x: 2950, y: 300, e: "🌻", tam: 34, capa: 1 },
        { x: 3450, y: 300, e: "🌳", tam: 116, capa: 0 },
        ...nubes([300, 1200, 2100, 3000])
      ],
      premio
    },

    /* ---------- 10. Las nubes: ¿SUBIMOS? (signos de interrogación) ---------- */
    nubes: {
      id: "nubes", nombre: "Las nubes", icono: "☁️", regla: "Signos ¿ ?",
      titulo: "La escalera a las nubes",
      intro: "Tu mascota quiere subir a las nubes, pero antes hay que preguntarlo bien… ¡con sus signos!",
      ancho: 3900, inicio: { x: 280 }, limites: [210, 3690],
      tema: { cielo: ["#a8d8ff", "#e9f6ff"], colinas: ["#ffffff", "#e6f2ff"], tierra: "#f4f8fd", tierraOsc: "#dbe7f3", hierba: "#ffffff", hierbaOsc: "#cfe0f1", plataforma: "#dfeaf6" },
      solidos: [suelo(0, 2700), suelo(2700, 1200, 130), ...ROCAS],
      plataformas: PLATAFORMAS,
      obstaculos: [{
        tipo: "muro", x: 2700, arriba: 130, solucion: "escalera", palabra: "¿SUBIMOS?",
        reto: { enunciado: "Escribe la pregunta con sus signos. ¡Ojo, hay un signo de más!", imagen: "☁️",
          definicion: "Una pregunta para invitar a alguien a subir contigo. Al preguntar, se escribe entre ¿ y ?.", decir: "¿Subimos?",
          trampa: { letra: "¡", explicacion: "Las preguntas llevan ¿ al principio y ? al final. Los signos ¡ ! son para exclamar." },
          boton: "¡A SUBIR! ☁️", tras: "¡Escalera a las nubes! Sube hasta arriba ☁️" }
      }],
      letras: repartir("M?SU¿OBSI", [0, 1, 2, 3, 4, 5, 6, 7, 8]),
      meta: { x: 3480, y: 130 },
      deco: [
        { x: 60, y: 300, e: "🎈", tam: 44, capa: 0 }, { x: 330, y: 300, e: "🌈", tam: 80, capa: 0 }, { x: 760, y: 300, e: "🪁", tam: 40, capa: 0 },
        { x: 1050, y: 300, e: "🎈", tam: 44, capa: 0 }, { x: 1700, y: 300, e: "🌈", tam: 90, capa: 0 }, { x: 2150, y: 300, e: "🎈", tam: 44, capa: 0 },
        { x: 2600, y: 300, e: "🪧", tam: 44, capa: 0 }, { x: 2950, y: 130, e: "🌈", tam: 90, capa: 0 }, { x: 3300, y: 130, e: "🎈", tam: 44, capa: 0 },
        { x: 3700, y: 130, e: "🪁", tam: 40, capa: 0 },
        ...nubes([200, 700, 1300, 1900, 2500, 3100, 3600])
      ],
      premio
    }
  });
  PV.EXPEDICION_ORDEN.push("selva", "templo", "eco", "nubes");
})();
