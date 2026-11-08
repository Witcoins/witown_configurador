import { useEffect, useState } from "react";
import { leerEnlace, type Enlace } from "@/lib/api";
import { ProveedorEstado, useConfigurador, type Paso } from "@/lib/estado";
import { decidirMedicion, decisionMedicion, iniciarMedicion, medir } from "@/lib/analitica";
import { Medidor } from "@/components/Medidor";
import { Entrada } from "@/pages/Entrada";
import { Camino } from "@/pages/Camino";
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
    iniciarMedicion();
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
      <Recorrido />
    </ProveedorEstado>
  );
}

function Recorrido() {
  const { estado } = useConfigurador();
  useEffect(() => medir(`ver_${estado.paso}`), [estado.paso]);
  const conMedidor: Paso[] = ["camino", "numero"];
  return (
    <Pantalla abajo={conMedidor.includes(estado.paso)}>
      {estado.paso === "entrada" && <Entrada />}
      {estado.paso === "camino" && <Camino />}
      {estado.paso === "numero" && <SuNumero />}
      {estado.paso === "cierre" && <Cierre />}
      {conMedidor.includes(estado.paso) && <Medidor />}
      <AvisoMedicion />
    </Pantalla>
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

function AvisoMedicion() {
  const [visible, setVisible] = useState(decisionMedicion() === null);
  if (!visible) return null;
  const decidir = (si: boolean) => {
    decidirMedicion(si);
    setVisible(false);
  };
  return (
    <div className="fixed inset-x-0 top-0 z-30 bg-gray-900 text-sm text-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <span>¿Nos deja medir qué pasos se usan? Solo el recorrido, nunca sus datos.</span>
        <span className="flex gap-2">
          <button onClick={() => decidir(false)} className="rounded px-3 py-1 hover:bg-white/10">No</button>
          <button onClick={() => decidir(true)} className="rounded bg-white px-3 py-1 font-semibold text-gray-900">Sí</button>
        </span>
      </div>
    </div>
  );
}
