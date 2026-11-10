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
export type Pantalla = "queTieneHoy" | "acp" | "acpCierre" | "quienUsa" | "contenido";

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
  /** La app del estudiante juega la tarea (motor real, una partida por enlace). */
  jugar?: boolean;
  /** Su ruta, por rol (`/<camino>/<url>`). Si no se da, la del `id`. */
  url?: string;
  /** Módulos que la escena muestra aunque el plan elegido no los traiga (solo en la vista previa). */
  mostrar?: string[];
}

const centro = (titulo: string, texto: string): PasoTutorial => ({ objetivo: null, titulo, texto, posicion: "center" });

export const ESCENAS: Record<Exclude<Ruta, "libre">, Escena[]> = {
  ahorro: [
    { id: "hoy", url: "su-colegio-hoy", rol: "Su colegio hoy", pantalla: "queTieneHoy" },
    {
      id: "rector", rol: "Ahora usted es el rector", plataforma: "admin", ir: "/home",
      tutorial: [
        centro("Este es su colegio en i'Witown", "Lo que hoy está en varias plataformas, aquí está en una sola."),
        { objetivo: { selector: 'a[href$="/mensajeria"]' }, titulo: "Comunicación", texto: "Mensajes, calendario y anuncios para docentes y familias." },
        { objetivo: { selector: 'img[alt="Estudiantes"]' }, titulo: "Lo académico", texto: "Tareas y reportes de cada estudiante." },
        { objetivo: { selector: 'a[href$="/operaciones"]' }, titulo: "Witkis y Feria", texto: "La moneda del colegio, que motiva a usar la plataforma." },
      ],
    },
    {
      id: "docente", rol: "Ahora usted es un docente", plataforma: "docentes", ir: "/dashboard",
      tutorial: [
        { objetivo: { selector: '[data-sidebar="menu-item"] a[href*="/parents-agenda"]' }, titulo: "Habla con las familias", texto: "Mensajes y calendario, sin grupos de WhatsApp." },
        { objetivo: { selector: '[data-sidebar="menu-item"] a[href$="/task-manager/assignment"]' }, titulo: "Asigna y revisa", texto: "Las tareas le llegan al estudiante y al papá." },
      ],
    },
    {
      id: "papa", rol: "Ahora usted es un papá", plataforma: "padres", ir: "/dashboard", mostrar: ["cobro", "cafeteria"],
      tutorial: [
        { objetivo: { selector: 'aside button[title="Agenda"]' }, titulo: "Todo del colegio, en un lugar", texto: "Mensajes, tareas y calendario de su hijo." },
        { objetivo: { selector: 'aside button[title="Pagos"]' }, titulo: "Paga en línea", texto: "La pensión mes a mes, sin filas." },
        { objetivo: { selector: 'aside button[title="Tienda"]' }, titulo: "La cafetería", texto: "Pide y recarga para su hijo desde aquí." },
      ],
    },
    {
      id: "tendero", rol: "Ahora usted es el tendero", plataforma: "tienda", ir: "/vender",
      tutorial: [
        { objetivo: { selector: "#buscarProd" }, titulo: "Vende en segundos", texto: "Busque el producto o páselo por el lector." },
        { objetivo: { texto: "Cobrar" }, titulo: "Cobra como quiera", texto: "Con el saldo del estudiante, fiado o becado." },
        { objetivo: { selector: 'a[href$="/pedidos"]' }, titulo: "Preventa", texto: "Lo que pidieron desde la app, listo para entregar." },
      ],
    },
  ],

  resultados: [
    { id: "acp", url: "apertura", rol: "Mejorar resultados", pantalla: "acp" },
    {
      id: "docente", rol: "Ahora usted es el docente", plataforma: "docentes", ir: "/task-manager/assignment", panel: "elegirTarea",
      tutorial: [
        centro("1. Su docente inicia un tema en clase y desea que se refuerce en casa", "Asígnele una tarea de afianzamiento. Haga cada paso: la guía lo espera."),
        { objetivo: { selector: 'button[role="radio"][title="Afianzamiento"]' }, accion: "clic", titulo: "Elija Afianzamiento", texto: "Es la tarea que refuerza el tema con preguntas a la medida de cada estudiante." },
        { objetivo: { texto: "Fecha y hora límite" }, accion: "formulario", titulo: "¿Hasta cuándo?", texto: "Elija la fecha y la hora de cierre, y confirme." },
        { objetivo: { texto: "Contenido" }, accion: "formulario", titulo: "¿Qué refuerza?", texto: "Elija la asignatura y busque el tema y el subtema entre las sugerencias." },
        { objetivo: { texto: "Características" }, accion: "formulario", titulo: "¿Cuánto tiempo?", texto: "Elija Tiempo (10, 15 o 20 minutos) y el puntaje." },
        { objetivo: { texto: "Instrucciones" }, accion: "formulario", titulo: "Explique el subtema", texto: "Un video, un enlace o un texto suyo: lo que el niño ve antes de las preguntas." },
        { objetivo: { selector: "button:has(> svg.lucide-send)" }, accion: "clic", titulo: "Envíela", texto: "Le llega a Cuarto A y, en seguida, usted la juega como estudiante." },
      ],
    },
    {
      id: "estudiante", rol: "Ahora usted es el estudiante", plataforma: "estudiante", ir: "/wiwiquest/question", jugar: true,
      tutorial: [centro("Le llegó la tarea", "Son las preguntas reales que ve el niño. Respóndalas.")],
    },
    {
      id: "papa", rol: "Ahora usted es el papá", plataforma: "padres", ir: "/agenda/tareas",
      tutorial: [
        centro("Ahora, el papá", "Su hijo acaba de hacer la tarea. Mire cómo se entera el papá."),
        { objetivo: { texto: "Entregada" }, titulo: "Su hijo ya hizo la tarea", texto: "En Tareas el papá ve la que usted asignó, ya entregada." },
        { objetivo: { texto: "progreso i'witown" }, ir: "/informes/progreso", titulo: "También tiene el informe", texto: "En Informes ve cómo va su hijo, sin esperar al boletín." },
        { objetivo: { selector: "table tbody tr.cursor-pointer" }, accion: "clic", titulo: "Lo que respondió hoy", texto: "Haga clic en la fila de hoy para profundizar." },
        { objetivo: { selector: 'td[colspan="6"]' }, posicion: "top", titulo: "Pregunta por pregunta", texto: "Qué respondió su hijo y cuál era la correcta, pregunta por pregunta." },
      ],
    },
    {
      id: "alejandro", url: "docente-reportes", rol: "Ahora usted es otra vez el docente", plataforma: "docentes", ir: "/students/reporte-estudiante", panel: "alejandro",
      tutorial: [
        { objetivo: { selector: "table tbody tr" }, titulo: "Cada estudiante, su reporte", texto: "Alejandro no terminó. Ábralo y mire en qué se trabó." },
      ],
    },
    {
      id: "colegio", url: "rector", rol: "Ahora usted es el rector", plataforma: "admin", ir: "/estudiantes/reportes",
      tutorial: [
        centro("Todo, en tiempo real", "Usted tiene la información de todos sus estudiantes, al día."),
        { objetivo: { texto: "Por grado / curso" }, accion: "clic", titulo: "Mire un curso", texto: "Haga clic en «Por grado / curso»." },
        { objetivo: { texto: "Ranking de asignaturas flojas" }, titulo: "Cada asignatura", texto: "En cuáles falla más el curso: ahí conviene hablar con el docente." },
        { objetivo: { selector: "div.space-y-5 > select" }, titulo: "Cada curso", texto: "Elija el curso que quiera revisar, o véalos todos juntos." },
        { objetivo: { selector: "div.space-y-5 > div.grid" }, titulo: "Lo más relevante", texto: "Cuántos lo usan, cuánto aciertan y qué alumnos están en riesgo." },
      ],
    },
    { id: "acp-cierre", url: "cierre", rol: "Mejorar resultados", pantalla: "acpCierre" },
  ],

  contenido: [{ id: "taller", url: "logbooks", rol: "Sus propios Logbooks", pantalla: "contenido" }],

  uso: [
    { id: "quien", rol: "Que de verdad lo usen", pantalla: "quienUsa" },
    {
      id: "estudiante", rol: "Ahora usted es el estudiante", plataforma: "estudiante", ir: "/home", mostrar: ["refuerzo"],
      tutorial: [
        centro("Entra porque quiere", "Gana Witkis, sube en el ranking y los gasta en premios."),
        { objetivo: { selector: "main button:has(img[alt='WiwiQuest'])" }, titulo: "Aprende jugando", texto: "Retos cortos que refuerzan lo que le cuesta." },
        { objetivo: { selector: "main button:has(img[alt='WORK'])" }, titulo: "Sus tareas", texto: "Lo que el docente le asignó, con su fecha." },
        { objetivo: { texto: "Cuenta de Witown" }, titulo: "Sus Witkis", texto: "Los gana participando y los gasta en la cafetería y en premios." },
      ],
    },
    {
      id: "papa", rol: "Ahora usted es un papá", plataforma: "padres", ir: "/dashboard", mostrar: ["refuerzo"],
      tutorial: [
        { objetivo: { texto: "estudiantes vinculados" }, titulo: "Un solo lugar", texto: "Sus hijos, sus docentes y los mensajes del colegio." },
        { objetivo: { selector: 'aside button[title="Informes"]' }, titulo: "Sabe cómo va", texto: "El progreso de su hijo, cuando quiera." },
      ],
    },
    {
      id: "rector", rol: "Ahora usted es el rector", plataforma: "admin", ir: "/tutores/informes-uso", panel: "feria",
      tutorial: [
        { objetivo: { texto: "Informes de uso" }, titulo: "Usted ve quién la usa", texto: "Curso por curso. Prenda la Feria en el recuadro de abajo a la derecha." },
      ],
    },
  ],
};
