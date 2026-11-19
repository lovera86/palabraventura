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
    ] },
  /* ===== Unidades para adultos (publico: "adulto") ===== */
  { id: "diac", publico: "adulto", nombre: "Biblioteca de la tilde diacrítica", icono: "📚", color: "#7c5cff", deco: ["📚", "🖋️", "🕯️", "📖", "🔖"], habilidades: ["diac"], x: 0, y: 0,
    personaje: { nombre: "Doña Tilde", icono: "👩‍🏫", rol: "la bibliotecaria" },
    misiones: [
      { id: "diac-1", titulo: "Tú, él y mí", reglas: ["tu-el-mi"],
        intro: "Los pronombres llevan tilde para no confundirse con sus gemelos: tú y tu, él y el, mí y mi.",
        gancho: "En el siguiente estante: sí, sé, té y dé…",
        decision: { pregunta: "¿Qué sección visitas?", a: { icono: "📜", texto: "Manuscritos antiguos", efecto: "hallazgo" }, b: { icono: "🗞️", texto: "Hemeroteca", efecto: "monedas" } } },
      { id: "diac-2", titulo: "Sí, sé, té y dé", reglas: ["si-se-te-de", "mas"],
        intro: "Monosílabos que cambian de significado con una tilde. Un clásico de las dudas.",
        gancho: "Ahora, las preguntas: qué, dónde, cuándo… ¿con tilde o sin ella?",
        decision: { pregunta: "Doña Tilde te recomienda:", a: { icono: "📘", texto: "Un diccionario raro", efecto: "hallazgo" }, b: { icono: "☕", texto: "Un té y monedas", efecto: "monedas" } } },
      { id: "diac-3", titulo: "Preguntas con tilde", reglas: ["interrog", "sin-tilde"],
        intro: "Interrogativos directos e indirectos… y palabras que nunca llevan tilde aunque lo parezca.",
        gancho: "Doña Tilde prepara su examen final…",
        decision: { pregunta: "¿Dónde te sientas a estudiar?", a: { icono: "🪟", texto: "Junto a la ventana", efecto: "hallazgo" }, b: { icono: "🛋️", texto: "En el sofá", efecto: "monedas" } } },
      { id: "diac-jefe", titulo: "El examen de la bibliotecaria", jefe: true, reglas: [],
        intro: "Doña Tilde mezcla todos los casos de tilde diacrítica. ¿Te los sabes todos?",
        gancho: "Te espera un café… y palabras que suenan igual.",
        decision: { pregunta: "Doña Tilde te regala:", a: { icono: "🖋️", texto: "Su pluma favorita", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "homo", publico: "adulto", nombre: "Café de los homófonos", icono: "☕", color: "#c97b4a", deco: ["☕", "🥐", "🍰", "🫖", "🧁"], habilidades: ["homo"], x: 0, y: 0,
    personaje: { nombre: "Homero", icono: "🧔", rol: "el camarero" },
    misiones: [
      { id: "homo-1", titulo: "A ver qué hay", reglas: ["a-ver", "hay-ahi-ay"],
        intro: "«A ver» o «haber»; «hay», «ahí» o «¡ay!». Suenan igual, pero no significan lo mismo.",
        gancho: "Homero ha hecho… ¿o echado? un café nuevo.",
        decision: { pregunta: "¿Qué pides?", a: { icono: "🥐", texto: "Un cruasán", efecto: "hallazgo" }, b: { icono: "🍪", texto: "Galletas", efecto: "monedas" } } },
      { id: "homo-2", titulo: "Hecho y echo", reglas: ["hecho-echo", "vaya-valla-baya"],
        intro: "Hacer y echar, ir y vallar… las H y las B/V que cambian todo el sentido.",
        gancho: "En la terraza se oyen más palabras gemelas…",
        decision: { pregunta: "¿Dónde te sientas?", a: { icono: "🌿", texto: "En la terraza", efecto: "hallazgo" }, b: { icono: "🪑", texto: "En la barra", efecto: "monedas" } } },
      { id: "homo-3", titulo: "Suena igual, se escribe distinto", reglas: ["otros-homo"],
        intro: "Tubo y tuvo, votar y botar, rallar y rayar… El contexto lo decide todo.",
        gancho: "Homero te reta a su prueba final…",
        decision: { pregunta: "Homero te ofrece:", a: { icono: "🍰", texto: "La tarta de la casa", efecto: "hallazgo" }, b: { icono: "🪙", texto: "La propina", efecto: "monedas" } } },
      { id: "homo-jefe", titulo: "El reto de Homero", jefe: true, reglas: [],
        intro: "Todos los homófonos del café en una sola ronda.",
        gancho: "En el club de al lado discuten sobre el porqué de las cosas…",
        decision: { pregunta: "De premio:", a: { icono: "🫖", texto: "Una tetera antigua", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "porq", publico: "adulto", nombre: "Club del porqué", icono: "🤔", color: "#ef6461", deco: ["🤔", "💬", "🗨️", "❔", "💡"], habilidades: ["porq"], x: 0, y: 0,
    personaje: { nombre: "Sócrates", icono: "🦉", rol: "el búho filósofo" },
    misiones: [
      { id: "porq-1", titulo: "Los cuatro porqués", reglas: ["porque"],
        intro: "Porque, por qué, porqué y por que. Cuatro formas, cuatro usos distintos.",
        gancho: "Sócrates pregunta: ¿sino o si no?",
        decision: { pregunta: "¿Con quién debates?", a: { icono: "🦉", texto: "Con Sócrates", efecto: "hallazgo" }, b: { icono: "🐦", texto: "Con un loro", efecto: "monedas" } } },
      { id: "porq-2", titulo: "Sino o si no", reglas: ["sino"],
        intro: "Una contrapone, la otra pone condiciones. Aprende a distinguirlas.",
        gancho: "¿A veces o aveces? ¿Sobre todo o sobretodo?",
        decision: { pregunta: "Elige tema de debate:", a: { icono: "🌍", texto: "El mundo", efecto: "hallazgo" }, b: { icono: "🍕", texto: "La pizza", efecto: "monedas" } } },
      { id: "porq-3", titulo: "¿Juntas o separadas?", reglas: ["juntas"],
        intro: "A veces, sobre todo, o sea, a lo mejor… expresiones que se escriben separadas.",
        gancho: "Sócrates prepara la gran pregunta final…",
        decision: { pregunta: "Sócrates te ofrece:", a: { icono: "📜", texto: "Un pergamino", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "porq-jefe", titulo: "La gran pregunta", jefe: true, reglas: [],
        intro: "¿Por qué, porque o porqué? Sócrates lo mezcla todo.",
        gancho: "En la oficina de al lado, alguien corrige textos…",
        decision: { pregunta: "De premio:", a: { icono: "💡", texto: "Una idea brillante", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "gram", publico: "adulto", nombre: "Oficina de dudas", icono: "📮", color: "#3aa76d", deco: ["📮", "✍️", "📎", "🗂️", "📝"], habilidades: ["gram"], x: 0, y: 0,
    personaje: { nombre: "Rosa", icono: "👩‍💼", rol: "la correctora" },
    misiones: [
      { id: "gram-1", titulo: "Hubo, no hubieron", reglas: ["haber-impersonal"],
        intro: "«Haber» y «hacer» impersonales van en singular. Uno de los errores más comunes.",
        gancho: "Rosa revisa ahora los «de que»…",
        decision: { pregunta: "¿Qué carpeta abres?", a: { icono: "🗂️", texto: "La de los casos raros", efecto: "hallazgo" }, b: { icono: "📁", texto: "La de facturas", efecto: "monedas" } } },
      { id: "gram-2", titulo: "De que o que", reglas: ["dequeismo", "queismo"],
        intro: "Dequeísmo y queísmo: el truco de cambiar por «eso» lo resuelve casi siempre.",
        gancho: "Ahora tocan las órdenes y los pronombres…",
        decision: { pregunta: "Rosa te pide ayuda con:", a: { icono: "✉️", texto: "Una carta", efecto: "hallazgo" }, b: { icono: "📧", texto: "Un correo", efecto: "monedas" } } },
      { id: "gram-3", titulo: "Órdenes y pronombres", reglas: ["imperativo", "pronombres", "laismo"],
        intro: "Id, venid, sentaos; detrás de mí; le o la. Dudas del día a día.",
        gancho: "Rosa prepara la corrección final…",
        decision: { pregunta: "Rosa te ofrece:", a: { icono: "🖊️", texto: "Su boli rojo", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "gram-jefe", titulo: "La corrección final", jefe: true, reglas: [],
        intro: "Un texto lleno de dudas gramaticales. Rosa confía en ti.",
        gancho: "Desde el observatorio se ven tildes muy difíciles…",
        decision: { pregunta: "De premio:", a: { icono: "📎", texto: "Un clip de oro", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "tild2", publico: "adulto", nombre: "Observatorio de las tildes", icono: "🔭", color: "#2f80ed", deco: ["🔭", "🌙", "⭐", "🪐", "☄️"], habilidades: ["tild2"], x: 0, y: 0,
    personaje: { nombre: "Galileo", icono: "🧑‍🔬", rol: "el astrónomo" },
    misiones: [
      { id: "tild2-1", titulo: "Hiatos y diptongos", reglas: ["hiato", "diptongo"],
        intro: "Día, maíz, reír… y huir o cuidado, que no llevan tilde. Las vocales que se separan (o no).",
        gancho: "Galileo enfoca ahora los adverbios en -mente…",
        decision: { pregunta: "¿Qué observas?", a: { icono: "🪐", texto: "Saturno", efecto: "hallazgo" }, b: { icono: "🌙", texto: "La luna", efecto: "monedas" } } },
      { id: "tild2-2", titulo: "Adverbios y mayúsculas", reglas: ["mente", "mayusculas"],
        intro: "Fácilmente conserva la tilde, y Álvaro también, aunque vaya en mayúscula.",
        gancho: "Algunos plurales cambian la tilde de sitio…",
        decision: { pregunta: "Galileo te enseña:", a: { icono: "☄️", texto: "Un cometa", efecto: "hallazgo" }, b: { icono: "⭐", texto: "Una estrella", efecto: "monedas" } } },
      { id: "tild2-3", titulo: "Plurales traviesos", reglas: ["plurales"],
        intro: "Examen → exámenes, camión → camiones, carácter → caracteres. La tilde se mueve.",
        gancho: "Galileo prepara su última observación…",
        decision: { pregunta: "Galileo te ofrece:", a: { icono: "🔭", texto: "Mirar por su telescopio", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "tild2-jefe", titulo: "La noche de las tildes", jefe: true, reglas: [],
        intro: "Todas las tildes avanzadas en una noche estrellada.",
        gancho: "Te espera el Gran Repaso…",
        decision: { pregunta: "De premio:", a: { icono: "🌌", texto: "Un mapa estelar", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "repaso-adultos", publico: "adulto", nombre: "Gran Repaso", icono: "🎓", color: "#ff7aa8", deco: ["🎓", "🏆", "📜", "✨", "🎉"], habilidades: ["diac", "homo", "porq", "gram", "tild2"], x: 0, y: 0,
    personaje: { nombre: "La Rectora", icono: "👩‍🎓", rol: "de la Academia" },
    misiones: [
      { id: "repaso-1", titulo: "Repaso mixto", reglas: [],
        intro: "Un poco de todo: tildes, homófonos, porqués y dudas gramaticales.",
        gancho: "La Rectora te espera para el examen final…",
        decision: { pregunta: "¿Cómo repasas?", a: { icono: "📝", texto: "Con apuntes", efecto: "hallazgo" }, b: { icono: "🎧", texto: "Con música", efecto: "monedas" } } },
      { id: "repaso-jefe", titulo: "Examen final", jefe: true, reglas: [],
        intro: "La prueba definitiva de la Academia.",
        gancho: "¡Enhorabuena! Puedes seguir repasando cuando quieras.",
        decision: { pregunta: "La Rectora te entrega:", a: { icono: "🎓", texto: "El diploma", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "repaso-libre", titulo: "Repaso libre", infinita: true, reglas: [],
        intro: "Repasa las palabras que más te han costado.",
        gancho: "Siempre se puede afinar un poco más.",
        decision: { pregunta: "¿Qué prefieres?", a: { icono: "📖", texto: "Leer", efecto: "hallazgo" }, b: { icono: "✏️", texto: "Escribir", efecto: "monedas" } } }
    ] },
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
  { id: "pluma-oca", zona: "diac", icono: "🪶", nombre: "Pluma de oca", rareza: "comun" },
  { id: "marcapaginas", zona: "diac", icono: "🔖", nombre: "Marcapáginas", rareza: "comun" },
  { id: "lupa", zona: "diac", icono: "🔍", nombre: "Lupa de lectura", rareza: "comun" },
  { id: "incunable", zona: "diac", icono: "📕", nombre: "Libro incunable", rareza: "rara" },
  { id: "taza-cafe", zona: "homo", icono: "☕", nombre: "Taza de café", rareza: "comun" },
  { id: "cruasan", zona: "homo", icono: "🥐", nombre: "Cruasán dorado", rareza: "comun" },
  { id: "tarta", zona: "homo", icono: "🍰", nombre: "Tarta de la casa", rareza: "comun" },
  { id: "tetera", zona: "homo", icono: "🫖", nombre: "Tetera antigua", rareza: "rara" },
  { id: "bocadillo-dialogo", zona: "porq", icono: "💬", nombre: "Bocadillo de diálogo", rareza: "comun" },
  { id: "bombilla-idea", zona: "porq", icono: "💡", nombre: "Bombilla de ideas", rareza: "comun" },
  { id: "balanza", zona: "porq", icono: "⚖️", nombre: "Balanza del debate", rareza: "comun" },
  { id: "laurel", zona: "porq", icono: "🏛️", nombre: "Templo del saber", rareza: "rara" },
  { id: "clip", zona: "gram", icono: "📎", nombre: "Clip de oro", rareza: "comun" },
  { id: "boli-rojo", zona: "gram", icono: "🖊️", nombre: "Boli de corregir", rareza: "comun" },
  { id: "sobre", zona: "gram", icono: "✉️", nombre: "Carta sellada", rareza: "comun" },
  { id: "sello", zona: "gram", icono: "📮", nombre: "Buzón de la oficina", rareza: "rara" },
  { id: "luna", zona: "tild2", icono: "🌙", nombre: "Luna creciente", rareza: "comun" },
  { id: "planeta", zona: "tild2", icono: "🪐", nombre: "Planeta anillado", rareza: "comun" },
  { id: "cometa-estelar", zona: "tild2", icono: "☄️", nombre: "Cometa", rareza: "comun" },
  { id: "galaxia", zona: "tild2", icono: "🌌", nombre: "Mapa de la galaxia", rareza: "rara" },
  { id: "diploma", zona: "repaso-adultos", icono: "📜", nombre: "Diploma de la Academia", rareza: "rara" },
  { id: "birrete-oro", zona: "repaso-adultos", icono: "🎓", nombre: "Birrete de honor", rareza: "epica" },
  { id: "copa", zona: "repaso-adultos", icono: "🏆", nombre: "Copa de la ortografía", rareza: "epica" },
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
  "tu-el-mi": "¿Es un pronombre (tú vienes, para mí, a él) o acompaña a un nombre (tu casa, el perro)?",
  "si-se-te-de": "¿Es un verbo (sé, dé), una afirmación (sí), una bebida (té)… o una palabra de enlace?",
  "mas": "¿Indica cantidad? Entonces es «más». «Mas» sin tilde significa «pero».",
  "interrog": "¿Hay una pregunta o exclamación, aunque sea indirecta (no sé…, dime…)?",
  "sin-tilde": "Recuerda: los monosílabos (fue, dio, ti) no llevan tilde, y «solo» y «este» tampoco.",
  "a-ver": "¿Se puede cambiar por «vamos a ver»? Entonces es «a ver».",
  "hecho-echo": "¿Viene de hacer (con H) o de echar (sin H)?",
  "hay-ahi-ay": "¿Existe algo (hay), es un lugar (ahí) o es una queja (¡ay!)?",
  "vaya-valla-baya": "¿Es del verbo ir, una cerca o un fruto?",
  "otros-homo": "Piensa en el significado de la frase: ¿qué palabra encaja?",
  "porque": "¿Pregunta (por qué), da una causa (porque), es «el motivo» (porqué) o equivale a «por el que» (por que)?",
  "sino": "¿Contrapone ideas (sino) o pone una condición (si no)?",
  "juntas": "Muchas expresiones se escriben siempre separadas: a veces, sobre todo, o sea, a lo mejor.",
  "haber-impersonal": "¿«Haber» o «hacer» indican existencia o tiempo? Entonces van en singular.",
  "dequeismo": "Cambia la parte de «que…» por «eso»: ¿dirías «pienso de eso»?",
  "queismo": "Cambia la parte de «que…» por «eso»: ¿dirías «me acuerdo de eso»?",
  "pronombres": "Con detrás, delante, cerca… se dice «de mí», «de ti».",
  "imperativo": "¿Es una orden a «vosotros»? El imperativo acaba en -d (y pierde la -d con «os»).",
  "laismo": "¿«La» es lo que se da/dice o es la persona que lo recibe? A quien lo recibe se le dice «le».",
  "hiato": "¿Hay una i o una u tónica pegada a a, e u o? Entonces lleva tilde.",
  "diptongo": "Divide en sílabas y busca la sílaba fuerte; luego aplica la regla de agudas y llanas.",
  "mente": "¿El adjetivo lleva tilde? El adverbio en -mente la conserva.",
  "mayusculas": "Las mayúsculas se acentúan igual que las minúsculas.",
  "plurales": "Divide el plural en sílabas: ¿dónde cae ahora la fuerza? ¿Es aguda, llana o esdrújula?",
  "aguda": "Di la palabra en voz alta. ¿La sílaba más fuerte es la última? ¿En qué letra acaba?",
  "llana": "Di la palabra en voz alta. ¿La sílaba más fuerte es la penúltima? ¿En qué letra acaba?",
  "esdrujula": "Di la palabra en voz alta. ¿La sílaba más fuerte es la antepenúltima? Si es así, siempre lleva tilde."
};

/* ---------- Progreso en el mundo (funciones puras sobre el progreso P) ---------- */
PV.mundo = (function () {
  // Zonas que ve cada tipo de jugador: los niños ven las suyas y los adultos, las de adultos.
  function zonas(P) { const t = (P && P.tipo) || "nino"; return PV.ZONAS.filter(z => (z.publico || "nino") === t); }
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
    const zs = zonas(P);
    for (const z of zs) {
      if (!abierta(P, z)) continue;
      for (let k = 0; k < z.misiones.length; k++) {
        if (estadoMision(P, z, k) === "disponible") return { zona: z, k, mision: z.misiones[k] };
      }
    }
    // Todo completado: patrulla del reino (o la última zona abierta).
    const c = zs[zs.length - 1];
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
  return { zonas, hechas, totalMisiones, completada, abierta, requisito, misionDisponible, estadoMision, siguiente, buscar, despues, etapa };
})();
