/**
 * ==========================================
 * EQUALIZE IMAGE USE CASE
 * ==========================================
 * Caso de Uso responsable de orquestar la ecualización del histograma de la imagen.
 * Delega la ejecución matemática a la capa de infraestructura (OpenCV).
 */
export class EqualizeImageUseCase {
  /**
   * @param {import('../domain/services/ImageProcessor.js').ITransformProcessor} transformProcessor
   */
  constructor(transformProcessor) {
    this.transformProcessor = transformProcessor;
  }

  /**
   * Ejecuta el proceso de ecualización.
   * @param {string} sourceId - ID del elemento canvas/img de origen.
   * @param {string} destinationId - ID del elemento destino para dibujar la imagen.
   * @returns {import('../domain/models/HistogramModel.js').HistogramModel} Datos del histograma ecualizado.
   */
  execute(sourceId, destinationId) {
    return this.transformProcessor.applyEqualization(sourceId, destinationId);
  }
}
