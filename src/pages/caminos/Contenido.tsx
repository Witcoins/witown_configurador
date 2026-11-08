import { useMemo, useState, type ChangeEvent } from "react";
import { AREAS, COLORES, CURSOS, GUIA_EJEMPLO, PLANTILLAS, semanaEscolar, type TemaGuia } from "@/config/contenidoEjemplo";
import { useConfigurador } from "@/lib/estado";
import { medir } from "@/lib/analitica";
import { Botones, Paso } from "@/components/Tablero";

const MAX_LOGO = 2 * 1024 * 1024;

/** Camino 3 — Usar mi propio contenido. Taller de armado con contenido de EJEMPLO. */
export function Contenido() {
  const { estado, despachar } = useConfigurador();
  const lb = estado.logbooks;
  const [paso, setPaso] = useState(0);
  const [area, setArea] = useState(lb.areas[0] || AREAS[0]);
  const [guia, setGuia] = useState<Record<string, (TemaGuia & { tachado?: boolean })[]>>(() =>
    JSON.parse(JSON.stringify(GUIA_EJEMPLO)));
  const [nuevo, setNuevo] = useState("");
  const [pagina, setPagina] = useState(0);
  const [fecha, setFecha] = useState(() => new Date(new Date().getFullYear(), 4, 3).getTime());
  const [errorLogo, setErrorLogo] = useState("");

  const alternar = (campo: "areas" | "cursos", v: string) =>
    despachar({ tipo: "logbooks", valor: { [campo]: lb[campo].includes(v) ? lb[campo].filter((x) => x !== v) : [...lb[campo], v] } });

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

  const temas = guia[area] || [];
  const mover = (i: number, d: -1 | 1) => {
    const lista = [...temas];
    const j = i + d;
    if (j < 0 || j >= lista.length) return;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    setGuia({ ...guia, [area]: lista });
  };
  const cambiar = (i: number, cambio: Partial<TemaGuia & { tachado?: boolean }>) =>
    setGuia({ ...guia, [area]: temas.map((t, k) => (k === i ? { ...t, ...cambio } : t)) });

  const semana = semanaEscolar(new Date(fecha));
  const temaDeLaSemana = useMemo(() => {
    const vigentes = temas.filter((t) => !t.tachado).sort((a, b) => a.semana - b.semana);
    return [...vigentes].reverse().find((t) => t.semana <= semana) || vigentes[0];
  }, [temas, semana]);

  const portada = (
    <div className="relative mx-auto flex aspect-[3/4] w-48 flex-col justify-between rounded-r-2xl rounded-l-md p-4 text-white shadow-lg"
      style={{ background: lb.color }}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold opacity-90">Logbook</span>
        {estado.logo
          ? <img src={estado.logo} alt="Logo del colegio" className="h-12 w-12 rounded bg-white/90 object-contain p-1" />
          : <span className="h-12 w-12 rounded border border-dashed border-white/60" />}
      </div>
      <div>
        <p className="text-lg font-bold leading-tight">{area}</p>
        <p className="text-sm opacity-90">{lb.cursos[0] || "Cuarto"}</p>
        <p className="mt-2 text-xs opacity-80">{estado.contacto.colegio || "Su colegio"}</p>
      </div>
    </div>
  );

  const rotulo = <p className="text-xs text-gray-400">Contenido de ejemplo: las plantillas y la guía reales se ajustan con su colegio.</p>;

  const pasos = [
    <Paso key="0" etiqueta="Usar mi propio contenido" titulo="¿Qué áreas y cursos quiere con Logbooks propios?"
      texto="Nosotros le prestamos la portada; lo de adentro es suyo: su estructura, su modelo, hasta la mascota del colegio.">
      <Chips titulo="Áreas" opciones={AREAS} elegidas={lb.areas} alternar={(v) => alternar("areas", v)} />
      <Chips titulo="Cursos" opciones={CURSOS} elegidas={lb.cursos} alternar={(v) => alternar("cursos", v)} />
      <Botones siguiente={() => { if (lb.areas[0]) setArea(lb.areas[0]); medir("contenido_areas"); setPaso(1); }} />
    </Paso>,

    <Paso key="1" etiqueta="Portada" titulo="Un diseño único, con su logo" texto="Toque un color y suba su logo o su mascota: se ve al instante.">
      {portada}
      <div className="flex flex-wrap justify-center gap-2">
        {COLORES.map((c, i) => (
          <button key={c} aria-label={`Color ${i + 1} de ${COLORES.length}`} aria-pressed={lb.color === c} onClick={() => despachar({ tipo: "logbooks", valor: { color: c } })}
            className={`h-9 w-9 rounded-full border-4 ${lb.color === c ? "border-gray-900" : "border-white"}`} style={{ background: c }} />
        ))}
      </div>
      <label className="block text-center">
        {/* sr-only y no hidden: así el campo recibe el foco del teclado. */}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="peer sr-only" onChange={subirLogo} />
        <span className="inline-block cursor-pointer rounded-xl border border-purple-300 px-4 py-2 font-semibold text-purple-800 hover:bg-purple-50 peer-focus-visible:ring-2 peer-focus-visible:ring-purple-600">
          Subir logo o mascota
        </span>
      </label>
      <p className="text-center text-xs text-gray-500">Su imagen se queda en este navegador: no se sube a ningún lado.</p>
      {errorLogo && <p className="text-center text-sm text-red-700">{errorLogo}</p>}
      <Botones atras={() => setPaso(0)} siguiente={() => setPaso(2)} />
    </Paso>,

    <Paso key="2" etiqueta="Plantillas" titulo="Elija cómo se ven por dentro" texto="Con un toque. También puede crear la suya.">
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {PLANTILLAS.map((p) => (
          <button key={p.id} aria-pressed={lb.plantilla === p.id} onClick={() => despachar({ tipo: "logbooks", valor: { plantilla: p.id } })}
            className={`w-48 shrink-0 snap-start rounded-2xl border-2 bg-white p-4 text-left ${lb.plantilla === p.id ? "border-purple-600" : "border-gray-200"}`}>
            <div className="mb-3 h-24 rounded-lg" style={{ background: `linear-gradient(135deg, ${lb.color}22, ${lb.color}55)` }} />
            <p className="font-semibold">{p.nombre}</p>
            <p className="text-sm text-gray-600">{p.descripcion}</p>
          </button>
        ))}
        <div className="flex w-48 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          Crear la mía (con su asesora)
        </div>
      </div>
      {rotulo}
      <Botones atras={() => setPaso(1)} siguiente={() => setPaso(3)} />
    </Paso>,

    <Paso key="3" etiqueta="Guía curricular" titulo="Su guía, a su manera"
      texto="Viene con lo básico que exige el Ministerio, pero no es obligatoria: tache, reordene, agregue y ponga fechas.">
      <div className="flex flex-wrap gap-2">
        {(lb.areas.length ? lb.areas : AREAS).map((a) => (
          <button key={a} aria-pressed={a === area} onClick={() => setArea(a)}
            className={`rounded-full px-3 py-1.5 text-sm ${a === area ? "bg-purple-700 text-white" : "bg-white text-purple-900 shadow-sm"}`}>{a}</button>
        ))}
      </div>
      <ul className="space-y-2">
        {temas.map((t, i) => (
          <li key={t.id} className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
            <span className="flex flex-col">
              <button aria-label="Subir" onClick={() => mover(i, -1)} className="px-1 text-gray-400 hover:text-purple-700">▲</button>
              <button aria-label="Bajar" onClick={() => mover(i, 1)} className="px-1 text-gray-400 hover:text-purple-700">▼</button>
            </span>
            <span className={`flex-1 ${t.tachado ? "text-gray-400 line-through" : "text-gray-900"}`}>{t.titulo}</span>
            <label className="text-xs text-gray-500">
              Semana
              <input type="number" min={1} max={40} value={t.semana} onChange={(e) => cambiar(i, { semana: Math.min(40, Math.max(1, Number(e.target.value) || 1)) })}
                className="ml-1 w-14 rounded border border-gray-300 px-1 py-0.5 text-right" />
            </label>
            <button onClick={() => cambiar(i, { tachado: !t.tachado })} className="text-sm text-purple-700 underline">
              {t.tachado ? "Volver" : "Tachar"}
            </button>
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={(e) => {
        e.preventDefault();
        if (!nuevo.trim()) return;
        setGuia({ ...guia, [area]: [...temas, { id: `n${Date.now()}`, titulo: nuevo.trim().slice(0, 80), semana: 30 }] });
        setNuevo("");
      }}>
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Agregar un tema propio"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2" />
        <button className="rounded-lg bg-purple-700 px-4 font-semibold text-white">Agregar</button>
      </form>
      {rotulo}
      <Botones atras={() => setPaso(2)} siguiente={() => setPaso(4)} />
    </Paso>,

    <Paso key="4" etiqueta="Hojear el Logbook" titulo="Así se vería su propio contenido"
      texto="Es un diario de aprendizaje: los estudiantes crean su contenido y el docente sabe en tiempo real qué entendió cada niño.">
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setPagina((p) => Math.max(0, p - 1))} className="text-2xl text-purple-700" aria-label="Página anterior">‹</button>
        {pagina === 0 ? portada : (
          <div className="aspect-[3/4] w-48 rounded-2xl bg-white p-4 shadow-lg">
            <p className="text-xs font-semibold" style={{ color: lb.color }}>{PLANTILLAS.find((p) => p.id === lb.plantilla)?.nombre}</p>
            <p className="mt-1 font-bold">{temas.filter((t) => !t.tachado)[pagina - 1]?.titulo || "Mi reflexión"}</p>
            <div className="mt-3 space-y-2">
              {[0, 1, 2, 3].map((k) => <div key={k} className="h-2 rounded bg-gray-100" />)}
            </div>
            <p className="mt-4 text-xs text-gray-400">Lo que aprendí hoy…</p>
          </div>
        )}
        <button onClick={() => setPagina((p) => Math.min(temas.length, p + 1))} className="text-2xl text-purple-700" aria-label="Página siguiente">›</button>
      </div>
      <Botones atras={() => setPaso(3)} siguiente={() => setPaso(5)} />
    </Paso>,

    <Paso key="5" etiqueta="Mueva el calendario" titulo="La plataforma se acomoda sola a su guía"
      texto="Mueva la fecha: el refuerzo, las tareas sugeridas y lo que ve el papá salen del tema que usted planeó.">
      <input type="range" className="w-full accent-purple-700"
        min={new Date(new Date().getFullYear(), 1, 1).getTime()} max={new Date(new Date().getFullYear(), 10, 30).getTime()}
        step={24 * 3600 * 1000} value={fecha} onChange={(e) => setFecha(Number(e.target.value))} />
      <p className="text-center font-semibold text-purple-900">
        {new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long" })} · semana {semana}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Tarjeta titulo="Refuerzo del estudiante" texto={temaDeLaSemana?.titulo || "—"} />
        <Tarjeta titulo="Tarea sugerida al docente" texto={temaDeLaSemana ? `Practicar: ${temaDeLaSemana.titulo}` : "—"} />
        <Tarjeta titulo="Lo que ve el papá" texto={temaDeLaSemana ? `Esta semana: ${temaDeLaSemana.titulo}` : "—"} />
      </div>
      <Botones atras={() => setPaso(4)} siguiente={() => {
        if (!estado.prendidas.includes("logbooks")) despachar({ tipo: "alternar", id: "logbooks" });
        medir("contenido_fin");
        despachar({ tipo: "ir", paso: "numero" });
      }} textoSiguiente="Los Logbooks vienen con la plataforma: ver mi número" />
    </Paso>,
  ];

  return pasos[paso];
}

function Chips({ titulo, opciones, elegidas, alternar }: { titulo: string; opciones: string[]; elegidas: string[]; alternar: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-gray-800">{titulo}</p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <button key={o} aria-pressed={elegidas.includes(o)} onClick={() => alternar(o)}
            className={`rounded-full px-4 py-1.5 text-sm ${elegidas.includes(o) ? "bg-purple-700 text-white" : "bg-white text-purple-900 shadow-sm"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Tarjeta({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-purple-700">{titulo}</p>
      <p className="mt-1 text-gray-900">{texto}</p>
    </div>
  );
}
