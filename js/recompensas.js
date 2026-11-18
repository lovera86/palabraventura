/* Palabraventura · recompensas: estrellas, cofres, accesorios, insignias y nivel del jugador. */
PV.recompensas = (function () {
  const ANIMALES = [
    { id: "zorro", icono: "🦊", nombre: "Zorro" }, { id: "panda", icono: "🐼", nombre: "Panda" },
    { id: "rana", icono: "🐸", nombre: "Rana" }, { id: "buho", icono: "🦉", nombre: "Búho" },
    { id: "dragon", icono: "🐲", nombre: "Dragón" }, { id: "gato", icono: "🐱", nombre: "Gato" },
    { id: "perro", icono: "🐶", nombre: "Perro" }, { id: "tortuga", icono: "🐢", nombre: "Tortuga" }
  ];
  const ACCESORIOS = [
    { id: "corona", icono: "👑", nombre: "Corona" }, { id: "chistera", icono: "🎩", nombre: "Chistera" },
    { id: "gafas", icono: "🕶️", nombre: "Gafas de sol" }, { id: "lazo", icono: "🎀", nombre: "Lazo" },
    { id: "gorra", icono: "🧢", nombre: "Gorra" }, { id: "flor", icono: "🌼", nombre: "Flor" },
    { id: "birrete", icono: "🎓", nombre: "Birrete" }, { id: "casco", icono: "⛑️", nombre: "Casco de explorador" },
    { id: "pluma", icono: "🪶", nombre: "Pluma mágica" }, { id: "estrella", icono: "🌟", nombre: "Estrella brillante" }
  ];
  const INSIGNIAS = [
    { id: "primera", icono: "🗺️", nombre: "Primera aventura", desc: "Completa tu primera aventura." },
    { id: "maestro-bv", icono: "🐝", nombre: "Maestro de la B/V", desc: "Domina la B y la V.", hab: "bv" },
    { id: "explorador-h", icono: "🧭", nombre: "Explorador de la H", desc: "Domina la H.", hab: "h" },
    { id: "guardian-lly", icono: "🛡️", nombre: "Guardián de la LL/Y", desc: "Domina la LL y la Y.", hab: "lly" },
    { id: "cazador-tildes", icono: "🏹", nombre: "Cazador de tildes", desc: "Domina las tildes básicas.", hab: "tildes" },
    { id: "constancia", icono: "📅", nombre: "Constancia", desc: "Juega en 3 días distintos." },
    { id: "superacion", icono: "💪", nombre: "Superación", desc: "Supera 5 palabras de tu lista de repaso." }
  ];
  const ESTRELLAS_POR_NIVEL = 25;
  const BONUS_SESION = 3;

  function nivelJugador(p) { return 1 + Math.floor(p.estrellas / ESTRELLAS_POR_NIVEL); }
  function progresoNivel(p) { return (p.estrellas % ESTRELLAS_POR_NIVEL) / ESTRELLAS_POR_NIVEL; }

  function revisarInsignias(p) {
    const nuevas = [];
    const dias = Object.keys(p.actividad).length;
    INSIGNIAS.forEach(ins => {
      if (p.insignias.includes(ins.id)) return;
      let ok = false;
      if (ins.id === "primera") ok = p.sesiones.length >= 1;
      else if (ins.hab) ok = PV.motor.estadoHabilidad(p, ins.hab) === "dominada";
      else if (ins.id === "constancia") ok = dias >= 3;
      else if (ins.id === "superacion") ok = (p.consolidadas || 0) >= 5;
      if (ok) { p.insignias.push(ins.id); nuevas.push(ins); }
    });
    return nuevas;
  }

  /* Al terminar una sesión: bonus de estrellas, un cofre, cofre extra del reto diario e insignias nuevas. */
  function concederRecompensa(p, resumen) {
    const hoy = PV.util.hoy();
    const r = { bonus: BONUS_SESION, cofres: 1, retoDiario: false, insignias: [] };
    p.estrellas += BONUS_SESION;
    p.cofresPendientes += 1;
    if (resumen.diario && p.retoDiario.fecha !== hoy) { p.retoDiario.fecha = hoy; p.cofresPendientes += 1; r.cofres++; r.retoDiario = true; }
    r.insignias = revisarInsignias(p);
    return r;
  }

  function abrirCofre(p) {
    if (p.cofresPendientes <= 0) return null;
    p.cofresPendientes--;
    const libres = ACCESORIOS.filter(a => !p.accesorios.includes(a.id));
    if (libres.length) { const a = PV.util.azar(libres); p.accesorios.push(a.id); return { tipo: "accesorio", accesorio: a }; }
    p.estrellas += 5;
    return { tipo: "estrellas", cantidad: 5 };
  }

  function animal(id) { return ANIMALES.find(a => a.id === id) || ANIMALES[0]; }
  function accesorio(id) { return ACCESORIOS.find(a => a.id === id) || null; }

  return { ANIMALES, ACCESORIOS, INSIGNIAS, nivelJugador, progresoNivel, revisarInsignias, concederRecompensa, abrirCofre, animal, accesorio };
})();

/* Sonidos cortos generados en el navegador (sin archivos ni servicios externos). */
PV.sonido = (function () {
  let ctx = null;
  const SECUENCIAS = {
    acierto: [[660, 0, 0.12], [880, 0.1, 0.2]],
    fallo:   [[392, 0, 0.18], [349, 0.14, 0.24]],
    cofre:   [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.3]],
    fin:     [[523, 0, 0.15], [784, 0.15, 0.3]]
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
