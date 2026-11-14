import { useEffect, useState } from "react";
import { leerEnlace, type Enlace } from "@/lib/api";
import { ProveedorEstado, useConfigurador } from "@/lib/estado";
import { iniciarMedicion, medir, medirRuta } from "@/lib/analitica";
import { rutaDe, ubicacionDeEstado, useRutas } from "@/lib/rutas";
// iniciarMedicion: solo cuando el rector acepta en esta visita (ver Pasos).
import { Bienvenida } from "@/pages/Bienvenida";
import { Recorrido } from "@/pages/recorrido/Recorrido";
import { Plan } from "@/pages/Plan";
import { SuNumero } from "@/pages/SuNumero";
import { Cierre } from "@/pages/Cierre";

const CLAVE_ENLACE = "configurador.e";

/**
 * El token llega como `?e=`. Se guarda en esta pestaña y se quita de la barra
 * de direcciones: así no queda en capturas de pantalla ni se reenvía por error.
 */
function tokenDeLaUrl(): string {
  const url = new URL(location.href);
  const e = url.searchParams.get("e");
  if (e) {
    try {
      sessionStorage.setItem(CLAVE_ENLACE, e);
    } catch {
      /* sin almacenamiento: se queda en la URL */
      return e;
    }
    url.searchParams.delete("e");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    return e;
  }
  try {
    return sessionStorage.getItem(CLAVE_ENLACE) ?? "";
  } catch {
    return "";
  }
}

export default function App() {
  const [enlace, setEnlace] = useState<Enlace | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const e = tokenDeLaUrl();
    if (!e) {
      setError("Este configurador se abre con el enlace que le envió su asesora.");
      return;
    }
    leerEnlace(e)
      .then(setEnlace)
      .catch((err) => setError(err instanceof Error ? err.message : "Este enlace no está disponible."));
  }, []);

  if (error) return <SinEnlace mensaje={error} />;
  if (!enlace) return <Pantalla><p className="text-center text-gray-500">Cargando…</p></Pantalla>;

  return (
    <ProveedorEstado enlace={enlace}>
      <Pasos />
    </ProveedorEstado>
  );
}

function Pasos() {
  const { enlace, estado, despachar } = useConfigurador();
  // Cada paso con su ruta (/mejorar-resultados/docente…); Atrás del navegador incluido.
  useRutas(estado, (u) => despachar({ tipo: "ubicar", valor: u }));
  // Google Analytics solo si aceptó los términos en esta demo (no por una visita anterior).
  useEffect(() => {
    if (estado.acepto) iniciarMedicion();
  }, [estado.acepto]);
  // Una vista por ruta, después de cargar GA y de que la barra cambió (efectos en orden).
  const rutaActual = rutaDe(ubicacionDeEstado(estado));
  useEffect(() => medirRuta(), [rutaActual, estado.acepto]);
  // El logo que subió la asesora: como data URL, para la portada y las vistas
  // previas (que solo aceptan data:image/).
  useEffect(() => {
    if (!enlace.tiene_logo || estado.logo) return;
    fetch(`/api/config/imagen?e=${encodeURIComponent(enlace.e)}&tipo=logo`)
      .then((r) => (r.ok && (r.headers.get("content-type") || "").startsWith("image/") ? r.blob() : null))
      .then((blob) => {
        if (!blob) return;
        const lector = new FileReader();
        lector.onload = () => despachar({ tipo: "logo", valor: String(lector.result) });
        lector.readAsDataURL(blob);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enlace.e, enlace.tiene_logo]);
  useEffect(() => medir(`ver_${estado.paso}`), [estado.paso]);
  // Sin camino elegido (enlace libre), se vuelve a la bienvenida.
  const paso = estado.paso === "camino" && !estado.ruta ? "entrada" : estado.paso;
  return (
    <>
      {paso === "entrada" && <Bienvenida />}
      {paso === "camino" && <Recorrido />}
      {paso === "plan" && <Plan />}
      {paso === "numero" && <Pantalla><SuNumero /></Pantalla>}
      {paso === "cierre" && <Pantalla><Cierre /></Pantalla>}
    </>
  );
}

function Pantalla({ children, abajo = false }: { children: React.ReactNode; abajo?: boolean }) {
  return (
    <div className="min-h-screen bg-purple-50/60">
      <header className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
          <span className="text-lg font-bold text-purple-800">i'Witown</span>
        </div>
      </header>
      <main className={`mx-auto max-w-3xl px-4 py-8 ${abajo ? "pb-32" : ""}`}>{children}</main>
    </div>
  );
}

function SinEnlace({ mensaje }: { mensaje: string }) {
  return (
    <Pantalla>
      <div className="space-y-3 rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-purple-900">Configurador i'Witown</h1>
        <p className="text-gray-600">{mensaje}</p>
        <a href="https://www.ecosistema.iwitown.com/conversemos" className="inline-block font-semibold text-purple-700 underline">
          Pedir un enlace
        </a>
      </div>
    </Pantalla>
  );
}
