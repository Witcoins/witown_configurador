/**
 * Tablero de funcionalidades — PROVISIONAL (plan del 2026-11-07, sección
 * "Funcionalidades del tablero"). Sale de lo que hoy existe en `main` de admin,
 * docentes, padres, estudiante y tienda. El reparto por plan está por confirmar.
 *
 * `plan` es el plan más barato que la incluye. "complemento" suma aparte
 * (precio en precios.json) y "logbooks" activa la columna con Logbooks.
 */
export type IdPlan = "basico" | "cafeteria" | "completo";

export interface Funcionalidad {
  id: string;
  nombre: string;
  /** Máximo dos líneas: lo demás lo cuenta la vista previa. */
  descripcion: string;
  plan: IdPlan | "complemento" | "logbooks";
  /** Plataformas donde se ve (para las vistas previas de la Fase 2). */
  donde: Array<"admin" | "docentes" | "padres" | "estudiante" | "tienda">;
}

export const FUNCIONALIDADES: Funcionalidad[] = [
  { id: "mensajeria", nombre: "Mensajería y agenda", descripcion: "Colegio, docentes y padres en un solo lugar, con firma de lectura.", plan: "basico", donde: ["admin", "docentes", "padres"] },
  { id: "calendario", nombre: "Calendario", descripcion: "El mismo evento llega a todos.", plan: "basico", donde: ["admin", "docentes", "padres", "estudiante"] },
  { id: "comunidad", nombre: "Comunidad", descripcion: "Red interna de docentes y colegio.", plan: "basico", donde: ["admin", "docentes", "estudiante"] },
  { id: "pqrs", nombre: "PQRS e institucional", descripcion: "Peticiones de los padres con seguimiento.", plan: "basico", donde: ["admin", "docentes", "padres"] },
  { id: "tareas", nombre: "Gestor de tareas", descripcion: "El docente asigna, el estudiante resuelve, el padre ve.", plan: "basico", donde: ["docentes", "estudiante", "padres"] },
  { id: "ranking", nombre: "Ranking de docentes", descripcion: "Los padres califican; el colegio ve el ranking.", plan: "basico", donde: ["padres", "admin"] },
  { id: "witkis", nombre: "Witkis y banco", descripcion: "Ganan, transfieren y gastan su moneda.", plan: "basico", donde: ["admin", "docentes", "padres", "estudiante"] },
  { id: "anuncios", nombre: "Anuncios", descripcion: "Una ventana que todos ven al entrar.", plan: "cafeteria", donde: ["admin", "docentes"] },
  { id: "cafeteria", nombre: "Cafetería escolar", descripcion: "Preventa desde la app y punto de venta del tendero.", plan: "cafeteria", donde: ["tienda", "padres", "estudiante"] },
  { id: "cobro", nombre: "Cobro a padres", descripcion: "Cartera mes a mes y pago en línea.", plan: "cafeteria", donde: ["admin", "padres"] },
  { id: "refuerzo", nombre: "Refuerzo del aprendizaje", descripcion: "WiwiQuest refuerza a cada estudiante donde se traba.", plan: "completo", donde: ["estudiante", "docentes", "padres", "admin"] },
  { id: "lectura", nombre: "Lectura (Wiwi Lee)", descripcion: "Tableros de lectura y evaluación por voz.", plan: "completo", donde: ["admin", "docentes", "padres"] },
  { id: "producto-semana", nombre: "Producto de la semana", descripcion: "Compras con Witkis que motivan a entrar.", plan: "completo", donde: ["admin", "estudiante"] },
  { id: "feria", nombre: "Feria i'Witown", descripcion: "El colegio la organiza y le da sentido a la plataforma.", plan: "complemento", donde: ["admin"] },
  { id: "logbooks", nombre: "Logbooks propios", descripcion: "Diarios de aprendizaje con su portada y su contenido.", plan: "logbooks", donde: [] },
];

/** Lo que trae prendido "Lo más económico" y "Lo más completo". */
export const PRESETS = {
  economico: FUNCIONALIDADES.filter((f) => f.plan === "basico").map((f) => f.id),
  completo: FUNCIONALIDADES.filter((f) => f.plan !== "complemento").map((f) => f.id),
};
