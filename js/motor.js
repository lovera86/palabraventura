/* Palabraventura · motor de aprendizaje adaptativo.
   - Cada habilidad tiene un nivel de dificultad (1-3) que sube tras varios aciertos seguidos y baja con errores repetidos.
   - Cada ejercicio fallado entra en la lista de refuerzo y se repasa con repetición espaciada (cajas de Leitner):
     fallo -> mañana -> a los 3 días -> a la semana -> sale de la lista. El reintento del mismo día no cuenta como repaso. */
PV.motor = (function () {
  const U = PV.util;
  const INTERVALOS = [0, 1, 3, 7, 14, 30]; // días hasta el siguiente repaso, según la caja
  const CAJA_CONSOLIDADA = 4;
  const ACIERTOS_PARA_SUBIR = 4;

  function hab(p, id) {
    return p.habilidades[id] || (p.habilidades[id] = { intentos: 0, aciertos: 0, nivel: 1, racha: 0, ventana: [], ultimas: [], dias: [], ultimaFecha: null });
  }
  function item(p, id) {
    return p.items[id] || (p.items[id] = { intentos: 0, aciertos: 0, fallos: 0, caja: 0, proximo: null, enRefuerzo: false, ultimaFecha: null, ultimoFallo: null });
  }

  function actualizarHabilidad(p, habId, acierto) {
    const h = hab(p, habId), hoy = U.hoy(), cambio = { sube: false, baja: false };
    h.intentos++; if (acierto) h.aciertos++;
    h.ultimas.push(acierto ? 1 : 0); if (h.ultimas.length > 10) h.ultimas.shift();
    h.ventana.push(acierto ? 1 : 0); if (h.ventana.length > 3) h.ventana.shift();
    if (!h.dias.includes(hoy)) { h.dias.push(hoy); if (h.dias.length > 30) h.dias.shift(); }
    h.ultimaFecha = hoy;
    if (acierto) {
      h.racha++;
      if (h.racha >= ACIERTOS_PARA_SUBIR && h.nivel < 3) { h.nivel++; h.racha = 0; h.ventana = []; cambio.sube = true; }
    } else {
      h.racha = 0;
      if (h.ventana.filter(x => !x).length >= 2 && h.nivel > 1) { h.nivel--; h.ventana = []; cambio.baja = true; }
    }
    return cambio;
  }

  function programarRepaso(p, ej, acierto) {
    const it = item(p, ej.id), hoy = U.hoy();
    let consolidada = false;
    if (!acierto) {
      it.caja = 1; it.proximo = U.sumarDias(hoy, INTERVALOS[1]); it.enRefuerzo = true; it.ultimoFallo = hoy;
    } else if (it.enRefuerzo && it.ultimoFallo !== hoy && it.proximo && it.proximo <= hoy) {
      it.caja = Math.min(it.caja + 1, INTERVALOS.length - 1);
      if (it.caja >= CAJA_CONSOLIDADA) { it.enRefuerzo = false; it.proximo = null; p.consolidadas = (p.consolidadas || 0) + 1; consolidada = true; }
      else it.proximo = U.sumarDias(hoy, INTERVALOS[it.caja]);
    }
    return { consolidada };
  }

  function registrarRespuesta(p, ej, acierto, ctx) {
    ctx = ctx || {};
    const it = item(p, ej.id), hoy = U.hoy();
    const veniaDeFallo = it.enRefuerzo || !!ctx.reintento;   // esta misma palabra había costado antes
    const tras_error = veniaDeFallo || !!ctx.comprobacion;   // también premia acertar justo después de un fallo
    it.intentos++; if (acierto) it.aciertos++; else it.fallos++;
    it.ultimaFecha = hoy;
    const cambio = actualizarHabilidad(p, ej.habilidad, acierto);
    const rep = programarRepaso(p, ej, acierto);
    const a = p.actividad[hoy] || (p.actividad[hoy] = { retos: 0, aciertos: 0 });
    a.retos++; if (acierto) a.aciertos++;
    Object.keys(p.actividad).forEach(f => { if (U.diasEntre(f, hoy) > 90) delete p.actividad[f]; });
    // Premiamos la mejora: acertar algo que costaba vale doble. Nunca se premia la velocidad.
    let estrellas = 0;
    if (acierto) { estrellas = tras_error ? 2 : 1; p.estrellas += estrellas; }
    return { estrellas, mejora: acierto && veniaDeFallo, sube: cambio.sube, baja: cambio.baja, consolidada: rep.consolidada };
  }

  function esPendiente(p, e, hoy) {
    const it = p.items[e.id];
    return !!(it && it.enRefuerzo && it.proximo && it.proximo <= hoy && it.ultimoFallo !== hoy);
  }
  function pendientes(p, habilidades) {
    const hoy = U.hoy();
    return PV.banco.filter(e => (!habilidades || habilidades.includes(e.habilidad)) && esPendiente(p, e, hoy));
  }

  function puntuar(p, e, hoy) {
    const nivel = hab(p, e.habilidad).nivel, it = p.items[e.id];
    let s = Math.random();
    if (e.dificultad === nivel) s += 1.5;
    else if (e.dificultad < nivel) s += 0.6;          // ejercicios ya dominados, para mezclar
    else s -= (e.dificultad - nivel) * 2;             // más difíciles: solo si no queda otra cosa
    if (!it) s += 0.8;                                // novedades primero
    else if (it.ultimaFecha === hoy) s -= 2;          // evita repetir lo de hoy
    return s;
  }
  function ordenarPorPuntos(p, lista) {
    const hoy = U.hoy();
    return lista.map(e => ({ e, s: puntuar(p, e, hoy) })).sort((a, b) => b.s - a.s).map(x => x.e);
  }

  /* opciones: { habilidades: [...], n, repasoDe: [...], mezclaDe: [...] } -> [{ ej, tag }] */
  function seleccionarSesion(p, opt) {
    const n = opt.n || 8, repasoDe = opt.repasoDe || opt.habilidades;
    const elegidos = [], usados = new Set();
    const add = (e, tag) => { elegidos.push({ ej: e, tag }); usados.add(e.id); };

    U.barajar(pendientes(p, repasoDe)).slice(0, Math.ceil(n * 0.4)).forEach(e => add(e, "repaso"));

    const mezcla = (opt.mezclaDe || []).filter(h => !opt.habilidades.includes(h));
    if (mezcla.length && n - elegidos.length >= 5) {
      ordenarPorPuntos(p, PV.banco.filter(e => mezcla.includes(e.habilidad) && !usados.has(e.id))).slice(0, 2).forEach(e => add(e, null));
    }
    for (const e of ordenarPorPuntos(p, PV.banco.filter(e => opt.habilidades.includes(e.habilidad) && !usados.has(e.id)))) {
      if (elegidos.length >= n) break;
      add(e, null);
    }
    return U.barajar(elegidos);
  }

  /* Pregunta de comprobación tras un error: otro ejercicio de la misma regla (o, si no hay, de la misma habilidad). */
  function buscarComprobacion(p, ej, usados) {
    const libres = PV.banco.filter(e => e.habilidad === ej.habilidad && !usados.has(e.id));
    const mismaRegla = libres.filter(e => e.regla === ej.regla);
    const lista = mismaRegla.length ? mismaRegla : libres.filter(e => e.dificultad <= ej.dificultad);
    return lista.length ? U.azar(lista) : null;
  }

  /* Una habilidad no se da por dominada con una sola respuesta: hacen falta 10 intentos recientes,
     al menos un 85 % de aciertos y práctica en 2 días distintos. */
  function estadoHabilidad(p, habId) {
    const h = p.habilidades[habId];
    if (!h || !h.intentos) return "nueva";
    const prec = h.ultimas.reduce((a, b) => a + b, 0) / h.ultimas.length;
    if (h.ultimas.length >= 10 && prec >= 0.85 && h.dias.length >= 2) return "dominada";
    if (h.intentos >= 6 && prec >= 0.7) return "casi";
    return "practicando";
  }
  function precisionReciente(p, habId) {
    const h = p.habilidades[habId];
    if (!h || !h.ultimas.length) return null;
    return h.ultimas.reduce((a, b) => a + b, 0) / h.ultimas.length;
  }

  return { registrarRespuesta, actualizarHabilidad, programarRepaso, seleccionarSesion, buscarComprobacion,
           estadoHabilidad, precisionReciente, pendientes, hab, INTERVALOS };
})();
