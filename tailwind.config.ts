import type { Config } from "tailwindcss";

// Animaciones copiadas de witown_fe_students (tailwind.config.ts): el fondo y la
// tarjeta de la bienvenida son los de la pantalla de preguntas de WiwiQuest.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "glow-drift": {
          "0%, 100%": { transform: "translate(15%, -6%)" },
          "25%": { transform: "translate(-5%, 4%)" },
          "50%": { transform: "translate(-20%, -3%)" },
          "75%": { transform: "translate(-8%, 6%)" },
        },
        "network-flicker-a": {
          "0%, 100%": { opacity: "0.03", transform: "translate(0%, 0%)" },
          "50%": { opacity: "0.09", transform: "translate(-2%, 1.5%)" },
        },
        "network-flicker-b": {
          "0%, 100%": { opacity: "0.08", transform: "translate(0%, 0%)" },
          "50%": { opacity: "0.02", transform: "translate(1.5%, -2%)" },
        },
        "network-flicker-a-claro": {
          "0%, 100%": { opacity: "0.12", transform: "translate(0%, 0%)" },
          "50%": { opacity: "0.30", transform: "translate(-2%, 1.5%)" },
        },
        "network-flicker-b-claro": {
          "0%, 100%": { opacity: "0.26", transform: "translate(0%, 0%)" },
          "50%": { opacity: "0.10", transform: "translate(1.5%, -2%)" },
        },
        "heartbeat-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 1px var(--latido-color, rgba(255, 255, 255, 0.55))" },
          "14%": { boxShadow: "0 0 18px 4px var(--latido-color, rgba(255, 255, 255, 0.55))" },
          "28%": { boxShadow: "0 0 8px 1px var(--latido-color, rgba(255, 255, 255, 0.55))" },
          "42%": { boxShadow: "0 0 18px 4px var(--latido-color, rgba(255, 255, 255, 0.55))" },
          "70%": { boxShadow: "0 0 8px 1px var(--latido-color, rgba(255, 255, 255, 0.55))" },
        },
        "aparecer": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "glow-drift": "glow-drift 40s ease-in-out infinite",
        "network-flicker-a": "network-flicker-a 14s ease-in-out infinite",
        "network-flicker-b": "network-flicker-b 19s ease-in-out infinite -6s",
        "network-flicker-a-claro": "network-flicker-a-claro 14s ease-in-out infinite",
        "network-flicker-b-claro": "network-flicker-b-claro 19s ease-in-out infinite -6s",
        "heartbeat-glow": "heartbeat-glow 2.2s ease-in-out infinite",
        aparecer: "aparecer 0.35s ease-out both",
      },
      fontFamily: { nunito: ["Nunito", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
