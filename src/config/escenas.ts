/**
 * EL GUION DE LA DEMO — aquí se corrigen los textos.
 *
 * Cada camino es una lista de escenas. Una escena es una plataforma real a
 * pantalla completa (o una pantalla propia del configurador) con el tutorial por
 * pasos que sale encima (contrato: iwitown-docs/CONTRATO-tutorial.md).
 *
 * Reglas de texto: máximo dos líneas por paso; decir "Logbooks", nunca
 * "libros"; no decir "rutas de aprendizaje"; la A.C.P. solo en el camino de
 * resultados; el precio NO aparece hasta el final.
 *
 * `objetivo.texto` busca el elemento por su texto visible; `objetivo.selector`
 * por CSS. Si no lo encuentra, el paso sale centrado.
 */
import type { Ruta } from "@/lib/api";
import type { Plataforma } from "@/components/VistaPrevia";

export interface PasoTutorial {
  objetivo: { selector?: string; texto?: string } | null;
  titulo: string;
  texto: string;
  posicion?: "top" | "bottom" | "left" | "right" | "center";
  ir?: string;
  /** El paso espera a que la persona lo haga: "clic" o "formulario" (abre un modal). */
  accion?: "clic" | "formulario";
}

export type Panel = "elegirTarea" | "alejandro" | "feria";
export type Pantalla = "ahorroPlanes" | "ahorroLogbooks" | "queTieneHoy" | "acp" | "acpCierre" | "quienUsa" | "contenido" | "resultadosReales";

export interface Escena {
  id: string;
  /** Lo que dice la barra de arriba: quién es usted en esta escena. */
  rol: string;
  plataforma?: Plataforma;
  ir?: string;
  tutorial?: PasoTutorial[];
  /** Panel flotante del configurador sobre la plataforma. */
  panel?: Panel;
  /** O una pantalla propia del configurador, en vez de una plataforma. */
  pantalla?: Pantalla;
  /** La app del estudiante juega la tarea (motor real; partidas por enlace y por día: ver configuradorJugar). */
  jugar?: boolean;
  /** Su ruta, por rol (`/<camino>/<url>`). Si no se da, la del `id`. */
  url?: string;
  /** Módulos que la escena muestra aunque el plan elegido no los traiga (solo en la vista previa). */
  mostrar?: string[];
}

const centro = (titulo: string, texto: string): PasoTutorial => ({ objetivo: null, titulo, texto, posicion: "center" });

/** El paso final de un camino: resultados en uso real (config/resultadosReales.ts). */
const reporte = (rol = "Resultados reales"): Escena => ({ id: "reporte", url: "resultados-reales", rol, pantalla: "resultadosReales" });

export const ESCENAS: Record<Exclude<Ruta, "libre">, Escena[]> = {
  // Por pasos y sin visita guiada (decisión de la dueña, 2026-11-14): lo que
  // tiene hoy, los planes y los Logbooks (y la Feria); el precio, solo después de los datos.
  ahorro: [
    { id: "hoy", url: "su-colegio-hoy", rol: "Ahorrar costos", pantalla: "queTieneHoy" },
    { id: "planes", url: "planes", rol: "Ahorrar costos", pantalla: "ahorroPlanes" },
    { id: "logbooks", url: "logbooks", rol: "Ahorrar costos", pantalla: "ahorroLogbooks" },
  ],

  resultados: [
    { id: "acp", url: "apertura", rol: "Mejorar resultados", pantalla: "acp" },
    {
      id: "docente", rol: "Ahora usted es el docente", plataforma: "docentes", ir: "/task-manager/assignment", panel: "elegirTarea",
      // Sin tutorial: el recuadro pide solo la asignatura y el tema (dos pasos).
    },
    {
      id: "estudiante", rol: "Ahora usted es el estudiante", plataforma: "estudiante", ir: "/wiwiquest/question", jugar: true,
      tutorial: [centro("Paso 2 de 3: las preguntas", "Son las preguntas reales que ve el niño, sobre lo que usted eligió. Respóndalas.")],
    },
    {
      id: "colegio", url: "rector", rol: "Ahora usted es el rector", plataforma: "admin", ir: "/estudiantes/reportes",
      tutorial: [
        centro("Todo, en tiempo real", "Usted tiene la información de todos sus estudiantes, al día."),
        { objetivo: { texto: "Por grado / curso" }, accion: "clic", titulo: "Mire un curso", texto: "Haga clic en «Por grado / curso»." },
        { objetivo: { texto: "Ranking de asignaturas flojas" }, titulo: "Cada asignatura", texto: "En cuáles falla más el curso: ahí conviene hablar con el docente." },
        { objetivo: { selector: "div.space-y-5 > select" }, titulo: "Cada curso", texto: "Aquí se elige el curso a revisar, o se ven todos juntos." },
        { objetivo: { selector: "div.space-y-5 > div.grid" }, titulo: "Lo más relevante", texto: "Cuántos lo usan, cuánto aciertan y qué alumnos están en riesgo." },
      ],
    },
    reporte("Paso 3 de 3: resultados reales"),
    { id: "acp-cierre", url: "cierre", rol: "Mejorar resultados", pantalla: "acpCierre" },
  ],

  contenido: [{ id: "taller", url: "logbooks", rol: "Sus propios Logbooks", pantalla: "contenido" }],

  uso: [
    { id: "quien", rol: "Que de verdad lo usen", pantalla: "quienUsa" },
    {
      id: "estudiante", rol: "Ahora usted es el estudiante", plataforma: "estudiante", ir: "/home", mostrar: ["refuerzo"],
      tutorial: [
        centro("Entra porque quiere", "Gana Witkis, sube en el ranking y los gasta en premios."),
        { objetivo: { selector: "main button:has(img[alt='WiwiQuest'])" }, titulo: "Aprende jugando", texto: "El refuerzo de los temas puede ser diario: retos cortos en lo que le cuesta." },
        { objetivo: { selector: "main button:has(img[alt='WORK'])" }, titulo: "Sus tareas", texto: "Lo que el docente le asignó, con su fecha." },
        { objetivo: { texto: "Cuenta de Witown" }, titulo: "Sus Witkis", texto: "Los gana participando y los gasta en la cafetería y en premios." },
      ],
    },
    {
      id: "papa", rol: "Ahora usted es un papá", plataforma: "padres", ir: "/dashboard", mostrar: ["refuerzo", "cobro"],
      tutorial: [
        { objetivo: { texto: "estudiantes vinculados" }, titulo: "Un solo lugar", texto: "Sus hijos, sus docentes y los mensajes del colegio." },
        { objetivo: { selector: 'aside button[title="Agenda"]' }, titulo: "La nueva agenda", texto: "Mensajes del colegio, tareas y calendario en un solo lugar." },
        { objetivo: { selector: 'aside button[title="Pagos"]' }, titulo: "Recuperación de cartera", texto: "La pensión mes a mes, con pago en línea." },
        { objetivo: { selector: 'aside button[title="Informes"]' }, titulo: "Sabe cómo va", texto: "El progreso de su hijo, cuando quiera." },
      ],
    },
    {
      id: "rector", rol: "Ahora usted es el rector", plataforma: "admin", ir: "/tutores/informes-uso", panel: "feria",
      tutorial: [
        { objetivo: { texto: "Informes de uso" }, titulo: "Usted ve quién la usa", texto: "Curso por curso. Prenda la Feria en el recuadro de abajo a la derecha." },
      ],
    },
    reporte(),
  ],
};
