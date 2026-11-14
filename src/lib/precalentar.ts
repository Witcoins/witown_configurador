/**
 * Mientras el rector está en la portada y en las preguntas, se adelanta lo que
 * hace lenta la primera vista previa: los archivos de cada app (se le pide al
 * navegador que los guarde) y la sesión de cada cuenta de prueba en el servidor
 * (la primera vez se firma y se pide al backend). Una sola vez por pestaña.
 */
import type { Plataforma } from "@/components/VistaPrevia";
import { PRECARGA } from "@/config/precarga";

const PLATAFORMAS: Plataforma[] = ["admin", "docentes", "padres", "estudiante", "tienda"];
let hecho = false;

function prefetch(href: string, como: "script" | "style") {
  if (document.head.querySelector(`link[rel="prefetch"][href="${CSS.escape(href)}"]`)) return;
  const l = document.createElement("link");
  l.rel = "prefetch";
  l.as = como;
  l.href = href;
  document.head.appendChild(l);
}

async function archivosDe(p: Plataforma) {
  const r = await fetch(`/${p}/`, { cache: "no-cache" });
  if (!r.ok) return;
  const html = await r.text();
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) prefetch(m[1], "script");
  for (const m of html.matchAll(/<link[^>]+rel="(?:stylesheet|modulepreload)"[^>]+href="([^"]+)"/g)) prefetch(m[1], m[0].includes("stylesheet") ? "style" : "script");
}

function sesionDe(p: Plataforma, e: string) {
  const h = { "X-Vitrina-Enlace": e, Authorization: "Bearer demo" };
  // _sesion despierta la función; resumen obliga a firmar la sesión y llamar al backend.
  return fetch(`/api/demo/${p}/_sesion`, { headers: h })
    .then(() => fetch(`/api/demo/${p}/WitColegios/col_gc/resumen`, { headers: h }))
    .catch(() => undefined);
}

export function precalentar(e: string) {
  if (hecho || !e) return;
  hecho = true;
  // Una plataforma tras otra, sin competir con lo que el rector está viendo.
  void (async () => {
    for (const p of PLATAFORMAS) {
      await archivosDe(p).catch(() => undefined);
      await sesionDe(p, e);
    }
  })();
  mantenerDespierta(e);
}

/**
 * La función de las vistas previas no tiene instancia siempre encendida (no se
 * paga un costo fijo: decisión 2026-11-14) y se apaga tras unos minutos sin
 * pedidos, perdiendo su caché. Mientras la demo está abierta, un pedido liviano
 * cada 4 minutos la mantiene despierta; se detiene a los 90 minutos para que
 * una pestaña olvidada no la tenga prendida.
 */
const CADA_MS = 4 * 60 * 1000;
const HASTA_MS = 90 * 60 * 1000;
function mantenerDespierta(e: string) {
  const fin = Date.now() + HASTA_MS;
  const reloj = window.setInterval(() => {
    if (Date.now() > fin) {
      window.clearInterval(reloj);
      return;
    }
    fetch("/api/demo/admin/_sesion", { headers: { "X-Vitrina-Enlace": e, Authorization: "Bearer demo" } }).catch(() => undefined);
  }, CADA_MS);
}

/**
 * La escena siguiente, por adelantado: los archivos de su app y los datos que
 * pide su pantalla (config/precarga.ts), para que la función los tenga en su
 * caché cuando la persona llegue. `{uid}` y `{est}` salen de la sesión de la
 * cuenta de prueba. Una vez por escena y pestaña.
 */
const adelantadas = new Set<string>();
export function precargarEscena(e: string, p: Plataforma, ir?: string) {
  if (!e) return;
  const clave = `${p} ${ir ?? ""}`;
  if (adelantadas.has(clave)) return;
  adelantadas.add(clave);
  const h = { "X-Vitrina-Enlace": e, Authorization: "Bearer demo" };
  void (async () => {
    await archivosDe(p).catch(() => undefined);
    const rutas = PRECARGA[clave] ?? [];
    if (!rutas.length) return;
    let s: { uid?: string; extra?: { estudiantes?: { uid?: string }[] } } | null = null;
    if (rutas.some((r) => r.includes("{uid}") || r.includes("{est}"))) {
      s = await fetch(`/api/demo/${p}/_sesion`, { headers: h }).then((r) => r.json()).catch(() => null);
    }
    const uid = s?.uid;
    const est = s?.extra?.estudiantes?.[0]?.uid;
    const listas = rutas
      .filter((r) => (!r.includes("{uid}") || uid) && (!r.includes("{est}") || est))
      .map((r) => r.split("{uid}").join(uid ?? "").split("{est}").join(est ?? ""));
    // De a cuatro, para no competir con lo que la persona está viendo.
    for (let i = 0; i < listas.length; i += 4) {
      await Promise.all(listas.slice(i, i + 4).map((r) => fetch(`/api/demo/${p}${r}`, { headers: h }).catch(() => undefined)));
    }
  })();
}
