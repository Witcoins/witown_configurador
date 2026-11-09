/**
 * Mientras el rector está en la portada y en las preguntas, se adelanta lo que
 * hace lenta la primera vista previa: los archivos de cada app (se le pide al
 * navegador que los guarde) y la sesión de cada cuenta de prueba en el servidor
 * (la primera vez se firma y se pide al backend). Una sola vez por pestaña.
 */
import type { Plataforma } from "@/components/VistaPrevia";

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
}
