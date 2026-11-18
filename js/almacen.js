/* Palabraventura · guardar y cargar progreso (LocalStorage), exportar e importar copia JSON. */
PV.almacen = (function () {
  const CLAVE = "palabraventura.progreso";
  const ESQUEMA = 1;
  let disponible = true;
  try { localStorage.setItem("__pv", "1"); localStorage.removeItem("__pv"); } catch (e) { disponible = false; }

  function nuevo() {
    return {
      esquema: ESQUEMA, creado: PV.util.hoy(),
      apodo: "", avatar: { animal: "zorro", accesorio: null },
      estrellas: 0, cofresPendientes: 0, accesorios: [], insignias: [],
      sonido: true, pin: null,
      habilidades: {},   // por habilidad: intentos, aciertos, nivel, racha, ventana, ultimas, dias, ultimaFecha
      items: {},         // por ejercicio: intentos, aciertos, fallos, caja, proximo, enRefuerzo, ultimaFecha, ultimoFallo
      consolidadas: 0,   // palabras que han salido de la lista de refuerzo
      sesiones: [],      // historial breve de sesiones completadas
      actividad: {},     // por día: retos y aciertos
      retoDiario: { fecha: null }
    };
  }

  // Punto único para adaptar datos de versiones anteriores del esquema.
  function migrar(d) {
    if (!d || typeof d !== "object" || typeof d.esquema !== "number") return null;
    if (d.esquema > ESQUEMA) return null;
    const base = nuevo();
    const r = Object.assign(base, d, { esquema: ESQUEMA });
    r.avatar = Object.assign({ animal: "zorro", accesorio: null }, d.avatar || {});
    r.retoDiario = Object.assign({ fecha: null }, d.retoDiario || {});
    ["habilidades", "items", "actividad"].forEach(k => { if (typeof r[k] !== "object" || Array.isArray(r[k])) r[k] = {}; });
    ["accesorios", "insignias", "sesiones"].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
    return r;
  }

  function cargar() {
    if (!disponible) return null;
    try { const raw = localStorage.getItem(CLAVE); return raw ? migrar(JSON.parse(raw)) : null; } catch (e) { return null; }
  }
  function guardar(p) {
    if (!disponible || !p) return false;
    try { localStorage.setItem(CLAVE, JSON.stringify(p)); return true; } catch (e) { return false; }
  }
  function borrar() { try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } }

  function exportar(p) {
    const datos = { app: "palabraventura", exportado: new Date().toISOString(), progreso: p };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "palabraventura-copia-" + PV.util.hoy() + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function importarTexto(texto) {
    let d;
    try { d = JSON.parse(texto); } catch (e) { throw new Error("El archivo no se puede leer."); }
    const p = migrar(d && d.app === "palabraventura" ? d.progreso : d);
    if (!p) throw new Error("El archivo no es una copia válida de Palabraventura.");
    return p;
  }

  return { nuevo, cargar, guardar, borrar, exportar, importarTexto, ESQUEMA, get disponible() { return disponible; } };
})();
