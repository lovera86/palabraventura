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
        <span class="ex-titulo">🌉 ${esc(nivel.titulo)}</span>
        <button type="button" class="ex-boton" data-ex="salir" aria-label="Salir de la expedición">✕</button>
      </div>
      <div class="ex-zona-joy" aria-hidden="true"><div class="ex-joy-base"><div class="ex-joy-mando"></div></div></div>
      <div class="ex-zona-salto" aria-hidden="true"><div class="ex-salto">⬆</div></div>
      <div class="ex-ayuda" hidden>${tactil
        ? `<span>👈 Mueve el joystick</span><span>Toca para saltar 👉</span>`
        : `<span>⬅️ ➡️ para moverte</span><span>Espacio para saltar</span>`}</div>
      <div class="ex-panel" hidden></div>`;
    document.body.appendChild(raiz);
    document.body.classList.add("ex-abierta");

    const $ = s => raiz.querySelector(s);
    const panel = $(".ex-panel"), ayuda = $(".ex-ayuda");
    let girarDescartado = false, empezada = false, saltos = 0;

    const partida = PV.expedicionMotor.crear($(".ex-lienzo"), nivel, {
      icono: ctx.icono, cabeza: ctx.cabeza, animaciones: ctx.animaciones !== false,
      alEvento(tipo) {
        if (tipo === "salto") { ctx.sonar && ctx.sonar("salto"); saltos++; }
        if (tipo === "reaparece") ctx.sonar && ctx.sonar("toque");
        // La ayuda se va sola cuando ya se ha movido y saltado.
        if (!ayuda.hidden && saltos > 0 && partida.jugador.recorrido > 160) ocultarAyuda();
      }
    });
    const soltarControles = PV.expedicionMotor.conectarControles(partida, {
      lienzo: $(".ex-lienzo"), zonaJoy: $(".ex-zona-joy"), base: $(".ex-joy-base"), mando: $(".ex-joy-mando"),
      zonaSalto: $(".ex-zona-salto"), salto: $(".ex-salto")
    }, senal);

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
      pausa() { if (empezada) panelPausa(); },
      salir() { if (empezada) panelSalir(); else cerrar(); },
      "confirmar-salir"() { cerrar(); }
    };
    raiz.addEventListener("click", e => {
      const b = e.target.closest("[data-ex]");
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const f = ACC[b.dataset.ex];
      if (f) { ctx.sonar && ctx.sonar("toque"); f(); }
    }, { signal: senal });

    function cerrar() {
      partida.destruir();
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
