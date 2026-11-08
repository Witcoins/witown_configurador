import { useMemo, useState } from "react";
import { FUNCIONALIDADES } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";
import { pagaHoyPorEstudiante, pesos } from "@/lib/precio";
import { medir } from "@/lib/analitica";
import { Botones, Paso, Tablero } from "@/components/Tablero";
import { NOMBRES_PLATAFORMA, VistaPrevia, type Plataforma } from "@/components/VistaPrevia";

const EDITORIALES = ["SM", "Santillana", "Norma", "Richmond", "Otra"];
const PLATAFORMAS: Plataforma[] = ["admin", "docentes", "padres", "estudiante", "tienda"];

/** Camino 2 — "Mueva lo que paga hoy y vea cuánto se ahorra". */
export function Ahorro() {
  const { estado, despachar, cotizacion: c } = useConfigurador();
  const [paso, setPaso] = useState(estado.actualConfirmado ? 1 : 0);
  const a = estado.actual;

  // Solo las plataformas donde se ve algo de lo prendido (la tienda, solo con cafetería).
  const plataformas = useMemo(() => {
    const prendidas = FUNCIONALIDADES.filter((f) => estado.prendidas.includes(f.id));
    return PLATAFORMAS.filter((p) => prendidas.some((f) => f.donde.includes(p)));
  }, [estado.prendidas]);
  const [vista, setVista] = useState<Plataforma>("admin");
  const vistaActual = plataformas.includes(vista) ? vista : plataformas[0];

  if (paso === 0) {
    return (
      <Paso etiqueta="Ahorrar costos" titulo="¿Qué tiene hoy?" texto="Ajuste los valores. Ya vienen con lo más común.">
        <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Editorial</p>
            <div className="flex flex-wrap gap-2">
              {EDITORIALES.map((e) => (
                <button key={e} aria-pressed={a.editorial === e} onClick={() => despachar({ tipo: "actual", valor: { editorial: e } })}
                  className={`rounded-full px-4 py-1.5 text-sm ${a.editorial === e ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-900"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Deslizador etiqueta="Textos por estudiante" min={0} max={12} paso={1}
            valor={a.libros_por_estudiante ?? 0} formato={(n) => String(n)}
            cambiar={(n) => despachar({ tipo: "actual", valor: { libros_por_estudiante: n } })} />
          <Deslizador etiqueta="Lo que pagan los padres por ellos, al año" min={0} max={600000} paso={10000}
            valor={a.pagan_padres_al_anio ?? 0} formato={pesos}
            cambiar={(n) => despachar({ tipo: "actual", valor: { pagan_padres_al_anio: n } })} />
          <div className="space-y-2">
            <p className="font-medium text-gray-800">¿Tiene plataforma aparte?</p>
            <div className="flex gap-2">
              <button onClick={() => despachar({ tipo: "actual", valor: { tiene_plataforma: true, costo_plataforma_al_anio: a.costo_plataforma_al_anio ?? 40000 } })}
                className={`rounded-full px-4 py-1.5 text-sm ${a.tiene_plataforma ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-900"}`}>Sí</button>
              <button onClick={() => despachar({ tipo: "actual", valor: { tiene_plataforma: false } })}
                className={`rounded-full px-4 py-1.5 text-sm ${!a.tiene_plataforma ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-900"}`}>No tenemos plataforma</button>
            </div>
            {a.tiene_plataforma && (
              <Deslizador etiqueta="Costo de la plataforma por estudiante, al año" min={0} max={300000} paso={5000}
                valor={a.costo_plataforma_al_anio ?? 0} formato={pesos}
                cambiar={(n) => despachar({ tipo: "actual", valor: { costo_plataforma_al_anio: n } })} />
            )}
          </div>
        </div>
        <Botones siguiente={() => { despachar({ tipo: "actualConfirmado" }); medir("ahorro_actual"); setPaso(1); }} />
      </Paso>
    );
  }

  if (paso === 1) {
    return (
      <Paso etiqueta="Ahorrar costos" titulo="Arme su plataforma" texto="Prenda lo que quiere. El precio de abajo se mueve solo.">
        <Tablero />
        <Botones atras={() => setPaso(0)} siguiente={() => setPaso(2)} textoSiguiente="Así se vería su plataforma" />
      </Paso>
    );
  }

  if (paso === 2) {
    return (
      <Paso etiqueta="Cacharréela" titulo="Así se vería su plataforma" texto="Son las plataformas reales, solo con lo que prendió.">
        <div className="flex flex-wrap gap-2">
          {plataformas.map((p) => (
            <button key={p} aria-pressed={p === vistaActual} onClick={() => setVista(p)}
              className={`rounded-full px-3 py-1.5 text-sm ${p === vistaActual ? "bg-purple-700 text-white" : "bg-white text-purple-900 shadow-sm"}`}>
              {NOMBRES_PLATAFORMA[p]}
            </button>
          ))}
        </div>
        {vistaActual && <VistaPrevia plataforma={vistaActual} />}
        <p className="text-center font-semibold text-purple-900">Eso le cuesta {pesos(c.porEstudiante)} por estudiante al año.</p>
        <Botones atras={() => setPaso(1)} siguiente={() => setPaso(3)} textoSiguiente="Pare y compare" />
      </Paso>
    );
  }

  const hoy = pagaHoyPorEstudiante(a) ?? 0;
  const iw = c.porEstudiante;
  const max = Math.max(hoy, iw, 1);
  const diferencia = hoy - iw;
  return (
    <Paso etiqueta="Pare y compare" titulo="Lo que paga hoy contra i'Witown" texto="Por estudiante al año. Mueva lo elegido y las barras se actualizan.">
      <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <Barra etiqueta="Hoy (editorial + plataforma)" valor={hoy} max={max} color="bg-gray-400" />
        <Barra etiqueta={`i'Witown · ${c.plan.nombre}${c.conLogbooks ? " con Logbooks" : ""}`} valor={iw} max={max} color="bg-purple-600" />
        <p className={`text-lg font-bold ${diferencia >= 0 ? "text-green-700" : "text-purple-900"}`}>
          {diferencia >= 0
            ? `Ahorra ${pesos(diferencia)} por estudiante: ${pesos(diferencia * estado.estudiantes)} al año.`
            : `Son ${pesos(-diferencia)} más por estudiante, con todo en un solo lugar.`}
        </p>
        <p className="text-sm text-gray-600">
          {c.conLogbooks
            ? "Por el precio de la editorial: sus propios Logbooks más la plataforma."
            : "Prenda Logbooks: por el precio de la editorial, sus propios Logbooks más la plataforma."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { despachar({ tipo: "prendidas", ids: FUNCIONALIDADES.filter((f) => f.plan === "basico").map((f) => f.id) }); }}
          className="rounded-full border border-purple-300 px-4 py-1.5 text-sm font-medium text-purple-800">Lo más económico</button>
        <button onClick={() => { despachar({ tipo: "prendidas", ids: FUNCIONALIDADES.filter((f) => f.plan !== "complemento").map((f) => f.id) }); }}
          className="rounded-full border border-purple-300 px-4 py-1.5 text-sm font-medium text-purple-800">Lo más completo</button>
      </div>
      <Botones atras={() => setPaso(2)} siguiente={() => despachar({ tipo: "ir", paso: "numero" })} textoSiguiente="Ver mi número" />
    </Paso>
  );
}

function Deslizador({ etiqueta, min, max, paso, valor, formato, cambiar }: {
  etiqueta: string; min: number; max: number; paso: number; valor: number; formato: (n: number) => string; cambiar: (n: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="flex justify-between text-sm font-medium text-gray-800">
        {etiqueta}<span className="text-purple-900">{formato(valor)}</span>
      </span>
      <input type="range" min={min} max={max} step={paso} value={valor} onChange={(e) => cambiar(Number(e.target.value))}
        className="w-full accent-purple-700" />
    </label>
  );
}

function Barra({ etiqueta, valor, max, color }: { etiqueta: string; valor: number; max: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-gray-700">{etiqueta}</span><span className="font-semibold">{pesos(valor)}</span></div>
      <div className="h-6 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.round((valor / max) * 100)}%` }} />
      </div>
    </div>
  );
}
