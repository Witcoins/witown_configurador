import { useState } from "react";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { Botones, Paso } from "@/components/Tablero";
import { Juego } from "@/components/Juego";
import { VistaPrevia, type Plataforma } from "@/components/VistaPrevia";

type Quien = "padres" | "estudiantes" | "ambos";
const ROLES: { id: Plataforma; nombre: string; ir: string | null; frase: string }[] = [
  { id: "estudiante", nombre: "Estudiante", ir: null, frase: "Entra porque gana Witkis, sube en el ranking y ve en qué gastarlos." },
  { id: "padres", nombre: "Padre", ir: null, frase: "El progreso de su hijo y los mensajes del colegio, en un solo lugar." },
  { id: "docentes", nombre: "Docente", ir: null, frase: "Asigna, revisa y ve quién entró." },
  { id: "admin", nombre: "Rector", ir: "/tutores/informes-uso", frase: "Ve cuánto se usa la plataforma, curso por curso." },
];

/** Camino 4 — Que de verdad lo usen. */
export function Uso() {
  const { estado, despachar } = useConfigurador();
  const [quien, setQuien] = useState<Quien | null>(null);
  const [rol, setRol] = useState<Plataforma>("estudiante");
  const [jugando, setJugando] = useState(false);
  const feria = estado.prendidas.includes("feria");

  if (!quien) {
    return (
      <Paso etiqueta="Que de verdad lo usen" titulo="¿Quién quiere que la use más?"
        texto="Esta sí se usa porque tiene un propósito: Witkis, premios, la Feria. Y todo está en un solo lugar.">
        <div className="grid gap-3 sm:grid-cols-3">
          {([["padres", "Los papás"], ["estudiantes", "Los estudiantes"], ["ambos", "Ambos"]] as [Quien, string][]).map(([id, t]) => (
            <button key={id} onClick={() => { setQuien(id); setRol(id === "padres" ? "padres" : "estudiante"); medir("uso_quien", { quien: id }); }}
              className="rounded-2xl border-2 border-purple-100 bg-white p-4 font-semibold text-purple-900 hover:border-purple-500">
              {t}
            </button>
          ))}
        </div>
      </Paso>
    );
  }

  const r = ROLES.find((x) => x.id === rol)!;
  return (
    <Paso etiqueta="Que de verdad lo usen" titulo="La misma semana, desde cada uno" texto={r.frase}>
      <div className="flex flex-wrap gap-2">
        {ROLES.map((x) => (
          <button key={x.id} aria-pressed={x.id === rol} onClick={() => { setRol(x.id); setJugando(false); }}
            className={`rounded-full px-4 py-1.5 text-sm ${x.id === rol ? "bg-purple-700 text-white" : "bg-white text-purple-900 shadow-sm"}`}>
            {x.nombre}
          </button>
        ))}
      </div>

      {rol === "estudiante" && !estado.jugo && (
        jugando
          ? <Juego subtema="fracciones" minutos={10} onFin={() => setJugando(false)} />
          // Es la misma y única partida del enlace que usa "Mejorar resultados".
          : <button onClick={() => setJugando(true)} className="w-full rounded-xl bg-amber-400 px-5 py-3 font-semibold text-amber-950 hover:bg-amber-300">
              Juegue un reto corto como estudiante
            </button>
      )}

      {rol === "admin" && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <label className="flex items-center justify-between gap-3">
            <span className="font-medium text-gray-800">Feria / Olimpiadas activas</span>
            <input type="checkbox" className="h-5 w-5 accent-purple-700" checked={feria}
              onChange={() => despachar({ tipo: "alternar", id: "feria" })} />
          </label>
          <UsoIlustrativo conFeria={feria} />
          <p className="text-sm text-gray-600">El colegio organiza la Feria y eso le da sentido a la plataforma.</p>
        </div>
      )}

      {!jugando && <VistaPrevia plataforma={rol} ir={r.ir} alto="60vh" onJugar={() => { if (!estado.jugo) setJugando(true); }} />}
      <Botones atras={() => setQuien(null)} siguiente={() => { medir("uso_fin"); despachar({ tipo: "ir", paso: "numero" }); }} textoSiguiente="Ver mi número" />
    </Paso>
  );
}

/** Ilustrativo (no son datos de un colegio): cómo sube el uso con propósito. */
function UsoIlustrativo({ conFeria }: { conFeria: boolean }) {
  const valor = conFeria ? 78 : 34;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span>Estudiantes que entran cada semana</span><span className="font-semibold">{valor}%</span></div>
      <div className="h-5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-purple-600 transition-all duration-700" style={{ width: `${valor}%` }} />
      </div>
      <p className="text-xs text-gray-400">Ilustrativo: {conFeria ? "con Feria u Olimpiadas" : "solo contenido"}.</p>
    </div>
  );
}
