/**
 * EL VIDEO DE LA PORTADA. Cuando esté listo: copiarlo a `public/video/` (MP4,
 * H.264, sin sonido o con el sonido apagado; idealmente menos de 15 MB) y
 * escribir aquí su nombre, p. ej. "/video/portada.mp4". Se reproduce de fondo,
 * en bucle y en silencio, con el mismo degradado que la foto.
 *
 * `poster`: una imagen fija que se ve mientras el video carga (opcional).
 * Mientras `video` sea null, la portada usa la foto del colegio o el fondo de marca.
 */
export const PORTADA = {
  // Sin pista de audio (se le quitó al archivo, no solo se silencia).
  video: "/video/portada.mp4" as string | null,
  poster: "/video/portada.jpg" as string | null,
};
