import { OpenCvImageProcessor } from "../infrastructure/opencv/OpenCvImageProcessor.js";

/**
 * ==========================================
 * EXPAND IMAGE USE CASE
 * ==========================================
 * Caso de Uso responsable de aplicar el estiramiento o normalización Min-Max (Expansión)
 * al histograma de la imagen procesada originariamente.
 */
export class ExpandImageUseCase {
  /**
   * @param {string} sourceId - ID del lienzo que contiene la imagen de análisis.
   * @param {string} destinationId - ID del lienzo destino para el dibujo expandido.
   * @returns {import('../domain/models/HistogramModel.js').HistogramModel} Datos del histograma expandido.
   */
  execute(sourceId, destinationId) {
    return OpenCvImageProcessor.applyExpansion(sourceId, destinationId);
  }
}
