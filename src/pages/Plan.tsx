import { useConfigurador } from "@/lib/estado";
import { nombreCotizacion } from "@/lib/precio";
import { medir } from "@/lib/analitica";
import { useAvance } from "@/lib/progreso";
import { CuantosEstudiantes, TablaPlanes } from "@/components/TablaPlanes";
import { Insignia } from "@/components/Pregunta";
import FondoWiwiQuest from "@/components/FondoWiwiQuest";

/**
 * Al final del recorrido, ya con el valor visto: en una sola pantalla, cuántos
 * estudiantes y el plan (tabla Básico · Pro · Completo) y, recién ahora, el
 * precio (sin "pare y compare": decisión de la dueña, 2026-11-14).
 */
export function Plan() {
  const { estado, cotizacion: c, despachar } = useConfigurador();
  useAvance("plan", 50);

  return (
    <div className="relative z-0 min-h-screen bg-white font-nunito">
      <FondoWiwiQuest variant={1} claro />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-40">
        <header className="space-y-2 text-center">
          <Insignia texto="Conozca su precio" />
          <h1 className="text-2xl font-extrabold text-[#443773] lg:text-3xl">Su colegio y el plan que quiere</h1>
        </header>

        <CuantosEstudiantes />

        <TablaPlanes />

      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-purple-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#554884]">{nombreCotizacion(c)}</p>
            {c.porCotizar.length > 0 && <p className="text-xs text-gray-500">+ {c.porCotizar.join(", ")} por cotizar</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => despachar({ tipo: "ir", paso: "camino" })} className="rounded-full px-4 py-2 font-semibold text-[#554884] hover:bg-[#554884]/10">Atrás</button>
            <button onClick={() => {
                medir("estudiantes", { estudiantes: estado.estudiantes });
                medir("plan");
                despachar({ tipo: "estudiantesConfirmado" });
                despachar({ tipo: "ir", paso: "numero" });
              }}
              className="rounded-full bg-[hsl(274_85%_37%)] px-5 py-2 font-bold text-white">Ver mi inversión →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
