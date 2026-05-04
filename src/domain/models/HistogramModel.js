/**
 * ==========================================
 * HISTOGRAM MODEL (Domain Value-Object)
 * ==========================================
 * Encapsula la lógica relacionada a las frecuencias estadísticas de una imagen en escala de grises.
 * Expresa un Value-Object porque sus valores definen exclusivamente atributos inmutables o cuantificables.
 */
export class HistogramModel {
  /**
   * Crea un modelo de Histograma
   * @param {number[]} frequencies - Arreglo rígido de 256 posiciones representando frecuencias matemáticas
   */
  constructor(frequencies) {
    if (!Array.isArray(frequencies) || frequencies.length !== 256) {
      throw new Error(
        "El histograma debe contener exactamente 256 niveles de intensidad.",
      );
    }
    this.frequencies = frequencies;
  }

  /**
   * Obtiene la estructura de las frecuencias para su iteración (Gráficos)
   * @returns {number[]}
   */
  getFrequencies() {
    return this.frequencies;
  }

  /**
   * Genera marcas predefinidas relativas del Histograma (Escala de Blancos a Negros)
   * del 0 (Negro Absoluto) al 255 (Blanco Puro)
   * @returns {number[]}
   */
  getLabels() {
    // Genera un arreglo de 0 a 255 para el eje X
    return Array.from({ length: 256 }, (_, i) => i);
  }
}
