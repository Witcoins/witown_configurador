import { useEffect, useState } from "react";
import { CONSEJOS, POR_VALIDAR } from "@/config/consejos";
import { useConfigurador } from "@/lib/estado";
import { leerSubtemas, type Subtema } from "@/lib/api";

/** Panel flotante sobre la plataforma, abajo a la derecha. */
function Flotante({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <aside className="absolute bottom-4 right-4 z-20 w-[min(360px,calc(100%-2rem))] animate-aparecer rounded-2xl bg-white p-4 font-nunito shadow-2xl ring-1 ring-black/5">
      <p className="mb-2 text-sm font-extrabold text-[hsl(274_85%_37%)]">{titulo}</p>
      {children}
    </aside>
  );
}

const normalizar = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Mejorar resultados, como docente: dos pasos y a las preguntas. 1) la
 * asignatura, 2) el tema y el subtema, entre los temas reales del catálogo de
 * la demo (no se crean temas nuevos: ver configuradorJugar). Sin formularios:
 * la duración queda en la de por defecto.
 */
export function ElegirTarea({ siguiente }: { siguiente: () => void }) {
  const { estado, despachar } = useConfigurador();
  const [temas, setTemas] = useState<Subtema[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sinCatalogo, setSinCatalogo] = useState(false);
  useEffect(() => {
    leerSubtemas().then((r) => setTemas(r.temas)).catch(() => setSinCatalogo(true));
  }, []);
  const t = estado.tarea;
  const asignaturas = Array.from(new Set(temas.map((x) => x.asignatura)));
  const asignatura = asignaturas.includes(t.asignatura) ? t.asignatura : "";
  const elegido = temas.find((x) => x.asignatura === t.asignatura && x.subtema === t.subtema);
  const q = normalizar(busqueda.trim());
  const deLaAsignatura = temas.filter((x) => x.asignatura === asignatura);
  const resultados = q ? deLaAsignatura.filter((x) => normalizar(`${x.tema} ${x.subtema}`).includes(q)) : deLaAsignatura;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-4 font-nunito">
      <div className="w-full max-w-lg animate-aparecer space-y-4 rounded-2xl bg-white p-5 shadow-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#554884]">Paso 1 de 3</p>
          <p className="text-lg font-extrabold text-[#333]">Elija lo que su estudiante va a estudiar</p>
          <p className="text-sm text-gray-600">La asignatura y luego el tema.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {asignaturas.map((a) => (
              <button key={a} aria-pressed={asignatura === a}
                onClick={() => { setBusqueda(""); despachar({ tipo: "tarea", valor: { asignatura: a, tema: "", subtema: "" } }); }}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${asignatura === a ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>
                {a}
              </button>
            ))}
            {temas.length === 0 && (
              <p className="text-sm text-gray-500">
                {sinCatalogo ? "No pudimos cargar los temas. Toque «Siguiente» arriba y verá preguntas de un tema de ejemplo." : "Cargando las asignaturas…"}
              </p>
            )}
          </div>
        </div>

        {asignatura && (
          <div>
            {deLaAsignatura.length > 6 && (
              <input className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#554884] focus:outline-none"
                placeholder="Busque un tema…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar un tema" />
            )}
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
              {resultados.map((x) => {
                const activo = elegido === x;
                return (
                  <button key={`${x.asignatura}|${x.subtema}`} aria-pressed={activo}
                    onClick={() => despachar({ tipo: "tarea", valor: { asignatura: x.asignatura, tema: x.tema, subtema: x.subtema } })}
                    className={`w-full rounded-xl border-2 px-3 py-1.5 text-left text-sm ${activo ? "border-[#554884] bg-[#554884]/10" : "border-gray-200"}`}>
                    <span className="block text-[11px] text-gray-500">{x.tema}</span>{x.subtema}
                  </button>
                );
              })}
              {resultados.length === 0 && <p className="text-xs text-gray-500">No hay temas con esa palabra. Pruebe con otra.</p>}
            </div>
          </div>
        )}

        <button onClick={siguiente} disabled={!elegido}
          className="w-full rounded-full bg-[hsl(274_85%_37%)] px-4 py-2.5 font-bold text-white disabled:opacity-50">
          Paso 2: ver las preguntas →
        </button>
      </div>
    </div>
  );
}

/** Mejorar resultados: Alejandro, su nivel y qué hacer. */
export function Alejandro() {
  const [ver, setVer] = useState(false);
  const c = CONSEJOS.conceptualizacion_simbolica;
  return (
    <Flotante titulo="Alejandro Ruiz · Cuarto A">
      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{c.nombre}</span>
      <button onClick={() => setVer((v) => !v)} className="ml-2 text-xs font-bold text-[#554884] underline">¿Qué significa?</button>
      {ver && <p className="mt-2 text-sm text-gray-700">{c.significa}</p>}
      <p className="mt-3 text-sm font-semibold text-gray-800">¿Qué haría usted para que avance?</p>
      <ul className="mt-1 space-y-1 text-[13px] text-gray-700">
        <li><b>Si no avanza:</b> {c.noAvanza}</li>
        <li><b>Si va lento:</b> {c.avanzaLento}</li>
        <li><b>Si va muy rápido:</b> {c.avanzaRapido}</li>
      </ul>
      {POR_VALIDAR && <p className="mt-2 text-[11px] text-gray-400">Consejos en revisión pedagógica.</p>}
    </Flotante>
  );
}

/** Que lo usen, como rector: prender la Feria. */
export function Feria() {
  const { estado, despachar } = useConfigurador();
  const feria = estado.prendidas.includes("feria");
  const valor = feria ? 78 : 34;
  return (
    <Flotante titulo="Feria / Olimpiadas">
      <label className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-800">
        Activas en su colegio
        <input type="checkbox" className="h-5 w-5 accent-[#554884]" checked={feria} onChange={() => despachar({ tipo: "alternar", id: "feria" })} />
      </label>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs"><span>Estudiantes que entran cada semana</span><b>{valor}%</b></div>
        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-[#554884] transition-all duration-700" style={{ width: `${valor}%` }} />
        </div>
        <p className="text-[11px] text-gray-400">Ilustrativo. El colegio organiza la Feria y eso le da sentido a la plataforma.</p>
      </div>
    </Flotante>
  );
}
