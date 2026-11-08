// Publica el configurador SOLO en un canal de vista previa de directivos-iwitown
// (la demo vieja sigue en vivo en ese sitio hasta la Fase 6). Mapea el target
// solo mientras dura el despliegue y devuelve .firebaserc exactamente como
// estaba (copia en memoria), también si se interrumpe con Ctrl+C.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ARCHIVO = ".firebaserc";
const original = readFileSync(ARCHIVO, "utf8");
let restaurado = false;
function restaurar() {
  if (restaurado) return;
  restaurado = true;
  writeFileSync(ARCHIVO, original);
  console.log("\n.firebaserc restaurado (sin el target directivos).");
}
for (const senal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(senal, () => {
    restaurar();
    process.exit(130);
  });
}
process.on("exit", restaurar);

const correr = (cmd) => execSync(cmd, { stdio: "inherit" });
try {
  correr("npm run vitrinas");
  correr("npx firebase target:apply hosting directivos directivos-iwitown --project witown");
  correr("npx firebase hosting:channel:deploy configurador --only directivos --project witown --expires 30d");
} finally {
  restaurar();
}
