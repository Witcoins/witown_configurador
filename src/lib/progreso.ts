import { useEffect } from "react";
import { useConfigurador } from "@/lib/estado";

/**
 * Hasta dónde llega cada enlace (lo ve la asesora en founders, para saber dónde
 * se quedó el rector y preguntarle). Solo si el rector aceptó los términos, que
 * lo dicen. Solo el paso y su orden; el servidor pone la hora. Cada paso se
 * manda una vez por pestaña y nunca bloquea la pantalla.
 *
 * Orden: portada 0 · bienvenida 1 · escenas 10+ · juego 30-31 · estudiantes 45 ·
 * plan 50 · número 60 · datos 70 · cierre 80 · pdf/whatsapp/referido 85-87 ·
 * agendó 90.
 */
const enviados = new Set<string>();
// Pasos vistos antes de aceptar: se mandan apenas acepta (la portada, p. ej.).
const pendientes: Array<[string, number]> = [];
let permitido = false;

function mandar(e: string, paso: string, orden: number) {
  const clave = `${e}|${paso}`;
  if (!e || enviados.has(clave)) return;
  enviados.add(clave);
  try {
    void fetch("/api/config/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ e, tipo: "paso", paso, orden }),
      keepalive: true,
    }).catch(() => enviados.delete(clave));
  } catch {
    enviados.delete(clave);
  }
}

export function avanzar(e: string, paso: string, orden: number) {
  if (permitido) mandar(e, paso, orden);
  else if (!pendientes.some(([p]) => p === paso)) pendientes.push([paso, orden]);
}

/** Registra el paso al mostrarse la pantalla (y lo pendiente, al aceptar). */
export function useAvance(paso: string | null, orden: number) {
  const { enlace, estado } = useConfigurador();
  useEffect(() => {
    if (estado.acepto && !permitido) {
      permitido = true;
      for (const [p, o] of pendientes.splice(0)) mandar(enlace.e, p, o);
    }
    if (paso) avanzar(enlace.e, paso, orden);
  }, [enlace.e, paso, orden, estado.acepto]);
}
