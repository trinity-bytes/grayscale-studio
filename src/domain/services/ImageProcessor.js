/**
 * ==========================================
 * IMAGE PROCESSOR INTERFACES (Domain Services)
 * ==========================================
 * Conjunto de interfaces (clases abstractas) que definen los contratos de procesamiento
 * de imágenes en la capa de dominio. Cada use case depende únicamente de la interfaz
 * que necesita, aplicando el Principio de Inversión de Dependencias (DIP).
 * Las implementaciones concretas residen en la capa de infraestructura.
 *
 * @module src/domain/services/ImageProcessor
 */

/**
 * Interfaz dedicada a operaciones de carga y pipeline matemático.
 * Utilizada por LoadAndValidateImageUseCase para extraer datos de la imagen.
 * Define el contrato para procesadores que leen y validan imágenes.
 */
export class ILoadProcessor {
  /**
   * Extrae datos matemáticos de la imagen, dibuja la base inicial en el canvas
   * y construye el modelo de dominio completo.
   * @param {string} sourceId - ID del elemento DOM que contiene la imagen fuente
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará la imagen procesada
   * @returns {import('../models/ImageModel.js').ImageModel} Modelo de dominio con metadata, histograma y estado de grises
   * @throws {Error} Si el procesador no puede leer la imagen o OpenCV falla
   */
  executeMathematicalPipeline(sourceId, destinationId) {
    throw new Error(
      "El método executeMathematicalPipeline debe ser implementado.",
    );
  }

  /**
   * Valida si una matriz de imagen está en escala de grises perfecta.
   * Compara los canales para determinar si la imagen tiene un solo canal
   * o si los canales de color son prácticamente idénticos.
   * @param {any} imageMatrix - Matriz de imagen en formato OpenCV (cv.Mat)
   * @returns {boolean} `true` si la imagen es estrictamente en escala de grises
   */
  checkIfGrayscale(imageMatrix) {
    throw new Error("El método checkIfGrayscale debe ser implementado.");
  }

  /**
   * Extrae el modelo de histograma a partir de las frecuencias de intensidad de la matriz.
   * @param {any} imageMatrix - Matriz de imagen en formato OpenCV (cv.Mat)
   * @returns {import('../models/HistogramModel.js').HistogramModel} Modelo de histograma con 256 frecuencias
   */
  extractHistogram(imageMatrix) {
    throw new Error("El método extractHistogram debe ser implementado.");
  }
}

/**
 * Interfaz dedicada a la extracción de histograma de manera aislada.
 * Utilizada internamente y por futuros use cases que necesiten operar
 * exclusivamente sobre datos de frecuencias.
 */
export class IHistogramProcessor {
  /**
   * Extrae el modelo de histograma a partir de las frecuencias de intensidad de la matriz.
   * @param {any} imageMatrix - Matriz de imagen en formato OpenCV (cv.Mat)
   * @returns {import('../models/HistogramModel.js').HistogramModel} Modelo de histograma con 256 frecuencias
   */
  extractHistogram(imageMatrix) {
    throw new Error("El método extractHistogram debe ser implementado.");
  }
}

/**
 * Interfaz dedicada a transformaciones de imagen: ecualización y expansión.
 * Utilizada por EqualizeImageUseCase y ExpandImageUseCase para aplicar
 * algoritmos de mejora de contraste en imágenes en escala de grises.
 */
export class ITransformProcessor {
  /**
   * Aplica el algoritmo de ecualización global de histograma y renderiza el resultado
   * en el canvas destino. Retorna el histograma de la imagen transformada.
   * @param {string} sourceId - ID del elemento DOM que contiene la imagen de origen
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará el resultado
   * @returns {import('../models/HistogramModel.js').HistogramModel} Histograma de la imagen ecualizada
   * @throws {Error} Si el procesamiento falla
   */
  applyEqualization(sourceId, destinationId) {
    throw new Error("El método applyEqualization debe ser implementado.");
  }

  /**
   * Aplica el algoritmo de normalización Min-Max (expansión lineal) y renderiza
   * el resultado en el canvas destino. Redistribuye las intensidades para
   * aprovechar todo el rango [0, 255].
   * @param {string} sourceId - ID del elemento DOM que contiene la imagen de origen
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará el resultado
   * @returns {import('../models/HistogramModel.js').HistogramModel} Histograma de la imagen expandida
   * @throws {Error} Si el procesamiento falla
   */
  applyExpansion(sourceId, destinationId) {
    throw new Error("El método applyExpansion debe ser implementado.");
  }
}
