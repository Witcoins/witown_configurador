import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import precios from "@/config/precios.json";
import { PRESETS } from "@/config/funcionalidades";
import { cotizar, type Cotizacion } from "@/lib/precio";
import type { Enlace, Ruta } from "@/lib/api";
import { ordenDe, ubicacionDeEstado, ubicacionInicial, type Ubicacion } from "@/lib/rutas";

export type Paso = "entrada" | "camino" | "plan" | "numero" | "cierre";

export interface Actual {
  editorial: string;
  libros_por_estudiante: number | null;
  pagan_padres_al_anio: number | null;
  tiene_plataforma: boolean;
  costo_plataforma_al_anio: number | null;
}

export interface Contacto {
  colegio: string;
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
  autoriza: boolean;
}

export interface Estado {
  paso: Paso;
  estudiantes: number;
  ruta: Ruta | null;
  prendidas: string[];
  actual: Actual;
  contacto: Contacto;
  leadEnviado: boolean;
  agendo: string | null;
  /** El "¿Qué tiene hoy?" del camino Ahorrar costos ya se respondió. */
  actualConfirmado: boolean;
  /** Áreas y cursos con Logbooks propios (camino Contenido). */
  logbooks: { areas: string[]; cursos: string[]; color: string; plantilla: string };
  /** Logo del colegio como data URL. Solo en memoria: no se guarda ni se sube. */
  logo: string | null;
  /** El enlace ya usó su única partida (en cualquier camino). */
  jugo: boolean;
  /** En qué escena del camino va. */
  escena: number;
  /** La tarea que eligió como docente (camino Mejorar resultados). */
  tarea: { asignatura: string; tema: string; subtema: string; minutos: number };
  /** Aceptó los términos (y que se registre hasta dónde llega). Sin esto no se mide nada. */
  acepto: boolean;
  /** Ya respondió cuántos estudiantes tiene (se pregunta antes del precio). */
  estudiantesConfirmado: boolean;
  /** En la entrada: la portada (true) o la pregunta de la bienvenida. */
  enPortada: boolean;
  /** Hasta dónde llegó en esta pestaña (orden de rutas.ts): una ruta más adelante no se respeta. */
  alcanzado: number;
  /** Última escena alcanzada en cada camino (las rutas de escena se juzgan por camino). */
  escenasAlcanzadas: Partial<Record<string, number>>;
}

type Accion =
  | { tipo: "ir"; paso: Paso }
  | { tipo: "estudiantes"; valor: number }
  | { tipo: "ruta"; valor: Ruta }
  | { tipo: "alternar"; id: string }
  | { tipo: "prendidas"; ids: string[] }
  | { tipo: "actual"; valor: Partial<Actual> }
  | { tipo: "contacto"; valor: Partial<Contacto> }
  | { tipo: "leadEnviado" }
  | { tipo: "agendo"; cuando: string }
  | { tipo: "actualConfirmado" }
  | { tipo: "logbooks"; valor: Partial<Estado["logbooks"]> }
  | { tipo: "logo"; valor: string | null }
  | { tipo: "jugo" }
  | { tipo: "escena"; valor: number }
  | { tipo: "tarea"; valor: Partial<Estado["tarea"]> }
  | { tipo: "acepto" }
  | { tipo: "estudiantesConfirmado" }
  | { tipo: "portada"; valor: boolean }
  | { tipo: "ubicar"; valor: Ubicacion };

function inicial(enlace: Enlace): Estado {
  return {
    paso: "entrada",
    estudiantes: precios.estudiantes.sugerido,
    ruta: enlace.ruta === "libre" ? null : enlace.ruta,
    prendidas: PRESETS.economico,
    actual: {
      editorial: "",
      libros_por_estudiante: 5,
      pagan_padres_al_anio: 120000,
      tiene_plataforma: false,
      costo_plataforma_al_anio: null,
    },
    contacto: { colegio: enlace.colegio, nombre: "", cargo: "", telefono: "", correo: "", autoriza: false },
    leadEnviado: false,
    agendo: null,
    actualConfirmado: false,
    logbooks: { areas: [], cursos: [], color: "#6d28d9", plantilla: "clasica" },
    logo: null,
    jugo: enlace.generaciones_restantes <= 0,
    escena: 0,
    tarea: { asignatura: "", tema: "", subtema: "", minutos: 10 },
    acepto: false,
    estudiantesConfirmado: false,
    enPortada: true,
    alcanzado: 0,
    escenasAlcanzadas: {},
  };
}

