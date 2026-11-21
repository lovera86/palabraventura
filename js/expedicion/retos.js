/* Palabraventura · La Gran Expedición · motor de retos lingüísticos.
   Cada reto es un dato con su «tipo»; este archivo pinta el panel, valida, da pistas y avisa al acertar.
   No sabe nada del escenario: quien lo abre decide la consecuencia (abrir una puerta, encender una luz…).

   Tipos:
   - elegir     (adivinanzas, relaciones, letra que falta, corrección): una o varias «rondas» con estímulo y opciones.
                ronda = { estimulo: { texto, imagen }, opciones: [...], respuesta, pista?, explicacion? }
   - frase      ordenar palabras para formar una frase: { palabras: ["La", "cabra", …], pista?, imagen? }
   - memoria    encontrar parejas (emoji y palabra): { parejas: [["🐶", "perro"], …] }
   - clasificar repartir elementos en categorías: { categorias: [{ id, nombre, icono }], elementos: [{ texto, cat, porque? }] }
   Comunes: enunciado, intro (explicación breve la primera vez), boton (texto del botón final), exito (frase final).

   Uso: const r = PV.retos.abrir(reto, { mostrarPanel, esc, sonar, hablar, alResolver, alSalir });
        y los clics con data-ex="rt" data-a="…" se mandan a r.accion(nombre, boton). */
