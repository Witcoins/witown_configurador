import precios from "@/config/precios.json";
import { FUNCIONALIDADES, type IdPlan } from "@/config/funcionalidades";

const ORDEN: IdPlan[] = ["basico", "cafeteria", "completo"];

/** "solo_logbooks": Logbooks sin plataforma (4 logbooks, precios.json). */
export type IdCotizado = IdPlan | "solo_logbooks";

export interface Cotizacion {
  plan: { id: IdCotizado; nombre: string };
  conLogbooks: boolean;
  /** Por estudiante al año, sin complementos. */
  porEstudiante: number;
  /** Complementos prendidos que aún no tienen precio. */
  porCotizar: string[];
  /** null si no hay número de estudiantes: sin eso no se cotiza. */
  totalAnual: number | null;
}

/**
 * El plan más barato que contiene todo lo prendido; más Logbooks si están.
 * Solo Logbooks prendidos (ninguna funcionalidad de la plataforma): Solo Logbooks.
 */
export function cotizar(prendidas: Iterable<string>, estudiantes: number | null): Cotizacion {
  const ids = new Set(prendidas);
  let nivel = 0;
  let hayPlataforma = false;
  let conLogbooks = false;
  let complemento = 0;
  const porCotizar: string[] = [];

  for (const f of FUNCIONALIDADES) {
    if (!ids.has(f.id)) continue;
    if (f.plan === "logbooks") conLogbooks = true;
    else if (f.plan === "complemento") {
      const c = (precios.complementos as Record<string, { nombre: string; por_estudiante: number | null }>)[f.id];
      if (c?.por_estudiante != null) complemento += c.por_estudiante;
      else porCotizar.push(c?.nombre ?? f.nombre);
    } else {
      hayPlataforma = true;
      nivel = Math.max(nivel, ORDEN.indexOf(f.plan));
    }
  }

  const n = estudiantes && estudiantes > 0 ? Math.round(estudiantes) : null;
  if (conLogbooks && !hayPlataforma) {
    const solo = precios.solo_logbooks;
    const porEstudiante = solo.por_estudiante + complemento;
    return {
      plan: { id: "solo_logbooks", nombre: solo.nombre },
      conLogbooks,
      porEstudiante,
      porCotizar,
      totalAnual: n == null ? null : porEstudiante * n,
    };
  }

  const plan = precios.planes.find((p) => p.id === ORDEN[nivel])!;
  const porEstudiante = (conLogbooks ? plan.con_logbooks : plan.plataforma) + complemento;
  return {
    plan: { id: plan.id as IdPlan, nombre: plan.nombre },
    conLogbooks,
    porEstudiante,
    porCotizar,
    totalAnual: n == null ? null : porEstudiante * n,
  };
}

/** Cómo se nombra lo cotizado: "Plan Pro con Logbooks" o "Solo Logbooks". */
export function nombreCotizacion(c: Pick<Cotizacion, "plan" | "conLogbooks">): string {
  if (c.plan.id === "solo_logbooks") return c.plan.nombre;
  return `Plan ${c.plan.nombre}${c.conLogbooks ? " con Logbooks" : ""}`;
}

/** Lo que paga hoy por estudiante al año: libros que pagan los padres + plataforma. */
export function pagaHoyPorEstudiante(actual: {
  pagan_padres_al_anio: number | null;
  tiene_plataforma: boolean;
  costo_plataforma_al_anio: number | null;
}): number | null {
  const libros = actual.pagan_padres_al_anio ?? null;
  const plataforma = actual.tiene_plataforma ? actual.costo_plataforma_al_anio ?? 0 : 0;
  if (libros == null && !actual.tiene_plataforma) return null;
  return (libros ?? 0) + plataforma;
}

export function pesos(n: number | null | undefined): string {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("es-CO");
}
