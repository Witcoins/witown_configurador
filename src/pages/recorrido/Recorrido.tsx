import { useEffect, useRef, useState } from "react";
import { ESCENAS } from "@/config/escenas";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { avanzar, useAvance } from "@/lib/progreso";
import { OPCIONES } from "@/pages/Bienvenida";
import { Contenido } from "@/pages/caminos/Contenido";
import { VistaPrevia, NOMBRES_PLATAFORMA, type EventoVitrina } from "@/components/VistaPrevia";
import { Acp, AcpCierre, QueTieneHoy, QuienUsa, ResultadosReales } from "./Pantallas";
import { Alejandro, ElegirTarea, Feria } from "./Paneles";

const ALTO_BARRA = 56;

/**
 * El camino elegido, escena por escena: la plataforma real a pantalla completa,
 * una barra delgada arriba (quién es usted ahora, avance, Atrás / Siguiente) y
 * el tutorial por pasos dentro de la app. Sin precio: va al final.
 */
/** Si el rector no asignó tarea, se juega un tema del catálogo de la demo (la pantalla dice cuál). */
const POR_DEFECTO = { asignatura: "Matemáticas", tema: "Operaciones con fracciones", subtema: "Suma y resta de fracciones con igual denominador" };
function tareaOPorDefecto<T extends { asignatura: string; tema: string; subtema: string; minutos: number }>(t: T): T {
  return t.asignatura && t.subtema ? t : { ...t, ...POR_DEFECTO };
}

export function Recorrido() {
  const { enlace, estado, despachar } = useConfigurador();
  const escenas = estado.ruta && estado.ruta !== "libre" ? ESCENAS[estado.ruta] : [];
  const i = Math.min(estado.escena, Math.max(0, escenas.length - 1));
  const escena = escenas[i];
  // Cambia para volver a mostrar el tutorial ("Ver la guía").
  const [vuelta, setVuelta] = useState(0);
  const [jugado, setJugado] = useState(false);
  const escenaRef = useRef(i);
  escenaRef.current = i;
  useAvance(escena ? `escena-${estado.ruta}-${escena.id}` : null, 10 + i);
  // Con cualquier cambio de escena (botones o Atrás/Adelante del navegador).
  useEffect(() => {
    if (!escena) return;
    medir("escena", { ruta: estado.ruta || "", escena: escena.id });
    setJugado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.ruta, i]);

  if (!escena) return null;
  const ultima = i === escenas.length - 1;

  const ir = (n: number) => {
    if (n < 0) return despachar({ tipo: "ir", paso: "entrada" });
    if (n >= escenas.length) {
      medir("camino_fin", { ruta: estado.ruta || "" });
      return despachar({ tipo: "ir", paso: "plan" });
    }
    despachar({ tipo: "escena", valor: n });
  };

  const alEvento = (e: EventoVitrina) => {
    // La tarea de afianzamiento que asignó en el Gestor de tareas real.
    if (e.tipo === "tarea-asignada") {
      const texto = (v: unknown) => (typeof v === "string" ? v.slice(0, 400) : "");
      const m = Number(e.datos.minutos);
      despachar({ tipo: "tarea", valor: {
        asignatura: texto(e.datos.asignatura), tema: texto(e.datos.tema) || texto(e.datos.subtema),
        subtema: texto(e.datos.subtema) || texto(e.datos.tema), minutos: [10, 15, 20].includes(m) ? m : 10,
      } });
      avanzar(enlace.e, "tarea-asignada", 25);
      // Solo si sigue en esta escena (pudo haber tocado "Siguiente" mientras tanto).
      const esta = i;
      window.setTimeout(() => { if (escenaRef.current === esta) ir(esta + 1); }, 1200);
    }
    if (e.tipo === "juego-empezo") avanzar(enlace.e, "juego-empezo", 30);
    if (e.tipo === "juego-fin") avanzar(enlace.e, "juego-fin", 31);
    if (e.tipo === "juego-empezo" || e.tipo === "juego-usado") despachar({ tipo: "jugo" });
    if (e.tipo === "juego-fin" || e.tipo === "juego-usado") setJugado(true);
  };

  // Una pantalla propia del configurador.
  if (escena.pantalla) {
    const seguir = () => ir(i + 1);
    return (
      <div>
        <Barra rol={escena.rol} i={i} total={escenas.length} atras={() => ir(i - 1)} siguiente={seguir} ultima={ultima} sinSiguiente />
        <div style={{ paddingTop: ALTO_BARRA }}>
          {escena.pantalla === "queTieneHoy" && <QueTieneHoy siguiente={seguir} />}
          {escena.pantalla === "acp" && <Acp siguiente={seguir} />}
          {escena.pantalla === "acpCierre" && <AcpCierre siguiente={seguir} />}
          {escena.pantalla === "quienUsa" && <QuienUsa siguiente={seguir} />}
          {escena.pantalla === "resultadosReales" && <ResultadosReales siguiente={seguir} ultima={ultima} />}
          {escena.pantalla === "contenido" && <div className="mx-auto max-w-3xl px-4 py-8 font-nunito"><Contenido /></div>}
        </div>
      </div>
    );
  }

  // Una plataforma real.
  const esperaJuego = escena.jugar && !jugado && !estado.jugo;
  return (
    <div className="fixed inset-0 bg-white">
      <Barra rol={escena.rol} plataforma={escena.plataforma ? NOMBRES_PLATAFORMA[escena.plataforma] : ""}
        i={i} total={escenas.length} atras={() => ir(i - 1)} siguiente={() => ir(i + 1)} ultima={ultima}
        verGuia={escena.tutorial?.length ? () => setVuelta((v) => v + 1) : undefined}
        destacarSiguiente={!esperaJuego}
        libre={enlace.ruta === "libre"} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: ALTO_BARRA }}>
        <VistaPrevia key={`${estado.ruta}-${escena.id}`} plataforma={escena.plataforma!} ir={escena.ir ?? null}
          tutorial={escena.tutorial} tutorialId={`${escena.id}-${vuelta}`} mostrar={escena.mostrar}
          jugar={escena.jugar ? tareaOPorDefecto(estado.tarea) : null} onEvento={alEvento} />
        {escena.panel === "elegirTarea" && <ElegirTarea siguiente={() => ir(i + 1)} />}
        {escena.panel === "alejandro" && <Alejandro />}
        {escena.panel === "feria" && <Feria />}
      </div>
    </div>
  );
}

