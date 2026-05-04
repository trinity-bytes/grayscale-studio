/**
 * ==========================================
 * IMAGE MODEL (Domain Entity)
 * ==========================================
 * Entidad principal que encapsula el estado analítico y
 * la metadata extraída de una imágen fuente sin ligarse a Canvas o HTML Element.
 */
export class ImageModel {
  /**
   * Inicializa la composición de los rastros iniciales de una foto en gris.
   * @param {boolean} isStrictGrayscale - Veracidad pura de Grises (Lógica booleana sin color)
   * @param {Object} metadata - Objeto primitivo conteniendo píxeles y min-max
   * @param {import('./HistogramModel.js').HistogramModel} histogramModel - Objeto generador del Histograma Anidados
   */
  constructor(isStrictGrayscale, metadata, histogramModel) {
    this.isStrictGrayscale = isStrictGrayscale;
    this.metadata = {
      totalPixels: metadata.totalPixels || 0,
      minVal: metadata.minVal || 0,
      maxVal: metadata.maxVal || 0,
    };
    this.histogramData = histogramModel; // Naming for backwards compatibility
  }

  /**
   * Encargado de retornar la instancia anidada del modelo representativo de las frecuencias.
   * @returns {import('./HistogramModel.js').HistogramModel} Objeto Histograma.
   */
  getHistogram() {
    return this.histogramData;
  }

  /**
   * Facilita el objeto metadatos base { totalPixels, minVal, maxVal }
   * evitando polución hacia el estado general de visualización
   * @returns {{ totalPixels: number, minVal: number, maxVal: number }}
   */
  getMetadata() {
    return this.metadata;
  }
}
