// Publica el configurador SOLO en un canal de vista previa de directivos-iwitown
// (la demo vieja sigue en vivo en ese sitio hasta la Fase 6). Mapea el target
// solo mientras dura el despliegue y devuelve .firebaserc exactamente como
// estaba, aunque falle (copia en memoria; no depende de git).
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ARCHIVO = ".firebaserc";
const original = readFileSync(ARCHIVO, "utf8");
const correr = (cmd) => execSync(cmd, { stdio: "inherit" });

try {
  correr("npm run build");
  correr("npx firebase target:apply hosting directivos directivos-iwitown --project witown");
  correr("npx firebase hosting:channel:deploy configurador --only directivos --project witown --expires 30d");
} finally {
  writeFileSync(ARCHIVO, original);
  console.log(".firebaserc restaurado (sin el target directivos).");
}
