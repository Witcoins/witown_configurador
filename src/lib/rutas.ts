import { useEffect, useRef } from "react";
// Solo tipos: estado.tsx importa de aquí.
import { ESCENAS, type Escena } from "@/config/escenas";
import type { Ruta } from "@/lib/api";
import type { Estado, Paso } from "@/lib/estado";

/**
 * Cada paso de la demo tiene su ruta (sin el token, que va aparte):
 * `/` portada, `/bienvenida`, `/<camino>/<rol>`, `/plan`, `/inversion`, `/cierre`.
 * Sirve para reportar y medir dónde va cada visitante, y para que recargar o el
 * Atrás del navegador funcionen. Una ruta a la que aún no llegó en esta visita
 * no se respeta: así el precio sigue apareciendo solo al final.
 */

type Camino = Exclude<Ruta, "libre">;

export const SLUG_CAMINO: Record<Camino, string> = {
  ahorro: "ahorrar-costos",
  resultados: "mejorar-resultados",
  contenido: "mi-contenido",
  uso: "que-lo-usen",
};

const PASO_FIJO: Partial<Record<Paso, string>> = { plan: "plan", numero: "inversion", cierre: "cierre" };

export const slugEscena = (e: Escena) => e.url ?? e.id;

/** Dónde está el visitante, tal como lo dice (o lo pide) la ruta. */
export interface Ubicacion {
  paso: Paso;
  enPortada: boolean;
  ruta?: Camino;
  escena?: number;
}

/** Orden del avance: no se entra por ruta a algo más adelante de lo ya alcanzado. */
export function ordenDe(u: Ubicacion): number {
  if (u.paso === "entrada") return u.enPortada ? 0 : 1;
  if (u.paso === "camino") return 10 + (u.escena ?? 0);
  return { plan: 100, numero: 110, cierre: 120 }[u.paso as "plan" | "numero" | "cierre"] ?? 0;
}

export function ubicacionDeEstado(s: Pick<Estado, "paso" | "enPortada" | "ruta" | "escena">): Ubicacion {
  if (s.paso === "camino" && (!s.ruta || s.ruta === "libre")) return { paso: "entrada", enPortada: false };
  if (s.paso === "entrada") return { paso: "entrada", enPortada: s.enPortada };
  if (s.paso === "camino") return { paso: "camino", enPortada: false, ruta: s.ruta as Camino, escena: s.escena };
  return { paso: s.paso, enPortada: false };
}

export function rutaDe(u: Ubicacion): string {
  if (u.paso === "entrada") return u.enPortada ? "/" : "/bienvenida";
  if (u.paso === "camino" && u.ruta) {
    const escenas = ESCENAS[u.ruta];
    const e = escenas[Math.min(u.escena ?? 0, escenas.length - 1)];
    return `/${SLUG_CAMINO[u.ruta]}/${e ? slugEscena(e) : ""}`;
  }
  return `/${PASO_FIJO[u.paso] ?? ""}`;
}

/** La ubicación que pide una ruta, o null si no es una ruta de la demo. */
export function ubicacionDeRuta(ruta: string): Ubicacion | null {
  const partes = ruta.replace(/\/+$/, "").split("/").filter(Boolean);
  if (partes.length === 0) return { paso: "entrada", enPortada: true };
  if (partes.length === 1) {
    if (partes[0] === "bienvenida") return { paso: "entrada", enPortada: false };
    const paso = (Object.keys(PASO_FIJO) as Paso[]).find((p) => PASO_FIJO[p] === partes[0]);
    return paso ? { paso, enPortada: false } : null;
  }
  if (partes.length === 2) {
    const camino = (Object.keys(SLUG_CAMINO) as Camino[]).find((c) => SLUG_CAMINO[c] === partes[0]);
    if (!camino) return null;
    const escena = ESCENAS[camino].findIndex((e) => slugEscena(e) === partes[1]);
    return escena >= 0 ? { paso: "camino", enPortada: false, ruta: camino, escena } : null;
  }
  return null;
}

/** Se respeta una ruta si ya llegó ahí en esta visita y es su camino. */
export const permitida = (u: Ubicacion, s: Pick<Estado, "alcanzado" | "ruta" | "escenasAlcanzadas">) =>
  u.paso === "camino"
    ? u.ruta === s.ruta && (u.escena ?? 0) <= (s.escenasAlcanzadas?.[u.ruta as string] ?? -1)
    : ordenDe(u) <= s.alcanzado;

/** Al cargar: la ubicación que pide la barra, si se puede (si no, null). */
export function ubicacionInicial(s: Estado): Ubicacion | null {
  const pedida = ubicacionDeRuta(location.pathname);
  return pedida && permitida(pedida, s) ? pedida : null;
}

/**
 * Sincroniza la ruta del navegador con el estado: al cargar y con Atrás/Adelante
 * se respeta la ruta si ya llegó ahí en esta visita (y es su camino); si no, la
 * barra se corrige al paso en que va. Cada avance deja su entrada en el historial.
 */
export function useRutas(
  estado: Estado,
  ubicar: (u: Ubicacion) => void,
): void {
  const primera = useRef(true);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  // Atrás / Adelante del navegador.
  useEffect(() => {
    const alVolver = () => {
      const s = estadoRef.current;
      const pedida = ubicacionDeRuta(location.pathname);
      if (pedida && permitida(pedida, s)) ubicar(pedida);
      else history.replaceState(null, "", rutaDe(ubicacionDeEstado(s)) + location.search);
    };
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El estado manda la ruta.
  const destino = rutaDe(ubicacionDeEstado(estado));
  useEffect(() => {
    if (location.pathname === destino) {
      primera.current = false;
      return;
    }
    const url = destino + location.search + location.hash;
    if (primera.current) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
    primera.current = false;
  }, [destino]);
}
