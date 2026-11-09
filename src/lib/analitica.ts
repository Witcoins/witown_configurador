/**
 * GA4 por paso, solo si el visitante acepta. Sin aceptar no se carga nada de
 * Google. Lo que se mide es el embudo (a qué paso llegó), nunca sus datos.
 */
const ID_GA = "G-R4YCFT0JLP"; // el mismo de la landing del ecosistema
const CLAVE = "configurador.medicion";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function leer(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function decisionMedicion(): "si" | "no" | null {
  const v = leer();
  return v === "si" || v === "no" ? v : null;
}

let cargado = false;
function cargar() {
  if (cargado) return;
  cargado = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // Sin la URL completa: lleva el token privado del enlace.
  window.gtag("config", ID_GA, { send_page_view: false, page_location: location.origin + location.pathname });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID_GA}`;
  document.head.appendChild(s);
}

export function decidirMedicion(acepta: boolean) {
  try {
    localStorage.setItem(CLAVE, acepta ? "si" : "no");
  } catch {
    /* sin almacenamiento, se pregunta otra vez */
  }
  if (acepta) cargar();
}

/** Carga GA4. Solo se llama cuando el rector aceptó los términos en esta demo. */
export function iniciarMedicion() {
  cargar();
}

/** La ruta actual, sin query ni hash (nunca el token). */
const ubicacion = () => location.origin + location.pathname;

export function medir(paso: string, extra: Record<string, string | number> = {}) {
  if (!cargado || !window.gtag) return;
  window.gtag("event", "configurador_paso", { paso, ...extra, page_location: ubicacion() });
}

/** Una vista por cada ruta de la demo (/mejorar-resultados/docente…). */
export function medirRuta() {
  if (!cargado || !window.gtag) return;
  window.gtag("event", "page_view", { page_location: ubicacion(), page_path: location.pathname, page_title: document.title });
}
