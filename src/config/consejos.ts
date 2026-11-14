/**
 * BORRADOR — POR VALIDAR CON SANTIAGO (decisión 2026-11-08).
 *
 * Consejos para el docente según el estatus de la A.C.P. en que está el
 * estudiante. Redactados a partir de WIWIQUEST_SPEC (orden del STC). No
 * nombrar el ciclo Incitación → Verificación → Ratificación (regla de marca).
 * Editar aquí; la pantalla los toma tal cual.
 */
export interface ConsejosNivel {
  nombre: string;
  /** Qué significa estar aquí, en dos líneas. */
  significa: string;
  noAvanza: string;
  avanzaLento: string;
  avanzaRapido: string;
}

export const POR_VALIDAR = true;

export const CONSEJOS: Record<string, ConsejosNivel> = {
  conceptualizacion_simbolica: {
    nombre: "Conceptualización simbólica",
    significa:
      "Está reconociendo los símbolos y las palabras del tema: qué es cada cosa y cómo se representa. Es el primer escalón; sin él, lo demás se memoriza sin entenderse.",
    noAvanza:
      "Vuelva a lo concreto: objetos, dibujos o ejemplos de su vida antes de los símbolos. Pídale que explique con sus palabras qué representa cada símbolo.",
    avanzaLento:
      "Es normal en este escalón. Sesiones cortas y frecuentes (10 a 15 minutos) rinden más que una larga. Celebre cada principio que domina.",
    avanzaRapido:
      "Confirme que entiende y no solo reconoce: pídale un ejemplo propio. Si lo logra, déjelo avanzar; el refuerzo lo llevará al siguiente nivel.",
  },
  procesamiento_cognitivo_informado: {
    nombre: "Procesamiento cognitivo informado",
    significa: "Ya entiende los conceptos y empieza a usarlos con información: compara, ordena y aplica en casos sencillos.",
    noAvanza: "Revise si le falta algún concepto del escalón anterior. Un ejercicio guiado paso a paso suele destrabarlo.",
    avanzaLento: "Dele problemas con datos de su entorno. Ver para qué sirve acelera el proceso.",
    avanzaRapido: "Proponga problemas con más de un paso para que integre lo que sabe.",
  },
  analisis_integral: {
    nombre: "Análisis integral",
    significa: "Relaciona varias ideas a la vez y explica por qué algo funciona.",
    noAvanza: "Pídale que dibuje cómo se conectan las ideas; ahí aparece la pieza que falta.",
    avanzaLento: "Trabaje en parejas: explicarle a otro organiza el pensamiento.",
    avanzaRapido: "Retos abiertos con más de una respuesta posible.",
  },
};
