/* Palabraventura · recompensas: estrellas (experiencia), monedas, cofres, colección, accesorios, insignias y evolución del compañero. */
PV.recompensas = (function () {
  const U = PV.util;
  const ANIMALES = [
    { id: "zorro", icono: "🦊", nombre: "Zorro", nombreDefecto: "Chispa" }, { id: "panda", icono: "🐼", nombre: "Panda", nombreDefecto: "Bambú" },
    { id: "rana", icono: "🐸", nombre: "Rana", nombreDefecto: "Saltarina" }, { id: "buho", icono: "🦉", nombre: "Búho", nombreDefecto: "Sabio" },
    { id: "dragon", icono: "🐲", nombre: "Dragón", nombreDefecto: "Brasa" }, { id: "gato", icono: "🐱", nombre: "Gato", nombreDefecto: "Bigotes" },
    { id: "perro", icono: "🐶", nombre: "Perro", nombreDefecto: "Trufa" }, { id: "tortuga", icono: "🐢", nombre: "Tortuga", nombreDefecto: "Rocas" }
  ];
  /* Accesorios del avatar. Cada uno va en un hueco («hueco») y se pueden llevar todos a la vez,
     uno por hueco: cabeza, cara, mano, cuello, fondo (efecto mágico) y mascota. */
  const HUECOS = [
    { id: "cabeza", nombre: "Para la cabeza", icono: "👑" },
    { id: "cara", nombre: "Para la cara", icono: "🕶️" },
    { id: "mano", nombre: "En la mano", icono: "🪄" },
    { id: "cuello", nombre: "Al cuello", icono: "🧣" },
    { id: "fondo", nombre: "Efectos mágicos", icono: "🌈" },
    { id: "mascota", nombre: "Mascotas", icono: "🐣" }
  ];
  const ACCESORIOS = [
    // Cabeza
    { id: "lazo", hueco: "cabeza", icono: "🎀", nombre: "Lazo", precio: 15 },
    { id: "flor", hueco: "cabeza", icono: "🌼", nombre: "Flor", precio: 15 },
    { id: "gorra", hueco: "cabeza", icono: "🧢", nombre: "Gorra", precio: 20 },
    { id: "pamela", hueco: "cabeza", icono: "👒", nombre: "Pamela", precio: 25 },
    { id: "casco", hueco: "cabeza", icono: "⛑️", nombre: "Casco de explorador", precio: 30 },
    { id: "birrete", hueco: "cabeza", icono: "🎓", nombre: "Birrete", precio: 35 },
    { id: "chistera", hueco: "cabeza", icono: "🎩", nombre: "Chistera", precio: 40 },
    { id: "corona", hueco: "cabeza", icono: "👑", nombre: "Corona", precio: 60 },
    // Cara
    { id: "gafas-redondas", hueco: "cara", icono: "👓", nombre: "Gafas redondas", precio: 15 },
    { id: "gafas", hueco: "cara", icono: "🕶️", nombre: "Gafas de sol", precio: 25 },
    { id: "gafas-buceo", hueco: "cara", icono: "🥽", nombre: "Gafas de buceo", precio: 30 },
    // Mano
    { id: "piruleta", hueco: "mano", icono: "🍭", nombre: "Piruleta", precio: 10 },
    { id: "helado", hueco: "mano", icono: "🍦", nombre: "Helado", precio: 10 },
    { id: "globo-mano", hueco: "mano", icono: "🎈", nombre: "Globo", precio: 12 },
    { id: "libros", hueco: "mano", icono: "📚", nombre: "Montón de libros", precio: 12 },
    { id: "paraguas", hueco: "mano", icono: "🌂", nombre: "Paraguas", precio: 15 },
    { id: "linterna-mano", hueco: "mano", icono: "🔦", nombre: "Linterna", precio: 18 },
    { id: "balon", hueco: "mano", icono: "⚽", nombre: "Balón", precio: 20 },
    { id: "cometa-mano", hueco: "mano", icono: "🪁", nombre: "Cometa", precio: 22 },
    { id: "pluma", hueco: "mano", icono: "🪶", nombre: "Pluma mágica", precio: 25 },
    { id: "osito", hueco: "mano", icono: "🧸", nombre: "Osito de peluche", precio: 25 },
    { id: "mando", hueco: "mano", icono: "🎮", nombre: "Mando de videojuegos", precio: 35 },
    { id: "escudo-mano", hueco: "mano", icono: "🛡️", nombre: "Escudo", precio: 40 },
    { id: "varita", hueco: "mano", icono: "🪄", nombre: "Varita mágica", precio: 45 },
    { id: "estrella", hueco: "mano", icono: "🌟", nombre: "Estrella brillante", precio: 50 },
    { id: "guitarra", hueco: "mano", icono: "🎸", nombre: "Guitarra", precio: 55 },
    { id: "trofeo-mano", hueco: "mano", icono: "🏆", nombre: "Trofeo de campeón", precio: 90 },
    // Cuello
    { id: "bufanda", hueco: "cuello", icono: "🧣", nombre: "Bufanda", precio: 20 },
    { id: "collar", hueco: "cuello", icono: "📿", nombre: "Collar", precio: 30 },
    { id: "medalla-oro", hueco: "cuello", icono: "🏅", nombre: "Medalla de oro", precio: 45 },
    { id: "diamante", hueco: "cuello", icono: "💎", nombre: "Colgante de diamante", precio: 95 },
    // Efectos mágicos (detrás del compañero)
    { id: "petalos", hueco: "fondo", icono: "🌸", nombre: "Lluvia de pétalos", precio: 30 },
    { id: "nieve", hueco: "fondo", icono: "❄️", nombre: "Copos de nieve", precio: 35 },
    { id: "purpurina", hueco: "fondo", icono: "✨", nombre: "Purpurina", precio: 40 },
    { id: "luna", hueco: "fondo", icono: "🌙", nombre: "Luna mágica", precio: 50 },
    { id: "arcoiris", hueco: "fondo", icono: "🌈", nombre: "Arcoíris", precio: 70 },
    { id: "fuego", hueco: "fondo", icono: "🔥", nombre: "Aura de fuego", precio: 80 },
    { id: "planeta", hueco: "fondo", icono: "🪐", nombre: "Planeta", precio: 90 },
    { id: "fuegos", hueco: "fondo", icono: "🎆", nombre: "Fuegos artificiales", precio: 120 },
    // Mascotas
    { id: "mariquita", hueco: "mascota", icono: "🐞", nombre: "Mariquita", precio: 20 },
    { id: "abeja", hueco: "mascota", icono: "🐝", nombre: "Abeja", precio: 20 },
    { id: "mariposa", hueco: "mascota", icono: "🦋", nombre: "Mariposa", precio: 25 },
    { id: "pez", hueco: "mascota", icono: "🐠", nombre: "Pececito", precio: 25 },
    { id: "pollito", hueco: "mascota", icono: "🐣", nombre: "Pollito", precio: 30 },
    { id: "unicornio", hueco: "mascota", icono: "🦄", nombre: "Unicornio", precio: 140 },
    { id: "dragoncito", hueco: "mascota", icono: "🐉", nombre: "Dragoncito", precio: 150 }
  ];
  const INSIGNIAS = [
    { id: "primera", icono: "🗺️", nombre: "Primera aventura", desc: "Completa tu primera misión." },
    { id: "maestro-bv", icono: "🐝", nombre: "Maestro de la B/V", desc: "Domina la B y la V.", hab: "bv" },
    { id: "explorador-h", icono: "🧭", nombre: "Explorador de la H", desc: "Domina la H.", hab: "h" },
    { id: "guardian-lly", icono: "🛡️", nombre: "Guardián de la LL/Y", desc: "Domina la LL y la Y.", hab: "lly" },
    { id: "cazador-tildes", icono: "🏹", nombre: "Cazador de tildes", desc: "Domina las tildes básicas.", hab: "tildes" },
    { id: "explorador-gj", icono: "🦇", nombre: "Explorador de la G/J", desc: "Domina la G y la J.", hab: "gj" },
    { id: "capitan-czs", icono: "⚓", nombre: "Capitán de la C/Z/S", desc: "Domina la C, la Z y la S.", hab: "czs" },
    { id: "guardian-signos", icono: "❗", nombre: "Guardián de los signos", desc: "Domina la puntuación y las mayúsculas.", hab: "punt" },
    { id: "adulto-diac", icono: "📚", nombre: "Experto en tildes diacríticas", desc: "Domina la tilde diacrítica.", hab: "diac", publico: "adulto" },
    { id: "adulto-homo", icono: "☕", nombre: "Maestro de homófonos", desc: "Domina los homófonos.", hab: "homo", publico: "adulto" },
    { id: "adulto-porq", icono: "🤔", nombre: "Filósofo del porqué", desc: "Domina porque, sino y expresiones.", hab: "porq", publico: "adulto" },
    { id: "adulto-gram", icono: "📮", nombre: "Corrector de estilo", desc: "Domina las dudas gramaticales.", hab: "gram", publico: "adulto" },
    { id: "adulto-tild2", icono: "🔭", nombre: "Astrónomo de las tildes", desc: "Domina las tildes avanzadas.", hab: "tild2", publico: "adulto" },
    { id: "adulto-lelo", icono: "🗣️", nombre: "Oído de oro", desc: "Domina el leísmo, el laísmo y el loísmo.", hab: "lelo", publico: "adulto" },
    { id: "adulto-habla", icono: "🎙️", nombre: "Buen hablante", desc: "Domina «Así no se dice».", hab: "habla", publico: "adulto" },
    { id: "adulto-paron", icono: "🌀", nombre: "Salida del laberinto", desc: "Domina las palabras que confunden.", hab: "paron", publico: "adulto" },
    { id: "adulto-dific", icono: "🏛️", nombre: "Conservador del museo", desc: "Domina las palabras difíciles.", hab: "dific", publico: "adulto" },
    { id: "constancia", icono: "📅", nombre: "Constancia", desc: "Juega en 3 días distintos." },
    { id: "superacion", icono: "💪", nombre: "Superación", desc: "Supera 5 palabras de tu lista de repaso." },
    { id: "coleccionista", icono: "🖼️", nombre: "Coleccionista", desc: "Reúne 10 objetos del álbum." },
    { id: "rey-castillo", icono: "🏰", nombre: "Héroe del castillo", desc: "Supera el Gran Desafío del castillo." }
  ];
  const ESTRELLAS_POR_NIVEL = 25;
  const BONUS = { mision: { estrellas: 3, monedas: 5 }, jefe: { estrellas: 5, monedas: 10 }, decision: 6 };

  function nivelJugador(p) { return 1 + Math.floor(p.estrellas / ESTRELLAS_POR_NIVEL); }
  function progresoNivel(p) { return (p.estrellas % ESTRELLAS_POR_NIVEL) / ESTRELLAS_POR_NIVEL; }

  function revisarInsignias(p) {
    const nuevas = [];
    INSIGNIAS.forEach(ins => {
      if (p.insignias.includes(ins.id) || !insigniaVisible(p, ins)) return;
      let ok = false;
      if (ins.id === "primera") ok = p.sesiones.length >= 1;
      else if (ins.hab) ok = PV.motor.estadoHabilidad(p, ins.hab) === "dominada";
      else if (ins.id === "constancia") ok = Object.keys(p.actividad).length >= 3;
      else if (ins.id === "superacion") ok = (p.consolidadas || 0) >= 5;
      else if (ins.id === "coleccionista") ok = p.coleccion.length >= 10;
      else if (ins.id === "rey-castillo") ok = !!(p.misiones["castillo-jefe"] || {}).completada;
      if (ok) { p.insignias.push(ins.id); nuevas.push(ins); }
    });
    return nuevas;
  }

  // Insignias de cada tipo de jugador (las generales, sin «hab» ni «publico», valen para todos).
  function insigniaVisible(p, ins) {
    const t = p.tipo || "nino";
    if (ins.publico) return ins.publico === t;
    if (ins.hab) return t === "nino";
    if (ins.id === "rey-castillo") return t === "nino";
    return true;
  }

  /* Elige un objeto de colección que aún no se tiene, con probabilidad según su rareza. */
  function sortearObjeto(p, zonas, soloRaros) {
    let libres = PV.COLECCION.filter(o => zonas.includes(o.zona) && !p.coleccion.includes(o.id));
    if (soloRaros && libres.some(o => o.rareza !== "comun")) libres = libres.filter(o => o.rareza !== "comun");
    if (!libres.length) return null;
    const total = libres.reduce((s, o) => s + PV.RAREZAS[o.rareza].peso, 0);
    let r = Math.random() * total;
    for (const o of libres) { r -= PV.RAREZAS[o.rareza].peso; if (r <= 0) return o; }
    return libres[libres.length - 1];
  }
  function darObjeto(p, o) { if (o && !p.coleccion.includes(o.id)) p.coleccion.push(o.id); return o; }

  function zonasAbiertas(p) { return PV.mundo.zonas(p).map(z => z.id); }

  /* Al terminar una misión. eleccion = "hallazgo" | "monedas" (la decisión que tomó el jugador). */
  function completarMision(p, zona, mision, eleccion, diario) {
    const hoy = U.hoy();
    const b = mision && mision.jefe ? BONUS.jefe : BONUS.mision;
    const r = { estrellas: b.estrellas, monedas: b.monedas, objeto: null, cofres: 1, retoDiario: false, insignias: [], primeraVez: false, etapaNueva: null };
    p.estrellas += b.estrellas;
    p.monedas += b.monedas;
    p.cofresPendientes += 1;
    if (eleccion === "hallazgo" && zona) {
      r.objeto = darObjeto(p, sortearObjeto(p, [zona.id], !!mision.jefe) || sortearObjeto(p, zonasAbiertas(p), false));
      if (!r.objeto) { p.monedas += BONUS.decision; r.monedas += BONUS.decision; }
    } else if (eleccion === "monedas") {
      p.monedas += BONUS.decision; r.monedas += BONUS.decision;
    }
    if (mision) {
      const m = p.misiones[mision.id] || (p.misiones[mision.id] = { completada: false, veces: 0 });
      r.primeraVez = !m.completada && !mision.infinita;
      if (!mision.infinita) m.completada = true;
      m.veces++; m.ultima = hoy;
    }
    if (diario && p.retoDiario.fecha !== hoy) { p.retoDiario.fecha = hoy; p.cofresPendientes += 1; r.cofres++; r.retoDiario = true; }
    const etapa = PV.mundo.etapa(p);
    if (etapa > (p.etapaVista || 0)) { r.etapaNueva = PV.ETAPAS[etapa]; p.etapaVista = etapa; }
    r.insignias = revisarInsignias(p);
    return r;
  }

  /* Cofre sorpresa: un objeto de colección, un accesorio o monedas. Nunca se queda vacío. */
  function abrirCofre(p) {
    if (p.cofresPendientes <= 0) return null;
    p.cofresPendientes--;
    const tirada = Math.random();
    if (tirada < 0.5) {
      const o = darObjeto(p, sortearObjeto(p, zonasAbiertas(p), false));
      if (o) return { tipo: "objeto", objeto: o };
    }
    if (tirada < 0.7) {
      const libres = ACCESORIOS.filter(a => !p.accesorios.includes(a.id) && a.precio <= 30);
      if (libres.length) { const a = U.azar(libres); p.accesorios.push(a.id); if (!puestos(p)[a.hueco]) puestos(p)[a.hueco] = a.id; return { tipo: "accesorio", accesorio: a }; }
    }
    const n = 5 + Math.floor(Math.random() * 6);
    p.monedas += n;
    return { tipo: "monedas", cantidad: n };
  }

  function comprar(p, idAcc) {
    const a = ACCESORIOS.find(x => x.id === idAcc);
    if (!a || p.accesorios.includes(a.id) || p.monedas < a.precio) return false;
    p.monedas -= a.precio; p.accesorios.push(a.id);
    puestos(p)[a.hueco] = a.id;   // al comprar, se lo pone
    return true;
  }

  /* Lo que lleva puesto el avatar: { cabeza, cara, mano, cuello, fondo, mascota } (un accesorio por hueco). */
  function puestos(p) {
    if (!p.avatar.puestos || typeof p.avatar.puestos !== "object") {
      p.avatar.puestos = {};
      const viejo = accesorio(p.avatar.accesorio);   // versión anterior: un solo accesorio
      if (viejo) p.avatar.puestos[viejo.hueco] = viejo.id;
    }
    return p.avatar.puestos;
  }
  function llevaPuesto(p, id) { const a = accesorio(id); return !!a && puestos(p)[a.hueco] === id; }
  // Poner o quitar: si ya lo lleva, se lo quita; si no, se lo pone (sustituyendo lo que hubiera en ese hueco).
  function alternar(p, id) {
    const a = accesorio(id);
    if (!a || !p.accesorios.includes(id)) return false;
    const pu = puestos(p);
    if (pu[a.hueco] === id) delete pu[a.hueco]; else pu[a.hueco] = id;
    return true;
  }
  function quitarTodo(p) { p.avatar.puestos = {}; }

  function animal(id) { return ANIMALES.find(a => a.id === id) || ANIMALES[0]; }
  function accesorio(id) { return ACCESORIOS.find(a => a.id === id) || null; }
  function nombreMascota(p) { return (p.mascota && p.mascota.nombre) || animal(p.avatar.animal).nombreDefecto; }

  return { ANIMALES, ACCESORIOS, HUECOS, puestos, llevaPuesto, alternar, quitarTodo, INSIGNIAS, BONUS, insigniaVisible, nivelJugador, progresoNivel, revisarInsignias, completarMision,
           abrirCofre, comprar, animal, accesorio, nombreMascota, sortearObjeto };
})();

/* Sonidos cortos generados en el navegador (sin archivos ni servicios externos). */
PV.sonido = (function () {
  let ctx = null;
  const SECUENCIAS = {
    acierto: [[660, 0, 0.12], [880, 0.1, 0.2]],
    fallo:   [[392, 0, 0.18], [349, 0.14, 0.24]],
    cofre:   [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.3]],
    fin:     [[523, 0, 0.15], [659, 0.12, 0.15], [784, 0.24, 0.35]],
    toque:   [[740, 0, 0.06]]
  };
  function play(nombre, activo) {
    if (!activo) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = ctx.currentTime;
      (SECUENCIAS[nombre] || []).forEach(([f, t, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + t);
        g.gain.exponentialRampToValueAtTime(0.14, t0 + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + d);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + t); o.stop(t0 + t + d + 0.05);
      });
    } catch (e) { /* sin sonido */ }
  }
  return { play };
})();
