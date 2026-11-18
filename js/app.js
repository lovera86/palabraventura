/* Palabraventura · interfaz: pantallas, sesión de juego y panel de adultos. */
(function () {
  const U = PV.util, M = PV.motor, R = PV.recompensas, A = PV.almacen, esc = U.esc;
  const app = document.getElementById("app");
  const capa = document.getElementById("capa");

  const problemas = PV.validarBanco();
  if (problemas.length) console.warn("Palabraventura: revisar banco de ejercicios", problemas);

  let P = A.cargar();
  let sesion = null;

  const MUNDOS = [
    { id: "letras", nombre: "Isla de las letras", icono: "🏝️", clase: "isla-letras", desbloqueo: 0,
      zonas: [{ hab: "bv" }, { hab: "h" }, { hab: "lly" },
              { nombre: "G / J" }, { nombre: "C / Z / S" }, { nombre: "R / RR" }, { nombre: "M antes de B / P" }] },
    { id: "tildes", nombre: "Bosque de las tildes", icono: "🌲", clase: "isla-tildes", desbloqueo: 15,
      zonas: [{ hab: "tildes" }, { nombre: "Tilde diacrítica" }, { nombre: "Diptongos e hiatos" }] },
    { id: "lab", nombre: "Laboratorio de palabras", icono: "⚗️", clase: "isla-lab", proximamente: true,
      zonas: [{ nombre: "Mayúsculas" }, { nombre: "Puntuación" }, { nombre: "Familias de palabras" }] },
    { id: "montana", nombre: "Montaña de desafíos", icono: "⛰️", clase: "isla-montana", proximamente: true,
      zonas: [{ nombre: "Homófonas" }, { nombre: "Dictados" }, { nombre: "Corrección de textos" }] }
  ];
  const ESTADOS = { nueva: "Sin empezar", practicando: "Practicando", casi: "¡Casi lo tienes!", dominada: "Dominada" };
  const ESTADO_PCT = { nueva: 0, practicando: 35, casi: 70, dominada: 100 };
  const MSG_ACIERTO = ["¡Genial!", "¡Bien visto!", "¡Eso es!", "¡Muy bien!", "¡Perfecto!", "¡Lo has clavado!"];
  const MSG_FALLO = ["¡Casi! Vamos a verlo juntos.", "Buen intento. Mira este truco:", "No pasa nada: así se aprende.", "¡Ups! Fíjate en esto:"];

  function guardar() { A.guardar(P); }
  function mundoAbierto(m) { return !m.proximamente && P.estrellas >= m.desbloqueo; }
  function habsAbiertas() { return MUNDOS.filter(mundoAbierto).flatMap(m => m.zonas.filter(z => z.hab).map(z => z.hab)); }

  function recomendada() {
    const orden = { practicando: 0, nueva: 1, casi: 2, dominada: 3 };
    return habsAbiertas().map((h, i) => ({ h, i, e: orden[M.estadoHabilidad(P, h)], f: (P.habilidades[h] || {}).ultimaFecha || "" }))
      .sort((a, b) => a.e - b.e || (a.e === 0 ? a.f.localeCompare(b.f) : a.i - b.i))[0].h;
  }

  /* ---------- Piezas comunes ---------- */
  function avatarHTML(tam) {
    const an = R.animal(P.avatar.animal), ac = R.accesorio(P.avatar.accesorio);
    return `<span class="avatar avatar-${tam}" aria-hidden="true"><span class="avatar-animal">${an.icono}</span>${ac ? `<span class="avatar-acc">${ac.icono}</span>` : ""}</span>`;
  }
  function render(html, clase) {
    app.className = clase || "";
    app.innerHTML = html;
    window.scrollTo(0, 0);
    const foco = app.querySelector("[data-foco]");
    if (foco) foco.focus({ preventScroll: true });
  }
  function modal(html, clase) {
    capa.innerHTML = `<div class="modal ${clase || ""}" role="dialog" aria-modal="true">${html}</div>`;
    capa.hidden = false;
    const f = capa.querySelector("[data-foco]") || capa.querySelector("input, button");
    if (f) setTimeout(() => f.focus(), 30);
  }
  function cerrarModal() { capa.hidden = true; capa.innerHTML = ""; }
  function aviso(texto) {
    const t = document.createElement("div");
    t.className = "aviso"; t.textContent = texto;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("fuera"), 1800);
    setTimeout(() => t.remove(), 2300);
  }
  function chispas(el) {
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      s.className = "chispa"; s.textContent = i % 3 ? "✦" : "⭐";
      const ang = (Math.PI * 2 * i) / 12, dist = 60 + Math.random() * 50;
      s.style.left = r.left + r.width / 2 + "px"; s.style.top = r.top + r.height / 2 + "px";
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px"); s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }
  function sonar(n) { PV.sonido.play(n, P && P.sonido); }

  /* ---------- Bienvenida ---------- */
  function pantallaBienvenida() {
    const elegido = "zorro";
    render(`
      <div class="bienvenida">
        <div class="logo"><span class="logo-icono">🗺️</span><h1>Palabraventura</h1><p>Aventuras para escribir sin faltas</p></div>
        <div class="tarjeta-blanca">
          <label class="etiqueta" for="apodo">¿Cómo te llamamos en la aventura?</label>
          <input id="apodo" class="campo" maxlength="16" placeholder="Por ejemplo: Rayo, Lince, Capitana" autocomplete="off">
          <p class="nota">Usa un apodo. No hace falta tu nombre real.</p>
          <p class="etiqueta">Elige tu compañero de viaje</p>
          <div class="rejilla-animales" role="radiogroup" aria-label="Avatar">
            ${R.ANIMALES.map(a => `<button type="button" class="animal ${a.id === elegido ? "elegido" : ""}" role="radio" aria-checked="${a.id === elegido}" data-accion="elegir-animal-inicio" data-valor="${a.id}" aria-label="${a.nombre}">${a.icono}</button>`).join("")}
          </div>
          <button type="button" class="btn btn-principal btn-grande" data-accion="empezar">¡Empezar la aventura! ➜</button>
        </div>
        <p class="nota-pie">💾 Tu progreso se guarda solo en este navegador y en este dispositivo.${A.disponible ? "" : " <strong>Este navegador no permite guardar: el progreso se perderá al cerrar.</strong>"}</p>
      </div>`, "fondo-cielo");
  }

  /* ---------- Inicio y mapa ---------- */
  function pantallaInicio() {
    const nivel = R.nivelJugador(P), rec = recomendada();
    const hoy = U.hoy(), diarioHecho = P.retoDiario.fecha === hoy;
    const pend = M.pendientes(P, habsAbiertas()).length;
    render(`
      <header class="barra">
        <button type="button" class="perfil" data-accion="mochila" aria-label="Abrir la mochila: avatar, premios e insignias">${avatarHTML("m")}</button>
        <div class="perfil-info">
          <div class="apodo-fila"><span class="apodo">${esc(P.apodo || "Aventurero")}</span>
            <button type="button" class="btn-mini" data-accion="editar-apodo" aria-label="Cambiar apodo">✏️</button></div>
          <div class="chips">
            <span class="chip chip-nivel" title="Nivel">Nivel ${nivel}<span class="barrita"><span style="width:${Math.round(R.progresoNivel(P) * 100)}%"></span></span></span>
            <span class="chip chip-estrella">⭐ ${P.estrellas}</span>
          </div>
        </div>
        <button type="button" class="btn-icono" data-accion="sonido" aria-label="${P.sonido ? "Quitar sonido" : "Poner sonido"}">${P.sonido ? "🔊" : "🔇"}</button>
      </header>

      <main class="inicio">
        <button type="button" class="btn-continuar" data-accion="continuar" data-foco>
          <span class="btn-continuar-icono">▶</span>
          <span><strong>Continuar aventura</strong><small>${PV.HABILIDADES[rec].icono} ${PV.HABILIDADES[rec].nombre} · 8 retos${pend ? ` · ${Math.min(pend, 4)} de repaso` : ""}</small></span>
        </button>

        <div class="fila-tarjetas">
          <button type="button" class="tarjeta tarjeta-reto ${diarioHecho ? "hecho" : ""}" data-accion="reto-diario">
            <span class="tarjeta-icono">${diarioHecho ? "✅" : "📅"}</span>
            <span><strong>Reto del día</strong><small>${diarioHecho ? "¡Completado! Puedes repetirlo." : "5 retos variados · premio: cofre extra 🎁"}</small></span>
          </button>
          ${P.cofresPendientes > 0 ? `
          <button type="button" class="tarjeta tarjeta-cofre" data-accion="abrir-cofre">
            <span class="tarjeta-icono cofre-bote">🎁</span>
            <span><strong>${P.cofresPendientes === 1 ? "Tienes 1 cofre" : `Tienes ${P.cofresPendientes} cofres`}</strong><small>¡Ábrelo y descubre tu premio!</small></span>
          </button>` : ""}
        </div>

        <section class="mapa" aria-labelledby="titulo-mapa">
          <h2 id="titulo-mapa">Mapa de aventuras</h2>
          <div class="mapa-mar">
            ${MUNDOS.map((m, i) => islaHTML(m, i)).join("")}
          </div>
        </section>
      </main>

      <footer class="pie">
        <span>💾 Tu progreso se guarda en este navegador y en este dispositivo.</span>
        <button type="button" class="enlace-discreto" data-accion="adultos">Zona de adultos</button>
      </footer>`, "fondo-mar");
  }

  function islaHTML(m, i) {
    const abierta = mundoAbierto(m);
    const jugables = m.zonas.filter(z => z.hab);
    let estado;
    if (m.proximamente) estado = `<span class="isla-estado">🚧 Próximamente</span>`;
    else if (!abierta) estado = `<span class="isla-estado">🔒 Se abre con ${m.desbloqueo} ⭐ (te faltan ${m.desbloqueo - P.estrellas})</span>`;
    else {
      const pct = Math.round(jugables.reduce((s, z) => s + ESTADO_PCT[M.estadoHabilidad(P, z.hab)], 0) / jugables.length);
      estado = `<span class="isla-estado">Explorado ${pct}%<span class="barrita"><span style="width:${pct}%"></span></span></span>`;
    }
    const dentro = `<span class="isla-icono">${m.icono}</span><span class="isla-nombre">${m.nombre}</span>${estado}`;
    return abierta
      ? `<button type="button" class="isla ${m.clase} pos-${i}" data-accion="mundo" data-valor="${m.id}">${dentro}</button>`
      : `<div class="isla ${m.clase} pos-${i} bloqueada" aria-disabled="true">${dentro}</div>`;
  }

  /* ---------- Mundo ---------- */
  function pantallaMundo(id) {
    const m = MUNDOS.find(x => x.id === id);
    if (!m || !mundoAbierto(m)) return pantallaInicio();
    render(`
      <header class="barra barra-simple">
        <button type="button" class="btn btn-volver" data-accion="inicio" aria-label="Volver al mapa">← Mapa</button>
        <h1 class="titulo-mundo">${m.icono} ${m.nombre}</h1>
      </header>
      <main class="mundo ${m.clase}-fondo">
        <p class="intro-mundo">Elige una zona para explorar. Cada aventura tiene 8 retos.</p>
        <div class="zonas">
          ${m.zonas.map(z => {
            if (!z.hab) return `<div class="zona bloqueada" aria-disabled="true"><span class="zona-icono">🚧</span><span class="zona-nombre">${z.nombre}</span><span class="zona-estado">Próximamente</span></div>`;
            const info = PV.HABILIDADES[z.hab], est = M.estadoHabilidad(P, z.hab), pend = M.pendientes(P, [z.hab]).length;
            return `<button type="button" class="zona zona-${est}" data-accion="zona" data-valor="${z.hab}">
              <span class="zona-icono">${info.icono}</span><span class="zona-nombre">${info.nombre}</span>
              <span class="zona-estado">${est === "dominada" ? "🏅 " : ""}${ESTADOS[est]}${pend ? ` · 🔁 ${pend}` : ""}</span>
              <span class="barrita"><span style="width:${ESTADO_PCT[est]}%"></span></span>
            </button>`;
          }).join("")}
        </div>
      </main>`, "fondo-mar");
  }

  /* ---------- Sesión de juego ---------- */
  function iniciarSesion(modo, hab) {
    const abiertas = habsAbiertas();
    let opt;
    if (modo === "zona") opt = { habilidades: [hab], n: 8 };
    else if (modo === "diario") opt = { habilidades: abiertas, n: 5 };
    else {
      const rec = recomendada();
      opt = { habilidades: [rec], n: 8, repasoDe: abiertas, mezclaDe: abiertas.filter(h => P.habilidades[h] && P.habilidades[h].intentos > 0) };
    }
    const cola = M.seleccionarSesion(P, opt);
    if (!cola.length) { aviso("No hay retos disponibles ahora mismo."); return; }
    sesion = { modo, cola, i: 0, aciertos: 0, contestados: 0, estrellas: 0, mejoras: 0, consolidadas: 0, comprobaciones: 0, reintentados: new Set() };
    pantallaReto();
  }

  function cabeceraJuego() {
    const total = sesion.cola.length;
    return `<header class="barra barra-juego">
      <button type="button" class="btn btn-volver" data-accion="salir-sesion" aria-label="Salir de la aventura">✕</button>
      <div class="progreso" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${sesion.i}" aria-label="Reto ${sesion.i + 1} de ${total}">
        ${sesion.cola.map((r, k) => `<span class="punto ${k < sesion.i ? (r.ok ? "ok" : "repasar") : k === sesion.i ? "actual" : ""}"></span>`).join("")}
      </div>
      <span class="chip chip-estrella">⭐ ${sesion.estrellas}</span>
    </header>`;
  }

  function pantallaReto() {
    const r = sesion.cola[sesion.i], ej = r.ej, tipo = PV.TIPOS[ej.tipo];
    if (!r.orden) r.orden = U.barajar(ej.opciones);
    if (!r.fase) r.fase = ej.tipo === "robot" ? "buscar" : "elegir";
    let etiqueta = "";
    if (r.tag === "comprobacion") etiqueta = `<span class="pill pill-comprobacion">🔎 Comprobación</span>`;
    else if (r.tag === "reintento") etiqueta = `<span class="pill pill-repaso">🔁 Otra oportunidad</span>`;
    else if (r.tag === "repaso") etiqueta = `<span class="pill pill-repaso">🔁 Repaso</span>`;

    let cuerpo = "";
    if (ej.tipo === "detective") {
      cuerpo = `<p class="instruccion">¿Cuál está bien escrita?</p>
        ${ej.frase ? `<p class="frase">${esc(ej.frase).replace("___", `<span class="hueco">${r.elegida !== undefined ? esc(r.elegida) : "?"}</span>`)}</p>` : ""}
        <div class="opciones opciones-palabra">${r.orden.map(o => botonOpcion(r, o, esc(o))).join("")}</div>`;
    } else if (ej.tipo === "completa") {
      const relleno = r.elegida !== undefined ? (r.elegida || "·") : "?";
      const partes = ej.hueco.split("_");
      const palabra = `<span class="palabra-hueco">${esc(partes[0])}<span class="hueco-letra">${esc(relleno)}</span>${esc(partes[1])}</span>`;
      cuerpo = `<p class="instruccion">¿Qué falta en el hueco?</p>
        ${ej.frase ? `<p class="frase">${esc(ej.frase).replace("___", palabra)}</p>` : `<p class="frase">${palabra}</p>`}
        <div class="opciones opciones-letra">${r.orden.map(o => botonOpcion(r, o, o === "" ? "<span class='sin-letra'>sin letra</span>" : esc(o))).join("")}</div>`;
    } else {
      const toks = ej.frase.split(/\s+/);
      cuerpo = `<p class="instruccion">${r.fase === "buscar" ? "El robot ha escrito mal una palabra. ¡Tócala!" : "¿Cómo se escribe bien?"}</p>
        <p class="frase frase-robot">${toks.map((t, k) => {
          const esError = U.limpiar(t) === ej.error;
          let cls = "token";
          if (r.fase !== "buscar" && esError) cls += " token-error";
          if ((r.tocados || []).includes(k)) cls += " token-bien";
          return r.fase === "buscar"
            ? `<button type="button" class="${cls}" data-accion="tocar" data-valor="${k}">${esc(t)}</button>`
            : `<span class="${cls}">${esError && r.respondido ? esc(t.replace(ej.error, ej.correcta)) : esc(t)}</span>`;
        }).join(" ")}</p>
        ${r.pista ? `<p class="pista">${esc(r.pista)}</p>` : ""}
        ${r.fase !== "buscar" ? `<div class="opciones opciones-palabra">${r.orden.map(o => botonOpcion(r, o, esc(o))).join("")}</div>` : ""}`;
    }

    render(`${cabeceraJuego()}
      <main class="juego">
        <div class="tarjeta-reto">
          <div class="modo"><span class="modo-nombre">${tipo.icono} ${tipo.nombre}</span>${etiqueta}</div>
          ${cuerpo}
        </div>
        ${r.respondido ? feedbackHTML(r) : ""}
      </main>`, "fondo-juego");
  }

  function botonOpcion(r, valor, etiqueta) {
    let cls = "opcion", dis = "";
    if (r.respondido) {
      dis = "disabled";
      if (valor === r.ej.correcta) cls += " correcta";
      else if (valor === r.elegida) cls += " elegida-mal";
    }
    return `<button type="button" class="${cls}" data-accion="responder" data-valor="${esc(valor)}" ${dis}>${etiqueta}</button>`;
  }

  function feedbackHTML(r) {
    const ej = r.ej, ok = r.ok, res = r.res;
    const extra = [];
    if (res.sube) extra.push(`<span class="pill pill-sube">⬆️ ¡Subes de nivel en ${PV.HABILIDADES[ej.habilidad].nombre}!</span>`);
    if (res.consolidada) extra.push(`<span class="pill pill-sube">💪 ¡Palabra superada!</span>`);
    return `<section class="feedback ${ok ? "feedback-ok" : "feedback-repaso"}" aria-live="polite">
      <p class="feedback-titulo">${ok ? `${r.msg} <span class="mas-estrellas">+${res.estrellas} ⭐</span>` : r.msg}</p>
      ${ok ? "" : `<p class="feedback-palabra">Se escribe: <strong>${esc(ej.palabra)}</strong></p>`}
      <p class="feedback-explica">💡 ${esc(ej.explicacion)}</p>
      ${ok ? "" : `<p class="feedback-nota">🔁 La repasaremos más adelante para que se te quede.</p>`}
      ${extra.join("")}
      <button type="button" class="btn btn-principal btn-grande" data-accion="seguir" data-foco>${sesion.i + 1 >= sesion.cola.length ? "Ver mi premio 🎁" : "Seguir ➜"}</button>
    </section>`;
  }

  function responder(valor) {
    const r = sesion.cola[sesion.i];
    if (r.respondido || r.fase === "buscar") return;
    r.elegida = valor;
    terminarReto(r, valor === r.ej.correcta && !r.noEncontrado);
  }

  function tocarPalabra(k) {
    const r = sesion.cola[sesion.i], toks = r.ej.frase.split(/\s+/);
    if (U.limpiar(toks[k]) === r.ej.error) {
      r.fase = "corregir"; r.pista = "";
      pantallaReto();
      return;
    }
    r.tocados = (r.tocados || []).concat(k);
    r.fallosBusqueda = (r.fallosBusqueda || 0) + 1;
    if (r.fallosBusqueda >= 2) {
      r.fase = "corregir"; r.noEncontrado = true;
      r.pista = "Era esta palabra, la marcada en naranja. ¿Cómo se escribe bien?";
    } else {
      r.pista = "Esa palabra está bien escrita. ¡Busca otra!";
    }
    pantallaReto();
  }

  function terminarReto(r, acierto) {
    r.respondido = true; r.ok = acierto;
    r.res = M.registrarRespuesta(P, r.ej, acierto, { reintento: r.tag === "reintento", comprobacion: r.tag === "comprobacion" });
    r.msg = U.azar(acierto ? MSG_ACIERTO : MSG_FALLO);
    sesion.contestados++;
    if (acierto) sesion.aciertos++;
    sesion.estrellas += r.res.estrellas;
    if (r.res.mejora) sesion.mejoras++;
    if (r.res.consolidada) sesion.consolidadas++;
    if (!acierto) {
      // Pregunta de comprobación justo después, y el mismo reto otra vez al final de la sesión.
      const usados = new Set(sesion.cola.map(x => x.ej.id));
      if (r.tag !== "comprobacion" && sesion.comprobaciones < 3) {
        const c = M.buscarComprobacion(P, r.ej, usados);
        if (c) { sesion.cola.splice(sesion.i + 1, 0, { ej: c, tag: "comprobacion" }); sesion.comprobaciones++; }
      }
      if (r.tag !== "reintento" && !sesion.reintentados.has(r.ej.id)) {
        sesion.reintentados.add(r.ej.id);
        sesion.cola.push({ ej: r.ej, tag: "reintento" });
      }
    }
    guardar();
    sonar(acierto ? "acierto" : "fallo");
    pantallaReto();
    if (acierto) chispas(app.querySelector(".opcion.correcta") || app.querySelector(".token-error"));
    const fb = app.querySelector(".feedback");
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function siguiente() {
    sesion.i++;
    if (sesion.i >= sesion.cola.length) finalizarSesion();
    else pantallaReto();
  }

  function finalizarSesion() {
    const s = sesion;
    P.sesiones.push({ fecha: U.hoy(), modo: s.modo, retos: s.contestados, aciertos: s.aciertos });
    if (P.sesiones.length > 200) P.sesiones.shift();
    const premio = R.concederRecompensa(P, { diario: s.modo === "diario" });
    guardar();
    sonar("fin");
    sesion = null;
    render(`
      <main class="fin">
        <div class="tarjeta-blanca fin-tarjeta">
          <div class="fin-avatar">${avatarHTML("l")}</div>
          <h1>¡Aventura completada!</h1>
          <p class="fin-sub">Has practicado ${s.contestados} retos. ¡Cada intento cuenta!</p>
          <div class="fin-stats">
            <div class="stat"><span class="stat-num">⭐ ${s.estrellas + premio.bonus}</span><span>estrellas ganadas</span></div>
            <div class="stat"><span class="stat-num">✅ ${s.aciertos}</span><span>aciertos</span></div>
            ${s.mejoras ? `<div class="stat"><span class="stat-num">💪 ${s.mejoras}</span><span>${s.mejoras === 1 ? "palabra que te costaba y ya sale" : "palabras que te costaban y ya salen"}</span></div>` : ""}
          </div>
          ${premio.retoDiario ? `<p class="fin-diario">📅 ¡Reto del día completado! Cofre extra para ti.</p>` : ""}
          ${premio.insignias.length ? `<div class="fin-insignias"><p><strong>¡Nueva insignia!</strong></p>${premio.insignias.map(n => `<div class="insignia-nueva"><span>${n.icono}</span>${n.nombre}</div>`).join("")}</div>` : ""}
          ${P.cofresPendientes > 0 ? `<button type="button" class="btn btn-cofre btn-grande" data-accion="abrir-cofre" data-foco>🎁 Abrir cofre${P.cofresPendientes > 1 ? ` (${P.cofresPendientes})` : ""}</button>` : ""}
          <div class="fin-botones">
            <button type="button" class="btn btn-principal" data-accion="continuar">▶ Otra aventura</button>
            <button type="button" class="btn btn-secundario" data-accion="inicio">🗺️ Volver al mapa</button>
          </div>
        </div>
      </main>`, "fondo-cielo");
  }

  /* ---------- Cofres y mochila ---------- */
  function abrirCofre() {
    const premio = R.abrirCofre(P);
    if (!premio) return;
    guardar();
    modal(`<div class="cofre-anim"><span class="cofre-grande">🎁</span></div><p class="cofre-texto">Abriendo…</p>`, "modal-cofre");
    setTimeout(() => {
      sonar("cofre");
      const nuevo = premio.tipo === "accesorio";
      modal(`
        <div class="cofre-premio"><span class="premio-icono">${nuevo ? premio.accesorio.icono : "⭐"}</span></div>
        <h2>${nuevo ? `¡${premio.accesorio.nombre}!` : `¡+${premio.cantidad} estrellas!`}</h2>
        <p>${nuevo ? "Un nuevo accesorio para tu compañero." : "Ya tienes todos los accesorios. ¡Toma estrellas extra!"}</p>
        <div class="modal-botones">
          ${nuevo ? `<button type="button" class="btn btn-principal" data-accion="equipar-nuevo" data-valor="${premio.accesorio.id}" data-foco>Ponérmelo</button>` : ""}
          <button type="button" class="btn btn-secundario" data-accion="cerrar-cofre">${nuevo ? "Guardarlo en la mochila" : "¡Genial!"}</button>
        </div>`, "modal-cofre");
      chispas(capa.querySelector(".premio-icono"));
    }, 900);
  }

  function pantallaMochila() {
    render(`
      <header class="barra barra-simple">
        <button type="button" class="btn btn-volver" data-accion="inicio" aria-label="Volver al mapa">← Mapa</button>
        <h1 class="titulo-mundo">🎒 Mochila</h1>
      </header>
      <main class="mochila">
        <section class="tarjeta-blanca mochila-avatar">
          ${avatarHTML("xl")}
          <p class="apodo">${esc(P.apodo || "Aventurero")} · Nivel ${R.nivelJugador(P)}</p>
        </section>
        <section class="tarjeta-blanca">
          <h2>Compañero</h2>
          <div class="rejilla-animales">
            ${R.ANIMALES.map(a => `<button type="button" class="animal ${P.avatar.animal === a.id ? "elegido" : ""}" data-accion="elegir-animal" data-valor="${a.id}" aria-label="${a.nombre}" aria-pressed="${P.avatar.animal === a.id}">${a.icono}</button>`).join("")}
          </div>
        </section>
        <section class="tarjeta-blanca">
          <h2>Accesorios <small>${P.accesorios.length} de ${R.ACCESORIOS.length}</small></h2>
          <div class="rejilla-animales">
            ${R.ACCESORIOS.map(a => P.accesorios.includes(a.id)
              ? `<button type="button" class="animal ${P.avatar.accesorio === a.id ? "elegido" : ""}" data-accion="equipar" data-valor="${a.id}" aria-label="${a.nombre}" aria-pressed="${P.avatar.accesorio === a.id}" title="${a.nombre}">${a.icono}</button>`
              : `<div class="animal hueco-bloqueado" title="Consíguelo en un cofre" aria-label="Accesorio por descubrir">?</div>`).join("")}
          </div>
          <p class="nota">Toca un accesorio para ponértelo o quitártelo. Los que faltan salen de los cofres.</p>
        </section>
        <section class="tarjeta-blanca">
          <h2>Insignias <small>${P.insignias.length} de ${R.INSIGNIAS.length}</small></h2>
          <div class="insignias">
            ${R.INSIGNIAS.map(n => `<div class="insignia ${P.insignias.includes(n.id) ? "" : "bloqueada"}"><span class="insignia-icono">${P.insignias.includes(n.id) ? n.icono : "🔒"}</span><strong>${n.nombre}</strong><small>${n.desc}</small></div>`).join("")}
          </div>
        </section>
      </main>`, "fondo-mar");
  }

  function editarApodo() {
    modal(`
      <h2>Tu apodo</h2>
      <input id="nuevo-apodo" class="campo" maxlength="16" value="${esc(P.apodo)}" autocomplete="off" data-foco>
      <p class="nota">Usa un apodo, no tu nombre completo.</p>
      <div class="modal-botones">
        <button type="button" class="btn btn-principal" data-accion="guardar-apodo">Guardar</button>
        <button type="button" class="btn btn-secundario" data-accion="cerrar">Cancelar</button>
      </div>`);
  }

  /* ---------- Zona de adultos ---------- */
  let reto = null;
  function abrirAdultos() {
    if (P.pin) {
      modal(`<h2>Zona de adultos</h2><label class="etiqueta" for="clave">Escribe el PIN</label>
        <input id="clave" class="campo" type="password" inputmode="numeric" maxlength="6" autocomplete="off" data-foco>
        <p class="error-texto" id="error-clave" hidden>PIN incorrecto.</p>
        <div class="modal-botones"><button type="button" class="btn btn-principal" data-accion="comprobar-adulto">Entrar</button>
        <button type="button" class="btn btn-secundario" data-accion="cerrar">Cancelar</button></div>`);
    } else {
      reto = [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)];
      modal(`<h2>Zona de adultos</h2><label class="etiqueta" for="clave">Para entrar, resuelve: ${reto[0]} × ${reto[1]}</label>
        <input id="clave" class="campo" inputmode="numeric" maxlength="3" autocomplete="off" data-foco>
        <p class="error-texto" id="error-clave" hidden>Resultado incorrecto.</p>
        <div class="modal-botones"><button type="button" class="btn btn-principal" data-accion="comprobar-adulto">Entrar</button>
        <button type="button" class="btn btn-secundario" data-accion="cerrar">Cancelar</button></div>`);
    }
  }
  function comprobarAdulto() {
    const v = (document.getElementById("clave").value || "").trim();
    const ok = P.pin ? v === P.pin : Number(v) === reto[0] * reto[1];
    if (ok) { cerrarModal(); pantallaAdultos(); }
    else document.getElementById("error-clave").hidden = false;
  }

  function fechaCorta(f) {
    const hoy = U.hoy(), d = U.diasEntre(hoy, f);
    if (d <= 0) return "hoy"; if (d === 1) return "mañana";
    const p = f.split("-"); return `${Number(p[2])}/${Number(p[1])}`;
  }

  function pantallaAdultos() {
    const hoy = U.hoy();
    const totalRetos = Object.values(P.actividad).reduce((s, a) => s + a.retos, 0);
    const dias = Object.keys(P.actividad).length;
    const ult7 = Object.entries(P.actividad).filter(([f]) => U.diasEntre(f, hoy) < 7);
    const r7 = ult7.reduce((s, [, a]) => s + a.retos, 0), a7 = ult7.reduce((s, [, a]) => s + a.aciertos, 0);

    const filas = Object.keys(PV.HABILIDADES).map(h => {
      const d = P.habilidades[h], est = M.estadoHabilidad(P, h), prec = M.precisionReciente(P, h);
      return `<tr><td>${PV.HABILIDADES[h].icono} ${PV.HABILIDADES[h].nombre}</td><td>${ESTADOS[est]}</td>
        <td>${d ? d.intentos : 0}</td><td>${d && d.intentos ? Math.round(d.aciertos / d.intentos * 100) + " %" : "—"}</td>
        <td>${prec === null ? "—" : Math.round(prec * 100) + " %"}</td><td>${d ? d.nivel : 1}</td><td>${d && d.ultimaFecha ? fechaCorta(d.ultimaFecha).replace("hoy", "hoy") : "—"}</td></tr>`;
    }).join("");

    const porRegla = {};
    PV.banco.forEach(e => { const it = P.items[e.id]; if (it && it.fallos) { const k = e.regla; porRegla[k] = porRegla[k] || { fallos: 0, hab: e.habilidad, palabras: [] }; porRegla[k].fallos += it.fallos; porRegla[k].palabras.push(e.palabra); } });
    const errores = Object.entries(porRegla).sort((a, b) => b[1].fallos - a[1].fallos).slice(0, 6);

    const pendientes = PV.banco.filter(e => P.items[e.id] && P.items[e.id].enRefuerzo)
      .sort((a, b) => (P.items[a.id].proximo || "").localeCompare(P.items[b.id].proximo || ""));

    const evol = [];
    for (let k = 13; k >= 0; k--) { const f = U.sumarDias(hoy, -k); evol.push({ f, a: P.actividad[f] || { retos: 0, aciertos: 0 } }); }
    const maxR = Math.max(10, ...evol.map(x => x.a.retos));

    render(`
      <header class="barra barra-simple">
        <button type="button" class="btn btn-volver" data-accion="inicio">← Salir</button>
        <h1 class="titulo-mundo">Zona de adultos</h1>
      </header>
      <main class="adultos">
        <p class="aviso-adultos">Este panel resume la práctica hecha en la aplicación. No es una evaluación ni un diagnóstico.</p>

        <section class="panel">
          <h2>Resumen</h2>
          <div class="fin-stats">
            <div class="stat"><span class="stat-num">${P.sesiones.length}</span><span>sesiones completadas</span></div>
            <div class="stat"><span class="stat-num">${dias}</span><span>días con práctica</span></div>
            <div class="stat"><span class="stat-num">${totalRetos}</span><span>retos respondidos</span></div>
            <div class="stat"><span class="stat-num">${r7 ? Math.round(a7 / r7 * 100) + " %" : "—"}</span><span>aciertos (últimos 7 días)</span></div>
          </div>
        </section>

        <section class="panel">
          <h2>Recomendación</h2>
          <p>${recomendacionTexto()}</p>
        </section>

        <section class="panel">
          <h2>Habilidades</h2>
          <div class="tabla-envoltorio"><table>
            <thead><tr><th>Habilidad</th><th>Estado</th><th>Intentos</th><th>Aciertos totales</th><th>Últimos 10</th><th>Dificultad</th><th>Última práctica</th></tr></thead>
            <tbody>${filas}</tbody></table></div>
          <p class="nota">«Dominada» exige al menos 10 respuestas recientes con un 85 % de aciertos, en 2 días distintos o más.</p>
        </section>

        <section class="panel">
          <h2>Evolución (14 días)</h2>
          <div class="grafico" role="img" aria-label="Retos respondidos por día en los últimos 14 días">
            ${evol.map(x => `<div class="col" title="${x.f}: ${x.a.retos} retos, ${x.a.aciertos} aciertos">
              <div class="barra-col" style="height:${Math.round(x.a.retos / maxR * 100)}%"><div class="barra-ok" style="height:${x.a.retos ? Math.round(x.a.aciertos / x.a.retos * 100) : 0}%"></div></div>
              <span>${Number(x.f.slice(8))}</span></div>`).join("")}
          </div>
          <p class="nota"><span class="leyenda ley-ok"></span> aciertos <span class="leyenda ley-total"></span> retos respondidos</p>
        </section>

        <section class="panel">
          <h2>Errores más frecuentes</h2>
          ${errores.length ? `<ul class="lista">${errores.map(([k, v]) => `<li><strong>${PV.REGLAS[k]}</strong> <small>(${PV.HABILIDADES[v.hab].nombre})</small> · ${v.fallos} ${v.fallos === 1 ? "fallo" : "fallos"}<br><small>${v.palabras.map(esc).join(", ")}</small></li>`).join("")}</ul>` : `<p class="nota">Todavía no hay errores registrados.</p>`}
        </section>

        <section class="panel">
          <h2>Palabras en repaso (${pendientes.length})</h2>
          ${pendientes.length ? `<ul class="lista lista-cols">${pendientes.map(e => `<li><strong>${esc(e.palabra)}</strong> <small>· ${PV.HABILIDADES[e.habilidad].nombre} · próximo repaso: ${fechaCorta(P.items[e.id].proximo)}</small></li>`).join("")}</ul>
            <p class="nota">Aparecen solas en las próximas sesiones: al día siguiente, a los pocos días y una semana después. Tras tres repasos acertados salen de la lista. Ya se han superado ${P.consolidadas || 0}.</p>` : `<p class="nota">No hay palabras pendientes de repaso.</p>`}
        </section>

        <section class="panel">
          <h2>Ajustes y copia de seguridad</h2>
          <p class="nota">El progreso se guarda solo en este navegador. Si se borran los datos del navegador, se pierde: conviene exportar una copia de vez en cuando.</p>
          <div class="botones-ajustes">
            <button type="button" class="btn btn-secundario" data-accion="exportar">⬇️ Exportar copia (JSON)</button>
            <label class="btn btn-secundario" for="importar">⬆️ Importar copia</label>
            <input id="importar" type="file" accept="application/json,.json" hidden>
          </div>
          <h3>PIN de la zona de adultos</h3>
          <p class="nota">${P.pin ? "Hay un PIN configurado." : "Ahora se entra resolviendo una multiplicación. Puedes poner un PIN de 4 a 6 cifras."} Es una barrera sencilla, no una protección de seguridad.</p>
          <div class="botones-ajustes">
            <input id="pin-nuevo" class="campo campo-corto" type="password" inputmode="numeric" maxlength="6" placeholder="Nuevo PIN" autocomplete="new-password">
            <button type="button" class="btn btn-secundario" data-accion="guardar-pin">Guardar PIN</button>
            ${P.pin ? `<button type="button" class="btn btn-secundario" data-accion="quitar-pin">Quitar PIN</button>` : ""}
          </div>
          <h3>Reiniciar</h3>
          <div class="botones-ajustes"><button type="button" class="btn btn-peligro" data-accion="reiniciar">🗑️ Borrar todo el progreso</button></div>
        </section>
        <p class="nota centro">Palabraventura no usa publicidad, no tiene compras y no envía datos a ningún servidor.</p>
      </main>`, "fondo-adultos");
    document.getElementById("importar").addEventListener("change", importar);
  }

  function recomendacionTexto() {
    const abiertas = habsAbiertas();
    const total = Object.values(P.habilidades).reduce((s, h) => s + h.intentos, 0);
    const pend = PV.banco.filter(e => P.items[e.id] && P.items[e.id].enRefuerzo).length;
    if (!total) return "Todavía no hay práctica registrada. Lo ideal son sesiones cortas, de 5 a 10 minutos, varios días a la semana.";
    const cand = abiertas.filter(h => P.habilidades[h] && P.habilidades[h].ultimas.length >= 5)
      .map(h => ({ h, p: M.precisionReciente(P, h) })).sort((a, b) => a.p - b.p);
    let t = "";
    if (cand.length && cand[0].p < 0.85) t = `Para los próximos días: sesiones cortas (5-10 minutos) centradas en <strong>${PV.HABILIDADES[cand[0].h].nombre}</strong>, donde el porcentaje de aciertos reciente es más bajo (${Math.round(cand[0].p * 100)} %). `;
    else {
      const nueva = abiertas.find(h => M.estadoHabilidad(P, h) === "nueva");
      t = nueva ? `Buen ritmo. Puede ser un buen momento para empezar con <strong>${PV.HABILIDADES[nueva].nombre}</strong>. ` : "Buen ritmo en todas las habilidades disponibles. Mantener sesiones cortas ayuda a consolidar. ";
    }
    if (pend) t += `Hay ${pend} ${pend === 1 ? "palabra" : "palabras"} en repaso: saldrán solas en las próximas sesiones. `;
    return t + "Valorar el esfuerzo y la mejora, más que la rapidez, ayuda a mantener las ganas.";
  }

  function importar(ev) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const nuevo = A.importarTexto(lector.result);
        if (!confirm("Esto sustituirá el progreso actual por el de la copia. ¿Continuar?")) return;
        P = nuevo; guardar(); aviso("Copia importada."); pantallaAdultos();
      } catch (e) { alert(e.message); }
    };
    lector.readAsText(f);
  }

  /* ---------- Acciones ---------- */
  let animalInicio = "zorro";
  const ACCIONES = {
    "elegir-animal-inicio": v => {
      animalInicio = v;
      app.querySelectorAll(".bienvenida .animal").forEach(b => { const on = b.dataset.valor === v; b.classList.toggle("elegido", on); b.setAttribute("aria-checked", on); });
    },
    "empezar": () => {
      P = A.nuevo();
      P.apodo = (document.getElementById("apodo").value || "").trim().slice(0, 16);
      P.avatar.animal = animalInicio;
      guardar(); pantallaInicio();
    },
    "inicio": () => { sesion = null; pantallaInicio(); },
    "continuar": () => iniciarSesion("continuar"),
    "reto-diario": () => iniciarSesion("diario"),
    "mundo": v => pantallaMundo(v),
    "zona": v => iniciarSesion("zona", v),
    "responder": v => responder(v),
    "tocar": v => tocarPalabra(Number(v)),
    "seguir": () => siguiente(),
    "salir-sesion": () => {
      if (sesion && sesion.contestados > 0 && !confirm("¿Salir de la aventura? Lo que has respondido ya está guardado, pero el cofre se gana al terminar.")) return;
      sesion = null; pantallaInicio();
    },
    "abrir-cofre": () => abrirCofre(),
    "equipar-nuevo": v => { P.avatar.accesorio = v; guardar(); cerrarModal(); refrescar(); },
    "cerrar-cofre": () => { cerrarModal(); refrescar(); },
    "mochila": () => pantallaMochila(),
    "elegir-animal": v => { P.avatar.animal = v; guardar(); pantallaMochila(); },
    "equipar": v => { P.avatar.accesorio = P.avatar.accesorio === v ? null : v; guardar(); pantallaMochila(); },
    "editar-apodo": () => editarApodo(),
    "guardar-apodo": () => { P.apodo = (document.getElementById("nuevo-apodo").value || "").trim().slice(0, 16); guardar(); cerrarModal(); pantallaInicio(); },
    "cerrar": () => cerrarModal(),
    "sonido": () => { P.sonido = !P.sonido; guardar(); pantallaInicio(); },
    "adultos": () => abrirAdultos(),
    "comprobar-adulto": () => comprobarAdulto(),
    "exportar": () => A.exportar(P),
    "guardar-pin": () => {
      const v = (document.getElementById("pin-nuevo").value || "").trim();
      if (!/^\d{4,6}$/.test(v)) { alert("El PIN debe tener entre 4 y 6 cifras."); return; }
      P.pin = v; guardar(); aviso("PIN guardado."); pantallaAdultos();
    },
    "quitar-pin": () => { P.pin = null; guardar(); aviso("PIN quitado."); pantallaAdultos(); },
    "reiniciar": () => {
      if (!confirm("¿Borrar todo el progreso? Se perderán estrellas, premios e historial.")) return;
      if (!confirm("Esta acción no se puede deshacer. ¿Seguro?")) return;
      A.borrar(); P = null; sesion = null; pantallaBienvenida();
    }
  };
  // Después de cerrar un cofre, volvemos a dibujar la pantalla donde estábamos.
  function refrescar() {
    if (app.querySelector(".fin")) { if (P.cofresPendientes > 0) abrirCofre(); else pantallaInicio(); }
    else if (app.querySelector(".mochila")) pantallaMochila();
    else pantallaInicio();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-accion]");
    if (!b || b.disabled) return;
    const f = ACCIONES[b.dataset.accion];
    if (f) { e.preventDefault(); f(b.dataset.valor, b); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !capa.hidden && !capa.querySelector(".modal-cofre")) cerrarModal();
    if (e.key === "Enter" && e.target.matches && e.target.matches("input.campo")) {
      const btn = (e.target.closest(".modal, .tarjeta-blanca") || document).querySelector(".btn-principal");
      if (btn) btn.click();
    }
  });
  capa.addEventListener("click", e => { if (e.target === capa && !capa.querySelector(".modal-cofre")) cerrarModal(); });

  if (P) pantallaInicio(); else pantallaBienvenida();
})();
