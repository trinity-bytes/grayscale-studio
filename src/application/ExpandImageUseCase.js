/**
 * ==========================================
 * EXPAND IMAGE USE CASE
 * ==========================================
 * Caso de uso responsable de aplicar el estiramiento o normalización Min-Max
 * (expansión lineal) al histograma de la imagen. Redistribuye las intensidades
 * de píxeles para aprovechar todo el rango [0, 255], maximizando el contraste
 * de imágenes con rango de intensidad limitado.
 *
 * @module src/application/ExpandImageUseCase
 */
export class ExpandImageUseCase {
  /**
   * Crea una instancia del caso de uso de expansión.
   * @param {import('../domain/services/ImageProcessor.js').ITransformProcessor} transformProcessor - Procesador de transformaciones inyectado
   */
  constructor(transformProcessor) {
    /** @type {import('../domain/services/ImageProcessor.js').ITransformProcessor} Procesador de transformaciones */
    this.transformProcessor = transformProcessor;
  }

  /**
   * Ejecuta el proceso de expansión (normalización Min-Max) del histograma.
   * Lee la imagen del canvas de origen, aplica la expansión lineal y dibuja
   * el resultado en el canvas destino.
   * @param {string} sourceId - ID del elemento canvas de origen que contiene la imagen a expandir
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará la imagen expandida
   * @returns {import('../domain/models/HistogramModel.js').HistogramModel} Modelo de histograma con las frecuencias de la imagen expandida
   */
  execute(sourceId, destinationId) {
    return this.transformProcessor.applyExpansion(sourceId, destinationId);
  }
}
