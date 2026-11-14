import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { avanzar } from "@/lib/progreso";
import { nombreCotizacion, pesos } from "@/lib/precio";
import { BotonSiguiente, Insignia, PantallaWiwiQuest } from "@/components/Pregunta";
import { CuantosEstudiantes, TablaPlanes } from "@/components/TablaPlanes";
import { RESULTADOS_REALES } from "@/config/resultadosReales";

const AREAS = ["Ciencias Naturales", "Ciencias Sociales", "Matemáticas", "Lengua Castellana"];

/**
 * Camino Ahorrar costos, en una sola pantalla (decisión de la dueña,
 * 2026-11-14): sin visita guiada por las plataformas. El video de Logbooks (el
 * mismo de la landing del ecosistema), qué son, el cobro de cartera, los
 * resultados en uso real, cuántos estudiantes y los tres planes; de aquí va directo a pedir cotización y demo.
 */
export function AhorroCostos() {
  const { enlace, estado, cotizacion: c, despachar } = useConfigurador();
  const reales = RESULTADOS_REALES.ahorro;
  const pedir = () => {
    // Lo mismo que el fin de camino (Recorrido) y la pantalla de precio (Plan) miden.
    medir("camino_fin", { ruta: "ahorro" });
    avanzar(enlace.e, "plan", 50);
    medir("estudiantes", { estudiantes: estado.estudiantes });
    medir("plan");
    despachar({ tipo: "estudiantesConfirmado" });
    despachar({ tipo: "ir", paso: "numero" });
  };

  return (
    <PantallaWiwiQuest ancha>
      <div className="animate-aparecer space-y-6 pb-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-extrabold text-[#443773] lg:text-3xl">Sus propios Logbooks en lugar de textos de editorial</h1>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Sin autoPlay: con él se bajarían los 7 MB al entrar aunque no lo mire. En el celular, el vertical (como la landing). */}
          <div>
            <video src="/video/logbooks.mp4" poster="/video/logbooks.webp" playsInline controls preload="none"
              aria-label="Así son los Logbooks" className="hidden w-full rounded-2xl border-2 border-[#E6E6E6] shadow-sm sm:block" />
            <video src="/video/logbooks-vertical.mp4" poster="/video/logbooks-vertical.webp" playsInline controls preload="none"
              aria-label="Así son los Logbooks" className="mx-auto block max-h-[70vh] rounded-2xl border-2 border-[#E6E6E6] shadow-sm sm:hidden" />
          </div>
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
            <div className="rounded-2xl border-2 border-[#554884]/30 bg-[#554884]/5 p-4">
              <p className="font-bold text-[#443773]">Además, cobro de cartera</p>
              <p className="text-sm">La plataforma les cobra a los padres la pensión mes a mes, con pago en línea y conciliación en el panel del colegio (desde el plan Pro).</p>
            </div>
          </div>
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

        <CuantosEstudiantes />
        <TablaPlanes />

        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border-2 border-[#E6E6E6] bg-white p-4 sm:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#554884]">{nombreCotizacion(c)}</p>
            <p className="text-xl font-extrabold text-[#443773]">{pesos(c.porEstudiante)} <span className="text-xs font-normal text-gray-500">/estudiante al año</span></p>
            {c.porCotizar.length > 0 && <p className="text-xs text-gray-500">+ {c.porCotizar.join(", ")} por cotizar</p>}
          </div>
          <BotonSiguiente onClick={pedir}>Solicitar cotización y demo →</BotonSiguiente>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}
