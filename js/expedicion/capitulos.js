/* Palabraventura · La Gran Expedición · capítulos y zonas (solo datos).
   Un capítulo tiene una misión y varias zonas conectadas; cada zona es un escenario del motor con tres obstáculos,
   y cada obstáculo se supera con un reto distinto (ver js/expedicion/retos.js) que cambia el mundo:
   - reto.tipo «construir»: recoger las letras de la zona y ordenarlas (como en las expediciones cortas).
   - reto.tipo «buscar»: encontrar en el escenario el objeto que describe la instrucción.
   - reto.tipo «elegir», «frase», «memoria» o «clasificar»: panel de reto.
   Para añadir una zona basta con describirla con zona({…}); el recorrido (plataformas, rocas, suelos) se monta solo.
   Contenido extra según la dificultad (normal y difícil): «rondasExtra» (elegir), «elementosExtra» (clasificar);
   solo en difícil: «sobra» (frase: una palabra de más) y «parejasExtra» (memoria). */
(function () {
  const suelo = (x, w, y) => ({ x, y: y === undefined ? 300 : y, w, h: 360 - (y === undefined ? 300 : y), tipo: "suelo" });
  const roca = (x, w, h) => ({ x, y: 300 - h, w, h, tipo: "roca" });
  const tocon = (x, w, h) => ({ x, y: 300 - h, w, h, tipo: "tocon" });
  const nubes = (xs, e) => xs.map((x, i) => ({ x, y: 40 + (i * 23) % 40, e: e || "☁️", tam: 50 + (i * 7) % 16, capa: 0, nube: true }));
  const premioZona = { primera: { estrellas: 3, monedas: 5 }, repetir: { estrellas: 1, monedas: 1 } };

  // Un tramo de recorrido de 1440 de ancho que empieza en x0: plataformas, rocas, sitios y zonas para Borrones.
  function tramo(x0) {
    return {
      x0,
      plataformas: [{ x: x0 + 190, y: 214, w: 140 }, { x: x0 + 370, y: 150, w: 120 }, { x: x0 + 690, y: 200, w: 140 }, { x: x0 + 1040, y: 210, w: 130 }, { x: x0 + 1220, y: 145, w: 140 }],
      rocas: [roca(x0 + 570, 64, 38), tocon(x0 + 940, 70, 56)],
      // 0-2 y 4-5: encima de plataformas; 3 y 6: en el suelo; 7: al principio del tramo.
      sitios: [[x0 + 260, 170], [x0 + 430, 106], [x0 + 760, 156], [x0 + 880, 252], [x0 + 1105, 166], [x0 + 1290, 101], [x0 + 1380, 252], [x0 + 130, 252]],
      enemigos: [{ desde: x0 + 640, hasta: x0 + 930 }, { desde: x0 + 1020, hasta: x0 + 1400 }]
    };
  }
  const anchoObstaculo = o => o.tipo === "rio" ? o.w : o.tipo === "luz" ? 40 : 90;

  /* Monta una zona: un tramo de recorrido delante de cada obstáculo (o1, o2, o3…). El último puede ser un acantilado
     (muro con escalera o ascensor). Los tramos se llaman A, B, C… en el orden del recorrido.
     def: id, nombre, icono, titulo, intro, tema, deco, o1…o3, letras: { o1: [tramo, sitios, texto], … },
          objetos: [[tramo, sitio, { id, e, desc }]], gemas: [[tramo, sitio] | [x, y]], enemigos: [[tramo, i]], amigo, habilidades, preguntas */
  function zona(def) {
    const defs = ["o1", "o2", "o3", "o4"].map(k => def[k]).filter(Boolean);
    const tramos = {}, obs = [];
    let x0 = 210;
    defs.forEach((od, k) => {
      const t = tramo(x0);
      tramos["ABCD"[k]] = t;
      const o = Object.assign({}, od, { x: t.x0 + 1500 });
      obs.push(o);
      x0 = o.x + anchoObstaculo(o) + 140;
    });
    const ult = obs[obs.length - 1];
    const meta = { x: ult.x + anchoObstaculo(ult) + 300, y: ult.tipo === "muro" ? ult.arriba : 300 };
    const ancho = meta.x + 320;
    // Suelos: cortados por los ríos y elevados tras un acantilado.
    const solidos = [];
    let x = 0;
    for (const o of obs) {
      if (o.tipo === "rio") { solidos.push(suelo(x, o.x - x)); x = o.x + o.w; }
      if (o.tipo === "muro") { solidos.push(suelo(x, o.x - x)); solidos.push(suelo(o.x, ancho - o.x, o.arriba)); x = ancho; }
    }
    if (x < ancho) solidos.push(suelo(x, ancho - x));
    const lista = Object.values(tramos);
    const sitio = (t, k) => tramos[t].sitios[k];
    const letras = [];
    Object.entries(def.letras || {}).forEach(([cual, [t, ks, texto]]) => {
      [...texto].forEach((l, i) => { const [lx, ly] = sitio(t, ks[i]); letras.push({ l, x: lx, y: ly, o: Number(cual.slice(1)) - 1 }); });
    });
    return {
      id: def.id, nombre: def.nombre, icono: def.icono, regla: def.regla, titulo: def.titulo, intro: def.intro,
      ancho, inicio: { x: 280 }, limites: [210, meta.x + 220],
      tema: def.tema || {},
      solidos: [...solidos, ...lista.flatMap(t => t.rocas)],
      plataformas: lista.flatMap(t => t.plataformas),
      obstaculos: obs,
      letras,
      objetos: (def.objetos || []).map(([t, k, o]) => { const [ox, oy] = sitio(t, k); return Object.assign({ x: ox, y: oy }, o); }),
      secretos: (def.gemas || []).map(g => typeof g[0] === "string" ? { x: sitio(g[0], g[1])[0], y: sitio(g[0], g[1])[1] } : { x: g[0], y: g[1] }),
      enemigos: (def.enemigos || []).map(([t, i]) => tramos[t].enemigos[i]),
      amigos: def.amigo ? [Object.assign({ x: tramos.B.x0 + 60 }, def.amigo)] : [],
      habilidades: def.habilidades || ["bv", "h", "lly"],
      preguntas: def.preguntas || null,
      meta,
      deco: [...(def.deco ? def.deco(lista) : []), ...nubes([300, 1300, 2300, 3300, 4300, 5300, 6300], def.nube)],
      premio: premioZona
    };
  }
  // Adornos repartidos por todos los tramos.
  const adornos = (lista, capa) => tramos => tramos.flatMap(t => lista.map(([dx, e, tam]) => ({ x: t.x0 + dx, y: 300, e, tam, capa: capa === undefined ? 0 : capa })));

  PV.GRAN_EXPEDICION = [{
    id: "mapa", titulo: "El mapa perdido", icono: "🗺️",
    mision: "¡El viento se ha llevado el mapa de la expedición y lo ha roto en 6 trozos! Cruza el bosque, la cueva, el río, el campamento, la montaña y el castillo para recuperarlos.",
    premio: { primera: { estrellas: 25, monedas: 40 }, repetir: { estrellas: 6, monedas: 10 } },
    zonas: [

      /* ---------- 1. Bosque: observar y buscar; construir una palabra ---------- */
      zona({
        id: "mapa-1", nombre: "El bosque", icono: "🌳", regla: "Observa y busca",
        titulo: "El bosque de los susurros",
        intro: "Una ardilla está atrapada, una puerta hace preguntas y un río corta el camino. Explora, busca lo que te pidan y recoge letras.",
        deco: adornos([[-120, "🌳", 120], [300, "🌲", 100], [640, "🌳", 126], [1000, "🌲", 104]]),
        o1: { tipo: "jaula", preso: "🐿️", reto: { tipo: "buscar", objetivo: "llave-dorada",
          instruccion: "¡Socorro! Soy Nuez, la ardilla. Tráeme la llave dorada que abre puertas. Está en el sitio más alto de este bosque.",
          exito: "¡Gracias! Ya puedo salir. Toma, un regalo: 🪽 doble salto para el resto de la zona.", regalo: "dobleSalto",
          boton: "¡A ABRIR! 🔑", tras: "¡Nuez es libre! Sigue el camino 🐿️" } },
        objetos: [
          ["A", 5, { id: "llave-dorada", e: "🔑", desc: "la llave dorada que abre puertas" }],
          ["A", 2, { id: "llave-inglesa", e: "🔧", desc: "una llave inglesa: sirve para apretar tuercas, no para abrir puertas" }],
          ["A", 3, { id: "llave-vieja", e: "🗝️", desc: "una llave vieja y oxidada: no es dorada" }]
        ],
        o2: { tipo: "puerta", estilo: "madera", reto: { tipo: "elegir", icono: "🔎",
          intro: "Mira bien el dibujo y elige su nombre. ¡Fíjate en cómo se escribe!",
          enunciado: "La puerta del bosque pregunta: ¿cómo se llama cada cosa?", boton: "¡A ABRIR! 🚪",
          exito: "¡Conoces bien el bosque! La puerta se abre.", tras: "¡Puerta abierta! Recoge las letras de la palabra que cruza el río 🔤",
          rondas: [
            { estimulo: { imagen: "🍄", texto: "¿Cómo se llama?" }, opciones: ["seta", "cesta", "sota"], respuesta: "seta", pista: "Sale en el bosque cuando llueve y tiene sombrero." },
            { estimulo: { imagen: "🌰", texto: "¿Cómo se llama?" }, opciones: ["castaña", "cabaña", "montaña"], respuesta: "castaña", pista: "Es el fruto del castaño; se come asada en otoño." },
            { estimulo: { imagen: "🦔", texto: "¿Cómo se llama?" }, opciones: ["erizo", "rizo", "hielo"], respuesta: "erizo", pista: "Es un animal pequeño lleno de pinchos." }
          ],
          rondasExtra: [
            { estimulo: { imagen: "🦉", texto: "¿Cómo se escribe?" }, opciones: ["búho", "buho", "búo"], respuesta: "búho", pista: "Lleva una letra que no suena y una tilde.", explicacion: "Búho lleva H y tilde en la ú." },
            { estimulo: { imagen: "🐌", texto: "¿Cómo se escribe?" }, opciones: ["caracol", "caracól", "karacol"], respuesta: "caracol", pista: "Es aguda y acaba en L: no lleva tilde.", explicacion: "Caracol es aguda acabada en L, así que no lleva tilde." }
          ] } },
        o3: { tipo: "rio", w: 230, solucion: "puente", palabra: "TRONCO", reto: { enunciado: "Forma la palabra que te ayuda a cruzar el río.", imagen: "🪵",
          definicion: "Parte gruesa de un árbol, de la que salen las ramas.", decir: "tronco", trampa: null,
          boton: "¡A CRUZAR! 🌳", tras: "¡El tronco ya cruza el río! El trozo de mapa está al otro lado 🗺️" } },
        letras: { o3: ["C", [0, 1, 2, 4, 5, 6], "NOTCOR"] },
        gemas: [["A", 1], ["B", 3], ["C", 3], [240, 252]],
        enemigos: [["A", 1], ["B", 0], ["B", 1], ["C", 1]]
      }),

      /* ---------- 2. Cueva: adivinanzas ---------- */
      zona({
        id: "mapa-2", nombre: "La cueva", icono: "🦇", regla: "Adivinanzas",
        titulo: "La cueva de los acertijos",
        intro: "La cueva está a oscuras. Resuelve adivinanzas para encender la luz, abre la puerta y ayuda a un ratón encerrado.",
        tema: { cielo: ["#2b2540", "#41366a"], colinas: ["#3a3156", "#4a3f6b"], tierra: "#5b4a6e", tierraOsc: "#4a3c5c", hierba: "#8a77b5", hierbaOsc: "#6c5b96", plataforma: "#6a5a80", techo: true, oscuro: true },
        nube: "🦇",
        deco: adornos([[-100, "💎", 30], [260, "🍄", 30], [700, "🕯️", 30], [1150, "🍄", 32]], 1),
        o1: { tipo: "luz", w: 760, reto: { tipo: "elegir", icono: "🧩",
          intro: "Las adivinanzas describen algo sin decir su nombre. Lee con atención las pistas y elige la respuesta.",
          enunciado: "Resuelve las adivinanzas para encender el farol.", boton: "¡A ENCENDER! 🏮",
          exito: "¡Muy bien! El farol se enciende.", tras: "¡Luz! Ahora puedes ver el camino 🏮",
          rondas: [
            { estimulo: { imagen: "🤔", texto: "Tengo agujas y no sé coser; tengo números y no sé leer. ¿Qué soy?" },
              opciones: ["El reloj", "El erizo", "El libro"], respuesta: "El reloj",
              pista: "Está en la pared o en la muñeca y te dice la hora.", explicacion: "Sus agujas marcan la hora." },
            { estimulo: { imagen: "🤔", texto: "Alumbro sin ser el sol y en la oscuridad soy tu mejor amigo. ¿Qué soy?" },
              opciones: ["El farol", "La luna", "El gato"], respuesta: "El farol",
              pista: "Lleva una vela o una bombilla dentro y se cuelga.", explicacion: "¡Como el que vas a encender!" }
          ],
          rondasExtra: [
            { estimulo: { imagen: "🤔", texto: "Vuela sin alas, silba sin boca, empuja sin manos y nadie lo ve. ¿Qué es?" },
              opciones: ["El viento", "El pájaro", "La pelota"], respuesta: "El viento", pista: "Mueve las hojas de los árboles." }
          ] } },
        o2: { tipo: "puerta", estilo: "madera", reto: { tipo: "elegir",
          enunciado: "Dos adivinanzas más y la puerta se abrirá.", boton: "¡A ABRIR! 🚪", tras: "¡La puerta se abre! Sigue por la cueva 🦇",
          rondas: [
            { estimulo: { imagen: "🤔", texto: "Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera." },
              opciones: ["La pera", "La manzana", "La uva"], respuesta: "La pera",
              pista: "La respuesta está escondida en la última palabra: «es-pera»." },
            { estimulo: { imagen: "🤔", texto: "Oro parece, plata no es. ¿Qué es?" },
              opciones: ["El plátano", "El limón", "El oro"], respuesta: "El plátano",
              pista: "Junta «plata» y «no es»: pla-ta-no." }
          ],
          rondasExtra: [
            { estimulo: { imagen: "🤔", texto: "Tiene dientes y no come; tiene cabeza y no es persona. ¿Qué es?" },
              opciones: ["El ajo", "El peine", "El tiburón"], respuesta: "El ajo", pista: "Se usa en la cocina y huele mucho; sus trocitos se llaman dientes." }
          ] } },
        o3: { tipo: "jaula", preso: "🐭", reto: { tipo: "buscar", objetivo: "linterna",
          instruccion: "¡Hola! Soy Pipo, el ratón. Se me apagó la luz y me quedé encerrado. Tráeme lo que alumbra, se lleva en la mano y funciona con pilas.",
          exito: "¡Una linterna! Con ella veo la cerradura. ¡Ya estoy libre!",
          boton: "¡A ABRIR! 🔦", tras: "¡Pipo es libre! El trozo de mapa está al final de la cueva 🗺️" } },
        objetos: [
          ["C", 5, { id: "linterna", e: "🔦", desc: "una linterna: alumbra, se lleva en la mano y funciona con pilas" }],
          ["C", 2, { id: "vela", e: "🕯️", desc: "una vela: alumbra, pero no funciona con pilas" }],
          ["C", 3, { id: "bombilla", e: "💡", desc: "una bombilla: alumbra, pero no se lleva en la mano" }]
        ],
        gemas: [["A", 5], ["B", 1], ["B", 5], ["C", 1]],
        enemigos: [["A", 0], ["A", 1], ["B", 1], ["C", 1]],
        amigo: { e: "🦇", nombre: "Murciélago Murci", regalo: "iman" },
        habilidades: ["lly", "h"]
      }),

      /* ---------- 3. Río: construir y letra que falta ---------- */
      zona({
        id: "mapa-3", nombre: "El río", icono: "⛵", regla: "Palabras y letras",
        titulo: "El río roto",
        intro: "El río, sus carteles y el molino necesitan arreglos. Forma palabras, corrige las que están mal escritas y completa las que tienen huecos.",
        tema: { cielo: ["#bfe9ff", "#f0fbff"], colinas: ["#bfe6c8", "#8fd1a0"], agua: ["#5cc1ef", "#3a9bd3"] },
        deco: adornos([[-100, "🌾", 40], [300, "🌳", 120], [700, "🌿", 34], [1100, "🌳", 116]]),
        o1: { tipo: "rio", w: 300, solucion: "barca", palabra: "BARCO", reto: { enunciado: "Forma la palabra para cruzar el río. ¡Ojo, hay una letra de más!", imagen: "⛵",
          definicion: "Sirve para navegar por el agua.", decir: "barco",
          trampa: { letra: "V", explicacion: "Barco se escribe con B, como barca y bote." },
          boton: "¡A NAVEGAR! ⛵", tras: "¡Súbete al barco para cruzar! ⛵" } },
        letras: { o1: ["A", [0, 1, 2, 4, 5], "RACOB"] },
        o2: { tipo: "puerta", estilo: "reja", reto: { tipo: "elegir", icono: "🔍",
          intro: "Cada cartel tiene una palabra mal escrita. Primero encuéntrala y después elige cómo se escribe bien.",
          enunciado: "Arregla los carteles del río para abrir la compuerta.", boton: "¡A ABRIR! 🚪",
          exito: "¡Carteles arreglados! La compuerta se abre.", tras: "¡Compuerta abierta! Ahora, el molino 🛗",
          rondas: [
            { estimulo: { imagen: "🪧", texto: "El varco navega por el río." }, opciones: ["El", "varco", "navega", "río"], respuesta: "varco", pista: "Mira la palabra que nombra algo que navega." },
            { estimulo: { imagen: "✏️", texto: "¿Cómo se escribe bien?" }, opciones: ["barco", "varco"], respuesta: "barco", explicacion: "Barco se escribe con B, como barca." },
            { estimulo: { imagen: "🪧", texto: "Hay una ormiga en la orilla." }, opciones: ["Hay", "ormiga", "orilla"], respuesta: "ormiga", pista: "Busca el animal pequeño." },
            { estimulo: { imagen: "✏️", texto: "¿Cómo se escribe bien?" }, opciones: ["hormiga", "ormiga"], respuesta: "hormiga", explicacion: "Hormiga empieza por H, como hormiguero." }
          ],
          rondasExtra: [
            { estimulo: { imagen: "🪧", texto: "Las vallenas saltan en el mar." }, opciones: ["Las", "vallenas", "saltan", "mar"], respuesta: "vallenas", pista: "Busca el animal más grande del mar." },
            { estimulo: { imagen: "✏️", texto: "¿Cómo se escribe bien?" }, opciones: ["ballenas", "vallenas", "bayenas"], respuesta: "ballenas", explicacion: "Ballena se escribe con B y con LL." }
          ] } },
        o3: { tipo: "muro", arriba: 130, solucion: "ascensor", reto: { tipo: "elegir", icono: "🔤",
          intro: "A estas palabras les falta una letra. Mira el dibujo, lee la palabra y elige la letra que va en el hueco.",
          enunciado: "Repara el ascensor del molino: completa las palabras.", boton: "¡A SUBIR! 🛗",
          exito: "¡Reparado! El ascensor ya funciona.", tras: "¡El ascensor sube y baja! Súbete y llega arriba 🛗",
          rondas: [
            { estimulo: { imagen: "📚", texto: "LI _ RO" }, opciones: ["B", "V"], respuesta: "B", explicacion: "Libro: delante de R siempre va B." },
            { estimulo: { imagen: "🥚", texto: "_ UEVO" }, opciones: ["H", "Sin letra"], respuesta: "H", explicacion: "Las palabras que empiezan por hue- llevan H." },
            { estimulo: { imagen: "🐔", texto: "GA _ INA" }, opciones: ["LL", "Y"], respuesta: "LL", explicacion: "Gallina se escribe con LL." }
          ],
          rondasExtra: [
            { estimulo: { imagen: "🚚", texto: "CAMI _ N" }, opciones: ["Ó", "O"], respuesta: "Ó", explicacion: "Camión es aguda y acaba en N: lleva tilde." },
            { estimulo: { imagen: "🦒", texto: "_ IRAFA" }, opciones: ["J", "G"], respuesta: "J", explicacion: "Jirafa se escribe con J." }
          ] } },
        gemas: [["A", 3], ["B", 1], ["B", 5], ["C", 1]],
        enemigos: [["A", 1], ["B", 0], ["B", 1], ["C", 0]],
        amigo: { e: "🦆", nombre: "Pato Lolo", regalo: "escudo" },
        habilidades: ["bv", "h"]
      }),

      /* ---------- 4. Campamento: memoria y clasificar ---------- */
      zona({
        id: "mapa-4", nombre: "El campamento", icono: "⛺", regla: "Memoria y grupos",
        titulo: "El campamento de las estrellas",
        intro: "Es de noche en el campamento. Encuentra parejas para encender la hoguera, ordena las fichas para abrir la valla y canta con rimas.",
        tema: { cielo: ["#1f2a5a", "#4a4f8c"], colinas: ["#2c3a6e", "#3a4a80"], tierra: "#6b5a4a", tierraOsc: "#5a4a3c", hierba: "#4f8a5a", hierbaOsc: "#3d6e48", plataforma: "#6b5a4a", oscuro: true },
        nube: "⭐",
        deco: adornos([[-100, "⛺", 70], [300, "🌲", 104], [700, "🪵", 34], [1100, "⛺", 70]]),
        o1: { tipo: "luz", w: 760, reto: { tipo: "memoria", icono: "🃏",
          intro: "Toca dos cartas para darles la vuelta. Si el dibujo y la palabra van juntos, ¡pareja! Si no, se vuelven a tapar: recuerda dónde estaban.",
          enunciado: "Encuentra las parejas de dibujo y palabra para encender la hoguera.", boton: "¡A ENCENDER! 🔥",
          exito: "¡Todas las parejas! La hoguera se enciende.", tras: "¡Qué calorcito! Sigue por el campamento 🔥",
          parejas: [["🔥", "fuego"], ["⛺", "tienda"], ["🌙", "luna"], ["🦉", "búho"], ["⭐", "estrella"], ["🪵", "leña"]],
          parejasExtra: [["🦊", "zorro"], ["🌲", "pino"]] } },
        o2: { tipo: "puerta", estilo: "madera", reto: { tipo: "clasificar", icono: "🧺",
          intro: "Lee cada palabra y toca el grupo al que pertenece.",
          enunciado: "¿Animal o planta? Ordena las fichas del campamento.", boton: "¡A ABRIR! 🚪",
          exito: "¡Todo ordenado! La valla se abre.", tras: "¡La valla está abierta! Sigue por el campamento ⛺",
          categorias: [{ id: "animal", nombre: "Animal", icono: "🐾" }, { id: "planta", nombre: "Planta", icono: "🌿" }],
          elementos: [
            { texto: "ardilla", cat: "animal", porque: "La ardilla es un animal: se mueve y come." },
            { texto: "pino", cat: "planta", porque: "El pino es una planta: es un árbol." },
            { texto: "búho", cat: "animal", porque: "El búho es un animal: es un ave." },
            { texto: "helecho", cat: "planta", porque: "El helecho es una planta con hojas grandes." },
            { texto: "zorro", cat: "animal", porque: "El zorro es un animal." },
            { texto: "margarita", cat: "planta", porque: "La margarita es una flor, y las flores son plantas." }
          ],
          elementosExtra: [
            { texto: "musgo", cat: "planta", porque: "El musgo es una planta pequeñita que crece sobre las piedras." },
            { texto: "lombriz", cat: "animal", porque: "La lombriz es un animal: se mueve bajo la tierra." },
            { texto: "roble", cat: "planta", porque: "El roble es un árbol, y los árboles son plantas." }
          ] } },
        o3: { tipo: "puerta", estilo: "reja", reto: { tipo: "elegir", icono: "🎵",
          intro: "Dos palabras riman cuando terminan igual: luna y cuna, ratón y botón.",
          enunciado: "Canta con el fuego: elige la palabra que rima.", boton: "¡A ABRIR! 🎵",
          exito: "¡Qué canción tan bonita! La reja se abre.", tras: "¡Reja abierta! El trozo de mapa te espera 🗺️",
          rondas: [
            { estimulo: { imagen: "⭐", texto: "¿Qué rima con ESTRELLA?" }, opciones: ["botella", "luna", "cielo"], respuesta: "botella", explicacion: "Estrella y botella terminan en -ella." },
            { estimulo: { imagen: "🔥", texto: "¿Qué rima con FUEGO?" }, opciones: ["juego", "leña", "agua"], respuesta: "juego", explicacion: "Fuego y juego terminan en -uego." },
            { estimulo: { imagen: "⛺", texto: "¿Qué rima con TIENDA?" }, opciones: ["merienda", "casa", "saco"], respuesta: "merienda", explicacion: "Tienda y merienda terminan en -ienda." }
          ],
          rondasExtra: [
            { estimulo: { imagen: "🐸", texto: "¿Qué rima con RANA?" }, opciones: ["ventana", "rama", "sapo"], respuesta: "ventana", explicacion: "Rana y ventana terminan en -ana." },
            { estimulo: { imagen: "🍰", texto: "¿Qué rima con PASTEL?" }, opciones: ["papel", "pasta", "tarta"], respuesta: "papel", explicacion: "Pastel y papel terminan en -el." }
          ] } },
        gemas: [["A", 1], ["A", 6], ["B", 5], ["C", 1]],
        enemigos: [["A", 0], ["B", 1], ["C", 0], ["C", 1]],
        amigo: { e: "🦉", nombre: "Búho Sabio", regalo: "iman" },
        habilidades: ["czs", "gj"]
      }),

      /* ---------- 5. Montaña: construir frases ---------- */
      zona({
        id: "mapa-5", nombre: "La montaña", icono: "🏔️", regla: "Frases",
        titulo: "La montaña de las frases",
        intro: "Para subir la montaña hay que hablar bien: ordena las palabras, separa acciones y cosas y forma frases con sentido.",
        tema: { cielo: ["#cfe6ff", "#f4f9ff"], colinas: ["#e8f1fb", "#d3e3f5"], tierra: "#8d9db5", tierraOsc: "#7a8aa3", hierba: "#ffffff", hierbaOsc: "#dbe7f3", plataforma: "#7d8fa8", nieve: true },
        deco: adornos([[-100, "🌲", 110], [300, "⛄", 50], [700, "🌲", 104], [1100, "🏔️", 150]]),
        o1: { tipo: "puerta", estilo: "reja", reto: { tipo: "frase", icono: "📝",
          intro: "Una frase empieza con mayúscula y termina con punto. Toca las palabras en orden; si te equivocas, toca una de arriba para quitarla.",
          enunciado: "Ordena las palabras para formar una frase y abrir la reja.", imagen: "🐐",
          palabras: ["La", "cabra", "sube", "a", "la", "montaña."], sobra: "las",
          pista: "Empieza por «La» (con mayúscula) y termina en «montaña.» (con punto).",
          boton: "¡A ABRIR! 🚪", exito: "«La cabra sube a la montaña.» ¡Frase perfecta!", tras: "¡La reja se abre! Sigue subiendo ⛰️" } },
        o2: { tipo: "rio", w: 230, solucion: "hielo", reto: { tipo: "clasificar", icono: "🧊",
          intro: "Algunas palabras dicen lo que hacemos (acciones) y otras nombran cosas. Toca el grupo de cada palabra.",
          enunciado: "¿Acción o cosa? Ordena las palabras para congelar el arroyo.", boton: "¡A CONGELAR! 🧊",
          exito: "¡Muy bien! El arroyo se congela.", tras: "¡Hielo firme! Crúzalo con cuidado 🧊",
          categorias: [{ id: "accion", nombre: "Acción", icono: "🏃" }, { id: "cosa", nombre: "Cosa", icono: "🎒" }],
          elementos: [
            { texto: "saltar", cat: "accion", porque: "Saltar es algo que hacemos: es una acción." },
            { texto: "mochila", cat: "cosa", porque: "La mochila es una cosa: se puede tocar." },
            { texto: "escalar", cat: "accion", porque: "Escalar es algo que hacemos: es una acción." },
            { texto: "cuerda", cat: "cosa", porque: "La cuerda es una cosa." },
            { texto: "dormir", cat: "accion", porque: "Dormir es algo que hacemos: es una acción." },
            { texto: "gorro", cat: "cosa", porque: "El gorro es una cosa." }
          ],
          elementosExtra: [
            { texto: "pensar", cat: "accion", porque: "Pensar es algo que hacemos con la cabeza: es una acción." },
            { texto: "linterna", cat: "cosa", porque: "La linterna es una cosa." },
            { texto: "respirar", cat: "accion", porque: "Respirar es algo que hacemos todo el rato: es una acción." }
          ] } },
        o3: { tipo: "muro", arriba: 130, solucion: "escalera", reto: { tipo: "frase",
          enunciado: "Ordena la frase para que aparezca la escalera.", imagen: "🪜",
          palabras: ["Mi", "mascota", "me", "ayuda", "a", "subir."], sobra: "nos",
          pista: "Empieza por «Mi» y termina en «subir.».",
          boton: "¡A SUBIR! 🪜", exito: "«Mi mascota me ayuda a subir.» ¡Muy bien!", tras: "¡Escalera lista! Sube hasta el trozo de mapa 🗺️" } },
        gemas: [["A", 1], ["A", 5], ["B", 3], ["C", 5]],
        enemigos: [["A", 0], ["A", 1], ["B", 0], ["B", 1], ["C", 0]],
        amigo: { e: "🐧", nombre: "Pingüino Pin", regalo: "escudo" },
        habilidades: ["tildes", "punt"]
      }),

      /* ---------- 6. Castillo: prueba final que mezcla todo ---------- */
      zona({
        id: "mapa-6", nombre: "El castillo", icono: "🏰", regla: "Repaso final",
        titulo: "El castillo del mapa",
        intro: "¡El último trozo del mapa está en el castillo! Cruza el foso, abre la muralla y vence al Guardián con todo lo que has aprendido.",
        tema: { cielo: ["#c9b8ff", "#f3ecff"], colinas: ["#d6cdee", "#bcb0e0"], hierba: "#7ccf6f" },
        deco: adornos([[-100, "🚩", 40], [300, "🌳", 116], [700, "🛡️", 34], [1100, "🚩", 40]]),
        o1: { tipo: "rio", w: 300, solucion: "balsa", palabra: "CASTILLO", reto: { enunciado: "Forma la palabra para cruzar el foso. ¡Ojo, hay una letra de más!", imagen: "🏰",
          definicion: "Edificio grande con torres y murallas donde vivían los reyes.", decir: "castillo",
          trampa: { letra: "Y", explicacion: "Castillo se escribe con LL, como silla y anillo." },
          boton: "¡A FLOTAR! 🪵", tras: "¡Tu balsa está lista! Súbete para cruzar el foso 🪵" } },
        letras: { o1: ["A", [7, 0, 1, 2, 3, 4, 5, 6], "LOTSICLA"] },
        o2: { tipo: "puerta", estilo: "reja", reto: { tipo: "memoria", icono: "🃏",
          intro: "Ahora las parejas son palabras que significan lo mismo (sinónimos), como contento y alegre.",
          enunciado: "Encuentra las parejas de sinónimos para abrir la muralla.", boton: "¡A ABRIR! 🏰",
          exito: "¡Todas las parejas de sinónimos! La muralla se abre.", tras: "¡Muralla abierta! El Guardián te espera ⚔️",
          parejas: [["contento", "alegre"], ["rápido", "veloz"], ["grande", "enorme"], ["bonito", "precioso"], ["empezar", "comenzar"]],
          parejasExtra: [["cansado", "agotado"], ["hablar", "conversar"]] } },
        o3: { tipo: "jefe", nombre: "Borrón Guardián del Mapa", vida: 5, tam: 2.6, corona: true, color: "#4b2a7a",
          palabrasMal: ["kastiyo", "mapa?", "jirafa!"],
          saludo: "¡Soy el Guardián del Mapa! Para recuperar el último trozo tendrás que demostrar todo lo que sabes.",
          tras: "¡El Guardián se ha convertido en mariposas! Coge el último trozo del mapa 🗺️" },
        gemas: [["B", 1], ["B", 5], ["C", 1], [240, 252]],
        enemigos: [["A", 0], ["B", 0], ["B", 1], ["C", 0], ["C", 1]],
        amigo: { e: "🐴", nombre: "Caballo Trote", regalo: "dobleSalto" },
        habilidades: ["bv", "lly", "h", "tildes"],
        // Preguntas propias de la batalla final (relaciones, adivinanzas…); después siguen las del banco de ejercicios.
        preguntas: [
          { frase: "¿Qué palabra es lo contrario de ALTO?", opciones: ["bajo", "grande", "largo"], correcta: "bajo", explicacion: "Alto y bajo son antónimos: significan lo contrario." },
          { frase: "¿Qué palabra significa lo mismo que CONTENTO?", opciones: ["alegre", "triste", "enfadado"], correcta: "alegre", explicacion: "Contento y alegre son sinónimos: significan lo mismo." },
          { frase: "¿Qué palabra rima con RATÓN?", opciones: ["botón", "gato", "mesa"], correcta: "botón", explicacion: "Ratón y botón terminan igual: -ón." },
          { frase: "Tengo hojas y no soy árbol; tengo lomo y no soy caballo. ¿Qué soy?", opciones: ["el libro", "la planta", "el burro"], correcta: "el libro", explicacion: "Los libros tienen hojas y lomo." },
          { frase: "¿Qué palabra es lo contrario de DÍA?", opciones: ["noche", "sol", "tarde"], correcta: "noche", explicacion: "Día y noche son antónimos." },
          { frase: "¿Qué palabra rima con LUNA?", opciones: ["cuna", "luz", "sol"], correcta: "cuna", explicacion: "Luna y cuna terminan igual: -una." }
        ]
      })
    ]
  }];
})();
