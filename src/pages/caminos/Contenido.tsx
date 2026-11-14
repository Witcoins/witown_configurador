import { useEffect, useState, type ChangeEvent } from "react";
import { FUNCIONALIDADES } from "@/config/funcionalidades";
import precios from "@/config/precios.json";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { avanzar } from "@/lib/progreso";
import { nombreCotizacion, pesos } from "@/lib/precio";
import { Botones, Paso } from "@/components/Tablero";
import { CuantosEstudiantes, TablaPlanes } from "@/components/TablaPlanes";

const MAX_LOGO = 2 * 1024 * 1024;
const MAX_PLANTILLAS = 7;
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
    if (paso === 3 && !estado.prendidas.includes("logbooks")) {
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

  // La portada real (muestra de Lengua Castellana 4.°): encima, el logo que
  // subió el rector y el nombre de su colegio, donde la muestra dice "Gimco
  // School" y "Tu Colegio". Posiciones en % de public/logbooks/portada.webp.
  const portada = (
    <div className="relative mx-auto w-64 overflow-hidden rounded-r-2xl rounded-l-md shadow-lg sm:w-72">
      <img src="/logbooks/portada.webp" alt="Portada del Logbook de Lengua Castellana, cuarto grado" className="block w-full" />
      {estado.logo && (
        <img src={estado.logo} alt="Logo del colegio" className="absolute rounded-lg bg-white object-contain p-1 shadow"
          style={{ left: "3%", top: "76.5%", width: "22%", height: "15.5%" }} />
      )}
      <span className="absolute flex items-center justify-center px-1 text-[11px] text-white sm:text-xs"
        style={{ left: "28%", width: "44%", top: "94%", height: "4.5%", background: "rgb(24,0,168)" }}>
        {/* El texto en su propio span: en un flex, truncate no pone "…". */}
        <span className="min-w-0 truncate">{estado.contacto.colegio || "Su colegio"}</span>
      </span>
    </div>
  );

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
    <Paso key="0" etiqueta="Usar mi propio contenido" titulo="Sus Logbooks nacen de sus plantillas">
      <div className="space-y-3 text-gray-700">
        <p>
          Los Logbooks se construyen desde la creación de plantillas, que van a ser los insertos. Las plantillas son la
          forma en que su colegio enseña cada uno de los temas.
        </p>
        <p>En ellas usted pone al estudiante a escribir, dibujar y plasmar su conocimiento.</p>
        <p className="font-semibold text-purple-900">Pueden ser máximo {MAX_PLANTILLAS} plantillas.</p>
      </div>
      <Botones siguiente={() => { medir("contenido_plantillas"); setPaso(1); }} />
    </Paso>,

    <Paso key="1" etiqueta="Portada y acabado" titulo="Luego se diseña la portada"
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
      <Botones atras={() => setPaso(0)} siguiente={() => { medir("contenido_portada"); setPaso(2); }} textoSiguiente="Ver mi Logbook" />
    </Paso>,

    <Paso key="2" etiqueta="Su Logbook" titulo="Así queda el Logbook de su colegio"
      texto={`Su portada${estado.logo ? ", con su logo," : ""} y las ${MAX_PLANTILLAS} plantillas generales, ya diseñadas e impresas.`}>
      {portada}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: MAX_PLANTILLAS }, (_, i) => (
          <li key={i}>
            <a href={`/logbooks/inserto-${i + 1}.webp`} target="_blank" rel="noopener noreferrer" className="block">
              <img src={`/logbooks/inserto-${i + 1}.webp`} alt={`Plantilla ${i + 1} de ${MAX_PLANTILLAS}`} loading="lazy"
                className="w-full rounded-lg border border-gray-200 bg-white shadow-sm" />
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400">
        {lb.encuadernacion ? `${lb.encuadernacion[0].toUpperCase()}${lb.encuadernacion.slice(1)} · ` : ""}21 × 25 cm · un Logbook por área: {AREAS.join(", ")}.
      </p>
      <Botones atras={() => setPaso(1)} siguiente={() => setPaso(3)} />
    </Paso>,

    <Paso key="3" etiqueta="Y la plataforma" titulo="Los Logbooks solos o con la plataforma"
      texto="Puede llevar solo los Logbooks o sumarles un plan de la plataforma: el docente sigue el avance de cada estudiante y los papás comprueban que sí se usa.">
      <div className="grid gap-3 sm:grid-cols-2">
        <button aria-pressed={soloLogbooks} onClick={sinPlataforma}
          className={`rounded-2xl border-2 p-4 text-left ${soloLogbooks ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"}`}>
          <span className="block font-semibold text-gray-900">Solo Logbooks</span>
          <span className="block text-sm text-gray-600">{precios.solo_logbooks.detalle} por estudiante.</span>
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
          <p className="text-xl font-extrabold text-[#443773]">{pesos(c.porEstudiante)} <span className="text-xs font-normal text-gray-500">/estudiante al año</span></p>
          {c.porCotizar.length > 0 && <p className="text-xs text-gray-500">+ {c.porCotizar.join(", ")} por cotizar</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPaso(2)} className="rounded-full px-4 py-2 font-semibold text-[#554884] hover:bg-[#554884]/10">Atrás</button>
          <button onClick={pedir} className="rounded-full bg-[hsl(274_85%_37%)] px-5 py-2 font-bold text-white">Solicitar cotización y demo →</button>
        </div>
      </div>
    </Paso>,
  ];

  return pasos[paso];
}
