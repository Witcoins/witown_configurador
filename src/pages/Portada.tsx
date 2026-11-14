import { useState } from "react";
import { useConfigurador } from "@/lib/estado";
import { PORTADA } from "@/config/portada";

/**
 * La portada, con la estructura de la propuesta a Asocoldep (gmg-landing):
 * foto a pantalla completa con degradado, y a la derecha el logo del colegio,
 * un título grande y una frase de acento. La foto y el logo los sube la asesora
 * al crear el enlace; sin foto, fondo de marca.
 */
export function Portada({ empezar }: { empezar: () => void }) {
  const { enlace, estado } = useConfigurador();
  const [sinFoto, setSinFoto] = useState(!enlace.tiene_foto);
  const colegio = enlace.colegio || "su colegio";
  const foto = `/api/config/imagen?e=${encodeURIComponent(enlace.e)}&tipo=foto`;

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-[#1f1534] font-nunito text-white sm:items-center" aria-label="Portada">
      {PORTADA.video ? (
        <video src={PORTADA.video} poster={PORTADA.poster ?? undefined} autoPlay muted loop playsInline
          aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      ) : !sinFoto ? (
        <img src={foto} alt={`Foto de ${colegio}`} onError={() => setSinFoto(true)}
          className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 30%" }} />
      ) : (
        <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 15% 20%, #8b6db8 0%, #554884 35%, #2a1f45 70%, #1f1534 100%)" }} />
      )}
      {/* El degradado que deja leer el texto (a la derecha en computador, abajo en celular). */}
      <div className="absolute inset-0 hidden sm:block"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(31,21,52,.10) 26%, rgba(31,21,52,.62) 50%, rgba(31,21,52,.97) 100%)" }} />
      <div className="absolute inset-0 sm:hidden"
        style={{ background: "linear-gradient(0deg, rgba(31,21,52,.95) 0%, rgba(31,21,52,.85) 55%, rgba(31,21,52,.55) 100%)" }} />

      {!PORTADA.video && ["localhost", "127.0.0.1"].includes(location.hostname) && (
        <span className="absolute left-4 top-4 z-10 rounded-full border border-dashed border-white/50 px-3 py-1 text-xs text-white/70">
          Aquí va el video de portada
        </span>
      )}
      <div className="relative z-10 ml-auto flex w-full max-w-2xl flex-col items-start gap-4 px-6 py-12 text-left sm:items-end sm:px-12 sm:text-right">
        <span className="inline-flex items-center gap-2 text-sm font-semibold [text-shadow:0_1px_10px_rgba(20,6,14,.5)]">
          {estado.logo && (
            <span className="inline-flex h-9 items-center rounded-lg bg-white px-2">
              <img src={estado.logo} alt={`Logo de ${colegio}`} className="h-7 w-auto object-contain" />
            </span>
          )}
          Demo privada · {colegio}
        </span>
        <h1 className="text-[clamp(34px,6vw,68px)] font-extrabold leading-[1.05] [text-shadow:0_2px_22px_rgba(20,6,14,.6)]">
          Imagine i'Witown en <em className="not-italic text-[#d9c8ff]">{colegio}</em>
        </h1>
        <p className="max-w-[46ch] text-lg text-white/90 [text-shadow:0_2px_22px_rgba(20,6,14,.6)]">
          Aprendizaje, comunicación con las familias y la vida del colegio, en una sola plataforma.
        </p>
        <p className="inline-flex items-center gap-2.5 text-[clamp(17px,2.2vw,24px)] font-bold [text-shadow:0_2px_22px_rgba(20,6,14,.6)]">
          <span className="hidden h-0.5 w-8 rounded bg-[#b79cff] sm:inline-block" />
          Véala funcionando, como si ya fuera suya
        </p>
        <button onClick={empezar}
          className="mt-2 rounded-full bg-white px-7 py-3 text-lg font-extrabold text-[#443773] shadow-xl transition hover:scale-[1.03]">
          Empezar →
        </button>
      </div>
    </section>
  );
}
