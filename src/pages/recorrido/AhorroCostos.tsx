import { useEffect } from "react";
import { FUNCIONALIDADES } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { avanzar } from "@/lib/progreso";
import { BotonSiguiente, Insignia, PantallaWiwiQuest } from "@/components/Pregunta";
import { CuantosEstudiantes, TablaPlanes } from "@/components/TablaPlanes";
import { RESULTADOS_REALES } from "@/config/resultadosReales";

const AREAS = ["Ciencias Naturales", "Ciencias Sociales", "Matemáticas", "Lengua Castellana"];

/*
 * Camino Ahorrar costos, por pasos (dueña, 2026-11-14), sin visita guiada:
 *  1. ¿Qué tiene hoy? (QueTieneHoy, en Pantallas.tsx)
 *  2. AhorroPlanes: los planes con sus funcionalidades y cuántos estudiantes.
 *  3. AhorroLogbooks: sus propios Logbooks; con o sin Logbooks y con o sin Feria.
 *     "Consulte su cotización y compare" lleva a los datos (SuNumero): el precio y
 *     la comparación con lo que paga hoy se ven solo después de darlos.
 */

/** El video de Logbooks de la landing del ecosistema. Sin autoPlay (7 MB); en el celular, el vertical. */
export function VideoLogbooks() {
  return (
    <div>
      <video src="/video/logbooks.mp4" poster="/video/logbooks.webp" playsInline controls preload="none"
        aria-label="Así son los Logbooks" className="hidden w-full rounded-2xl border-2 border-[#E6E6E6] shadow-sm sm:block" />
      <video src="/video/logbooks-vertical.mp4" poster="/video/logbooks-vertical.webp" playsInline controls preload="none"
        aria-label="Así son los Logbooks" className="mx-auto block max-h-[70vh] rounded-2xl border-2 border-[#E6E6E6] shadow-sm sm:hidden" />
    </div>
  );
}

const BASICO = FUNCIONALIDADES.filter((f) => f.plan === "basico").map((f) => f.id);

/** Paso 2: los planes y cuántos estudiantes. */
export function AhorroPlanes({ siguiente }: { siguiente: () => void }) {
  const { estado, cotizacion: c, despachar } = useConfigurador();
  const reales = RESULTADOS_REALES.ahorro;
  // Aquí siempre hay un plan de la plataforma (venir de "Solo Logbooks" con un enlace libre).
  useEffect(() => {
    if (c.plan.id === "solo_logbooks") despachar({ tipo: "prendidas", ids: Array.from(new Set([...BASICO, ...estado.prendidas])) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <PantallaWiwiQuest ancha>
      <div className="animate-aparecer space-y-6 pb-8">
        <h1 className="text-center text-2xl font-extrabold text-[#443773] lg:text-3xl">Los planes y lo que trae cada uno</h1>
        <CuantosEstudiantes />
        <TablaPlanes sinExtras />
        <div className="rounded-2xl border-2 border-[#554884]/30 bg-[#554884]/5 p-4">
          <p className="font-bold text-[#443773]">Además, cobro de cartera</p>
          <p className="text-sm text-gray-700">La plataforma les cobra a los padres la pensión mes a mes, con pago en línea y conciliación en el panel del colegio (desde el plan Pro).</p>
        </div>
        {reales && (
          <section className="space-y-3 text-center">
            <Insignia texto="Resultados que hemos obtenido en su uso real" />
            <p className="text-xl font-extrabold text-[#333] lg:text-2xl">{reales.titulo}</p>
            <div className="grid gap-3 md:grid-cols-3">
              {reales.indicadores.map((x) => (
                <div key={x.dice} className="space-y-1 rounded-2xl border-2 border-[#E6E6E6] bg-white/95 p-4 shadow-sm">
                  <p className="text-3xl font-extrabold text-[#443773]">{x.cifra}</p>
                  {x.acento && (
                    <span className="inline-block rounded-full bg-[hsl(274_85%_37%)] px-3 py-0.5 text-xs font-extrabold tracking-wide text-white">{x.acento}</span>
                  )}
                  <p className="text-sm text-gray-700">{x.dice}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="flex justify-end">
          <BotonSiguiente onClick={() => { medir("ahorro_planes"); siguiente(); }}>Siguiente →</BotonSiguiente>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Paso 3: sus propios Logbooks, y si los quiere; también la Feria. */
export function AhorroLogbooks() {
  const { enlace, estado, despachar } = useConfigurador();
  const con = (id: string) => estado.prendidas.includes(id);
  const poner = (id: string, si: boolean) => {
    if (con(id) !== si) despachar({ tipo: "alternar", id });
  };

  return (
    <PantallaWiwiQuest ancha>
      <div className="animate-aparecer space-y-6 pb-8">
        <h1 className="text-center text-2xl font-extrabold text-[#443773] lg:text-3xl">Sus propios Logbooks en lugar de textos de editorial</h1>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <VideoLogbooks />
          <div className="space-y-4 text-gray-700">
            <p className="text-lg font-extrabold text-[#443773]">Logbooks: diarios de aprendizaje de su colegio</p>
            <div>
              <p className="text-sm">Un diario de aprendizaje para cada una de las cuatro áreas básicas:</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {AREAS.map((a) => <li key={a} className="rounded-full bg-[#F5E6D3] px-3 py-1 text-sm font-semibold text-[#333]">{a}</li>)}
              </ul>
            </div>
            <p className="text-sm">Se construyen con el esquema metodológico y la identidad de su colegio, no con los de una editorial, e integrados a la plataforma.</p>
            <p className="text-sm">
              El estudiante no solo lee: escribe, resuelve y reflexiona sobre lo que aprende, y así su aprendizaje queda a la vista.
              El docente sigue el avance página por página, sin recoger cuadernos, y los papás comprueban que sí se usa.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Eleccion titulo="¿Con Logbooks?" si={con("logbooks")} cambiar={(v) => poner("logbooks", v)} textoSi="Con Logbooks" textoNo="Sin Logbooks" />
          <Eleccion titulo="¿Con la Feria i'Witown?" si={con("feria")} cambiar={(v) => poner("feria", v)} textoSi="Con Feria" textoNo="Sin Feria" />
        </div>

        <div className="flex justify-end">
          <BotonSiguiente onClick={() => {
            medir("ahorro_logbooks", { logbooks: con("logbooks") ? "si" : "no", feria: con("feria") ? "si" : "no" });
            // Lo mismo que el fin de camino (Recorrido) y la pantalla de precio (Plan) miden.
            medir("camino_fin", { ruta: "ahorro" });
            avanzar(enlace.e, "plan", 50);
            medir("estudiantes", { estudiantes: estado.estudiantes });
            medir("plan");
            despachar({ tipo: "estudiantesConfirmado" });
            despachar({ tipo: "ir", paso: "numero" });
          }}>
            Consulte su cotización y compare →
          </BotonSiguiente>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

function Eleccion({ titulo, si, cambiar, textoSi, textoNo }: { titulo: string; si: boolean; cambiar: (v: boolean) => void; textoSi: string; textoNo: string }) {
  return (
    <div className="space-y-2 rounded-2xl border-2 border-[#E6E6E6] bg-white p-4">
      <p className="font-bold text-[#333]">{titulo}</p>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button key={String(v)} aria-pressed={si === v} onClick={() => cambiar(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${si === v ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>
            {v ? textoSi : textoNo}
          </button>
        ))}
      </div>
    </div>
  );
}
