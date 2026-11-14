import { useEffect, useState, type ChangeEvent } from "react";
import { FUNCIONALIDADES } from "@/config/funcionalidades";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { avanzar } from "@/lib/progreso";
import { nombreCotizacion } from "@/lib/precio";
import { Botones, Paso } from "@/components/Tablero";
import { CuantosEstudiantes, TablaPlanes } from "@/components/TablaPlanes";
import { LibroLogbook } from "@/components/LibroLogbook";
import { VideoLogbooks } from "@/pages/recorrido/AhorroCostos";

const MAX_LOGO = 2 * 1024 * 1024;
const MAX_PLANTILLAS = 7;
const PASOS = ["Diseñe su portada", "Diseñe sus plantillas", "Así queda su Logbook", "Súmele la plataforma"];
const AREAS = ["Ciencias Naturales", "Ciencias Sociales", "Matemáticas", "Lengua Castellana"];
const BASICO = FUNCIONALIDADES.filter((f) => f.plan === "basico").map((f) => f.id);
const EXTRAS = ["logbooks", "feria"];

/**
 * Camino 3 — Usar mi propio contenido (rehecho el 2026-11-14 con la dueña):
 * cómo se construyen (plantillas = insertos, máximo 7), portada y acabado
 * (argollado o cosido, 21 × 25 cm), el Logbook terminado con su logo y, al
 * final, Solo Logbooks o sumar un plan de la plataforma. Sin guía curricular ni
 * calendario. La portada (muestra de Lengua Castellana) y los 7 insertos son
 * los de la dueña (Documents/GMG), en public/logbooks/.
 */
