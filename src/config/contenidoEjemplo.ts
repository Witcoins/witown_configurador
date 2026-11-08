/**
 * CONTENIDO DE EJEMPLO (decisión 2026-11-08) para el camino "Usar mi propio
 * contenido". Las plantillas reales de los Logbooks y la lista de temas por
 * área según los DBA del Ministerio están pendientes (Santiago); cuando
 * lleguen, se reemplaza este archivo. La pantalla lo rotula como ejemplo.
 */
export const AREAS = ["Matemáticas", "Lenguaje", "Ciencias Naturales", "Ciencias Sociales", "Inglés"];
export const CURSOS = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"];

export const COLORES = ["#6d28d9", "#0f766e", "#b45309", "#be123c", "#1d4ed8", "#4d7c0f"];

export const PLANTILLAS = [
  { id: "clasica", nombre: "Clásica", descripcion: "Pregunta, exploración y lo que aprendí." },
  { id: "mapa", nombre: "Mapa mental", descripcion: "Una idea al centro y sus ramas." },
  { id: "proyecto", nombre: "Proyecto", descripcion: "Reto, plan, evidencias y reflexión." },
  { id: "laboratorio", nombre: "Laboratorio", descripcion: "Hipótesis, experimento y conclusión." },
];

export interface TemaGuia {
  id: string;
  titulo: string;
  /** Semana del año escolar (1-40) en que se planea. */
  semana: number;
}

/** Guía de EJEMPLO por área (no es la lista DBA validada). */
export const GUIA_EJEMPLO: Record<string, TemaGuia[]> = {
  Matemáticas: [
    { id: "m1", titulo: "Números hasta 100 000", semana: 2 },
    { id: "m2", titulo: "Multiplicación y división", semana: 7 },
    { id: "m3", titulo: "Fracciones con igual denominador", semana: 13 },
    { id: "m4", titulo: "Perímetro y área", semana: 20 },
    { id: "m5", titulo: "Datos y gráficas", semana: 28 },
  ],
  Lenguaje: [
    { id: "l1", titulo: "El cuento y sus partes", semana: 3 },
    { id: "l2", titulo: "La descripción", semana: 9 },
    { id: "l3", titulo: "Textos informativos", semana: 16 },
    { id: "l4", titulo: "La carta", semana: 24 },
  ],
  "Ciencias Naturales": [
    { id: "c1", titulo: "Los seres vivos y su entorno", semana: 4 },
    { id: "c2", titulo: "La energía y sus formas", semana: 12 },
    { id: "c3", titulo: "Las fuerzas", semana: 21 },
  ],
  "Ciencias Sociales": [
    { id: "s1", titulo: "Mi municipio", semana: 5 },
    { id: "s2", titulo: "El mercado y el trabajo", semana: 14 },
    { id: "s3", titulo: "Las regiones de Colombia", semana: 25 },
  ],
  Inglés: [
    { id: "i1", titulo: "Family and friends", semana: 3 },
    { id: "i2", titulo: "Weather and clothes", semana: 11 },
    { id: "i3", titulo: "My town", semana: 22 },
  ],
};

/** La semana del año escolar de una fecha (inicio aproximado: primera semana de febrero). */
export function semanaEscolar(fecha: Date): number {
  const inicio = new Date(fecha.getFullYear(), 1, 1);
  const s = Math.floor((fecha.getTime() - inicio.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
  return Math.min(40, Math.max(1, s));
}
