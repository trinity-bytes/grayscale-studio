/**
 * Interfaz dedicada a operaciones de carga y pipeline matemático.
 * Usada por LoadAndValidateImageUseCase.
 */
export class ILoadProcessor {
  /**
   * Extrae datos matemáticos y dibuja la base inicial de la imagen
   * @param {string} sourceId
   * @param {string} destinationId
   * @returns {import('../models/ImageModel.js').ImageModel}
   */
  executeMathematicalPipeline(sourceId, destinationId) {
    throw new Error(
      "El método executeMathematicalPipeline debe ser implementado.",
    );
  }

  /**
   * Valida si un objeto de imagen está en escala de grises perfecta
   * @param {any} imageMatrix
   * @returns {boolean}
   */
  checkIfGrayscale(imageMatrix) {
    throw new Error("El método checkIfGrayscale debe ser implementado.");
  }

  /**
   * Extrae el modelo de histograma puro de las densidades
   * @param {any} imageMatrix
   * @returns {import('../models/HistogramModel.js').HistogramModel}
   */
  extractHistogram(imageMatrix) {
    throw new Error("El método extractHistogram debe ser implementado.");
  }
}

/**
 * Interfaz dedicada a extracción de histograma.
 * Usada internamente y por futuros use cases que necesiten histogramas.
 */
export class IHistogramProcessor {
  /**
   * Extrae el modelo de histograma puro de las densidades
   * @param {any} imageMatrix
   * @returns {import('../models/HistogramModel.js').HistogramModel}
   */
  extractHistogram(imageMatrix) {
    throw new Error("El método extractHistogram debe ser implementado.");
  }
}

/**
 * Interfaz dedicada a transformaciones de imagen (ecualización y expansión).
 * Usada por EqualizeImageUseCase y ExpandImageUseCase.
 */
export class ITransformProcessor {
  /**
   * Aplica el algoritmo de ecualización global de histograma y renderiza el resultado
   * @param {string} sourceId
   * @param {string} destinationId
   * @returns {import('../models/HistogramModel.js').HistogramModel}
   */
  applyEqualization(sourceId, destinationId) {
    throw new Error("El método applyEqualization debe ser implementado.");
  }

  /**
   * Aplica el algoritmo normalizador Min-Max (Expansión) de las frecuencias y renderiza el resultado
   * @param {string} sourceId
   * @param {string} destinationId
   * @returns {import('../models/HistogramModel.js').HistogramModel}
   */
  applyExpansion(sourceId, destinationId) {
    throw new Error("El método applyExpansion debe ser implementado.");
  }
}
