import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { RESULTADOS_REALES } from "@/config/resultadosReales";
import { BotonSiguiente, Insignia, Opcion, PantallaWiwiQuest, TarjetaPregunta } from "@/components/Pregunta";

/** Rangos de precio al año (pesos). Se guarda el punto medio: la comparación del plan dice "aprox.". */
const RANGOS = [
  { texto: "Menos de $100.000", desde: 0, hasta: 100000, medio: 50000 },
  { texto: "$100.000 a $250.000", desde: 100000, hasta: 250000, medio: 175000 },
  { texto: "$250.000 a $400.000", desde: 250000, hasta: 400000, medio: 325000 },
  { texto: "Más de $400.000", desde: 400000, hasta: Infinity, medio: 450000 },
];

/** Camino Ahorrar costos — "¿Qué tiene hoy?", con valores ya prellenados. */
export function QueTieneHoy({ siguiente }: { siguiente: () => void }) {
  const { estado, despachar } = useConfigurador();
  const a = estado.actual;
  return (
    <PantallaWiwiQuest>
      <div className="animate-aparecer space-y-5">
        <div className="text-center"><Insignia texto="Ahorrar costos" /></div>
        <TarjetaPregunta>¿Qué tiene hoy? Ajuste los valores.</TarjetaPregunta>
        <div className="space-y-5 rounded-2xl border-2 border-[#E6E6E6] bg-white/95 p-5">
          <Deslizador etiqueta="Textos por estudiante" min={0} max={12} paso={1} valor={a.libros_por_estudiante ?? 0}
            formato={(n) => String(n)} cambiar={(n) => despachar({ tipo: "actual", valor: { libros_por_estudiante: n } })} />
          <Rangos etiqueta="Lo que pagan los padres por los textos, al año" valor={a.pagan_padres_al_anio}
            cambiar={(n) => despachar({ tipo: "actual", valor: { pagan_padres_al_anio: n } })} />
          <div className="space-y-2">
            <p className="font-semibold text-[#333]">¿Tiene plataforma aparte?</p>
            <div className="flex gap-2">
              <button aria-pressed={a.tiene_plataforma} onClick={() => despachar({ tipo: "actual", valor: { tiene_plataforma: true, costo_plataforma_al_anio: a.costo_plataforma_al_anio ?? RANGOS[0].medio } })}
                className={`rounded-full px-4 py-1.5 text-sm ${a.tiene_plataforma ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>Sí</button>
              <button aria-pressed={!a.tiene_plataforma} onClick={() => despachar({ tipo: "actual", valor: { tiene_plataforma: false } })}
                className={`rounded-full px-4 py-1.5 text-sm ${!a.tiene_plataforma ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>No tenemos plataforma</button>
            </div>
            {a.tiene_plataforma && (
              <Rangos etiqueta="Costo de la plataforma por estudiante, al año" valor={a.costo_plataforma_al_anio}
                cambiar={(n) => despachar({ tipo: "actual", valor: { costo_plataforma_al_anio: n } })} />
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <BotonSiguiente onClick={() => { despachar({ tipo: "actualConfirmado" }); medir("ahorro_actual"); siguiente(); }}>
            Ver los planes →
          </BotonSiguiente>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Camino Mejorar resultados — la apertura: la curva del olvido y la A.C.P. como respuesta. */
export function Acp({ siguiente }: { siguiente: () => void }) {
  return (
    <PantallaWiwiQuest ancha>
      <div className="animate-aparecer grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Izquierda: el video y qué es la A.C.P. */}
        <div className="space-y-4">
          {/* Sin pista de audio (se le quitó al archivo). */}
          <video src="/video/acp.mp4" poster="/video/acp.jpg" autoPlay muted loop playsInline
            aria-label="La A.C.P. en acción" className="w-full rounded-2xl border-2 border-[#E6E6E6] shadow-sm" />
          <p className="text-base text-gray-700 lg:text-lg">
            <strong className="text-[#443773]">La A.C.P.</strong> es el motor que hace ese repaso por usted: detecta
            cuándo y en qué se está quedando atrás cada estudiante, y por qué, y lo refuerza justo a tiempo hasta que
            lo entiende. Toda esa información le llega al docente, al papá y a usted.
          </p>
        </div>
        {/* Derecha: la curva del olvido. */}
        <div className="space-y-5 text-center lg:text-left">
          <Insignia texto="Mejorar resultados" />
          <h1 className="text-3xl font-extrabold leading-tight text-[#333] lg:text-5xl">
            Sin repaso, lo aprendido se olvida en pocos días.
          </h1>
          <p className="text-lg text-gray-700 lg:text-xl">
            Es la curva del olvido, que demostró Hermann Ebbinghaus. Y lo que la frena es repasar en el momento justo,
            antes de que se olvide.
          </p>
          <p className="text-gray-600">En los próximos minutos usted será todos: el docente, el estudiante y el rector.</p>
          <div className="flex justify-center lg:justify-start"><BotonSiguiente onClick={siguiente}>Empezar →</BotonSiguiente></div>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Camino Mejorar resultados — el cierre, con el video de la portada. */
export function AcpCierre({ siguiente }: { siguiente: () => void }) {
  return (
    <PantallaWiwiQuest ancha>
      <div className="animate-aparecer grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Sin pista de audio (se le quitó al archivo). */}
        <video src="/video/portada.mp4" poster="/video/portada.jpg" autoPlay muted loop playsInline
          aria-hidden className="w-full rounded-2xl border-2 border-[#E6E6E6] shadow-sm" />
        <div className="space-y-5 text-center lg:text-left">
          <Insignia texto="Con la A.C.P." />
          <h2 className="text-3xl font-extrabold leading-tight text-[#333] lg:text-4xl">
            Sabrá en qué y cuándo se traba cada estudiante, para mejorar sus resultados a tiempo.
          </h2>
          <p className="text-lg text-gray-700 lg:text-xl">
            Un estudiante puede responder bien un examen porque memorizó, no porque interiorizó lo que aprendió. La
            A.C.P. le muestra la diferencia.
          </p>
          <div className="flex justify-center lg:justify-start"><BotonSiguiente onClick={siguiente}>Conozca su precio →</BotonSiguiente></div>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Paso final de cada camino: resultados en uso real (un colegio, sin nombrarlo). */
export function ResultadosReales({ siguiente, ultima = false }: { siguiente: () => void; ultima?: boolean }) {
  const { estado } = useConfigurador();
  const r = estado.ruta && estado.ruta !== "libre" ? RESULTADOS_REALES[estado.ruta] : undefined;
  if (!r) return null;
  return (
    <PantallaWiwiQuest ancha>
      <div className="animate-aparecer space-y-8 text-center">
        <div className="space-y-3">
          <Insignia texto="Resultados que hemos obtenido en su uso real" />
          <h2 className="text-3xl font-extrabold leading-tight text-[#333] lg:text-5xl">{r.titulo}</h2>
        </div>
        <div className={`grid gap-4 ${r.indicadores.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
          {r.indicadores.map((x) => (
            <div key={x.dice} className="space-y-2 rounded-2xl border-2 border-[#E6E6E6] bg-white/95 p-6 shadow-sm">
              <p className="text-4xl font-extrabold text-[#443773] lg:text-5xl">{x.cifra}</p>
              {x.acento && (
                <span className="inline-block rounded-full bg-[hsl(274_85%_37%)] px-3 py-1 text-xs font-extrabold tracking-wide text-white">
                  {x.acento}
                </span>
              )}
              <p className="text-base text-gray-700 lg:text-lg">{x.dice}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center"><BotonSiguiente onClick={siguiente}>{ultima ? "Conozca su precio →" : "Siguiente →"}</BotonSiguiente></div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Camino Que lo usen — la única pregunta: ¿quién quiere que la use más? */
export function QuienUsa({ siguiente }: { siguiente: () => void }) {
  const opciones = [["padres", "Los papás"], ["estudiantes", "Los estudiantes"], ["ambos", "Ambos"]] as const;
  return (
    <PantallaWiwiQuest>
      <div className="animate-aparecer space-y-5">
        <div className="text-center"><Insignia texto="Que de verdad lo usen" /></div>
        <TarjetaPregunta>¿Quién quiere que la use más?</TarjetaPregunta>
        <div className="grid gap-[9px]">
          {opciones.map(([id, t], i) => (
            <Opcion key={id} letra={"ABC"[i]} onClick={() => { medir("uso_quien", { quien: id }); siguiente(); }}>{t}</Opcion>
          ))}
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

function Deslizador({ etiqueta, min, max, paso, valor, formato, cambiar }: {
  etiqueta: string; min: number; max: number; paso: number; valor: number; formato: (n: number) => string; cambiar: (n: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="flex justify-between text-sm font-semibold text-[#333]">
        {etiqueta}<span className="text-[#443773]">{formato(valor)}</span>
      </span>
      <input type="range" min={min} max={max} step={paso} value={valor} onChange={(e) => cambiar(Number(e.target.value))}
        className="w-full accent-[#554884]" />
    </label>
  );
}

function Rangos({ etiqueta, valor, cambiar }: { etiqueta: string; valor: number | null; cambiar: (n: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#333]">{etiqueta}</p>
      <div className="flex flex-wrap gap-2">
        {RANGOS.map((r) => {
          const elegido = valor != null && valor >= r.desde && valor < r.hasta;
          return (
            <button key={r.texto} aria-pressed={elegido} onClick={() => { if (!elegido) cambiar(r.medio); }}
              className={`rounded-full px-4 py-1.5 text-sm ${elegido ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>{r.texto}</button>
          );
        })}
      </div>
    </div>
  );
}
