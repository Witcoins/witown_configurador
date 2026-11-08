// Arma dist/ completo: el configurador + las cinco plataformas en modo vitrina
// (contrato: iwitown-docs/specs/VITRINA.md). Cada plataforma se compila
// desde su propio repo (rama feature/configurador) con VITE_DEMO=1 y su base, y
// se copia a dist/<plataforma>/.
//
// Rutas de los repos: por defecto, los worktrees hermanos de StudioProjects/_ramas;
// se cambian con VITRINA_<PLATAFORMA>=<ruta>.
import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const PLATAFORMAS = {
  admin: { repo: "witown_fe_admin-configurador", env: { VITE_DEMO: "1", VITE_DEMO_VITRINA: "1" } },
  docentes: { repo: "witown_fe_teachers-configurador", env: { VITE_DEMO: "1" } },
  padres: { repo: "witown_fe_parents-configurador", env: { VITE_DEMO: "1" } },
  estudiante: { repo: "witown_fe_students-configurador", env: { VITE_DEMO: "1" } },
  tienda: { repo: "witown_tienda-configurador", env: { VITE_DEMO: "1" } },
};

const correr = (cmd, opciones = {}) => execSync(cmd, { stdio: "inherit", ...opciones });

correr("npm run build");
for (const [p, { repo, env }] of Object.entries(PLATAFORMAS)) {
  const dir = resolve(process.env[`VITRINA_${p.toUpperCase()}`] || resolve("..", repo));
  if (!existsSync(dir)) throw new Error(`No encuentro el repo de ${p}: ${dir}`);
  // Solo la rama del modo vitrina: compilar otra rama publicaría la app de
  // producción (con su login real) en este sitio.
  const rama = execSync("git rev-parse --abbrev-ref HEAD", { cwd: dir }).toString().trim();
  if (rama !== "feature/configurador" && !process.env.VITRINA_OTRA_RAMA) {
    throw new Error(`${p}: el repo está en "${rama}", no en feature/configurador.`);
  }
  console.log(`\n== ${p} (${dir}, ${rama})`);
  rmSync(resolve(dir, "dist-vitrina"), { recursive: true, force: true });
  correr(`npx vite build --base=/${p}/ --outDir dist-vitrina`, { cwd: dir, env: { ...process.env, ...env } });
  // Y que de verdad sea el modo vitrina (contrato §1): la marca tiene que estar.
  const assets = resolve(dir, "dist-vitrina", "assets");
  const conMarca = readdirSync(assets).some((f) => f.endsWith(".js") && readFileSync(resolve(assets, f), "utf8").includes("X-Vitrina-Enlace"));
  if (!conMarca) throw new Error(`${p}: el build no trae el modo vitrina (falta X-Vitrina-Enlace). No se publica.`);
  cpSync(resolve(dir, "dist-vitrina"), resolve("dist", p), { recursive: true });
}

// La app del estudiante pide unos archivos de public/ con ruta absoluta (no
// llevan la base /estudiante/): se sirven también desde la raíz del sitio.
const est = resolve(process.env.VITRINA_ESTUDIANTE || resolve("..", PLATAFORMAS.estudiante.repo), "dist-vitrina");
for (const f of ["album", "placeholder.svg"]) {
  if (existsSync(resolve(est, f))) cpSync(resolve(est, f), resolve("dist", f), { recursive: true });
}
console.log("\nListo: dist/ con el configurador y las cinco vistas previas.");
