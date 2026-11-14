import { useEffect } from "react";
import { useConfigurador } from "@/lib/estado";
import { decidirMedicion, medir } from "@/lib/analitica";
import { useAvance } from "@/lib/progreso";
import { precalentar } from "@/lib/precalentar";
import type { Ruta } from "@/lib/api";
import { Portada } from "@/pages/Portada";
import { BotonSiguiente, Insignia, Opcion, PantallaWiwiQuest } from "@/components/Pregunta";

/** Las cuatro razones por las que un colegio cambia de editorial. Sin "otro" ni "todo". */
export const OPCIONES: { ruta: Exclude<Ruta, "libre">; titulo: string }[] = [
  { ruta: "resultados", titulo: "Mejorar los resultados de mis estudiantes" },
  { ruta: "ahorro", titulo: "Ahorrar costos" },
  { ruta: "contenido", titulo: "Usar mi propio contenido" },
  { ruta: "uso", titulo: "Que padres y estudiantes de verdad usen el material" },
];

const LETRAS = ["A", "B", "C", "D"];
const URL_TERMINOS = "https://politicas.iwitown.com";

/**
 * La entrada: la portada y, con la cara de una pregunta de WiwiQuest, "¿qué
 * busca?" (o solo "Empezar" si el enlace trae ruta fija), con la aceptación de
 * los términos. El número de estudiantes se pregunta al final, antes del precio.
 */
export function Bienvenida() {
  const { enlace, estado, despachar } = useConfigurador();
  const rutaFija = enlace.ruta !== "libre";
  const enPortada = estado.enPortada;
  const saludo = `Bienvenido(a)${enlace.colegio ? `, ${enlace.colegio}` : ""}`;
  useAvance(enPortada ? "portada" : "bienvenida", enPortada ? 0 : 1);

  // Mientras está aquí, se adelanta la carga de las plataformas.
  useEffect(() => precalentar(enlace.e), [enlace.e]);

  if (enPortada) return <Portada empezar={() => despachar({ tipo: "portada", valor: false })} />;

  const aceptar = () => {
    despachar({ tipo: "acepto" });
    decidirMedicion(true);
  };
  const ir = (ruta?: Exclude<Ruta, "libre">) => {
    if (!estado.acepto) return;
    if (ruta) despachar({ tipo: "ruta", valor: ruta });
    medir("bienvenida", { ruta: ruta ?? estado.ruta ?? "" });
    window.setTimeout(() => despachar({ tipo: "ir", paso: "camino" }), 250);
  };

  return (
    <PantallaWiwiQuest>
      <div className="animate-aparecer space-y-5">
        <div className="space-y-2 text-center">
          <Insignia texto="Demo i'Witown" />
          <p className="text-lg font-bold text-[#443773] lg:text-2xl">{saludo}</p>
          <p className="text-sm text-gray-600 lg:text-base">
            {rutaFija ? "Su demo está lista." : "Responda esta pregunta para iniciar la demo."}
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border-2 border-[#E6E6E6] bg-white/95 p-4 text-sm text-gray-700">
          <input type="checkbox" className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[#554884]" checked={estado.acepto}
            onChange={(e) => e.target.checked && aceptar()} disabled={estado.acepto} />
          <span>
            Acepto los <a href={URL_TERMINOS} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#554884] underline">términos y condiciones</a>,
            {" "}y que se registre hasta dónde llego en la demo (también con Google Analytics) para que mi asesora me ayude.
          </span>
        </label>

        {rutaFija ? (
          <div className="flex justify-center">
            <BotonSiguiente onClick={() => ir()} disabled={!estado.acepto}>Iniciar la demo →</BotonSiguiente>
          </div>
        ) : (
          <>
            <h2 className="text-center text-2xl font-extrabold leading-tight text-[#333] lg:text-4xl">
              Al contratar i'Witown, usted busca…
            </h2>
            <div className={`grid gap-[9px] transition ${estado.acepto ? "" : "pointer-events-none opacity-50"}`} aria-disabled={!estado.acepto}>
              {OPCIONES.map((o, i) => (
                <Opcion key={o.ruta} letra={LETRAS[i]} elegida={estado.ruta === o.ruta} onClick={() => ir(o.ruta)}>
                  {o.titulo}
                </Opcion>
              ))}
            </div>
            {!estado.acepto && <p className="text-center text-xs text-gray-500">Acepte los términos para elegir.</p>}
          </>
        )}
      </div>
    </PantallaWiwiQuest>
  );
}
