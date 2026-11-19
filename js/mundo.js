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
  { id: "lelo", publico: "adulto", nombre: "Plaza del le, la, lo", icono: "🗣️", color: "#e05d8a", deco: ["🗣️", "💬", "👂", "📣", "🎭"], habilidades: ["lelo"], x: 0, y: 0,
    personaje: { nombre: "Leonor", icono: "👩‍🦳", rol: "la gramática del barrio" },
    misiones: [
      { id: "lelo-1", titulo: "¿Le o la?", reglas: ["lelo-laismo", "lelo-leismo-fem"],
        intro: "«La dije», «la duele», «le vi» (a ella)… El laísmo y el leísmo femenino, en frases del día a día.",
        gancho: "Ahora le toca al «lo»: ¿lo dije o le dije?",
        decision: { pregunta: "¿Dónde escuchas conversaciones?", a: { icono: "🚌", texto: "En el autobús", efecto: "hallazgo" }, b: { icono: "🛒", texto: "En el mercado", efecto: "monedas" } } },
      { id: "lelo-2", titulo: "¿Le o lo?", reglas: ["lelo-loismo", "lelo-leismo-cosa", "lelo-leismo-plural"],
        intro: "Loísmo («los dije»), leísmo con cosas («el libro le compré») y leísmo en plural («les vi»).",
        gancho: "Lo más traicionero: «le dije a mis padres» y «se los dije»…",
        decision: { pregunta: "Leonor te propone:", a: { icono: "📻", texto: "Escuchar la radio", efecto: "hallazgo" }, b: { icono: "📺", texto: "Ver la tele", efecto: "monedas" } } },
      { id: "lelo-3", titulo: "Le, les y se lo", reglas: ["lelo-concord", "lelo-selos"],
        intro: "El error que casi todos cometemos: «le» con un plural. Y el «se los» que no toca.",
        gancho: "Leonor prepara su juicio final…",
        decision: { pregunta: "Leonor te regala:", a: { icono: "🎭", texto: "Una máscara de teatro", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "lelo-jefe", titulo: "El juicio de Leonor", jefe: true, reglas: [],
        intro: "Leísmos, laísmos, loísmos y concordancias mezclados. Solo para oídos finos.",
        gancho: "En la tertulia de al lado se oye «andé», «haiga» y «dijistes»…",
        decision: { pregunta: "De premio:", a: { icono: "🏅", texto: "La medalla de Leonor", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "habla", publico: "adulto", nombre: "Tertulia del buen hablar", icono: "🎙️", color: "#f2994a", deco: ["🎙️", "☕", "📰", "🗞️", "🎩"], habilidades: ["habla"], x: 0, y: 0,
    personaje: { nombre: "Don Ramón", icono: "👴", rol: "el tertuliano" },
    misiones: [
      { id: "habla-1", titulo: "Verbos rebeldes", reglas: ["verbos-irreg"],
        intro: "Andé, conducí, satisfació, cabió, preveyó, dijistes… Verbos que se conjugan mal muy a menudo.",
        gancho: "Don Ramón se pone serio con las expresiones…",
        decision: { pregunta: "¿De qué habla hoy la tertulia?", a: { icono: "⚽", texto: "De fútbol", efecto: "hallazgo" }, b: { icono: "🎬", texto: "De cine", efecto: "monedas" } } },
      { id: "habla-2", titulo: "Eso no se dice así", reglas: ["expresiones", "pronombres-orden", "condicional"],
        intro: "«Me se cayó», «contra más», «yo de ti», «delante mía», «si lo sabría»…",
        gancho: "Y por último, formas de cada zona que no son la norma culta…",
        decision: { pregunta: "Don Ramón te invita a:", a: { icono: "🎲", texto: "Una partida de dominó", efecto: "hallazgo" }, b: { icono: "🍵", texto: "Un café", efecto: "monedas" } } },
      { id: "habla-3", titulo: "De la calle a la norma", reglas: ["concord-ustedes", "vulgarismos", "verbos-irreg"],
        intro: "«Ustedes vais», «nadien», «cocreta», «almóndiga»… Formas vivas en el habla, pero no en la norma.",
        gancho: "Don Ramón prepara la gran tertulia…",
        decision: { pregunta: "De recuerdo:", a: { icono: "🎩", texto: "Su sombrero", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "habla-jefe", titulo: "La gran tertulia", jefe: true, reglas: [],
        intro: "Todo lo que no se dice… mezclado en una sola tertulia.",
        gancho: "En el laberinto de al lado, las palabras se parecen demasiado…",
        decision: { pregunta: "De premio:", a: { icono: "🎙️", texto: "Su micrófono", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "paron", publico: "adulto", nombre: "Laberinto de los parónimos", icono: "🌀", color: "#9b51e0", deco: ["🌀", "🔀", "🪞", "🧩", "❔"], habilidades: ["paron"], x: 0, y: 0,
    personaje: { nombre: "Paloma", icono: "🧙‍♀️", rol: "la hechicera de las palabras" },
    misiones: [
      { id: "paron-1", titulo: "Casi iguales", reglas: ["paron-par"],
        intro: "Infringir e infligir, aptitud y actitud, prejuicio y perjuicio… Se parecen, pero no son lo mismo.",
        gancho: "Más adentro, palabras que solo cambian en una letra…",
        decision: { pregunta: "¿Por qué pasillo vas?", a: { icono: "🪞", texto: "El de los espejos", efecto: "hallazgo" }, b: { icono: "🕯️", texto: "El de las velas", efecto: "monedas" } } },
      { id: "paron-2", titulo: "Una letra de diferencia", reglas: ["paron-letra"],
        intro: "Revelar o rebelar, desecho o deshecho, vasto o basto, cesión o sesión…",
        gancho: "En el centro del laberinto, palabras que no significan lo que parece…",
        decision: { pregunta: "Paloma te ofrece:", a: { icono: "🧩", texto: "Una pieza de puzle", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "paron-3", titulo: "¿Qué significa?", reglas: ["paron-signif"],
        intro: "Sendos, adolecer, detentar, lívido… Palabras que muchos usan con un significado equivocado.",
        gancho: "Paloma te espera en la salida del laberinto…",
        decision: { pregunta: "¿Qué puerta abres?", a: { icono: "🚪", texto: "La de madera", efecto: "hallazgo" }, b: { icono: "🔑", texto: "La dorada", efecto: "monedas" } } },
      { id: "paron-jefe", titulo: "La salida del laberinto", jefe: true, reglas: [],
        intro: "Todos los parónimos y falsos significados juntos. ¿Encuentras la salida?",
        gancho: "Al salir, un museo guarda las palabras más difíciles de escribir…",
        decision: { pregunta: "De premio:", a: { icono: "🔮", texto: "La bola de cristal", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "dific", publico: "adulto", nombre: "Museo de las palabras difíciles", icono: "🏛️", color: "#27ae60", deco: ["🏛️", "🖼️", "🗿", "🏺", "📜"], habilidades: ["dific"], x: 0, y: 0,
    personaje: { nombre: "Leandro", icono: "🧑‍🎨", rol: "el conservador del museo" },
    misiones: [
      { id: "dific-1", titulo: "Con H y con X", reglas: ["dific-hx"],
        intro: "Exhaustivo pero exuberante; ahínco y prohíbe con tilde; excavar con x…",
        gancho: "En la siguiente sala, palabras a las que les sobra o les falta una letra…",
        decision: { pregunta: "¿Qué sala visitas?", a: { icono: "🖼️", texto: "La de pintura", efecto: "hallazgo" }, b: { icono: "🗿", texto: "La de escultura", efecto: "monedas" } } },
      { id: "dific-2", titulo: "Letras de más y de menos", reglas: ["dific-letras"],
        intro: "Cónyuge, aeropuerto, inflación, objeción, meteorología… Letras que se cuelan o se escapan.",
        gancho: "La última sala guarda las palabras más traicioneras…",
        decision: { pregunta: "Leandro te enseña:", a: { icono: "🏺", texto: "Una vasija antigua", efecto: "hallazgo" }, b: { icono: "🪙", texto: "La tienda del museo", efecto: "monedas" } } },
      { id: "dific-3", titulo: "Palabras traicioneras", reglas: ["dific-trampa"],
        intro: "Idiosincrasia, desternillarse, dentífrico, espurio, absceso, expectación…",
        gancho: "Leandro prepara la visita final…",
        decision: { pregunta: "De recuerdo:", a: { icono: "📜", texto: "Un pergamino", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "dific-jefe", titulo: "La visita final", jefe: true, reglas: [],
        intro: "Todas las palabras difíciles del museo en un recorrido final.",
        gancho: "Para repasar lo básico, te espera «Lo esencial»…",
        decision: { pregunta: "De premio:", a: { icono: "🖋️", texto: "Una pluma de museo", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "esencial", publico: "adulto", nombre: "Lo esencial", icono: "📚", color: "#2f80ed", deco: ["📚", "☕", "🤔", "📮", "🔭"], habilidades: ["diac", "homo", "porq", "gram", "tild2"], x: 0, y: 0,
    personaje: { nombre: "Doña Tilde", icono: "👩‍🏫", rol: "la bibliotecaria" },
    misiones: [
      { id: "esencial-1", titulo: "Tildes que dudan", reglas: ["tu-el-mi", "si-se-te-de", "mas", "interrog", "sin-tilde", "hiato", "diptongo", "mente", "mayusculas", "plurales"],
        intro: "Tilde diacrítica, hiatos, adverbios en -mente y plurales que cambian.",
        gancho: "Ahora, palabras que suenan igual…",
        decision: { pregunta: "¿Dónde estudias?", a: { icono: "📚", texto: "En la biblioteca", efecto: "hallazgo" }, b: { icono: "☕", texto: "En el café", efecto: "monedas" } } },
      { id: "esencial-2", titulo: "Suena igual", reglas: ["a-ver", "hecho-echo", "hay-ahi-ay", "vaya-valla-baya", "otros-homo", "porque", "sino", "juntas"],
        intro: "Homófonos, porqués, sino/si no y expresiones que se escriben separadas.",
        gancho: "Para terminar, dudas gramaticales clásicas…",
        decision: { pregunta: "Te apetece:", a: { icono: "🥐", texto: "Un cruasán", efecto: "hallazgo" }, b: { icono: "🍪", texto: "Galletas", efecto: "monedas" } } },
      { id: "esencial-3", titulo: "Gramática básica", reglas: ["haber-impersonal", "dequeismo", "queismo", "pronombres", "imperativo", "laismo"],
        intro: "«Hubo», no «hubieron»; dequeísmo y queísmo; «id» y «sentaos».",
        gancho: "Doña Tilde te espera para el repaso final…",
        decision: { pregunta: "Doña Tilde te regala:", a: { icono: "🔖", texto: "Un marcapáginas", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } },
      { id: "esencial-jefe", titulo: "Examen de lo esencial", jefe: true, reglas: [],
        intro: "Todo lo básico mezclado. Ideal para no oxidarse.",
        gancho: "Te espera el Gran Repaso…",
        decision: { pregunta: "De premio:", a: { icono: "📕", texto: "Un libro antiguo", efecto: "hallazgo" }, b: { icono: "🪙", texto: "Monedas", efecto: "monedas" } } }
    ] },
  { id: "repaso-adultos", publico: "adulto", nombre: "Gran Repaso", icono: "🎓", color: "#ff7aa8", deco: ["🎓", "🏆", "📜", "✨", "🎉"], habilidades: ["lelo", "habla", "paron", "dific", "diac", "homo", "porq", "gram", "tild2"], x: 0, y: 0,
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
  { id: "pluma-oca", zona: "esencial", icono: "🪶", nombre: "Pluma de oca", rareza: "comun" },
  { id: "marcapaginas", zona: "esencial", icono: "🔖", nombre: "Marcapáginas", rareza: "comun" },
  { id: "lupa", zona: "esencial", icono: "🔍", nombre: "Lupa de lectura", rareza: "comun" },
  { id: "incunable", zona: "esencial", icono: "📕", nombre: "Libro incunable", rareza: "rara" },
  { id: "taza-cafe", zona: "esencial", icono: "☕", nombre: "Taza de café", rareza: "comun" },
  { id: "cruasan", zona: "esencial", icono: "🥐", nombre: "Cruasán dorado", rareza: "comun" },
  { id: "tarta", zona: "esencial", icono: "🍰", nombre: "Tarta de la casa", rareza: "comun" },
  { id: "tetera", zona: "esencial", icono: "🫖", nombre: "Tetera antigua", rareza: "rara" },
  { id: "bocadillo-dialogo", zona: "esencial", icono: "💬", nombre: "Bocadillo de diálogo", rareza: "comun" },
  { id: "bombilla-idea", zona: "esencial", icono: "💡", nombre: "Bombilla de ideas", rareza: "comun" },
  { id: "balanza", zona: "esencial", icono: "⚖️", nombre: "Balanza del debate", rareza: "comun" },
  { id: "laurel", zona: "esencial", icono: "🏛️", nombre: "Templo del saber", rareza: "rara" },
  { id: "clip", zona: "esencial", icono: "📎", nombre: "Clip de oro", rareza: "comun" },
  { id: "boli-rojo", zona: "esencial", icono: "🖊️", nombre: "Boli de corregir", rareza: "comun" },
  { id: "sobre", zona: "esencial", icono: "✉️", nombre: "Carta sellada", rareza: "comun" },
  { id: "sello", zona: "esencial", icono: "📮", nombre: "Buzón de la oficina", rareza: "rara" },
  { id: "luna", zona: "esencial", icono: "🌙", nombre: "Luna creciente", rareza: "comun" },
  { id: "planeta", zona: "esencial", icono: "🪐", nombre: "Planeta anillado", rareza: "comun" },
  { id: "cometa-estelar", zona: "esencial", icono: "☄️", nombre: "Cometa", rareza: "comun" },
  { id: "galaxia", zona: "esencial", icono: "🌌", nombre: "Mapa de la galaxia", rareza: "rara" },
  { id: "megafono", zona: "lelo", icono: "📣", nombre: "Megáfono de la plaza", rareza: "comun" },
  { id: "oreja", zona: "lelo", icono: "👂", nombre: "Oído fino", rareza: "comun" },
  { id: "mascara", zona: "lelo", icono: "🎭", nombre: "Máscara de teatro", rareza: "comun" },
  { id: "medalla-leonor", zona: "lelo", icono: "🏅", nombre: "Medalla de Leonor", rareza: "rara" },
  { id: "periodico", zona: "habla", icono: "📰", nombre: "Periódico del día", rareza: "comun" },
  { id: "domino", zona: "habla", icono: "🎲", nombre: "Dado de la partida", rareza: "comun" },
  { id: "sombrero", zona: "habla", icono: "🎩", nombre: "Sombrero de Don Ramón", rareza: "comun" },
  { id: "microfono", zona: "habla", icono: "🎙️", nombre: "Micrófono de la tertulia", rareza: "rara" },
  { id: "espejo", zona: "paron", icono: "🪞", nombre: "Espejo engañoso", rareza: "comun" },
  { id: "puzle", zona: "paron", icono: "🧩", nombre: "Pieza de puzle", rareza: "comun" },
  { id: "llave-dorada", zona: "paron", icono: "🔑", nombre: "Llave dorada", rareza: "comun" },
  { id: "bola-cristal", zona: "paron", icono: "🔮", nombre: "Bola de cristal", rareza: "epica" },
  { id: "cuadro", zona: "dific", icono: "🖼️", nombre: "Cuadro del museo", rareza: "comun" },
  { id: "anfora", zona: "dific", icono: "⚱️", nombre: "Ánfora", rareza: "comun" },
  { id: "pergamino-museo", zona: "dific", icono: "📃", nombre: "Pergamino restaurado", rareza: "comun" },
  { id: "pluma-museo", zona: "dific", icono: "🖋️", nombre: "Pluma de museo", rareza: "rara" },
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
  "lelo-laismo": "¿Ese pronombre es la persona que recibe algo (le) o lo que se da, dice, ve…? A quien recibe siempre «le».",
  "lelo-loismo": "Pregunta «¿a quién?»: si es quien recibe la acción indirectamente, va «le/les», no «lo/los».",
  "lelo-leismo-cosa": "¿Es una cosa? Para cosas como complemento directo se usa «lo» o «la».",
  "lelo-leismo-fem": "¿Es una mujer y es lo que se ve, conoce, llama…? Entonces «la».",
  "lelo-leismo-plural": "En plural, el complemento directo de persona masculino es «los»: los vi.",
  "lelo-concord": "Mira a quién se refiere: si son varias personas, el pronombre va en plural (les).",
  "lelo-selos": "«Se» ya incluye a las personas. ¿Lo que se da o se dice es una cosa o varias?",
  "verbos-irreg": "Piensa en un verbo parecido: satisfacer como hacer, prever como ver, conducir como producir.",
  "condicional": "Después de «si» condicional va el subjuntivo (supiera), no el condicional (sabría).",
  "pronombres-orden": "«Se» va siempre primero: se me, se te, se le.",
  "expresiones": "¿Cómo lo diría alguien en un texto formal o en las noticias?",
  "concord-ustedes": "«Ustedes» se conjuga como «ellos».",
  "vulgarismos": "Piensa en cómo se escribe la palabra en un libro o en un menú.",
  "paron-par": "Las dos palabras existen: piensa en su significado exacto.",
  "paron-letra": "Una letra cambia el significado: ¿cuál encaja en esta frase?",
  "paron-signif": "Cuidado: muchas personas usan esta palabra con un significado que no es el suyo.",
  "dific-hx": "Piensa en palabras de la misma familia (exhausto, cavar, hincar).",
  "dific-letras": "Separa la palabra en sílabas y piensa de dónde viene (aero-, meteoro, inflar, objetar).",
  "dific-trampa": "Es una palabra con trampa: la forma que suena más «natural» no siempre es la correcta.",
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
