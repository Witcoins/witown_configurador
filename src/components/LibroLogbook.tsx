import { useRef, useState, type CSSProperties } from "react";

/**
 * El Logbook como un libro que pasa páginas: la portada y los 7 insertos (las
 * imágenes de la dueña, en public/logbooks/). Encima, el logo que subió el
 * rector (o el de su enlace) y el nombre de su colegio:
 * - portada: el logo sobre "Gimco School" y el nombre sobre "Tu Colegio";
 * - insertos: el logo en el círculo de arriba (el blanco del 1, el azul de 2 a 7).
 * Las posiciones están en % de cada imagen (todas miden 1 : 1,414).
 * Sin librerías: cada hoja gira sobre su borde izquierdo con CSS 3D.
 */
const TOTAL_INSERTOS = 7;
const CIRCULO_1: CSSProperties = { left: "42.5%", top: "3.4%", width: "15%", height: "10.6%" };
const CIRCULO_AZUL: CSSProperties = { left: "5.6%", top: "2.9%", width: "11.8%", height: "8.4%" };

export function LibroLogbook({ logo, colegio }: { logo: string | null; colegio: string }) {
  const paginas = [
    <Hoja key="portada" src="/logbooks/portada.webp" alt="Portada del Logbook de Lengua Castellana, cuarto grado">
      {logo && (
        <img src={logo} alt="Logo del colegio" draggable={false} className="absolute rounded-lg bg-white object-contain p-1 shadow"
          style={{ left: "3%", top: "76.5%", width: "22%", height: "15.5%" }} />
      )}
      <span className="absolute flex items-center justify-center px-1 text-[11px] text-white sm:text-xs"
        style={{ left: "28%", width: "44%", top: "94%", height: "4.5%", background: "rgb(24,0,168)" }}>
        {/* El texto en su propio span: en un flex, truncate no pone "…". */}
        <span className="min-w-0 truncate">{colegio || "Su colegio"}</span>
      </span>
    </Hoja>,
    ...Array.from({ length: TOTAL_INSERTOS }, (_, k) => (
      <Hoja key={k} src={`/logbooks/inserto-${k + 1}.webp`} alt={`Plantilla ${k + 1} de ${TOTAL_INSERTOS}`}>
        {logo && (
          <img src={logo} alt="" aria-hidden draggable={false} className="absolute rounded-full bg-white object-contain p-0.5"
            style={k === 0 ? CIRCULO_1 : CIRCULO_AZUL} />
        )}
      </Hoja>
    )),
  ];
  const n = paginas.length;
  const [i, setI] = useState(0);
  const ir = (d: number) => setI((v) => Math.min(n - 1, Math.max(0, v + d)));
  const toque = useRef<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="mx-auto w-64 select-none sm:w-80">
        {/* La perspectiva en el padre directo de las hojas; pan-y: el dedo desliza horizontal sin que el navegador se lleve el gesto. */}
        <div className="relative aspect-[700/991]" style={{ perspective: "1600px", touchAction: "pan-y" }}
          onPointerDown={(e) => {
            toque.current = e.button === 0 ? e.clientX : null;
            // Que el soltar llegue aquí aunque el puntero salga del libro.
            if (e.button === 0) e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerCancel={() => { toque.current = null; }}
          onPointerUp={(e) => {
            const desde = toque.current;
            toque.current = null;
            if (desde == null) return;
            const dx = e.clientX - desde;
            if (Math.abs(dx) > 30) return ir(dx < 0 ? 1 : -1);
            // Un toque: mitad derecha adelante, mitad izquierda atrás.
            const caja = e.currentTarget.getBoundingClientRect();
            ir(e.clientX - caja.left > caja.width / 2 ? 1 : -1);
          }}>
          {paginas.map((p, k) => {
            const pasada = k < i;
            return (
              <div key={k} aria-hidden={k !== i}
                className="absolute inset-0 overflow-hidden rounded-r-xl rounded-l-sm bg-white shadow-xl transition-transform duration-700 ease-in-out"
                style={{
                  transformOrigin: "left center",
                  transform: pasada ? "rotateY(-180deg)" : "rotateY(0deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  // La que gira hacia adelante queda encima de la siguiente; las ya pasadas no se ven (reverso oculto).
                  zIndex: pasada ? n + k : n - k,
                }}>
                {p}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => ir(-1)} disabled={i === 0} aria-label="Página anterior"
          className="rounded-full px-3 py-1 text-2xl text-purple-700 disabled:opacity-30">‹</button>
        <p className="min-w-[9rem] text-center text-sm font-semibold text-gray-700" aria-live="polite">
          {i === 0 ? "Portada" : `Plantilla ${i} de ${TOTAL_INSERTOS}`}
        </p>
        <button onClick={() => ir(1)} disabled={i === n - 1} aria-label="Página siguiente"
          className="rounded-full px-3 py-1 text-2xl text-purple-700 disabled:opacity-30">›</button>
      </div>
    </div>
  );
}

function Hoja({ src, alt, children }: { src: string; alt: string; children?: React.ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <img src={src} alt={alt} draggable={false} className="block h-full w-full object-cover" />
      {children}
    </div>
  );
}
