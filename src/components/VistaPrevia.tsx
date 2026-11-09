import { useEffect, useRef, useState } from "react";
import { useConfigurador } from "@/lib/estado";
import type { PasoTutorial } from "@/config/escenas";
import FondoWiwiQuest from "@/components/FondoWiwiQuest";

export type Plataforma = "admin" | "docentes" | "padres" | "estudiante" | "tienda";

export const NOMBRES_PLATAFORMA: Record<Plataforma, string> = {
  admin: "AdmonWitown",
  docentes: "i'Witeachers",
  padres: "i'Witutor",
  estudiante: "App del estudiante",
  tienda: "Cafetería",
};

export interface EventoVitrina {
  tipo: "tutorial-fin" | "juego-empezo" | "juego-fin" | "juego-usado" | "juego-respuesta" | "tarea-asignada";
  datos: Record<string, unknown>;
}

/**
 * Una plataforma REAL en modo vitrina, dentro de un iframe del mismo origen
 * (contratos: iwitown-docs/specs/VITRINA.md y CONTRATO-tutorial.md). Solo se
 * monta una a la vez: todas comparten localStorage y cada una siembra su sesión.
 */
export function VistaPrevia({
  plataforma,
  ir = null,
  tutorial,
  tutorialId,
  jugar,
  alto = "100%",
  onEvento,
}: {
  plataforma: Plataforma;
  ir?: string | null;
  tutorial?: PasoTutorial[];
  /** Cambia cuando hay que volver a mostrar el tutorial (otra escena o "ver de nuevo"). */
  tutorialId?: string;
  /** Para la app del estudiante: el juego que tiene que arrancar. */
  jugar?: { asignatura: string; tema: string; subtema: string; minutos: number } | null;
  alto?: string;
  onEvento?: (e: EventoVitrina) => void;
}) {
  const { estado } = useConfigurador();
  const marco = useRef<HTMLIFrameElement>(null);
  // Cuenta los avisos de "lista": cada uno (p. ej. al recargar la app) dispara un reenvío.
  const [lista, setLista] = useState(0);
  const eventos = useRef(onEvento);
  eventos.current = onEvento;

  const enviar = (mensaje: Record<string, unknown>) =>
    marco.current?.contentWindow?.postMessage({ fuente: "configurador", ...mensaje }, location.origin);

  useEffect(() => {
    const oir = (ev: MessageEvent) => {
      if (ev.origin !== location.origin || ev.source !== marco.current?.contentWindow) return;
      const d = ev.data;
      if (!d || d.fuente !== "vitrina" || typeof d.tipo !== "string") return;
      if (d.tipo === "lista") setLista((n) => n + 1);
      else if (["tutorial-fin", "juego-empezo", "juego-fin", "juego-usado", "juego-respuesta", "tarea-asignada"].includes(d.tipo)) {
        eventos.current?.({ tipo: d.tipo, datos: d });
      }
    };
    window.addEventListener("message", oir);
    return () => window.removeEventListener("message", oir);
  }, []);

  // Otra plataforma = otra app: espera a que vuelva a avisar que está lista.
  useEffect(() => setLista(0), [plataforma]);

  // Lo elegido (funcionalidades, logo, colegio) y a dónde ir.
  // El juego se pide una sola vez por carga de la app (no con cada cambio de lo elegido).
  useEffect(() => {
    if (lista && jugar) enviar({ tipo: "jugar", ...jugar });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista]);

  useEffect(() => {
    if (!lista) return;
    enviar({ tipo: "vitrina", funcionalidades: estado.prendidas, logo: estado.logo, colegio: estado.contacto.colegio || null, ir });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, estado.prendidas, estado.logo, estado.contacto.colegio, ir]);

  // El tutorial, un momento después de navegar (la pantalla tiene que estar pintada).
  useEffect(() => {
    if (!lista || !tutorial?.length) return;
    const t = window.setTimeout(() => enviar({ tipo: "tutorial", id: tutorialId || "t", pasos: tutorial }), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, tutorialId]);

  // La cortina se quita un momento después de que la app avisa que está lista
  // (para que navegue a la pantalla de la escena sin que se vea el salto).
  const [cubierta, setCubierta] = useState(true);
  useEffect(() => {
    setCubierta(true);
  }, [plataforma]);
  useEffect(() => {
    if (!lista) return;
    const t = window.setTimeout(() => setCubierta(false), 700);
    return () => window.clearTimeout(t);
  }, [lista]);

  return (
    <div className="relative" style={{ height: alto }}>
      <iframe
        ref={marco}
        key={plataforma}
        title={NOMBRES_PLATAFORMA[plataforma]}
        src={`/${plataforma}/`}
        className="block h-full w-full border-0 bg-white"
      />
      {cubierta && <Cortina plataforma={plataforma} colegio={estado.contacto.colegio} />}
    </div>
  );
}

/** Mientras la plataforma carga: nunca una pantalla en blanco. */
function Cortina({ plataforma, colegio }: { plataforma: Plataforma; colegio: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-white font-nunito" role="status" aria-live="polite">
      <FondoWiwiQuest variant={1} claro />
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#554884]/20 border-t-[#554884]" aria-hidden />
      <p className="px-6 text-center text-xl font-extrabold text-[#443773]">
        Preparando {NOMBRES_PLATAFORMA[plataforma]}{colegio ? ` de ${colegio}` : ""}…
      </p>
      <p className="px-6 text-center text-sm text-gray-500">Es la plataforma real, con datos de ejemplo.</p>
    </div>
  );
}