/** Cada cambio registra hasta dónde llegó (para respetar o no una ruta escrita a mano). */
function reducir(s: Estado, a: Accion): Estado {
  let n = paso(s, a);
  const u = ubicacionDeEstado(n);
  const orden = ordenDe(u);
  if (orden > n.alcanzado) n = { ...n, alcanzado: orden };
  if (u.paso === "camino" && u.ruta && (u.escena ?? 0) > (n.escenasAlcanzadas[u.ruta] ?? -1)) {
    n = { ...n, escenasAlcanzadas: { ...n.escenasAlcanzadas, [u.ruta]: u.escena ?? 0 } };
  }
  return n;
}

function paso(s: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case "ir":
      return { ...s, paso: a.paso };
    case "estudiantes":
      return { ...s, estudiantes: a.valor };
    case "ruta":
      return { ...s, ruta: a.valor, escena: s.ruta === a.valor ? s.escena : 0 };
    case "alternar":
      return {
        ...s,
        prendidas: s.prendidas.includes(a.id) ? s.prendidas.filter((x) => x !== a.id) : [...s.prendidas, a.id],
      };
    case "prendidas":
      return { ...s, prendidas: a.ids };
    case "actual":
      return { ...s, actual: { ...s.actual, ...a.valor } };
    case "contacto":
      return { ...s, contacto: { ...s.contacto, ...a.valor } };
    case "leadEnviado":
      return { ...s, leadEnviado: true };
    case "agendo":
      return { ...s, agendo: a.cuando };
    case "actualConfirmado":
      return { ...s, actualConfirmado: true };
    case "logbooks":
      return { ...s, logbooks: { ...s.logbooks, ...a.valor } };
    case "logo":
      return { ...s, logo: a.valor };
    case "jugo":
      return { ...s, jugo: true };
    case "escena":
      return { ...s, escena: a.valor };
    case "tarea":
      return { ...s, tarea: { ...s.tarea, ...a.valor } };
    case "acepto":
      return { ...s, acepto: true };
    case "estudiantesConfirmado":
      return { ...s, estudiantesConfirmado: true };
    case "portada":
      return { ...s, enPortada: a.valor };
    case "ubicar": {
      const u = a.valor;
      return { ...s, paso: u.paso, enPortada: u.enPortada, ...(u.ruta ? { ruta: u.ruta, escena: u.escena ?? 0 } : {}) };
    }
  }
}

interface Valor {
  enlace: Enlace;
  estado: Estado;
  cotizacion: Cotizacion;
  despachar: (a: Accion) => void;
}

const Contexto = createContext<Valor | null>(null);

/** Lo elegido sobrevive a recargar la página, solo en esta pestaña y para este enlace. */
function claveDe(e: string) {
  return `configurador.estado.${e}`;
}

export function ProveedorEstado({ enlace, children }: { enlace: Enlace; children: ReactNode }) {
  const [estado, despachar] = useReducer(reducir, enlace, (en) => {
    let s = inicial(en);
    let habiaEstado = false;
    try {
      const guardado = sessionStorage.getItem(claveDe(en.e));
      if (guardado) {
        s = { ...s, ...JSON.parse(guardado), logo: null } as Estado;
        habiaEstado = true;
      }
    } catch {
      /* sin almacenamiento: se empieza de cero */
    }
    // La ruta de la barra (al recargar o al pegar una), si ya llegó ahí. En `/`
    // con estado guardado (volvió a abrir el enlace) retoma donde iba.
    const u = habiaEstado && location.pathname === "/" ? null : ubicacionInicial(s);
    return u ? paso(s, { tipo: "ubicar", valor: u }) : s;
  });

  useEffect(() => {
    try {
      // El logo no se guarda: puede pesar más que el cupo de sessionStorage.
      sessionStorage.setItem(claveDe(enlace.e), JSON.stringify({ ...estado, logo: null }));
    } catch {
      /* no pasa nada */
    }
  }, [enlace.e, estado]);

  const cotizacion = useMemo(() => cotizar(estado.prendidas, estado.estudiantes), [estado.prendidas, estado.estudiantes]);
  const valor = useMemo(() => ({ enlace, estado, cotizacion, despachar }), [enlace, estado, cotizacion]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useConfigurador(): Valor {
  const v = useContext(Contexto);
  if (!v) throw new Error("useConfigurador fuera del proveedor");
  return v;
}
