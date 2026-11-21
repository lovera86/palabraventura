/* Palabraventura · guardar y cargar progreso (LocalStorage), perfiles de jugador, exportar e importar copia JSON.
   - Cada jugador tiene su propio progreso en "palabraventura.progreso.<id>".
   - El índice de perfiles está en "palabraventura.perfiles".
   - El progreso de la versión 1 (un solo jugador, clave "palabraventura.progreso") se migra al primer perfil
     y la clave antigua se conserva como copia de seguridad. */
PV.almacen = (function () {
  const CLAVE_V1 = "palabraventura.progreso";
  const CLAVE_PERFILES = "palabraventura.perfiles";
  const PREFIJO = "palabraventura.progreso.";
  const ESQUEMA = 2;
  let disponible = true;
  try { localStorage.setItem("__pv", "1"); localStorage.removeItem("__pv"); } catch (e) { disponible = false; }
  let memoria = {}; // si el navegador no deja guardar, la partida vive solo mientras la página esté abierta

  function leer(k) { if (!disponible) return memoria[k] || null; try { return localStorage.getItem(k); } catch (e) { return null; } }
  function escribir(k, v) { if (!disponible) { memoria[k] = v; return true; } try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function quitar(k) { if (!disponible) { delete memoria[k]; return; } try { localStorage.removeItem(k); } catch (e) { /* nada */ } }

  function nuevoId() { return "j" + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }

  function nuevo(id) {
    return {
      esquema: ESQUEMA, id: id || nuevoId(), creado: PV.util.hoy(),
      tipo: "nino",        // "nino" o "adulto"
      apodo: "", avatar: { animal: "zorro", accesorio: null },
      mascota: { nombre: "" },
      estrellas: 0, monedas: 0, cofresPendientes: 0, accesorios: [], insignias: [], coleccion: [],
      misiones: {},        // por misión: completada, veces, ultima
      sonido: true, reducirAnimaciones: false, pin: null,
      habilidades: {}, items: {}, consolidadas: 0, sesiones: [], actividad: {},
      retoDiario: { fecha: null }, ultimaVisita: null, etapaVista: 0
    };
  }

  // Punto único para adaptar datos de versiones anteriores. Los campos nuevos reciben valores por defecto.
  function migrar(d) {
    if (!d || typeof d !== "object" || typeof d.esquema !== "number" || d.esquema > ESQUEMA) return null;
    const r = Object.assign(nuevo(d.id), d, { esquema: ESQUEMA });
    r.avatar = Object.assign({ animal: "zorro", accesorio: null }, d.avatar || {});
    if (r.avatar.puestos && typeof r.avatar.puestos !== "object") r.avatar.puestos = {};
    r.mascota = Object.assign({ nombre: "" }, d.mascota || {});
    r.retoDiario = Object.assign({ fecha: null }, d.retoDiario || {});
    ["habilidades", "items", "actividad", "misiones"].forEach(k => { if (!r[k] || typeof r[k] !== "object" || Array.isArray(r[k])) r[k] = {}; });
    ["accesorios", "insignias", "sesiones", "coleccion"].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
    ["estrellas", "monedas", "cofresPendientes", "consolidadas"].forEach(k => { if (typeof r[k] !== "number" || !isFinite(r[k])) r[k] = 0; });
    if (d.esquema < 2) r.etapaVista = PV.mundo ? PV.mundo.etapa(r) : 0; // no celebrar una evolución "antigua"
    return r;
  }

  /* ---------- Perfiles ---------- */
  function indice() {
    let ix = null;
    try { ix = JSON.parse(leer(CLAVE_PERFILES)); } catch (e) { ix = null; }
    if (!ix || !Array.isArray(ix.lista)) {
      ix = { activo: null, lista: [] };
      // Migración desde la versión 1: un único progreso sin perfiles.
      try {
        const viejo = migrar(JSON.parse(leer(CLAVE_V1)));
        if (viejo) {
          escribir(PREFIJO + viejo.id, JSON.stringify(viejo));
          ix.lista.push(resumenDe(viejo)); ix.activo = viejo.id;
        }
      } catch (e) { /* sin datos previos */ }
      guardarIndice(ix);
    }
    return ix;
  }
  function guardarIndice(ix) { escribir(CLAVE_PERFILES, JSON.stringify(ix)); }
  function resumenDe(p) { return { id: p.id, apodo: p.apodo, animal: p.avatar.animal, tipo: p.tipo || "nino" }; }
  function perfiles() { return indice().lista; }
  function activo() { return indice().activo; }
  function activar(id) { const ix = indice(); ix.activo = id; guardarIndice(ix); }
  function salir() { const ix = indice(); ix.activo = null; guardarIndice(ix); }

  function cargar(id) {
    const ix = indice();
    id = id || ix.activo;
    if (!id) return null;
    try { const raw = leer(PREFIJO + id); return raw ? migrar(JSON.parse(raw)) : null; } catch (e) { return null; }
  }
  function guardar(p) {
    if (!p) return false;
    const ok = escribir(PREFIJO + p.id, JSON.stringify(p));
    const ix = indice(), i = ix.lista.findIndex(x => x.id === p.id), r = resumenDe(p);
    if (i >= 0) ix.lista[i] = r; else ix.lista.push(r);
    ix.activo = p.id;
    guardarIndice(ix);
    return ok;
  }
  function borrar(id) {
    const ix = indice();
    quitar(PREFIJO + id);
    ix.lista = ix.lista.filter(x => x.id !== id);
    if (ix.activo === id) ix.activo = null;
    guardarIndice(ix);
  }

  /* ---------- Copia de seguridad ---------- */
  function exportar(p) {
    const datos = { app: "palabraventura", exportado: new Date().toISOString(), progreso: p };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const nombre = (p.apodo || "jugador").normalize("NFD").replace(/[^\w-]+/g, "").toLowerCase() || "jugador";
    a.download = "palabraventura-" + nombre + "-" + PV.util.hoy() + ".json";
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

  /* PIN de la zona de adultos: común a todos los jugadores del dispositivo. */
  function pin() { return leer("palabraventura.pin") || null; }
  function ponerPin(v) { if (v) escribir("palabraventura.pin", v); else quitar("palabraventura.pin"); }

  return { nuevo, migrar, cargar, guardar, borrar, perfiles, activo, activar, salir, exportar, importarTexto, pin, ponerPin, ESQUEMA,
           get disponible() { return disponible; } };
})();
