/* Palabraventura · La expedición de las palabras perdidas · motor 2D.
   Canvas 2D sin dependencias: física con paso fijo, colisiones de cajas, cámara lateral, dibujo con emojis
   (pintados una vez en lienzos pequeños y reutilizados) y entrada táctil multitoque con Pointer Events.
   Los obstáculos (río, acantilado, puerta) se superan formando una palabra; al resolverlos se anima su
   solución (puente, hielo, barca o balsa, escalera, puerta que se abre). Los jefes son obstáculos que se
   vencen en una batalla de palabras.
   Personajes: Borrones (enemigos que pasean; si tocan al jugador le quitan una letra, y si les salta encima
   se convierten en mariposas: nadie muere) y amiguitos (piden ayuda con una palabra y regalan un poder:
   doble salto, imán de letras o escudo).
   Nada de este archivo toca el resto de la app: recibe un nivel y un lienzo y avisa con eventos. */
PV.expedicionMotor = (function () {
  const ALTO = 360;                 // alto lógico del mundo que siempre se ve entero
  const PASO = 1 / 120;             // paso fijo de la física
  const FIS = {
    gravedad: 2300, salto: 840, corte: 0.55, minSalto: 0.1,   // corte: velocidad que queda al soltar el salto antes de tiempo
    vel: 270, acel: 2600, frenado: 3200, aire: 0.7,
    coyote: 0.1, buffer: 0.14, maxCaida: 1100
  };
  const DURACION_SOLUCION = 1.8;    // segundos que tarda en aparecer la solución de un obstáculo
  const VEL_BARCA = 110;
  const FUENTE_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
  const FUENTE_LETRA = "900 25px Nunito, 'Segoe UI', system-ui, sans-serif";
  const TEMA = {
    cielo: ["#bfe7ff", "#eaf8ff"], colinas: ["#cfeccf", "#a9dca8"], tierra: "#c98c5a", tierraOsc: "#b27748",
    hierba: "#6cc070", hierbaOsc: "#4ea457", plataforma: "#8a5a35", agua: ["#4fb3e8", "#3a9bd3"]
  };

  /* ---------- Emojis en caché (dibujar texto en cada fotograma es caro en móviles) ---------- */
  const cache = new Map();
  function sprite(txt, px) {
    px = Math.max(8, Math.round(px));
    const k = txt + "|" + px;
    let c = cache.get(k);
    if (!c) {
      c = document.createElement("canvas");
      const s = Math.ceil(px * 1.35);
      c.width = c.height = s;
      const g = c.getContext("2d");
      g.font = `${px}px ${FUENTE_EMOJI}`;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(txt, s / 2, s / 2 + px * 0.05);
      cache.set(k, c);
    }
    return c;
  }

  function acercar(v, objetivo, d) { return v < objetivo ? Math.min(v + d, objetivo) : Math.max(v - d, objetivo); }
  function solapan(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  /* ---------- Partida ---------- */
  function crear(lienzo, nivel, op) {
    op = op || {};
    const ctx = lienzo.getContext("2d");
    const evento = op.alEvento || function () {};
    const animado = op.animaciones !== false;
    const tema = Object.assign({}, TEMA, nivel.tema || {});
    const entrada = { eje: 0, ejeTeclado: 0, saltoPulsado: false, saltoMantenido: false };
    const j = { x: 0, y: 0, w: 38, h: 46, vx: 0, vy: 0, suelo: true, mira: 1, coyote: 0, buffer: 0, cortado: false, tSalto: 0,
      t: 0, aterriza: 0, seguroX: 0, seguroY: 0, parpadeo: 0, recorrido: 0, sobre: null };
    const vista = { escala: 1, dpr: 1, ancho: 640, alto: ALTO, camX: 0, camY: 0 };
    let corriendo = false, raf = 0, ultimo = 0, acum = 0, tiempo = 0, destruido = false;
    const RADIO_LETRA = 44;
    const meta = nivel.meta ? { x: nivel.meta.x, y: nivel.meta.y || 300 } : null;
    const copos = nivel.tema && nivel.tema.nieve ? Array.from({ length: 46 }, (_, i) => ({ x: (i * 97) % 1000, y: (i * 61) % 360, v: 18 + (i % 5) * 7, r: 1.5 + (i % 3) })) : [];

    // Estado de la partida (copias propias: no se tocan los datos del nivel, así se puede volver a jugar).
    let solidos = [], obs = [], letras = [], enMeta = false, orden = 0;
    let enemigos = [], amigos = [], congelado = false, foco = null;
    const poderes = { dobleSalto: false, iman: false, escudo: false };
    const chispas = [], rayos = [];
    // Mascota: sigue el rastro del jugador con un poco de retraso, flotando (no choca con nada, así nunca se atasca).
    const m = { x: 0, y: 0, mira: 1, fiesta: 0, quieto: 0, t: 0 };
    const rastro = [];

    function preparar() {
      Object.assign(j, { x: nivel.inicio.x, vx: 0, vy: 0, suelo: true, mira: 1, coyote: 0, buffer: 0, cortado: false, tSalto: 0,
        aterriza: 0, parpadeo: 0, sobre: null, dobleUsado: false });
      poderes.dobleSalto = poderes.iman = poderes.escudo = false;
      congelado = false; foco = null; rayos.length = 0;
      enemigos = (nivel.enemigos || []).map(e => ({ x: e.desde + (e.hasta - e.desde) / 2, desde: e.desde, hasta: e.hasta, w: 40, h: 34,
        dir: e.dir || 1, vel: e.vel || 55, estado: "anda", t: 0 }));
      amigos = (nivel.amigos || []).map((a, i) => Object.assign({ i, ayudado: false, cerca: false }, a));
      j.y = alturaSuelo(j.x) - j.h; j.seguroX = j.x; j.seguroY = j.y;
      solidos = nivel.solidos.map(s => Object.assign({}, s));
      obs = (nivel.obstaculos || []).map((o, i) => {
        const e = Object.assign({}, o, { i, resuelto: false, animando: false, p: 0, cerca: false, solidos: [] });
        if (o.tipo === "rio") e.barrera = { x: o.x - 10, y: -600, w: 10, h: 900, invisible: true };
        if (o.tipo === "jefe") {
          e.barrera = { x: o.x - 70, y: -600, w: 10, h: 900, invisible: true };
          e.vida = o.vida || 3; e.golpe = 0; e.risa = 0;
        }
        if (o.tipo === "puerta") {
          e.barrera = { x: o.x, y: -600, w: 44, h: 900, invisible: true };
          solidos.push({ x: o.x - 16, y: -600, w: 76, h: 600 + 170, invisible: true });     // roca sobre la puerta
        }
        if (e.barrera) solidos.push(e.barrera);
        e.disparo = (o.tipo === "rio" ? o.x - 10 : o.tipo === "jefe" ? o.x - 70 : o.x) - 6;
        return e;
      });
      letras = (nivel.letras || []).map((l, i) => Object.assign({ i, o: 0, cogida: false, orden: 0 }, l));
      enMeta = false; orden = 0;
      chispas.length = 0; rastro.length = 0;
      Object.assign(m, { x: j.x - 46, y: j.y + j.h - 34, fiesta: 0, quieto: 0 });
    }
    function alturaSuelo(x) {
      let y = 300;
      for (const s of nivel.solidos) if (s.tipo === "suelo" && x >= s.x && x < s.x + s.w) y = Math.min(y, s.y);
      return y;
    }

    function medir() {
      const r = lienzo.getBoundingClientRect();
      if (!r.width || !r.height) return;
      vista.dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Se ve siempre el alto completo; en vertical se limita el zoom para no ver un trozo diminuto del mundo.
      // En pantallas grandes se ve más mundo (al menos ~900 de ancho) en lugar de ampliarlo todo.
      vista.escala = Math.min(r.height / ALTO, r.width / 400, Math.max(r.width / 900, 1.2));
      vista.ancho = r.width / vista.escala;
      vista.alto = r.height / vista.escala;
      // Si sobra alto (móvil en vertical), se ve más cielo y el suelo sube para que los controles
      // queden debajo, sobre la tierra, sin tapar al personaje.
      const sobra = vista.alto - ALTO, hueco = op.tactil === false ? 60 : 180 / vista.escala;
      vista.camY = -sobra + Math.max(0, Math.min(sobra, hueco - 60));
      lienzo.width = Math.round(r.width * vista.dpr);
      lienzo.height = Math.round(r.height * vista.dpr);
      cache.clear();
      colocarCamara(true);
      dibujar();
    }

    /* ---------- Física ---------- */
    function actualizar(dt) {
      tiempo += dt; j.t += dt;
      const eje = congelado ? 0 : (entrada.eje || entrada.ejeTeclado);
      if (congelado) entrada.saltoPulsado = false;
      const objetivo = eje * FIS.vel;
      const acelerando = objetivo !== 0 && Math.sign(objetivo) === Math.sign(j.vx || objetivo) && Math.abs(objetivo) >= Math.abs(j.vx);
      j.vx = acercar(j.vx, objetivo, (acelerando ? FIS.acel : FIS.frenado) * (j.suelo ? 1 : FIS.aire) * dt);
      if (eje) j.mira = eje > 0 ? 1 : -1;

      if (entrada.saltoPulsado) { j.buffer = FIS.buffer; entrada.saltoPulsado = false; } else j.buffer -= dt;
      j.coyote = j.suelo ? FIS.coyote : j.coyote - dt;
      if (j.buffer > 0 && j.coyote > 0) {
        j.vy = -FIS.salto; j.buffer = 0; j.coyote = 0; j.suelo = false; j.cortado = false; j.tSalto = 0;
        evento("salto");
      } else if (j.buffer > 0 && poderes.dobleSalto && !j.suelo && !j.dobleUsado) {
        // Poder de un amiguito: un segundo salto en el aire.
        j.vy = -FIS.salto * 0.85; j.buffer = 0; j.dobleUsado = true; j.cortado = false; j.tSalto = 0;
        for (let k = 0; k < 8; k++) chispas.push({ x: j.x + j.w / 2, y: j.y + j.h, vx: (k - 3.5) * 40, vy: 60, vida: 0.4 });
        evento("salto");
      }
      // Salto variable: soltar pronto da un salto más bajo, pero un toque rápido siempre llega a las plataformas.
      j.tSalto += dt;
      if (!entrada.saltoMantenido && !j.cortado && j.tSalto > FIS.minSalto && j.vy < -FIS.salto * FIS.corte) { j.vy = -FIS.salto * FIS.corte; j.cortado = true; }
      j.vy = Math.min(j.vy + FIS.gravedad * dt, FIS.maxCaida);

      const x0 = j.x;
      j.x += j.vx * dt;
      j.x = Math.max(nivel.limites[0], Math.min(nivel.limites[1] - j.w, j.x));
      for (const s of solidos) {
        if (!solapan(j, s)) continue;
        if (j.x > x0 || (j.x === x0 && j.vx > 0)) j.x = s.x - j.w; else j.x = s.x + s.w;
        j.vx = 0;
      }
      j.recorrido += Math.abs(j.x - x0);

      const pie0 = j.y + j.h, estabaEnSuelo = j.suelo, vyAntes = j.vy;
      j.y += j.vy * dt;
      j.suelo = false; j.sobre = null;
      for (const s of solidos) {
        if (!solapan(j, s)) continue;
        if (j.vy > 0) { j.y = s.y - j.h; j.vy = 0; j.suelo = true; j.sobre = s; }
        else if (j.vy < 0) { j.y = s.y + s.h; j.vy = 0; }
      }
      if (j.vy >= 0) {
        for (const p of nivel.plataformas) {
          const pie = j.y + j.h;
          if (pie0 <= p.y + 0.5 && pie >= p.y && j.x + j.w > p.x + 4 && j.x < p.x + p.w - 4) { j.y = p.y - j.h; j.vy = 0; j.suelo = true; j.sobre = p; }
        }
      }
      if (j.suelo && !estabaEnSuelo) { j.aterriza = 1; evento("aterriza", { fuerza: Math.min(1, vyAntes / 900) }); }
      // El último sitio seguro es suelo firme (nunca una barca en marcha).
      if (j.suelo && !(j.sobre && j.sobre.movil)) { j.seguroX = j.x; j.seguroY = j.y; }
      if (j.suelo) j.dobleUsado = false;
      j.aterriza = Math.max(0, j.aterriza - dt * 5);

      // Caerse no castiga: vuelve al último sitio seguro.
      if (j.y > ALTO + 240) { j.x = j.seguroX; j.y = j.seguroY - 4; j.vx = 0; j.vy = 0; j.parpadeo = 1.2; evento("reaparece"); }
      j.parpadeo = Math.max(0, j.parpadeo - dt);

      recogerLetras();
      actualizarEnemigos(dt);
      actualizarAmigos();
      for (let k = rayos.length - 1; k >= 0; k--) { rayos[k].t += dt * 1.8; if (rayos[k].t >= 1 + rayos[k].retraso) rayos.splice(k, 1); }
      for (let k = chispas.length - 1; k >= 0; k--) {
        const c = chispas[k];
        c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 500 * dt; c.vida -= dt;
        if (c.vida <= 0) chispas.splice(k, 1);
      }
      for (const o of obs) actualizarObstaculo(o, dt);
      if (meta && !enMeta && obs.every(o => o.resuelto) && j.x + j.w >= meta.x - 10) {
        enMeta = true; m.fiesta = 3;
        evento("meta");
      }
      actualizarMascota(dt);
      colocarCamara(false, dt);
    }

    // Letras: se recogen solas al pasar cerca, sin tener que pulsar nada.
    function recogerLetras() {
      const cx = j.x + j.w / 2, cy = j.y + j.h / 2;
      for (const l of letras) {
        if (l.cogida || Math.hypot(l.x - cx, l.y - cy) > (poderes.iman ? 120 : RADIO_LETRA)) continue;
        l.cogida = true; l.orden = ++orden;
        const delObs = letras.filter(x => x.o === l.o);
        const n = delObs.filter(x => x.cogida).length;
        m.fiesta = n === delObs.length ? 2.2 : 1;
        for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; chispas.push({ x: l.x, y: l.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160 - 80, vida: 0.7 }); }
        evento("letra", { letra: l.l, o: l.o, cogidas: n, total: delObs.length, pantalla: aPantalla(l.x, l.y) });
      }
    }
    /* ---------- Borrones ---------- */
    function actualizarEnemigos(dt) {
      for (let k = enemigos.length - 1; k >= 0; k--) {
        const e = enemigos[k];
        e.t += dt;
        if (e.estado === "vencido") { if (e.t > 1.6) enemigos.splice(k, 1); continue; }
        e.x += e.dir * e.vel * dt;
        if (e.x < e.desde) { e.x = e.desde; e.dir = 1; } else if (e.x + e.w > e.hasta) { e.x = e.hasta - e.w; e.dir = -1; }
        const suelo = alturaSuelo(e.x + e.w / 2);
        const caja = { x: e.x + 4, y: suelo - e.h, w: e.w - 8, h: e.h };
        if (!solapan(j, caja) || congelado) continue;
        const pieAntes = j.y + j.h - j.vy * PASO;
        if (j.vy > 0 && pieAntes <= caja.y + 12) {
          // ¡Salto encima! El Borrón se convierte en mariposa.
          e.estado = "vencido"; e.t = 0;
          j.vy = -560; j.cortado = true;
          for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2; chispas.push({ x: e.x + e.w / 2, y: suelo - 18, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150 - 60, vida: 0.6 }); }
          evento("enemigo", { pantalla: aPantalla(e.x + e.w / 2, suelo - 20) });
        } else if (j.parpadeo <= 0) {
          // Choque: empuja al jugador hacia atrás y, si no tiene escudo, le quita la última letra.
          j.vx = (j.x + j.w / 2 < e.x + e.w / 2 ? -1 : 1) * 320; j.vy = -380; j.suelo = false; j.parpadeo = 1.4;
          e.dir = j.x + j.w / 2 < e.x + e.w / 2 ? 1 : -1;
          if (poderes.escudo) { poderes.escudo = false; evento("escudo"); continue; }
          const o = obs.findIndex(x => !x.resuelto && totalLetras(x.i) > 0);
          const cogidas = letras.filter(l => l.o === o && l.cogida).sort((a, b) => b.orden - a.orden);
          if (cogidas.length) { cogidas[0].cogida = false; evento("robo", { letra: cogidas[0].l, o }); }
          else evento("robo", { letra: null, o });
        }
      }
    }
    /* ---------- Amiguitos ---------- */
    function actualizarAmigos() {
      const cx = j.x + j.w / 2;
      for (const a of amigos) {
        if (a.ayudado || congelado) continue;
        const d = Math.abs(cx - a.x);
        const aSuAltura = Math.abs(j.y + j.h - alturaSuelo(a.x)) < 24;   // no desde una plataforma de encima
        if (!a.cerca && d < 60 && j.suelo && aSuAltura) { a.cerca = true; evento("amigo", { i: a.i }); }
        else if (a.cerca && d > 160) a.cerca = false;
      }
    }
    function darPoder(tipo) { if (tipo in poderes) poderes[tipo] = true; m.fiesta = 2; }
    function ayudarAmigo(i) { const a = amigos[i]; if (a) { a.ayudado = true; m.fiesta = 2; } }
    /* ---------- Jefes ---------- */
    function golpearJefe(i) {
      const o = obs[i], base = alturaSuelo(o.x + 45);
      o.golpe = 1;
      const abc = "ABCDEFGHIJLMNOPRSTUV";
      for (let k = 0; k < 6; k++) rayos.push({ x0: j.x + j.w / 2, y0: j.y + 8, x1: o.x + 45, y1: base - 60, t: 0, retraso: k * 0.07, l: abc[Math.floor(Math.random() * abc.length)] });
    }
    function reirJefe(i) { obs[i].risa = 1.4; }
    function congelar(si, x) { congelado = !!si; foco = si && x !== undefined ? x : null; if (si) { j.vx = 0; entrada.saltoMantenido = false; } }

    function letrasDe(o) { return letras.filter(l => l.o === o && l.cogida).sort((a, b) => a.orden - b.orden).map(l => l.l); }
    function totalLetras(o) { return letras.filter(l => l.o === o).length; }

    function actualizarObstaculo(o, dt) {
      // Llegar al obstáculo: avisa una vez cada vez que se llega.
      if (!o.resuelto && !o.animando) {
        if (!o.cerca && j.x + j.w >= o.disparo && j.x < o.disparo + 60) {
          o.cerca = true;
          evento("obstaculo", { i: o.i, cogidas: letrasDe(o.i).length, total: totalLetras(o.i) });
        } else if (o.cerca && j.x + j.w < o.disparo - 120) o.cerca = false;
      }
      if (o.animando) {
        o.p = Math.min(1, o.p + dt / DURACION_SOLUCION);
        if (animado && Math.random() < dt * 30) {
          const zona = zonaSolucion(o);
          chispas.push({ x: zona.x + Math.random() * zona.w * o.p, y: zona.y, vx: (Math.random() - 0.5) * 120, vy: -120 - Math.random() * 160, vida: 0.6 });
        }
        if (o.p >= 1) terminarSolucion(o);
      }
      if (o.tipo === "jefe") { o.golpe = Math.max(0, o.golpe - dt * 2.5); o.risa = Math.max(0, o.risa - dt); }
      if (o.barca) moverBarca(o, dt);
    }
    function zonaSolucion(o) {
      if (o.tipo === "jefe") return { x: o.x, w: 90, y: alturaSuelo(o.x + 45) - 60 };
      if (o.tipo === "rio") return { x: o.x - 14, w: o.w + 28, y: 296 };
      if (o.tipo === "muro") return { x: o.x - 4 * 42, w: 4 * 42, y: 300 - (300 - o.arriba) * o.p };
      return { x: o.x, w: 44, y: 300 - 130 * o.p };
    }
    function quitarSolido(s) { const k = solidos.indexOf(s); if (k >= 0) solidos.splice(k, 1); }
    function terminarSolucion(o) {
      o.animando = false; o.resuelto = true;
      if (o.barrera) { quitarSolido(o.barrera); o.barrera = null; }
      if (o.tipo === "rio" && (o.solucion === "barca" || o.solucion === "balsa")) {
        const w = o.solucion === "barca" ? 120 : 110;
        const s = { x: o.x, y: 300, w, h: 16, invisible: true, movil: true };
        solidos.push(s);
        o.barca = { s, estado: "lista", destino: o.x + o.w - w };
        // Mientras la barca no ha zarpado, el borde derecho del agua sigue cerrado.
        o.tope = { x: o.x + w, y: -600, w: 8, h: 900, invisible: true };
        solidos.push(o.tope);
      } else if (o.tipo === "rio") {
        solidos.push({ x: o.x - 14, y: 300, w: o.w + 28, h: 14, invisible: true });
      } else if (o.tipo === "muro") {
        const n = 4, alto = 300 - o.arriba;
        let encima = null;
        for (let k = 1; k <= n; k++) {
          const y = 300 - k * alto / n;
          const s = { x: o.x - (n - k + 1) * 42, y, w: (n - k + 1) * 42, h: 300 - y, tipo: "escalon", invisible: true };
          solidos.push(s);
          if (solapan(j, s)) encima = encima === null ? s.y : Math.min(encima, s.y);
        }
        // Si el peldaño nace donde está el jugador, lo sube encima en lugar de dejarlo atrapado.
        if (encima !== null) { j.y = encima - j.h; j.vy = 0; }
      }
      m.fiesta = 2.2;
      evento("resuelto", { i: o.i });
    }
    // Barca y balsa: zarpan cuando el jugador sube y lo llevan hasta la otra orilla.
    function moverBarca(o, dt) {
      const b = o.barca, s = b.s;
      if (b.estado === "lista" && j.sobre === s && j.x >= s.x + 4) {
        b.estado = "navegando";
        if (o.tope) { quitarSolido(o.tope); o.tope = null; }
        evento("zarpa", { i: o.i });
      }
      if (b.estado !== "navegando") return;
      const dx = Math.min(VEL_BARCA * dt, b.destino - s.x);
      s.x += dx;
      if (j.sobre === s) j.x += dx;
      // Barandillas invisibles: durante la travesía no se puede caer al agua.
      if (j.x + j.w > s.x - 30 && j.x < s.x + s.w + 30) j.x = Math.max(s.x, Math.min(s.x + s.w - j.w, j.x));
      if (s.x >= b.destino - 0.01) { b.estado = "atracada"; evento("atraca", { i: o.i }); }
    }

    function actualizarMascota(dt) {
      m.t += dt;
      rastro.push({ x: j.x + j.w / 2, y: j.y + j.h, mira: j.mira });
      if (rastro.length > 40) rastro.shift();             // unos 0,3 s de retraso
      const r = rastro[0];
      const tx = r.x - r.mira * 46, ty = r.y - 34 + (animado ? Math.sin(m.t * 4) * 5 : 0);
      if (Math.hypot(tx - m.x, ty - m.y) > 420) { m.x = tx; m.y = ty; }   // nunca se queda lejos
      const k = 1 - Math.exp(-dt * 6);
      const dx = (tx - m.x) * k;
      m.x += dx; m.y += (ty - m.y) * k;
      if (Math.abs(dx) > 0.05) m.mira = dx > 0 ? 1 : -1;
      m.quieto = Math.abs(j.vx) < 5 && j.suelo ? m.quieto + dt : 0;
      m.fiesta = Math.max(0, m.fiesta - dt);
    }

    // Al resolver el reto de un obstáculo: su solución aparece poco a poco.
    function resolver(i) {
      const o = obs[i];
      if (!o || o.resuelto || o.animando) return;
      o.animando = true;
      o.p = animado ? 0 : 0.999;          // sin animaciones aparece casi de golpe
      m.fiesta = 1.5;
      dibujar();
    }

    // Volver a jugar: todo como al principio, sin crear otra partida.
    function reiniciar() { preparar(); colocarCamara(true); dibujar(); }

    function aPantalla(x, y) {
      const r = lienzo.getBoundingClientRect();
      return { x: r.left + (x - vista.camX) * vista.escala, y: r.top + (y - vista.camY) * vista.escala };
    }

    function colocarCamara(inmediata, dt) {
      // En una batalla, la cámara deja al jefe a la derecha para que el panel quepa a la izquierda.
      const centro = foco !== null ? foco - vista.ancho * 0.72 : j.x + j.w / 2 - vista.ancho * 0.42 + j.mira * 50;
      const objetivo = Math.max(0, Math.min(nivel.ancho - vista.ancho, centro));
      if (inmediata || nivel.ancho <= vista.ancho) vista.camX = nivel.ancho <= vista.ancho ? (nivel.ancho - vista.ancho) / 2 : objetivo;
      else vista.camX += (objetivo - vista.camX) * (1 - Math.exp(-dt * 5));
    }

    /* ---------- Dibujo ---------- */
    function emoji(txt, cx, base, tam, sx, sy, rot) {
      const px = tam * vista.escala * vista.dpr;
      const c = sprite(txt, px);
      const lado = tam * 1.35;
      ctx.save();
      ctx.translate(cx, base);
      if (rot) ctx.rotate(rot);
      ctx.scale(sx || 1, sy || 1);
      ctx.drawImage(c, -lado / 2, -lado * 0.88, lado, lado);
      ctx.restore();
    }
    function redondo(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function visible(x, w) { return x + w > vista.camX - 60 && x < vista.camX + vista.ancho + 60; }

    function colinas(factor, alturaBase, amp, periodo, color) {
      const off = vista.camX * factor;
      ctx.fillStyle = color;
      ctx.beginPath();
      const x0 = vista.camX - 20, x1 = vista.camX + vista.ancho + 20;
      ctx.moveTo(x0, ALTO);
      for (let x = x0; x <= x1; x += 16) {
        const wx = x - vista.camX + off;
        ctx.lineTo(x, alturaBase - amp * (0.6 * Math.sin(wx / periodo) + 0.4 * Math.sin(wx / (periodo * 0.47) + 1.3)));
      }
      ctx.lineTo(x1, ALTO);
      ctx.closePath();
      ctx.fill();
    }
    function techoCueva() {
      ctx.fillStyle = "#1c1730";
      const x0 = Math.floor((vista.camX - 40) / 36) * 36, x1 = vista.camX + vista.ancho + 40;
      ctx.fillRect(x0, vista.camY - 10, x1 - x0, 26 - vista.camY + 10);
      ctx.beginPath();
      for (let x = x0; x < x1; x += 36) {
        const largo = 14 + ((x / 36) % 4) * 9;
        ctx.moveTo(x, 16); ctx.lineTo(x + 18, 16 + largo); ctx.lineTo(x + 36, 16);
      }
      ctx.fill();
    }

    function bloque(s) {
      if (s.tipo === "suelo") {
        ctx.fillStyle = tema.tierra; ctx.fillRect(s.x, s.y, s.w, s.h + 400);
        ctx.fillStyle = tema.tierraOsc;
        for (let x = Math.floor(Math.max(s.x, vista.camX - 40) / 46) * 46; x < Math.min(s.x + s.w, vista.camX + vista.ancho + 40); x += 46) {
          for (let f = 0; f < (s.y < 300 ? 4 : 1); f++) { ctx.beginPath(); ctx.arc(x + 20 + f * 9, s.y + 34 + (x % 3) * 6 + f * 48, 4, 0, 6.3); ctx.fill(); }
        }
        ctx.fillStyle = tema.hierba; ctx.fillRect(s.x, s.y, s.w, 13);
        ctx.fillStyle = tema.hierbaOsc; ctx.fillRect(s.x, s.y + 13, s.w, 3);
        return;
      }
      const r = 10;
      ctx.fillStyle = s.tipo === "tocon" ? "#a8693d" : (tema.oscuro ? "#6f6488" : "#9aa3b2");
      redondo(s.x, s.y, s.w, s.h, r); ctx.fill();
      ctx.fillStyle = s.tipo === "tocon" ? "#e3b27a" : (tema.oscuro ? "#8c80a8" : "#b9c1cd");
      redondo(s.x + 4, s.y + 3, s.w - 8, 10, 5); ctx.fill();
    }
    function plataforma(p) {
      ctx.fillStyle = tema.plataforma; redondo(p.x, p.y, p.w, 20, 8); ctx.fill();
      ctx.fillStyle = tema.hierba; redondo(p.x - 2, p.y - 2, p.w + 4, 10, 5); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.18)";
      for (let x = p.x + 18; x < p.x + p.w - 10; x += 34) ctx.fillRect(x, p.y + 10, 3, 8);
    }

    function agua(o) {
      const arriba = 322, ola = animado ? tiempo * 3 : 0;
      ctx.fillStyle = tema.agua[0]; ctx.fillRect(o.x, arriba, o.w, 500);
      ctx.fillStyle = tema.agua[1]; ctx.fillRect(o.x, arriba + 24, o.w, 500);
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 3;
      for (let f = 0; f < 2; f++) {
        ctx.beginPath();
        for (let x = o.x; x <= o.x + o.w; x += 8) {
          const y = arriba + 6 + f * 18 + Math.sin(x / 18 + ola + f * 2) * 3;
          if (x === o.x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    function postes(o, color) {
      for (const px of [o.x - 14, o.x + o.w + 2]) {
        ctx.fillStyle = color || "#8a5a35"; redondo(px, 256, 12, 52, 4); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(px, 256, 12, 6);
      }
    }
    function silueta(o, curva) {
      ctx.setLineDash([10, 9]); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(o.x, 302); ctx.quadraticCurveTo(o.x + o.w / 2, 302 + curva, o.x + o.w, 302); ctx.stroke();
      ctx.setLineDash([]);
    }
    function dibujarRio(o) {
      if (!visible(o.x - 20, o.w + 40)) return;
      agua(o);
      const p = o.resuelto ? 1 : (o.animando ? o.p : 0);
      if (o.solucion === "puente") {
        if (!p) {
          ctx.strokeStyle = "#c9a26b"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(o.x - 6, 264); ctx.quadraticCurveTo(o.x + 12, 290, o.x + 16, 312); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(o.x + o.w + 6, 264); ctx.quadraticCurveTo(o.x + o.w - 12, 290, o.x + o.w - 16, 312); ctx.stroke();
          silueta(o, 20); postes(o); return;
        }
        // Tablones que caen uno a uno y barandillas de cuerda.
        const tablones = Math.ceil((o.w + 28) / 22);
        ctx.strokeStyle = "rgba(201,162,107," + Math.min(1, p * 1.6) + ")"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(o.x - 8, 262); ctx.quadraticCurveTo(o.x + o.w / 2, 282, o.x + o.w + 8, 262); ctx.stroke();
        for (let k = 0, x = o.x - 14; x < o.x + o.w + 14; x += 22, k++) {
          const t = Math.max(0, Math.min(1, p * tablones * 1.15 - k));
          if (t <= 0) continue;
          ctx.save(); ctx.globalAlpha = t; ctx.translate(0, -(1 - t) * 60);
          ctx.fillStyle = "#a8693d"; redondo(x + 1, 300, 20, 12, 3); ctx.fill();
          ctx.fillStyle = "#c98c5a"; ctx.fillRect(x + 3, 301, 16, 3);
          ctx.strokeStyle = "#c9a26b"; ctx.lineWidth = 2;
          const yc = 262 + 20 * (1 - Math.pow((x + 11 - o.x - o.w / 2) / (o.w / 2 + 14), 2));
          ctx.beginPath(); ctx.moveTo(x + 11, yc); ctx.lineTo(x + 11, 300); ctx.stroke();
          ctx.restore();
        }
        postes(o);
      } else if (o.solucion === "hielo") {
        if (!p) {
          ctx.fillStyle = "rgba(255,255,255,.85)";
          for (let k = 0; k < 4; k++) { redondo(o.x + 20 + k * (o.w - 60) / 3 + (animado ? Math.sin(tiempo + k) * 6 : 0), 318, 30, 8, 4); ctx.fill(); }
          silueta(o, 0); return;
        }
        // El agua se congela de orilla a orilla.
        const ancho = (o.w + 28) * p;
        ctx.fillStyle = "rgba(214,240,255,.95)"; redondo(o.x - 14, 300, ancho, 16, 5); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2;
        for (let x = o.x; x < o.x - 14 + ancho - 20; x += 46) { ctx.beginPath(); ctx.moveTo(x, 305); ctx.lineTo(x + 18, 305); ctx.stroke(); }
        ctx.fillStyle = "#9fd4f2"; ctx.fillRect(o.x - 14, 312, ancho, 4);
      } else {
        // Barca o balsa: sale del agua en la orilla y después navega.
        if (!p) { silueta({ x: o.x, w: o.solucion === "barca" ? 120 : 110 }, 26); return; }
        const s = o.barca ? o.barca.s : { x: o.x, w: o.solucion === "barca" ? 120 : 110 };
        const vaiven = o.barca && o.barca.estado === "navegando" && animado ? Math.sin(tiempo * 4) * 2 : 0;
        ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.5); ctx.translate(0, (1 - p) * 30 + vaiven);
        if (o.solucion === "barca") {
          ctx.fillStyle = "#b5653a";
          ctx.beginPath(); ctx.moveTo(s.x - 6, 300); ctx.lineTo(s.x + s.w + 6, 300); ctx.lineTo(s.x + s.w - 14, 322); ctx.lineTo(s.x + 14, 322); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#e3b27a"; ctx.fillRect(s.x - 4, 300, s.w + 8, 5);
          ctx.fillStyle = "#8a5a35"; ctx.fillRect(s.x + s.w / 2 - 3, 214, 6, 88);
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.moveTo(s.x + s.w / 2 + 4, 218); ctx.lineTo(s.x + s.w / 2 + 48, 286); ctx.lineTo(s.x + s.w / 2 + 4, 286); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#ff7aa8"; ctx.beginPath(); ctx.moveTo(s.x + s.w / 2 - 3, 214); ctx.lineTo(s.x + s.w / 2 - 22, 222); ctx.lineTo(s.x + s.w / 2 - 3, 230); ctx.fill();
        } else {
          for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? "#9b6136" : "#b5743f"; redondo(s.x, 300 + k * 6, s.w, 7, 3.5); ctx.fill(); }
          ctx.fillStyle = "#e3c48f"; ctx.fillRect(s.x + 16, 299, 5, 19); ctx.fillRect(s.x + s.w - 21, 299, 5, 19);
        }
        ctx.restore();
      }
    }
    function dibujarMuro(o) {
      if (!visible(o.x - 200, 220)) return;
      const n = 4, alto = 300 - o.arriba;
      const p = o.resuelto ? 1 : (o.animando ? o.p : 0);
      if (!p) {
        ctx.setLineDash([8, 8]); ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(o.x - n * 42, 300);
        for (let k = 1; k <= n; k++) { const y = 300 - k * alto / n; ctx.lineTo(o.x - (n - k + 1) * 42, y); ctx.lineTo(o.x - (n - k) * 42, y); }
        ctx.stroke(); ctx.setLineDash([]);
        return;
      }
      // Los peldaños de piedra suben uno tras otro.
      for (let k = 1; k <= n; k++) {
        const t = Math.max(0, Math.min(1, p * n * 1.1 - (k - 1)));
        if (t <= 0) continue;
        const yFinal = 300 - k * alto / n, y = 300 - (300 - yFinal) * t;
        const x = o.x - (n - k + 1) * 42;
        ctx.fillStyle = "#a99c8c"; ctx.fillRect(x, y, 42, 300 - y);
        ctx.fillStyle = "#c9bfb1"; ctx.fillRect(x, y, 42, 7);
        ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(x + 40, y, 2, 300 - y);
      }
    }
    function dibujarPuerta(o) {
      if (!visible(o.x - 30, 110)) return;
      const p = o.resuelto ? 1 : (o.animando ? o.p : 0);
      const subida = 130 * p, arriba = 170;
      ctx.save();
      ctx.beginPath(); ctx.rect(o.x - 10, arriba, 64, 130); ctx.clip();
      ctx.fillStyle = tema.oscuro ? "#120e1f" : "#3b3346"; ctx.fillRect(o.x, arriba, 44, 130);   // hueco de la entrada
      const y = arriba - subida;
      if (o.estilo === "reja") {
        ctx.fillStyle = "#5d5a66";
        for (let x = o.x + 2; x < o.x + 44; x += 10) ctx.fillRect(x, y, 4, 130);
        ctx.fillRect(o.x, y + 30, 44, 5); ctx.fillRect(o.x, y + 90, 44, 5);
        for (let x = o.x + 2; x < o.x + 44; x += 10) { ctx.beginPath(); ctx.moveTo(x - 2, y + 130); ctx.lineTo(x + 2, y + 140); ctx.lineTo(x + 6, y + 130); ctx.fill(); }
      } else {
        ctx.fillStyle = "#8a5a35"; ctx.fillRect(o.x, y, 44, 130);
        ctx.fillStyle = "#6e4527"; for (let x = o.x + 10; x < o.x + 44; x += 11) ctx.fillRect(x, y, 2, 130);
        ctx.fillStyle = "#4b4452"; ctx.fillRect(o.x, y + 24, 44, 7); ctx.fillRect(o.x, y + 96, 44, 7);
        ctx.fillStyle = "#ffcc33"; ctx.beginPath(); ctx.arc(o.x + 32, y + 66, 6, 0, 6.3); ctx.fill();
        ctx.fillStyle = "#3b2a1a"; ctx.fillRect(o.x + 31, y + 66, 2, 8);
      }
      ctx.restore();
      // Muro de piedra alrededor y encima de la entrada.
      ctx.fillStyle = tema.oscuro ? "#4a3f63" : "#9a948c";
      ctx.fillRect(o.x - 16, vista.camY - 10, 76, arriba - vista.camY + 10);
      ctx.fillRect(o.x - 16, arriba, 16, 130); ctx.fillRect(o.x + 44, arriba, 16, 130);
      ctx.fillStyle = "rgba(0,0,0,.15)";
      for (let yy = arriba - 30; yy > vista.camY - 30; yy -= 30) ctx.fillRect(o.x - 16, yy, 76, 3);
      if (!p) emoji("🔒", o.x + 22, arriba - 6, 26);
    }
    // Borrón: una mancha de tinta con ojos. tam 1 = enemigo normal; los jefes son más grandes.
    function borron(cx, base, tam, mira, opciones) {
      const o = opciones || {};
      const temblor = animado ? Math.sin(tiempo * 8 + cx) * 0.06 : 0;
      ctx.save();
      ctx.translate(cx + (o.sacudida || 0), base);
      ctx.scale(tam * (1 - temblor), tam * (1 + temblor));
      ctx.globalAlpha = o.alfa === undefined ? 1 : o.alfa;
      ctx.fillStyle = o.color || "#3a3f8c";
      ctx.beginPath();
      ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-27, -22, -14, -31); ctx.quadraticCurveTo(0, -40, 14, -31);
      ctx.quadraticCurveTo(27, -22, 22, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 2 / tam; ctx.stroke();   // borde claro: se ve también en la cueva
      for (const [dx, r] of [[-15, 5], [-3, 4], [11, 5]]) { ctx.beginPath(); ctx.arc(dx, 0, r, 0, 6.3); ctx.fill(); }
      ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.ellipse(-8, -26, 6, 3.5, -0.5, 0, 6.3); ctx.fill();
      // ojos que miran al jugador
      for (const ex of [-8, 8]) {
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex, -18, 6, 0, 6.3); ctx.fill();
        ctx.fillStyle = "#1c1c2e"; ctx.beginPath(); ctx.arc(ex + mira * 2.2, -17, 3, 0, 6.3); ctx.fill();
      }
      ctx.strokeStyle = "#1c1c2e"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, -27); ctx.lineTo(-3, -24); ctx.moveTo(14, -27); ctx.lineTo(3, -24); ctx.stroke();
      if (o.risa) { ctx.fillStyle = "#1c1c2e"; ctx.beginPath(); ctx.ellipse(0, -8, 7, 4 + Math.abs(Math.sin(tiempo * 20)) * 2, 0, 0, 6.3); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(-5, -8); ctx.quadraticCurveTo(0, -11, 5, -8); ctx.stroke(); }
      if (o.golpe) { ctx.globalAlpha = o.golpe * 0.8; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -18, 26, 0, 6.3); ctx.fill(); }
      ctx.restore();
    }
    function dibujarEnemigos() {
      for (const e of enemigos) {
        if (!visible(e.x - 20, e.w + 40)) continue;
        const base = alturaSuelo(e.x + e.w / 2);
        if (e.estado === "vencido") {
          // Se encoge y sale volando una mariposa.
          if (e.t < 0.3) borron(e.x + e.w / 2, base, 1 - e.t / 0.3, e.dir, { alfa: 1 - e.t / 0.3 });
          emoji("🦋", e.x + e.w / 2 + Math.sin(e.t * 6) * 12, base - 10 - e.t * 90, 28);
          continue;
        }
        const mira = j.x + j.w / 2 < e.x + e.w / 2 ? -1 : 1;
        borron(e.x + e.w / 2, base, 1, mira);
      }
    }
    function dibujarAmigos() {
      for (const a of amigos) {
        if (!visible(a.x - 40, 80)) continue;
        const base = alturaSuelo(a.x);
        const bote = animado ? Math.abs(Math.sin(tiempo * 3 + a.i)) * 4 : 0;
        emoji(a.e, a.x, base - bote, 44, j.x + j.w / 2 > a.x ? -1 : 1);
        // Bocadillo: «?» si necesita ayuda, «❤️» si ya le has ayudado.
        const by = base - 78 + (animado ? Math.sin(tiempo * 4 + a.i) * 3 : 0);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(a.x + 14, by, 13, 0, 6.3); ctx.fill();
        ctx.beginPath(); ctx.moveTo(a.x + 6, by + 9); ctx.lineTo(a.x + 2, by + 18); ctx.lineTo(a.x + 13, by + 11); ctx.fill();
        if (a.ayudado) emoji("❤️", a.x + 14, by + 9, 16);
        else { ctx.fillStyle = "#ff9b2f"; ctx.font = FUENTE_LETRA; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", a.x + 14, by + 1); }
      }
    }
    function dibujarJefe(o) {
      if (!visible(o.x - 60, 220)) return;
      const base = alturaSuelo(o.x + 45), cx = o.x + 45;
      const p = o.resuelto ? 1 : (o.animando ? o.p : 0);
      if (p < 1) {
        const tam = (o.tam || 2.6) * (1 - p * 0.85);
        const bote = o.risa && animado ? Math.abs(Math.sin(tiempo * 14)) * 10 : (animado ? Math.sin(tiempo * 2) * 3 : 0);
        const sacudida = o.golpe && animado ? Math.sin(tiempo * 70) * 8 * o.golpe : 0;
        // Palabras mal escritas dando vueltas a su alrededor.
        if (!p && o.palabrasMal) {
          ctx.font = "900 15px Nunito, 'Segoe UI', system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          o.palabrasMal.forEach((w, k) => {
            const a = (animado ? tiempo * 0.9 : 0) + k * Math.PI * 2 / o.palabrasMal.length;
            const x = cx + Math.cos(a) * 82, y = base - 24 * (o.tam || 2.6) + Math.sin(a) * 30;
            ctx.fillStyle = "rgba(255,255,255,.85)"; redondo(x - 30, y - 11, 60, 22, 11); ctx.fill();
            ctx.fillStyle = "#c0392b"; ctx.fillText(w, x, y + 1);
          });
        }
        borron(cx, base - bote, tam, j.x < cx ? -1 : 1, { color: o.color || "#2f3477", alfa: 1 - p, risa: o.risa > 0, golpe: o.golpe, sacudida });
        if (o.corona && !p) emoji("👑", cx, base - bote - 40 * tam + 6, 34);
      }
      if (p > 0) for (let k = 0; k < 5; k++) emoji("🦋", cx - 50 + k * 25 + Math.sin(tiempo * 5 + k) * 10, base - 40 - p * 120 - k * 12, 24);
    }
    function dibujarRayos() {
      ctx.font = FUENTE_LETRA; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const r of rayos) {
        const t = Math.max(0, Math.min(1, r.t - r.retraso));
        if (t <= 0 || t >= 1) continue;
        const x = r.x0 + (r.x1 - r.x0) * t, y = r.y0 + (r.y1 - r.y0) * t - Math.sin(t * Math.PI) * 50;
        ctx.fillStyle = "#ffcc33"; redondo(x - 14, y - 14, 28, 28, 8); ctx.fill();
        ctx.fillStyle = "#7a4b00"; ctx.fillText(r.l, x, y + 1);
      }
    }
    function dibujarObstaculos() {
      for (const o of obs) {
        if (o.tipo === "rio") dibujarRio(o);
        else if (o.tipo === "muro") dibujarMuro(o);
      }
    }
    function dibujarMeta() {
      if (!meta || !visible(meta.x - 40, 140)) return;
      const x = meta.x, b = meta.y, onda = animado ? tiempo * 5 : 0;
      ctx.fillStyle = "#8a5a35"; redondo(x - 4, b - 130, 8, 132, 4); ctx.fill();
      ctx.fillStyle = "#ffcc33"; ctx.beginPath(); ctx.arc(x, b - 132, 8, 0, 6.3); ctx.fill();
      ctx.fillStyle = enMeta ? "#4cc764" : "#ff7aa8";
      ctx.beginPath(); ctx.moveTo(x + 4, b - 122);
      for (let k = 0; k <= 10; k++) ctx.lineTo(x + 4 + k * 7, b - 122 + k * 1.6 + Math.sin(onda + k * 0.6) * 3);
      for (let k = 10; k >= 0; k--) ctx.lineTo(x + 4 + k * 7, b - 86 - k * 1.6 + Math.sin(onda + k * 0.6) * 3);
      ctx.closePath(); ctx.fill();
      ctx.font = "900 18px Nunito, 'Segoe UI', system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff"; ctx.fillText("META", x + 38, b - 104 + Math.sin(onda + 3) * 2);
    }
    function dibujarLetras() {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = FUENTE_LETRA;
      for (const l of letras) {
        if (l.cogida || !visible(l.x - 30, 60)) continue;
        const y = l.y + (animado ? Math.sin(tiempo * 3 + l.i) * 5 : 0);
        ctx.fillStyle = "rgba(255,226,110,.38)";
        ctx.beginPath(); ctx.arc(l.x, y, 27 + (animado ? Math.sin(tiempo * 4 + l.i) * 2 : 0), 0, 6.3); ctx.fill();
        ctx.fillStyle = "#ffcc33"; redondo(l.x - 18, y - 18, 36, 36, 10); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#7a4b00"; ctx.fillText(l.l, l.x, y + 1);
      }
      for (const c of chispas) {
        ctx.fillStyle = "rgba(255,204,51," + Math.min(1, c.vida * 2) + ")";
        ctx.beginPath(); ctx.arc(c.x, c.y, 2 + c.vida * 5, 0, 6.3); ctx.fill();
      }
    }
    function dibujarMascota() {
      let rot = 0, sy = 1, bote = 0;
      if (m.fiesta > 0) { bote = Math.abs(Math.sin(m.fiesta * 9)) * 22; rot = animado ? Math.sin(m.fiesta * 12) * 0.35 : 0; }
      else if (m.quieto > 1.5 && animado) rot = Math.sin(m.t * 2.2) * 0.18;   // espera mirando a los lados
      else if (animado) sy = 1 + Math.sin(m.t * 10) * 0.05;
      emoji(op.mascota || "🐣", m.x, m.y - bote, 30, m.mira > 0 ? -1 : 1, sy, rot);
    }
    function dibujarJugador() {
      if (j.parpadeo > 0 && Math.floor(j.parpadeo * 10) % 2) return;
      const cx = j.x + j.w / 2, base = j.y + j.h;
      let sx = 1, sy = 1, rot = 0, bote = 0;
      const moviendo = Math.abs(j.vx) > 20;
      if (!j.suelo) { sx = 0.92; sy = 1.1; rot = j.vx * 0.0004; }
      else if (moviendo && animado) { rot = Math.sin(j.t * 16) * 0.09; bote = Math.abs(Math.sin(j.t * 16)) * 4; }
      else if (animado) { sy = 1 + Math.sin(j.t * 3) * 0.025; }
      if (j.aterriza > 0) { sx *= 1 + 0.18 * j.aterriza; sy *= 1 - 0.16 * j.aterriza; }
      if (j.suelo) { ctx.fillStyle = "rgba(0,0,0,.14)"; ctx.beginPath(); ctx.ellipse(cx, base, 20, 5, 0, 0, 6.3); ctx.fill(); }
      if (poderes.escudo) {
        ctx.strokeStyle = "rgba(79,179,232,.8)"; ctx.fillStyle = "rgba(79,179,232,.15)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, base - 26, 38 + (animado ? Math.sin(tiempo * 5) * 2 : 0), 0, 6.3); ctx.fill(); ctx.stroke();
      }
      const tam = 54;
      // Los emojis de animales miran a la izquierda: se voltean al ir a la derecha.
      emoji(op.icono || "🦊", cx, base - bote, tam, sx * (j.mira > 0 ? -1 : 1), sy, rot);
      if (op.cabeza) emoji(op.cabeza, cx + j.mira * 2, base - bote - tam * 0.78 * sy, tam * 0.45, 1, 1, rot);
    }
    function dibujarNieve() {
      ctx.fillStyle = "rgba(255,255,255,.85)";
      for (const c of copos) {
        const x = vista.camX + ((c.x + (animado ? Math.sin(tiempo + c.r) * 20 : 0)) % 1000) * vista.ancho / 1000;
        const y = vista.camY + ((c.y + (animado ? tiempo * c.v : 0)) % 380) - 10;
        ctx.beginPath(); ctx.arc(x, y, c.r, 0, 6.3); ctx.fill();
      }
    }

    function dibujar() {
      const k = vista.escala * vista.dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, lienzo.height);
      g.addColorStop(0, tema.cielo[0]); g.addColorStop(1, tema.cielo[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.setTransform(k, 0, 0, k, -vista.camX * k, -vista.camY * k);

      for (const d of nivel.deco) if (d.nube) {
        const x = d.x + vista.camX * 0.7 + (animado ? (tiempo * 6) % 400 : 0);
        emoji(d.e, x, d.y + d.tam, d.tam);
      }
      colinas(0.75, 250, 40, 160, tema.colinas[0]);
      colinas(0.5, 275, 30, 110, tema.colinas[1]);
      if (tema.techo) techoCueva();
      for (const d of nivel.deco) if (!d.nube && d.capa === 0 && visible(d.x - d.tam, d.tam * 2)) emoji(d.e, d.x, d.y + 4, d.tam);
      for (const p of nivel.plataformas) if (visible(p.x, p.w)) plataforma(p);
      dibujarObstaculos();
      for (const s of solidos) if (!s.invisible && visible(s.x, s.w)) bloque(s);
      for (const o of obs) if (o.tipo === "puerta") dibujarPuerta(o);
      dibujarMeta();
      dibujarAmigos();
      for (const o of obs) if (o.tipo === "jefe") dibujarJefe(o);
      dibujarEnemigos();
      dibujarLetras();
      dibujarMascota();
      dibujarJugador();
      dibujarRayos();
      for (const d of nivel.deco) if (!d.nube && d.capa === 1 && visible(d.x - d.tam, d.tam * 2)) emoji(d.e, d.x, d.y + 3, d.tam);
      if (copos.length) dibujarNieve();
    }

    /* ---------- Bucle ---------- */
    function fotograma(t) {
      if (!corriendo) return;
      const dt = Math.min((t - ultimo) / 1000 || 0, 0.1);   // tras una pausa larga no se «teletransporta»
      ultimo = t;
      acum += dt;
      while (acum >= PASO) { actualizar(PASO); acum -= PASO; }
      dibujar();
      raf = requestAnimationFrame(fotograma);
    }
    function iniciar() {
      if (corriendo || destruido) return;
      corriendo = true; acum = 0; ultimo = performance.now();
      raf = requestAnimationFrame(fotograma);
    }
    function pausar() {
      corriendo = false; cancelAnimationFrame(raf);
      entrada.eje = 0; entrada.ejeTeclado = 0; entrada.saltoMantenido = false; entrada.saltoPulsado = false;
    }
    function destruir() { pausar(); destruido = true; }

    preparar();
    medir();
    return {
      iniciar, pausar, destruir, medir, entrada, jugador: j, mascota: m, resolver, reiniciar, letrasDe, totalLetras,
      darPoder, ayudarAmigo, golpearJefe, reirJefe, congelar, poderes, amigo: i => amigos[i], enemigos: () => enemigos,
      obstaculo: i => obs[i], get numObstaculos() { return obs.length; },
      get corriendo() { return corriendo; }
    };
  }

  /* ---------- Controles táctiles y teclado ----------
     zonaJoy: zona de la izquierda con el joystick (base + mando). zonaSalto: zona de la derecha con el botón.
     Cada dedo se sigue por su pointerId, así se puede mantener una dirección y saltar a la vez. */
  function conectarControles(partida, el, senal) {
    const e = partida.entrada;
    const opts = { signal: senal };
    const optsNoPasivo = { signal: senal, passive: false };
    let dedoJoy = null, centro = null, dedoSalto = null;
    const RADIO = 46, MUERTA = 0.18;

    function colocarMando(dx, dy) { el.mando.style.transform = `translate(${dx}px, ${dy}px)`; }
    function soltarJoy() {
      dedoJoy = null; e.eje = 0; colocarMando(0, 0);
      el.base.classList.remove("activa"); el.base.style.left = ""; el.base.style.top = "";
    }
    function moverJoy(ev) {
      let dx = ev.clientX - centro.x, dy = ev.clientY - centro.y;
      const d = Math.hypot(dx, dy);
      if (d > RADIO) { dx *= RADIO / d; dy *= RADIO / d; }
      colocarMando(dx, dy);
      const n = dx / RADIO;
      e.eje = Math.abs(n) < MUERTA ? 0 : Math.sign(n) * Math.min(1, (Math.abs(n) - MUERTA) / 0.5);
    }
    el.zonaJoy.addEventListener("pointerdown", ev => {
      if (dedoJoy !== null) return;
      ev.preventDefault();
      dedoJoy = ev.pointerId;
      try { el.zonaJoy.setPointerCapture(ev.pointerId); } catch (x) { /* nada */ }
      const zr = el.zonaJoy.getBoundingClientRect(), br = el.base.getBoundingClientRect();
      const cx = br.left + br.width / 2, cy = br.top + br.height / 2;
      // Si el dedo cae lejos del joystick, el joystick va donde está el dedo.
      if (Math.hypot(ev.clientX - cx, ev.clientY - cy) > RADIO * 1.4) {
        el.base.style.left = (ev.clientX - zr.left - br.width / 2) + "px";
        el.base.style.top = (ev.clientY - zr.top - br.height / 2) + "px";
        centro = { x: ev.clientX, y: ev.clientY };
      } else centro = { x: cx, y: cy };
      el.base.classList.add("activa");
      moverJoy(ev);
    }, optsNoPasivo);
    el.zonaJoy.addEventListener("pointermove", ev => { if (ev.pointerId === dedoJoy) moverJoy(ev); }, opts);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(t =>
      el.zonaJoy.addEventListener(t, ev => { if (ev.pointerId === dedoJoy) soltarJoy(); }, opts));

    function soltarSalto() { dedoSalto = null; e.saltoMantenido = false; el.salto.classList.remove("pulsado"); }
    el.zonaSalto.addEventListener("pointerdown", ev => {
      ev.preventDefault();
      if (dedoSalto !== null) return;
      dedoSalto = ev.pointerId;
      try { el.zonaSalto.setPointerCapture(ev.pointerId); } catch (x) { /* nada */ }
      e.saltoPulsado = true; e.saltoMantenido = true;
      el.salto.classList.add("pulsado");
    }, optsNoPasivo);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(t =>
      el.zonaSalto.addEventListener(t, ev => { if (ev.pointerId === dedoSalto) soltarSalto(); }, opts));

    // iOS: evitar lupa, zoom con doble toque y menú contextual sobre las zonas de juego.
    [el.zonaJoy, el.zonaSalto, el.lienzo].forEach(z => {
      z.addEventListener("touchstart", ev => ev.preventDefault(), optsNoPasivo);
      z.addEventListener("contextmenu", ev => ev.preventDefault(), optsNoPasivo);
    });

    // Teclado (ordenador): flechas o A/D para moverse; espacio, W o flecha arriba para saltar.
    const teclas = new Set();
    const IZQ = ["ArrowLeft", "a", "A"], DER = ["ArrowRight", "d", "D"], SALTO = [" ", "ArrowUp", "w", "W"];
    function ejeTeclado() { e.ejeTeclado = (DER.some(k => teclas.has(k)) ? 1 : 0) - (IZQ.some(k => teclas.has(k)) ? 1 : 0); }
    window.addEventListener("keydown", ev => {
      const k = ev.key;
      if (![...IZQ, ...DER, ...SALTO].includes(k)) return;
      if (ev.target && ev.target.closest && ev.target.closest(".ex-panel:not([hidden])")) return;   // en los paneles, el teclado es de los botones
      ev.preventDefault();
      if (SALTO.includes(k)) { if (!ev.repeat) e.saltoPulsado = true; e.saltoMantenido = true; }
      teclas.add(k); ejeTeclado();
    }, optsNoPasivo);
    window.addEventListener("keyup", ev => {
      teclas.delete(ev.key);
      if (SALTO.includes(ev.key) && !SALTO.some(k => teclas.has(k))) e.saltoMantenido = false;
      ejeTeclado();
    }, opts);

    return function soltarTodo() { soltarJoy(); soltarSalto(); teclas.clear(); e.ejeTeclado = 0; };
  }

  return { crear, conectarControles, ALTO };
})();
