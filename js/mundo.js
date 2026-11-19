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
  { id: "castillo", nombre: "Castillo de los Retos", icono: "🏰", color: "#ff7aa8", deco: ["🏰", "🐉", "🛡️", "👑", "✨"], habilidades: ["bv", "h", "lly", "tildes"], x: 150, y: 62,
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
PV.ZONAS_FUTURAS = [
  { nombre: "Cuevas de G/J", icono: "🦇", x: 42, y: 140 },
  { nombre: "Bahía de C/Z/S", icono: "🐚", x: 262, y: 470 },
  { nombre: "Torre de la Puntuación", icono: "🗼", x: 262, y: 60 }
];

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
