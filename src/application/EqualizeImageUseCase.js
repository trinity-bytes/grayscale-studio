/**
 * ==========================================
 * EQUALIZE IMAGE USE CASE
 * ==========================================
 * Caso de uso responsable de orquestar la ecualización global del histograma
 * de la imagen. La ecualización redistribuye las intensidades de píxeles para
 * maximizar el contraste, utilizando la Función de Distribución Acumulada (CDF).
 * Delega la ejecución matemática a la capa de infraestructura (OpenCV).
 *
 * @module src/application/EqualizeImageUseCase
 */
export class EqualizeImageUseCase {
  /**
   * Crea una instancia del caso de uso de ecualización.
   * @param {import('../domain/services/ImageProcessor.js').ITransformProcessor} transformProcessor - Procesador de transformaciones inyectado
   */
  constructor(transformProcessor) {
    /** @type {import('../domain/services/ImageProcessor.js').ITransformProcessor} Procesador de transformaciones */
    this.transformProcessor = transformProcessor;
  }

  /**
   * Ejecuta el proceso de ecualización global del histograma.
   * Lee la imagen del canvas de origen, aplica la ecualización y dibuja
   * el resultado en el canvas destino.
   * @param {string} sourceId - ID del elemento canvas/img de origen que contiene la imagen a ecualizar
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará la imagen ecualizada
   * @returns {import('../domain/models/HistogramModel.js').HistogramModel} Modelo de histograma con las frecuencias de la imagen ecualizada
   */
  execute(sourceId, destinationId) {
    return this.transformProcessor.applyEqualization(sourceId, destinationId);
  }
}
