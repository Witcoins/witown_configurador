import { useConfigurador } from "@/lib/estado";
import { pesos } from "@/lib/precio";
import { medir } from "@/lib/analitica";
import { BotonSiguiente, Insignia, Opcion, PantallaWiwiQuest, TarjetaPregunta } from "@/components/Pregunta";

const EDITORIALES = ["SM", "Santillana", "Norma", "Richmond", "Otra"];

/** Camino Ahorrar costos — "¿Qué tiene hoy?", con valores ya prellenados. */
export function QueTieneHoy({ siguiente }: { siguiente: () => void }) {
  const { estado, despachar } = useConfigurador();
  const a = estado.actual;
  return (
    <PantallaWiwiQuest>
      <div className="animate-aparecer space-y-5">
        <div className="text-center"><Insignia texto="Ahorrar costos" /></div>
        <TarjetaPregunta>¿Qué tiene hoy? Ajuste los valores: ya vienen con lo más común.</TarjetaPregunta>
        <div className="space-y-5 rounded-2xl border-2 border-[#E6E6E6] bg-white/95 p-5">
          <div className="space-y-2">
            <p className="font-semibold text-[#333]">Editorial</p>
            <div className="flex flex-wrap gap-2">
              {EDITORIALES.map((e) => (
                <button key={e} aria-pressed={a.editorial === e} onClick={() => despachar({ tipo: "actual", valor: { editorial: e } })}
                  className={`rounded-full px-4 py-1.5 text-sm ${a.editorial === e ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>{e}</button>
              ))}
            </div>
          </div>
          <Deslizador etiqueta="Textos por estudiante" min={0} max={12} paso={1} valor={a.libros_por_estudiante ?? 0}
            formato={(n) => String(n)} cambiar={(n) => despachar({ tipo: "actual", valor: { libros_por_estudiante: n } })} />
          <Deslizador etiqueta="Lo que pagan los padres por ellos, al año" min={0} max={600000} paso={10000}
            valor={a.pagan_padres_al_anio ?? 0} formato={pesos}
            cambiar={(n) => despachar({ tipo: "actual", valor: { pagan_padres_al_anio: n } })} />
          <div className="space-y-2">
            <p className="font-semibold text-[#333]">¿Tiene plataforma aparte?</p>
            <div className="flex gap-2">
              <button aria-pressed={a.tiene_plataforma} onClick={() => despachar({ tipo: "actual", valor: { tiene_plataforma: true, costo_plataforma_al_anio: a.costo_plataforma_al_anio ?? 40000 } })}
                className={`rounded-full px-4 py-1.5 text-sm ${a.tiene_plataforma ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>Sí</button>
              <button aria-pressed={!a.tiene_plataforma} onClick={() => despachar({ tipo: "actual", valor: { tiene_plataforma: false } })}
                className={`rounded-full px-4 py-1.5 text-sm ${!a.tiene_plataforma ? "bg-[#554884] text-white" : "bg-[#F5E6D3] text-[#333]"}`}>No tenemos plataforma</button>
            </div>
            {a.tiene_plataforma && (
              <Deslizador etiqueta="Costo por estudiante, al año" min={0} max={300000} paso={5000}
                valor={a.costo_plataforma_al_anio ?? 0} formato={pesos}
                cambiar={(n) => despachar({ tipo: "actual", valor: { costo_plataforma_al_anio: n } })} />
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <BotonSiguiente onClick={() => { despachar({ tipo: "actualConfirmado" }); medir("ahorro_actual"); siguiente(); }}>
            Ver i'Witown →
          </BotonSiguiente>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Camino Mejorar resultados — la apertura. */
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
            <strong className="text-[#443773]">La A.C.P.</strong> es el motor que detecta cuándo un estudiante se está
            quedando atrás y por qué, y lo lleva hasta entender. Y le da toda esa información a su docente, a su papá
            y a usted.
          </p>
        </div>
        {/* Derecha: la frase del refuerzo. */}
        <div className="space-y-5 text-center lg:text-left">
          <Insignia texto="Mejorar resultados" />
          <h1 className="text-3xl font-extrabold leading-tight text-[#333] lg:text-5xl">
            Sus estudiantes no fallan porque no les enseñen.
          </h1>
          <p className="text-2xl font-extrabold leading-tight text-[#443773] lg:text-3xl">
            Fallan porque olvidan lo que nadie les refuerza.
          </p>
          <p className="text-lg text-gray-700 lg:text-xl">
            i'Witown lo refuerza: a cada estudiante, justo en lo que le falta, antes de que se note en las pruebas.
          </p>
          <p className="text-gray-600">En los próximos minutos usted será todos: el docente, el estudiante, el papá y el colegio.</p>
          <div className="flex justify-center lg:justify-start"><BotonSiguiente onClick={siguiente}>Empezar →</BotonSiguiente></div>
        </div>
      </div>
    </PantallaWiwiQuest>
  );
}

/** Camino Mejorar resultados — el cierre, con la A.C.P. */
export function AcpCierre({ siguiente }: { siguiente: () => void }) {
  return (
    <PantallaWiwiQuest>
      <div className="animate-aparecer space-y-5 text-center">
        <Insignia texto="Con la A.C.P." />
        <TarjetaPregunta>
          Con la A.C.P., ese refuerzo no se queda en repetir para la prueba: lleva a cada estudiante desde entender el
          concepto hasta crear con él.
        </TarjetaPregunta>
        <p className="text-lg text-gray-700">
          Por eso sabemos que funciona: no solo ganan pruebas, aprenden a resolver los problemas de la vida, que es para
          lo que existe la educación.
        </p>
        <div className="flex justify-center"><BotonSiguiente onClick={siguiente}>Arme su plan →</BotonSiguiente></div>
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