export function Contenido() {
  const { enlace, estado, cotizacion: c, despachar } = useConfigurador();
  const lb = estado.logbooks;
  const [paso, setPaso] = useState(0);
  const [errorLogo, setErrorLogo] = useState("");

  // Al llegar a "solos o con plataforma", Logbooks queda prendido. Con
  // "prendidas" y no "alternar": StrictMode corre el efecto dos veces.
  useEffect(() => {
    if (paso === 4 && !estado.prendidas.includes("logbooks")) {
      despachar({ tipo: "prendidas", ids: Array.from(new Set([...estado.prendidas, "logbooks"])) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  const subirLogo = (ev: ChangeEvent<HTMLInputElement>) => {
    setErrorLogo("");
    const archivo = ev.target.files?.[0];
    if (!archivo) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(archivo.type)) return setErrorLogo("Use una imagen PNG, JPG, WEBP o SVG.");
    if (archivo.size > MAX_LOGO) return setErrorLogo("La imagen pesa más de 2 MB.");
    const lector = new FileReader();
    lector.onload = () => despachar({ tipo: "logo", valor: String(lector.result) });
    lector.readAsDataURL(archivo);
  };


  const soloLogbooks = c.plan.id === "solo_logbooks";
  const conPlataformaElegida = !soloLogbooks && estado.prendidas.includes("logbooks");
  const conservar = estado.prendidas.filter((id) => EXTRAS.includes(id));
  const sinPlataforma = () => despachar({ tipo: "prendidas", ids: Array.from(new Set(["logbooks", ...conservar])) });
  // Si ya tiene plataforma, se conserva el plan elegido; si no, entra con Básico. Logbooks, siempre.
  const conPlataforma = () => despachar({
    tipo: "prendidas",
    ids: Array.from(new Set([...(soloLogbooks ? BASICO : estado.prendidas), "logbooks", ...conservar])),
  });
  const pedir = () => {
    medir("contenido_fin");
    medir("camino_fin", { ruta: "contenido" });
    avanzar(enlace.e, "plan", 50);
    medir("estudiantes", { estudiantes: estado.estudiantes });
    medir("plan");
    despachar({ tipo: "estudiantesConfirmado" });
    despachar({ tipo: "ir", paso: "numero" });
  };

  const pasos = [
    <Paso key="0" etiqueta="Usar mi propio contenido" titulo="Sus propios Logbooks"
      texto="Diarios de aprendizaje hechos con la metodología y la identidad de su colegio, uno por cada área básica, e integrados a la plataforma.">
      <p className="rounded-2xl bg-[hsl(274_85%_37%)] px-5 py-4 text-center text-xl font-extrabold text-white shadow-lg lg:text-2xl">
        Use su metodología para enseñar
      </p>
      <VideoLogbooks />
      <ol className="grid gap-2 sm:grid-cols-2">
        {PASOS.map((t, i) => (
          <li key={t} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-700 text-sm font-bold text-white">{i + 1}</span>
            <span className="font-semibold text-gray-900">{t}</span>
          </li>
        ))}
      </ol>
      <Botones siguiente={() => { medir("contenido_inicio"); setPaso(1); }} textoSiguiente="Empezar: paso 1 →" />
    </Paso>,

    <Paso key="1" etiqueta={`Paso 1 de ${PASOS.length}`} titulo={PASOS[0]}
      texto="Con los elementos que su colegio quiera. Suba su logo: al final verá cómo queda.">
      <label className="block text-center">
        {/* sr-only y no hidden: así el campo recibe el foco del teclado. */}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="peer sr-only" onChange={subirLogo} />
        <span className="inline-block cursor-pointer rounded-xl border border-purple-300 px-4 py-2 font-semibold text-purple-800 hover:bg-purple-50 peer-focus-visible:ring-2 peer-focus-visible:ring-purple-600">
          {estado.logo ? "✓ Logo listo · cambiarlo" : "Subir el logo del colegio"}
        </span>
      </label>
      <p className="text-center text-xs text-gray-500">Su imagen se queda en este navegador: no se sube a ningún lado.</p>
      {errorLogo && <p className="text-center text-sm text-red-700">{errorLogo}</p>}
      <div className="space-y-2">
        <p className="font-medium text-gray-800">¿Argollado o cosido?</p>
        <div className="flex gap-2">
          {(["argollado", "cosido"] as const).map((e) => (
            <button key={e} aria-pressed={lb.encuadernacion === e} onClick={() => despachar({ tipo: "logbooks", valor: { encuadernacion: e } })}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${lb.encuadernacion === e ? "bg-purple-700 text-white" : "bg-white text-purple-900 shadow-sm"}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600">Tamaño del Logbook: <b>21 × 25 cm</b>.</p>
      <Botones atras={() => setPaso(0)} siguiente={() => { medir("contenido_portada"); setPaso(2); }} />
    </Paso>,

    <Paso key="2" etiqueta={`Paso 2 de ${PASOS.length}`} titulo={PASOS[1]}>
      <div className="space-y-3 text-gray-700">
        <p>
          Los Logbooks se construyen desde la creación de plantillas, que van a ser los insertos. Las plantillas son la
          forma en que su colegio enseña cada uno de los temas.
        </p>
        <p>En ellas usted pone al estudiante a escribir, dibujar y plasmar su conocimiento.</p>
        <p className="font-semibold text-purple-900">Pueden ser máximo {MAX_PLANTILLAS} plantillas.</p>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {Array.from({ length: MAX_PLANTILLAS }, (_, i) => (
          <img key={i} src={`/logbooks/inserto-${i + 1}.webp`} alt={`Plantilla de ejemplo ${i + 1}`} loading="lazy"
            className="w-36 shrink-0 snap-start rounded-lg border border-gray-200 bg-white shadow-sm" />
        ))}
      </div>
      <Botones atras={() => setPaso(1)} siguiente={() => { medir("contenido_plantillas"); setPaso(3); }} textoSiguiente="Ver mi Logbook" />
    </Paso>,

    <Paso key="3" etiqueta={`Paso 3 de ${PASOS.length}`} titulo={PASOS[2]}
      texto={`Su portada${estado.logo ? ", con su logo," : ""} y las ${MAX_PLANTILLAS} plantillas generales, ya diseñadas e impresas.`}>
      <LibroLogbook logo={estado.logo} colegio={estado.contacto.colegio} />
      <p className="text-xs text-gray-400">
        {lb.encuadernacion ? `${lb.encuadernacion[0].toUpperCase()}${lb.encuadernacion.slice(1)} · ` : ""}21 × 25 cm · un Logbook por área: {AREAS.join(", ")}.
      </p>
      <Botones atras={() => setPaso(2)} siguiente={() => setPaso(4)} />
    </Paso>,

    <Paso key="4" etiqueta={`Paso 4 de ${PASOS.length}`} titulo={PASOS[3]}
      texto="Puede llevar solo los Logbooks o sumarles un plan de la plataforma: el docente sigue el avance de cada estudiante y los papás comprueban que sí se usa.">
      <div className="grid gap-3 sm:grid-cols-2">
        <button aria-pressed={soloLogbooks} onClick={sinPlataforma}
          className={`rounded-2xl border-2 p-4 text-left ${soloLogbooks ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"}`}>
          <span className="block font-semibold text-gray-900">Solo Logbooks</span>
          <span className="block text-sm text-gray-600">Los 4 Logbooks, uno por área básica.</span>
        </button>
        <button aria-pressed={conPlataformaElegida} onClick={conPlataforma}
          className={`rounded-2xl border-2 p-4 text-left ${conPlataformaElegida ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"}`}>
          <span className="block font-semibold text-gray-900">Logbooks + plataforma</span>
          <span className="block text-sm text-gray-600">Sume un plan: Básico, Pro o Completo.</span>
        </button>
      </div>
      <CuantosEstudiantes />
      {!soloLogbooks && <TablaPlanes />}
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border-2 border-[#E6E6E6] bg-white p-4 sm:flex-row">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#554884]">{nombreCotizacion(c)}</p>
          {c.porCotizar.length > 0 && <p className="text-xs text-gray-500">+ {c.porCotizar.join(", ")} por cotizar</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPaso(3)} className="rounded-full px-4 py-2 font-semibold text-[#554884] hover:bg-[#554884]/10">Atrás</button>
          <button onClick={pedir} className="rounded-full bg-[hsl(274_85%_37%)] px-5 py-2 font-bold text-white">Solicitar cotización y demo →</button>
        </div>
      </div>
    </Paso>,
  ];

  return pasos[paso];
}
