/**
 * Lo que pide cada escena al abrir, para adelantarlo desde la escena anterior
 * (lib/precalentar.ts). Clave: "<plataforma> <ir>". `{uid}` = la cuenta de la
 * sesión; `{est}` = su estudiante. Sin fechas: cambian cada día.
 *
 * Se grabó recorriendo los tres caminos y leyendo, en cada escena, los pedidos
 * de la app a /api/demo/ (2026-11-14). Si una pantalla cambia lo que pide, solo
 * se pierde el adelanto: la escena carga igual.
 */
export const PRECARGA: Record<string, string[]> = {
  "admin /home": ["/WitColegios/col_gc", "/WitGeneral/Novedades", "/WitUsuarios/demo_rector/Notificaciones"],
  "admin /estudiantes/reportes": ["/WitColegios/col_gc", "/WitColegios/col_gc/estudiantes?completar_curso=1", "/WitUsuarios/demo_rector/Notificaciones"],
  "admin /tutores/informes-uso": ["/WitColegios/col_gc/informe-uso", "/WitGeneral/Novedades", "/WitUsuarios/demo_rector/Notificaciones"],
  "docentes /dashboard": [
    "/WitGeneral/Listas?uid=Hic8AdFpIbeQlnqujqtP7DEVtB02", "/WitGeneral/Novedades",
    "/WitUsuarios/Hic8AdFpIbeQlnqujqtP7DEVtB02/Notificaciones",
    "/firestore/colegios/col_gc/comunidad/Hic8AdFpIbeQlnqujqtP7DEVtB02", "/tienda-escolar/comprador/tiendas",
    "/usuarios/Hic8AdFpIbeQlnqujqtP7DEVtB02",
  ],
  "docentes /task-manager/assignment": [
    "/WitGeneral/Listas?uid=Hic8AdFpIbeQlnqujqtP7DEVtB02", "/WitGeneral/Novedades",
    "/WitUsuarios/Hic8AdFpIbeQlnqujqtP7DEVtB02/Notificaciones", "/usuarios/Hic8AdFpIbeQlnqujqtP7DEVtB02",
    "/WitColegios/col_gc/estudiantes", "/WitColegios/col_gc/tutores",
    "/WitGeneral/Listas/modalidades?uid=Hic8AdFpIbeQlnqujqtP7DEVtB02",
  ],
  "padres /dashboard": [
    "/WitGeneral/Listas", "/WitGeneral/Novedades", "/WitUsuarios/{uid}/Notificaciones",
    "/pagos/seccion", "/tienda-escolar/comprador/tiendas?para={est}", "/tutores/{uid}/estudiantes", "/usuarios/{uid}",
  ],
  "tienda /vender": [
    "/WitGeneral/Novedades", "/tienda-escolar/listas-proveedor/avisos", "/tienda-escolar/personas",
    "/tienda-escolar/productos", "/tienda-escolar/recargas?estado=por_confirmar", "/tienda-escolar/sesion",
  ],
  "estudiante /home": [
    "/WitColegios/col_gc/Comunidad/estudiantes/{uid}", "/WitGeneral/Listas/estudiante", "/WitGeneral/Novedades",
    "/WitUsuarios/{uid}/Notificaciones", "/tienda-escolar/comprador/tiendas", "/usuarios/{uid}",
  ],
  // El juego: lo que pide la app al arrancar (las preguntas van por configuradorJugar).
  "estudiante /wiwiquest/question": [
    "/WitColegios/col_gc/Comunidad/estudiantes/{uid}", "/WitGeneral/Listas/estudiante", "/WitGeneral/Novedades",
    "/WitUsuarios/{uid}/Notificaciones", "/usuarios/{uid}",
  ],
};
