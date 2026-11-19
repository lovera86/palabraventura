/* Palabraventura · base: espacio de nombres, utilidades, catálogo de habilidades y reglas, validador del banco. */
window.PV = window.PV || {};
PV.banco = [];

PV.util = (function () {
  function fecha(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  // PV.util.desfase permite simular otros días al probar la repetición espaciada (consola: PV.util.desfase = 1).
  function hoy() { const d = new Date(); d.setDate(d.getDate() + (PV.util.desfase || 0)); return fecha(d); }
  function sumarDias(f, n) { const p = f.split("-").map(Number); return fecha(new Date(p[0], p[1] - 1, p[2] + n)); }
  function diasEntre(a, b) {
    const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }
  function barajar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // Quita signos de puntuación pegados a una palabra: "¿Qué" -> "Qué", "pequeño," -> "pequeño".
  function limpiar(t) { return t.replace(/^[¿¡"«(]+/, "").replace(/[.,;:!?»")]+$/, ""); }
  function azar(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  return { fecha, hoy, sumarDias, diasEntre, barajar, esc, limpiar, azar, desfase: 0 };
})();

PV.HABILIDADES = {
  bv:     { nombre: "B / V",          icono: "🐝" },
  h:      { nombre: "H / sin H",      icono: "🦉" },
  lly:    { nombre: "LL / Y",         icono: "🌧️" },
  tildes: { nombre: "Tildes básicas", icono: "✨" },
  gj:     { nombre: "G / J",          icono: "🦇" },
  czs:    { nombre: "C / Z / S",      icono: "🐚" },
  punt:   { nombre: "Puntuación y mayúsculas", icono: "❓" },
  // Adultos
  diac:   { nombre: "Tilde diacrítica", icono: "📚", publico: "adulto" },
  homo:   { nombre: "Homófonos", icono: "☕", publico: "adulto" },
  porq:   { nombre: "Porque, sino y expresiones", icono: "🤔", publico: "adulto" },
  gram:   { nombre: "Dudas gramaticales", icono: "📮", publico: "adulto" },
  tild2:  { nombre: "Tildes avanzadas", icono: "🔭", publico: "adulto" }
};

PV.REGLAS = {
  "bl-br": "B antes de L y R", "nv": "V después de N", "aba": "Pasado en -aba", "bir": "Verbos en -bir",
  "ivo": "Terminación -ivo, -iva", "bu": "Bu-, bus-, bur-", "bi": "Bi- (dos)", "bv-vocab": "Palabras con B o V para memorizar",
  "hue": "Hue-, hie-, hui-", "hum": "Hum- + vocal", "hacer": "Verbo hacer", "hablar": "Verbo hablar",
  "haber": "Verbo haber (hay, ha)", "hola": "Hola / ola", "h-vocab": "Palabras con H para memorizar",
  "intercalada": "H en medio de la palabra", "sin-h": "Palabras sin H",
  "illo": "Terminación -illo, -illa", "yfinal": "Y al final de palabra", "ll-vocab": "Palabras con LL para memorizar",
  "y-vocab": "Palabras con Y para memorizar", "verbos-y": "Verbos con Y (cayó, leyó)",
  "aguda": "Palabras agudas", "llana": "Palabras llanas", "esdrujula": "Palabras esdrújulas",
  "ger-gir": "Verbos en -ger, -gir", "aje": "Terminación -aje", "jero": "Terminación -jero, -jera",
  "gen": "Palabras con gen", "gia": "Terminación -gía", "j-verbos": "Verbos con J (dije, trajeron)",
  "gue-gui": "Gue, gui y diéresis (gü)", "gj-vocab": "Palabras con G o J para memorizar",
  "ce-ci": "C delante de E, I", "za": "Z delante de A, O, U", "z-ces": "Plural de palabras en -z (-ces)",
  "czs-vocab": "Palabras con C, Z o S para memorizar",
  "pregunta": "Signos de pregunta (¿?)", "exclamacion": "Signos de exclamación (¡!)",
  "mayus-inicio": "Mayúscula al empezar", "mayus-nombres": "Mayúscula en nombres propios",
  "dias-meses": "Días y meses en minúscula", "punto": "Punto final",
  "tu-el-mi": "Tú/tu, él/el, mí/mi", "si-se-te-de": "Sí/si, sé/se, té/te, dé/de", "mas": "Más/mas",
  "interrog": "Interrogativos con tilde", "sin-tilde": "Palabras que no llevan tilde (solo, fue, ti)",
  "a-ver": "A ver / haber", "hecho-echo": "Hecho / echo", "hay-ahi-ay": "Hay / ahí / ay",
  "vaya-valla-baya": "Vaya / valla / baya", "otros-homo": "Otros homófonos",
  "porque": "Porque, por qué, porqué, por que", "sino": "Sino / si no", "juntas": "Expresiones juntas o separadas",
  "haber-impersonal": "Haber y hacer impersonales", "dequeismo": "Dequeísmo", "queismo": "Queísmo",
  "pronombres": "Detrás de mí, cerca de ti", "imperativo": "Imperativo (id, venid, sentaos)", "laismo": "Laísmo",
  "hiato": "Hiatos (día, maíz)", "diptongo": "Diptongos sin tilde (huir, cuidado)", "mente": "Adverbios en -mente",
  "mayusculas": "Tilde en mayúsculas", "plurales": "Tildes en los plurales"
};

PV.TIPOS = {
  detective: { nombre: "Detective de palabras", icono: "🔍" },
  completa:  { nombre: "Hechizo de letras",     icono: "🪄" },
  robot:     { nombre: "Robot corrector",       icono: "🤖" },
  construye: { nombre: "Construye la palabra",  icono: "🧱" }   // formato de juego: reutiliza ejercicios de tipo "completa"
};

/* Construye la palabra: parte la palabra en fichas (LL, CH y RR van juntas) y añade como ficha trampa la letra equivocada
   del ejercicio. Solo se usa con ejercicios "completa" de palabras cortas cuya opción equivocada no es «sin letra». */
PV.construye = {
  fichas(palabra) { return palabra.toLowerCase().match(/ll|ch|rr|./g) || []; },
  apto(e) {
    if (e.tipo !== "completa") return false;
    const malas = e.opciones.filter(o => o !== e.correcta);
    const f = PV.construye.fichas(e.palabra);
    return malas.length === 1 && malas[0] !== "" && f.length >= 3 && f.length <= 8;
  },
  trampa(e) { return e.opciones.find(o => o !== e.correcta); }
};

/* Normaliza y comprueba el banco. Devuelve la lista de problemas (vacía si todo está bien). */
PV.validarBanco = function () {
  const problemas = [], ids = new Set();
  const req = ["id", "habilidad", "tipo", "dificultad", "regla", "palabra", "opciones", "correcta", "explicacion"];
  PV.banco.forEach(e => {
    if (!e.etiquetas) e.etiquetas = [e.habilidad, e.regla];
    req.forEach(k => { if (e[k] === undefined || e[k] === null) problemas.push(e.id + ": falta " + k); });
    if (ids.has(e.id)) problemas.push(e.id + ": id repetido");
    ids.add(e.id);
    if (!PV.HABILIDADES[e.habilidad]) problemas.push(e.id + ": habilidad desconocida");
    if (!PV.TIPOS[e.tipo]) problemas.push(e.id + ": tipo desconocido");
    if (!PV.REGLAS[e.regla]) problemas.push(e.id + ": regla desconocida " + e.regla);
    if (![1, 2, 3].includes(e.dificultad)) problemas.push(e.id + ": dificultad fuera de rango");
    if (!e.opciones.includes(e.correcta)) problemas.push(e.id + ": la respuesta correcta no está entre las opciones");
    if (new Set(e.opciones).size !== e.opciones.length) problemas.push(e.id + ": opciones repetidas");
    if (e.tipo === "detective") {
      if (e.correcta.toLowerCase() !== e.palabra.toLowerCase()) problemas.push(e.id + ": correcta y palabra no coinciden");
      if (e.frase && !e.frase.includes("___")) problemas.push(e.id + ": la frase no tiene hueco");
    }
    if (e.tipo === "completa") {
      if (!e.hueco || e.hueco.split("_").length !== 2) problemas.push(e.id + ": hueco mal formado");
      else if (e.hueco.replace("_", e.correcta).toLowerCase() !== e.palabra.toLowerCase()) problemas.push(e.id + ": el hueco no forma la palabra");
      if (e.frase && !e.frase.includes("___")) problemas.push(e.id + ": la frase no tiene hueco");
    }
    if (e.tipo === "robot") {
      const toks = (e.frase || "").split(/\s+/).map(PV.util.limpiar);
      if (toks.filter(t => t === e.error).length !== 1) problemas.push(e.id + ": la palabra errónea no aparece una sola vez en la frase");
      if (!e.opciones.includes(e.error)) problemas.push(e.id + ": el error debería estar entre las opciones");
      if (e.correcta !== e.palabra) problemas.push(e.id + ": correcta y palabra no coinciden");
    }
  });
  return problemas;
};
