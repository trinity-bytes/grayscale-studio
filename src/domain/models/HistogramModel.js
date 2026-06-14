/**
 * ==========================================
 * HISTOGRAM MODEL (Domain Value-Object)
 * ==========================================
 * Value-Object que encapsula la lógica relacionada a las frecuencias estadísticas
 * de una imagen en escala de grises. Sus valores definen exclusivamente atributos
 * inmutables o cuantificables, lo cual lo convierte en un Value-Object dentro del dominio.
 * Contiene exactamente 256 posiciones (una por cada nivel de intensidad de 0 a 255).
 *
 * @module src/domain/models/HistogramModel
 */
export class HistogramModel {
  /**
   * Crea un modelo de histograma con las frecuencias de intensidad.
   * @param {number[]} frequencies - Arreglo de exactamente 256 posiciones representando
   *   las frecuencias de cada nivel de intensidad (índice 0 = negro absoluto, 255 = blanco puro)
   * @throws {Error} Si el arreglo no contiene exactamente 256 elementos
   */
  constructor(frequencies) {
    if (!Array.isArray(frequencies) || frequencies.length !== 256) {
      throw new Error(
        "El histograma debe contener exactamente 256 niveles de intensidad.",
      );
    }
    /** @type {number[]} Arreglo inmutable de 256 frecuencias de intensidad */
    this.frequencies = frequencies;
  }

  /**
   * Retorna el arreglo de frecuencias para su iteración y visualización en gráficos.
   * @returns {number[]} Arreglo de 256 elementos con las frecuencias por nivel de intensidad
   */
  getFrequencies() {
    return this.frequencies;
  }

  /**
   * Genera las etiquetas del eje X del histograma: un arreglo de 0 a 255
   * representando los niveles de gris del negro absoluto (0) al blanco puro (255).
   * @returns {number[]} Arreglo de 256 elementos [0, 1, 2, ..., 255]
   */
  getLabels() {
    return Array.from({ length: 256 }, (_, i) => i);
  }
}
