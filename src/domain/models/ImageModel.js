/**
 * ==========================================
 * IMAGE MODEL (Domain Entity)
 * ==========================================
 * Entidad principal que encapsula el estado analítico y
 * la metadata extraída de una imagen fuente sin ligarse a Canvas o HTML Element.
 * Cumple el rol de Entity dentro de la arquitectura limpia/DDD, representando
 * el núcleo del dominio de procesamiento de imágenes en escala de grises.
 *
 * @module src/domain/models/ImageModel
 */
export class ImageModel {
  /**
   * Crea una instancia de ImageModel con la información analítica de la imagen.
   * @param {boolean} isStrictGrayscale - `true` si la imagen original es estrictamente en escala de grises (un solo canal)
   * @param {Object} metadata - Objeto con la metadata extraída de la imagen
   * @param {number} metadata.totalPixels - Cantidad total de píxeles de la imagen
   * @param {number} metadata.width - Ancho de la imagen en píxeles
   * @param {number} metadata.height - Alto de la imagen en píxeles
   * @param {number} metadata.minVal - Valor mínimo de intensidad encontrado (0-255)
   * @param {number} metadata.maxVal - Valor máximo de intensidad encontrado (0-255)
   * @param {import('./HistogramModel.js').HistogramModel} histogramModel - Modelo de histograma con las frecuencias de intensidad
   */
  constructor(isStrictGrayscale, metadata, histogramModel) {
    /** @type {boolean} Indica si la imagen es estrictamente en escala de grises */
    this.isStrictGrayscale = isStrictGrayscale;

    /** @type {Object} Metadata de la imagen (dimensiones y rango de intensidad) */
    this.metadata = {
      totalPixels: metadata.totalPixels || 0,
      width: metadata.width || 0,
      height: metadata.height || 0,
      minVal: metadata.minVal || 0,
      maxVal: metadata.maxVal || 0,
    };

    /** @type {import('./HistogramModel.js').HistogramModel} Modelo de histograma asociado */
    this.histogramData = histogramModel;
  }

  /**
   * Retorna la instancia del modelo de histograma asociado a esta imagen.
   * Permite acceder a las frecuencias de intensidad para su visualización y análisis.
   * @returns {import('./HistogramModel.js').HistogramModel} Instancia del modelo de histograma
   */
  getHistogram() {
    return this.histogramData;
  }

  /**
   * Retorna un objeto con la metadata esencial de la imagen (dimensiones y rango de intensidad).
   * Evita exponer la referencia directa al estado interno, manteniendo encapsulamiento.
   * @returns {{ totalPixels: number, width: number, height: number, minVal: number, maxVal: number }} Objeto con la metadata de la imagen
   */
  getMetadata() {
    return this.metadata;
  }
}
