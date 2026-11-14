import { useEffect, useState } from "react";
import { useConfigurador } from "@/lib/estado";
import { agendar, avisarAgendo, crearReferido, leerHoras, type DiaAgenda } from "@/lib/api";
import { medir } from "@/lib/analitica";
import { avanzar, useAvance } from "@/lib/progreso";
import { descargarResumen } from "@/lib/pdf";

/** Termina siempre en una acción con fecha: agendar o hablar por WhatsApp. */
export function Cierre() {
  const { enlace, estado, cotizacion: c, despachar } = useConfigurador();
  const k = estado.contacto;
  useAvance("cierre", 80);
  const [dias, setDias] = useState<DiaAgenda[] | null>(null);
  const [dia, setDia] = useState<string>("");
  const [error, setError] = useState("");
  const [agendando, setAgendando] = useState(false);
  const [referido, setReferido] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (estado.agendo) return;
    leerHoras()
      .then((r) => {
        setDias(r.dias);
        if (r.dias[0]) setDia(r.dias[0].fecha);
      })
      .catch(() => setDias([]));
  }, [estado.agendo]);

  const reservar = async (cupo: string, rotulo: string) => {
    setError("");
    setAgendando(true);
    try {
      await agendar({ nombre: k.nombre, correo: k.correo, celular: k.telefono, colegio: k.colegio, cupo });
      const cuando = `${dias?.find((d) => d.fecha === dia)?.rotulo ?? dia}, ${rotulo}`;
      despachar({ tipo: "agendo", cuando });
      medir("agendo");
      avanzar(enlace.e, "agendo", 90);
      await avisarAgendo(enlace.e, k.correo, cupo, cuando).catch(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos agendar.");
      leerHoras().then((r) => setDias(r.dias)).catch(() => undefined);
    } finally {
      setAgendando(false);
    }
  };

  // Sin datos personales en el texto: el enlace saliente lo puede registrar la
  // medición de Google si el visitante la aceptó. La asesora ya tiene el lead.
  const whatsapp = enlace.asesora.whatsapp
    ? `https://wa.me/${enlace.asesora.whatsapp.length === 10 ? "57" : ""}${enlace.asesora.whatsapp}?text=${encodeURIComponent(
        `Hola${enlace.asesora.nombre ? ` ${enlace.asesora.nombre}` : ""}, armé mi i'Witown en el configurador y quiero formalizar.`,
      )}`
    : "";

  const compartir = async () => {
    setError("");
    try {
      const r = await crearReferido(enlace.e, estado.contacto.correo);
      setReferido(`${location.origin}/?e=${r.e}`);
      medir("referido");
      avanzar(enlace.e, "referido", 87);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos crear el enlace.");
    }
  };

  const horas = dias?.find((d) => d.fecha === dia)?.horas ?? [];

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-purple-900">Formalicemos</h1>
        <p className="text-gray-600">Elija una hora para la reunión de cierre, o escríbale a su asesora.</p>
      </header>

      {estado.agendo ? (
        <div className="rounded-2xl bg-green-50 p-5 text-green-900">
          <p className="font-semibold">Reunión agendada</p>
          <p>{estado.agendo}. Le llegó la invitación al correo.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-semibold text-gray-800">Agendar reunión para formalizar</p>
          {dias === null && <p className="text-sm text-gray-500">Cargando la agenda…</p>}
          {dias?.length === 0 && <p className="text-sm text-gray-500">No hay horas disponibles ahora. Escríbale por WhatsApp.</p>}
          {!!dias?.length && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dias.map((d) => (
                  <button key={d.fecha} onClick={() => setDia(d.fecha)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${d.fecha === dia ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-900"}`}>
                    {d.rotulo}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {horas.map((h) => (
                  <button key={h.llave} disabled={agendando} onClick={() => reservar(h.llave, h.rotulo)}
                    className="rounded-lg border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-900 hover:bg-purple-50 disabled:opacity-50">
                    {h.rotulo}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => { medir("whatsapp"); avanzar(enlace.e, "whatsapp", 86); }}
            className="flex-1 rounded-xl border border-green-600 px-5 py-3 text-center font-semibold text-green-800 hover:bg-green-50">
            Hablar por WhatsApp con mi asesora
          </a>
        )}
        <button onClick={() => { medir("pdf"); avanzar(enlace.e, "pdf", 85); void descargarResumen(estado, c, enlace.asesora.nombre); }}
          className="flex-1 rounded-xl border border-purple-300 px-5 py-3 font-semibold text-purple-800 hover:bg-purple-50">
          Descargar resumen en PDF
        </button>
      </div>

      <div className="space-y-2 rounded-2xl bg-purple-50 p-5">
        <p className="font-semibold text-purple-900">¿Conoce otro rector a quien le sirva?</p>
        {referido ? (
          <div className="flex gap-2">
            <input readOnly value={referido} className="min-w-0 flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm" />
            <button onClick={() => navigator.clipboard?.writeText(referido).then(() => setCopiado(true))}
              className="rounded-lg bg-purple-700 px-4 text-sm font-semibold text-white">
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
        ) : (
          <button onClick={compartir} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm">
            Crear un enlace para compartir
          </button>
        )}
        <p className="text-xs text-purple-900/70">Cada persona recibe su propio enlace.</p>
      </div>
    </section>
  );
}
