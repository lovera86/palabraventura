/* Palabraventura · interfaz: perfiles, inicio, mapa, zonas, misiones (presentación → retos → decisión → resultado),
   colección, mercadillo, compañero, ajustes y zona de adultos. */
(function () {
  const U = PV.util, M = PV.motor, R = PV.recompensas, A = PV.almacen, W = PV.mundo, esc = U.esc;
  const app = document.getElementById("app");
  const capa = document.getElementById("capa");

  const problemas = PV.validarBanco();
  if (problemas.length) console.warn("Palabraventura: revisar banco de ejercicios", problemas);

  let P = null;          // progreso del jugador activo
  let sesion = null;     // misión o reto en curso
  let actual = null;     // función que redibuja la pantalla actual
  let saludoMostrado = false, textoSaludo = "";

  const ESTADOS = { nueva: "Sin empezar", practicando: "Practicando", casi: "¡Casi lo tienes!", dominada: "Dominada" };
  const MSG_ACIERTO = ["¡Genial!", "¡Bien visto!", "¡Eso es!", "¡Muy bien!", "¡Perfecto!", "¡Lo has clavado!"];
  const MSG_FALLO = ["¡Casi! Vamos a verlo juntos.", "Buen intento. Mira este truco:", "No pasa nada: así se aprende.", "¡Ups! Fíjate en esto:"];
  const ANIMO = ["¡A mí también me pasa!", "¡Juntos lo sacamos!", "¡La próxima es nuestra!", "¡Equivocarse es parte de la aventura!"];
  const N_MISION = 7, N_JEFE = 8, N_DIARIO = 5;

  function guardar() { A.guardar(P); }
  function habsAbiertas() { return [...new Set(PV.ZONAS.filter(z => W.abierta(P, z)).flatMap(z => z.habilidades))]; }
  function sonar(n) { PV.sonido.play(n, P && P.sonido); }
  function animacionesOn() { return !(P && P.reducirAnimaciones) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function aplicarAjustes() { document.body.classList.toggle("sin-animaciones", !!(P && P.reducirAnimaciones)); }

  /* ---------- Piezas comunes ---------- */
  function avatarHTML(tam) {
    const an = R.animal(P.avatar.animal), ac = R.accesorio(P.avatar.accesorio);
    return `<span class="avatar avatar-${tam} etapa-${W.etapa(P)}" aria-hidden="true"><span class="avatar-animal">${an.icono}</span>${ac ? `<span class="avatar-acc">${ac.icono}</span>` : ""}</span>`;
  }
  function render(html, clase, fn) {
    if (fn) actual = fn;
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
    if (!el || !animacionesOn()) return;
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
  function linternas(zona) {
    const total = W.totalMisiones(zona), h = W.hechas(P, zona);
    return `<span class="linternas" aria-label="${h} de ${total} misiones completadas">${Array.from({ length: total }, (_, i) => `<span class="linterna ${i < h ? "encendida" : ""}"></span>`).join("")}</span>`;
  }
  function cabecera() {
    return `<header class="barra">
      <button type="button" class="perfil" data-accion="ir-coleccion" data-valor="companero" aria-label="Ver a tu compañero">${avatarHTML("m")}</button>
      <div class="perfil-info">
        <div class="apodo">${esc(P.apodo || "Aventurero")}</div>
        <div class="chips">
          <span class="chip chip-nivel">Nivel ${R.nivelJugador(P)}<span class="barrita"><span style="width:${Math.round(R.progresoNivel(P) * 100)}%"></span></span></span>
          <span class="chip chip-estrella" title="Estrellas">⭐ ${P.estrellas}</span>
          <span class="chip chip-moneda" title="Monedas">🪙 ${P.monedas}</span>
        </div>
      </div>
    </header>`;
  }
  function nav(activa) {
    const items = [["inicio", "🏠", "Inicio"], ["mapa", "🗺️", "Mapa"], ["ir-coleccion", "🎒", "Colección"], ["ajustes", "⚙️", "Ajustes"]];
    return `<nav class="nav-inferior" aria-label="Navegación principal">${items.map(([acc, ic, txt]) =>
      `<button type="button" data-accion="${acc}" class="${acc === activa ? "activa" : ""}" ${acc === activa ? 'aria-current="page"' : ""}><span aria-hidden="true">${ic}</span>${txt}</button>`).join("")}</nav>`;
  }
  function burbuja(texto, tam) {
    return `<div class="mascota-dice">${avatarHTML(tam || "m")}<p class="bocadillo"><strong>${esc(R.nombreMascota(P))}:</strong> ${esc(texto)}</p></div>`;
  }

  /* ---------- Perfiles ---------- */
  function pantallaPerfiles() {
    const lista = A.perfiles();
    render(`
      <div class="bienvenida">
        <div class="logo"><span class="logo-icono">🗺️</span><h1>Palabraventura</h1><p>¿Quién juega hoy?</p></div>
        <div class="rejilla-perfiles">
          ${lista.map(p => `<button type="button" class="perfil-tarjeta" data-accion="elegir-perfil" data-valor="${esc(p.id)}">
            <span class="avatar avatar-l"><span class="avatar-animal">${R.animal(p.animal).icono}</span></span><strong>${esc(p.apodo || "Aventurero")}</strong></button>`).join("")}
          <button type="button" class="perfil-tarjeta perfil-nuevo" data-accion="nuevo-perfil"><span class="avatar avatar-l"><span class="avatar-animal">➕</span></span><strong>Nuevo jugador</strong></button>
        </div>
      </div>`, "fondo-cielo", pantallaPerfiles);
  }

  /* ---------- Bienvenida (jugador nuevo) ---------- */
  let animalInicio = "zorro";
  function pantallaBienvenida() {
    animalInicio = "zorro";
    const hayOtros = A.perfiles().length > 0;
    render(`
      <div class="bienvenida">
        <div class="logo"><span class="logo-icono">🗺️</span><h1>Palabraventura</h1><p>Un reino entero de palabras por explorar</p></div>
        <div class="tarjeta-blanca">
          <label class="etiqueta" for="apodo">¿Cómo te llamamos en la aventura?</label>
          <input id="apodo" class="campo" maxlength="16" placeholder="Por ejemplo: Rayo, Lince, Capitana" autocomplete="off">
          <p class="nota">Usa un apodo. No hace falta tu nombre real.</p>
          <p class="etiqueta">Elige tu compañero de viaje</p>
          <div class="rejilla-animales" role="radiogroup" aria-label="Compañero">
            ${R.ANIMALES.map(a => `<button type="button" class="animal ${a.id === animalInicio ? "elegido" : ""}" role="radio" aria-checked="${a.id === animalInicio}" data-accion="elegir-animal-inicio" data-valor="${a.id}" aria-label="${a.nombre}">${a.icono}</button>`).join("")}
          </div>
          <label class="etiqueta" for="nombre-mascota">¿Cómo se llama tu compañero?</label>
          <input id="nombre-mascota" class="campo" maxlength="14" placeholder="${R.animal(animalInicio).nombreDefecto}" autocomplete="off">
          <button type="button" class="btn btn-principal btn-grande" data-accion="empezar">¡Empezar la aventura! ➜</button>
          ${hayOtros ? `<button type="button" class="btn btn-secundario btn-ancho" data-accion="ver-perfiles">Volver</button>` : ""}
        </div>
        <p class="nota-pie">💾 El progreso se guarda solo en este navegador y en este dispositivo.${A.disponible ? "" : " <strong>Este navegador no permite guardar: el progreso se perderá al cerrar.</strong>"}</p>
      </div>`, "fondo-cielo", pantallaBienvenida);
  }

  function entrar(p) {
    P = p; aplicarAjustes(); saludoMostrado = false; pantallaInicio();
  }

  /* ---------- Inicio ---------- */
  function saludo() {
    const hoy = U.hoy(), ult = P.ultimaVisita;
    if (P.cofresPendientes > 0) return `¡Tienes ${P.cofresPendientes === 1 ? "un cofre" : P.cofresPendientes + " cofres"} sin abrir! ¿Qué habrá dentro?`;
    if (!P.sesiones.length) return `¡Hola, ${P.apodo || "aventurero"}! Soy ${R.nombreMascota(P)}. ¿Empezamos la aventura?`;
    if (ult === hoy) return U.azar(["¿Otra misión? ¡Yo me apunto!", "¡Qué bien lo estamos haciendo hoy!", "Tengo curiosidad por lo que viene ahora…"]);
    return U.azar([`¡Qué alegría verte, ${P.apodo || "aventurero"}! ¿Seguimos?`, "¡Hola de nuevo! El reino nos espera.", "¡Has vuelto! Tengo ganas de descubrir la próxima zona."]);
  }

  function pantallaInicio() {
    sesion = null;
    if (!saludoMostrado) { textoSaludo = saludo(); saludoMostrado = true; P.ultimaVisita = U.hoy(); guardar(); }
    const sig = W.siguiente(P), z = sig.zona, m = sig.mision;
    const hoy = U.hoy(), diarioHecho = P.retoDiario.fecha === hoy;
    const pend = M.pendientes(P, habsAbiertas()).length;
    render(`
      ${cabecera()}
      <main class="inicio">
        ${burbuja(textoSaludo)}
        <section class="tarjeta-mision" style="--zona:${z.color}">
          <div class="tm-cabeza"><span class="tm-zona">${z.icono} ${z.nombre}</span>${linternas(z)}</div>
          <p class="tm-etiqueta">${m.jefe ? "⚔️ Desafío final de la zona" : m.infinita ? "🔁 Misión de repaso" : "Tu siguiente misión"}</p>
          <h2 class="tm-titulo">${esc(m.titulo)}</h2>
          <p class="tm-intro">${esc(m.intro)}</p>
          <button type="button" class="btn-continuar" data-accion="briefing" data-valor="${m.id}" data-foco>
            <span class="btn-continuar-icono">▶</span>
            <span><strong>Continuar aventura</strong><small>${m.jefe ? N_JEFE : N_MISION} retos · unos 5 minutos${pend ? ` · incluye repaso` : ""}</small></span>
          </button>
        </section>
        <div class="fila-tarjetas">
          ${P.cofresPendientes > 0 ? `
          <button type="button" class="tarjeta tarjeta-cofre" data-accion="abrir-cofre">
            <span class="tarjeta-icono cofre-bote">🎁</span>
            <span><strong>${P.cofresPendientes === 1 ? "Tienes 1 cofre" : `Tienes ${P.cofresPendientes} cofres`}</strong><small>¡Ábrelo y descubre tu premio!</small></span>
          </button>` : ""}
          <button type="button" class="tarjeta tarjeta-reto ${diarioHecho ? "hecho" : ""}" data-accion="reto-diario">
            <span class="tarjeta-icono">${diarioHecho ? "✅" : "📅"}</span>
            <span><strong>Reto del día</strong><small>${diarioHecho ? "¡Completado! Puedes repetirlo." : "5 retos variados · cofre extra 🎁"}</small></span>
          </button>
          <button type="button" class="tarjeta" data-accion="mapa">
            <span class="tarjeta-icono">🗺️</span>
            <span><strong>Mapa del reino</strong><small>${PV.ZONAS.filter(x => W.abierta(P, x)).length} de ${PV.ZONAS.length} zonas descubiertas</small></span>
          </button>
          <button type="button" class="tarjeta" data-accion="ir-coleccion" data-valor="album">
            <span class="tarjeta-icono">🖼️</span>
            <span><strong>Álbum de tesoros</strong><small>${P.coleccion.length} de ${PV.COLECCION.length} encontrados</small></span>
          </button>
        </div>
      </main>
      ${nav("inicio")}`, "fondo-mar con-nav", pantallaInicio);
  }

  /* ---------- Mapa ---------- */
  function caminoSVG() {
    const pts = PV.ZONAS.map(z => [z.x, z.y]);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2;
      d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
    }
    // Tramo ya recorrido: hasta la última zona abierta.
    let ultima = 0; PV.ZONAS.forEach((z, i) => { if (W.abierta(P, z)) ultima = i; });
    let d2 = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i <= ultima; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2;
      d2 += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
    }
    const deco = [["🌲", 30, 400], ["🌳", 270, 410], ["🌲", 150, 300], ["🌾", 260, 280], ["🌲", 40, 330], ["🌳", 150, 200], ["⛰️", 260, 220], ["☁️", 70, 40], ["🌲", 140, 500], ["🌊", 290, 330]];
    return `<svg class="mapa-svg" viewBox="0 0 300 520" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d}" class="camino-futuro"/>
      <path d="${d2}" class="camino-hecho"/>
      ${deco.map(([t, x, y]) => `<text x="${x}" y="${y}" class="deco">${t}</text>`).join("")}
    </svg>`;
  }
  function pantallaMapa() {
    const sig = W.siguiente(P);
    render(`
      ${cabecera()}
      <main class="mapa-pantalla">
        <h1 class="titulo-pantalla">Mapa del reino</h1>
        <div class="mapa-lienzo">
          ${caminoSVG()}
          ${PV.ZONAS_FUTURAS.map(f => `<div class="nodo nodo-futuro" style="left:${f.x / 3}%;top:${f.y / 5.2}%" aria-label="${f.nombre}: próximamente">
            <span class="nodo-circulo">${f.icono}</span><span class="nodo-nombre">${f.nombre}</span><span class="nodo-estado">☁️ Próximamente</span></div>`).join("")}
          ${PV.ZONAS.map(z => {
            const ab = W.abierta(P, z), comp = W.completada(P, z), aqui = sig.zona === z;
            const pos = `left:${z.x / 3}%;top:${z.y / 5.2}%;--zona:${z.color}`;
            const dentro = `${aqui ? `<span class="aqui">${avatarHTML("s")}<span>Estás aquí</span></span>` : ""}
              <span class="nodo-circulo">${ab ? z.icono : "🔒"}</span>
              <span class="nodo-nombre">${z.nombre}</span>
              ${ab ? linternas(z) : `<span class="nodo-estado">${esc(W.requisito(P, z))}</span>`}
              ${comp ? `<span class="nodo-medalla" title="Zona completada">🏅</span>` : ""}`;
            return ab
              ? `<button type="button" class="nodo ${comp ? "completa" : ""} ${aqui ? "actual" : ""}" style="${pos}" data-accion="zona" data-valor="${z.id}">${dentro}</button>`
              : `<div class="nodo bloqueado" style="${pos}" aria-disabled="true">${dentro}</div>`;
          }).join("")}
        </div>
      </main>
      ${nav("mapa")}`, "fondo-mapa con-nav", pantallaMapa);
  }

  /* ---------- Zona ---------- */
  function pantallaZona(id) {
    const z = PV.ZONAS.find(x => x.id === id);
    if (!z || !W.abierta(P, z)) return pantallaMapa();
    render(`
      <header class="barra barra-simple">
        <button type="button" class="btn btn-volver" data-accion="mapa">← Mapa</button>
        <h1 class="titulo-pantalla">${z.icono} ${z.nombre}</h1>
      </header>
      <main class="zona-pantalla" style="--zona:${z.color}">
        <div class="personaje-tarjeta">
          <span class="personaje-icono">${z.personaje.icono}</span>
          <div><strong>${z.personaje.nombre}, ${z.personaje.rol}</strong>
          <p>${W.completada(P, z) ? "¡Has completado esta zona! Puedes repetir cualquier misión cuando quieras." : `Completadas ${W.hechas(P, z)} de ${W.totalMisiones(z)} misiones.`}</p></div>
          ${linternas(z)}
        </div>
        <ol class="misiones">
          ${z.misiones.map((m, k) => {
            const est = W.estadoMision(P, z, k);
            if (m.infinita && est === "bloqueada") return "";
            const etiqueta = m.jefe ? "⚔️ Desafío final" : m.infinita ? "🔁 Sin fin" : `Misión ${k + 1}`;
            const icono = est === "completada" ? "✅" : est === "disponible" ? (m.jefe ? "⚔️" : "▶") : "🔒";
            const cuerpo = `<span class="mision-icono">${icono}</span><span class="mision-texto"><small>${etiqueta}</small><strong>${esc(m.titulo)}</strong>
              <span class="mision-sub">${est === "completada" ? "Completada · tocar para repetir" : est === "disponible" ? "¡Disponible!" : "Completa la misión anterior"}</span></span>`;
            return `<li>${est === "bloqueada"
              ? `<div class="mision bloqueada ${m.jefe ? "jefe" : ""}" aria-disabled="true">${cuerpo}</div>`
              : `<button type="button" class="mision ${est} ${m.jefe ? "jefe" : ""}" data-accion="briefing" data-valor="${m.id}">${cuerpo}</button>`}</li>`;
          }).join("")}
        </ol>
      </main>
      ${nav("mapa")}`, "fondo-mapa con-nav", () => pantallaZona(id));
  }

  /* ---------- Presentación de misión ---------- */
  function pantallaBriefing(idMision) {
    const f = W.buscar(idMision);
    if (!f || !W.misionDisponible(P, f.zona, f.k) && W.estadoMision(P, f.zona, f.k) !== "completada") return pantallaMapa();
    const { zona: z, mision: m } = f;
    render(`
      <main class="briefing" style="--zona:${z.color}">
        <div class="briefing-tarjeta">
          <p class="tm-zona">${z.icono} ${z.nombre}</p>
          <span class="briefing-personaje">${z.personaje.icono}</span>
          <p class="briefing-quien">${z.personaje.nombre}, ${z.personaje.rol}</p>
          <h1>${esc(m.titulo)}</h1>
          <p class="briefing-intro">${esc(m.intro)}</p>
          <div class="briefing-datos"><span>🎯 ${m.jefe ? N_JEFE : N_MISION} retos</span><span>🔀 1 decisión</span><span>🎁 recompensa</span></div>
          <button type="button" class="btn btn-principal btn-grande" data-accion="vamos" data-valor="${m.id}" data-foco>¡Vamos! ➜</button>
          <button type="button" class="btn btn-secundario btn-ancho" data-accion="zona" data-valor="${z.id}">Ahora no</button>
        </div>
      </main>`, "fondo-cielo", () => pantallaBriefing(idMision));
  }

  /* ---------- Sesión de juego ---------- */
  function iniciarMision(idMision) {
    const f = W.buscar(idMision); if (!f) return;
    const { zona: z, mision: m } = f;
    const abiertas = habsAbiertas();
    const n = m.jefe ? N_JEFE : N_MISION;
    const habs = z.habilidades.filter(h => abiertas.includes(h) || z.requiereTodas);
    const cola = M.seleccionarSesion(P, { habilidades: habs, n, preferirReglas: m.reglas, repasoDe: m.jefe ? habs : abiertas });
    empezar({ modo: "mision", zona: z, k: f.k, mision: m, cola });
  }
  function iniciarDiario() {
    const abiertas = habsAbiertas();
    empezar({ modo: "diario", cola: M.seleccionarSesion(P, { habilidades: abiertas, n: N_DIARIO }) });
  }
  function empezar(base) {
    if (!base.cola.length) { aviso("No hay retos disponibles ahora mismo."); return; }
    // Variedad: algunos ejercicios de «completa» se juegan como «Construye la palabra».
    base.cola.forEach(r => { if (PV.construye.apto(r.ej) && Math.random() < 0.45) r.formato = "construye"; });
    sesion = Object.assign(base, { i: 0, aciertos: 0, contestados: 0, estrellas: 0, monedas: 0, mejoras: 0, consolidadas: 0,
      comprobaciones: 0, reintentados: new Set(), decisionEn: base.modo === "mision" ? Math.floor(base.cola.length / 2) : -1,
      eleccion: null, zonasAntes: PV.ZONAS.filter(z => W.abierta(P, z)).map(z => z.id) });
    pantallaReto();
  }

  function cabeceraJuego() {
    const total = sesion.cola.length;
    return `<header class="barra barra-juego">
      <button type="button" class="btn btn-volver" data-accion="salir-sesion" aria-label="Salir de la misión">✕</button>
      <div class="progreso" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${sesion.i}" aria-label="Reto ${sesion.i + 1} de ${total}">
        ${sesion.cola.map((r, k) => `${k === sesion.decisionEn ? `<span class="punto-decision ${sesion.eleccion ? "hecha" : ""}" title="Decisión">🔀</span>` : ""}<span class="punto ${k < sesion.i ? (r.ok ? "ok" : "repasar") : k === sesion.i ? "actual" : ""}"></span>`).join("")}
      </div>
      <span class="chip chip-estrella">⭐ ${sesion.estrellas}</span>
    </header>`;
  }

  function pantallaReto() {
    const r = sesion.cola[sesion.i], ej = r.ej;
    const formato = r.formato || ej.tipo, tipo = PV.TIPOS[formato];
    if (!r.orden) r.orden = U.barajar(ej.opciones);
    if (!r.fase) r.fase = ej.tipo === "robot" ? "buscar" : "elegir";
    if (formato === "construye" && !r.fichas) {
      const f = PV.construye.fichas(ej.palabra);
      r.objetivo = f.length;
      r.fichas = U.barajar(f.concat([PV.construye.trampa(ej)]));
      r.usadas = [];
    }
    let etiqueta = "";
    if (r.tag === "comprobacion") etiqueta = `<span class="pill pill-comprobacion">🔎 Comprobación</span>`;
    else if (r.tag === "reintento") etiqueta = `<span class="pill pill-repaso">🔁 Otra oportunidad</span>`;
    else if (r.tag === "repaso") etiqueta = `<span class="pill pill-repaso">🔁 Repaso</span>`;

    let cuerpo = "";
    if (formato === "construye") {
      const hecha = r.usadas.map(i => r.fichas[i]);
      const huecos = Array.from({ length: r.objetivo }, (_, i) => `<span class="casilla ${hecha[i] ? "llena" : ""}">${hecha[i] ? esc(hecha[i]) : ""}</span>`).join("");
      const contexto = ej.frase ? esc(ej.frase).replace("___", `<span class="hueco">${r.respondido ? esc(ej.palabra) : "?"}</span>`) : "";
      cuerpo = `<p class="instruccion">Ordena las fichas para escribir la palabra. ¡Sobra una!</p>
        ${contexto ? `<p class="frase frase-pequena">${contexto}</p>` : ""}
        <div class="casillas ${r.respondido ? (r.ok ? "bien" : "mal") : ""}" aria-label="Tu palabra">${huecos}</div>
        ${r.respondido ? "" : `<div class="fichas">${r.fichas.map((f, i) => `<button type="button" class="ficha" data-accion="ficha" data-valor="${i}" ${r.usadas.includes(i) ? "disabled" : ""}>${esc(f)}</button>`).join("")}</div>
        <div class="fila-botones">
          <button type="button" class="btn btn-secundario" data-accion="borrar-ficha" ${r.usadas.length ? "" : "disabled"}>⌫ Quitar</button>
          <button type="button" class="btn btn-principal" data-accion="comprobar-construye" ${r.usadas.length === r.objetivo ? "" : "disabled"}>Comprobar</button>
        </div>`}`;
    } else if (formato === "detective") {
      cuerpo = `<p class="instruccion">¿Cuál está bien escrita?</p>
        ${ej.frase ? `<p class="frase">${esc(ej.frase).replace("___", `<span class="hueco">${r.elegida !== undefined ? esc(r.elegida) : "?"}</span>`)}</p>` : ""}
        <div class="opciones opciones-palabra">${r.orden.map(o => botonOpcion(r, o, esc(o))).join("")}</div>`;
    } else if (formato === "completa") {
      const relleno = r.elegida !== undefined ? (r.elegida || "·") : "?";
      const partes = ej.hueco.split("_");
      const palabra = `<span class="palabra-hueco">${esc(partes[0])}<span class="hueco-letra">${esc(relleno)}</span>${esc(partes[1])}</span>`;
      cuerpo = `<p class="instruccion">¿Qué letra completa el hechizo?</p>
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
        ${r.aviso ? `<p class="pista">${esc(r.aviso)}</p>` : ""}
        ${r.fase !== "buscar" ? `<div class="opciones opciones-palabra">${r.orden.map(o => botonOpcion(r, o, esc(o))).join("")}</div>` : ""}`;
    }

    const pista = !r.respondido
      ? (r.pistaVista ? burbuja("Pista: " + (PV.PISTAS[ej.regla] || "Lee la palabra despacio, letra a letra."), "s")
                      : `<button type="button" class="btn-pista" data-accion="pista">💡 Pedir una pista a ${esc(R.nombreMascota(P))}</button>`)
      : "";

    render(`${cabeceraJuego()}
      <main class="juego">
        <div class="tarjeta-reto">
          <div class="modo"><span class="modo-nombre">${tipo.icono} ${tipo.nombre}</span>${etiqueta}</div>
          ${cuerpo}
          ${pista}
        </div>
        ${r.respondido ? feedbackHTML(r) : ""}
      </main>`, "fondo-juego", pantallaReto);
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
    if (res.sube) extra.push(`<span class="pill pill-sube">⬆️ ¡Cada vez dominas más ${PV.HABILIDADES[ej.habilidad].nombre}!</span>`);
    if (res.consolidada) extra.push(`<span class="pill pill-sube">💪 ¡Palabra superada!</span>`);
    const ultimo = sesion.i + 1 >= sesion.cola.length;
    const siguienteDecision = sesion.i + 1 === sesion.decisionEn && !sesion.eleccion;
    return `<section class="feedback ${ok ? "feedback-ok" : "feedback-repaso"}" aria-live="polite">
      <p class="feedback-titulo">${ok ? `${r.msg} <span class="mas-estrellas">+${res.estrellas} ⭐</span>` : r.msg}</p>
      ${ok ? "" : `<p class="feedback-palabra">Se escribe: <strong>${esc(ej.palabra)}</strong></p>`}
      <p class="feedback-explica">💡 ${esc(ej.explicacion)}</p>
      ${ok ? "" : burbuja(U.azar(ANIMO) + (r.tag === "reintento" ? " Ya la repasaremos otro día." : " Te la volveré a preguntar al final de la misión."), "s")}
      ${extra.join("")}
      <button type="button" class="btn btn-principal btn-grande" data-accion="seguir" data-foco>${ultimo ? "¡Terminar misión! 🎁" : siguienteDecision ? "Seguir: ¡toca decidir! 🔀" : "Seguir ➜"}</button>
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
    if (U.limpiar(toks[k]) === r.ej.error) { r.fase = "corregir"; r.aviso = ""; pantallaReto(); return; }
    r.tocados = (r.tocados || []).concat(k);
    r.fallosBusqueda = (r.fallosBusqueda || 0) + 1;
    if (r.fallosBusqueda >= 2) { r.fase = "corregir"; r.noEncontrado = true; r.aviso = "Era esta palabra, la marcada en naranja. ¿Cómo se escribe bien?"; }
    else r.aviso = "Esa palabra está bien escrita. ¡Busca otra!";
    pantallaReto();
  }
  function ponerFicha(i) {
    const r = sesion.cola[sesion.i];
    if (r.respondido || r.usadas.includes(i) || r.usadas.length >= r.objetivo) return;
    r.usadas.push(i); sonar("toque"); pantallaReto();
  }
  function quitarFicha() { const r = sesion.cola[sesion.i]; if (!r.respondido) { r.usadas.pop(); pantallaReto(); } }
  function comprobarConstruye() {
    const r = sesion.cola[sesion.i];
    if (r.respondido || r.usadas.length !== r.objetivo) return;
    const hecha = r.usadas.map(i => r.fichas[i]).join("");
    terminarReto(r, hecha === r.ej.palabra.toLowerCase());
  }

  function terminarReto(r, acierto) {
    r.respondido = true; r.ok = acierto;
    r.res = M.registrarRespuesta(P, r.ej, acierto, { reintento: r.tag === "reintento", comprobacion: r.tag === "comprobacion", pista: !!r.pistaVista });
    r.msg = U.azar(acierto ? MSG_ACIERTO : MSG_FALLO);
    sesion.contestados++;
    if (acierto) sesion.aciertos++;
    sesion.estrellas += r.res.estrellas; sesion.monedas += r.res.monedas;
    if (r.res.mejora) sesion.mejoras++;
    if (r.res.consolidada) sesion.consolidadas++;
    if (!acierto) {
      // Pregunta de comprobación justo después, y el mismo reto otra vez al final.
      const usados = new Set(sesion.cola.map(x => x.ej.id));
      if (r.tag !== "comprobacion" && sesion.comprobaciones < 2) {
        const c = M.buscarComprobacion(P, r.ej, usados);
        if (c) { sesion.cola.splice(sesion.i + 1, 0, { ej: c, tag: "comprobacion" }); sesion.comprobaciones++; if (sesion.decisionEn > sesion.i) sesion.decisionEn++; }
      }
      if (r.tag !== "reintento" && !sesion.reintentados.has(r.ej.id)) {
        sesion.reintentados.add(r.ej.id);
        sesion.cola.push({ ej: r.ej, tag: "reintento", formato: r.formato });
      }
    }
    guardar();
    sonar(acierto ? "acierto" : "fallo");
    pantallaReto();
    if (acierto) chispas(app.querySelector(".opcion.correcta") || app.querySelector(".casillas") || app.querySelector(".token-error"));
    const fb = app.querySelector(".feedback");
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ behavior: animacionesOn() ? "smooth" : "auto", block: "nearest" });
  }

  function siguiente() {
    sesion.i++;
    if (sesion.i === sesion.decisionEn && !sesion.eleccion) return pantallaDecision();
    if (sesion.i >= sesion.cola.length) return finalizar();
    pantallaReto();
  }

  /* ---------- Decisión a mitad de misión ---------- */
  function pantallaDecision() {
    const { zona: z, mision: m } = sesion, d = m.decision;
    const opcion = (k, o) => `<button type="button" class="decision-opcion" data-accion="decidir" data-valor="${k}">
      <span class="decision-icono">${o.icono}</span><strong>${esc(o.texto)}</strong>
      <small>${o.efecto === "hallazgo" ? "🔍 Puede que encuentres un tesoro" : "🪙 Ganarás monedas extra"}</small></button>`;
    render(`${cabeceraJuego()}
      <main class="juego">
        <div class="tarjeta-reto decision">
          <p class="tm-zona">${z.personaje.icono} ${z.personaje.nombre}</p>
          <h2>${esc(d.pregunta)}</h2>
          <div class="decision-opciones">${opcion("a", d.a)}${opcion("b", d.b)}</div>
          <p class="nota centro">Las dos opciones son buenas: ¡elige la que más te guste!</p>
        </div>
      </main>`, "fondo-juego", pantallaDecision);
  }
  function decidir(k) {
    const o = sesion.mision.decision[k];
    sesion.eleccion = o.efecto; sesion.eleccionTexto = o.texto;
    sonar("toque");
    aviso(`${o.icono} ¡Buena elección!`);
    if (sesion.i >= sesion.cola.length) finalizar(); else pantallaReto();
  }

  /* ---------- Resultado ---------- */
  function finalizar() {
    const s = sesion;
    P.sesiones.push({ fecha: U.hoy(), modo: s.modo, mision: s.mision ? s.mision.id : null, retos: s.contestados, aciertos: s.aciertos });
    if (P.sesiones.length > 300) P.sesiones.shift();
    const premio = s.modo === "mision" ? R.completarMision(P, s.zona, s.mision, s.eleccion, false) : R.completarMision(P, null, null, null, true);
    const nuevasZonas = PV.ZONAS.filter(z => W.abierta(P, z) && !s.zonasAntes.includes(z.id));
    guardar();
    sonar("fin");
    sesion = null;
    const prox = s.modo === "mision" ? W.siguiente(P) : null;
    const rareza = premio.objeto ? PV.RAREZAS[premio.objeto.rareza].nombre : "";
    render(`
      <main class="fin">
        <div class="tarjeta-blanca fin-tarjeta">
          ${s.modo === "mision" ? `<p class="tm-zona">${s.zona.icono} ${s.zona.nombre}</p>` : ""}
          <h1>${s.modo === "mision" ? (s.mision.jefe ? "¡Desafío superado!" : "¡Misión completada!") : "¡Reto del día completado!"}</h1>
          ${burbuja(s.mejoras ? `¡Has superado ${s.mejoras === 1 ? "una palabra que te costaba" : s.mejoras + " palabras que te costaban"}! Eso es mejorar de verdad.` : U.azar(["¡Qué gran equipo hacemos!", "¡Lo hemos conseguido juntos!", "¡Cada misión nos hace más fuertes!"]), "m")}
          <div class="fin-stats">
            <div class="stat"><span class="stat-num">⭐ ${s.estrellas + premio.estrellas}</span><span>estrellas</span></div>
            <div class="stat"><span class="stat-num">🪙 ${s.monedas + premio.monedas}</span><span>monedas</span></div>
            <div class="stat"><span class="stat-num">✅ ${s.aciertos}/${s.contestados}</span><span>retos superados</span></div>
          </div>
          ${premio.objeto ? `<div class="hallazgo rareza-${premio.objeto.rareza}"><span class="hallazgo-icono">${premio.objeto.icono}</span>
            <div><small>¡Has encontrado un tesoro! · ${rareza}</small><strong>${premio.objeto.nombre}</strong><small>Guardado en tu álbum</small></div></div>` : ""}
          ${premio.etapaNueva ? `<div class="evolucion">${avatarHTML("l")}<div><strong>¡${esc(R.nombreMascota(P))} ha evolucionado!</strong><small>Ahora es ${premio.etapaNueva.nombre.toLowerCase()}.</small></div></div>` : ""}
          ${nuevasZonas.map(z => `<div class="desbloqueo">🔓 ¡Nueva zona descubierta: <strong>${z.icono} ${z.nombre}</strong>!</div>`).join("")}
          ${premio.retoDiario ? `<p class="fin-diario">📅 ¡Reto del día completado! Cofre extra para ti.</p>` : ""}
          ${premio.insignias.length ? `<div class="fin-insignias"><p><strong>¡Nueva insignia!</strong></p>${premio.insignias.map(n => `<div class="insignia-nueva"><span>${n.icono}</span>${n.nombre}</div>`).join("")}</div>` : ""}
          ${s.modo === "mision" ? `<div class="progreso-zona">${s.zona.nombre}: ${linternas(s.zona)}</div>` : ""}
          ${P.cofresPendientes > 0 ? `<button type="button" class="btn btn-cofre btn-grande" data-accion="abrir-cofre" data-foco>🎁 Abrir cofre${P.cofresPendientes > 1 ? ` (${P.cofresPendientes})` : ""}</button>` : ""}
          ${prox ? `<div class="teaser"><small>Próxima misión</small><strong>${prox.zona.icono} ${esc(prox.mision.titulo)}</strong><p>${esc(s.mision.gancho)}</p></div>` : ""}
          <div class="fin-botones">
            ${prox ? `<button type="button" class="btn btn-principal" data-accion="briefing" data-valor="${prox.mision.id}">▶ Siguiente misión</button>` : `<button type="button" class="btn btn-principal" data-accion="inicio">▶ Seguir</button>`}
            <button type="button" class="btn btn-secundario" data-accion="mapa">🗺️ Ver el mapa</button>
          </div>
          <p class="nota centro">Puedes parar aquí: tus premios ya están guardados.</p>
        </div>
      </main>`, "fondo-cielo", null);
    actual = pantallaInicio; // tras cerrar un cofre desde aquí, volvemos al inicio
  }

  /* ---------- Cofres ---------- */
  function abrirCofre() {
    const premio = R.abrirCofre(P);
    if (!premio) return;
    guardar();
    modal(`<div class="cofre-anim"><span class="cofre-grande">🎁</span></div><p class="cofre-texto">Abriendo…</p>`, "modal-cofre");
    setTimeout(() => {
      sonar("cofre");
      let icono, titulo, texto, botones;
      if (premio.tipo === "accesorio") {
        icono = premio.accesorio.icono; titulo = `¡${premio.accesorio.nombre}!`; texto = `Un accesorio para ${R.nombreMascota(P)}.`;
        botones = `<button type="button" class="btn btn-principal" data-accion="equipar-nuevo" data-valor="${premio.accesorio.id}" data-foco>Ponérselo</button>
          <button type="button" class="btn btn-secundario" data-accion="cerrar-cofre">Guardarlo</button>`;
      } else if (premio.tipo === "objeto") {
        icono = premio.objeto.icono; titulo = premio.objeto.nombre; texto = `¡Un tesoro ${PV.RAREZAS[premio.objeto.rareza].nombre.toLowerCase()} para tu álbum!`;
        botones = `<button type="button" class="btn btn-principal" data-accion="cerrar-cofre" data-foco>¡Genial!</button>`;
      } else {
        icono = "🪙"; titulo = `¡+${premio.cantidad} monedas!`; texto = "Puedes gastarlas en el mercadillo.";
        botones = `<button type="button" class="btn btn-principal" data-accion="cerrar-cofre" data-foco>¡Genial!</button>`;
      }
      modal(`<div class="cofre-premio"><span class="premio-icono">${icono}</span></div><h2>${titulo}</h2><p>${texto}</p>
        <div class="modal-botones">${botones}</div>`, "modal-cofre");
      chispas(capa.querySelector(".premio-icono"));
    }, animacionesOn() ? 900 : 50);
  }

  /* ---------- Colección: álbum, compañero, mercadillo, insignias ---------- */
  let pestana = "album";
  function pantallaColeccion(tab) {
    if (tab) pestana = tab;
    const tabs = [["album", "🖼️ Álbum"], ["companero", "🐾 Compañero"], ["mercadillo", "🛒 Mercadillo"], ["insignias", "🏅 Insignias"]];
    let cuerpo = "";
    if (pestana === "album") {
      cuerpo = `<p class="nota-clara">${P.coleccion.length} de ${PV.COLECCION.length} tesoros encontrados. Aparecen en misiones y cofres.</p>
        ${PV.ZONAS.map(z => {
          const objs = PV.COLECCION.filter(o => o.zona === z.id);
          return `<section class="tarjeta-blanca"><h2>${z.icono} ${z.nombre} <small>${objs.filter(o => P.coleccion.includes(o.id)).length}/${objs.length}</small></h2>
            <div class="album">${objs.map(o => P.coleccion.includes(o.id)
              ? `<div class="carta rareza-${o.rareza}"><span class="carta-icono">${o.icono}</span><strong>${o.nombre}</strong><small>${PV.RAREZAS[o.rareza].nombre}</small></div>`
              : `<div class="carta oculta rareza-${o.rareza}"><span class="carta-icono">?</span><strong>Por descubrir</strong><small>${PV.RAREZAS[o.rareza].nombre}</small></div>`).join("")}</div></section>`;
        }).join("")}`;
    } else if (pestana === "companero") {
      const e = W.etapa(P), sig = PV.ETAPAS[e + 1];
      cuerpo = `<section class="tarjeta-blanca centro">
          ${avatarHTML("xl")}
          <p class="nombre-mascota">${esc(R.nombreMascota(P))}</p>
          <p class="nota">${PV.ETAPAS[e].nombre}</p>
          ${sig ? `<div class="barra-etapa"><span style="width:${Math.round((P.estrellas - PV.ETAPAS[e].min) / (sig.min - PV.ETAPAS[e].min) * 100)}%"></span></div>
            <p class="nota">Con ${sig.min - P.estrellas} ⭐ más evolucionará a ${sig.nombre.toLowerCase()}.</p>` : `<p class="nota">¡Ha llegado a su forma más legendaria!</p>`}
          <div class="fila-campo"><input id="nuevo-nombre-mascota" class="campo" maxlength="14" value="${esc(P.mascota.nombre)}" placeholder="${esc(R.animal(P.avatar.animal).nombreDefecto)}" aria-label="Nombre del compañero">
          <button type="button" class="btn btn-secundario" data-accion="guardar-nombre-mascota">Guardar nombre</button></div>
        </section>
        <section class="tarjeta-blanca"><h2>Aspecto</h2>
          <div class="rejilla-animales">${R.ANIMALES.map(a => `<button type="button" class="animal ${P.avatar.animal === a.id ? "elegido" : ""}" data-accion="elegir-animal" data-valor="${a.id}" aria-label="${a.nombre}" aria-pressed="${P.avatar.animal === a.id}">${a.icono}</button>`).join("")}</div>
        </section>
        <section class="tarjeta-blanca"><h2>Accesorios <small>${P.accesorios.length} de ${R.ACCESORIOS.length}</small></h2>
          ${P.accesorios.length ? `<div class="rejilla-animales">${R.ACCESORIOS.filter(a => P.accesorios.includes(a.id)).map(a => `<button type="button" class="animal ${P.avatar.accesorio === a.id ? "elegido" : ""}" data-accion="equipar" data-valor="${a.id}" aria-label="${a.nombre}" aria-pressed="${P.avatar.accesorio === a.id}" title="${a.nombre}">${a.icono}</button>`).join("")}</div>
            <p class="nota">Toca un accesorio para ponérselo o quitárselo.</p>` : `<p class="nota">Aún no tiene accesorios. Salen en los cofres o se compran en el mercadillo.</p>`}
        </section>`;
    } else if (pestana === "mercadillo") {
      cuerpo = `<p class="nota-clara">Tienes <strong>🪙 ${P.monedas}</strong>. Las monedas se ganan jugando misiones, mejorando y eligiendo bolsas de monedas.</p>
        <section class="tarjeta-blanca"><div class="tienda">${R.ACCESORIOS.map(a => {
          const tiene = P.accesorios.includes(a.id), falta = a.precio - P.monedas;
          return `<div class="producto ${tiene ? "tenido" : ""}"><span class="producto-icono">${a.icono}</span><strong>${a.nombre}</strong>
            ${tiene ? `<span class="pill pill-sube">✓ Ya es tuyo</span>`
              : falta > 0 ? `<span class="precio">🪙 ${a.precio}</span><small>Te faltan ${falta}</small>`
              : `<button type="button" class="btn btn-principal btn-comprar" data-accion="comprar" data-valor="${a.id}">Comprar · 🪙 ${a.precio}</button>`}</div>`;
        }).join("")}</div></section>`;
    } else {
      cuerpo = `<section class="tarjeta-blanca"><div class="insignias">
        ${R.INSIGNIAS.map(n => `<div class="insignia ${P.insignias.includes(n.id) ? "" : "bloqueada"}"><span class="insignia-icono">${P.insignias.includes(n.id) ? n.icono : "🔒"}</span><strong>${n.nombre}</strong><small>${n.desc}</small></div>`).join("")}
      </div></section>`;
    }
    render(`
      ${cabecera()}
      <main class="coleccion">
        <div class="pestanas" role="tablist">${tabs.map(([id, txt]) => `<button type="button" role="tab" aria-selected="${pestana === id}" class="${pestana === id ? "activa" : ""}" data-accion="ir-coleccion" data-valor="${id}">${txt}</button>`).join("")}</div>
        ${cuerpo}
      </main>
      ${nav("ir-coleccion")}`, "fondo-mar con-nav", () => pantallaColeccion());
  }

  /* ---------- Ajustes ---------- */
  function pantallaAjustes() {
    const varios = A.perfiles().length > 1;
    render(`
      ${cabecera()}
      <main class="coleccion">
        <h1 class="titulo-pantalla">Ajustes</h1>
        <section class="tarjeta-blanca ajustes">
          <button type="button" class="interruptor" role="switch" aria-checked="${P.sonido}" data-accion="sonido"><span>🔊 Sonido</span><span class="mando ${P.sonido ? "on" : ""}"></span></button>
          <button type="button" class="interruptor" role="switch" aria-checked="${!!P.reducirAnimaciones}" data-accion="animaciones"><span>🌀 Reducir animaciones</span><span class="mando ${P.reducirAnimaciones ? "on" : ""}"></span></button>
        </section>
        <section class="tarjeta-blanca ajustes">
          <h2>Jugador</h2>
          <p class="nota">Ahora juega <strong>${esc(P.apodo || "Aventurero")}</strong>. Cada jugador tiene su propio progreso en este dispositivo.</p>
          <div class="fila-campo"><input id="nuevo-apodo" class="campo" maxlength="16" value="${esc(P.apodo)}" aria-label="Apodo"><button type="button" class="btn btn-secundario" data-accion="guardar-apodo">Cambiar apodo</button></div>
          <div class="botones-ajustes">
            ${varios ? `<button type="button" class="btn btn-secundario" data-accion="ver-perfiles">👥 Cambiar de jugador</button>` : ""}
            <button type="button" class="btn btn-secundario" data-accion="nuevo-perfil">➕ Añadir jugador</button>
          </div>
        </section>
        <section class="tarjeta-blanca ajustes">
          <p class="nota">💾 El progreso se guarda en este navegador. Para hacer una copia o borrar datos, entra en la zona de adultos.</p>
          <button type="button" class="enlace-discreto oscuro" data-accion="adultos">Zona de adultos</button>
        </section>
      </main>
      ${nav("ajustes")}`, "fondo-mar con-nav", pantallaAjustes);
  }

  /* ---------- Zona de adultos ---------- */
  let reto = null;
  function abrirAdultos() {
    const pin = A.pin() || P.pin;
    if (pin) {
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
    const v = (document.getElementById("clave").value || "").trim(), pin = A.pin() || P.pin;
    const ok = pin ? v === pin : Number(v) === reto[0] * reto[1];
    if (ok) { cerrarModal(); pantallaAdultos(); }
    else document.getElementById("error-clave").hidden = false;
  }
  function fechaCorta(f) {
    const d = U.diasEntre(U.hoy(), f);
    if (d <= 0) return "hoy"; if (d === 1) return "mañana";
    const p = f.split("-"); return `${Number(p[2])}/${Number(p[1])}`;
  }
  function pantallaAdultos() {
    const hoy = U.hoy();
    const totalRetos = Object.values(P.actividad).reduce((s, a) => s + a.retos, 0);
    const dias = Object.keys(P.actividad).length;
    const ult7 = Object.entries(P.actividad).filter(([f]) => U.diasEntre(f, hoy) < 7);
    const r7 = ult7.reduce((s, [, a]) => s + a.retos, 0), a7 = ult7.reduce((s, [, a]) => s + a.aciertos, 0);
    const misionesHechas = Object.values(P.misiones).filter(m => m.completada).length;
    const totalMis = PV.ZONAS.reduce((s, z) => s + W.totalMisiones(z), 0);

    const filas = Object.keys(PV.HABILIDADES).map(h => {
      const d = P.habilidades[h], est = M.estadoHabilidad(P, h), prec = M.precisionReciente(P, h);
      return `<tr><td>${PV.HABILIDADES[h].icono} ${PV.HABILIDADES[h].nombre}</td><td>${ESTADOS[est]}</td>
        <td>${d ? d.intentos : 0}</td><td>${d && d.intentos ? Math.round(d.aciertos / d.intentos * 100) + " %" : "—"}</td>
        <td>${prec === null ? "—" : Math.round(prec * 100) + " %"}</td><td>${d ? d.nivel : 1}</td><td>${d && d.ultimaFecha ? fechaCorta(d.ultimaFecha) : "—"}</td></tr>`;
    }).join("");

    const porRegla = {};
    PV.banco.forEach(e => { const it = P.items[e.id]; if (it && (it.fallos || it.pistas)) { const k = e.regla; porRegla[k] = porRegla[k] || { fallos: 0, pistas: 0, hab: e.habilidad, palabras: [] }; porRegla[k].fallos += it.fallos; porRegla[k].pistas += it.pistas || 0; if (it.fallos) porRegla[k].palabras.push(e.palabra); } });
    const errores = Object.entries(porRegla).filter(([, v]) => v.fallos).sort((a, b) => b[1].fallos - a[1].fallos).slice(0, 6);
    const pistas = Object.values(porRegla).reduce((s, v) => s + v.pistas, 0);

    const pendientes = PV.banco.filter(e => P.items[e.id] && P.items[e.id].enRefuerzo)
      .sort((a, b) => (P.items[a.id].proximo || "").localeCompare(P.items[b.id].proximo || ""));

    const evol = [];
    for (let k = 13; k >= 0; k--) { const f = U.sumarDias(hoy, -k); evol.push({ f, a: P.actividad[f] || { retos: 0, aciertos: 0 } }); }
    const maxR = Math.max(10, ...evol.map(x => x.a.retos));
    const pin = A.pin() || P.pin;

    render(`
      <header class="barra barra-simple">
        <button type="button" class="btn btn-volver" data-accion="inicio">← Salir</button>
        <h1 class="titulo-pantalla">Zona de adultos</h1>
      </header>
      <main class="adultos">
        <p class="aviso-adultos">Jugador: <strong>${esc(P.apodo || "Aventurero")}</strong>. Este panel resume la práctica hecha en la aplicación. No es una evaluación ni un diagnóstico.</p>

        <section class="panel">
          <h2>Resumen</h2>
          <div class="fin-stats">
            <div class="stat"><span class="stat-num">${misionesHechas}/${totalMis}</span><span>misiones completadas</span></div>
            <div class="stat"><span class="stat-num">${dias}</span><span>días con práctica</span></div>
            <div class="stat"><span class="stat-num">${totalRetos}</span><span>retos respondidos</span></div>
            <div class="stat"><span class="stat-num">${r7 ? Math.round(a7 / r7 * 100) + " %" : "—"}</span><span>aciertos (últimos 7 días)</span></div>
            <div class="stat"><span class="stat-num">${pistas}</span><span>pistas pedidas</span></div>
          </div>
        </section>

        <section class="panel"><h2>Recomendación</h2><p>${recomendacionTexto()}</p></section>

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
          ${errores.length ? `<ul class="lista">${errores.map(([k, v]) => `<li><strong>${PV.REGLAS[k]}</strong> <small>(${PV.HABILIDADES[v.hab].nombre})</small> · ${v.fallos} ${v.fallos === 1 ? "fallo" : "fallos"}${v.pistas ? ` · ${v.pistas} ${v.pistas === 1 ? "pista" : "pistas"}` : ""}<br><small>${v.palabras.map(esc).join(", ")}</small></li>`).join("")}</ul>` : `<p class="nota">Todavía no hay errores registrados.</p>`}
        </section>

        <section class="panel">
          <h2>Palabras en repaso (${pendientes.length})</h2>
          ${pendientes.length ? `<ul class="lista lista-cols">${pendientes.map(e => `<li><strong>${esc(e.palabra)}</strong> <small>· ${PV.HABILIDADES[e.habilidad].nombre} · próximo repaso: ${fechaCorta(P.items[e.id].proximo)}</small></li>`).join("")}</ul>
            <p class="nota">Aparecen solas en las próximas misiones: al día siguiente, a los pocos días y una semana después. Tras tres repasos acertados salen de la lista. Ya se han superado ${P.consolidadas || 0}.</p>` : `<p class="nota">No hay palabras pendientes de repaso.</p>`}
        </section>

        <section class="panel">
          <h2>Copia de seguridad</h2>
          <p class="nota">El progreso se guarda solo en este navegador. Si se borran los datos del navegador, se pierde: conviene exportar una copia de vez en cuando. La importación sustituye el progreso de este jugador.</p>
          <div class="botones-ajustes">
            <button type="button" class="btn btn-secundario" data-accion="exportar">⬇️ Exportar copia (JSON)</button>
            <label class="btn btn-secundario" for="importar">⬆️ Importar copia</label>
            <input id="importar" type="file" accept="application/json,.json" hidden>
          </div>
          <h3>PIN de la zona de adultos</h3>
          <p class="nota">${pin ? "Hay un PIN configurado (sirve para todos los jugadores)." : "Ahora se entra resolviendo una multiplicación. Puedes poner un PIN de 4 a 6 cifras."} Es una barrera sencilla, no una protección de seguridad.</p>
          <div class="botones-ajustes">
            <input id="pin-nuevo" class="campo campo-corto" type="password" inputmode="numeric" maxlength="6" placeholder="Nuevo PIN" autocomplete="new-password">
            <button type="button" class="btn btn-secundario" data-accion="guardar-pin">Guardar PIN</button>
            ${pin ? `<button type="button" class="btn btn-secundario" data-accion="quitar-pin">Quitar PIN</button>` : ""}
          </div>
          <h3>Borrar</h3>
          <p class="nota">Borra el progreso de <strong>${esc(P.apodo || "este jugador")}</strong> (los demás jugadores no se tocan). No se puede deshacer.</p>
          <div class="botones-ajustes"><button type="button" class="btn btn-peligro" data-accion="reiniciar">🗑️ Borrar este jugador</button></div>
        </section>
        <p class="nota centro">Palabraventura no usa publicidad, no tiene compras y no envía datos a ningún servidor.</p>
      </main>`, "fondo-adultos", pantallaAdultos);
    document.getElementById("importar").addEventListener("change", importar);
  }

  function recomendacionTexto() {
    const abiertas = habsAbiertas();
    const total = Object.values(P.habilidades).reduce((s, h) => s + h.intentos, 0);
    const pend = PV.banco.filter(e => P.items[e.id] && P.items[e.id].enRefuerzo).length;
    if (!total) return "Todavía no hay práctica registrada. Lo ideal son misiones cortas, de 5 a 8 minutos, varios días a la semana.";
    const cand = abiertas.filter(h => P.habilidades[h] && P.habilidades[h].ultimas.length >= 5)
      .map(h => ({ h, p: M.precisionReciente(P, h) })).sort((a, b) => a.p - b.p);
    let t = "";
    if (cand.length && cand[0].p < 0.85) t = `Para los próximos días: una o dos misiones cortas al día con <strong>${PV.HABILIDADES[cand[0].h].nombre}</strong>, donde el porcentaje de aciertos reciente es más bajo (${Math.round(cand[0].p * 100)} %). `;
    else {
      const nueva = abiertas.find(h => M.estadoHabilidad(P, h) === "nueva");
      t = nueva ? `Buen ritmo. Puede ser un buen momento para empezar con <strong>${PV.HABILIDADES[nueva].nombre}</strong>. ` : "Buen ritmo en todas las habilidades disponibles. Mantener sesiones cortas ayuda a consolidar. ";
    }
    if (pend) t += `Hay ${pend} ${pend === 1 ? "palabra" : "palabras"} en repaso: saldrán solas en las próximas misiones. `;
    return t + "Valorar el esfuerzo y la mejora, más que la rapidez, ayuda a mantener las ganas.";
  }

  function importar(ev) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const nuevo = A.importarTexto(lector.result);
        if (!confirm(`Esto sustituirá el progreso de ${P.apodo || "este jugador"} por el de la copia. ¿Continuar?`)) return;
        nuevo.id = P.id; P = nuevo; guardar(); aplicarAjustes(); aviso("Copia importada."); pantallaAdultos();
      } catch (e) { alert(e.message); }
    };
    lector.readAsText(f);
  }

  /* ---------- Acciones ---------- */
  const ACCIONES = {
    "elegir-animal-inicio": v => {
      animalInicio = v;
      app.querySelectorAll(".bienvenida .animal").forEach(b => { const on = b.dataset.valor === v; b.classList.toggle("elegido", on); b.setAttribute("aria-checked", on); });
      const nm = document.getElementById("nombre-mascota"); if (nm) nm.placeholder = R.animal(v).nombreDefecto;
    },
    "empezar": () => {
      const p = A.nuevo();
      p.apodo = (document.getElementById("apodo").value || "").trim().slice(0, 16);
      p.avatar.animal = animalInicio;
      p.mascota.nombre = (document.getElementById("nombre-mascota").value || "").trim().slice(0, 14);
      A.guardar(p); entrar(p);
    },
    "elegir-perfil": v => { const p = A.cargar(v); if (p) { A.activar(v); entrar(p); } },
    "nuevo-perfil": () => pantallaBienvenida(),
    "ver-perfiles": () => pantallaPerfiles(),
    "inicio": () => pantallaInicio(),
    "mapa": () => pantallaMapa(),
    "zona": v => pantallaZona(v),
    "briefing": v => pantallaBriefing(v),
    "vamos": v => iniciarMision(v),
    "reto-diario": () => iniciarDiario(),
    "responder": v => responder(v),
    "tocar": v => tocarPalabra(Number(v)),
    "ficha": v => ponerFicha(Number(v)),
    "borrar-ficha": () => quitarFicha(),
    "comprobar-construye": () => comprobarConstruye(),
    "pista": () => { sesion.cola[sesion.i].pistaVista = true; sonar("toque"); pantallaReto(); },
    "seguir": () => siguiente(),
    "decidir": v => decidir(v),
    "salir-sesion": () => {
      if (sesion && sesion.contestados > 0 && !confirm("¿Salir de la misión? Lo que has respondido ya está guardado, pero la recompensa se gana al terminar.")) return;
      sesion = null; pantallaInicio();
    },
    "abrir-cofre": () => abrirCofre(),
    "equipar-nuevo": v => { P.avatar.accesorio = v; guardar(); cerrarModal(); refrescar(); },
    "cerrar-cofre": () => { cerrarModal(); refrescar(); },
    "ir-coleccion": v => pantallaColeccion(v || pestana),
    "elegir-animal": v => { P.avatar.animal = v; guardar(); pantallaColeccion(); },
    "equipar": v => { P.avatar.accesorio = P.avatar.accesorio === v ? null : v; guardar(); pantallaColeccion(); },
    "guardar-nombre-mascota": () => { P.mascota.nombre = (document.getElementById("nuevo-nombre-mascota").value || "").trim().slice(0, 14); guardar(); aviso("¡Nombre guardado!"); pantallaColeccion(); },
    "comprar": v => { if (R.comprar(P, v)) { guardar(); sonar("cofre"); const a = R.accesorio(v); P.avatar.accesorio = v; guardar(); aviso(`${a.icono} ¡${a.nombre} es tuyo!`); pantallaColeccion(); } },
    "guardar-apodo": () => { P.apodo = (document.getElementById("nuevo-apodo").value || "").trim().slice(0, 16); guardar(); aviso("Apodo guardado."); pantallaAjustes(); },
    "cerrar": () => cerrarModal(),
    "ajustes": () => pantallaAjustes(),
    "sonido": () => { P.sonido = !P.sonido; guardar(); pantallaAjustes(); },
    "animaciones": () => { P.reducirAnimaciones = !P.reducirAnimaciones; guardar(); aplicarAjustes(); pantallaAjustes(); },
    "adultos": () => abrirAdultos(),
    "comprobar-adulto": () => comprobarAdulto(),
    "exportar": () => A.exportar(P),
    "guardar-pin": () => {
      const v = (document.getElementById("pin-nuevo").value || "").trim();
      if (!/^\d{4,6}$/.test(v)) { alert("El PIN debe tener entre 4 y 6 cifras."); return; }
      A.ponerPin(v); P.pin = null; guardar(); aviso("PIN guardado."); pantallaAdultos();
    },
    "quitar-pin": () => { A.ponerPin(null); P.pin = null; guardar(); aviso("PIN quitado."); pantallaAdultos(); },
    "reiniciar": () => {
      if (!confirm(`¿Borrar todo el progreso de ${P.apodo || "este jugador"}? Se perderán estrellas, monedas, tesoros e historial.`)) return;
      if (!confirm("Esta acción no se puede deshacer. ¿Seguro?")) return;
      A.borrar(P.id); P = null; sesion = null; arrancar();
    }
  };
  function refrescar() { if (actual) actual(); else pantallaInicio(); }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-accion]");
    if (!b || b.disabled) return;
    const f = ACCIONES[b.dataset.accion];
    if (f) { e.preventDefault(); f(b.dataset.valor, b); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !capa.hidden && !capa.querySelector(".modal-cofre")) cerrarModal();
    if (e.key === "Enter" && e.target.matches && e.target.matches("input.campo")) {
      const btn = (e.target.closest(".modal, .tarjeta-blanca, .fila-campo") || document).querySelector(".btn-principal, .fila-campo .btn");
      if (btn) btn.click();
    }
  });
  capa.addEventListener("click", e => { if (e.target === capa && !capa.querySelector(".modal-cofre")) cerrarModal(); });

  /* ---------- Arranque ---------- */
  function arrancar() {
    const lista = A.perfiles();
    if (!lista.length) return pantallaBienvenida();
    if (lista.length > 1) return pantallaPerfiles();   // con varios jugadores, cada uno elige al entrar
    const p = A.cargar(lista[0].id);
    if (p) { A.activar(p.id); entrar(p); } else pantallaBienvenida();
  }
  arrancar();
})();
