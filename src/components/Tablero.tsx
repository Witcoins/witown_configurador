import { FUNCIONALIDADES, PRESETS } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";

/** Tarjetas con interruptor; el medidor de abajo se mueve con cada una. */
export function Tablero({ soloIds }: { soloIds?: string[] }) {
  const { estado, despachar } = useConfigurador();
  const lista = soloIds ? FUNCIONALIDADES.filter((f) => soloIds.includes(f.id)) : FUNCIONALIDADES;

  return (
    <div className="space-y-4">
      {!soloIds && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => despachar({ tipo: "prendidas", ids: PRESETS.economico })}
            className="rounded-full border border-purple-300 px-4 py-1.5 text-sm font-medium text-purple-800 hover:bg-purple-50">
            Lo más económico
          </button>
          <button onClick={() => despachar({ tipo: "prendidas", ids: PRESETS.completo })}
            className="rounded-full border border-purple-300 px-4 py-1.5 text-sm font-medium text-purple-800 hover:bg-purple-50">
            Lo más completo
          </button>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {lista.map((f) => {
          const prendida = estado.prendidas.includes(f.id);
          return (
            <li key={f.id}>
              <button role="switch" aria-checked={prendida} onClick={() => despachar({ tipo: "alternar", id: f.id })}
                className={`flex w-full items-start justify-between gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  prendida ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"
                }`}>
                <span>
                  <span className="block font-semibold text-gray-900">{f.nombre}</span>
                  <span className="block text-sm text-gray-600">{f.descripcion}</span>
                </span>
                <span aria-hidden className={`mt-1 h-6 w-11 shrink-0 rounded-full p-0.5 transition ${prendida ? "bg-purple-600" : "bg-gray-300"}`}>
                  <span className={`block h-5 w-5 rounded-full bg-white transition ${prendida ? "translate-x-5" : ""}`} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Un paso del recorrido: título corto, máximo dos líneas, y su contenido. */
export function Paso({ etiqueta, titulo, texto, children }: { etiqueta?: string; titulo: string; texto?: string; children?: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        {etiqueta && <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">{etiqueta}</p>}
        <h1 className="text-2xl font-bold text-purple-900">{titulo}</h1>
        {texto && <p className="text-gray-600">{texto}</p>}
      </header>
      {children}
    </section>
  );
}

export function Botones({ atras, siguiente, textoSiguiente = "Siguiente" }: { atras?: () => void; siguiente: () => void; textoSiguiente?: string }) {
  return (
    <div className="flex gap-2 pt-2">
      {atras && (
        <button onClick={atras} className="rounded-xl border border-purple-300 px-5 py-3 font-semibold text-purple-800 hover:bg-purple-50">
          Atrás
        </button>
      )}
      <button onClick={siguiente} className="flex-1 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800">
        {textoSiguiente}
      </button>
    </div>
  );
}
