// Copia de witown_fe_students/src/components/WiwiQuestModoRefuerzoFondo.tsx (main):
// el mismo fondo de la pantalla de preguntas de WiwiQuest.
// Fondo animado por modo de refuerzo (mockup de diseño). Mismo diseño en todos los
// modos y en ambos niveles —brillo difuso que se desplaza en diagonal + red neuronal
// (malla que titila + pulsos que viajan de nodo a nodo)— pero recoloreado según el
// modo elegido: 1 = Resolver problemas (azul-morado), 2 = Dominar tema (verde),
// 3 = Ganar examen (naranja-rojizo).
//
// Bachillerato (claro=false): fondo oscuro, malla casi transparente (blanca/pastel).
// Primaria (claro=true): fondo blanco, malla en el color del modo con más opacidad
// (para que se note sobre blanco).

export type ModoFondoId = 1 | 2 | 3;

interface PaletaFondo {
  base: string;
  glow: string;
  redA: string;
  redB: string;
  pulso: string;
  pulsoOpacidadPico: number;
}

const PALETAS_OSCURAS: Record<ModoFondoId, PaletaFondo> = {
  1: {
    base: "linear-gradient(160deg, #0d0a20 0%, #171233 45%, #1c1442 75%, #0f0b22 100%)",
    glow: "rgba(126, 111, 224, 0.28)",
    redA: "#ffffff",
    redB: "#c9bfff",
    pulso: "#ffffff",
    pulsoOpacidadPico: 0.4,
  },
  2: {
    base: "linear-gradient(160deg, #081a10 0%, #0f2e1c 45%, #123a22 75%, #071309 100%)",
    glow: "rgba(76, 175, 110, 0.3)",
    redA: "#ffffff",
    redB: "#a8e6b0",
    pulso: "#ffffff",
    pulsoOpacidadPico: 0.4,
  },
  3: {
    base: "linear-gradient(160deg, #1a0808 0%, #2e0f0f 45%, #3a1414 75%, #130606 100%)",
    glow: "rgba(200, 70, 70, 0.3)",
    redA: "#ffffff",
    redB: "#e8a8a8",
    pulso: "#ffffff",
    pulsoOpacidadPico: 0.4,
  },
};

const PALETAS_CLARAS: Record<ModoFondoId, PaletaFondo> = {
  1: {
    base: "linear-gradient(160deg, #ffffff 0%, #f6f4ff 50%, #ffffff 100%)",
    glow: "rgba(139, 109, 184, 0.16)",
    redA: "#6a5acd",
    redB: "#8b6db8",
    pulso: "#6a5acd",
    pulsoOpacidadPico: 0.55,
  },
  2: {
    base: "linear-gradient(160deg, #ffffff 0%, #f2faf5 50%, #ffffff 100%)",
    glow: "rgba(76, 175, 110, 0.16)",
    redA: "#2e7d4f",
    redB: "#4caf6e",
    pulso: "#2e7d4f",
    pulsoOpacidadPico: 0.55,
  },
  3: {
    base: "linear-gradient(160deg, #ffffff 0%, #fff3ef 50%, #ffffff 100%)",
    glow: "rgba(224, 90, 58, 0.16)",
    redA: "#c9540f",
    redB: "#e0503a",
    pulso: "#c9540f",
    pulsoOpacidadPico: 0.55,
  },
};

// Malla estática (dos grupos que titilan por separado, ver tailwind: network-flicker-a/b).
const MALLA_A = {
  lineas: [
    [150, 150, 420, 260],
    [420, 260, 700, 140],
    [700, 140, 950, 280],
    [300, 520, 420, 260],
    [300, 520, 600, 600],
    [600, 600, 900, 540],
    [150, 150, 300, 520],
  ],
  puntos: [
    [150, 150], [420, 260], [700, 140], [950, 280], [300, 520], [600, 600], [900, 540],
  ],
};
const MALLA_B = {
  lineas: [
    [950, 280, 1250, 180],
    [1250, 180, 1480, 320],
    [900, 540, 1200, 600],
    [1200, 600, 1480, 320],
    [1480, 320, 1420, 700],
    [1200, 600, 1420, 700],
    [700, 140, 1250, 180],
  ],
  puntos: [
    [1250, 180], [1480, 320], [1200, 600], [1420, 700],
  ],
};

// Pulsos que viajan de un punto a otro a lo largo de algunas conexiones (ida y vuelta).
const PULSOS = [
  { path: [150, 150, 420, 260], dur: "7s", begin: "0s" },
  { path: [420, 260, 700, 140], dur: "8.5s", begin: "-3s" },
  { path: [300, 520, 600, 600], dur: "9s", begin: "-5s" },
  { path: [900, 540, 1200, 600], dur: "7.5s", begin: "-1.5s" },
  { path: [1250, 180, 1480, 320], dur: "10s", begin: "-6s" },
  { path: [1200, 600, 1420, 700], dur: "8s", begin: "-4s" },
];

interface WiwiQuestModoRefuerzoFondoProps {
  variant: ModoFondoId;
  /** true = primaria (fondo blanco, malla en color del modo). false/omitido = bachillerato (fondo oscuro). */
  claro?: boolean;
  /**
   * Reemplaza el color de fondo de la paleta, conservando la red neuronal y el
   * brillo. Lo usa el visor de contexto, que quiere la misma malla que las
   * preguntas pero sobre su propio fondo. Omitido = el color del modo, que es
   * lo que ya hacia.
   */
  colorFondo?: string;
}

const WiwiQuestModoRefuerzoFondo = ({ variant, claro = false, colorFondo }: WiwiQuestModoRefuerzoFondoProps) => {
  const paleta = (claro ? PALETAS_CLARAS : PALETAS_OSCURAS)[variant];
  const claseFlickerA = claro ? "animate-network-flicker-a-claro" : "animate-network-flicker-a";
  const claseFlickerB = claro ? "animate-network-flicker-b-claro" : "animate-network-flicker-b";

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: colorFondo ?? paleta.base }}
    >
      {/* Brillo difuso: se desplaza lento en diagonal, derecha → izquierda */}
      <div
        className="absolute animate-glow-drift"
        style={{
          top: "-25%",
          left: "-15%",
          width: "150%",
          height: "150%",
          background: `radial-gradient(closest-side, ${paleta.glow}, rgba(0, 0, 0, 0) 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Red neuronal: malla estática (titila) + pulsos que viajan entre nodos */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className={claseFlickerA} stroke={paleta.redA} strokeWidth="1" fill={paleta.redA}>
          {MALLA_A.lineas.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
          {MALLA_A.puntos.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={3} />
          ))}
        </g>
        <g className={claseFlickerB} stroke={paleta.redB} strokeWidth="1" fill={paleta.redB}>
          {MALLA_B.lineas.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
          {MALLA_B.puntos.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={3} />
          ))}
        </g>

        {PULSOS.map(({ path: [x1, y1, x2, y2], dur, begin }, i) => (
          <circle key={i} r={3} fill={paleta.pulso} style={{ filter: "blur(0.5px)" }}>
            <animate attributeName="cx" values={`${x1};${x2};${x1}`} dur={dur} begin={begin} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${y1};${y2};${y1}`} dur={dur} begin={begin} repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values={`0;${paleta.pulsoOpacidadPico};${paleta.pulsoOpacidadPico};0`}
              keyTimes="0;0.1;0.9;1"
              dur={dur}
              begin={begin}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default WiwiQuestModoRefuerzoFondo;
