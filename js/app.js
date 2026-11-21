/* Palabraventura · interfaz (versión 3: camino de lecciones).
   Pantallas: ¿quién juega? · bienvenida · camino · lección (retos + decisión) · resultado · colección · ajustes · adultos. */
(function () {
  const U = PV.util, M = PV.motor, R = PV.recompensas, A = PV.almacen, W = PV.mundo, esc = U.esc;
  const app = document.getElementById("app");
  const capa = document.getElementById("capa");

  const problemas = PV.validarBanco();
  if (problemas.length) console.warn("Palabraventura: revisar banco de ejercicios", problemas);

  let P = null;        // progreso del jugador activo
  let sesion = null;   // lección en curso
  let actual = null;   // función que redibuja la pantalla actual

  const ESTADOS = { nueva: "Sin empezar", practicando: "Practicando", casi: "¡Casi lo tiene!", dominada: "Dominada" };
  const MSG_ACIERTO = ["¡Genial!", "¡Bien visto!", "¡Eso es!", "¡Muy bien!", "¡Perfecto!", "¡Toma ya!"];
  const MSG_FALLO = ["¡Casi!", "¡Uy, por poco!", "¡Buen intento!", "¡No pasa nada!"];
  const ANIMO = ["¡A mí también me pasa!", "¡Juntos lo sacamos!", "¡La próxima es nuestra!", "¡Equivocarse es parte de la aventura!"];
  const ZIGZAG = [0, 52, 78, 52, 0, -52, -78, -52];
  const N_MISION = 7, N_JEFE = 8;
  // La expedición se ve siempre en los perfiles de niño. En los de adulto, solo si se activa en este dispositivo
  // desde Zona de adultos («Mostrar también a adultos») o abriendo la app con «?expedicion» («?expedicion=0» lo quita).
  const K_EXPEDICION = "palabraventura.expedicion";
  function expedicionAdultos() { try { return localStorage.getItem(K_EXPEDICION) === "1"; } catch (e) { return false; } }
  function expedicionVisible() { return !!P && (P.tipo !== "adulto" || expedicionAdultos()); }
  function mostrarExpedicion(si) { try { if (si) localStorage.setItem(K_EXPEDICION, "1"); else localStorage.removeItem(K_EXPEDICION); } catch (e) { /* nada */ } }
  try {
    const q = new URLSearchParams(location.search);
    if (q.has("expedicion")) mostrarExpedicion(q.get("expedicion") !== "0");
  } catch (e) { /* nada */ }

  /* ---------- Utilidades ---------- */
  function guardar() { A.guardar(P); }
  function habsAbiertas() { return [...new Set(W.zonas(P).flatMap(z => z.habilidades))]; }
  function sonar(n) { PV.sonido.play(n, P && P.sonido); }
  function animacionesOn() { return !(P && P.reducirAnimaciones) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function aplicarAjustes() { document.body.classList.toggle("sin-animaciones", !!(P && P.reducirAnimaciones)); }
  // Días seguidos jugando (cuenta hasta hoy o hasta ayer: no se «rompe» hasta pasar un día entero sin jugar).
  function racha() {
    let d = U.hoy(), n = 0;
    if (!P.actividad[d]) d = U.sumarDias(d, -1);
    while (P.actividad[d]) { n++; d = U.sumarDias(d, -1); }
    return n;
  }
  function avatarHTML(tam) {
    const an = R.animal(P.avatar.animal), pu = R.puestos(P);
    const capa = h => { const a = R.accesorio(pu[h]); return a ? `<span class="acc acc-${h}">${a.icono}</span>` : ""; };
    return `<span class="avatar avatar-${tam} etapa-${W.etapa(P)}" aria-hidden="true">${capa("fondo")}<span class="avatar-animal">${an.icono}</span>${capa("cara")}${capa("cabeza")}${capa("cuello")}${capa("mano")}${capa("mascota")}</span>`;
  }
  function burbuja(texto, tam) {
    return `<div class="mascota-dice">${avatarHTML(tam || "m")}<p class="bocadillo"><strong>${esc(R.nombreMascota(P))}:</strong> ${esc(texto)}</p></div>`;
  }
  function render(html, fn, mantenerScroll) {
    const y = window.scrollY;
    if (fn) actual = fn;
    app.innerHTML = html;
    window.scrollTo(0, mantenerScroll ? y : 0);
    const foco = app.querySelector("[data-foco]");
    if (foco && !mantenerScroll) foco.focus({ preventScroll: true });
  }
  function modal(html) {
    capa.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
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

  function confeti() {
    const colores = ["#ffcc33", "#4cc764", "#3fa9f5", "#ff7aa8", "#9b6cff", "#ff9b2f"];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("span");
      c.className = "confeti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colores[i % colores.length];
      c.style.animationDelay = Math.random() * 0.8 + "s";
      c.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
      c.style.setProperty("--giro", (Math.random() * 720 - 360) + "deg");
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4800);
    }
  }
  // Fondo animado: letras, estrellas y nubes que flotan despacio. Se crea una sola vez (no se reinicia al cambiar de pantalla).
  function crearFondo() {
    const f = document.getElementById("fondo");
    if (!f || f.childElementCount) return;
    const cosas = ["A", "b", "ñ", "á", "V", "H", "ll", "Y", "é", "✏️", "⭐", "📚", "✨", "☁️", "🎈", "💬", "ó", "B"];
    const colores = ["#ffb347", "#6cc070", "#4fb3e8", "#a68cff", "#ff7aa8", "#ffcc33"];
    for (let i = 0; i < 22; i++) {
      const e = document.createElement("span");
      e.textContent = cosas[i % cosas.length];
      e.style.left = (i * 97 % 100) + "vw";
      e.style.fontSize = (22 + (i * 37 % 34)) + "px";
      e.style.color = colores[i % colores.length];
      e.style.animationDuration = (22 + (i * 13 % 20)) + "s";
      e.style.animationDelay = -(i * 7 % 30) + "s";
      f.appendChild(e);
    }
  }

  /* Celebración «6 7»: el compañero aparece sobre el pie de la lección moviendo las dos manos
     con la palma hacia arriba, una arriba y otra abajo, mientras saltan un 6 y un 7. */
  // Solo la apaga el ajuste «Menos animaciones» de la propia app (no el «reducir movimiento» del móvil,
  // que en Android se activa solo con el ahorro de batería): la celebración se enciende o apaga en Ajustes.
  function seisSieteActivo() {
    if (P.reducirAnimaciones) return false;
    return seisSieteActivoAjuste();
  }
  function seisSieteActivoAjuste() { return P.seisSiete === undefined ? P.tipo !== "adulto" : !!P.seisSiete; }
  function seisSiete() {
    document.querySelectorAll(".seis-siete").forEach(x => x.remove());
    const d = document.createElement("div");
    d.className = "seis-siete";
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = `<span class="ss-num ss-6">6</span>
      <span class="ss-cuerpo"><span class="ss-mano ss-izq">🫴</span>${avatarHTML("l")}<span class="ss-mano ss-der">🫴</span></span>
      <span class="ss-num ss-7">7</span>`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1900);
    // Voz del navegador (sin archivos ni servicios externos), solo si el sonido está activado.
    if (P.sonido && "speechSynthesis" in window) {
      try {
        const u = new SpeechSynthesisUtterance("six seven");
        u.lang = "en-US"; u.rate = 1.05; u.pitch = 1.25; u.volume = 0.9;
        // En el móvil la voz solo arranca si se pide en el mismo toque del usuario: nada de setTimeout.
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(u);
      } catch (e) { /* sin voz */ }
    }
  }

  /* ---------- Estructura común: menú lateral (ordenador), barra superior, panel derecho, barra inferior (móvil) ---------- */
  const SECCIONES = [["camino", "🗺️", "Aventura"], ["ir-coleccion", "🎒", "Colección"], ["ajustes", "⚙️", "Ajustes"]];
  function marco(contenido, seccion) {
    const n = racha();
    return `<div class="marco">
      <aside class="lateral">
        <div class="marca">🗺️ Palabraventura</div>
        <nav aria-label="Secciones">${SECCIONES.map(([a, i, t]) => `<button type="button" class="lateral-item ${a === seccion ? "activa" : ""}" data-accion="${a}"><span>${i}</span>${t}</button>`).join("")}</nav>
      </aside>
      <div class="columna">
        <header class="topbar">
          <button type="button" class="tb-yo" data-accion="ir-coleccion" data-valor="companero" aria-label="Tu compañero">${avatarHTML("s")}<span>${esc(P.apodo || "Aventurero")}</span></button>
          <div class="tb-stats">
            <span class="tb-stat racha ${n ? "" : "apagada"}" title="Días seguidos jugando">🔥 ${n}</span>
            <span class="tb-stat estrellas" title="Estrellas">⭐ ${P.estrellas}</span>
            <span class="tb-stat monedas" title="Monedas">🪙 ${P.monedas}</span>
          </div>
        </header>
        ${contenido}
      </div>
      <aside class="derecha">${panelDerecho()}</aside>
    </div>
    <nav class="tabbar" aria-label="Secciones">${SECCIONES.map(([a, i, t]) => `<button type="button" class="${a === seccion ? "activa" : ""}" data-accion="${a}"><span>${i}</span>${t}</button>`).join("")}</nav>`;
  }
  function panelDerecho() {
    const e = W.etapa(P), sig = PV.ETAPAS[e + 1], n = racha();
    return `<div class="tarjeta t-mascota">
        <div class="centro">${avatarHTML("l")}</div>
        <p class="tarjeta-titulo centro">${esc(R.nombreMascota(P))}</p>
        <p class="nota centro">${PV.ETAPAS[e].nombre}</p>
        ${sig ? `<div class="barra-etapa"><span style="width:${Math.round((P.estrellas - PV.ETAPAS[e].min) / (sig.min - PV.ETAPAS[e].min) * 100)}%"></span></div>
        <p class="nota centro">Con ${sig.min - P.estrellas} ⭐ más, evoluciona.</p>` : ""}
      </div>
      <div class="tarjeta t-racha">
        <p class="tarjeta-titulo">🔥 ${n ? `${n} ${n === 1 ? "día seguido" : "días seguidos"}` : "¡Empieza tu racha hoy!"}</p>
        <p class="nota">Una lección al día es suficiente.</p>
      </div>
      <button type="button" class="tarjeta tarjeta-boton t-album" data-accion="ir-coleccion" data-valor="album">
        <p class="tarjeta-titulo">🖼️ Álbum de tesoros</p><p class="nota">${P.coleccion.length} de ${PV.COLECCION.filter(o => W.zonas(P).some(z => z.id === o.zona)).length} encontrados</p>
      </button>`;
  }

  /* ---------- ¿Quién juega? ---------- */
  function pantallaPerfiles() {
    render(`<main class="bienvenida">
        <div class="logo"><span class="logo-icono">🗺️</span><h1>Palabraventura</h1><p>¿Quién juega hoy?</p></div>
        <div class="rejilla-perfiles">
          ${A.perfiles().map(p => `<button type="button" class="perfil-tarjeta" data-accion="elegir-perfil" data-valor="${esc(p.id)}">
            <span class="avatar avatar-l"><span class="avatar-animal">${R.animal(p.animal).icono}</span></span><strong>${esc(p.apodo || "Aventurero")}</strong>${p.tipo === "adulto" ? `<span class="pill">🎓 Adulto</span>` : ""}</button>`).join("")}
          <button type="button" class="perfil-tarjeta perfil-nuevo" data-accion="nuevo-perfil"><span class="avatar avatar-l"><span class="avatar-animal">➕</span></span><strong>Nuevo jugador</strong></button>
        </div>
      </main>`, pantallaPerfiles);
  }

  /* ---------- Bienvenida ---------- */
  let animalInicio = "zorro", tipoInicio = "nino";
  function pantallaBienvenida() {
    animalInicio = "zorro"; tipoInicio = "nino";
    render(`<main class="bienvenida">
        <div class="logo"><span class="logo-icono">🗺️</span><h1>Palabraventura</h1><p>¡Aprende a escribir sin faltas jugando!</p></div>
        <div class="tarjeta">
          <p class="paso">1. ¿Quién va a jugar?</p>
          <div class="tipo-jugador" role="radiogroup" aria-label="Tipo de jugador">
            <button type="button" class="tipo elegido" role="radio" aria-checked="true" data-accion="elegir-tipo" data-valor="nino"><span>🎒</span><b>Niño o niña</b><small>Aventura de 7 a 11 años</small></button>
            <button type="button" class="tipo" role="radio" aria-checked="false" data-accion="elegir-tipo" data-valor="adulto"><span>🎓</span><b>Adulto</b><small>Ortografía avanzada</small></button>
          </div>
          <p class="paso">2. Elige tu compañero</p>
          <div class="rejilla-animales" role="radiogroup" aria-label="Compañero">
            ${R.ANIMALES.map(a => `<button type="button" class="animal ${a.id === animalInicio ? "elegido" : ""}" role="radio" aria-checked="${a.id === animalInicio}" data-accion="elegir-animal-inicio" data-valor="${a.id}" aria-label="${a.nombre}">${a.icono}</button>`).join("")}
          </div>
          <label class="paso" for="apodo">3. ¿Cómo te llamamos?</label>
          <input id="apodo" class="campo" maxlength="16" placeholder="Un apodo, por ejemplo: Rayo" autocomplete="off">
          <label class="paso" for="nombre-mascota">4. ¿Y a tu compañero? <small>(si quieres)</small></label>
          <input id="nombre-mascota" class="campo" maxlength="14" placeholder="${R.animal(animalInicio).nombreDefecto}" autocomplete="off">
          <button type="button" class="btn btn-verde btn-xl" data-accion="empezar">¡EMPEZAR!</button>
          ${A.perfiles().length ? `<button type="button" class="btn btn-gris btn-xl" data-accion="ver-perfiles">Volver</button>` : ""}
        </div>
        <p class="nota centro">💾 Se guarda solo en este navegador. No hace falta tu nombre real. Cada jugador tiene su propio progreso.${A.disponible ? "" : " <strong>Este navegador no permite guardar.</strong>"}</p>
      </main>`, pantallaBienvenida);
  }
  function entrar(p) { P = p; P.ultimaVisita = U.hoy(); A.guardar(P); aplicarAjustes(); pantallaCamino(); }

  /* ---------- Camino de lecciones ---------- */
  let abierto = null; // lección cuya tarjeta está desplegada
  function pantallaCamino(conservar) {
    sesion = null;
    const sig = W.siguiente(P);
    let html = `<main class="camino">`;
    if (expedicionVisible() && PV.expedicion) {
      const nueva = !(P.expedicion && P.expedicion.puente);
      html += `<button type="button" class="tarjeta-expedicion" data-accion="expedicion">
        <span class="te-icono">🌉</span><span><strong>La expedición de las palabras perdidas</strong><small>Explora, salta y recupera las letras</small></span>
        ${nueva ? `<span class="te-nuevo">NUEVO</span>` : ""}</button>`;
    }
    W.zonas(P).forEach((z, ui) => {
      const ab = W.abierta(P, z);
      html += `<section class="unidad ${ab ? "" : "bloqueada"}" style="--c:${z.color}">
        <div class="adornos" aria-hidden="true">${(z.deco || []).map((d, i) => `<span style="--i:${i}">${d}</span>`).join("")}</div>
        <div class="unidad-cabecera">
          <div><small>UNIDAD ${ui + 1} · ${W.hechas(P, z)}/${W.totalMisiones(z)}</small><h2>${z.nombre}</h2>
          <p>${ab ? `Con ${z.personaje.nombre}, ${z.personaje.rol}` : "🔒 " + esc(W.requisito(P, z))}</p></div>
          <span class="unidad-personaje">${z.personaje.icono}</span>
        </div>
        <div class="nodos">`;
      z.misiones.forEach((m, k) => {
        const est = W.estadoMision(P, z, k);
        if (m.infinita && est === "bloqueada") return;
        const esActual = ab && sig.mision === m;
        const icono = est === "completada" ? (m.jefe ? "🏆" : "✔") : m.jefe ? "👑" : m.infinita ? "🔁" : "★";
        html += `<div class="nodo-fila" style="--x:${ZIGZAG[k % ZIGZAG.length]}px">
          ${esActual && abierto !== m.id ? `<span class="empieza">¡EMPIEZA!</span>` : ""}
          <button type="button" class="nodo ${est} ${esActual ? "actual" : ""} ${m.jefe ? "jefe" : ""}" data-accion="nodo" data-valor="${m.id}" aria-label="${esc(m.titulo)}" aria-expanded="${abierto === m.id}">${icono}</button>
          ${esActual ? `<span class="nodo-mascota ${ZIGZAG[k % ZIGZAG.length] > 0 ? "izq" : "der"}">${avatarHTML("m")}</span>` : ""}
          ${abierto === m.id ? tarjetaLeccion(z, m, est) : ""}
        </div>`;
      });
      html += `</div></section>`;
    });
    PV.ZONAS_FUTURAS.forEach(f => {
      html += `<section class="unidad futura"><div class="unidad-cabecera"><div><small>PRÓXIMAMENTE</small><h2>${f.nombre}</h2><p>Nuevas aventuras en camino</p></div><span class="unidad-personaje">${f.icono}</span></div></section>`;
    });
    html += `</main>`;
    render(marco(html, "camino"), () => pantallaCamino(true), conservar);
    if (!conservar) {
      // Mientras la expedición sea nueva para el jugador, la pantalla empieza arriba para que se vea su tarjeta.
      const n = app.querySelector(".tarjeta-expedicion .te-nuevo") ? null : app.querySelector(".nodo.actual");
      if (n) n.scrollIntoView({ block: "center" });
    }
  }
  function tarjetaLeccion(z, m, est) {
    if (est === "bloqueada") {
      return `<div class="pop gris"><strong>${esc(m.titulo)}</strong><p>Completa las lecciones anteriores para desbloquear esta.</p></div>`;
    }
    return `<div class="pop"><strong>${m.jefe ? "👑 " : ""}${esc(m.titulo)}</strong><p>${esc(m.intro)}</p>
      <button type="button" class="btn btn-blanco btn-xl" data-accion="empezar-leccion" data-valor="${m.id}" data-foco>${est === "completada" ? "REPETIR" : "EMPEZAR"} · ${m.jefe ? N_JEFE : N_MISION} retos</button></div>`;
  }

  /* ---------- Lección ---------- */
  function iniciarLeccion(idMision) {
    const f = W.buscar(idMision); if (!f) return;
    const { zona: z, mision: m } = f;
    const abiertas = habsAbiertas();
    const habs = z.requiereTodas ? z.habilidades : z.habilidades.filter(h => abiertas.includes(h));
    const cola = M.seleccionarSesion(P, { habilidades: habs, n: m.jefe ? N_JEFE : N_MISION, preferirReglas: m.reglas, repasoDe: m.jefe ? habs : abiertas });
    if (!cola.length) { aviso("No hay retos disponibles ahora mismo."); return; }
    cola.forEach(r => { if (PV.construye.apto(r.ej) && Math.random() < 0.4) r.formato = "construye"; });
    abierto = null;
    sesion = { zona: z, k: f.k, mision: m, cola, i: 0, aciertos: 0, contestados: 0, estrellas: 0, monedas: 0, mejoras: 0,
      comprobaciones: 0, reintentados: new Set(), decisionEn: Math.floor(cola.length / 2), eleccion: null,
      zonasAntes: PV.ZONAS.filter(x => W.abierta(P, x)).map(x => x.id) };
    pantallaReto();
  }

  function cabeceraLeccion() {
    const pct = Math.round(sesion.i / sesion.cola.length * 100);
    return `<header class="leccion-top">
      <button type="button" class="cerrar" data-accion="salir-leccion" aria-label="Salir de la lección"><span aria-hidden="true">✕</span><b>Salir</b></button>
      <div class="progreso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${Math.max(pct, 4)}%"></span></div>
    </header>`;
  }

  function pantallaReto() {
    const r = sesion.cola[sesion.i], ej = r.ej;
    const formato = r.formato || ej.tipo;
    const NOMBRES_ADULTO = { detective: { nombre: "Elige la correcta", icono: "✅" }, completa: { nombre: "Completa la frase", icono: "✍️" }, robot: { nombre: "Encuentra el error", icono: "🔎" } };
    const tipo = (P.tipo === "adulto" && NOMBRES_ADULTO[formato]) || PV.TIPOS[formato];
    if (!r.orden) r.orden = U.barajar(ej.opciones);
    if (!r.fase) r.fase = ej.tipo === "robot" ? "buscar" : "elegir";
    if (formato === "construye" && !r.fichas) {
      const f = PV.construye.fichas(ej.palabra);
      r.objetivo = f.length; r.fichas = U.barajar(f.concat([PV.construye.trampa(ej)])); r.usadas = [];
    }
    const etiqueta = r.tag === "comprobacion" ? "🔎 Comprobación" : r.tag === "reintento" ? "🔁 Otra oportunidad" : r.tag === "repaso" ? "🔁 Repaso" : "";
    let pregunta = "", cuerpo = "", listo = false;

    if (formato === "construye") {
      pregunta = "Ordena las fichas. ¡Sobra una!";
      const hecha = r.usadas.map(i => r.fichas[i]);
      listo = r.usadas.length === r.objetivo;
      cuerpo = `${ej.frase ? `<p class="frase">${esc(ej.frase).replace("___", `<span class="hueco">${r.respondido ? esc(ej.palabra) : "?"}</span>`)}</p>` : ""}
        <div class="casillas ${r.respondido ? (r.ok ? "bien" : "mal") : ""}">${Array.from({ length: r.objetivo }, (_, i) =>
          `<button type="button" class="casilla ${hecha[i] ? "llena" : ""}" data-accion="quitar-ficha" data-valor="${i}" ${r.respondido || !hecha[i] ? "disabled" : ""} aria-label="${hecha[i] ? "Quitar " + esc(hecha[i]) : "Hueco vacío"}">${hecha[i] ? esc(hecha[i]) : ""}</button>`).join("")}</div>
        ${r.respondido ? "" : `<div class="fichas">${r.fichas.map((f, i) => `<button type="button" class="ficha" data-accion="ficha" data-valor="${i}" ${r.usadas.includes(i) ? "disabled" : ""}>${esc(f)}</button>`).join("")}</div>
          <p class="nota centro">Toca una ficha colocada para quitarla.</p>`}`;
    } else if (formato === "detective") {
      pregunta = ej.pregunta || "¿Cuál está bien escrita?";
      listo = r.sel !== undefined;
      cuerpo = `${ej.frase ? `<p class="frase">${esc(ej.frase).replace("___", `<span class="hueco">${r.sel !== undefined ? esc(r.sel) : "?"}</span>`)}</p>` : ""}
        <div class="opciones">${r.orden.map((o, i) => opcion(r, o, esc(o), i)).join("")}</div>`;
    } else if (formato === "completa") {
      pregunta = ej.pregunta || "¿Qué letra falta?";
      listo = r.sel !== undefined;
      const partes = ej.hueco.split("_");
      const relleno = r.sel !== undefined ? (r.sel || "·") : "?";
      const palabra = `<span class="palabra-hueco${ej.hueco.length > 12 ? " larga" : ""}">${esc(partes[0])}<span class="hueco-letra">${esc(relleno)}</span>${esc(partes[1])}</span>`;
      cuerpo = `<p class="frase">${ej.frase ? esc(ej.frase).replace("___", palabra) : palabra}</p>
        <div class="opciones opciones-letras">${r.orden.map((o, i) => opcion(r, o, o === "" ? "<span class='sin-letra'>sin letra</span>" : esc(o), i)).join("")}</div>`;
    } else {
      const toks = ej.frase.split(/\s+/);
      if (r.fase === "buscar") {
        pregunta = "Toca la palabra mal escrita";
        listo = r.selToken !== undefined;
        cuerpo = `<p class="frase frase-robot">🤖 ${toks.map((t, k) => `<button type="button" class="token ${r.selToken === k ? "sel" : ""} ${(r.tocados || []).includes(k) ? "bien" : ""}" data-accion="token" data-valor="${k}" ${(r.tocados || []).includes(k) ? "disabled" : ""}>${esc(t)}</button>`).join(" ")}</p>
          ${r.aviso ? `<p class="aviso-reto">${esc(r.aviso)}</p>` : ""}`;
      } else {
        pregunta = "¿Cómo se escribe bien?";
        listo = r.sel !== undefined;
        cuerpo = `<p class="frase frase-robot">🤖 ${toks.map(t => {
            const err = U.limpiar(t) === ej.error;
            return `<span class="token ${err ? "error" : ""}">${err && r.respondido ? esc(t.replace(ej.error, ej.correcta)) : esc(t)}</span>`;
          }).join(" ")}</p>
          ${r.aviso ? `<p class="aviso-reto">${esc(r.aviso)}</p>` : ""}
          <div class="opciones">${r.orden.map((o, i) => opcion(r, o, esc(o), i)).join("")}</div>`;
      }
    }

    const pista = r.respondido ? "" : r.pistaVista
      ? burbuja("Pista: " + (PV.PISTAS[ej.regla] || "Lee la palabra despacio, letra a letra."), "s")
      : `<button type="button" class="btn-pista" data-accion="pista">💡 Pista</button>`;

    render(`<div class="leccion" style="--c:${sesion.zona.color}">
        ${cabeceraLeccion()}
        <main class="leccion-cuerpo">
          <p class="modo">${tipo.icono} ${tipo.nombre}${etiqueta ? ` <span class="pill">${etiqueta}</span>` : ""}</p>
          <h1 class="pregunta">${pregunta}</h1>
          ${cuerpo}
          ${pista}
        </main>
        ${pie(r, listo)}
      </div>`, pantallaReto);
  }

  function opcion(r, valor, etiqueta, i) {
    let cls = "opcion";
    if (r.respondido) {
      if (valor === r.ej.correcta) cls += " correcta"; else if (valor === r.sel) cls += " mal";
    } else if (valor === r.sel) cls += " sel";
    return `<button type="button" class="${cls}" data-accion="elegir" data-valor="${esc(valor)}" ${r.respondido ? "disabled" : ""}><span class="tecla">${i + 1}</span>${etiqueta}</button>`;
  }

  function pie(r, listo) {
    if (!r.respondido) {
      return `<footer class="leccion-pie"><div class="pie-dentro">
        <button type="button" class="btn btn-verde btn-xl" data-accion="comprobar" ${listo ? "" : "disabled"}>COMPROBAR</button></div></footer>`;
    }
    const ej = r.ej, res = r.res;
    const ultimo = sesion.i + 1 >= sesion.cola.length;
    const extra = res.sube ? `<span class="pill">⬆️ ¡Cada vez dominas más ${PV.HABILIDADES[ej.habilidad].nombre}!</span>` : res.consolidada ? `<span class="pill">💪 ¡Palabra superada!</span>` : "";
    return `<footer class="leccion-pie ${r.ok ? "ok" : "mal"}" aria-live="polite"><div class="pie-dentro">
        <div class="pie-texto">
          <p class="pie-titulo">${r.ok ? `✔ ${r.msg} <span class="mas">+${res.estrellas} ⭐</span>` : `${r.msg} Se escribe: <b>${esc(ej.palabra)}</b>`}</p>
          <p class="pie-explica">${esc(ej.explicacion)}</p>
          ${r.ok ? extra : `<p class="pie-animo">${avatarHTML("s")} ${esc(U.azar(ANIMO))} ${r.tag === "reintento" ? "La repasaremos otro día." : "Te la volveré a preguntar."}</p>`}
        </div>
        <button type="button" class="btn ${r.ok ? "btn-verde" : "btn-naranja"} btn-xl" data-accion="seguir" data-foco>${ultimo ? "TERMINAR" : "CONTINUAR"}</button>
      </div></footer>`;
  }

  function comprobar() {
    const r = sesion.cola[sesion.i], ej = r.ej, formato = r.formato || ej.tipo;
    if (r.respondido) return;
    if (formato === "construye") {
      if (r.usadas.length !== r.objetivo) return;
      return terminarReto(r, r.usadas.map(i => r.fichas[i]).join("") === ej.palabra.toLowerCase());
    }
    if (ej.tipo === "robot" && r.fase === "buscar") {
      if (r.selToken === undefined) return;
      const toks = ej.frase.split(/\s+/);
      if (U.limpiar(toks[r.selToken]) === ej.error) { r.fase = "corregir"; r.aviso = "¡Encontrada! Ahora elige cómo se escribe."; sonar("toque"); }
      else {
        r.tocados = (r.tocados || []).concat(r.selToken); r.fallosBusqueda = (r.fallosBusqueda || 0) + 1;
        if (r.fallosBusqueda >= 2) { r.fase = "corregir"; r.noEncontrado = true; r.aviso = "Era la palabra marcada en naranja. ¿Cómo se escribe bien?"; }
        else r.aviso = "Esa palabra está bien escrita. ¡Busca otra!";
      }
      r.selToken = undefined;
      return pantallaReto();
    }
    if (r.sel === undefined) return;
    terminarReto(r, r.sel === ej.correcta && !r.noEncontrado);
  }

  function terminarReto(r, acierto) {
    r.respondido = true; r.ok = acierto;
    r.res = M.registrarRespuesta(P, r.ej, acierto, { reintento: r.tag === "reintento", comprobacion: r.tag === "comprobacion", pista: !!r.pistaVista });
    r.msg = U.azar(acierto ? MSG_ACIERTO : MSG_FALLO);
    sesion.contestados++;
    if (acierto) sesion.aciertos++;
    sesion.estrellas += r.res.estrellas; sesion.monedas += r.res.monedas;
    if (r.res.mejora) sesion.mejoras++;
    if (!acierto) {
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
    if (acierto) {
      chispas(app.querySelector(".opcion.correcta") || app.querySelector(".casillas") || app.querySelector(".token.error") || app.querySelector(".pie-titulo"));
      if (seisSieteActivo()) seisSiete();
    }
  }

  function siguiente() {
    sesion.i++;
    if (sesion.i === sesion.decisionEn && !sesion.eleccion) return pantallaDecision();
    if (sesion.i >= sesion.cola.length) return finalizar();
    pantallaReto();
  }

  /* ---------- Decisión a mitad de lección ---------- */
  function pantallaDecision() {
    const { zona: z, mision: m } = sesion, d = m.decision;
    const op = (k, o) => `<button type="button" class="decision-opcion" data-accion="decidir" data-valor="${k}">
      <span class="decision-icono">${o.icono}</span><strong>${esc(o.texto)}</strong>
      <small>${o.efecto === "hallazgo" ? "🔍 Quizá encuentres un tesoro" : "🪙 Monedas extra"}</small></button>`;
    render(`<div class="leccion" style="--c:${sesion.zona.color}">
        ${cabeceraLeccion()}
        <main class="leccion-cuerpo centro">
          <p class="decision-personaje">${z.personaje.icono}</p>
          <p class="modo">${z.personaje.nombre} te pregunta:</p>
          <h1 class="pregunta">${esc(d.pregunta)}</h1>
          <div class="decision-opciones">${op("a", d.a)}${op("b", d.b)}</div>
          <p class="nota">Las dos opciones son buenas. ¡Elige la que más te guste!</p>
        </main>
      </div>`, pantallaDecision);
  }
  function decidir(k) {
    const o = sesion.mision.decision[k];
    sesion.eleccion = o.efecto;
    sonar("toque");
    aviso(`${o.icono} ¡Buena elección!`);
    if (sesion.i >= sesion.cola.length) finalizar(); else pantallaReto();
  }

  /* ---------- Final de lección ---------- */
  function finalizar() {
    const s = sesion;
    P.sesiones.push({ fecha: U.hoy(), modo: "mision", mision: s.mision.id, retos: s.contestados, aciertos: s.aciertos });
    if (P.sesiones.length > 300) P.sesiones.shift();
    const premio = R.completarMision(P, s.zona, s.mision, s.eleccion, false);
    // Los cofres se abren solos: nada de pasos extra.
    const cofres = [];
    while (P.cofresPendientes > 0) { const c = R.abrirCofre(P); if (!c) break; cofres.push(c); }
    const nuevas = PV.ZONAS.filter(z => W.abierta(P, z) && !s.zonasAntes.includes(z.id));
    guardar();
    sonar("fin");
    sesion = null;
    const monedasCofres = cofres.filter(c => c.tipo === "monedas").reduce((t, c) => t + c.cantidad, 0);
    const pct = s.contestados ? Math.round(s.aciertos / s.contestados * 100) : 0;
    const lineas = [];
    if (premio.objeto) lineas.push(`<div class="premio rareza-${premio.objeto.rareza}"><span>${premio.objeto.icono}</span><div><small>Tesoro ${PV.RAREZAS[premio.objeto.rareza].nombre.toLowerCase()}</small><b>${premio.objeto.nombre}</b></div></div>`);
    cofres.forEach(c => {
      if (c.tipo === "objeto") lineas.push(`<div class="premio rareza-${c.objeto.rareza}"><span>${c.objeto.icono}</span><div><small>🎁 Del cofre · tesoro</small><b>${c.objeto.nombre}</b></div></div>`);
      if (c.tipo === "accesorio") lineas.push(`<div class="premio"><span>${c.accesorio.icono}</span><div><small>🎁 Del cofre · accesorio</small><b>${c.accesorio.nombre}</b></div></div>`);
    });
    if (premio.etapaNueva) lineas.push(`<div class="premio dorado">${avatarHTML("s")}<div><small>¡Evolución!</small><b>${esc(R.nombreMascota(P))} es ahora ${premio.etapaNueva.nombre.toLowerCase()}</b></div></div>`);
    nuevas.forEach(z => lineas.push(`<div class="premio azul"><span>🔓</span><div><small>¡Nueva unidad!</small><b>${z.nombre}</b></div></div>`));
    premio.insignias.forEach(n => lineas.push(`<div class="premio"><span>${n.icono}</span><div><small>¡Nueva insignia!</small><b>${n.nombre}</b></div></div>`));

    render(`<div class="leccion" style="--c:${s.zona.color}">
        <main class="leccion-cuerpo final centro">
          <div class="final-mascota">${avatarHTML("xl")}</div>
          <h1 class="final-titulo">${s.mision.jefe ? "¡Desafío superado!" : "¡Lección completada!"}</h1>
          <p class="nota">${s.zona.nombre} · ${esc(s.mision.titulo)}</p>
          <div class="final-stats">
            <div class="fs amarillo"><small>ESTRELLAS</small><b>⭐ ${s.estrellas + premio.estrellas}</b></div>
            <div class="fs naranja"><small>MONEDAS</small><b>🪙 ${s.monedas + premio.monedas + monedasCofres}</b></div>
            <div class="fs verde"><small>ACIERTOS</small><b>🎯 ${pct}%</b></div>
          </div>
          ${s.mejoras ? `<p class="final-mejora">💪 ¡Has superado ${s.mejoras === 1 ? "una palabra que te costaba" : s.mejoras + " palabras que te costaban"}!</p>` : ""}
          ${lineas.length ? `<div class="premios">${lineas.join("")}</div>` : ""}
          <p class="final-gancho">“${esc(s.mision.gancho)}”</p>
        </main>
        <footer class="leccion-pie"><div class="pie-dentro">
          <button type="button" class="btn btn-verde btn-xl" data-accion="camino" data-foco>CONTINUAR</button>
        </div></footer>
      </div>`, null);
    actual = () => pantallaCamino();
    if (animacionesOn()) { setTimeout(() => chispas(app.querySelector(".final-mascota")), 200); confeti(); }
  }

  /* ---------- Colección ---------- */
  let pestana = "album";
  function pantallaColeccion(tab) {
    if (tab) pestana = tab;
    const tabs = [["album", "🖼️", "Álbum"], ["companero", "🐾", "Compañero"], ["mercadillo", "🛒", "Tienda"], ["insignias", "🏅", "Insignias"]];
    let cuerpo = "";
    if (pestana === "album") {
      const misTesoros = PV.COLECCION.filter(o => W.zonas(P).some(z => z.id === o.zona));
      cuerpo = `<p class="nota">${misTesoros.filter(o => P.coleccion.includes(o.id)).length} de ${misTesoros.length} tesoros. Salen al terminar lecciones.</p>
        ${W.zonas(P).map(z => {
          const objs = PV.COLECCION.filter(o => o.zona === z.id);
          return `<section class="tarjeta"><h2>${z.nombre} <small>${objs.filter(o => P.coleccion.includes(o.id)).length}/${objs.length}</small></h2>
            <div class="album">${objs.map(o => P.coleccion.includes(o.id)
              ? `<div class="carta rareza-${o.rareza}"><span class="carta-icono">${o.icono}</span><b>${o.nombre}</b><small>${PV.RAREZAS[o.rareza].nombre}</small></div>`
              : `<div class="carta oculta"><span class="carta-icono">?</span><b>???</b><small>${PV.RAREZAS[o.rareza].nombre}</small></div>`).join("")}</div></section>`;
        }).join("")}`;
    } else if (pestana === "companero") {
      const e = W.etapa(P), sig = PV.ETAPAS[e + 1];
      cuerpo = `<section class="tarjeta centro">
          ${avatarHTML("xl")}
          <p class="nombre-mascota">${esc(R.nombreMascota(P))}</p>
          <p class="nota">${PV.ETAPAS[e].nombre}</p>
          ${sig ? `<div class="barra-etapa"><span style="width:${Math.round((P.estrellas - PV.ETAPAS[e].min) / (sig.min - PV.ETAPAS[e].min) * 100)}%"></span></div>
            <p class="nota">Con ${sig.min - P.estrellas} ⭐ más evolucionará.</p>` : `<p class="nota">¡Ha llegado a su forma legendaria!</p>`}
          <div class="fila-campo"><input id="nuevo-nombre-mascota" class="campo" maxlength="14" value="${esc(P.mascota.nombre)}" placeholder="${esc(R.animal(P.avatar.animal).nombreDefecto)}" aria-label="Nombre del compañero">
          <button type="button" class="btn btn-azul" data-accion="guardar-nombre-mascota">Guardar</button></div>
        </section>
        <section class="tarjeta"><h2>Animal</h2>
          <div class="rejilla-animales">${R.ANIMALES.map(a => `<button type="button" class="animal ${P.avatar.animal === a.id ? "elegido" : ""}" data-accion="elegir-animal" data-valor="${a.id}" aria-label="${a.nombre}" aria-pressed="${P.avatar.animal === a.id}">${a.icono}</button>`).join("")}</div>
        </section>
        <section class="tarjeta"><h2>Accesorios <small>${P.accesorios.length} de ${R.ACCESORIOS.length}</small></h2>
          ${P.accesorios.length ? R.HUECOS.map(h => {
              const mios = R.ACCESORIOS.filter(a => a.hueco === h.id && P.accesorios.includes(a.id));
              return mios.length ? `<p class="hueco-titulo">${h.icono} ${h.nombre}</p><div class="rejilla-animales">${mios.map(a => `<button type="button" class="animal ${R.llevaPuesto(P, a.id) ? "elegido" : ""}" data-accion="equipar" data-valor="${a.id}" aria-label="${a.nombre}" aria-pressed="${R.llevaPuesto(P, a.id)}" title="${a.nombre}">${a.icono}</button>`).join("")}</div>` : "";
            }).join("") + `<p class="nota">Toca uno para ponérselo o quitárselo. Puede llevar una cosa en cada sitio, ¡todas a la vez!</p>
            <button type="button" class="enlace" data-accion="quitar-todo">Quitárselo todo</button>`
            : `<p class="nota">Todavía no tiene. ¡Cómpralos en la tienda!</p>`}
        </section>`;
    } else if (pestana === "mercadillo") {
      cuerpo = `<section class="tarjeta escaparate">
          <div class="escaparate-avatar">${avatarHTML("xl")}</div>
          <div><p class="tarjeta-titulo">Tienes 🪙 ${P.monedas}</p><p class="nota">Ganas monedas en cada lección. Lo que compras se lo pone al momento.</p>
          <p class="nota">${P.accesorios.length} de ${R.ACCESORIOS.length} cosas conseguidas</p></div>
        </section>
        ${R.HUECOS.map(h => `<section class="tarjeta"><h2>${h.icono} ${h.nombre}</h2><div class="tienda">${R.ACCESORIOS.filter(a => a.hueco === h.id).map(a => {
          const tiene = P.accesorios.includes(a.id), puesto = R.llevaPuesto(P, a.id), falta = a.precio - P.monedas;
          return `<div class="producto ${tiene ? "tenido" : ""} ${puesto ? "puesto" : ""}"><span class="producto-icono">${a.icono}</span><b>${a.nombre}</b>
            ${tiene ? `<button type="button" class="btn ${puesto ? "btn-gris" : "btn-azul"} btn-comprar" data-accion="equipar" data-valor="${a.id}">${puesto ? "Quitármelo" : "Ponérmelo"}</button>`
              : falta > 0 ? `<span class="precio">🪙 ${a.precio}</span><span class="falta"><span style="width:${Math.round(P.monedas / a.precio * 100)}%"></span></span><small>Faltan ${falta}</small>`
              : `<button type="button" class="btn btn-verde btn-comprar" data-accion="comprar" data-valor="${a.id}">Comprar · 🪙 ${a.precio}</button>`}</div>`;
        }).join("")}</div></section>`).join("")}`;
    } else {
      cuerpo = `<section class="tarjeta"><div class="insignias">
        ${R.INSIGNIAS.filter(n => R.insigniaVisible(P, n)).map(n => `<div class="insignia ${P.insignias.includes(n.id) ? "" : "bloqueada"}"><span class="insignia-icono">${P.insignias.includes(n.id) ? n.icono : "🔒"}</span><b>${n.nombre}</b><small>${n.desc}</small></div>`).join("")}
      </div></section>`;
    }
    render(marco(`<main class="pagina">
        <div class="pestanas" role="tablist">${tabs.map(([id, ic, txt]) => `<button type="button" role="tab" aria-selected="${pestana === id}" class="${pestana === id ? "activa" : ""}" data-accion="ir-coleccion" data-valor="${id}"><span>${ic}</span>${txt}</button>`).join("")}</div>
        ${cuerpo}
      </main>`, "ir-coleccion"), () => pantallaColeccion());
  }

  /* Animación al comprar: el compañero estrena su compra con saltos, destellos y confeti. */
  function celebrarCompra(a) {
    sonar("cofre");
    modal(`<div class="estreno">
        <div class="estreno-rayos" aria-hidden="true"></div>
        <div class="estreno-avatar">${avatarHTML("xl")}</div>
        <span class="estreno-objeto" aria-hidden="true">${a.icono}</span>
      </div>
      <h2 class="centro">¡${esc(a.nombre)}!</h2>
      <p class="nota centro">${U.azar(["¡Te queda genial!", "¡Qué estilazo!", "¡Vas guapísimo!", "¡Nuevo look!"])}</p>
      <button type="button" class="btn btn-verde btn-xl" data-accion="cerrar" data-foco>¡GENIAL!</button>`);
    capa.querySelector(".modal").classList.add("modal-estreno");
    if (animacionesOn()) { confeti(); setTimeout(() => chispas(capa.querySelector(".estreno-avatar")), 450); }
  }

  /* ---------- Ajustes ---------- */
  function pantallaAjustes() {
    render(marco(`<main class="pagina">
        <h1 class="titulo">Ajustes</h1>
        <section class="tarjeta lista-ajustes">
          <button type="button" class="interruptor" role="switch" aria-checked="${P.sonido}" data-accion="sonido"><span>🔊 Sonido</span><span class="mando ${P.sonido ? "on" : ""}"></span></button>
          <button type="button" class="interruptor" role="switch" aria-checked="${seisSieteActivoAjuste()}" data-accion="seis-siete"><span>🫴 Celebración «6 7» al acertar</span><span class="mando ${seisSieteActivoAjuste() ? "on" : ""}"></span></button>
          <button type="button" class="interruptor" role="switch" aria-checked="${!!P.reducirAnimaciones}" data-accion="animaciones"><span>🌀 Menos animaciones</span><span class="mando ${P.reducirAnimaciones ? "on" : ""}"></span></button>
        </section>
        <section class="tarjeta lista-ajustes">
          <h2>Jugador ${P.tipo === "adulto" ? `<span class="pill">🎓 Adulto · ortografía avanzada</span>` : `<span class="pill">🎒 Aventura infantil</span>`}</h2>
          <div class="fila-campo"><input id="nuevo-apodo" class="campo" maxlength="16" value="${esc(P.apodo)}" aria-label="Apodo"><button type="button" class="btn btn-azul" data-accion="guardar-apodo">Cambiar apodo</button></div>
          <div class="fila-botones">
            ${A.perfiles().length > 1 ? `<button type="button" class="btn btn-gris" data-accion="ver-perfiles">👥 Cambiar de jugador</button>` : ""}
            <button type="button" class="btn btn-gris" data-accion="nuevo-perfil">➕ Añadir jugador</button>
          </div>
        </section>
        <section class="tarjeta">
          <p class="nota">💾 El progreso se guarda en este navegador. Copias de seguridad y borrado, en la zona de adultos.</p>
          <button type="button" class="enlace" data-accion="adultos">Zona de adultos</button>
        </section>
      </main>`, "ajustes"), pantallaAjustes);
  }

  /* ---------- Zona de adultos ---------- */
  let retoAdulto = null;
  function abrirAdultos() {
    const pin = A.pin() || P.pin;
    if (!pin) retoAdulto = [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)];
    modal(`<h2>Zona de adultos</h2><label class="etiqueta" for="clave">${pin ? "Escribe el PIN" : `Para entrar, resuelve: ${retoAdulto[0]} × ${retoAdulto[1]}`}</label>
      <input id="clave" class="campo" ${pin ? 'type="password"' : ""} inputmode="numeric" maxlength="${pin ? 6 : 3}" autocomplete="off" data-foco>
      <p class="error-texto" id="error-clave" hidden>${pin ? "PIN incorrecto." : "Resultado incorrecto."}</p>
      <div class="fila-botones"><button type="button" class="btn btn-verde" data-accion="comprobar-adulto">Entrar</button>
      <button type="button" class="btn btn-gris" data-accion="cerrar">Cancelar</button></div>`);
  }
  function comprobarAdulto() {
    const v = (document.getElementById("clave").value || "").trim(), pin = A.pin() || P.pin;
    if (pin ? v === pin : Number(v) === retoAdulto[0] * retoAdulto[1]) { cerrarModal(); pantallaAdultos(); }
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
    const hechas = Object.values(P.misiones).filter(m => m.completada).length;
    const totalMis = W.zonas(P).reduce((s, z) => s + W.totalMisiones(z), 0);
    const filas = habsAbiertas().map(h => {
      const d = P.habilidades[h], est = M.estadoHabilidad(P, h), prec = M.precisionReciente(P, h);
      return `<tr><td>${PV.HABILIDADES[h].icono} ${PV.HABILIDADES[h].nombre}</td><td>${ESTADOS[est]}</td><td>${d ? d.intentos : 0}</td>
        <td>${d && d.intentos ? Math.round(d.aciertos / d.intentos * 100) + " %" : "—"}</td><td>${prec === null ? "—" : Math.round(prec * 100) + " %"}</td>
        <td>${d ? d.nivel : 1}</td><td>${d && d.ultimaFecha ? fechaCorta(d.ultimaFecha) : "—"}</td></tr>`;
    }).join("");
    const porRegla = {};
    PV.banco.forEach(e => { const it = P.items[e.id]; if (it && (it.fallos || it.pistas)) { const k = e.regla; porRegla[k] = porRegla[k] || { fallos: 0, pistas: 0, hab: e.habilidad, palabras: [] }; porRegla[k].fallos += it.fallos; porRegla[k].pistas += it.pistas || 0; if (it.fallos) porRegla[k].palabras.push(e.palabra); } });
    const errores = Object.entries(porRegla).filter(([, v]) => v.fallos).sort((a, b) => b[1].fallos - a[1].fallos).slice(0, 6);
    const pistas = Object.values(porRegla).reduce((s, v) => s + v.pistas, 0);
    const pendientes = PV.banco.filter(e => P.items[e.id] && P.items[e.id].enRefuerzo).sort((a, b) => (P.items[a.id].proximo || "").localeCompare(P.items[b.id].proximo || ""));
    const evol = [];
    for (let k = 13; k >= 0; k--) { const f = U.sumarDias(hoy, -k); evol.push({ f, a: P.actividad[f] || { retos: 0, aciertos: 0 } }); }
    const maxR = Math.max(10, ...evol.map(x => x.a.retos));
    const pin = A.pin() || P.pin;
    render(`<div class="adultos-marco">
      <header class="cabecera-simple"><button type="button" class="btn btn-gris" data-accion="camino">← Volver</button><h1>Zona de adultos</h1></header>
      <main class="adultos">
        <p class="aviso-adultos">Jugador: <b>${esc(P.apodo || "Aventurero")}</b>. Este panel resume la práctica hecha en la aplicación. No es una evaluación ni un diagnóstico.</p>
        <section class="panel"><h2>Resumen</h2>
          <div class="stats">
            <div class="stat"><b>${hechas}/${totalMis}</b><span>lecciones completadas</span></div>
            <div class="stat"><b>${dias}</b><span>días con práctica</span></div>
            <div class="stat"><b>${totalRetos}</b><span>retos respondidos</span></div>
            <div class="stat"><b>${r7 ? Math.round(a7 / r7 * 100) + " %" : "—"}</b><span>aciertos (7 días)</span></div>
            <div class="stat"><b>${pistas}</b><span>pistas pedidas</span></div>
          </div></section>
        <section class="panel"><h2>Recomendación</h2><p>${recomendacionTexto()}</p></section>
        <section class="panel"><h2>Habilidades</h2>
          <div class="tabla-envoltorio"><table><thead><tr><th>Habilidad</th><th>Estado</th><th>Intentos</th><th>Aciertos totales</th><th>Últimos 10</th><th>Dificultad</th><th>Última práctica</th></tr></thead><tbody>${filas}</tbody></table></div>
          <p class="nota">«Dominada» exige al menos 10 respuestas recientes con un 85 % de aciertos, en 2 días distintos o más.</p></section>
        <section class="panel"><h2>Evolución (14 días)</h2>
          <div class="grafico" role="img" aria-label="Retos respondidos por día en los últimos 14 días">
            ${evol.map(x => `<div class="col" title="${x.f}: ${x.a.retos} retos, ${x.a.aciertos} aciertos"><div class="barra-col" style="height:${Math.round(x.a.retos / maxR * 100)}%"><div class="barra-ok" style="height:${x.a.retos ? Math.round(x.a.aciertos / x.a.retos * 100) : 0}%"></div></div><span>${Number(x.f.slice(8))}</span></div>`).join("")}
          </div>
          <p class="nota"><span class="leyenda ley-ok"></span> aciertos <span class="leyenda ley-total"></span> retos respondidos</p></section>
        <section class="panel"><h2>Errores más frecuentes</h2>
          ${errores.length ? `<ul class="lista">${errores.map(([k, v]) => `<li><b>${PV.REGLAS[k]}</b> <small>(${PV.HABILIDADES[v.hab].nombre})</small> · ${v.fallos} ${v.fallos === 1 ? "fallo" : "fallos"}${v.pistas ? ` · ${v.pistas} ${v.pistas === 1 ? "pista" : "pistas"}` : ""}<br><small>${v.palabras.map(esc).join(", ")}</small></li>`).join("")}</ul>` : `<p class="nota">Todavía no hay errores registrados.</p>`}</section>
        <section class="panel"><h2>Palabras en repaso (${pendientes.length})</h2>
          ${pendientes.length ? `<ul class="lista lista-cols">${pendientes.map(e => `<li><b>${esc(e.palabra)}</b> <small>· ${PV.HABILIDADES[e.habilidad].nombre} · próximo repaso: ${fechaCorta(P.items[e.id].proximo)}</small></li>`).join("")}</ul>
            <p class="nota">Aparecen solas en las próximas lecciones: al día siguiente, a los pocos días y una semana después. Tras tres repasos acertados salen de la lista. Ya se han superado ${P.consolidadas || 0}.</p>` : `<p class="nota">No hay palabras pendientes de repaso.</p>`}</section>
        <section class="panel"><h2>🌉 La expedición de las palabras perdidas</h2>
          <p class="nota">Juego de exploración que aparece arriba del todo en Aventura. Los niños lo ven siempre; actívalo aquí si también quieres verlo con perfiles de adulto en este dispositivo.</p>
          <button type="button" class="interruptor" role="switch" aria-checked="${expedicionAdultos()}" data-accion="probar-expedicion"><span>Mostrar también a adultos</span><span class="mando ${expedicionAdultos() ? "on" : ""}"></span></button>
        </section>
        <section class="panel"><h2>Copia de seguridad</h2>
          <p class="nota">El progreso se guarda solo en este navegador. Conviene exportar una copia de vez en cuando. Importar sustituye el progreso de este jugador.</p>
          <div class="fila-botones">
            <button type="button" class="btn btn-gris" data-accion="exportar">⬇️ Exportar copia</button>
            <label class="btn btn-gris" for="importar">⬆️ Importar copia</label>
            <input id="importar" type="file" accept="application/json,.json" hidden>
          </div>
          <h3>PIN</h3>
          <p class="nota">${pin ? "Hay un PIN configurado (sirve para todos los jugadores)." : "Ahora se entra resolviendo una multiplicación. Puedes poner un PIN de 4 a 6 cifras."} Es una barrera sencilla, no una protección de seguridad.</p>
          <div class="fila-botones">
            <input id="pin-nuevo" class="campo campo-corto" type="password" inputmode="numeric" maxlength="6" placeholder="Nuevo PIN" autocomplete="new-password">
            <button type="button" class="btn btn-gris" data-accion="guardar-pin">Guardar PIN</button>
            ${pin ? `<button type="button" class="btn btn-gris" data-accion="quitar-pin">Quitar PIN</button>` : ""}
          </div>
          <h3>Borrar</h3>
          <p class="nota">Borra el progreso de <b>${esc(P.apodo || "este jugador")}</b> (los demás no se tocan). No se puede deshacer.</p>
          <button type="button" class="btn btn-peligro" data-accion="reiniciar">🗑️ Borrar este jugador</button>
        </section>
        <p class="nota centro">Sin publicidad, sin compras y sin enviar datos a ningún servidor.</p>
      </main></div>`, pantallaAdultos);
    document.getElementById("importar").addEventListener("change", importar);
  }
  function recomendacionTexto() {
    const abiertas = habsAbiertas();
    const total = Object.values(P.habilidades).reduce((s, h) => s + h.intentos, 0);
    const pend = PV.banco.filter(e => P.items[e.id] && P.items[e.id].enRefuerzo).length;
    if (!total) return "Todavía no hay práctica registrada. Lo ideal es una lección corta (5-8 minutos) al día.";
    const cand = abiertas.filter(h => P.habilidades[h] && P.habilidades[h].ultimas.length >= 5).map(h => ({ h, p: M.precisionReciente(P, h) })).sort((a, b) => a.p - b.p);
    let t;
    if (cand.length && cand[0].p < 0.85) t = `Para los próximos días: una o dos lecciones al día de <b>${PV.HABILIDADES[cand[0].h].nombre}</b>, donde el porcentaje de aciertos reciente es más bajo (${Math.round(cand[0].p * 100)} %). `;
    else t = "Buen ritmo. Mantener lecciones cortas y frecuentes ayuda a consolidar. ";
    if (pend) t += `Hay ${pend} ${pend === 1 ? "palabra" : "palabras"} en repaso: saldrán solas en las próximas lecciones. `;
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
      p.tipo = tipoInicio;
      p.mascota.nombre = (document.getElementById("nombre-mascota").value || "").trim().slice(0, 14);
      A.guardar(p); entrar(p);
    },
    "elegir-tipo": v => {
      tipoInicio = v;
      app.querySelectorAll(".tipo-jugador .tipo").forEach(b => { const on = b.dataset.valor === v; b.classList.toggle("elegido", on); b.setAttribute("aria-checked", on); });
    },
    "elegir-perfil": v => { const p = A.cargar(v); if (p) { A.activar(v); entrar(p); } },
    "nuevo-perfil": () => pantallaBienvenida(),
    "ver-perfiles": () => pantallaPerfiles(),
    "camino": () => { abierto = null; pantallaCamino(); },
    "nodo": v => { abierto = abierto === v ? null : v; sonar("toque"); pantallaCamino(true); },
    "empezar-leccion": v => iniciarLeccion(v),
    "elegir": v => { const r = sesion.cola[sesion.i]; if (r.respondido) return; r.sel = v; sonar("toque"); pantallaReto(); },
    "token": v => { const r = sesion.cola[sesion.i]; r.selToken = Number(v); sonar("toque"); pantallaReto(); },
    "ficha": v => { const r = sesion.cola[sesion.i]; const i = Number(v); if (r.respondido || r.usadas.includes(i) || r.usadas.length >= r.objetivo) return; r.usadas.push(i); sonar("toque"); pantallaReto(); },
    "quitar-ficha": v => { const r = sesion.cola[sesion.i]; if (r.respondido) return; r.usadas.splice(Number(v), 1); pantallaReto(); },
    "comprobar": () => comprobar(),
    "pista": () => { sesion.cola[sesion.i].pistaVista = true; sonar("toque"); pantallaReto(); },
    "seguir": () => siguiente(),
    "decidir": v => decidir(v),
    "salir-leccion": () => {
      // Confirmación dentro de la app (algunos navegadores bloquean los avisos del sistema).
      if (sesion && sesion.contestados > 0) {
        modal(`<h2>¿Salir de la lección?</h2><p class="nota">Lo que has respondido ya está guardado. Los premios se ganan al terminar la lección.</p>
          <div class="fila-botones"><button type="button" class="btn btn-verde" data-accion="cerrar" data-foco>Seguir jugando</button>
          <button type="button" class="btn btn-gris" data-accion="confirmar-salir">Salir</button></div>`);
        return;
      }
      sesion = null; pantallaCamino();
    },
    "confirmar-salir": () => { cerrarModal(); sesion = null; pantallaCamino(); },
    "expedicion": () => {
      const pu = R.puestos(P), cab = R.accesorio(pu.cabeza), mas = R.accesorio(pu.mascota);
      PV.expedicion.abrir({
        icono: R.animal(P.avatar.animal).icono, cabeza: cab ? cab.icono : null, mascota: mas ? mas.icono : "🐣",
        sonar, sonido: !!P.sonido, animaciones: animacionesOn(),
        estado: P.expedicion, guardarEstado: e => { P.expedicion = e; guardar(); },
        alCompletar: (id, premio) => { const r = R.completarExpedicion(P, id, premio); guardar(); return r; },
        alSalir: () => pantallaCamino()
      });
    },
    "ir-coleccion": v => pantallaColeccion(v || pestana),
    "elegir-animal": v => { P.avatar.animal = v; guardar(); pantallaColeccion(); },
    "equipar": v => { if (R.alternar(P, v)) { guardar(); sonar("toque"); pantallaColeccion(); } },
    "quitar-todo": () => { R.quitarTodo(P); guardar(); pantallaColeccion(); },
    "guardar-nombre-mascota": () => { P.mascota.nombre = (document.getElementById("nuevo-nombre-mascota").value || "").trim().slice(0, 14); guardar(); aviso("¡Nombre guardado!"); pantallaColeccion(); },
    "comprar": v => { if (R.comprar(P, v)) { guardar(); pantallaColeccion(); celebrarCompra(R.accesorio(v)); } },
    "ajustes": () => pantallaAjustes(),
    "guardar-apodo": () => { P.apodo = (document.getElementById("nuevo-apodo").value || "").trim().slice(0, 16); guardar(); aviso("Apodo guardado."); pantallaAjustes(); },
    "sonido": () => { P.sonido = !P.sonido; guardar(); pantallaAjustes(); },
    "seis-siete": () => { P.seisSiete = !seisSieteActivoAjuste(); guardar(); pantallaAjustes(); if (seisSieteActivo()) seisSiete(); },
    "animaciones": () => { P.reducirAnimaciones = !P.reducirAnimaciones; guardar(); aplicarAjustes(); pantallaAjustes(); },
    "adultos": () => abrirAdultos(),
    "comprobar-adulto": () => comprobarAdulto(),
    "cerrar": () => cerrarModal(),
    "exportar": () => A.exportar(P),
    "guardar-pin": () => {
      const v = (document.getElementById("pin-nuevo").value || "").trim();
      if (!/^\d{4,6}$/.test(v)) { alert("El PIN debe tener entre 4 y 6 cifras."); return; }
      A.ponerPin(v); P.pin = null; guardar(); aviso("PIN guardado."); pantallaAdultos();
    },
    "probar-expedicion": () => { mostrarExpedicion(!expedicionAdultos()); pantallaAdultos(); aviso(expedicionAdultos() ? "Expedición visible también para adultos." : "Expedición solo para niños."); },
    "quitar-pin": () => { A.ponerPin(null); P.pin = null; guardar(); aviso("PIN quitado."); pantallaAdultos(); },
    "reiniciar": () => {
      if (!confirm(`¿Borrar todo el progreso de ${P.apodo || "este jugador"}?`)) return;
      if (!confirm("Esta acción no se puede deshacer. ¿Seguro?")) return;
      A.borrar(P.id); P = null; sesion = null; arrancar();
    }
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-accion]");
    if (!b || b.disabled) return;
    const f = ACCIONES[b.dataset.accion];
    if (f) { e.preventDefault(); f(b.dataset.valor, b); }
  });
  // Teclado (ordenador): números para elegir, Intro para comprobar o continuar.
  document.addEventListener("keydown", e => {
    if (!capa.hidden) {
      if (e.key === "Escape") cerrarModal();
      if (e.key === "Enter" && e.target.id === "clave") comprobarAdulto();
      return;
    }
    if (e.target.matches && e.target.matches("input")) {
      if (e.key === "Enter") { const b = e.target.closest(".fila-campo, .tarjeta"); const btn = b && b.querySelector(".btn"); if (btn) btn.click(); }
      return;
    }
    if (!sesion || !app.querySelector(".leccion")) return;
    if (e.key === "Escape") { ACCIONES["salir-leccion"](); return; }
    if (e.key === "Enter") {
      const b = app.querySelector("[data-accion=seguir]") || app.querySelector("[data-accion=comprobar]:not([disabled])");
      if (b) { e.preventDefault(); b.click(); }
    } else if (/^[1-9]$/.test(e.key)) {
      const ops = app.querySelectorAll(".opcion:not([disabled]), .ficha:not([disabled]), .decision-opcion");
      const b = ops[Number(e.key) - 1]; if (b) b.click();
    }
  });
  capa.addEventListener("click", e => { if (e.target === capa) cerrarModal(); });

  /* ---------- Arranque ---------- */
  function arrancar() {
    crearFondo();
    const lista = A.perfiles();
    if (!lista.length) return pantallaBienvenida();
    if (lista.length > 1) return pantallaPerfiles();
    const p = A.cargar(lista[0].id);
    if (p) { A.activar(p.id); entrar(p); } else pantallaBienvenida();
  }
  arrancar();
})();