function Barra({ rol, plataforma, i, total, atras, siguiente, ultima, verGuia, sinSiguiente, destacarSiguiente = true, libre }: {
  rol: string; plataforma?: string; i: number; total: number; atras: () => void; siguiente: () => void;
  ultima: boolean; verGuia?: () => void; sinSiguiente?: boolean; destacarSiguiente?: boolean; libre?: boolean;
}) {
  const { estado, despachar } = useConfigurador();
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-purple-100 bg-white/95 px-3 font-nunito backdrop-blur"
      style={{ height: ALTO_BARRA }}>
      <span className="hidden text-lg font-extrabold text-[#443773] sm:inline">i'Witown</span>
      <span className="truncate rounded-full bg-[#554884] px-3 py-1 text-sm font-bold text-white">{rol}</span>
      {plataforma && <span className="hidden truncate text-xs text-gray-500 md:inline">{plataforma}</span>}
      <div className="ml-auto flex items-center gap-2">
        {libre && (
          <select aria-label="Cambiar de camino" value={estado.ruta ?? ""} onChange={(e) => despachar({ tipo: "ruta", valor: e.target.value as never })}
            className="hidden rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-600 lg:block">
            {OPCIONES.map((o) => <option key={o.ruta} value={o.ruta}>{o.titulo}</option>)}
          </select>
        )}
        <span className="hidden text-xs text-gray-500 sm:inline" aria-label={`Escena ${i + 1} de ${total}`}>{i + 1} / {total}</span>
        {verGuia && <button onClick={verGuia} className="rounded-full px-3 py-1.5 text-sm font-semibold text-[#554884] hover:bg-[#554884]/10" title="Ver de nuevo la guía">?</button>}
        <button onClick={atras} className="rounded-full px-3 py-1.5 text-sm font-semibold text-[#554884] hover:bg-[#554884]/10">Atrás</button>
        {!sinSiguiente && (
          <button onClick={siguiente}
            className={`rounded-full px-4 py-1.5 text-sm font-bold text-white transition ${destacarSiguiente ? "bg-[hsl(274_85%_37%)]" : "bg-gray-400"}`}>
            {ultima ? "Arme su plan →" : "Siguiente →"}
          </button>
        )}
      </div>
    </header>
  );
}
