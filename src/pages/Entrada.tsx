import precios from "@/config/precios.json";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import type { Ruta } from "@/lib/api";

/** Las cuatro razones por las que un colegio cambia de editorial. Sin "otro" ni "todo". */
export const OPCIONES: { ruta: Exclude<Ruta, "libre">; titulo: string; frase: string }[] = [
  { ruta: "resultados", titulo: "Mejorar resultados", frase: "Que cada estudiante avance donde se traba." },
  { ruta: "ahorro", titulo: "Ahorrar costos", frase: "Mueva lo que paga hoy y vea su número." },
  { ruta: "contenido", titulo: "Usar mi propio contenido", frase: "Sus Logbooks, a su manera." },
  { ruta: "uso", titulo: "Que de verdad lo usen", frase: "Que padres y estudiantes entren por gusto." },
];

export function Entrada() {
  const { enlace, estado, despachar } = useConfigurador();
  const { minimo, maximo } = precios.estudiantes;
  const rutaFija = enlace.ruta !== "libre";

  const seguir = (ruta?: Ruta) => {
    if (ruta) despachar({ tipo: "ruta", valor: ruta });
    medir("entrada", { ruta: ruta ?? estado.ruta ?? "", estudiantes: estado.estudiantes });
    despachar({ tipo: "ir", paso: "camino" });
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-purple-900 sm:text-3xl">
          Bienvenido(a){enlace.colegio ? `, ${enlace.colegio}` : ""}
        </h1>
        <p className="text-gray-600">Arme su i'Witown, véalo funcionando y llévese su número.</p>
      </header>

      <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <label htmlFor="estudiantes" className="block font-semibold text-gray-800">
          ¿Cuántos estudiantes tiene?
        </label>
        <div className="flex items-center gap-4">
          <input
            id="estudiantes"
            type="range"
            min={minimo}
            max={maximo}
            step={10}
            value={Math.min(maximo, Math.max(minimo, estado.estudiantes))}
            onChange={(ev) => despachar({ tipo: "estudiantes", valor: Number(ev.target.value) })}
            className="w-full accent-purple-700"
          />
          <input
            type="number"
            inputMode="numeric"
            min={1}
            aria-label="Número de estudiantes"
            value={estado.estudiantes}
            onChange={(ev) => despachar({ tipo: "estudiantes", valor: Math.max(1, Number(ev.target.value) || 1) })}
            className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right"
          />
        </div>
      </div>

      {rutaFija ? (
        <button
          onClick={() => seguir()}
          className="w-full rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
        >
          Empezar
        </button>
      ) : (
        <div className="space-y-3">
          <p className="font-semibold text-gray-800">Al contratar este producto, usted busca…</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPCIONES.map((o) => (
              <button
                key={o.ruta}
                onClick={() => seguir(o.ruta)}
                className="rounded-2xl border-2 border-purple-100 bg-white p-4 text-left transition hover:border-purple-500"
              >
                <span className="block font-semibold text-purple-900">{o.titulo}</span>
                <span className="block text-sm text-gray-600">{o.frase}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
