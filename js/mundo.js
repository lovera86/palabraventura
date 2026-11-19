/* Palabraventura · el mundo: zonas del mapa, misiones, objetos de colección, etapas del compañero y pistas.
   Todo es configuración: para añadir una zona nueva basta con añadir un objeto a PV.ZONAS (con su posición en el mapa)
   y sus objetos a PV.COLECCION. El mapa, las pantallas y el progreso se adaptan solos. */

/* Posición x/y en un lienzo de 300 × 520 (el mapa se escala al ancho de la pantalla). */
PV.ZONAS = [
  { id: "bv", nombre: "Ciudad de B/V", icono: "🏘️", color: "#ffb347", deco: ["🏘️", "📚", "🚲", "🔔", "🌳"], habilidades: ["bv"], x: 80, y: 455,
    personaje: { nombre: "Bruno", icono: "🧙‍♂️", rol: "el bibliotecario" },
    misiones: [
      { id: "bv-1", titulo: "Los carteles revueltos", reglas: ["bl-br", "bu", "bi"],
        intro: "¡Un viento travieso ha revuelto los carteles de la ciudad! Ayuda a Bruno a dejarlos bien.",
        gancho: "Los carteles ya se leen… pero en la biblioteca alguien ha perdido sus letras.",
        decision: { pregunta: "¿Cómo recorres la ciudad?", a: { icono: "🚲", texto: "En bici, por las calles", efecto: "hallazgo" }, b: { icono: "🛶", texto: "En barca, por los canales", efecto: "monedas" } } },
      { id: "bv-2", titulo: "El diario del abuelo", reglas: ["aba", "bir", "ivo", "nv"],
        intro: "El abuelo de Bruno escribía un diario de viajes, pero las B y las V se han escapado de sus páginas.",
        gancho: "El diario habla de un mercado donde se venden palabras…",
        decision: { pregunta: "¿Qué página lees primero?", a: { icono: "🗺️", texto: "La del mapa secreto", efecto: "hallazgo" }, b: { icono: "💰", texto: "La del tesoro olvidado", efecto: "monedas" } } },
      { id: "bv-3", titulo: "El mercado de palabras", reglas: ["bv-vocab"],
        intro: "En el mercado cada puesto vende una palabra. ¡Algunas vienen con la letra equivocada!",
        gancho: "Se oyen pasos enormes junto a la puerta de la ciudad…",
        decision: { pregunta: "¿A qué puesto vas?", a: { icono: "🧺", texto: "Al de las rarezas", efecto: "hallazgo" }, b: { icono: "🍯", texto: "Al de la miel dorada", efecto: "monedas" } } },
      { id: "bv-jefe", titulo: "El Guardián de la Puerta", jefe: true, reglas: [],
        intro: "El Guardián solo deja pasar a quien distingue la B de la V. ¡Demuéstrale todo lo que has aprendido!",
        gancho: "Más allá de la puerta, una niebla espesa cubre el pantano…",
        decision: { pregunta: "El Guardián te ofrece un regalo:", a: { icono: "🎁", texto: "Su objeto más raro", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Una bolsa de monedas", efecto: "monedas" } } }
    ] },
  { id: "h", nombre: "Pantano de la H", icono: "🐸", color: "#6cc070", deco: ["🐸", "🪷", "🍄", "🌿", "🦆"], habilidades: ["h"], x: 220, y: 360,
    personaje: { nombre: "Hilda", icono: "🐸", rol: "la rana del pantano" },
    misiones: [
      { id: "h-1", titulo: "Huellas en el barro", reglas: ["hue", "hum"],
        intro: "La H no suena, así que en el pantano se esconde. Sigue las huellas con Hilda para encontrarla.",
        gancho: "Las huellas llevan a una cabaña donde se oyen voces raras…",
        decision: { pregunta: "Las huellas se separan. ¿Cuáles sigues?", a: { icono: "🦶", texto: "Las grandes", efecto: "hallazgo" }, b: { icono: "🐾", texto: "Las pequeñitas", efecto: "monedas" } } },
      { id: "h-2", titulo: "Los verbos perdidos", reglas: ["hacer", "hablar", "haber", "hola"],
        intro: "En la cabaña viven verbos que se han quedado sin su H. ¡Así no hay quien hable bien!",
        gancho: "Hilda ha visto algo brillar bajo los nenúfares…",
        decision: { pregunta: "¿A quién pides ayuda?", a: { icono: "🦉", texto: "Al búho sabio", efecto: "hallazgo" }, b: { icono: "🦆", texto: "A la pata viajera", efecto: "monedas" } } },
      { id: "h-3", titulo: "La H escondida", reglas: ["h-vocab", "intercalada", "sin-h"],
        intro: "Hay palabras con una H escondida en medio… ¡y otras que no la llevan aunque lo parezca!",
        gancho: "La niebla se espesa: algo grande se mueve en el centro del pantano.",
        decision: { pregunta: "¿Por dónde cruzas el agua?", a: { icono: "🪷", texto: "Saltando nenúfares", efecto: "hallazgo" }, b: { icono: "🪵", texto: "Por el tronco caído", efecto: "monedas" } } },
      { id: "h-jefe", titulo: "La Niebla Silenciosa", jefe: true, reglas: [],
        intro: "La Niebla Silenciosa se traga las H. Solo se disipa si cada palabra queda bien escrita.",
        gancho: "Cuando la niebla se va, se oye el rugido de una cascada…",
        decision: { pregunta: "La niebla deja algo atrás:", a: { icono: "✨", texto: "Un destello misterioso", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas mojadas", efecto: "monedas" } } }
    ] },
  { id: "lly", nombre: "Cascada de LL/Y", icono: "💧", color: "#4fb3e8", deco: ["💧", "🌈", "🐟", "☔", "🦫"], habilidades: ["lly"], x: 85, y: 265,
    personaje: { nombre: "Yago", icono: "🦫", rol: "el castor constructor" },
    misiones: [
      { id: "lly-1", titulo: "El castillo de -illo", reglas: ["illo"],
        intro: "Yago construye un castillo con palabras acabadas en -illo e -illa. ¡Necesita las piezas bien escritas!",
        gancho: "Desde lo alto del castillito se oye un eco que repite el final de las palabras…",
        decision: { pregunta: "¿Qué le pones al castillo?", a: { icono: "🚩", texto: "Una bandera", efecto: "hallazgo" }, b: { icono: "🪟", texto: "Una ventana", efecto: "monedas" } } },
      { id: "lly-2", titulo: "Ecos al final", reglas: ["yfinal", "verbos-y"],
        intro: "El eco de la cascada repite el final de las palabras: rey, hoy, muy… ¿Lo escribes bien?",
        gancho: "De repente empieza a llover… ¡pero llueven palabras!",
        decision: { pregunta: "¿Dónde escuchas el eco?", a: { icono: "🕳️", texto: "En la cueva", efecto: "hallazgo" }, b: { icono: "🌉", texto: "En el puente", efecto: "monedas" } } },
      { id: "lly-3", titulo: "Lluvia de palabras", reglas: ["ll-vocab", "y-vocab"],
        intro: "¡Llueven palabras! Recoge las que llevan LL y las que llevan Y antes de que se las lleve el río.",
        gancho: "El río se arremolina: algo gira en el centro de la cascada…",
        decision: { pregunta: "¿Con qué recoges las palabras?", a: { icono: "🧺", texto: "Con una cesta", efecto: "hallazgo" }, b: { icono: "☂️", texto: "Con un paraguas al revés", efecto: "monedas" } } },
      { id: "lly-jefe", titulo: "El Gran Remolino", jefe: true, reglas: [],
        intro: "El Gran Remolino mezcla las LL y las Y. ¡Ayuda a Yago a calmarlo palabra a palabra!",
        gancho: "Cuando el agua se calma, se ve una montaña muy alta con picos puntiagudos…",
        decision: { pregunta: "El remolino escupe algo:", a: { icono: "🫧", texto: "Una burbuja brillante", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Un chorro de monedas", efecto: "monedas" } } }
    ] },
  { id: "tildes", nombre: "Montaña de las Tildes", icono: "⛰️", color: "#a68cff", deco: ["⛰️", "🦅", "❄️", "🪁", "🌲"], habilidades: ["tildes"], x: 215, y: 170,
    personaje: { nombre: "Tilda", icono: "🐐", rol: "la cabra montañera" },
    misiones: [
      { id: "tildes-1", titulo: "La cima aguda", reglas: ["aguda"],
        intro: "Tilda sube hasta la última sílaba, la más alta. Allí viven las palabras agudas.",
        gancho: "Desde la cima se ve un sendero llano que baja serpenteando…",
        decision: { pregunta: "¿Cómo subes a la cima?", a: { icono: "🧗", texto: "Escalando", efecto: "hallazgo" }, b: { icono: "🚡", texto: "En teleférico", efecto: "monedas" } } },
      { id: "tildes-2", titulo: "El sendero llano", reglas: ["llana"],
        intro: "En el sendero llano manda la penúltima sílaba. ¡Ojo, que aquí las tildes van al revés que arriba!",
        gancho: "Al final del sendero hay una cueva muy, muy profunda…",
        decision: { pregunta: "¿Qué llevas en la mochila?", a: { icono: "🔦", texto: "Una linterna", efecto: "hallazgo" }, b: { icono: "🥪", texto: "Un bocadillo", efecto: "monedas" } } },
      { id: "tildes-3", titulo: "La cueva esdrújula", reglas: ["esdrujula"],
        intro: "En la cueva esdrújula todas las palabras llevan tilde. ¡Siempre! A ver si las encuentras.",
        gancho: "En lo más alto de la montaña, un eco gigante te está esperando…",
        decision: { pregunta: "La cueva tiene dos túneles:", a: { icono: "💎", texto: "El que brilla", efecto: "hallazgo" }, b: { icono: "🌬️", texto: "El que silba", efecto: "monedas" } } },
      { id: "tildes-jefe", titulo: "El Eco de la Cumbre", jefe: true, reglas: [],
        intro: "El Eco de la Cumbre repite las palabras sin tilde. ¡Pónselas y la montaña será tuya!",
        gancho: "A lo lejos aparece un castillo con cuatro puertas…",
        decision: { pregunta: "El Eco te deja elegir:", a: { icono: "🌠", texto: "Un recuerdo de la cumbre", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas del eco", efecto: "monedas" } } }
    ] },
  { id: "gj", nombre: "Cuevas de G/J", icono: "🦇", color: "#d98c5f", deco: ["🦇", "💎", "🕯️", "🪨", "🗝️"], habilidades: ["gj"], x: 42, y: 140,
    personaje: { nombre: "Gina", icono: "🦇", rol: "la murciélaga exploradora" },
    misiones: [
      { id: "gj-1", titulo: "El eco de los verbos", reglas: ["ger-gir", "j-verbos"],
        intro: "En las cuevas, el eco repite verbos… ¡pero mezcla la G y la J! Ayuda a Gina a ponerlas en su sitio.",
        gancho: "Al fondo de la cueva brilla algo: dicen que es un tesoro de palabras en -aje…",
        decision: { pregunta: "¿Por qué túnel vas?", a: { icono: "🔦", texto: "Por el oscuro, con linterna", efecto: "hallazgo" }, b: { icono: "💧", texto: "Por el del río subterráneo", efecto: "monedas" } } },
      { id: "gj-2", titulo: "El tesoro de -aje", reglas: ["aje", "jero"],
        intro: "Un viaje, un garaje, un pasajero… En esta galería todas las palabras terminan igual. ¿Las escribes bien?",
        gancho: "Se oye una guitarra a lo lejos… ¿quién toca en una cueva?",
        decision: { pregunta: "Encuentras dos cofres:", a: { icono: "🧰", texto: "El cofre viejo", efecto: "hallazgo" }, b: { icono: "💰", texto: "La bolsa pesada", efecto: "monedas" } } },
      { id: "gj-3", titulo: "Gigantes y guitarras", reglas: ["gen", "gia", "gue-gui", "gj-vocab"],
        intro: "Un gigante muy amable toca la guitarra en la cueva más grande. ¡Escribe bien sus canciones!",
        gancho: "El suelo tiembla: el Dragón de la Gruta se ha despertado…",
        decision: { pregunta: "El gigante te pregunta qué canción tocar:", a: { icono: "🎸", texto: "Una muy rápida", efecto: "hallazgo" }, b: { icono: "🎵", texto: "Una nana tranquila", efecto: "monedas" } } },
      { id: "gj-jefe", titulo: "El Dragón de la Gruta", jefe: true, reglas: [],
        intro: "El Dragón de la Gruta guarda la salida. Solo deja pasar a quien domina la G y la J.",
        gancho: "Al salir de la cueva se huele el mar: la Bahía está muy cerca…",
        decision: { pregunta: "El dragón te ofrece:", a: { icono: "💍", texto: "Un brillo de su tesoro", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Un puñado de monedas", efecto: "monedas" } } }
    ] },
  { id: "czs", nombre: "Bahía de C/Z/S", icono: "🐚", color: "#2ec4b6", deco: ["🐚", "⛵", "🐠", "🦀", "🌊"], habilidades: ["czs"], x: 262, y: 470,
    personaje: { nombre: "Zoe", icono: "🦭", rol: "la foca marinera" },
    misiones: [
      { id: "czs-1", titulo: "Cebras en el cielo", reglas: ["ce-ci", "za"],
        intro: "Zoe ha visto nubes con forma de cebra y de zapato. Escribe bien lo que ve antes de que se deshagan.",
        gancho: "Al caer la noche, el mar se llena de peces con luces…",
        decision: { pregunta: "¿Cómo navegas por la bahía?", a: { icono: "⛵", texto: "En velero", efecto: "hallazgo" }, b: { icono: "🛶", texto: "En canoa", efecto: "monedas" } } },
      { id: "czs-2", titulo: "Peces y luces", reglas: ["z-ces"],
        intro: "Un pez, dos peces. Una luz, muchas luces. ¡En el mar las palabras se multiplican!",
        gancho: "Por la mañana abre el mercado del puerto…",
        decision: { pregunta: "¿Qué miras primero?", a: { icono: "🐡", texto: "El pez globo", efecto: "hallazgo" }, b: { icono: "🦑", texto: "El calamar brillante", efecto: "monedas" } } },
      { id: "czs-3", titulo: "El mercado del puerto", reglas: ["czs-vocab"],
        intro: "En el mercado venden tazas, sopa y sillas… pero los carteles tienen la C, la Z y la S cambiadas.",
        gancho: "Se acerca una ola gigante…",
        decision: { pregunta: "¿Qué puesto visitas?", a: { icono: "🧺", texto: "El de los tesoros", efecto: "hallazgo" }, b: { icono: "🍦", texto: "El de los helados", efecto: "monedas" } } },
      { id: "czs-jefe", titulo: "La Gran Ola", jefe: true, reglas: [],
        intro: "La Gran Ola revuelve todas las letras. Solo se calma si escribes bien cada palabra.",
        gancho: "Cuando el mar se calma, aparece una torre llena de signos…",
        decision: { pregunta: "La ola deja en la arena:", a: { icono: "🔱", texto: "Algo que brilla", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas mojadas", efecto: "monedas" } } }
    ] },
  { id: "punt", nombre: "Torre de la Puntuación", icono: "🗼", color: "#5c7cfa", deco: ["❓", "❗", "✏️", "📜", "🔔"], habilidades: ["punt"], x: 262, y: 60,
    personaje: { nombre: "Coma", icono: "🐦", rol: "la golondrina de los signos" },
    misiones: [
      { id: "punt-1", titulo: "Preguntas y exclamaciones", reglas: ["pregunta", "exclamacion"],
        intro: "A los signos ¿? y ¡! se les ha perdido su pareja. ¡Ayuda a Coma a juntarlos!",
        gancho: "En el piso de arriba, los nombres han perdido su mayúscula…",
        decision: { pregunta: "¿Cómo subes por la torre?", a: { icono: "🪜", texto: "Por la escalera", efecto: "hallazgo" }, b: { icono: "🛗", texto: "En el ascensor", efecto: "monedas" } } },
      { id: "punt-2", titulo: "Nombres con mayúscula", reglas: ["mayus-nombres", "mayus-inicio", "dias-meses"],
        intro: "Personas, ciudades y mascotas quieren su mayúscula… pero los días y los meses no la llevan.",
        gancho: "Arriba del todo, las frases no saben cómo terminar…",
        decision: { pregunta: "¿Qué ventana abres?", a: { icono: "🌅", texto: "La del amanecer", efecto: "hallazgo" }, b: { icono: "🌙", texto: "La de la luna", efecto: "monedas" } } },
      { id: "punt-3", titulo: "Puntos y finales", reglas: ["punto", "pregunta", "mayus-inicio"],
        intro: "Cada frase necesita un buen final: un punto, una pregunta o una exclamación.",
        gancho: "El Guardián de los Signos te espera en lo más alto…",
        decision: { pregunta: "Coma te ofrece:", a: { icono: "✒️", texto: "Una pluma de tinta", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas de papel", efecto: "monedas" } } },
      { id: "punt-jefe", titulo: "El Guardián de los Signos", jefe: true, reglas: [],
        intro: "El Guardián revisa cada frase: signos, mayúsculas y puntos. ¡Demuéstrale lo que sabes!",
        gancho: "Desde lo alto de la torre ya se ve el Castillo de los Retos…",
        decision: { pregunta: "El Guardián te regala:", a: { icono: "🎖️", texto: "Su medalla", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Una bolsa de monedas", efecto: "monedas" } } }
    ] },
  { id: "castillo", nombre: "Castillo de los Retos", icono: "🏰", color: "#ff7aa8", deco: ["🏰", "🐉", "🛡️", "👑", "✨"], habilidades: ["bv", "h", "lly", "tildes", "gj", "czs", "punt"], x: 150, y: 62,
    requiereTodas: true,
    personaje: { nombre: "Ortiga", icono: "🐉", rol: "la dragona guardiana" },
    misiones: [
      { id: "castillo-1", titulo: "Las cuatro puertas", reglas: [],
        intro: "Cada puerta del castillo guarda una regla de las que ya conoces. ¡Ábrelas todas!",
        gancho: "Ortiga, la dragona, te espera en la torre más alta…",
        decision: { pregunta: "¿Qué puerta abres primero?", a: { icono: "🚪", texto: "La dorada", efecto: "hallazgo" }, b: { icono: "🗝️", texto: "La de hierro", efecto: "monedas" } } },
      { id: "castillo-jefe", titulo: "El Gran Desafío", jefe: true, reglas: [],
        intro: "Ortiga es una dragona simpática, pero exigente: quiere ver todo lo que has aprendido.",
        gancho: "¡Has conquistado el castillo! Ortiga vigilará tus palabras en las patrullas del reino.",
        decision: { pregunta: "Ortiga te ofrece:", a: { icono: "🥚", texto: "Un huevo misterioso", efecto: "hallazgo" }, b: { icono: "🪙", texto: "El tesoro del castillo", efecto: "monedas" } } },
      { id: "castillo-patrulla", titulo: "Patrulla del reino", infinita: true, reglas: [],
        intro: "Recorre el reino con Ortiga y repasa las palabras que más te han costado.",
        gancho: "Siempre hay algo nuevo que descubrir en el reino.",
        decision: { pregunta: "¿Por dónde patrullas hoy?", a: { icono: "🌲", texto: "Por el bosque", efecto: "hallazgo" }, b: { icono: "🏞️", texto: "Por el río", efecto: "monedas" } } }
    ] }
];

/* Zonas futuras: se ven en el mapa cubiertas de niebla, sin botón. */
PV.ZONAS_FUTURAS = []; // todas las zonas están disponibles

PV.RAREZAS = { comun: { nombre: "Común", peso: 60 }, rara: { nombre: "Rara", peso: 30 }, epica: { nombre: "Épica", peso: 10 } };

PV.COLECCION = [
  { id: "campana", zona: "bv", icono: "🔔", nombre: "Campana de la plaza", rareza: "comun" },
  { id: "pergamino", zona: "bv", icono: "📜", nombre: "Pergamino de Bruno", rareza: "comun" },
  { id: "globo", zona: "bv", icono: "🎈", nombre: "Globo viajero", rareza: "comun" },
  { id: "llave", zona: "bv", icono: "🗝️", nombre: "Llave de bronce", rareza: "rara" },
  { id: "corona-ciudad", zona: "bv", icono: "👑", nombre: "Corona de la ciudad", rareza: "epica" },
  { id: "nenufar", zona: "h", icono: "🪷", nombre: "Nenúfar de la suerte", rareza: "comun" },
  { id: "caracola", zona: "h", icono: "🐚", nombre: "Caracola muda", rareza: "comun" },
  { id: "seta", zona: "h", icono: "🍄", nombre: "Seta brillante", rareza: "comun" },
  { id: "farol", zona: "h", icono: "🏮", nombre: "Farol de la niebla", rareza: "rara" },
  { id: "gema", zona: "h", icono: "💎", nombre: "Gema silenciosa", rareza: "epica" },
  { id: "gota", zona: "lly", icono: "💧", nombre: "Gota de cascada", rareza: "comun" },
  { id: "pez", zona: "lly", icono: "🐟", nombre: "Pez saltarín", rareza: "comun" },
  { id: "concha", zona: "lly", icono: "🦪", nombre: "Concha con perla", rareza: "comun" },
  { id: "arcoiris", zona: "lly", icono: "🌈", nombre: "Arcoíris embotellado", rareza: "rara" },
  { id: "amuleto", zona: "lly", icono: "🧿", nombre: "Amuleto del castor", rareza: "epica" },
  { id: "pluma-aguila", zona: "tildes", icono: "🪶", nombre: "Pluma de águila", rareza: "comun" },
  { id: "copo", zona: "tildes", icono: "❄️", nombre: "Copo eterno", rareza: "comun" },
  { id: "cometa", zona: "tildes", icono: "🪁", nombre: "Cometa del viento", rareza: "comun" },
  { id: "brujula", zona: "tildes", icono: "🧭", nombre: "Brújula de la cumbre", rareza: "rara" },
  { id: "estrella-fugaz", zona: "tildes", icono: "🌠", nombre: "Estrella de la cima", rareza: "epica" },
  { id: "vasija", zona: "gj", icono: "🏺", nombre: "Vasija antigua", rareza: "comun" },
  { id: "linterna", zona: "gj", icono: "🔦", nombre: "Linterna minera", rareza: "comun" },
  { id: "hueso", zona: "gj", icono: "🦴", nombre: "Hueso de dinosaurio", rareza: "comun" },
  { id: "estatua", zona: "gj", icono: "🗿", nombre: "Estatua secreta", rareza: "rara" },
  { id: "anillo", zona: "gj", icono: "💍", nombre: "Anillo de la gruta", rareza: "epica" },
  { id: "pez-globo", zona: "czs", icono: "🐡", nombre: "Pez globo", rareza: "comun" },
  { id: "cangrejo", zona: "czs", icono: "🦀", nombre: "Cangrejo bailarín", rareza: "comun" },
  { id: "ancla", zona: "czs", icono: "⚓", nombre: "Ancla del puerto", rareza: "comun" },
  { id: "mapa-tesoro", zona: "czs", icono: "🗺️", nombre: "Mapa del tesoro", rareza: "rara" },
  { id: "tridente", zona: "czs", icono: "🔱", nombre: "Tridente del mar", rareza: "epica" },
  { id: "interrogacion", zona: "punt", icono: "❓", nombre: "Signo de pregunta", rareza: "comun" },
  { id: "signo-exclamacion", zona: "punt", icono: "❗", nombre: "Signo de exclamación", rareza: "comun" },
  { id: "pluma-tinta", zona: "punt", icono: "✒️", nombre: "Pluma de tinta", rareza: "comun" },
  { id: "libro-signos", zona: "punt", icono: "📖", nombre: "Libro de los signos", rareza: "rara" },
  { id: "medalla", zona: "punt", icono: "🎖️", nombre: "Medalla de la torre", rareza: "epica" },
  { id: "escudo", zona: "castillo", icono: "🛡️", nombre: "Escudo real", rareza: "rara" },
  { id: "trofeo", zona: "castillo", icono: "🏆", nombre: "Trofeo de los retos", rareza: "rara" },
  { id: "huevo-dragon", zona: "castillo", icono: "🥚", nombre: "Huevo de dragón", rareza: "epica" }
];

/* El compañero evoluciona con la experiencia (estrellas). Nunca retrocede. */
PV.ETAPAS = [
  { min: 0,   nombre: "Pequeño compañero" },
  { min: 50,  nombre: "Compañero explorador" },
  { min: 150, nombre: "Compañero valiente" },
  { min: 300, nombre: "Compañero legendario" }
];

/* Pistas por regla: orientan sin dar la respuesta. */
PV.PISTAS = {
  "bl-br": "Mira la letra que va justo detrás: ¿es una L o una R?",
  "nv": "Fíjate en la letra que va justo delante. ¿Es una N?",
  "aba": "¿Es un verbo que cuenta algo del pasado? Piensa en su infinitivo: ¿acaba en -AR?",
  "bir": "Piensa en el infinitivo. ¿Acaba en -BIR, como escribir? ¿O es de los especiales: vivir, hervir, servir?",
  "ivo": "¿La palabra acaba en -IVO o -IVA y dice cómo es algo?",
  "bu": "¿Cómo empieza la palabra? Fíjate en BU-, BUS-, BUR-.",
  "bi": "¿La palabra tiene que ver con «dos»?",
  "bv-vocab": "Esta no tiene regla: intenta recordar cómo la has visto escrita en libros o carteles.",
  "hue": "¿La palabra empieza por HUE-, HIE- o HUI-?",
  "hum": "¿La palabra empieza por HUM- y luego una vocal?",
  "hacer": "¿De qué verbo viene esta palabra? Piensa en hacer.",
  "hablar": "¿De qué verbo viene esta palabra? Piensa en hablar.",
  "haber": "¿Es una forma del verbo haber (hay, ha, he…)? ¿O es otra palabra que suena igual?",
  "hola": "¿Es un saludo o es algo del mar?",
  "h-vocab": "Esta no tiene regla: intenta recordar cómo la has visto escrita.",
  "intercalada": "A veces la H se esconde en medio de la palabra, entre dos vocales.",
  "sin-h": "Cuidado: no todas las palabras que empiezan por vocal llevan H.",
  "illo": "¿La palabra acaba en -ILLO o -ILLA?",
  "yfinal": "Fíjate en el final: ¿el sonido I va después de otra vocal?",
  "ll-vocab": "Esta no tiene regla: piensa en palabras de su familia (lluvia, llover…).",
  "y-vocab": "Esta no tiene regla: intenta recordar cómo la has visto escrita.",
  "verbos-y": "¿De qué verbo viene? Si el infinitivo no tiene LL ni Y (caer, leer, oír), va con Y.",
  "ger-gir": "¿Es un verbo acabado en -GER o -GIR, como coger o elegir?",
  "aje": "Fíjate en el final: ¿la palabra acaba en -AJE?",
  "jero": "Fíjate en el final: ¿acaba en -JERO o -JERA?",
  "gen": "¿La palabra tiene el grupo GEN, como gente o imagen?",
  "gia": "¿La palabra acaba en -GIA o -GÍA, como magia?",
  "j-verbos": "Piensa en el infinitivo (decir, traer). ¿Tiene G o J? Si no tiene ninguna, va con J.",
  "gue-gui": "¿La U se pronuncia? Si suena, lleva diéresis (gü). Si no suena, es gu.",
  "gj-vocab": "Esta no tiene regla: intenta recordar cómo la has visto escrita.",
  "ce-ci": "¿Qué vocal va después? Delante de E o I, el sonido Z suele escribirse con C.",
  "za": "¿Qué vocal va después? Delante de A, O o U, el sonido Z se escribe con Z.",
  "z-ces": "¿Es un plural? Piensa en el singular: si acaba en Z (pez, luz), el plural va con C.",
  "czs-vocab": "Dila en voz alta despacio: ¿suena como S o como Z?",
  "pregunta": "¿Es una pregunta? Las preguntas llevan ¿ al principio y ? al final.",
  "exclamacion": "¿Se dice con fuerza o sorpresa? Las exclamaciones llevan ¡ al principio y ! al final.",
  "mayus-inicio": "¿Es la primera palabra de la frase o va después de un punto?",
  "mayus-nombres": "¿Es el nombre de una persona, un animal o un lugar?",
  "dias-meses": "Recuerda: los días y los meses van con minúscula.",
  "punto": "¿La frase cuenta algo y termina ahí? Entonces necesita un punto.",
  "aguda": "Di la palabra en voz alta. ¿La sílaba más fuerte es la última? ¿En qué letra acaba?",
  "llana": "Di la palabra en voz alta. ¿La sílaba más fuerte es la penúltima? ¿En qué letra acaba?",
  "esdrujula": "Di la palabra en voz alta. ¿La sílaba más fuerte es la antepenúltima? Si es así, siempre lleva tilde."
};

/* ---------- Progreso en el mundo (funciones puras sobre el progreso P) ---------- */
PV.mundo = (function () {
  function hechas(P, zona) { return zona.misiones.filter(m => !m.infinita && P.misiones[m.id] && P.misiones[m.id].completada).length; }
  function totalMisiones(zona) { return zona.misiones.filter(m => !m.infinita).length; }
  function completada(P, zona) { return hechas(P, zona) >= totalMisiones(zona); }

  // Todo está abierto desde el principio: se puede jugar o repasar cualquier lección en cualquier momento.
  // (La «siguiente misión» solo es una sugerencia de por dónde seguir.)
  function abierta() { return true; }
  function requisito(P, zona) {
    const i = PV.ZONAS.indexOf(zona);
    if (zona.requiereTodas) return "Completa 2 misiones en cada zona";
    const prev = PV.ZONAS[i - 1];
    return `Completa ${Math.max(0, 2 - hechas(P, prev))} ${2 - hechas(P, prev) === 1 ? "misión" : "misiones"} más en ${prev.nombre}`;
  }
  function misionDisponible() { return true; }
  function estadoMision(P, zona, k) {
    const m = zona.misiones[k];
    if (!m.infinita && (P.misiones[m.id] || {}).completada) return "completada";
    return misionDisponible(P, zona, k) ? "disponible" : "bloqueada";
  }
  // Siguiente misión recomendada: la primera pendiente, en el orden del mapa.
  function siguiente(P) {
    for (const z of PV.ZONAS) {
      if (!abierta(P, z)) continue;
      for (let k = 0; k < z.misiones.length; k++) {
        if (estadoMision(P, z, k) === "disponible") return { zona: z, k, mision: z.misiones[k] };
      }
    }
    // Todo completado: patrulla del reino (o la última zona abierta).
    const c = PV.ZONAS[PV.ZONAS.length - 1];
    return { zona: c, k: c.misiones.length - 1, mision: c.misiones[c.misiones.length - 1] };
  }
  function buscar(idMision) {
    for (const z of PV.ZONAS) { const k = z.misiones.findIndex(m => m.id === idMision); if (k >= 0) return { zona: z, k, mision: z.misiones[k] }; }
    return null;
  }
  function despues(zona, k) {
    if (k + 1 < zona.misiones.length && !zona.misiones[k + 1].infinita) return { zona, mision: zona.misiones[k + 1] };
    const i = PV.ZONAS.indexOf(zona);
    if (i + 1 < PV.ZONAS.length) return { zona: PV.ZONAS[i + 1], mision: PV.ZONAS[i + 1].misiones[0] };
    return null;
  }
  function etapa(P) {
    let e = 0;
    PV.ETAPAS.forEach((x, i) => { if (P.estrellas >= x.min) e = i; });
    return e;
  }
  return { hechas, totalMisiones, completada, abierta, requisito, misionDisponible, estadoMision, siguiente, buscar, despues, etapa };
})();
