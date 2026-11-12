/**
 * RESULTADOS EN USO REAL — el paso final de cada camino.
 *
 * Cifras de un colegio que usa i'Witown, sin nombrarlo (decisión del equipo,
 * 2026-11-12). Solo indicadores fuertes. Leídas de Firestore en solo lectura el
 * 2026-11-12, año 2026; los porcentajes de actividad salen del informe de uso
 * generado el 2026-09-20. Al actualizarlas, cambiar también esta fecha.
 */
import type { Ruta } from "@/lib/api";

export interface Indicador {
  cifra: string;
  dice: string;
  /** Una palabra de acento, opcional (p. ej. "MUY ALTO"). */
  acento?: string;
}

export const RESULTADOS_REALES: Partial<Record<Exclude<Ruta, "libre">, { titulo: string; indicadores: Indicador[] }>> = {
  ahorro: {
    titulo: "Menos papel, menos grupos, una sola plataforma",
    indicadores: [
      { cifra: "12.859", dice: "firmas digitales de circulares, sin imprimir una hoja" },
      { cifra: "3.059", dice: "mensajes del colegio a las familias, sin grupos de WhatsApp" },
      { cifra: "100 %", dice: "de los docentes y directivos la usan" },
    ],
  },
  resultados: {
    titulo: "Refuerzo real, fuera del salón",
    indicadores: [
      { cifra: "124.410", dice: "preguntas de refuerzo contestadas por los estudiantes" },
      { cifra: "505 horas", dice: "de estudio fuera de clase" },
      { cifra: "81 %", dice: "de acierto, y el colegio ve qué asignatura reforzar" },
    ],
  },
  uso: {
    titulo: "La usan de verdad",
    indicadores: [
      { cifra: "96 %", dice: "de los papás la usan activamente", acento: "MUY ALTO" },
      { cifra: "100 %", dice: "de los papás tienen a su hijo vinculado" },
      { cifra: "100 %", dice: "de los docentes y directivos la usan" },
    ],
  },
};
