import { useEffect } from "react";
import { FUNCIONALIDADES, type IdPlan } from "@/config/funcionalidades";
import precios from "@/config/precios.json";
import { useConfigurador } from "@/lib/estado";

const ORDEN: IdPlan[] = ["basico", "cafeteria", "completo"];
const PLANES = ORDEN.map((id) => precios.planes.find((p) => p.id === id)!);
const DEL_PLAN = FUNCIONALIDADES.filter((f) => ORDEN.includes(f.plan as IdPlan));
const EXTRAS = FUNCIONALIDADES.filter((f) => f.plan === "complemento" || f.plan === "logbooks");

/**
 * Las funcionalidades en una sola tabla con los tres planes: el rector toca una
 * columna y queda prendido lo de ese plan (lo de los anteriores incluido).
 * Logbooks y la Feria van aparte: se suman a cualquier plan. Sin precios aquí:
 * el precio sale abajo, con el plan elegido.
 */
export function TablaPlanes() {
  const { estado, cotizacion: c, despachar } = useConfigurador();
  // -1 con Solo Logbooks: ninguna columna marcada.
  const elegido = ORDEN.indexOf(c.plan.id as IdPlan);
  const extrasPrendidos = estado.prendidas.filter((id) => EXTRAS.some((f) => f.id === id));
  const elegir = (n: number) => despachar({
    tipo: "prendidas",
    ids: [...DEL_PLAN.filter((f) => ORDEN.indexOf(f.plan as IdPlan) <= n).map((f) => f.id), ...extrasPrendidos],
  });
  // Una pestaña con funcionalidades sueltas (del tablero anterior): se deja el
  // plan completo, para que la tabla, el resumen y el PDF digan lo mismo.
  const delPlanPrendidas = estado.prendidas.filter((id) => DEL_PLAN.some((f) => f.id === id));
  const esperadas = DEL_PLAN.filter((f) => ORDEN.indexOf(f.plan as IdPlan) <= elegido).map((f) => f.id);
  const suelto = delPlanPrendidas.length !== esperadas.length || esperadas.some((id) => !delPlanPrendidas.includes(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (suelto) elegir(elegido); }, [suelto]);
  const celda = (n: number) => (n === elegido ? "bg-[#554884]/10" : "");

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border-2 border-[#E6E6E6] bg-white">
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">Funcionalidades incluidas en cada plan</caption>
          <thead>
            <tr>
              <th scope="col" className="w-auto p-2 text-left text-xs font-semibold text-gray-500">Toque un plan</th>
              {PLANES.map((p, n) => (
                <th key={p.id} scope="col" className={`w-[72px] p-1 sm:w-28 ${celda(n)}`}>
                  <button onClick={() => elegir(n)} aria-pressed={n === elegido}
                    className={`w-full rounded-full px-1 py-1.5 text-[11px] font-bold sm:px-2 sm:text-sm ${n === elegido ? "bg-[hsl(274_85%_37%)] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>
                    {p.nombre}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEL_PLAN.map((f) => {
              const desde = ORDEN.indexOf(f.plan as IdPlan);
              return (
                <tr key={f.id} className="border-t border-[#F0F0F0]">
                  <th scope="row" className="p-2 text-left font-normal">
                    <span className="block font-semibold text-gray-900">{f.nombre}</span>
                    <span className="hidden text-xs text-gray-500 sm:block">{f.descripcion}</span>
                  </th>
                  {PLANES.map((p, n) => (
                    <td key={p.id} className={`p-2 text-center ${celda(n)}`}>
                      {n >= desde
                        ? <><span aria-hidden className="font-bold text-[#554884]">✓</span><span className="sr-only">Incluido</span></>
                        : <><span aria-hidden className="text-gray-300">—</span><span className="sr-only">No incluido</span></>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Se suman a cualquier plan</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {EXTRAS.map((f) => {
            const prendida = estado.prendidas.includes(f.id);
            return (
              <li key={f.id}>
                <button role="switch" aria-checked={prendida} onClick={() => despachar({ tipo: "alternar", id: f.id })}
                  className={`flex w-full items-start justify-between gap-3 rounded-2xl border-2 p-3 text-left transition ${
                    prendida ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"
                  }`}>
                  <span>
                    <span className="block font-semibold text-gray-900">{f.nombre}</span>
                    <span className="block text-xs text-gray-600">{f.descripcion}</span>
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
    </div>
  );
}

/** Cuántos estudiantes tiene el colegio: con eso se cotiza el total. */
export function CuantosEstudiantes() {
  const { estado, despachar } = useConfigurador();
  const { minimo, maximo } = precios.estudiantes;
  return (
    <section className="space-y-3 rounded-2xl border-2 border-[#E6E6E6] bg-white p-5">
      <p className="font-extrabold text-[#443773]">¿Cuántos estudiantes tiene su colegio?</p>
      <div className="flex items-center gap-4">
        <input type="range" min={minimo} max={maximo} step={10} aria-label="Número de estudiantes"
          value={Math.min(maximo, Math.max(minimo, estado.estudiantes))}
          onChange={(ev) => despachar({ tipo: "estudiantes", valor: Number(ev.target.value) })}
          className="min-w-0 flex-1 accent-[#554884]" />
        <input type="number" inputMode="numeric" min={1} value={estado.estudiantes} aria-label="Escriba el número de estudiantes"
          onChange={(ev) => despachar({ tipo: "estudiantes", valor: Math.max(1, Number(ev.target.value) || 1) })}
          className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right text-lg font-extrabold text-[#443773]" />
      </div>
    </section>
  );
}
