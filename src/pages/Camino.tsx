import { FUNCIONALIDADES, PRESETS } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { OPCIONES } from "@/pages/Entrada";

/**
 * Fase 1: el tablero básico de funcionalidades, para que el número tenga de
 * dónde salir. Los recorridos guiados de cada ruta (vistas previas, "usted es
 * el docente"…) llegan en las fases 2 a 5 y se montan aquí según `estado.ruta`.
 */
export function Camino() {
  const { estado, despachar } = useConfigurador();
  const ruta = OPCIONES.find((o) => o.ruta === estado.ruta);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-purple-700">{ruta?.titulo}</p>
        <h1 className="text-2xl font-bold text-purple-900">Arme su plataforma</h1>
        <p className="text-gray-600">Prenda lo que quiere. El precio de abajo se mueve solo.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => despachar({ tipo: "prendidas", ids: PRESETS.economico })}
          className="rounded-full border border-purple-300 px-4 py-1.5 text-sm font-medium text-purple-800 hover:bg-purple-50"
        >
          Lo más económico
        </button>
        <button
          onClick={() => despachar({ tipo: "prendidas", ids: PRESETS.completo })}
          className="rounded-full border border-purple-300 px-4 py-1.5 text-sm font-medium text-purple-800 hover:bg-purple-50"
        >
          Lo más completo
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {FUNCIONALIDADES.map((f) => {
          const prendida = estado.prendidas.includes(f.id);
          return (
            <li key={f.id}>
              <button
                role="switch"
                aria-checked={prendida}
                onClick={() => despachar({ tipo: "alternar", id: f.id })}
                className={`flex w-full items-start justify-between gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  prendida ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"
                }`}
              >
                <span>
                  <span className="block font-semibold text-gray-900">{f.nombre}</span>
                  <span className="block text-sm text-gray-600">{f.descripcion}</span>
                </span>
                <span
                  aria-hidden
                  className={`mt-1 h-6 w-11 shrink-0 rounded-full p-0.5 transition ${prendida ? "bg-purple-600" : "bg-gray-300"}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-white transition ${prendida ? "translate-x-5" : ""}`} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => {
          medir("camino_listo", { plan: estado.prendidas.length });
          despachar({ tipo: "ir", paso: "numero" });
        }}
        className="w-full rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
      >
        Ver mi número
      </button>
    </section>
  );
}