PV.retos = (function () {
  function mezclar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
    return a;
  }
  const NOMBRE = { elegir: "Elige la respuesta", frase: "Ordena la frase", memoria: "Encuentra las parejas", clasificar: "Clasifica" };

  function abrir(reto, h) {
    const esc = h.esc;
    const sonar = n => h.sonar && h.sonar(n);
    let estado;

    function botonesPie(extra) {
      return `<div class="ex-r-botones">${extra || ""}<button type="button" class="btn btn-gris ex-rt-salir" data-ex="rt" data-a="salir">↩ Salir del reto</button></div>`;
    }
    function cabecera() {
      return `<p class="ex-r-enunciado">${esc(reto.enunciado || NOMBRE[reto.tipo] || "")}</p>`;
    }
    function exito() {
      estado.hecho = true;
      clearTimeout(estado.temporizador);
      sonar("fin");
      if (reto.decir) h.hablar && h.hablar(reto.decir);
      h.mostrarPanel(`<div class="ex-icono-grande ex-meta-icono">✨</div>
        <p class="ex-r-msg bien" role="status">${esc(reto.exito || "¡Muy bien! ¡Reto superado!")}</p>
        <button type="button" class="btn btn-verde" data-ex="rt" data-a="resolver" data-foco>${esc(reto.boton || "¡ADELANTE!")}</button>`, "ancha");
    }

    /* ---------- elegir ---------- */
    function pintarElegir() {
      const r = estado.rondas[estado.k];
      const total = estado.rondas.length;
      const puntos = total > 1 ? `<div class="ex-rt-puntos">${estado.rondas.map((_, i) => `<span class="${i < estado.k ? "hecho" : i === estado.k ? "actual" : ""}"></span>`).join("")}</div>` : "";
      const est = r.estimulo || {};
      h.mostrarPanel(`${cabecera()}${puntos}
        <div class="ex-rt-estimulo">${est.imagen ? `<span class="ex-rt-imagen">${est.imagen}</span>` : ""}${est.texto ? `<span>${esc(est.texto)}</span>` : ""}</div>
        <div class="ex-opciones">${estado.opciones.map((o, i) => `<button type="button" class="ex-opcion ${estado.marcas[i] || ""}" data-ex="rt" data-a="opcion" data-i="${i}"
          ${estado.marcas[i] === "mal" || estado.bloqueado ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>
        <p class="ex-r-msg ${estado.msgClase}" role="status">${esc(estado.msg)}</p>
        ${estado.listo ? `<button type="button" class="btn btn-verde" data-ex="rt" data-a="siguiente" data-foco>${estado.k + 1 < total ? "➜ SIGUIENTE" : "➜ ¡HECHO!"}</button>` : ""}
        ${botonesPie()}`, "ancha");
    }
    function avanzar() {
      if (!estado || estado.hecho || !estado.listo) return;
      clearTimeout(estado.temporizador);
      estado.listo = false;
      estado.k++;
      if (estado.k >= estado.rondas.length) exito(); else nuevaRonda();
    }
    function nuevaRonda() {
      const r = estado.rondas[estado.k];
      estado.opciones = mezclar(r.opciones); estado.marcas = {}; estado.msg = ""; estado.msgClase = ""; estado.bloqueado = false; estado.listo = false;
      pintarElegir();
    }
    function opcion(i) {
      const r = estado.rondas[estado.k];
      if (estado.bloqueado) return;
      if (estado.opciones[i] === r.respuesta) {
        estado.marcas[i] = "bien"; estado.bloqueado = true; estado.listo = true;
        estado.msg = r.explicacion ? `¡Eso es! ${r.explicacion}` : "¡Eso es!"; estado.msgClase = "bien";
        sonar("letra");
        pintarElegir();
        const k = estado.k;
        estado.temporizador = setTimeout(() => { if (estado && estado.k === k && !fuera) avanzar(); }, r.explicacion ? 3500 : 2200);
      } else {
        estado.marcas[i] = "mal"; estado.fallos++;
        estado.msg = r.pista ? `Casi… Pista: ${r.pista}` : "Casi… ¡prueba otra!"; estado.msgClase = "mal";
        sonar("fallo");
        pintarElegir();
      }
    }

    /* ---------- frase ---------- */
    function pintarFrase() {
      const usadas = new Set(estado.huecos.filter(x => x !== null));
      const huecos = estado.huecos.map((id, i) => {
        const f = id === null ? null : estado.fichas[id];
        return `<button type="button" class="ex-rt-palabra hueco ${f ? "llena" : ""} ${estado.msgClase}" data-ex="rt" data-a="quitar" data-i="${i}">${f ? esc(f) : "&nbsp;"}</button>`;
      }).join("");
      const banco = estado.fichas.map((f, i) => usadas.has(i)
        ? `<button type="button" class="ex-rt-palabra" disabled aria-hidden="true">${esc(f)}</button>`
        : `<button type="button" class="ex-rt-palabra" data-ex="rt" data-a="poner" data-i="${i}">${esc(f)}</button>`).join("");
      const pista = estado.fallos >= 2 && reto.pista ? `<button type="button" class="btn btn-gris" data-ex="rt" data-a="pista">💡 Pista</button>` : "";
      h.mostrarPanel(`${cabecera()}
        ${reto.imagen ? `<div class="ex-rt-estimulo"><span class="ex-rt-imagen">${reto.imagen}</span></div>` : ""}
        <div class="ex-rt-frase">${huecos}</div>
        <p class="ex-r-msg ${estado.msgClase}" role="status">${esc(estado.msg)}</p>
        <div class="ex-rt-frase banco">${banco}</div>
        ${botonesPie(pista)}`, "ancha");
    }
    function poner(i) {
      if (estado.huecos.includes(i)) return;
      const libre = estado.huecos.indexOf(null);
      if (libre < 0) return;
      estado.huecos[libre] = i; estado.msg = ""; estado.msgClase = "";
      sonar("toque");
      if (!estado.huecos.includes(null)) {
        const frase = estado.huecos.map(k => estado.fichas[k]).join(" ");
        if (frase === reto.palabras.join(" ")) return exito();
        estado.fallos++;
        estado.msg = estado.fallos >= 2 && reto.pista ? "Casi… Toca 💡 Pista si la necesitas." : "Casi… Toca una palabra de arriba para quitarla y prueba otro orden.";
        estado.msgClase = "mal";
        sonar("fallo");
      }
      pintarFrase();
    }
    function quitar(i) {
      if (estado.huecos[i] === null || estado.fijos.has(i)) return;
      estado.huecos[i] = null; estado.msg = ""; estado.msgClase = "";
      pintarFrase();
    }
    function pistaFrase() {
      // Coloca la primera palabra que falte en su sitio y la deja fija.
      const k = estado.huecos.findIndex((id, i) => id === null || estado.fichas[id] !== reto.palabras[i]);
      if (k < 0) return;
      const id = estado.fichas.findIndex((f, i) => f === reto.palabras[k] && !(estado.huecos.includes(i) && estado.fijos.has(estado.huecos.indexOf(i))));
      const donde = estado.huecos.indexOf(id);
      if (donde >= 0) estado.huecos[donde] = null;
      estado.huecos[k] = id; estado.fijos.add(k);
      estado.msg = `💡 ${reto.pista}`; estado.msgClase = "";
      pintarFrase();
    }

    /* ---------- memoria ---------- */
    function pintarMemoria() {
      h.mostrarPanel(`${cabecera()}
        <div class="ex-rt-memoria" style="--c:${Math.min(6, Math.ceil(estado.cartas.length / 2))}">${estado.cartas.map((c, i) => {
          const vista = c.hecha || estado.abiertas.includes(i);
          return `<button type="button" class="ex-rt-carta ${vista ? "vista" : ""} ${c.hecha ? "hecha" : ""}" data-ex="rt" data-a="carta" data-i="${i}"
            aria-label="${vista ? esc(c.texto) : "Carta boca abajo"}" ${c.hecha ? "disabled" : ""}>${vista ? esc(c.texto) : "❓"}</button>`;
        }).join("")}</div>
        <p class="ex-r-msg ${estado.msgClase}" role="status">${esc(estado.msg)}</p>
        ${botonesPie()}`, "ancha");
    }
    function carta(i) {
      const c = estado.cartas[i];
      if (estado.bloqueado || c.hecha || estado.abiertas.includes(i)) return;
      estado.abiertas.push(i); sonar("toque");
      if (estado.abiertas.length === 2) {
        const [a, b] = estado.abiertas.map(k => estado.cartas[k]);
        if (a.par === b.par) {
          a.hecha = b.hecha = true; estado.abiertas = [];
          estado.msg = "¡Pareja! ✨"; estado.msgClase = "bien"; sonar("letra");
          if (estado.cartas.every(x => x.hecha)) { estado.hecho = true; pintarMemoria(); return setTimeout(() => { if (estado && !fuera) exito(); }, 700); }
        } else {
          estado.bloqueado = true; estado.msg = "No son pareja. ¡Recuerda dónde estaban!"; estado.msgClase = "";
          setTimeout(() => { if (!estado) return; estado.abiertas = []; estado.bloqueado = false; if (!fuera) pintarMemoria(); }, 1100);
        }
      }
      pintarMemoria();
    }

    /* ---------- clasificar ---------- */
    function pintarClasificar() {
      const e = estado.elementos[estado.k];
      h.mostrarPanel(`${cabecera()}
        <div class="ex-rt-puntos">${estado.elementos.map((_, i) => `<span class="${i < estado.k ? "hecho" : i === estado.k ? "actual" : ""}"></span>`).join("")}</div>
        <div class="ex-rt-estimulo"><span class="ex-rt-elemento">${esc(e.texto)}</span></div>
        <div class="ex-opciones">${reto.categorias.map(c => `<button type="button" class="ex-opcion ex-rt-cesta ${estado.marcas[c.id] || ""}" data-ex="rt" data-a="cesta" data-i="${c.id}"
          ${estado.bloqueado ? "disabled" : ""}><span>${c.icono}</span> ${esc(c.nombre)}</button>`).join("")}</div>
        <p class="ex-r-msg ${estado.msgClase}" role="status">${esc(estado.msg)}</p>
        ${botonesPie()}`, "ancha");
    }
    function cesta(id) {
      const e = estado.elementos[estado.k];
      if (estado.bloqueado) return;
      if (id === e.cat) {
        estado.marcas = { [id]: "bien" }; estado.bloqueado = true; estado.msg = "¡Bien! ✨"; estado.msgClase = "bien"; sonar("letra");
        pintarClasificar();
        setTimeout(() => {
          if (!estado || estado.hecho) return;
          estado.k++; estado.marcas = {}; estado.msg = ""; estado.msgClase = ""; estado.bloqueado = false;
          if (estado.k >= estado.elementos.length) { estado.hecho = true; if (!fuera) exito(); } else if (!fuera) pintarClasificar();
        }, 700);
      } else {
        estado.marcas = { [id]: "mal" }; estado.msg = e.porque ? `Casi… ${e.porque}` : "Casi… ¡prueba la otra!"; estado.msgClase = "mal"; sonar("fallo");
        pintarClasificar();
      }
    }

    /* ---------- arranque ---------- */
    function empezar() {
      estado = { k: 0, msg: "", msgClase: "", fallos: 0, marcas: {}, bloqueado: false, hecho: false };
      if (reto.tipo === "elegir") { estado.rondas = reto.rondas; nuevaRonda(); }
      else if (reto.tipo === "frase") {
        estado.fichas = mezclar(reto.palabras);
        while (estado.fichas.join(" ") === reto.palabras.join(" ") && reto.palabras.length > 1) estado.fichas = mezclar(reto.palabras);
        estado.huecos = Array(reto.palabras.length).fill(null); estado.fijos = new Set();
        pintarFrase();
      } else if (reto.tipo === "memoria") {
        estado.cartas = mezclar(reto.parejas.flatMap((p, k) => [{ texto: p[0], par: k }, { texto: p[1], par: k }]));
        estado.abiertas = [];
        pintarMemoria();
      } else if (reto.tipo === "clasificar") { estado.elementos = mezclar(reto.elementos); pintarClasificar(); }
    }
    let fuera = false, terminado = false;
    function accion(a, b) {
      if (!estado) return;
      const i = b && b.dataset.i !== undefined ? b.dataset.i : null;
      // Salir no borra lo hecho: al volver se sigue en el mismo punto.
      if (a === "salir") { fuera = true; clearTimeout(estado.temporizador); return h.alSalir && h.alSalir(); }
      if (a === "resolver") { terminado = true; estado = null; return h.alResolver && h.alResolver(); }
      if (a === "siguiente") return avanzar();
      if (estado.hecho) return;
      if (a === "opcion") opcion(Number(i));
      else if (a === "poner") poner(Number(i));
      else if (a === "quitar") quitar(Number(i));
      else if (a === "pista") pistaFrase();
      else if (a === "carta") carta(Number(i));
      else if (a === "cesta") cesta(i);
    }
    // Volver a abrir un reto que se dejó a medias: se pinta tal como estaba.
    function reabrir() {
      fuera = false;
      if (!estado || !estado.rondas && !estado.fichas && !estado.cartas && !estado.elementos) return empezar();
      if (estado.hecho) return exito();
      if (reto.tipo === "elegir") { if (estado.listo) avanzar(); else pintarElegir(); }
      else if (reto.tipo === "frase") pintarFrase();
      else if (reto.tipo === "memoria") { estado.abiertas = []; estado.bloqueado = false; pintarMemoria(); }
      else if (reto.tipo === "clasificar") pintarClasificar();
    }
    const control = { accion, reabrir, get activo() { return !!estado; }, get terminado() { return terminado; } };
    if (reto.intro && !h.introVista) {
      estado = { hecho: false };
      h.mostrarPanel(`<div class="ex-icono-grande">${reto.icono || "🧩"}</div>
        <h2>${esc(NOMBRE[reto.tipo] || "Reto")}</h2><p>${esc(reto.intro)}</p>
        <button type="button" class="btn btn-verde" data-ex="rt" data-a="empezar" data-foco>¡EMPEZAR!</button>`, "ancha");
      control.accion = (a, b) => { if (a === "empezar") { h.introLeida && h.introLeida(); empezar(); } else accion(a, b); };
      return control;
    }
    empezar();
    return control;
  }

  return { abrir, mezclar };
})();
