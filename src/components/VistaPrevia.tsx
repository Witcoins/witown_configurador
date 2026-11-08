import { useEffect, useRef, useState } from "react";
import { useConfigurador } from "@/lib/estado";

export type Plataforma = "admin" | "docentes" | "padres" | "estudiante" | "tienda";

export const NOMBRES_PLATAFORMA: Record<Plataforma, string> = {
  admin: "AdmonWitown (colegio)",
  docentes: "i'Witeachers (docentes)",
  padres: "i'Witutor (padres)",
  estudiante: "App del estudiante",
  tienda: "Cafetería (tendero)",
};

/**
 * Una plataforma REAL en modo vitrina, dentro de un iframe del mismo origen
 * (contrato: iwitown-docs/specs/VITRINA.md). Solo se monta una a la vez:
 * todas comparten localStorage y cada una siembra su sesión al arrancar.
 */
export function VistaPrevia({
  plataforma,
  ir = null,
  alto = "70vh",
  onJugar,
}: {
  plataforma: Plataforma;
  ir?: string | null;
  alto?: string;
  /** La app del estudiante avisa cuando alguien intenta jugar. */
  onJugar?: () => void;
}) {
  const { estado } = useConfigurador();
  const marco = useRef<HTMLIFrameElement>(null);
  // Cuenta los avisos de "lista": cada uno (p. ej. al recargar la app) dispara un reenvío.
  const [lista, setLista] = useState(0);

  // Lo que la vista previa necesita saber de lo elegido.
  const config = {
    fuente: "configurador",
    tipo: "vitrina",
    funcionalidades: estado.prendidas,
    logo: estado.logo,
    colegio: estado.contacto.colegio || null,
    ir,
  };

  useEffect(() => {
    const oir = (ev: MessageEvent) => {
      if (ev.origin !== location.origin || ev.source !== marco.current?.contentWindow) return;
      const d = ev.data;
      if (!d || d.fuente !== "vitrina") return;
      if (d.tipo === "lista") setLista((n) => n + 1);
      if (d.tipo === "jugar") onJugar?.();
    };
    window.addEventListener("message", oir);
    return () => window.removeEventListener("message", oir);
  }, [onJugar]);

  // Otra plataforma = otra app: espera a que vuelva a avisar que está lista.
  useEffect(() => setLista(0), [plataforma]);

  // Cada vez que cambia lo elegido (o la app dice que está lista), se le manda.
  useEffect(() => {
    if (!lista) return;
    marco.current?.contentWindow?.postMessage(config, location.origin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, estado.prendidas, estado.logo, estado.contacto.colegio, ir]);

  return (
    <div className="overflow-hidden rounded-2xl border-4 border-purple-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-900">
        <span>{NOMBRES_PLATAFORMA[plataforma]}</span>
        <span className="opacity-70">Vista previa con datos de ejemplo</span>
      </div>
      <iframe
        ref={marco}
        key={plataforma}
        title={NOMBRES_PLATAFORMA[plataforma]}
        src={`/${plataforma}/`}
        className="block w-full"
        style={{ height: alto }}
      />
    </div>
  );
}
