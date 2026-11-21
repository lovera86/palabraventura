/* Palabraventura · La expedición de las palabras perdidas · motor 2D.
   Canvas 2D sin dependencias: física con paso fijo, colisiones de cajas, cámara lateral, dibujo con emojis
   (pintados una vez en lienzos pequeños y reutilizados) y entrada táctil multitoque con Pointer Events.
   Nada de este archivo toca el resto de la app: recibe un nivel y un lienzo y avisa con eventos. */
PV.expedicionMotor = (function () {
  const ALTO = 360;                 // alto lógico del mundo que siempre se ve entero
  const PASO = 1 / 120;             // paso fijo de la física
  const FIS = {
    gravedad: 2300, salto: 840, corte: 0.55, minSalto: 0.1,   // corte: velocidad que queda al soltar el salto antes de tiempo
    vel: 270, acel: 2600, frenado: 3200, aire: 0.7,
    coyote: 0.1, buffer: 0.14, maxCaida: 1100
  };
  const FUENTE_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

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
    const entrada = { eje: 0, ejeTeclado: 0, saltoPulsado: false, saltoMantenido: false };
    const j = {
      x: nivel.inicio.x, y: 300 - 46, w: 38, h: 46, vx: 0, vy: 0,
      suelo: true, mira: 1, coyote: 0, buffer: 0, cortado: false, tSalto: 0,
      t: 0, aterriza: 0, seguroX: nivel.inicio.x, parpadeo: 0, recorrido: 0
    };
    const vista = { escala: 1, dpr: 1, ancho: 640, alto: ALTO, camX: 0, camY: 0, cssW: 0, cssH: 0 };
    let corriendo = false, raf = 0, ultimo = 0, acum = 0, tiempo = 0, destruido = false;

    // Copias propias: lo que cambia en la partida (letras cogidas, barrera del río) no toca los datos del nivel.
    const solidos = nivel.solidos.map(s => Object.assign({}, s));
    const rio = nivel.rio || null;
    const meta = nivel.meta || null;
    function nuevaBarrera() { return rio ? { x: rio.x - 10, y: -600, w: 10, h: 900, invisible: true } : null; }
    let barrera = nuevaBarrera();
    let puenteHecho = false, construyendo = false, puenteP = 0, enMeta = false;
    const DURACION_PUENTE = 1.8;
    if (barrera) solidos.push(barrera);
    const letras = (nivel.letras || []).map((l, i) => Object.assign({ i, cogida: false }, l));
    const RADIO_LETRA = 44;
    let enOrilla = false;
    const chispas = [];
    // Mascota: sigue el rastro del jugador con un poco de retraso, flotando (no choca con nada, así nunca se atasca).
    const m = { x: j.x - 46, y: 300 - 34, mira: 1, fiesta: 0, quieto: 0, t: 0 };
    const rastro = [];

    function medir() {
      const r = lienzo.getBoundingClientRect();
      if (!r.width || !r.height) return;
      vista.cssW = r.width; vista.cssH = r.height;
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
      const eje = entrada.eje || entrada.ejeTeclado;
      const objetivo = eje * FIS.vel;
      const acelerando = objetivo !== 0 && Math.sign(objetivo) === Math.sign(j.vx || objetivo) && Math.abs(objetivo) >= Math.abs(j.vx);
      j.vx = acercar(j.vx, objetivo, (acelerando ? FIS.acel : FIS.frenado) * (j.suelo ? 1 : FIS.aire) * dt);
      if (eje) j.mira = eje > 0 ? 1 : -1;

      if (entrada.saltoPulsado) { j.buffer = FIS.buffer; entrada.saltoPulsado = false; } else j.buffer -= dt;
      j.coyote = j.suelo ? FIS.coyote : j.coyote - dt;
      if (j.buffer > 0 && j.coyote > 0) {
        j.vy = -FIS.salto; j.buffer = 0; j.coyote = 0; j.suelo = false; j.cortado = false; j.tSalto = 0;
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
      j.suelo = false;
      for (const s of solidos) {
        if (!solapan(j, s)) continue;
        if (j.vy > 0) { j.y = s.y - j.h; j.vy = 0; j.suelo = true; }
        else if (j.vy < 0) { j.y = s.y + s.h; j.vy = 0; }
      }
      if (j.vy >= 0) {
        for (const p of nivel.plataformas) {
          const pie = j.y + j.h;
          if (pie0 <= p.y + 0.5 && pie >= p.y && j.x + j.w > p.x + 4 && j.x < p.x + p.w - 4) { j.y = p.y - j.h; j.vy = 0; j.suelo = true; }
        }
      }
      if (j.suelo && !estabaEnSuelo) { j.aterriza = 1; evento("aterriza", { fuerza: Math.min(1, vyAntes / 900) }); }
      if (j.suelo) j.seguroX = j.x;
      j.aterriza = Math.max(0, j.aterriza - dt * 5);

      // Caerse del mundo no castiga: vuelve al último sitio seguro.
      if (j.y > ALTO + 240) { j.x = j.seguroX; j.y = 120; j.vx = 0; j.vy = 0; j.parpadeo = 1.2; evento("reaparece"); }
      j.parpadeo = Math.max(0, j.parpadeo - dt);

      // Letras: se recogen solas al pasar cerca, sin tener que pulsar nada.
      const cx = j.x + j.w / 2, cy = j.y + j.h / 2;
      for (const l of letras) {
        if (l.cogida || Math.hypot(l.x - cx, l.y - cy) > RADIO_LETRA) continue;
        l.cogida = true;
        const n = letras.filter(x => x.cogida).length;
        m.fiesta = n === letras.length ? 2.2 : 1;
        for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; chispas.push({ x: l.x, y: l.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160 - 80, vida: 0.7 }); }
        evento("letra", { letra: l.l, cogidas: n, total: letras.length, pantalla: aPantalla(l.x, l.y) });
      }
      for (let k = chispas.length - 1; k >= 0; k--) {
        const c = chispas[k];
        c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 500 * dt; c.vida -= dt;
        if (c.vida <= 0) chispas.splice(k, 1);
      }
      // Orilla del río: avisa una vez cada vez que se llega.
      if (barrera) {
        if (!enOrilla && j.x + j.w >= barrera.x - 6) { enOrilla = true; evento("orilla", { cogidas: letras.filter(x => x.cogida).length, total: letras.length }); }
        else if (enOrilla && j.x + j.w < barrera.x - 120) enOrilla = false;
      }
      // Construcción del puente: los tablones aparecen uno a uno; al terminar se puede cruzar.
      if (construyendo) {
        puenteP = Math.min(1, puenteP + dt / DURACION_PUENTE);
        if (animado && Math.random() < dt * 30) {
          const x = rio.x - 14 + Math.random() * (rio.w + 28) * puenteP;
          chispas.push({ x, y: 296, vx: (Math.random() - 0.5) * 120, vy: -120 - Math.random() * 160, vida: 0.6 });
        }
        if (puenteP >= 1) {
          construyendo = false;
          if (barrera) { solidos.splice(solidos.indexOf(barrera), 1); barrera = null; }
          solidos.push({ x: rio.x - 14, y: 300, w: rio.w + 28, h: 14, invisible: true });
          m.fiesta = 2.2;
          evento("puente");
        }
      }
      if (meta && puenteHecho && !construyendo && !enMeta && j.x + j.w >= meta.x - 10) {
        enMeta = true; m.fiesta = 3;
        evento("meta");
      }
      actualizarMascota(dt);
      colocarCamara(false, dt);
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

    // Al resolver el reto: el puente vuelve, la barrera desaparece y se puede cruzar.
    function construirPuente() {
      if (!rio || puenteHecho) return;
      puenteHecho = true; construyendo = true;
      puenteP = animado ? 0 : 0.999;          // sin animaciones aparece casi de golpe
      m.fiesta = 1.5;
      dibujar();
    }

    // Volver a jugar: todo como al principio, sin crear otra partida.
    function reiniciar() {
      Object.assign(j, { x: nivel.inicio.x, y: 300 - j.h, vx: 0, vy: 0, suelo: true, mira: 1, coyote: 0, buffer: 0,
        cortado: false, tSalto: 0, aterriza: 0, seguroX: nivel.inicio.x, parpadeo: 0 });
      solidos.length = 0;
      nivel.solidos.forEach(x => solidos.push(Object.assign({}, x)));
      barrera = nuevaBarrera();
      if (barrera) solidos.push(barrera);
      puenteHecho = false; construyendo = false; puenteP = 0; enOrilla = false; enMeta = false;
      letras.forEach(l => { l.cogida = false; });
      chispas.length = 0; rastro.length = 0;
      Object.assign(m, { x: j.x - 46, y: 300 - 34, fiesta: 0, quieto: 0 });
      colocarCamara(true);
      dibujar();
    }

    function aPantalla(x, y) {
      const r = lienzo.getBoundingClientRect();
      return { x: r.left + (x - vista.camX) * vista.escala, y: r.top + (y - vista.camY) * vista.escala };
    }

    function colocarCamara(inmediata, dt) {
      const objetivo = Math.max(0, Math.min(nivel.ancho - vista.ancho, j.x + j.w / 2 - vista.ancho * 0.42 + j.mira * 50));
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

    function bloque(s) {
      if (s.tipo === "suelo") {
        ctx.fillStyle = "#c98c5a"; ctx.fillRect(s.x, s.y, s.w, s.h + 400);
        ctx.fillStyle = "#b27748";
        for (let x = Math.floor(Math.max(s.x, vista.camX - 40) / 46) * 46; x < Math.min(s.x + s.w, vista.camX + vista.ancho + 40); x += 46) {
          ctx.beginPath(); ctx.arc(x + 20, s.y + 34 + (x % 3) * 6, 4, 0, 6.3); ctx.fill();
        }
        ctx.fillStyle = "#6cc070"; ctx.fillRect(s.x, s.y, s.w, 13);
        ctx.fillStyle = "#4ea457"; ctx.fillRect(s.x, s.y + 13, s.w, 3);
        return;
      }
      const r = 10;
      ctx.fillStyle = s.tipo === "tocon" ? "#a8693d" : "#9aa3b2";
      redondo(s.x, s.y, s.w, s.h, r); ctx.fill();
      ctx.fillStyle = s.tipo === "tocon" ? "#e3b27a" : "#b9c1cd";
      redondo(s.x + 4, s.y + 3, s.w - 8, 10, 5); ctx.fill();
    }
    function plataforma(p) {
      ctx.fillStyle = "#8a5a35"; redondo(p.x, p.y, p.w, 20, 8); ctx.fill();
      ctx.fillStyle = "#6cc070"; redondo(p.x - 2, p.y - 2, p.w + 4, 10, 5); ctx.fill();
      ctx.fillStyle = "#6e4527";
      for (let x = p.x + 18; x < p.x + p.w - 10; x += 34) ctx.fillRect(x, p.y + 10, 3, 8);
    }
    function redondo(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function dibujarRio() {
      if (!rio || !visible(rio.x - 20, rio.w + 40)) return;
      const arriba = 322, ola = animado ? tiempo * 3 : 0;
      ctx.fillStyle = "#4fb3e8"; ctx.fillRect(rio.x, arriba, rio.w, 500);
      ctx.fillStyle = "#3a9bd3"; ctx.fillRect(rio.x, arriba + 24, rio.w, 500);
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 3;
      for (let f = 0; f < 2; f++) {
        ctx.beginPath();
        for (let x = rio.x; x <= rio.x + rio.w; x += 8) {
          const y = arriba + 6 + f * 18 + Math.sin(x / 18 + ola + f * 2) * 3;
          if (x === rio.x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (puenteHecho) {
        // Puente reconstruido: tablones y barandillas de cuerda. Mientras se construye, caen uno a uno.
        const tablones = Math.ceil((rio.w + 28) / 22);
        ctx.strokeStyle = "rgba(201,162,107," + Math.min(1, puenteP * 1.6) + ")"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(rio.x - 8, 262); ctx.quadraticCurveTo(rio.x + rio.w / 2, 282, rio.x + rio.w + 8, 262); ctx.stroke();
        for (let k = 0, x = rio.x - 14; x < rio.x + rio.w + 14; x += 22, k++) {
          const t = Math.max(0, Math.min(1, puenteP * tablones * 1.15 - k));   // avance de este tablón (0..1)
          if (t <= 0) continue;
          ctx.save();
          ctx.globalAlpha = t;
          ctx.translate(0, -(1 - t) * 60);
          ctx.fillStyle = "#a8693d"; redondo(x + 1, 300, 20, 12, 3); ctx.fill();
          ctx.fillStyle = "#c98c5a"; ctx.fillRect(x + 3, 301, 16, 3);
          ctx.strokeStyle = "#c9a26b"; ctx.lineWidth = 2;
          const yc = 262 + 20 * (1 - Math.pow((x + 11 - rio.x - rio.w / 2) / (rio.w / 2 + 14), 2));
          ctx.beginPath(); ctx.moveTo(x + 11, yc); ctx.lineTo(x + 11, 300); ctx.stroke();
          ctx.restore();
        }
        for (const px of [rio.x - 14, rio.x + rio.w + 2]) { ctx.fillStyle = "#8a5a35"; redondo(px, 256, 12, 52, 4); ctx.fill(); }
        return;
      }
      // Lo que queda del puente: postes y cuerdas rotas, y su silueta punteada.
      ctx.strokeStyle = "#c9a26b"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rio.x - 6, 264); ctx.quadraticCurveTo(rio.x + 12, 290, rio.x + 16, 312); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rio.x + rio.w + 6, 264); ctx.quadraticCurveTo(rio.x + rio.w - 12, 290, rio.x + rio.w - 16, 312); ctx.stroke();
      ctx.setLineDash([10, 9]); ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.beginPath(); ctx.moveTo(rio.x, 302); ctx.quadraticCurveTo(rio.x + rio.w / 2, 322, rio.x + rio.w, 302); ctx.stroke();
      ctx.setLineDash([]);
      for (const px of [rio.x - 14, rio.x + rio.w + 2]) {
        ctx.fillStyle = "#8a5a35"; redondo(px, 256, 12, 52, 4); ctx.fill();
        ctx.fillStyle = "#6e4527"; ctx.fillRect(px, 256, 12, 6);
      }
    }
    function dibujarMeta() {
      if (!meta || !visible(meta.x - 40, 140)) return;
      const x = meta.x, onda = animado ? tiempo * 5 : 0;
      ctx.fillStyle = "#8a5a35"; redondo(x - 4, 170, 8, 132, 4); ctx.fill();
      ctx.fillStyle = "#ffcc33"; ctx.beginPath(); ctx.arc(x, 168, 8, 0, 6.3); ctx.fill();
      ctx.fillStyle = enMeta ? "#4cc764" : "#ff7aa8";
      ctx.beginPath(); ctx.moveTo(x + 4, 178);
      for (let k = 0; k <= 10; k++) ctx.lineTo(x + 4 + k * 7, 178 + k * 1.6 + Math.sin(onda + k * 0.6) * 3);
      for (let k = 10; k >= 0; k--) ctx.lineTo(x + 4 + k * 7, 214 - k * 1.6 + Math.sin(onda + k * 0.6) * 3);
      ctx.closePath(); ctx.fill();
      ctx.font = "900 18px Nunito, 'Segoe UI', system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff"; ctx.fillText("META", x + 38, 196 + Math.sin(onda + 3) * 2);
    }
    function dibujarLetras() {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "900 25px Nunito, 'Segoe UI', system-ui, sans-serif";
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
      ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.beginPath(); ctx.ellipse(m.x, 300, 11, 3, 0, 0, 6.3); ctx.fill();
      emoji(op.mascota || "🐣", m.x, m.y - bote, 30, m.mira > 0 ? -1 : 1, sy, rot);
    }
    function visible(x, w) { return x + w > vista.camX - 60 && x < vista.camX + vista.ancho + 60; }

    function dibujarJugador() {
      if (j.parpadeo > 0 && Math.floor(j.parpadeo * 10) % 2) return;
      const cx = j.x + j.w / 2, base = j.y + j.h;
      let sx = 1, sy = 1, rot = 0, bote = 0;
      const moviendo = Math.abs(j.vx) > 20;
      if (!j.suelo) { sx = 0.92; sy = 1.1; rot = j.vx * 0.0004; }
      else if (moviendo && animado) { rot = Math.sin(j.t * 16) * 0.09; bote = Math.abs(Math.sin(j.t * 16)) * 4; }
      else if (animado) { sy = 1 + Math.sin(j.t * 3) * 0.025; }
      if (j.aterriza > 0) { sx *= 1 + 0.18 * j.aterriza; sy *= 1 - 0.16 * j.aterriza; }
      // sombra
      if (j.suelo) { ctx.fillStyle = "rgba(0,0,0,.14)"; ctx.beginPath(); ctx.ellipse(cx, base, 20, 5, 0, 0, 6.3); ctx.fill(); }
      const tam = 54;
      // Los emojis de animales miran a la izquierda: se voltean al ir a la derecha.
      emoji(op.icono || "🦊", cx, base - bote, tam, sx * (j.mira > 0 ? -1 : 1), sy, rot);
      if (op.cabeza) emoji(op.cabeza, cx + j.mira * 2, base - bote - tam * 0.78 * sy, tam * 0.45, 1, 1, rot);
    }

    function dibujar() {
      const k = vista.escala * vista.dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, lienzo.height);
      g.addColorStop(0, nivel.cielo[0]); g.addColorStop(1, nivel.cielo[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.setTransform(k, 0, 0, k, -vista.camX * k, -vista.camY * k);

      for (const d of nivel.deco) if (d.nube) {
        const x = d.x + vista.camX * 0.7 + (animado ? (tiempo * 6) % 400 : 0);
        emoji(d.e, x, d.y + d.tam, d.tam);
      }
      colinas(0.75, 250, 40, 160, "#cfeccf");
      colinas(0.5, 275, 30, 110, "#a9dca8");
      for (const d of nivel.deco) if (!d.nube && d.capa === 0 && visible(d.x - d.tam, d.tam * 2)) emoji(d.e, d.x, d.y + 4, d.tam);
      for (const p of nivel.plataformas) if (visible(p.x, p.w)) plataforma(p);
      dibujarRio();
      for (const s of solidos) if (!s.invisible && visible(s.x, s.w)) bloque(s);
      dibujarMeta();
      dibujarLetras();
      dibujarMascota();
      dibujarJugador();
      for (const d of nivel.deco) if (!d.nube && d.capa === 1 && visible(d.x - d.tam, d.tam * 2)) emoji(d.e, d.x, d.y + 3, d.tam);
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

    medir();
    return {
      iniciar, pausar, destruir, medir, entrada, jugador: j, mascota: m, construirPuente, reiniciar,
      letrasCogidas: () => letras.filter(l => l.cogida).map(l => l.l),
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
