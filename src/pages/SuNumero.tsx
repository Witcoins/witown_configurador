import { useState, type FormEvent } from "react";
import { FUNCIONALIDADES } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";
import { enviarLead } from "@/lib/api";
import { medir } from "@/lib/analitica";
import { pesos } from "@/lib/precio";

const campo = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-600 focus:outline-none";

/** Antes del detalle se piden los datos: así la asesora puede hacer el seguimiento. */
export function SuNumero() {
  const { enlace, estado, cotizacion: c, despachar } = useConfigurador();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const k = estado.contacto;

  const datos = () => ({
    e: enlace.e,
    colegio: k.colegio,
    contacto: { nombre: k.nombre, cargo: k.cargo, telefono: k.telefono, correo: k.correo },
    estudiantes: estado.estudiantes,
    rutas: estado.ruta ? [estado.ruta] : [],
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
          <h1 className="text-2xl font-bold text-purple-900">Su número está listo</h1>
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
            {enviando ? "Guardando…" : "Ver mi número"}
          </button>
        </form>
      </section>
    );
  }

  const prendidas = FUNCIONALIDADES.filter((f) => estado.prendidas.includes(f.id));
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-purple-700">{k.colegio}</p>
        <h1 className="text-2xl font-bold text-purple-900">Su número</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-purple-700 p-5 text-white">
          <p className="text-sm opacity-80">Por estudiante al año</p>
          <p className="text-3xl font-bold">{pesos(c.porEstudiante)}</p>
          <p className="text-sm opacity-80">Plan {c.plan.nombre}{c.conLogbooks ? " con Logbooks" : ""}</p>
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

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-2 font-semibold text-gray-800">Lo que eligió</p>
        <ul className="flex flex-wrap gap-2">
          {prendidas.map((f) => (
            <li key={f.id} className="rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-900">{f.nombre}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={() => despachar({ tipo: "ir", paso: "camino" })}
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
