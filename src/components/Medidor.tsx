import { useConfigurador } from "@/lib/estado";
import { pesos } from "@/lib/precio";

/** Precio vivo: fijo abajo, cambia con cada cosa que se prende o apaga. */
export function Medidor() {
  const { cotizacion: c, estado } = useConfigurador();
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-purple-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-purple-700">
            Plan {c.plan.nombre}
            {c.conLogbooks ? " · con Logbooks" : ""}
          </p>
          {c.porCotizar.length > 0 && (
            <p className="truncate text-xs text-gray-500">+ {c.porCotizar.join(", ")} por cotizar</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold leading-tight text-purple-900 sm:text-xl">
            {pesos(c.porEstudiante)}
            <span className="text-xs font-normal text-gray-500"> /estudiante al año</span>
          </p>
          <p className="text-xs text-gray-600">
            {estado.estudiantes} estudiantes · {pesos(c.totalAnual)} al año
          </p>
        </div>
      </div>
    </div>
  );
}
