import { useEffect, useRef, useState } from "react";
import { BotonSiguiente, Insignia, PantallaWiwiQuest } from "@/components/Pregunta";
import { CONSEJOS, POR_VALIDAR } from "@/config/consejos";
import { useConfigurador } from "@/lib/estado";
import { leerSubtemas, type Subtema } from "@/lib/api";
import { avanzar } from "@/lib/progreso";

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

/** Lo mínimo que se acepta como tema escrito (lo mismo que pide configuradorJugar). */
export const MIN_TEMA = 3;

/** La imagen del docente la pone la dueña en public/docente/ (si falta, la columna no se muestra). */
const IMAGEN_DOCENTE = "/docente/planeando.webp";

/**
 * Mejorar resultados, como docente (dueña, 2026-11-16): pantalla propia con el
 * título en grande (como la apertura) y la imagen del docente a la derecha.
 * 1) la asignatura, en un carrusel; 2) el tema: lo escribe (la IA lo revisa y
 * genera las preguntas) o elige uno de los sugeridos, que salen del banco y
 * cargan más rápido (ver configuradorJugar). Un tema por visita: si ya jugó,
 * queda a la vista cómo jugar otro (volver a abrir el enlace).
 */
export function Docente({ siguiente }: { siguiente: () => void }) {
  const { enlace, estado, despachar } = useConfigurador();
  const [temas, setTemas] = useState<Subtema[]>([]);
  const [busqueda, setBusqueda] = useState(() => estado.tarea.subtema);
  const [sinCatalogo, setSinCatalogo] = useState(false);
  // La imagen se muestra cuando de verdad cargó: si falta, sin columna ni salto.
  const [imagen, setImagen] = useState<"cargando" | "si" | "no">("cargando");
  // Sin catálogo (falla, viene vacío o tarda más de 10 s), se puede seguir: se juega el tema de ejemplo.
  useEffect(() => {
    let listo = false;
    const t = window.setTimeout(() => { if (!listo) setSinCatalogo(true); }, 10000);
    const fin = () => { listo = true; window.clearTimeout(t); };
    leerSubtemas()
      .then((r) => { fin(); setTemas(r.temas); if (!r.temas.length) setSinCatalogo(true); })
      .catch(() => { fin(); setSinCatalogo(true); });
    return () => window.clearTimeout(t);
  }, []);
  const t = estado.tarea;
  const bloqueado = estado.jugo;
  const asignaturas = Array.from(new Set(temas.map((x) => x.asignatura)));
  const asignatura = asignaturas.includes(t.asignatura) ? t.asignatura : "";
  // Con el catálogo cargado y sin asignatura, queda la primera del carrusel.
  useEffect(() => {
    if (!bloqueado && !asignatura && asignaturas.length) elegirAsignatura(asignaturas[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asignaturas.length]);
  const elegido = temas.find((x) => x.asignatura === t.asignatura && x.subtema === t.subtema);
  const escrito = !!asignatura && t.subtema.trim().length >= MIN_TEMA;
  const q = normalizar(busqueda.trim());
  const deLaAsignatura = temas.filter((x) => x.asignatura === asignatura);
  const resultados = q ? deLaAsignatura.filter((x) => normalizar(`${x.tema} ${x.subtema}`).includes(q)) : deLaAsignatura;
  function elegirAsignatura(a: string) {
    if (a === asignatura) return;
    setBusqueda("");
    despachar({ tipo: "tarea", valor: { asignatura: a, tema: "", subtema: "" } });
  }
  const escribir = (v: string) => {
    setBusqueda(v);
    const limpio = v.replace(/\s+/g, " ").trim();
    despachar({ tipo: "tarea", valor: { asignatura, tema: limpio, subtema: limpio } });
  };
  const avisoJugado = enlace.generaciones_restantes <= 0
    ? "Por hoy ya se jugaron todas las partidas de este enlace. Vuelva mañana y podrá jugar otro tema."
    : `En esta visita ya jugó${t.subtema ? ` «${t.subtema}»` : ""}. Para jugar otro tema, vuelva a abrir su enlace.`;

  return (
    <PantallaWiwiQuest ancha>
      <div className={`animate-aparecer grid items-center gap-8 ${imagen === "si" ? "lg:grid-cols-2 lg:gap-12" : ""}`}>
        <div className="space-y-5">
          <div className="text-center lg:text-left"><Insignia texto="Mejorar resultados" /></div>
          <h1 className="text-center text-3xl font-extrabold leading-tight text-[#333] lg:text-left lg:text-5xl">
            Usted es un docente y elegirá el repaso que pondrá a sus estudiantes
          </h1>
          <p className="text-center text-gray-600 lg:text-left">Sus estudiantes están en Cuarto de primaria.</p>

          {bloqueado ? (
            <p role="status" className="rounded-2xl border-2 border-[#554884]/30 bg-[#554884]/5 p-4 text-sm text-[#443773]">{avisoJugado}</p>
          ) : (
            <div className="space-y-4 rounded-2xl border-2 border-[#E6E6E6] bg-white/95 p-4">
              <div>
                <p className="mb-2 font-bold text-[#333]">1. Elija la asignatura</p>
                {asignaturas.length > 0 ? (
                  <Carrusel opciones={asignaturas} valor={asignatura} cambiar={elegirAsignatura} />
                ) : (
                  <p className="text-sm text-gray-500">
                    {sinCatalogo ? "No pudimos cargar los temas. Siga y verá preguntas de un tema de ejemplo." : "Cargando las asignaturas…"}
                  </p>
                )}
              </div>

              {asignatura && (
                <div>
                  <p className="mb-2 font-bold text-[#333]">2. Escriba el tema o elija uno</p>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#554884] focus:outline-none"
                    placeholder="Por ejemplo: el ciclo del agua" maxLength={80}
                    value={busqueda} onChange={(e) => escribir(e.target.value)} aria-label="Tema" />
                  <p className="mt-1 text-xs text-gray-500">{elegido ? "Tema sugerido: carga más rápido." : "O elija uno de estos:"}</p>
                  <div className="mt-1 max-h-40 space-y-1 overflow-y-auto">
                    {resultados.map((x) => {
                      const activo = elegido === x;
                      return (
                        <button key={`${x.asignatura}|${x.subtema}`} aria-pressed={activo}
                          onClick={() => { setBusqueda(x.subtema); despachar({ tipo: "tarea", valor: { asignatura: x.asignatura, tema: x.tema, subtema: x.subtema } }); }}
                          className={`w-full rounded-xl border-2 px-3 py-1.5 text-left text-sm ${activo ? "border-[#554884] bg-[#554884]/10" : "border-gray-200"}`}>
                          <span className="block text-[11px] text-gray-500">{x.tema}</span>{x.subtema}
                        </button>
                      );
                    })}
                    {resultados.length === 0 && escrito && (
                      <p className="text-xs text-gray-500">Las preguntas de «{t.subtema}» se crearán en el momento.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center lg:justify-start">
            <BotonSiguiente onClick={() => { if (!bloqueado) avanzar(enlace.e, "tarea-asignada", 25); siguiente(); }}
              disabled={!bloqueado && !sinCatalogo && !elegido && !escrito}>
              {bloqueado ? "Siguiente →" : "Poner el repaso →"}
            </BotonSiguiente>
          </div>
        </div>

        {imagen !== "no" && (
          <img src={IMAGEN_DOCENTE} alt="Un docente preparando sus clases en la plataforma"
            onLoad={() => setImagen("si")} onError={() => setImagen("no")}
            className={imagen === "si" ? "w-full rounded-2xl border-2 border-[#E6E6E6] object-cover shadow-sm" : "hidden"} />
        )}
      </div>
    </PantallaWiwiQuest>
  );
}

/** Las asignaturas una a una: flechas, deslizar o los puntos. La que se ve es la elegida. */
function Carrusel({ opciones, valor, cambiar }: { opciones: string[]; valor: string; cambiar: (v: string) => void }) {
  const i = Math.max(0, opciones.indexOf(valor));
  const mover = (d: number) => cambiar(opciones[(i + d + opciones.length) % opciones.length]);
  const toque = useRef<number | null>(null);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={() => mover(-1)} aria-label="Asignatura anterior"
          className="h-10 w-10 shrink-0 rounded-full bg-[#F5E6D3] text-2xl font-bold text-[#554884]">‹</button>
        <div className="flex h-16 flex-1 select-none items-center justify-center rounded-2xl bg-[hsl(274_85%_37%)] px-3 text-center text-lg font-extrabold text-white shadow-md lg:text-xl"
          style={{ touchAction: "pan-y" }} aria-live="polite"
          onPointerDown={(e) => { toque.current = e.clientX; }}
          onPointerUp={(e) => {
            const desde = toque.current;
            toque.current = null;
            if (desde != null && Math.abs(e.clientX - desde) > 30) mover(e.clientX < desde ? 1 : -1);
          }}>
          {opciones[i]}
        </div>
        <button onClick={() => mover(1)} aria-label="Asignatura siguiente"
          className="h-10 w-10 shrink-0 rounded-full bg-[#F5E6D3] text-2xl font-bold text-[#554884]">›</button>
      </div>
      <div className="flex justify-center gap-1.5">
        {opciones.map((o, k) => (
          <button key={o} onClick={() => cambiar(o)} aria-label={o} aria-pressed={k === i}
            className={`h-2.5 rounded-full transition-all ${k === i ? "w-6 bg-[#554884]" : "w-2.5 bg-gray-300"}`} />
        ))}
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
