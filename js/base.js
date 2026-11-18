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
  tildes: { nombre: "Tildes básicas", icono: "✨" }
};

PV.REGLAS = {
  "bl-br": "B antes de L y R", "nv": "V después de N", "aba": "Pasado en -aba", "bir": "Verbos en -bir",
  "ivo": "Terminación -ivo, -iva", "bu": "Bu-, bus-, bur-", "bi": "Bi- (dos)", "bv-vocab": "Palabras con B o V para memorizar",
  "hue": "Hue-, hie-, hui-", "hum": "Hum- + vocal", "hacer": "Verbo hacer", "hablar": "Verbo hablar",
  "haber": "Verbo haber (hay, ha)", "hola": "Hola / ola", "h-vocab": "Palabras con H para memorizar",
  "intercalada": "H en medio de la palabra", "sin-h": "Palabras sin H",
  "illo": "Terminación -illo, -illa", "yfinal": "Y al final de palabra", "ll-vocab": "Palabras con LL para memorizar",
  "y-vocab": "Palabras con Y para memorizar", "verbos-y": "Verbos con Y (cayó, leyó)",
  "aguda": "Palabras agudas", "llana": "Palabras llanas", "esdrujula": "Palabras esdrújulas"
};

PV.TIPOS = {
  detective: { nombre: "Detective de palabras", icono: "🔍" },
  completa:  { nombre: "Completa la palabra",   icono: "🧩" },
  robot:     { nombre: "Robot corrector",       icono: "🤖" }
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
