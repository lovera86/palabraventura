/* Palabraventura · La expedición de las palabras perdidas · pantallas del juego.
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
    escudo: { icono: "🛡️", nombre: "Escudo", desc: "Te protege del próximo Borrón." }
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
  function abiertoNivel(estado, k) { return k === 0 || completado(estado, PV.EXPEDICION_ORDEN[k - 1]); }

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
    let amigo = null, batalla = null, bolsa = [], avisoBorron = false;
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
      if (batalla) { if (partida && !partida.corriendo) partida.iniciar(); return pintarBatalla(); }
      if (amigo) return pintarAmigo();
      if (retoAbierto) return pintarReto();
      ocultarPanel();
      if (!partida || !jugando) return;
      if (necesitaGirar()) return avisoGirar();
      partida.iniciar();
    }

    /* ---------- Mapa de la expedición ---------- */
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
        <button type="button" class="btn btn-gris" data-ex="confirmar-salir">Salir</button>`, "ex-tarjeta-mapa");
    }

    /* ---------- Jugar un nivel ---------- */
    function cerrarNivel() {
      pausar();
      if (partida) partida.destruir();
      if (controlNivel) controlNivel.abort();
      partida = null; controlNivel = null; soltarControles = () => {};
      jugando = false; reto = null; retoAbierto = false; obsActual = 0; amigo = null; batalla = null; bolsa = [];
      panel.classList.remove("lado");
      clearTimeout(avisoT); avisoEl.hidden = true;
      raiz.querySelectorAll(".ex-confeti, .ex-vuela").forEach(c => c.remove());
    }
    function cargarNivel(k) {
      cerrarNivel();
      raiz.classList.remove("en-mapa");
      nivel = niveles()[k];
      controlNivel = new AbortController();
      partida = PV.expedicionMotor.crear(lienzo, nivel, {
        icono: ctx.icono, cabeza: ctx.cabeza, mascota: ctx.mascota, animaciones: animado, tactil, alEvento
      });
      soltarControles = PV.expedicionMotor.conectarControles(partida, {
        lienzo, zonaJoy: $(".ex-zona-joy"), base: $(".ex-joy-base"), mando: $(".ex-joy-mando"),
        zonaSalto: $(".ex-zona-salto"), salto: $(".ex-salto")
      }, controlNivel.signal);
      pintarMarcador();
      pintarPoderes();
      mostrarPanel(`<div class="ex-icono-grande">${nivel.icono}</div>
        <small class="ex-etiqueta">Nivel ${k + 1} · ${esc(nivel.regla)}</small>
        <h2>${esc(nivel.titulo)}</h2>
        <p>${esc(nivel.intro)}</p>
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
        if (!avisoBorron) { avisoBorron = true; aviso("¡Bien saltado! El Borrón se ha convertido en mariposa 🦋"); }
      }
      if (tipo === "escudo") { ctx.sonar && ctx.sonar("toque"); pintarPoderes(); aviso("¡Tu escudo te ha protegido! 🛡️"); }
      if (tipo === "amigo") abrirAmigo(d.i);
      if (tipo === "obstaculo" && partida.obstaculo(d.i).tipo === "jefe") abrirBatalla(d.i);
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
      const total = partida.totalLetras(obsActual), tengo = partida.letrasDe(obsActual);
      const ob = partida.obstaculo(obsActual);
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
      poderesEl.innerHTML = Object.keys(PODERES).filter(k => p[k]).map(k => `<span title="${PODERES[k].nombre}">${PODERES[k].icono}</span>`).join("");
    }
    function tomarPregunta() {
      if (!bolsa.length) bolsa = mezclar(preguntas(nivel.habilidades || ["bv", "h", "lly"]));
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

    /* ---------- Meta: celebración, premio y siguiente nivel ---------- */
    function panelMeta() {
      if (!abierta || !partida) return;
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
      }
      mostrarPanel(`<div class="ex-icono-grande ex-meta-icono">${!hay && todo ? "🏆" : "🏁"}</div>
        <h2>${!hay && todo ? "¡Has completado toda la expedición!" : "¡Nivel completado!"}</h2>
        <p>${esc(nivel.titulo)}: ${nivel.obstaculos.filter(o => o.palabra).map(o => esc(o.palabra)).join(" y ")}${nivel.obstaculos.some(o => o.tipo === "jefe") ? " · ⚔️ jefe vencido" : ""} ✔</p>
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
      reto = null; retoAbierto = false; obsActual = 0; amigo = null; batalla = null;
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
        <button type="button" class="btn btn-gris" data-ex="mapa">🗺️ Volver al mapa</button>
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
      },
      seguir() { seguir(); },
      "jugar-asi"() { girarDescartado = true; seguir(); },
      pausa() { if (jugando && !retoAbierto && !batalla && partida && partida.corriendo) panelPausa(); },
      salir() { if (jugando && partida && partida.corriendo) panelPausa(); else if (raiz.classList.contains("en-mapa")) cerrar(); else mapa(); },
      mapa() { mapa(); },
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
      if (f) { if (!["ficha", "hueco", "resp-amigo", "resp-batalla"].includes(b.dataset.ex)) ctx.sonar && ctx.sonar("toque"); f(b); }
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
    mapa();
  }

  return { abrir, niveles, get abierta() { return !!abierta; } };
})();
