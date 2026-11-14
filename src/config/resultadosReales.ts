/**
 * RESULTADOS EN USO REAL — el paso final de cada camino.
 *
 * Cifras de un colegio que usa i'Witown, sin nombrarlo (decisión del equipo,
 * 2026-11-12). Solo indicadores fuertes. Leídas de Firestore en solo lectura el
 * 2026-11-12, año 2026; los porcentajes de actividad salen del informe de uso
 * generado el 2026-09-20. Las de "Mejorar resultados" salen del seguimiento de
 * WiwiQuest del 2026-11-13 (75 estudiantes; debilidad = principio flojo por
 * estudiante y tema; "4 respuestas" es la mediana hasta la primera). Las
 * 23.847 preguntas son las del banco de WiwiQuest (generadas con IA, más de 20
 * asignaturas), contadas en Firestore en la misma consulta de cifras de uso. Al
 * actualizarlas, cambiar también estas fechas.
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
      { cifra: "96 %", dice: "de los papás la usan activamente", acento: "MUY ALTO" },
    ],
  },
  resultados: {
    titulo: "La A.C.P. encuentra a tiempo dónde se traba cada estudiante",
    indicadores: [
      { cifra: "13.158", dice: "debilidades detectadas a tiempo, por estudiante y tema" },
      { cifra: "4 respuestas", dice: "le bastan para encontrar la primera debilidad" },
      { cifra: "96 %", dice: "de los papás la usan activamente", acento: "MUY ALTO" },
      { cifra: "62 temas", dice: "reforzados en promedio por cada estudiante" },
    ],
  },
  uso: {
    titulo: "La usan de verdad",
    indicadores: [
      { cifra: "96 %", dice: "de los papás la usan activamente", acento: "MUY ALTO" },
      { cifra: "3.059", dice: "mensajes del colegio a las familias, sin grupos de WhatsApp" },
      { cifra: "23.847", dice: "preguntas generadas con IA y alineadas al currículo" },
      { cifra: "100 %", dice: "de los papás tienen a su hijo vinculado" },
    ],
  },
};
