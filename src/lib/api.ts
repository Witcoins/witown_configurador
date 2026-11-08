/**
 * Todo va al mismo origen: el sitio de Hosting reescribe /api/config/**,
 * /api/horas y /api/agendar a sus Cloud Functions. No hay sesión ni token de
 * usuario: lo único que identifica al visitante es el token del enlace.
 */

export type Ruta = "libre" | "resultados" | "ahorro" | "contenido" | "uso";

export interface Enlace {
  e: string;
  colegio: string;
  ruta: Ruta;
  asesora: { nombre: string; whatsapp: string };
  generaciones_restantes: number;
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  // Si no llega JSON (p. ej. en local sin funciones, Vite devuelve index.html),
  // es un error, no un enlace vacío.
  const esJson = (res.headers.get("content-type") || "").includes("application/json");
  const datos = esJson ? await res.json().catch(() => ({})) : {};
  if (!esJson || !res.ok || datos.ok === false) {
    const error = new Error(datos.mensaje || "No pudimos completar esto. Intente de nuevo.") as Error & { usado?: boolean };
    error.usado = datos.usado === true;
    throw error;
  }
  return datos as T;
}

export async function leerEnlace(e: string): Promise<Enlace> {
  const d = await pedir<Omit<Enlace, "e">>(`/api/config/enlace?e=${encodeURIComponent(e)}`);
  return { ...d, e };
}

export const enviarLead = (cuerpo: Record<string, unknown>) =>
  pedir<{ ok: true }>("/api/config/lead", { method: "POST", body: JSON.stringify(cuerpo) });

/** El lead es por enlace y por correo: por eso viaja el correo con que se registró. */
export const avisarAgendo = (e: string, correo: string, cupo: string, cuando: string) =>
  pedir<{ ok: true }>("/api/config/evento", {
    method: "POST",
    body: JSON.stringify({ e, correo, tipo: "agendo", cupo, cuando }),
  });

export const crearReferido = (e: string, correo: string) =>
  pedir<{ ok: true; e: string }>("/api/config/referido", { method: "POST", body: JSON.stringify({ e, correo }) });

// ---------- El juego (camino Mejorar resultados) ----------

export interface Subtema {
  id: string;
  asignatura: string;
  tema: string;
  subtema: string;
}

export interface PreguntaJuego {
  id: string;
  question: string;
  options: string[];
  imageUrl?: string;
}

export interface Partida {
  partida: string;
  estudiante: { uid: string; nombre: string; curso: string; avatar: string };
  asignatura: string;
  tema: string;
  subtema: string;
  preguntas: PreguntaJuego[];
}

export const leerSubtemas = () => pedir<{ subtemas: Subtema[]; minutos: number[] }>("/api/config/jugar");

export const empezarPartida = (e: string, subtema: string, minutos: number) =>
  pedir<Partida>("/api/config/jugar", { method: "POST", body: JSON.stringify({ e, accion: "empezar", subtema, minutos }) });

export const responderPregunta = (e: string, partida: string, pregunta_id: string, opcion: number, segundos: number) =>
  pedir<{ correcta: boolean; correctAnswer: number; retroalimentacion: string; fin: boolean }>("/api/config/jugar", {
    method: "POST",
    body: JSON.stringify({ e, accion: "responder", partida, pregunta_id, opcion, segundos }),
  });

export interface DiaAgenda {
  fecha: string;
  rotulo: string;
  horas: { llave: string; rotulo: string }[];
}

export const leerHoras = () => pedir<{ dias: DiaAgenda[] }>("/api/horas");

export const agendar = (datos: { nombre: string; correo: string; celular: string; colegio: string; cupo: string }) =>
  pedir<{ ok: true; mensaje: string }>("/api/agendar", { method: "POST", body: JSON.stringify(datos) });
