import type { ReactNode } from "react";
import FondoWiwiQuest from "@/components/FondoWiwiQuest";

/**
 * Las piezas de la pantalla de preguntas de WiwiQuest (witown_fe_students,
 * WiwiQuestQuestion.tsx, modo refuerzo de primaria), con sus mismas clases:
 * fondo animado, tarjeta con latido, opciones con la letra en círculo y el
 * botón "Siguiente pregunta".
 */
export function PantallaWiwiQuest({ children, ancha = false }: { children: ReactNode; ancha?: boolean }) {
  return (
    <div className="relative z-0 min-h-screen bg-white font-nunito">
      <FondoWiwiQuest variant={1} claro />
      <div className={`mx-auto flex min-h-screen flex-col justify-center px-4 py-10 ${ancha ? "max-w-6xl" : "max-w-2xl"}`}>{children}</div>
    </div>
  );
}

export function Insignia({ texto }: { texto: string }) {
  return (
    <span className="inline-block rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white lg:text-sm"
      style={{ background: "linear-gradient(135deg, #443773 0%, #8b6db8 100%)" }}>
      {texto}
    </span>
  );
}

export function TarjetaPregunta({ children }: { children: ReactNode }) {
  return (
    <div className="relative animate-heartbeat-glow rounded-2xl border border-[#e0e0e0] bg-white p-[15px] shadow-sm lg:p-[18px]"
      style={{ ["--latido-color" as string]: "rgba(120, 100, 220, 0.6)" }}>
      <div className="text-[15px] font-semibold text-[#333333] lg:text-[18px]">{children}</div>
    </div>
  );
}

export function Opcion({ letra, children, onClick, elegida = false }: {
  letra: string; children: ReactNode; onClick: () => void; elegida?: boolean;
}) {
  return (
    <button onClick={onClick} aria-pressed={elegida}
      className="flex min-h-[53px] w-full items-start gap-[11px] rounded-2xl border-2 px-[11px] py-[9px] text-left transition-all hover:scale-[1.02] lg:min-h-[58px] lg:gap-[14px] lg:px-[14px] lg:py-[11px]"
      style={{ backgroundColor: elegida ? "#554884" : "#E6E6E6", borderColor: elegida ? "#554884" : "#E6E6E6" }}>
      <div className="flex h-[31px] w-[31px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold lg:h-9 lg:w-9 lg:text-[15px]"
        style={{ backgroundColor: "#F5E6D3", color: "#333333" }}>
        {letra}
      </div>
      <span className="flex-1 text-left text-[14px] font-medium lg:text-[16px]" style={{ color: elegida ? "#ffffff" : "#333333" }}>
        {children}
      </span>
    </button>
  );
}

export function BotonSiguiente({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-2xl bg-[#554884] px-[15px] py-[9px] font-medium text-white transition-colors hover:bg-[#443773] disabled:opacity-50 lg:px-5 lg:py-3">
      {children}
    </button>
  );
}
