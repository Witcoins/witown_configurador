import { FUNCIONALIDADES } from "@/config/funcionalidades";
import type { Estado } from "@/lib/estado";
import { nombreCotizacion, pesos, type Cotizacion } from "@/lib/precio";

/** Resumen y cotización en PDF, armado en el navegador. Nada sale a un servidor. */
export async function descargarResumen(estado: Estado, c: Cotizacion, asesora: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const morado: [number, number, number] = [91, 33, 182];
  let y = 22;

  const linea = (texto: string, tam = 11, negrita = false, color: [number, number, number] = [40, 40, 40]) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tam);
    doc.setTextColor(...color);
    for (const parte of doc.splitTextToSize(texto, 175)) {
      doc.text(parte, 20, y);
      y += tam * 0.5;
    }
    y += 2;
  };

  linea("i'Witown", 22, true, morado);
  linea(`Propuesta para ${estado.contacto.colegio || "su colegio"}`, 14, true);
  linea(new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }), 10, false, [110, 110, 110]);
  y += 4;

  linea(nombreCotizacion(c), 13, true, morado);
  linea(`Por estudiante al año: ${pesos(c.porEstudiante)}`, 12);
  linea(`Estudiantes: ${estado.estudiantes}`, 12);
  linea(`Total al año: ${pesos(c.totalAnual)} (antes de IVA)`, 12, true);
  if (c.porCotizar.length) linea(`${c.porCotizar.join(" y ")}: se cotiza aparte.`, 10, false, [110, 110, 110]);
  y += 4;

  linea("Lo que eligió", 13, true, morado);
  for (const f of FUNCIONALIDADES.filter((x) => estado.prendidas.includes(x.id))) {
    linea(`• ${f.nombre}: ${f.descripcion}`, 10);
  }
  y += 4;

  linea("Siguiente paso", 13, true, morado);
  linea(
    estado.agendo
      ? `Reunión para formalizar: ${estado.agendo}.`
      : `Agende la reunión para formalizar${asesora ? ` con ${asesora}` : ""}.`,
    11,
  );

  doc.save(`iWitown-${(estado.contacto.colegio || "propuesta").replace(/[^\w-]+/g, "-")}.pdf`);
}
