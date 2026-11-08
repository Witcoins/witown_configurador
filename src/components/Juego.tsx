import { useState } from "react";
import { useConfigurador } from "@/lib/estado";
import { empezarPartida, responderPregunta, type Partida } from "@/lib/api";
import { medir } from "@/lib/analitica";

/**
 * Las preguntas REALES del motor, como el estudiante de prueba del enlace.
 * La respuesta correcta llega solo después de responder (la califica el servidor).
 */
export function Juego({ subtema, minutos, onFin }: { subtema: string; minutos: number; onFin: (partida: Partida) => void }) {
  const { enlace, despachar } = useConfigurador();
  const [partida, setPartida] = useState<Partida | null>(null);
  const [i, setI] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<{ correcta: boolean; correctAnswer: number; retro: string } | null>(null);
  const [inicio, setInicio] = useState(Date.now());

  const empezar = async () => {
    setError("");
    setCargando(true);
    try {
      const p = await empezarPartida(enlace.e, subtema, minutos);
      despachar({ tipo: "jugo" });
      setPartida(p);
      setInicio(Date.now());
      medir("juego_empezo");
    } catch (e) {
      if ((e as { usado?: boolean }).usado) despachar({ tipo: "jugo" });
      setError(e instanceof Error ? e.message : "No pudimos preparar las preguntas.");
    } finally {
      setCargando(false);
    }
  };

  const responder = async (opcion: number) => {
    if (!partida || resultado) return;
    const pregunta = partida.preguntas[i];
    setCargando(true);
    try {
      const r = await responderPregunta(enlace.e, partida.partida, pregunta.id, opcion, Math.round((Date.now() - inicio) / 1000));
      setResultado({ correcta: r.correcta, correctAnswer: r.correctAnswer, retro: r.retroalimentacion });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos registrar la respuesta.");
    } finally {
      setCargando(false);
    }
  };

  const siguiente = () => {
    if (!partida) return;
    setResultado(null);
    setInicio(Date.now());
    if (i + 1 < partida.preguntas.length) setI(i + 1);
    else {
      medir("juego_termino");
      onFin(partida);
    }
  };

  if (!partida) {
    return (
      <div className="space-y-3 rounded-2xl bg-white p-5 text-center shadow-sm">
        <p className="text-gray-700">Le llegó la tarea. Son preguntas reales del motor, las mismas que vería un niño de Cuarto.</p>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button onClick={empezar} disabled={cargando}
          className="rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-60">
          {cargando ? "Preparando sus preguntas (unos segundos)…" : "Iniciar la tarea"}
        </button>
      </div>
    );
  }

  const p = partida.preguntas[i];
  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{partida.asignatura} · {partida.subtema}</span>
        <span>Pregunta {i + 1} de {partida.preguntas.length}</span>
      </div>
      <p className="text-lg font-semibold text-gray-900">{p.question}</p>
      {p.imageUrl && <img src={p.imageUrl} alt="" className="mx-auto max-h-48 rounded-lg" />}
      <div className="grid gap-2">
        {p.options.map((o, k) => {
          const marcada = resultado && k === resultado.correctAnswer;
          return (
            <button key={k} disabled={!!resultado || cargando} onClick={() => responder(k)}
              className={`rounded-xl border-2 px-4 py-3 text-left transition ${
                marcada ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-purple-500"
              }`}>
              {o}
            </button>
          );
        })}
      </div>
      {resultado && (
        <div className={`rounded-xl p-4 ${resultado.correcta ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900"}`}>
          <p className="font-semibold">{resultado.correcta ? "¡Correcto!" : "Esta no era."}</p>
          {resultado.retro && <p className="text-sm">{resultado.retro}</p>}
          <button onClick={siguiente} className="mt-3 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white">
            {i + 1 < partida.preguntas.length ? "Siguiente pregunta" : "Terminar la tarea"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
