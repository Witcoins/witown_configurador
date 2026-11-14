import { useConfigurador } from "@/lib/estado";
import { pagaHoyPorEstudiante, pesos } from "@/lib/precio";
import { medir } from "@/lib/analitica";
import { useAvance } from "@/lib/progreso";
import { Tablero } from "@/components/Tablero";
import precios from "@/config/precios.json";
import { BotonSiguiente, Insignia, PantallaWiwiQuest, TarjetaPregunta } from "@/components/Pregunta";
import FondoWiwiQuest from "@/components/FondoWiwiQuest";

/**
 * Al final del recorrido, ya con el valor visto: arme su plan y, recién ahora,
 * el precio. Si dijo lo que paga hoy, "pare y compare".
 */
export function Plan() {
  const { estado, cotizacion: c, despachar } = useConfigurador();
  useAvance(estado.estudiantesConfirmado ? "plan" : "estudiantes", estado.estudiantesConfirmado ? 50 : 45);
  const hoy = estado.actualConfirmado ? pagaHoyPorEstudiante(estado.actual) : null;
  const max = Math.max(hoy ?? 0, c.porEstudiante, 1);

  // Antes del precio, la única pregunta que hace falta para cotizar.
  if (!estado.estudiantesConfirmado) {
    const { minimo, maximo } = precios.estudiantes;
    return (
      <PantallaWiwiQuest>
        <div className="animate-aparecer space-y-5">
          <div className="text-center"><Insignia texto="Una última pregunta" /></div>
          <TarjetaPregunta>¿Cuántos estudiantes tiene su colegio?</TarjetaPregunta>
          <div className="space-y-4 rounded-2xl border-2 border-[#E6E6E6] bg-white/90 p-5">
            <p className="text-center text-4xl font-extrabold text-[#443773]">{estado.estudiantes.toLocaleString("es-CO")}</p>
            <input type="range" min={minimo} max={maximo} step={10} aria-label="Número de estudiantes"
              value={Math.min(maximo, Math.max(minimo, estado.estudiantes))}
              onChange={(ev) => despachar({ tipo: "estudiantes", valor: Number(ev.target.value) })}
              className="w-full accent-[#554884]" />
            <label className="flex items-center justify-center gap-2 text-sm text-gray-600">
              O escríbalo:
              <input type="number" inputMode="numeric" min={1} value={estado.estudiantes}
                onChange={(ev) => despachar({ tipo: "estudiantes", valor: Math.max(1, Number(ev.target.value) || 1) })}
                className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right" />
            </label>
          </div>
          <div className="flex justify-between">
            <button onClick={() => despachar({ tipo: "ir", paso: "camino" })} className="rounded-2xl px-4 py-2 font-medium text-[#554884] hover:bg-[#554884]/10">Atrás</button>
            <BotonSiguiente onClick={() => { medir("estudiantes", { estudiantes: estado.estudiantes }); despachar({ tipo: "estudiantesConfirmado" }); }}>
              Arme su plan →
            </BotonSiguiente>
          </div>
        </div>
      </PantallaWiwiQuest>
    );
  }

  return (
    <div className="relative z-0 min-h-screen bg-white font-nunito">
      <FondoWiwiQuest variant={1} claro />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-40">
        <header className="space-y-2 text-center">
          <Insignia texto="Arme su plan" />
          <h1 className="text-2xl font-extrabold text-[#443773] lg:text-3xl">Prenda lo que quiere para su colegio</h1>
        </header>
        <Tablero />

        {hoy != null && (
          <section className="space-y-3 rounded-2xl border-2 border-[#E6E6E6] bg-white p-5">
            <p className="font-extrabold text-[#443773]">Pare y compare · por estudiante al año</p>
            <Barra etiqueta="Hoy, aprox. (textos + plataforma)" valor={hoy} max={max} color="bg-gray-400" />
            <Barra etiqueta={`i'Witown · ${c.plan.nombre}${c.conLogbooks ? " con Logbooks" : ""}`} valor={c.porEstudiante} max={max} color="bg-[#554884]" />
            <p className={`font-bold ${hoy - c.porEstudiante >= 0 ? "text-green-700" : "text-[#443773]"}`}>
              {hoy - c.porEstudiante >= 0
                ? `Ahorra ${pesos(hoy - c.porEstudiante)} por estudiante: ${pesos((hoy - c.porEstudiante) * estado.estudiantes)} al año.`
                : `Son ${pesos(c.porEstudiante - hoy)} más por estudiante, con todo en un solo lugar.`}
            </p>
            <p className="text-sm text-gray-600">
              {c.conLogbooks
                ? "Por el precio de la editorial: sus propios Logbooks más la plataforma."
                : "Prenda Logbooks: por el precio de la editorial, sus propios Logbooks más la plataforma."}
            </p>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-purple-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#554884]">Plan {c.plan.nombre}{c.conLogbooks ? " · con Logbooks" : ""}</p>
            <p className="text-xl font-extrabold text-[#443773]">{pesos(c.porEstudiante)} <span className="text-xs font-normal text-gray-500">/estudiante al año</span></p>
            {c.porCotizar.length > 0 && <p className="text-xs text-gray-500">+ {c.porCotizar.join(", ")} por cotizar</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => despachar({ tipo: "ir", paso: "camino" })} className="rounded-full px-4 py-2 font-semibold text-[#554884] hover:bg-[#554884]/10">Atrás</button>
            <button onClick={() => { medir("plan"); despachar({ tipo: "ir", paso: "numero" }); }}
              className="rounded-full bg-[hsl(274_85%_37%)] px-5 py-2 font-bold text-white">Ver mi inversión →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Barra({ etiqueta, valor, max, color }: { etiqueta: string; valor: number; max: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-gray-700">{etiqueta}</span><b>{pesos(valor)}</b></div>
      <div className="h-6 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.round((valor / max) * 100)}%` }} />
      </div>
    </div>
  );
}
