import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Por defecto, en local /api no va a ningún lado: probar en local NO escribe en
// producción (leads, correos, cupos de la agenda). Para probar contra las
// funciones reales, a conciencia: VITE_PROXY_PRODUCCION=1 en .env.local.
const CF = (fn: string) => `https://${fn}-405433677445.us-central1.run.app`;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy =
    env.VITE_PROXY_PRODUCCION === "1"
      ? {
          "/api/config": { target: CF("configuradorpublico"), changeOrigin: true },
          "/api/horas": { target: CF("landinghoras"), changeOrigin: true },
          "/api/agendar": { target: CF("landingagendar"), changeOrigin: true },
        }
      : undefined;
  return {
    server: { host: "::", port: 8090, proxy },
    plugins: [react()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  };
});
