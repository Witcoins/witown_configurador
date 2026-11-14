import { useState, type FormEvent } from "react";
import { FUNCIONALIDADES } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";
import { enviarLead } from "@/lib/api";
import { medir } from "@/lib/analitica";
import { avanzar, useAvance } from "@/lib/progreso";
import { nombreCotizacion, pagaHoyPorEstudiante, pesos } from "@/lib/precio";

const campo = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-600 focus:outline-none";

/** Antes del detalle se piden los datos: así la asesora puede hacer el seguimiento. */
export function SuNumero() {
  const { enlace, estado, cotizacion: c, despachar } = useConfigurador();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const k = estado.contacto;
  useAvance("numero", 60);

  const datos = () => ({
    e: enlace.e,
    colegio: k.colegio,
    contacto: { nombre: k.nombre, cargo: k.cargo, telefono: k.telefono, correo: k.correo },
    estudiantes: estado.estudiantes,
    rutas: estado.ruta ? [estado.ruta] : [],
    niveles: estado.logbooks.cursos,
    ...(estado.actualConfirmado ? { actual: estado.actual } : {}),
    funcionalidades: estado.prendidas,
    plan: c.plan.nombre,
    con_logbooks: c.conLogbooks,
    precio_estudiante: c.porEstudiante,
    total_anual: c.totalAnual,
    autoriza_datos: k.autoriza,
  });

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await enviarLead(datos());
      despachar({ tipo: "leadEnviado" });
      avanzar(enlace.e, "datos", 70);
      medir("numero");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos guardar sus datos.");
    } finally {
      setEnviando(false);
    }
  };

  if (!estado.leadEnviado) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-purple-900">Su inversión está lista</h1>
          <p className="text-gray-600">Déjenos sus datos y se lo mostramos completo.</p>
        </header>
        <form onSubmit={enviar} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <input className={campo} placeholder="Colegio" required value={k.colegio}
            onChange={(e) => despachar({ tipo: "contacto", valor: { colegio: e.target.value } })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={campo} placeholder="Su nombre" required value={k.nombre}
              onChange={(e) => despachar({ tipo: "contacto", valor: { nombre: e.target.value } })} />
            <input className={campo} placeholder="Cargo (rector, coordinador…)" required value={k.cargo}
              onChange={(e) => despachar({ tipo: "contacto", valor: { cargo: e.target.value } })} />
            <input className={campo} placeholder="WhatsApp" type="tel" inputMode="tel" required value={k.telefono}
              onChange={(e) => despachar({ tipo: "contacto", valor: { telefono: e.target.value } })} />
            <input className={campo} placeholder="Correo" type="email" required value={k.correo}
              onChange={(e) => despachar({ tipo: "contacto", valor: { correo: e.target.value } })} />
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" className="mt-1 accent-purple-700" checked={k.autoriza} required
              onChange={(e) => despachar({ tipo: "contacto", valor: { autoriza: e.target.checked } })} />
            Autorizo a i'Witown a usar estos datos para contactarme sobre esta propuesta.
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={enviando}
            className="w-full rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-60">
            {enviando ? "Guardando…" : "Ver mi inversión"}
          </button>
        </form>
      </section>
    );
  }

  const prendidas = FUNCIONALIDADES.filter((f) => estado.prendidas.includes(f.id));
  // Si dijo lo que paga hoy (camino Ahorrar costos), se compara; solo después de los datos.
  const hoy = estado.actualConfirmado ? pagaHoyPorEstudiante(estado.actual) : null;
  // Sin Logbooks el colegio sigue comprando los textos: se suman a i'Witown.
  const textos = c.conLogbooks ? 0 : estado.actual.pagan_padres_al_anio ?? 0;
  const nuevo = c.porEstudiante + textos;
  const max = Math.max(hoy ?? 0, nuevo, 1);
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-purple-700">{k.colegio}</p>
        <h1 className="text-2xl font-bold text-purple-900">Su inversión en i'Witown</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-purple-700 p-5 text-white">
          <p className="text-sm opacity-80">Por estudiante al año</p>
          <p className="text-3xl font-bold">{pesos(c.porEstudiante)}</p>
          <p className="text-sm opacity-80">{nombreCotizacion(c)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total al año, {estado.estudiantes} estudiantes</p>
          <p className="text-3xl font-bold text-purple-900">{pesos(c.totalAnual)}</p>
          <p className="text-sm text-gray-500">Antes de IVA</p>
        </div>
      </div>
      {c.porCotizar.length > 0 && (
        <p className="text-sm text-gray-600">{c.porCotizar.join(" y ")}: su asesora se lo cotiza aparte.</p>
      )}

      {hoy != null && (
        <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-semibold text-gray-800">Compare · por estudiante al año</p>
          <Barra etiqueta="Hoy, aprox. (textos + plataforma)" valor={hoy} max={max} color="bg-gray-400" />
          <Barra etiqueta={`i'Witown · ${nombreCotizacion(c)}${textos ? " + sus textos" : ""}`} valor={nuevo} max={max} color="bg-purple-700" />
          <p className={`font-bold ${hoy - nuevo >= 0 ? "text-green-700" : "text-purple-900"}`}>
            {hoy - nuevo >= 0
              ? `Ahorra ${pesos(hoy - nuevo)} por estudiante: ${pesos((hoy - nuevo) * estado.estudiantes)} al año.`
              : `Son ${pesos(nuevo - hoy)} más por estudiante, con todo en un solo lugar.`}
          </p>
          {textos > 0 && <p className="text-sm text-gray-600">Con sus propios Logbooks, los textos de editorial salen de la cuenta.</p>}
        </section>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-2 font-semibold text-gray-800">Lo que eligió</p>
        <ul className="flex flex-wrap gap-2">
          {prendidas.map((f) => (
            <li key={f.id} className="rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-900">{f.nombre}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={() => despachar({ tipo: "ir", paso: "plan" })}
          className="rounded-xl border border-purple-300 px-5 py-3 font-semibold text-purple-800 hover:bg-purple-50">
          Cambiar lo que elegí
        </button>
        <button onClick={() => {
            // Si cambió lo elegido después de dejar sus datos, el lead se actualiza.
            void enviarLead(datos()).catch(() => undefined);
            despachar({ tipo: "ir", paso: "cierre" });
          }}
          className="flex-1 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800">
          Siguiente paso
        </button>
      </div>
    </section>
  );
}

function Barra({ etiqueta, valor, max, color }: { etiqueta: string; valor: number; max: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-sm"><span className="text-gray-700">{etiqueta}</span><b>{pesos(valor)}</b></div>
      <div className="h-6 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.round((valor / max) * 100)}%` }} />
      </div>
    </div>
  );
}
