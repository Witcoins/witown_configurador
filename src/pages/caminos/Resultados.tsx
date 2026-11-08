import { useEffect, useState } from "react";
import { CONSEJOS, POR_VALIDAR } from "@/config/consejos";
import { useConfigurador } from "@/lib/estado";
import { leerSubtemas, type Partida, type Subtema } from "@/lib/api";
import { medir } from "@/lib/analitica";
import { Botones, Paso } from "@/components/Tablero";
import { Juego } from "@/components/Juego";
import { VistaPrevia } from "@/components/VistaPrevia";

const NIVEL_ALEJANDRO = "conceptualizacion_simbolica";

/**
 * Camino 1 — Mejorar resultados. Sin preguntas: "usted es todos los usuarios".
 * Docente → estudiante (motor real) → papá → docente con Alejandro → colegio.
 */
export function Resultados() {
  const { estado, despachar } = useConfigurador();
  const [paso, setPaso] = useState(0);
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [minutosOpc, setMinutosOpc] = useState<number[]>([10, 15, 20]);
  const [subtema, setSubtema] = useState("");
  const [minutos, setMinutos] = useState(10);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [verSignificado, setVerSignificado] = useState(false);
  const yaJugo = estado.jugo && !partida;
  const consejos = CONSEJOS[NIVEL_ALEJANDRO];

  useEffect(() => {
    leerSubtemas()
      .then((r) => {
        setSubtemas(r.subtemas);
        setMinutosOpc(r.minutos);
        setSubtema((s) => s || r.subtemas[0]?.id || "");
      })
      .catch(() => undefined);
  }, []);

  // Al terminar el camino, el refuerzo queda prendido en el tablero.
  const terminar = () => {
    if (!estado.prendidas.includes("refuerzo")) despachar({ tipo: "alternar", id: "refuerzo" });
    medir("resultados_fin");
    despachar({ tipo: "ir", paso: "numero" });
  };

  const pasos = [
    // 0 — Por qué importa
    <Paso key="0" etiqueta="Mejorar resultados" titulo="Refuerzo personalizado"
      texto="Está creado con la A.C.P.: i'Witown detecta dónde se traba cada estudiante y lo refuerza en eso, no en el resto. Así mejora su forma de pensar, y con ella sus resultados.">
      <div className="rounded-2xl bg-white p-5 text-gray-700 shadow-sm">
        En los próximos minutos usted será <strong>todos los usuarios</strong>: el docente, el estudiante, el papá y el colegio.
      </div>
      <Botones siguiente={() => setPaso(1)} textoSiguiente="Empezar" />
    </Paso>,

    // 1 — Docente
    <Paso key="1" etiqueta="Ahora usted es el docente" titulo="Asigne una tarea"
      texto="Los niños no estudian a la loca: el docente los guía. Elija un tema y la duración.">
      <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          {subtemas.map((s) => (
            <button key={s.id} aria-pressed={subtema === s.id} onClick={() => setSubtema(s.id)}
              className={`rounded-xl border-2 p-3 text-left ${subtema === s.id ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}>
              <span className="block text-xs text-gray-500">{s.asignatura}</span>
              <span className="block font-medium">{s.subtema}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-800">Duración:</span>
          {minutosOpc.map((m) => (
            <button key={m} aria-pressed={minutos === m} onClick={() => setMinutos(m)}
              className={`rounded-full px-4 py-1.5 text-sm ${minutos === m ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-900"}`}>
              {m} min
            </button>
          ))}
        </div>
      </div>
      <Botones atras={() => setPaso(0)} siguiente={() => { medir("resultados_tarea"); setPaso(2); }} textoSiguiente="Enviar al estudiante" />
    </Paso>,

    // 2 — Estudiante (motor real)
    <Paso key="2" etiqueta="Ahora usted es el estudiante" titulo="Le llegó la tarea" texto="Iníciela, respóndala y termínela.">
      {yaJugo ? (
        <div className="rounded-2xl bg-white p-5 text-gray-700 shadow-sm">
          Este enlace ya respondió su tarea. Siga para ver lo que quedó registrado.
        </div>
      ) : partida ? (
        <div className="rounded-2xl bg-green-50 p-5 text-green-900">Tarea terminada. Veamos quién se entera.</div>
      ) : (
        <Juego subtema={subtema} minutos={minutos} onFin={(p) => setPartida(p)} />
      )}
      {(yaJugo || partida) && <Botones atras={() => setPaso(1)} siguiente={() => setPaso(3)} />}
    </Paso>,

    // 3 — Papá
    <Paso key="3" etiqueta="Ahora usted es el papá" titulo="Su hijo ya hizo la tarea"
      texto="Ve cuánto sacó y qué respondió, sin preguntarle al colegio. (Lo que acaba de jugar puede tardar unos segundos en aparecer.)">
      <VistaPrevia plataforma="padres" ir="/informes/progreso" />
      <Botones atras={() => setPaso(2)} siguiente={() => setPaso(4)} />
    </Paso>,

    // 4 — Docente con Alejandro
    <Paso key="4" etiqueta="Ahora usted es otra vez el docente" titulo="Alejandro no terminó"
      texto="Respondió de cierta forma y quedó en un nivel. Así lo ve usted, con su reporte real.">
      <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-gray-900">Alejandro Ruiz · Cuarto A</p>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">{consejos.nombre}</span>
        </div>
        <button onClick={() => setVerSignificado((v) => !v)} className="text-sm font-semibold text-purple-700 underline">
          ¿Qué significa?
        </button>
        {verSignificado && <p className="text-sm text-gray-700">{consejos.significa}</p>}
        <p className="font-medium text-gray-800">¿Qué haría usted para que avance?</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><strong>Si no logra avanzar:</strong> {consejos.noAvanza}</li>
          <li><strong>Si avanza lento:</strong> {consejos.avanzaLento}</li>
          <li><strong>Si avanza muy rápido:</strong> {consejos.avanzaRapido}</li>
        </ul>
        {POR_VALIDAR && <p className="text-xs text-gray-400">Consejos en revisión pedagógica.</p>}
      </div>
      <VistaPrevia plataforma="docentes" ir="/students/reporte-estudiante" />
      <Botones atras={() => setPaso(3)} siguiente={() => setPaso(5)} />
    </Paso>,

    // 5 — Colegio
    <Paso key="5" etiqueta="Ahora usted es el colegio" titulo="Cada curso, en cada materia"
      texto="Así como vio a Alejandro, sus docentes ven a cada estudiante. Usted ve el grado y el curso, y puede preguntarle al profesor qué hace para mejorar ese porcentaje.">
      <VistaPrevia plataforma="admin" ir="/estudiantes/reportes" />
      <Botones atras={() => setPaso(4)} siguiente={() => setPaso(6)} />
    </Paso>,

    // 6 — Cierre del camino
    <Paso key="6" etiqueta="Mejorar resultados" titulo="Si lo sigue haciendo, mejora"
      texto="Está demostrado que el refuerzo mejora los resultados. Con la A.C.P., cada estudiante refuerza justo lo que necesita.">
      <Botones atras={() => setPaso(5)} siguiente={terminar} textoSiguiente="Ver el precio del plan con WiwiQuest" />
    </Paso>,
  ];

  return pasos[paso];
}
