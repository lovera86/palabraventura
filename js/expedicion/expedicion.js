/* Palabraventura · La expedición de las palabras perdidas · pantalla del juego.
   Monta la escena a pantalla completa encima de la app, con introducción, pausa, salida, aviso de
   «gira el móvil» y ayuda de controles. Todo se crea al entrar y se limpia al salir (listeners incluidos).
   Uso: PV.expedicion.abrir({ icono, cabeza, sonar, animaciones, estado, guardarEstado, alSalir }). */
PV.expedicion = (function () {
  const esc = PV.util.esc;
  let abierta = null;

  function abrir(ctx) {
    if (abierta) return;
    const nivel = PV.EXPEDICION_NIVELES.puente;
    const control = new AbortController();
    const senal = control.signal;
    const estado = ctx.estado || {};
    const tactil = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

    const raiz = document.createElement("div");
    raiz.className = "expedicion" + (tactil ? " tactil" : "");
    raiz.setAttribute("role", "application");
    raiz.setAttribute("aria-label", nivel.titulo);
    raiz.innerHTML = `
      <canvas class="ex-lienzo" aria-hidden="true"></canvas>
      <div class="ex-hud">
        <button type="button" class="ex-boton" data-ex="pausa" aria-label="Pausa">⏸</button>
        <div class="ex-centro"><div class="ex-letras" role="status" aria-label="Letras recogidas: 0 de ${nivel.letras.length}">${nivel.letras.map(() => `<span class="ex-hueco"></span>`).join("")}</div></div>
        <button type="button" class="ex-boton" data-ex="salir" aria-label="Salir de la expedición">✕</button>
      </div>
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
    const panel = $(".ex-panel"), ayuda = $(".ex-ayuda"), avisoEl = $(".ex-aviso"), tiraLetras = $(".ex-letras");
    const animado = ctx.animaciones !== false;
    let avisoT = 0;
    let girarDescartado = false, empezada = false, saltos = 0;
    let reto = null, retoAbierto = false, retoResuelto = false;

    const partida = PV.expedicionMotor.crear($(".ex-lienzo"), nivel, {
      icono: ctx.icono, cabeza: ctx.cabeza, mascota: ctx.mascota, animaciones: animado,
      alEvento(tipo, d) {
        if (tipo === "salto") { ctx.sonar && ctx.sonar("salto"); saltos++; }
        if (tipo === "reaparece") ctx.sonar && ctx.sonar("toque");
        if (tipo === "letra") letraRecogida(d);
        if (tipo === "orilla") {
          if (d.cogidas < d.total) { const n = d.total - d.cogidas; aviso(`Te ${n === 1 ? "falta 1 letra" : `faltan ${n} letras`}. ¡Sigue buscando! 🔍`); }
          else if (!retoResuelto) abrirReto();
        }
        // La ayuda se va sola cuando ya se ha movido y saltado.
        if (!ayuda.hidden && saltos > 0 && partida.jugador.recorrido > 160) ocultarAyuda();
      }
    });
    const soltarControles = PV.expedicionMotor.conectarControles(partida, {
      lienzo: $(".ex-lienzo"), zonaJoy: $(".ex-zona-joy"), base: $(".ex-joy-base"), mando: $(".ex-joy-mando"),
      zonaSalto: $(".ex-zona-salto"), salto: $(".ex-salto")
    }, senal);

    /* ---------- Letras recogidas y avisos ---------- */
    function letraRecogida(d) {
      ctx.sonar && ctx.sonar(d.cogidas === d.total ? "cofre" : "letra");
      const hueco = tiraLetras.children[d.cogidas - 1];
      tiraLetras.setAttribute("aria-label", `Letras recogidas: ${d.cogidas} de ${d.total}`);
      const llenar = () => { hueco.textContent = d.letra; hueco.classList.add("llena"); };
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
      if (d.cogidas === d.total) setTimeout(() => aviso("¡Tienes todas las letras! Ve hasta el río 🌉"), 600);
    }
    function aviso(texto) {
      avisoEl.textContent = texto; avisoEl.hidden = false; avisoEl.classList.remove("fuera");
      clearTimeout(avisoT);
      avisoT = setTimeout(() => { avisoEl.classList.add("fuera"); avisoT = setTimeout(() => { avisoEl.hidden = true; }, 400); }, 2800);
    }

    function ocultarAyuda() {
      ayuda.classList.add("fuera");
      setTimeout(() => { ayuda.hidden = true; }, 500);
      if (!estado.ayudaVista) { estado.ayudaVista = true; ctx.guardarEstado && ctx.guardarEstado(estado); }
    }

    /* ---------- Paneles ---------- */
    function mostrarPanel(html) { panel.innerHTML = `<div class="ex-tarjeta">${html}</div>`; panel.hidden = false; const b = panel.querySelector("[data-foco]"); if (b) b.focus({ preventScroll: true }); }
    function ocultarPanel() { panel.hidden = true; panel.innerHTML = ""; }
    function pausar() { partida.pausar(); soltarControles(); }
    function seguir() {
      if (retoAbierto) return pintarReto();
      ocultarPanel();
      if (necesitaGirar()) return avisoGirar();
      partida.iniciar();
    }

    function intro() {
      mostrarPanel(`<div class="ex-icono-grande">🌉</div>
        <h2>${esc(nivel.titulo)}</h2>
        <p>${esc(nivel.intro)}</p>
        <button type="button" class="btn btn-verde" data-ex="empezar" data-foco>¡VAMOS!</button>`);
    }
    function panelPausa() {
      pausar();
      mostrarPanel(`<h2>⏸ Pausa</h2>
        <button type="button" class="btn btn-verde" data-ex="seguir" data-foco>SEGUIR</button>
        <button type="button" class="btn btn-gris" data-ex="confirmar-salir">Salir de la expedición</button>`);
    }
    function panelSalir() {
      pausar();
      mostrarPanel(`<h2>¿Salir de la expedición?</h2>
        <p>Podrás volver cuando quieras.</p>
        <button type="button" class="btn btn-verde" data-ex="seguir" data-foco>Seguir jugando</button>
        <button type="button" class="btn btn-gris" data-ex="confirmar-salir">Salir</button>`);
    }

    /* ---------- Reto: ordenar las letras para formar la palabra ----------
       Se toca una ficha para ponerla en el primer hueco libre y se toca un hueco para devolver su letra.
       Equivocarse no quita nada: ánimo y otra oportunidad. Tras varios intentos, pista opcional. */
    const R = nivel.reto, PALABRA = nivel.palabra;
    function barajar(lista) {
      let a;
      do {
        a = lista.slice();
        for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
      } while (a.length > 1 && a.map(f => f.l).join("") === PALABRA);   // nunca empieza ya resuelto
      return a;
    }
    function abrirReto() {
      if (!reto) {
        const fichas = partida.letrasCogidas().map((l, i) => ({ id: i, l }));
        reto = { fichas: barajar(fichas), huecos: Array(PALABRA.length).fill(null), fijos: new Set(), intentos: 0, pista: 0, msg: "", estado: "" };
      }
      retoAbierto = true;
      pausar();
      pintarReto();
    }
    function fichaPorId(id) { return reto.fichas.find(f => f.id === id); }
    function pintarReto() {
      const usadas = new Set(reto.huecos.filter(x => x !== null));
      const huecos = reto.huecos.map((id, i) => {
        const f = id === null ? null : fichaPorId(id);
        return `<button type="button" class="ex-r-hueco ${f ? "llena" : ""} ${reto.fijos.has(i) ? "fija" : ""} ${reto.estado}" data-ex="hueco" data-i="${i}"
          aria-label="${f ? `Hueco ${i + 1}: ${f.l}. Toca para quitarla` : `Hueco ${i + 1} vacío`}" ${reto.fijos.has(i) ? "disabled" : ""}>${f ? f.l : ""}</button>`;
      }).join("");
      const banco = reto.fichas.map(f => `<button type="button" class="ex-r-ficha" data-ex="ficha" data-i="${f.id}" ${usadas.has(f.id) ? "disabled aria-hidden=\"true\"" : `aria-label="Letra ${f.l}"`}>${usadas.has(f.id) ? "" : f.l}</button>`).join("");
      const verPista = reto.intentos >= R.intentosParaPista || reto.pista > 0;
      const pistas = [];
      if (reto.pista >= 1) pistas.push(`<div class="ex-r-pista"><span class="ex-r-imagen">${R.imagen}</span><span>${esc(R.definicion)}</span></div>`);
      if (reto.pista >= 2) pistas.push(`<p class="ex-r-nota">🔊 Escucha la palabra. Empieza por <b>${esc(PALABRA[0])}</b>.</p>`);
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
        </div></div>`);
      panel.querySelector(".ex-tarjeta").classList.add("ancha");
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
      const palabra = reto.huecos.map(id => fichaPorId(id).l).join("");
      if (palabra === PALABRA) return exitoReto();
      reto.intentos++;
      reto.estado = "mal";
      reto.msg = R.animos[(reto.intentos - 1) % R.animos.length] + (reto.intentos === R.intentosParaPista ? " Si quieres, pide una pista 💡" : "");
      ctx.sonar && ctx.sonar("fallo");
      pintarReto();
    }
    function darPista() {
      reto.pista = Math.min(2, reto.pista + 1);
      if (reto.pista === 2) {
        hablar(R.decir);
        // Segunda pista: la primera letra queda colocada y fija.
        const primera = reto.huecos[0] !== null && fichaPorId(reto.huecos[0]).l === PALABRA[0] ? reto.huecos[0]
          : reto.fichas.find(f => f.l === PALABRA[0]).id;
        const donde = reto.huecos.indexOf(primera);
        if (donde > 0) reto.huecos[donde] = null;
        if (reto.huecos[0] !== null && reto.huecos[0] !== primera) reto.huecos[0] = null;
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
      reto.estado = "bien"; reto.msg = R.exito;
      retoResuelto = true;
      ctx.sonar && ctx.sonar("fin");
      hablar(R.decir + "!");
      mostrarPanel(`<div class="ex-reto">
        <div class="ex-r-huecos ex-r-final">${PALABRA.split("").map((l, i) => `<span class="ex-r-hueco llena bien" style="--i:${i}">${l}</span>`).join("")}</div>
        <p class="ex-r-msg bien" role="status">${esc(R.exito)}</p>
        <button type="button" class="btn btn-verde" data-ex="cruzar" data-foco>¡A CRUZAR! 🌉</button></div>`);
      panel.querySelector(".ex-tarjeta").classList.add("ancha");
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
      partida.medir();
      if (!empezada || !panel.hidden && !panel.querySelector(".ex-girar")) return;
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
    function alPerderFoco() {
      if (!partida.corriendo) return;
      panelPausa();
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden) alPerderFoco(); }, { signal: senal });
    window.addEventListener("blur", alPerderFoco, { signal: senal });
    window.addEventListener("pagehide", alPerderFoco, { signal: senal });
    window.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (partida.corriendo) panelPausa(); else if (empezada && !panel.hidden && panel.querySelector("[data-ex=seguir]")) seguir();
      else if (retoAbierto && reto.estado !== "bien") ACC["volver-reto"]();
    }, { signal: senal });
    const ro = new ResizeObserver(() => partida.medir());
    ro.observe(raiz);

    /* ---------- Botones (pointerup para que respondan también con dedos en iOS) ---------- */
    const ACC = {
      empezar() {
        empezada = true;
        pantallaCompleta();
        if (!estado.ayudaVista) { ayuda.hidden = false; }
        seguir();
      },
      seguir() { seguir(); },
      "jugar-asi"() { girarDescartado = true; seguir(); },
      pausa() { if (empezada && !retoAbierto) panelPausa(); },
      salir() { if (empezada) panelSalir(); else cerrar(); },
      "confirmar-salir"() { cerrar(); },
      ficha(b) { colocar(Number(b.dataset.i)); },
      hueco(b) { quitar(Number(b.dataset.i)); },
      pista() { darPista(); },
      oir() { hablar(R.decir); },
      "volver-reto"() { retoAbierto = false; seguir(); aviso("Cuando quieras, vuelve al río 🌉"); },
      cruzar() {
        retoAbierto = false;
        partida.construirPuente();
        seguir();
        aviso("¡El puente ha vuelto! Crúzalo 🎉");
      }
    };
    raiz.addEventListener("click", e => {
      const b = e.target.closest("[data-ex]");
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const f = ACC[b.dataset.ex];
      if (f) { if (!["ficha", "hueco"].includes(b.dataset.ex)) ctx.sonar && ctx.sonar("toque"); f(b); }
    }, { signal: senal });

    function cerrar() {
      partida.destruir();
      clearTimeout(avisoT);
      control.abort();
      ro.disconnect();
      salirPantallaCompleta();
      raiz.remove();
      document.body.classList.remove("ex-abierta");
      abierta = null;
      ctx.alSalir && ctx.alSalir();
    }

    abierta = { cerrar };
    intro();
  }

  return { abrir, get abierta() { return !!abierta; } };
})();
