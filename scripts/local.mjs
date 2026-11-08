// Prueba local del sitio completo (configurador + vistas previas), sin publicar.
//
//   1. En witown-cloud-functions (rama feature/configurador):
//        GOOGLE_APPLICATION_CREDENTIALS=<credenciales> npx firebase emulators:start --only functions --project witcoins-network
//   2. Aquí: npm run vitrinas   (arma dist/)   y luego   npm run local
//   3. Abrir http://localhost:8095/?e=<token de un enlace de prueba>
//
// Las funciones corren en tu computador pero leen y escriben en el Firestore
// REAL (colecciones del configurador, y el motor real para la partida). La
// agenda se SIMULA: /api/horas lee las horas libres reales y /api/agendar no
// reserva nada, para no tomar cupos de verdad.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const PUERTO = Number(process.env.PUERTO || 8095);
const EMULADOR = process.env.EMULADOR || "http://127.0.0.1:5001/witcoins-network/us-central1";
const DIST = resolve("dist");
const PLATAFORMAS = ["admin", "docentes", "padres", "estudiante", "tienda"];
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".mp3": "audio/mpeg",
  ".lottie": "application/zip", ".wasm": "application/wasm", ".mp4": "video/mp4", ".webm": "video/webm",
};

function funcionDe(ruta) {
  if (ruta.startsWith("/api/config/jugar")) return "configuradorJugar";
  if (ruta.startsWith("/api/config/")) return "configuradorPublico";
  if (ruta.startsWith("/api/demo/")) return "configuradorVitrina";
  return null;
}

async function reenviar(req, res, url) {
  const trozos = [];
  for await (const t of req) trozos.push(t);
  const cuerpo = trozos.length ? Buffer.concat(trozos) : undefined;
  const cabeceras = { ...req.headers };
  delete cabeceras.host;
  try {
    const r = await fetch(url, { method: req.method, headers: cabeceras, body: ["GET", "HEAD"].includes(req.method) ? undefined : cuerpo });
    res.writeHead(r.status, { "Content-Type": r.headers.get("content-type") || "application/json" });
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, mensaje: `No responde ${url}: ¿está corriendo el emulador?` }));
  }
}

function archivo(res, ruta) {
  const tipo = TIPOS[extname(ruta).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-cache", "Referrer-Policy": "no-referrer" });
  res.end(readFileSync(ruta));
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);
  const ruta = decodeURIComponent(url.pathname);

  const fn = funcionDe(url.pathname);
  if (fn) return reenviar(req, res, `${EMULADOR}/${fn}${url.pathname}${url.search}`);
  if (url.pathname === "/api/horas") return reenviar(req, res, "https://ecosistema-iwitown.web.app/api/horas");
  if (url.pathname === "/api/agendar") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, mensaje: "Prueba local: la reunión NO se reservó." }));
  }

  // Archivos del sitio, sin salir de dist/.
  const pedido = normalize(join(DIST, ruta));
  if (pedido.startsWith(DIST) && existsSync(pedido) && statSync(pedido).isFile()) return archivo(res, pedido);
  // Rutas internas de cada vista previa → su index.html; lo demás → el del configurador.
  const p = PLATAFORMAS.find((x) => ruta === `/${x}` || ruta.startsWith(`/${x}/`));
  return archivo(res, join(DIST, p ? `${p}/index.html` : "index.html"));
}).listen(PUERTO, () => {
  console.log(`Configurador local: http://localhost:${PUERTO}/?e=<token>`);
  console.log(`Funciones: ${EMULADOR}`);
});
