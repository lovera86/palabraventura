/* Palabraventura · La expedición de las palabras perdidas · pantallas del juego.
   Dos modos: «La Gran Expedición» (capítulos con zonas conectadas y retos variados, js/expedicion/capitulos.js)
   y «Expediciones cortas» (los niveles sueltos de js/expedicion/niveles.js).
   Monta la expedición a pantalla completa encima de la app: mapa de niveles, introducción, marcador de letras,
   reto de cada palabra (con letra trampa y pistas), pausa, meta con premio y paso al siguiente nivel, aviso de
   «gira el móvil» y ayuda de controles. Todo se crea al entrar y se limpia al salir (listeners incluidos).
   Uso: PV.expedicion.abrir({ icono, cabeza, mascota, sonar, sonido, animaciones, estado, guardarEstado, alCompletar, alSalir }). */
PV.expedicion = (function () {
  const esc = PV.util.esc;
  const ANIMOS = ["¡Casi! Prueba a cambiar alguna letra de sitio.", "¡Buen intento! Mira bien el orden.", "¡No pasa nada! Vuelve a probar."];
  const INTENTOS_PARA_PISTA = 2;
  const ID_TRAMPA = 99;
  const PODERES = {
    dobleSalto: { icono: "🪽", nombre: "Doble salto", desc: "Puedes saltar otra vez en el aire." },
    iman: { icono: "🧲", nombre: "Imán de letras", desc: "Atraes las letras desde más lejos." },
    escudo: { icono: "🛡️", nombre: "Escudo", desc: "Durante todo el nivel, los Borrones que te toquen se convierten en mariposas." }
  };
  let abierta = null;

  function mezclar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
    return a;
  }
  /* Preguntas de «elige la bien escrita» sacadas del banco de ejercicios de la app (las de «detective» y las de
     «completa», convertidas en palabras enteras), solo de las habilidades del nivel y de dificultad 1 o 2. */
  function preguntas(habilidades) {
    return (PV.banco || []).filter(e => habilidades.includes(e.habilidad) && (e.dificultad || 1) <= 2 &&
      (e.tipo === "detective" || (e.tipo === "completa" && e.hueco && e.hueco.includes("_")))).map(e => {
      const forma = o => e.tipo === "completa" ? e.hueco.replace("_", o) : o;
      return { frase: e.frase || "", opciones: mezclar(e.opciones.map(forma)), correcta: forma(e.correcta), explicacion: e.explicacion || "" };
    }).filter(q => q.opciones.includes(q.correcta) && new Set(q.opciones).size === q.opciones.length);
  }

  function niveles() { return PV.EXPEDICION_ORDEN.map(id => PV.EXPEDICION_NIVELES[id]); }
  function completado(estado, id) { return !!(estado[id] && estado[id].completada); }
  // Los niveles se abren en orden: el primero siempre, y cada uno al completar el anterior.
  function abiertoNivel(estado, k) { return k === 0 || completado(estado, PV.EXPEDICION_ORDEN[k]) || completado(estado, PV.EXPEDICION_ORDEN[k - 1]); }

  function abrir(ctx) {
    if (abierta) return;
    const control = new AbortController();
    const senal = control.signal;
    const estado = ctx.estado || {};
    const animado = ctx.animaciones !== false;
    const tactil = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

    const raiz = document.createElement("div");
    raiz.className = "expedicion" + (tactil ? " tactil" : "");
    raiz.setAttribute("role", "application");
    raiz.setAttribute("aria-label", "La expedición de las palabras perdidas");
    raiz.innerHTML = `
      <canvas class="ex-lienzo" aria-hidden="true"></canvas>
      <div class="ex-hud">
        <button type="button" class="ex-boton" data-ex="pausa" aria-label="Pausa">⏸</button>
        <div class="ex-centro"><div class="ex-letras" role="status"></div></div>
        <button type="button" class="ex-boton" data-ex="salir" aria-label="Salir">✕</button>
      </div>
      <div class="ex-poderes" aria-label="Poderes"></div>
      <div class="ex-zona-joy" aria-hidden="true"><div class="ex-joy-base"><div class="ex-joy-mando"></div></div></div>
      <div class="ex-zona-salto" aria-hidden="true"><div class="ex-salto">⬆</div></div>
      <div class="ex-ayuda" hidden>${tactil
        ? `<span>👈 Mueve el joystick</span><span>Toca para saltar 👉</span>`
        : `<span>⬅️ ➡️ para moverte</span><span>Espacio para saltar</span>`}</div>
      <div class="ex-aviso" hidden></div>
      <div class="ex-panel" hidden></div>`;
    document.body.appendChild(raiz);
    document.body.classList.add("ex-abierta");

    const $ = s => raiz.querySelector(s);
    const lienzo = $(".ex-lienzo"), panel = $(".ex-panel"), ayuda = $(".ex-ayuda"), avisoEl = $(".ex-aviso"), tiraLetras = $(".ex-letras");
    let avisoT = 0, girarDescartado = false, saltos = 0;
    // Nivel en juego
    let nivel = null, partida = null, controlNivel = null, soltarControles = () => {};
    let jugando = false, obsActual = 0, reto = null, retoAbierto = false;
    let amigo = null, batalla = null, bolsa = [], avisoBorron = false, fraseBarca = "";
    let escena = null;          // { tipo: "corta", k } o { tipo: "zona", ci, zi }
    let retoNuevo = null;       // reto de la Gran Expedición abierto (js/expedicion/retos.js)
    const poderesEl = $(".ex-poderes");

    /* ---------- Avisos y ayuda ---------- */
    function aviso(texto) {
      avisoEl.textContent = texto; avisoEl.hidden = false; avisoEl.classList.remove("fuera");
      clearTimeout(avisoT);
      avisoT = setTimeout(() => { avisoEl.classList.add("fuera"); avisoT = setTimeout(() => { avisoEl.hidden = true; }, 400); }, 2800);
    }
    function ocultarAyuda() {
      ayuda.classList.add("fuera");
      setTimeout(() => { ayuda.hidden = true; }, 500);
      if (!estado.ayudaVista) { estado.ayudaVista = true; guardar(); }
    }
    function guardar() { ctx.guardarEstado && ctx.guardarEstado(estado); }

    /* ---------- Paneles ---------- */
    function mostrarPanel(html, clase) {
      panel.classList.toggle("lado", clase === "ex-tarjeta-batalla");
      panel.innerHTML = `<div class="ex-tarjeta ${clase || ""}">${html}</div>`;
      panel.hidden = false;
      const b = panel.querySelector("[data-foco]"); if (b) b.focus({ preventScroll: true });
    }
    function ocultarPanel() { panel.hidden = true; panel.innerHTML = ""; }
    function pausar() { if (partida) partida.pausar(); soltarControles(); }
    function seguir() {
      if (retoNuevo) return;
      if (batalla) { if (partida && !partida.corriendo) partida.iniciar(); return pintarBatalla(); }
      if (amigo) return pintarAmigo();
      if (retoAbierto) return pintarReto();
      ocultarPanel();
      if (!partida || !jugando) return;
      if (necesitaGirar()) return avisoGirar();
      partida.iniciar();
    }

    /* ---------- Menú: La Gran Expedición o expediciones cortas ---------- */
    function inicio() {
      cerrarNivel();
      escena = null;
      raiz.classList.add("en-mapa");
      if (!estado.granVista) { estado.granVista = true; estado.mapaVisto = true; guardar(); }
      const cap = PV.GRAN_EXPEDICION[0], z = zonaSiguiente(cap);
      const hechas = cap.zonas.filter(x => completado(estado, x.id)).length;
      const lista = niveles(), cortas = lista.filter(n => completado(estado, n.id)).length;
      mostrarPanel(`<h2>🗺️ La expedición de las palabras perdidas</h2>
        <div class="ex-modos">
          <button type="button" class="ex-modo gran" data-ex="gran">
            <span class="ex-modo-icono">${cap.icono}</span>
            <span><strong>La Gran Expedición</strong><small>Capítulo 1: ${esc(cap.titulo)} · ${completado(estado, "cap-" + cap.id) ? "¡completado! ✔" : `zona ${Math.min(z + 1, cap.zonas.length)} de ${cap.zonas.length}`}</small>
            <small>${hechas ? `🗺️ ${hechas} de ${cap.zonas.length} trozos del mapa` : "Aventura larga con retos de todo tipo"}</small></span></button>
          <button type="button" class="ex-modo" data-ex="cortas">
            <span class="ex-modo-icono">🏕️</span>
            <span><strong>Expediciones cortas</strong><small>${lista.length} niveles · ${cortas} completados</small></span></button>
        </div>
        <button type="button" class="btn btn-gris" data-ex="confirmar-salir">Salir</button>`, "ex-tarjeta-mapa");
    }
    function zonaHecha(z) { return completado(estado, z.id); }
    // Las zonas se abren en orden; una zona ya completada sigue abierta siempre.
    function zonaAbierta(cap, i) { return i === 0 || zonaHecha(cap.zonas[i]) || zonaHecha(cap.zonas[i - 1]); }
    function zonaSiguiente(cap) { const i = cap.zonas.findIndex(z => !zonaHecha(z)); return i < 0 ? cap.zonas.length : i; }
    function gemasDe(z) { return (estado[z.id] && estado[z.id].gemas) || 0; }
    function pantallaCapitulo(ci) {
      cerrarNivel();
      escena = null;
      raiz.classList.add("en-mapa");
      const cap = PV.GRAN_EXPEDICION[ci], sig = zonaSiguiente(cap);
      const gemas = cap.zonas.reduce((s, z) => s + gemasDe(z), 0), totalGemas = cap.zonas.reduce((s, z) => s + z.secretos.length, 0);
      mostrarPanel(`<h2>${cap.icono} Capítulo 1: ${esc(cap.titulo)}</h2>
        <p class="ex-mapa-nota">${esc(cap.mision)}</p>
        <div class="ex-mapa zonas">${cap.zonas.map((z, i) => {
          const hecha = zonaHecha(z), ab = zonaAbierta(cap, i);
          return `<button type="button" class="ex-nivel ${hecha ? "hecho" : ""} ${ab ? "" : "bloqueado"} ${i === sig ? "siguiente" : ""}" data-ex="zona" data-ci="${ci}" data-zi="${i}"
            aria-label="Zona ${i + 1}: ${esc(z.nombre)}${hecha ? ", completada" : ab ? "" : ", bloqueada"}">
            <span class="ex-nivel-icono">${ab ? z.icono : "🔒"}</span>
            <span class="ex-nivel-texto"><strong>${i + 1}. ${esc(z.nombre)}</strong><small>${esc(z.regla)}${hecha ? ` · 💎 ${gemasDe(z)}/${z.secretos.length}` : ""}</small></span>
            <span class="ex-nivel-estado">${hecha ? "✔" : i === sig ? "▶" : ""}</span></button>`;
        }).join("")}</div>
        <p class="ex-mapa-nota">🗺️ Trozos del mapa: ${cap.zonas.filter(zonaHecha).length} de ${cap.zonas.length} · 💎 Gemas secretas: ${gemas} de ${totalGemas}</p>
        <div class="ex-r-botones">
          ${sig < cap.zonas.length ? `<button type="button" class="btn btn-verde" data-ex="zona" data-ci="${ci}" data-zi="${sig}" data-foco>▶ ${sig ? "Continuar" : "Empezar"}: zona ${sig + 1}</button>` : ""}
          <button type="button" class="btn btn-gris" data-ex="inicio">← Volver</button>
        </div>`, "ex-tarjeta-mapa");
    }
    function volverMenu() { if (escena && escena.tipo === "zona") pantallaCapitulo(escena.ci); else mapa(); }

    /* ---------- Mapa de las expediciones cortas ---------- */
    function mapa() {
      cerrarNivel();
      raiz.classList.add("en-mapa");
      if (!estado.mapaVisto) { estado.mapaVisto = true; guardar(); }
      const lista = niveles();
      const hechos = lista.filter(n => completado(estado, n.id)).length;
      const siguiente = lista.findIndex((n, k) => abiertoNivel(estado, k) && !completado(estado, n.id));
      mostrarPanel(`<h2>🗺️ La expedición de las palabras perdidas</h2>
        <p class="ex-mapa-nota">${hechos === lista.length ? "¡Has completado toda la expedición! Puedes repetir cualquier nivel." : `Niveles completados: ${hechos} de ${lista.length}`}</p>
        <div class="ex-mapa">${lista.map((n, k) => {
          const hecho = completado(estado, n.id), ab = abiertoNivel(estado, k);
          return `<button type="button" class="ex-nivel ${hecho ? "hecho" : ""} ${ab ? "" : "bloqueado"} ${k === siguiente ? "siguiente" : ""}" data-ex="nivel" data-k="${k}"
            aria-label="Nivel ${k + 1}: ${esc(n.nombre)}${hecho ? ", completado" : ab ? "" : ", bloqueado"}">
            <span class="ex-nivel-icono">${ab ? n.icono : "🔒"}</span>
            <span class="ex-nivel-texto"><strong>${k + 1}. ${esc(n.nombre)}</strong><small>${esc(n.regla)}</small></span>
            <span class="ex-nivel-estado">${hecho ? "✔" : k === siguiente ? "▶" : ""}</span></button>`;
        }).join("")}</div>
        <button type="button" class="btn btn-gris" data-ex="inicio">← Volver</button>`, "ex-tarjeta-mapa");
    }

    /* ---------- Jugar un nivel ---------- */
    function cerrarNivel() {
      pausar();
      if (partida) partida.destruir();
      if (controlNivel) controlNivel.abort();
      partida = null; controlNivel = null; soltarControles = () => {};
      jugando = false; reto = null; retoAbierto = false; obsActual = 0; amigo = null; batalla = null; bolsa = []; retoNuevo = null;
      panel.classList.remove("lado");
      clearTimeout(avisoT); avisoEl.hidden = true;
      raiz.querySelectorAll(".ex-confeti, .ex-vuela").forEach(c => c.remove());
    }
    function cargarNivel(k) { cargarEscena(niveles()[k], { tipo: "corta", k }); }
    function cargarZona(ci, zi) { cargarEscena(PV.GRAN_EXPEDICION[ci].zonas[zi], { tipo: "zona", ci, zi }); }
    function cargarEscena(n, info) {
      cerrarNivel();
      raiz.classList.remove("en-mapa");
      nivel = n; escena = info;
      (nivel.objetos || []).forEach(o => { o.entregado = false; });
      controlNivel = new AbortController();
      let palabras = null;
      if (nivel.modo === "barca") {
        palabras = mezclar(preguntas(nivel.habilidades)).slice(0, nivel.barca.parejas).map(q => ({
          frase: q.frase, correcta: q.correcta, incorrecta: q.opciones.find(o => o !== q.correcta), explicacion: q.explicacion }));
      }
      fraseBarca = "";
      partida = PV.expedicionMotor.crear(lienzo, nivel, {
        icono: ctx.icono, cabeza: ctx.cabeza, mascota: ctx.mascota, animaciones: animado, tactil, alEvento, palabras
      });
      soltarControles = PV.expedicionMotor.conectarControles(partida, {
        lienzo, zonaJoy: $(".ex-zona-joy"), base: $(".ex-joy-base"), mando: $(".ex-joy-mando"),
        zonaSalto: $(".ex-zona-salto"), salto: $(".ex-salto")
      }, controlNivel.signal);
      pintarMarcador();
      pintarPoderes();
      const cap = info.tipo === "zona" ? PV.GRAN_EXPEDICION[info.ci] : null;
      mostrarPanel(`<div class="ex-icono-grande">${nivel.icono}</div>
        <small class="ex-etiqueta">${cap ? `Zona ${info.zi + 1} de ${cap.zonas.length}` : `Nivel ${info.k + 1}`} · ${esc(nivel.regla)}</small>
        <h2>${esc(nivel.titulo)}</h2>
        ${cap && info.zi === 0 ? `<p class="ex-mision">🗺️ ${esc(cap.mision)}</p>` : ""}
        <p>${esc(nivel.intro)}</p>
        ${nivel.secretos && nivel.secretos.length ? `<p class="ex-r-nota">💎 Hay ${nivel.secretos.length} gemas secretas escondidas. Tu mascota te ayudará a encontrarlas.</p>` : ""}
        <button type="button" class="btn btn-verde" data-ex="empezar" data-foco>¡VAMOS!</button>`);
    }
    function indiceNivel() { return PV.EXPEDICION_ORDEN.indexOf(nivel.id); }

    function alEvento(tipo, d) {
      if (tipo === "salto") { ctx.sonar && ctx.sonar("salto"); saltos++; }
      if (tipo === "reaparece") ctx.sonar && ctx.sonar("toque");
      if (tipo === "letra") letraRecogida(d);
      if (tipo === "robo") {
        ctx.sonar && ctx.sonar("fallo");
        pintarMarcador();
        aviso(d.letra ? `¡Un Borrón te ha quitado la ${d.letra}! Ha vuelto a su sitio 🔙` : "¡Cuidado con los Borrones! Sáltales encima 🦋");
      }
      if (tipo === "enemigo") {
        ctx.sonar && ctx.sonar("letra");
        if (d.escudo) aviso("¡Tu escudo te protege! El Borrón se ha convertido en mariposa 🛡️🦋");
        else if (!avisoBorron) { avisoBorron = true; aviso("¡Bien saltado! El Borrón se ha convertido en mariposa 🦋"); }
      }
      if (tipo === "amigo") abrirAmigo(d.i);
      if (tipo === "palabra") {
        ctx.sonar && ctx.sonar(d.buena ? "letra" : "fallo");
        aviso(d.buena ? `¡Bien! «${d.texto}» está bien escrita ⭐` : `¡Uy! Se escribe «${d.correcta}». ${d.explicacion}`);
        pintarMarcador();
      }
      if (tipo === "par") { fraseBarca = d.q ? (d.q.frase || "¿Cuál está bien escrita?") : ""; pintarMarcador(); }
      if (tipo === "atraca") { ctx.sonar && ctx.sonar("cofre"); aviso("¡Has llegado al puerto! Baja y ve hasta la meta 🏁"); }
      if (tipo === "objeto") objetoTocado(d);
      if (tipo === "secreto") { ctx.sonar && ctx.sonar("cofre"); aviso(`💎 ¡Gema secreta! (${d.cogidas} de ${d.total})`); pintarMarcador(); }
      const obT = tipo === "obstaculo" ? partida.obstaculo(d.i) : null;
      const tipoReto = obT && obT.reto && obT.reto.tipo;
      if (obT && obT.tipo === "jefe") abrirBatalla(d.i);
      else if (tipoReto === "buscar") llegarBuscar(d.i);
      else if (tipoReto && tipoReto !== "construir") abrirRetoNuevo(d.i);
      else if (tipo === "obstaculo") {
        if (d.cogidas < d.total) { const n = d.total - d.cogidas; aviso(`Te ${n === 1 ? "falta 1 letra" : `faltan ${n} letras`}. ¡Sigue buscando! 🔍`); }
        else abrirReto(d.i);
      }
      if (tipo === "resuelto") {
        ctx.sonar && ctx.sonar("cofre");
        const ob = partida.obstaculo(d.i);
        aviso(ob.reto ? ob.reto.tras : ob.tras);
        if (d.i + 1 < partida.numObstaculos) { obsActual = d.i + 1; pintarMarcador(); }
      }
      if (tipo === "zarpa") ctx.sonar && ctx.sonar("toque");
      if (tipo === "meta") setTimeout(panelMeta, 500);
      // La ayuda se va sola cuando ya se ha movido y saltado.
      if (!ayuda.hidden && saltos > 0 && partida && partida.jugador.recorrido > 160) ocultarAyuda();
    }

    /* ---------- Marcador de letras (las de la palabra que toca) ---------- */
    function pintarMarcador() {
      if (partida.modoBarca) {
        const r = partida.resultadoBarca();
        tiraLetras.innerHTML = `<span class="ex-jefe-chip">⭐ ${r.bien} / ${r.total}</span>${fraseBarca ? `<span class="ex-frase-barca">${esc(fraseBarca)}</span>` : ""}`;
        tiraLetras.setAttribute("aria-label", `Palabras bien escritas: ${r.bien} de ${r.total}. ${fraseBarca}`);
        return;
      }
      const total = partida.totalLetras(obsActual), tengo = partida.letrasDe(obsActual);
      const ob = partida.obstaculo(obsActual);
      if (!total && escena && escena.tipo === "zona" && !(ob && ob.tipo === "jefe")) {
        const cap = PV.GRAN_EXPEDICION[escena.ci], g = partida.secretos();
        tiraLetras.innerHTML = `<span class="ex-jefe-chip">🗺️ ${escena.zi + 1}/${cap.zonas.length} · 💎 ${g.cogidos}/${g.total}</span>`;
        tiraLetras.setAttribute("aria-label", `Zona ${escena.zi + 1} de ${cap.zonas.length}. Gemas: ${g.cogidos} de ${g.total}`);
        return;
      }
      if (!total && ob && ob.tipo === "jefe") { tiraLetras.innerHTML = `<span class="ex-jefe-chip">⚔️ ${esc(ob.nombre)}</span>`; tiraLetras.setAttribute("aria-label", ob.nombre); return; }
      tiraLetras.innerHTML = Array.from({ length: total }, (_, i) => `<span class="ex-hueco ${tengo[i] ? "llena" : ""}">${tengo[i] || ""}</span>`).join("");
      tiraLetras.setAttribute("aria-label", `Letras recogidas: ${tengo.length} de ${total}`);
    }
    function letraRecogida(d) {
      ctx.sonar && ctx.sonar(d.cogidas === d.total ? "cofre" : "letra");
      if (d.o !== obsActual) return;
      const hueco = tiraLetras.children[d.cogidas - 1];
      tiraLetras.setAttribute("aria-label", `Letras recogidas: ${d.cogidas} de ${d.total}`);
      const llenar = () => { if (hueco) { hueco.textContent = d.letra; hueco.classList.add("llena"); } };
      if (!animado || !hueco) llenar();
      else {
        // La letra vuela desde el escenario hasta su hueco del marcador.
        const v = document.createElement("span");
        v.className = "ex-vuela"; v.textContent = d.letra;
        v.style.left = d.pantalla.x + "px"; v.style.top = d.pantalla.y + "px";
        raiz.appendChild(v);
        const destino = hueco.getBoundingClientRect();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          v.style.transform = `translate(${destino.left + destino.width / 2 - d.pantalla.x}px, ${destino.top + destino.height / 2 - d.pantalla.y}px) scale(.8)`;
        }));
        setTimeout(() => { v.remove(); llenar(); }, 560);
      }
      if (d.cogidas === d.total) setTimeout(() => aviso("¡Tienes todas las letras! Sigue adelante 👉"), 600);
    }

    /* ---------- Reto: ordenar las letras para formar la palabra ----------
       Se toca una ficha para ponerla en el primer hueco libre y se toca un hueco para devolver su letra.
       Puede haber una letra trampa (la falta de ortografía típica): usarla explica la regla.
       Equivocarse no quita nada: ánimo y otra oportunidad. Tras varios intentos, pista opcional. */
    function barajar(lista, palabra) {
      let a;
      do {
        a = lista.slice();
        for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
      } while (a.length > 1 && a.filter(f => !f.trampa).map(f => f.l).join("") === palabra);   // nunca empieza ya resuelto
      return a;
    }
    function abrirReto(i) {
      const o = partida.obstaculo(i);
      if (!reto || reto.i !== i) {
        const fichas = partida.letrasDe(i).map((l, k) => ({ id: k, l }));
        if (o.reto.trampa) fichas.push({ id: ID_TRAMPA, l: o.reto.trampa.letra, trampa: true });
        reto = { i, R: o.reto, palabra: o.palabra, fichas: barajar(fichas, o.palabra), huecos: Array(o.palabra.length).fill(null),
          fijos: new Set(), intentos: 0, pista: 0, msg: "", estado: "" };
      }
      retoAbierto = true;
      pausar();
      pintarReto();
    }
    function fichaPorId(id) { return reto.fichas.find(f => f.id === id); }
    function pintarReto() {
      const { R, palabra } = reto;
      const usadas = new Set(reto.huecos.filter(x => x !== null));
      const huecos = reto.huecos.map((id, i) => {
        const f = id === null ? null : fichaPorId(id);
        return `<button type="button" class="ex-r-hueco ${f ? "llena" : ""} ${reto.fijos.has(i) ? "fija" : ""} ${reto.estado}" data-ex="hueco" data-i="${i}"
          aria-label="${f ? `Hueco ${i + 1}: ${f.l}. Toca para quitarla` : `Hueco ${i + 1} vacío`}" ${reto.fijos.has(i) ? "disabled" : ""}>${f ? f.l : ""}</button>`;
      }).join("");
      const banco = reto.fichas.map(f => usadas.has(f.id)
        ? `<button type="button" class="ex-r-ficha" disabled aria-hidden="true"></button>`
        : `<button type="button" class="ex-r-ficha" data-ex="ficha" data-i="${f.id}" aria-label="Letra ${f.l}">${f.l}</button>`).join("");
      const verPista = reto.intentos >= INTENTOS_PARA_PISTA || reto.pista > 0;
      const pistas = [];
      if (reto.pista >= 1) pistas.push(`<div class="ex-r-pista"><span class="ex-r-imagen">${R.imagen}</span><span>${esc(R.definicion)}</span></div>`);
      if (reto.pista >= 2) pistas.push(`<p class="ex-r-nota">🔊 Escucha la palabra. Empieza por <b>${esc(palabra[0])}</b>.</p>`);
      mostrarPanel(`<div class="ex-reto">
        <p class="ex-r-enunciado">${esc(R.enunciado)}</p>
        <div class="ex-r-huecos" role="group" aria-label="Palabra">${huecos}</div>
        <p class="ex-r-msg ${reto.estado}" role="status">${esc(reto.msg)}</p>
        <div class="ex-r-banco" role="group" aria-label="Letras">${banco}</div>
        ${pistas.join("")}
        <div class="ex-r-botones">
          ${verPista && reto.pista < 2 ? `<button type="button" class="btn btn-gris" data-ex="pista">💡 ${reto.pista ? "Otra pista" : "Pista"}</button>` : ""}
          ${reto.pista >= 2 ? `<button type="button" class="btn btn-gris" data-ex="oir">🔊 Oír otra vez</button>` : ""}
          <button type="button" class="btn btn-gris" data-ex="volver-reto">Seguir explorando</button>
        </div></div>`, "ancha");
    }
    function colocar(id) {
      if (!reto || reto.estado === "bien" || reto.huecos.includes(id)) return;
      const libre = reto.huecos.indexOf(null);
      if (libre < 0) return;
      reto.huecos[libre] = id; reto.msg = ""; reto.estado = "";
      ctx.sonar && ctx.sonar("toque");
      if (!reto.huecos.includes(null)) return comprobarReto();
      pintarReto();
    }
    function quitar(i) {
      if (!reto || reto.estado === "bien" || reto.fijos.has(i) || reto.huecos[i] === null) return;
      reto.huecos[i] = null; reto.msg = ""; reto.estado = "";
      pintarReto();
    }
    function comprobarReto() {
      const fichas = reto.huecos.map(fichaPorId);
      // Vale si la palabra queda bien escrita (la ficha trampa puede ser igual que una letra buena, como la U de BRÚJULA).
      if (fichas.map(f => f.l).join("") === reto.palabra) return exitoReto();
      reto.intentos++;
      reto.estado = "mal";
      const trampa = fichas.find(f => f.trampa);
      reto.msg = trampa ? `¡Ojo con ${"¡!¿?".includes(trampa.l) ? "el signo" : "la"} ${trampa.l}! ${reto.R.trampa.explicacion}`
        : ANIMOS[(reto.intentos - 1) % ANIMOS.length] + (reto.intentos === INTENTOS_PARA_PISTA ? " Si quieres, pide una pista 💡" : "");
      ctx.sonar && ctx.sonar("fallo");
      pintarReto();
    }
    function darPista() {
      reto.pista = Math.min(2, reto.pista + 1);
      if (reto.pista === 2) {
        hablar(reto.R.decir);
        // Segunda pista: la primera letra queda colocada y fija.
        const buena = f => f && !f.trampa && f.l === reto.palabra[0];
        const primera = buena(fichaPorId(reto.huecos[0])) ? reto.huecos[0] : reto.fichas.find(buena).id;
        const donde = reto.huecos.indexOf(primera);
        if (donde > 0) reto.huecos[donde] = null;
        reto.huecos[0] = primera; reto.fijos.add(0);
      }
      reto.msg = ""; reto.estado = "";
      pintarReto();
    }
    function hablar(texto) {
      if (!ctx.sonido || !("speechSynthesis" in window)) return;
      try {
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = "es-ES"; u.rate = 0.85;
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (e) { /* sin voz */ }
    }
    function exitoReto() {
      reto.estado = "bien";
      ctx.sonar && ctx.sonar("fin");
      hablar(reto.R.decir + "!");
      mostrarPanel(`<div class="ex-reto">
        <div class="ex-r-huecos ex-r-final">${reto.palabra.split("").map((l, i) => `<span class="ex-r-hueco llena bien" style="--i:${i}">${l}</span>`).join("")}</div>
        <p class="ex-r-msg bien" role="status">¡Muy bien! Has escrito ${esc(reto.palabra)}</p>
        <button type="button" class="btn btn-verde" data-ex="resolver" data-foco>${esc(reto.R.boton)}</button></div>`, "ancha");
    }

    /* ---------- Poderes ---------- */
    function pintarPoderes() {
      const p = partida ? partida.poderes : {};
      const llevo = partida && nivel && nivel.objetos ? partida.objetosCogidos().map(id => nivel.objetos.find(o => o.id === id)).filter(o => o && !o.entregado) : [];
      poderesEl.innerHTML = Object.keys(PODERES).filter(k => p[k]).map(k => `<span title="${PODERES[k].nombre}">${PODERES[k].icono}</span>`).join("")
        + llevo.map(o => `<span title="${esc(o.desc)}">${o.e}</span>`).join("");
    }
    function tomarPregunta() {
      if (!bolsa.length) {
        bolsa = mezclar(preguntas(nivel.habilidades || ["bv", "h", "lly"]));
        // Las preguntas propias del nivel (relaciones, adivinanzas…) salen primero, mezcladas.
        if (nivel.preguntas) bolsa = bolsa.concat(mezclar(nivel.preguntas.map(q => Object.assign({}, q, { opciones: mezclar(q.opciones) }))));
      }
      return bolsa.pop();
    }
    function fraseHTML(f) { return esc(f).replace("___", `<span class="ex-blanco">___</span>`); }
    function opcionesHTML(q, accion, marcas, bloqueado) {
      return `<div class="ex-opciones">${q.opciones.map((o, k) => `<button type="button" class="ex-opcion ${marcas[k] || ""}" data-ex="${accion}" data-k="${k}"
        ${bloqueado || marcas[k] === "mal" ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
    }

    /* ---------- Amiguitos: piden ayuda con una palabra y regalan un poder ---------- */
    function abrirAmigo(i) {
      const a = partida.amigo(i);
      if (!a || a.ayudado || retoAbierto || batalla) return;
      amigo = { a, q: tomarPregunta(), marcas: {}, msg: "", estado: "" };
      pausar();
      ctx.sonar && ctx.sonar("toque");
      pintarAmigo();
    }
    function cabezaAmigo(a, texto) {
      return `<div class="ex-amigo"><span class="ex-amigo-cara">${a.e}</span><div class="ex-bocadillo"><b>${esc(a.nombre)}</b><span>${texto}</span></div></div>`;
    }
    function pintarAmigo() {
      const { a, q } = amigo;
      mostrarPanel(`${cabezaAmigo(a, esc(a.saludo || "¡Hola! ¿Me ayudas? No sé cuál está bien escrita."))}
        ${q.frase ? `<p class="ex-frase">${fraseHTML(q.frase)}</p>` : ""}
        ${opcionesHTML(q, "resp-amigo", amigo.marcas, false)}
        <p class="ex-r-msg ${amigo.estado}" role="status">${esc(amigo.msg)}</p>
        <div class="ex-r-botones"><button type="button" class="btn btn-gris" data-ex="cerrar-amigo">Ahora no</button></div>`, "ancha");
    }
    function responderAmigo(k) {
      const { a, q } = amigo;
      if (q.opciones[k] === q.correcta) {
        partida.ayudarAmigo(a.i);
        partida.darPoder(a.regalo);
        pintarPoderes();
        ctx.sonar && ctx.sonar("fin");
        const pd = PODERES[a.regalo];
        amigo = null;
        mostrarPanel(`${cabezaAmigo(a, `¡Gracias! Se escribe <b>${esc(q.correcta)}</b>. Toma, un regalo para tu aventura:`)}
          <div class="ex-regalo"><span>${pd.icono}</span><div><b>${pd.nombre}</b><small>${pd.desc}</small></div></div>
          <button type="button" class="btn btn-verde" data-ex="seguir" data-foco>¡GENIAL!</button>`, "ancha");
      } else {
        amigo.marcas[k] = "mal"; amigo.estado = "mal";
        amigo.msg = `Casi… ${q.explicacion} ¡Prueba otra!`;
        ctx.sonar && ctx.sonar("fallo");
        pintarAmigo();
      }
    }

    /* ---------- Batalla de palabras contra un jefe ----------
       Por turnos y sin prisa: el jefe enseña una palabra con varias formas de escribirla. Acertar lanza un rayo
       de letras y le quita energía; fallar solo hace que se ría y explica la regla. Al vencerle se convierte en mariposas. */
    function abrirBatalla(i) {
      const o = partida.obstaculo(i);
      batalla = { i, o, vida: o.vida || 3, max: o.vida || 3, q: tomarPregunta(), marcas: {}, estado: "", msg: "", bloqueado: false };
      soltarControles();
      partida.congelar(true, o.x + 45);
      if (!partida.corriendo) partida.iniciar();
      ctx.sonar && ctx.sonar("cofre");
      if (!estado.batallaVista) { batalla.msg = o.saludo || "¡Elige la palabra bien escrita para lanzarle un rayo de letras!"; estado.batallaVista = true; guardar(); }
      pintarBatalla();
    }
    function pintarBatalla() {
      const b = batalla, q = b.q;
      const vida = Array.from({ length: b.max }, (_, k) => k < b.vida ? "💜" : "🤍").join("");
      mostrarPanel(`<div class="ex-batalla-cab"><b>⚔️ ${esc(b.o.nombre)}</b><span class="ex-vida" aria-label="Energía: ${b.vida} de ${b.max}">${vida}</span></div>
        ${q.frase ? `<p class="ex-frase">${fraseHTML(q.frase)}</p>` : `<p class="ex-frase">¿Cuál está bien escrita?</p>`}
        ${opcionesHTML(q, "resp-batalla", b.marcas, b.bloqueado)}
        <p class="ex-r-msg ${b.estado}" role="status">${esc(b.msg)}</p>
        <div class="ex-r-botones">
          ${b.estado === "mal" ? `<button type="button" class="btn btn-verde" data-ex="otra-pregunta" data-foco>¡OTRA! ⚔️</button>` : ""}
          <button type="button" class="btn btn-gris" data-ex="retirarse">Retirarse</button>
        </div>`, "ex-tarjeta-batalla");
    }
    function nuevaPregunta() {
      const b = batalla;
      b.q = tomarPregunta(); b.marcas = {}; b.estado = ""; b.msg = ""; b.bloqueado = false;
      pintarBatalla();
    }
    function responderBatalla(k) {
      const b = batalla;
      if (!b || b.bloqueado) return;
      if (b.q.opciones[k] === b.q.correcta) {
        b.bloqueado = true; b.estado = "bien"; b.marcas[k] = "bien"; b.vida--;
        b.msg = b.vida ? "¡Rayo de letras! 💥" : "¡Rayo final! 💥💥";
        partida.golpearJefe(b.i);
        ctx.sonar && ctx.sonar("letra");
        pintarBatalla();
        setTimeout(() => { if (batalla !== b) return; if (b.vida <= 0) victoria(); else nuevaPregunta(); }, 1200);
      } else {
        b.bloqueado = true; b.estado = "mal"; b.marcas[k] = "mal";
        b.marcas[b.q.opciones.indexOf(b.q.correcta)] = "bien";
        b.msg = `¡Ja, ja! Se escribe «${b.q.correcta}». ${b.q.explicacion}`;
        partida.reirJefe(b.i);
        ctx.sonar && ctx.sonar("fallo");
        pintarBatalla();
      }
    }
    function terminarBatalla() {
      batalla = null;
      panel.classList.remove("lado");
      partida.congelar(false);
      ocultarPanel();
    }
    function victoria() {
      const i = batalla.i;
      terminarBatalla();
      ctx.sonar && ctx.sonar("fin");
      partida.resolver(i);
      if (!partida.corriendo) partida.iniciar();
    }

    /* ---------- Retos de la Gran Expedición ---------- */
    function abrirRetoNuevo(i) {
      const ob = partida.obstaculo(i), clave = nivel.id + "-" + i;
      pausar();
      estado.intros = estado.intros || {};
      retoNuevo = PV.retos.abrir(ob.reto, {
        mostrarPanel, esc, sonar: n => ctx.sonar && ctx.sonar(n), hablar,
        introVista: !!estado.intros[clave],
        introLeida() { estado.intros[clave] = true; guardar(); },
        alResolver() { retoNuevo = null; partida.resolver(i); seguir(); },
        alSalir() { retoNuevo = null; seguir(); aviso("Cuando quieras, vuelve a intentarlo 👍"); }
      });
    }
    /* Buscar: un personaje pide un objeto que hay en el escenario. Tocar otros objetos dice qué son. */
    function retoBuscar() {
      const k = nivel.obstaculos.findIndex(o => o.reto && o.reto.tipo === "buscar");
      return k < 0 ? null : { k, r: nivel.obstaculos[k].reto, ob: partida.obstaculo(k) };
    }
    function objetoTocado(d) {
      const b = retoBuscar();
      if (!b || b.ob.resuelto) return;
      if (d.id === b.r.objetivo) {
        partida.recogerObjeto(d.id); pintarPoderes();
        ctx.sonar && ctx.sonar("cofre");
        aviso(b.ob.pedido ? `¡Esta es! Has cogido ${d.desc} ${d.e}. ¡Llévasela!` : `Has cogido ${d.desc} ${d.e}. ¿Quién la necesitará?`);
      } else {
        ctx.sonar && ctx.sonar("toque");
        aviso(`${d.e} Es ${d.desc}.${b.ob.pedido ? " No es lo que te han pedido." : ""}`);
      }
    }
    function llegarBuscar(i) {
      const ob = partida.obstaculo(i), r = ob.reto, cara = ob.preso || "🙂";
      ob.pedido = true;
      pausar();
      const objetivo = nivel.objetos.find(o => o.id === r.objetivo);
      if (partida.objetosCogidos().includes(r.objetivo)) {
        objetivo.entregado = true; pintarPoderes();
        ctx.sonar && ctx.sonar("fin");
        if (r.regalo) { partida.darPoder(r.regalo); pintarPoderes(); }
        mostrarPanel(`<div class="ex-amigo"><span class="ex-amigo-cara">${cara}</span><div class="ex-bocadillo"><b>¡Bien hecho!</b><span>${esc(r.exito)}</span></div></div>
          <button type="button" class="btn btn-verde" data-ex="entregar" data-i="${i}" data-foco>${esc(r.boton)}</button>`, "ancha");
      } else {
        mostrarPanel(`<div class="ex-amigo"><span class="ex-amigo-cara">${cara}</span><div class="ex-bocadillo"><b>¿Me ayudas?</b><span>${esc(r.instruccion)}</span></div></div>
          <p class="ex-r-nota">Lee bien la pista: hay objetos parecidos que no sirven.</p>
          <button type="button" class="btn btn-verde" data-ex="seguir" data-foco>🔍 ¡VOY A BUSCARLA!</button>`, "ancha");
      }
    }

    /* ---------- Final de una zona de la Gran Expedición ---------- */
    function panelZona() {
      const cap = PV.GRAN_EXPEDICION[escena.ci], zi = escena.zi, ultima = zi + 1 === cap.zonas.length;
      const r = ctx.alCompletar ? ctx.alCompletar(nivel.id, nivel.premio) : null;
      const g = partida.secretos();
      if (estado[nivel.id]) { estado[nivel.id].gemas = Math.max(estado[nivel.id].gemas || 0, g.cogidos); guardar(); }
      const rc = ultima && ctx.alCompletar ? ctx.alCompletar("cap-" + cap.id, cap.premio) : null;
      ctx.sonar && ctx.sonar("fin");
      if (animado) confeti();
      const trozos = cap.zonas.map((z, k) => `<span class="${zonaHecha(z) ? "hecho" : ""} ${k === zi ? "nuevo" : ""}">${zonaHecha(z) ? "🗺️" : ""}</span>`).join("");
      const premios = [r, rc].filter(Boolean);
      const extra = [];
      if (premios.length) {
        extra.push(`<div class="ex-premios"><span>⭐ +${premios.reduce((s, x) => s + x.estrellas, 0)}</span><span>🪙 +${premios.reduce((s, x) => s + x.monedas, 0)}</span></div>`);
        premios.forEach(x => x.insignias.forEach(i => extra.push(`<p class="ex-logro">${i.icono} Nueva insignia: <b>${esc(i.nombre)}</b></p>`)));
        if (premios.some(x => x.etapaNueva)) extra.push(`<p class="ex-logro">✨ ¡Tu compañero ha evolucionado!</p>`);
      }
      const totalGemas = cap.zonas.reduce((s, z) => s + gemasDe(z), 0), maxGemas = cap.zonas.reduce((s, z) => s + z.secretos.length, 0);
      mostrarPanel(`<div class="ex-icono-grande ex-meta-icono">${ultima ? "🏆" : "🗺️"}</div>
        <h2>${ultima ? "¡Has recuperado el mapa completo!" : `¡Trozo de mapa ${zi + 1} de ${cap.zonas.length}!`}</h2>
        <div class="ex-trozos">${trozos}</div>
        <p class="ex-r-nota">💎 Gemas secretas en esta zona: ${g.cogidos} de ${g.total}${ultima ? ` · en todo el capítulo: ${totalGemas} de ${maxGemas}` : ""}</p>
        ${extra.join("")}
        <div class="ex-r-botones">
          ${ultima ? "" : `<button type="button" class="btn btn-verde" data-ex="zona" data-ci="${escena.ci}" data-zi="${zi + 1}" data-foco>▶ Zona ${zi + 2}: ${esc(cap.zonas[zi + 1].nombre)}</button>`}
          <button type="button" class="btn btn-gris" data-ex="otra-vez">🔁 Repetir zona</button>
          <button type="button" class="btn ${ultima ? "btn-verde" : "btn-gris"}" data-ex="capitulo" ${ultima ? "data-foco" : ""}>🗺️ Capítulo</button>
        </div>`);
    }

    /* ---------- Meta: celebración, premio y siguiente nivel ---------- */
    function panelMeta() {
      if (!abierta || !partida) return;
      if (escena && escena.tipo === "zona") { pausar(); jugando = false; return panelZona(); }
      pausar(); jugando = false;
      const r = ctx.alCompletar ? ctx.alCompletar(nivel.id, nivel.premio) : null;
      ctx.sonar && ctx.sonar("fin");
      if (animado) confeti();
      const k = indiceNivel(), hay = k + 1 < PV.EXPEDICION_ORDEN.length;
      const todo = niveles().every(n => completado(estado, n.id));
      const extra = [];
      if (r) {
        extra.push(`<div class="ex-premios"><span>⭐ +${r.estrellas}</span><span>🪙 +${r.monedas}</span></div>`);
        r.insignias.forEach(i => extra.push(`<p class="ex-logro">${i.icono} Nueva insignia: <b>${esc(i.nombre)}</b></p>`));
        if (r.etapaNueva) extra.push(`<p class="ex-logro">✨ ¡Tu compañero ha evolucionado!</p>`);
        if (!r.primeraVez) extra.push(`<p class="ex-r-nota">Premio por volver a completar el nivel.</p>`);
        if (partida.modoBarca) { const rb = partida.resultadoBarca(); extra.unshift(`<p class="ex-logro">⭐ Palabras bien escritas: ${rb.bien} de ${rb.total}</p>`); }
      }
      mostrarPanel(`<div class="ex-icono-grande ex-meta-icono">${!hay && todo ? "🏆" : "🏁"}</div>
        <h2>${!hay && todo ? "¡Has completado toda la expedición!" : "¡Nivel completado!"}</h2>
        <p>${esc(nivel.titulo)}${nivel.obstaculos.length ? ":" : ""} ${nivel.obstaculos.filter(o => o.palabra).map(o => esc(o.palabra)).join(" y ")}${nivel.obstaculos.some(o => o.tipo === "jefe") ? " · ⚔️ jefe vencido" : ""} ✔</p>
        ${extra.join("")}
        <div class="ex-r-botones">
          ${hay ? `<button type="button" class="btn btn-verde" data-ex="siguiente" data-foco>▶ Siguiente nivel</button>` : ""}
          <button type="button" class="btn ${hay ? "btn-gris" : "btn-verde"}" data-ex="otra-vez" ${hay ? "" : "data-foco"}>🔁 Repetir</button>
          <button type="button" class="btn btn-gris" data-ex="mapa">🗺️ Mapa</button>
        </div>`);
    }
    function confeti() {
      const colores = ["#ffcc33", "#ff7aa8", "#4fb3e8", "#6cc070", "#a68cff", "#ff9b2f"];
      for (let i = 0; i < 40; i++) {
        const c = document.createElement("span");
        c.className = "ex-confeti";
        c.style.left = Math.random() * 100 + "%";
        c.style.background = colores[i % colores.length];
        c.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
        c.style.animationDelay = (Math.random() * 0.5) + "s";
        raiz.appendChild(c);
        setTimeout(() => c.remove(), 3600);
      }
    }
    function volverAJugar() {
      partida.reiniciar();
      reto = null; retoAbierto = false; obsActual = 0; amigo = null; batalla = null; retoNuevo = null;
      (nivel.objetos || []).forEach(o => { o.entregado = false; });
      pintarMarcador();
      pintarPoderes();
      clearTimeout(avisoT); avisoEl.hidden = true;
      raiz.querySelectorAll(".ex-confeti").forEach(c => c.remove());
      jugando = true;
      seguir();
    }

    /* ---------- Pausa ---------- */
    function panelPausa() {
      pausar();
      mostrarPanel(`<h2>⏸ Pausa</h2>
        <button type="button" class="btn btn-verde" data-ex="seguir" data-foco>SEGUIR</button>
        <button type="button" class="btn btn-gris" data-ex="mapa">🗺️ ${escena && escena.tipo === "zona" ? "Volver al capítulo" : "Volver al mapa"}</button>
        <button type="button" class="btn btn-gris" data-ex="confirmar-salir">Salir de la expedición</button>`);
    }

    /* ---------- Orientación y pantalla completa ---------- */
    const vertical = window.matchMedia("(orientation: portrait)");
    function necesitaGirar() { return tactil && vertical.matches && !girarDescartado; }
    function avisoGirar() {
      pausar();
      mostrarPanel(`<div class="ex-icono-grande ex-girar">📱</div>
        <h2>Gira el móvil</h2>
        <p>La expedición se juega mejor en horizontal.</p>
        <button type="button" class="btn btn-gris" data-ex="jugar-asi">Jugar así</button>`);
    }
    vertical.addEventListener("change", () => {
      if (partida) partida.medir();
      if (!jugando || !panel.hidden && !panel.querySelector(".ex-girar")) return;
      if (necesitaGirar()) avisoGirar();
      else if (panel.querySelector(".ex-girar")) seguir();
    }, { signal: senal });

    // Solo donde el navegador lo permite (Android): pantalla completa y horizontal. En iPhone no existe: aviso de girar.
    function pantallaCompleta() {
      if (!tactil || !raiz.requestFullscreen || document.fullscreenElement) return;
      raiz.requestFullscreen({ navigationUI: "hide" })
        .then(() => screen.orientation && screen.orientation.lock ? screen.orientation.lock("landscape") : null)
        .catch(() => { /* no disponible: se sigue jugando igual */ });
    }
    function salirPantallaCompleta() {
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* nada */ }
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }

    /* ---------- Pausa automática si la app pierde el foco ---------- */
    function alPerderFoco() { if (partida && partida.corriendo) panelPausa(); }
    document.addEventListener("visibilitychange", () => { if (document.hidden) alPerderFoco(); }, { signal: senal });
    window.addEventListener("blur", alPerderFoco, { signal: senal });
    window.addEventListener("pagehide", alPerderFoco, { signal: senal });
    window.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (partida && partida.corriendo) panelPausa();
      else if (!panel.hidden && panel.querySelector("[data-ex=seguir]")) seguir();
      else if (retoAbierto && reto.estado !== "bien") ACC["volver-reto"]();
      else if (amigo) ACC["cerrar-amigo"]();
      else if (retoNuevo) retoNuevo.accion("salir");
    }, { signal: senal });
    const ro = new ResizeObserver(() => { if (partida) partida.medir(); });
    ro.observe(raiz);

    /* ---------- Botones ---------- */
    const ACC = {
      nivel(b) {
        const k = Number(b.dataset.k);
        if (!abiertoNivel(estado, k)) return aviso("Completa el nivel anterior para abrir este 🔒");
        cargarNivel(k);
      },
      empezar() {
        jugando = true;
        pantallaCompleta();
        if (!estado.ayudaVista) ayuda.hidden = false;
        seguir();
        if (partida.modoBarca) aviso(tactil ? "⬆️ Salta para coger la palabra de arriba. El joystick acelera o frena la barca." : "⬆️ Salta para coger la palabra de arriba. Las flechas aceleran o frenan la barca.");
      },
      seguir() { seguir(); },
      "jugar-asi"() { girarDescartado = true; seguir(); },
      pausa() { if (jugando && !retoAbierto && !batalla && !retoNuevo && partida && partida.corriendo) panelPausa(); },
      salir() { if (jugando && partida && partida.corriendo) panelPausa(); else if (raiz.classList.contains("en-mapa")) cerrar(); else volverMenu(); },
      mapa() { volverMenu(); },
      inicio() { inicio(); },
      gran() { pantallaCapitulo(0); },
      cortas() { mapa(); },
      capitulo() { pantallaCapitulo(escena ? escena.ci : 0); },
      zona(b) {
        const ci = Number(b.dataset.ci), zi = Number(b.dataset.zi), cap = PV.GRAN_EXPEDICION[ci];
        if (!zonaAbierta(cap, zi)) return aviso("Completa la zona anterior para abrir esta 🔒");
        cargarZona(ci, zi);
      },
      rt(b) { if (retoNuevo) retoNuevo.accion(b.dataset.a, b); },
      entregar(b) { const i = Number(b.dataset.i); partida.resolver(i); seguir(); },
      "confirmar-salir"() { cerrar(); },
      ficha(b) { colocar(Number(b.dataset.i)); },
      hueco(b) { quitar(Number(b.dataset.i)); },
      pista() { darPista(); },
      oir() { hablar(reto.R.decir); },
      "volver-reto"() { retoAbierto = false; seguir(); aviso("Cuando quieras, vuelve a intentarlo 👍"); },
      resolver() {
        const i = reto.i;
        retoAbierto = false; reto = null;
        partida.resolver(i);
        seguir();
      },
      "otra-vez"() { volverAJugar(); },
      "resp-amigo"(b) { responderAmigo(Number(b.dataset.k)); },
      "cerrar-amigo"() { amigo = null; seguir(); },
      "resp-batalla"(b) { responderBatalla(Number(b.dataset.k)); },
      "otra-pregunta"() { nuevaPregunta(); },
      retirarse() { terminarBatalla(); aviso("Cuando quieras, vuelve a la batalla ⚔️"); },
      siguiente() { cargarNivel(indiceNivel() + 1); }
    };
    raiz.addEventListener("click", e => {
      const b = e.target.closest("[data-ex]");
      if (!b || b.disabled) return;
      e.preventDefault(); e.stopPropagation();
      const f = ACC[b.dataset.ex];
      if (f) { if (!["ficha", "hueco", "resp-amigo", "resp-batalla", "rt"].includes(b.dataset.ex)) ctx.sonar && ctx.sonar("toque"); f(b); }
    }, { signal: senal });

    function cerrar() {
      cerrarNivel();
      control.abort();
      ro.disconnect();
      salirPantallaCompleta();
      raiz.remove();
      document.body.classList.remove("ex-abierta");
      abierta = null;
      ctx.alSalir && ctx.alSalir();
    }

    abierta = { cerrar };
    inicio();
  }

  return { abrir, niveles, get abierta() { return !!abierta; } };
})();
