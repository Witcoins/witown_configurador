import { useConfigurador } from "@/lib/estado";
import { OPCIONES } from "@/pages/Entrada";
import { Ahorro } from "@/pages/caminos/Ahorro";
import { Resultados } from "@/pages/caminos/Resultados";
import { Contenido } from "@/pages/caminos/Contenido";
import { Uso } from "@/pages/caminos/Uso";

/**
 * El camino elegido. Si el enlace trae ruta fija, solo esa; si no, el menú de
 * los cuatro caminos queda siempre visible y se salta sin perder lo elegido.
 */
export function Camino() {
  const { enlace, estado, despachar } = useConfigurador();
  const libre = enlace.ruta === "libre";

  return (
    <div className="space-y-6">
      {libre && (
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Caminos">
          {OPCIONES.map((o) => (
            <button key={o.ruta} aria-pressed={estado.ruta === o.ruta} onClick={() => despachar({ tipo: "ruta", valor: o.ruta })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                estado.ruta === o.ruta ? "bg-purple-700 text-white" : "bg-white text-purple-900 shadow-sm"
              }`}>
              {o.titulo}
            </button>
          ))}
        </nav>
      )}
      {estado.ruta === "ahorro" && <Ahorro key="ahorro" />}
      {estado.ruta === "resultados" && <Resultados key="resultados" />}
      {estado.ruta === "contenido" && <Contenido key="contenido" />}
      {estado.ruta === "uso" && <Uso key="uso" />}
    </div>
  );
}
