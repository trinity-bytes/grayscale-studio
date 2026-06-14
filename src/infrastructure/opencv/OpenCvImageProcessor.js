import { HistogramModel } from "../../domain/models/HistogramModel.js";
import { ImageModel } from "../../domain/models/ImageModel.js";
import { ILoadProcessor, IHistogramProcessor, ITransformProcessor } from "../../domain/services/ImageProcessor.js";

/**
 * ==========================================
 * OPENCV IMAGE PROCESSOR (Infrastructure)
 * ==========================================
 * Implementación concreta de las interfaces de procesamiento de imágenes
 * que utiliza OpenCV.js (WebAssembly) para ejecutar operaciones matemáticas
 * sobre matrices de imagen. Implementa las tres interfaces ISP del dominio:
 * - ILoadProcessor: carga y validación de imágenes
 * - IHistogramProcessor: extracción de histograma
 * - ITransformProcessor: ecualización y expansión
 *
 * Cada caso de uso depende únicamente de la interfaz que necesita,
 * cumpliendo el Principio de Segregación de Interfaces (ISP).
 *
 * @module src/infrastructure/opencv/OpenCvImageProcessor
 */
export class OpenCvImageProcessor {
  /**
   * Ejecuta el pipeline matemático completo: lee la imagen desde un elemento DOM,
   * verifica si es escala de grises, extrae metadata (dimensiones, rango de intensidad)
   * y construye el modelo de dominio ImageModel con el histograma asociado.
   * Gestiona la memoria WebAssembly liberando las matrices temporales al finalizar.
   * @param {string} sourceId - ID del elemento DOM que contiene la imagen fuente
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará la imagen en grises
   * @returns {import('../../domain/models/ImageModel.js').ImageModel} Modelo de dominio completo con metadata, histograma y estado de grises
   * @throws {Error} Si OpenCV no puede procesar los datos de la imagen
   */
  executeMathematicalPipeline(sourceId, destinationId) {
    let mat;
    try {
      mat = cv.imread(sourceId);
    } catch (e) {
      throw new Error(
        "OpenCV no pudo procesar los datos fuente de la imagen asíncrona.",
      );
    }

    let resultData = {
      isStrictGrayscale: true,
      histogramData: [],
      metadata: {
        totalPixels: 0,
        width: 0,
        height: 0,
        minVal: 0,
        maxVal: 0,
      },
    };

    const isGray = this.checkIfGrayscale(mat);

    if (!isGray) {
      resultData.isStrictGrayscale = false;
    }

    let grayMat = new cv.Mat();
    if (mat.channels() === 3 || mat.channels() === 4) {
      cv.cvtColor(mat, grayMat, cv.COLOR_RGBA2GRAY, 0);
    } else {
      mat.copyTo(grayMat);
    }

    cv.imshow(destinationId, grayMat);

    // Cálculo de metadatos: píxeles totales y rango min/max de intensidad
    let minMax = cv.minMaxLoc(grayMat);
    resultData.metadata.totalPixels = grayMat.rows * grayMat.cols;
    resultData.metadata.width = grayMat.cols;
    resultData.metadata.height = grayMat.rows;
    resultData.metadata.minVal = Math.round(minMax.minVal);
    resultData.metadata.maxVal = Math.round(minMax.maxVal);

    resultData.histogramData = this.extractHistogram(grayMat);

    // Liberación estricta de la memoria RAM administrada por WebAssembly
    mat.delete();
    grayMat.delete();

    return new ImageModel(
      resultData.isStrictGrayscale,
      resultData.metadata,
      resultData.histogramData,
    );
  }

  /**
   * Verifica si una matriz de imagen es estrictamente en escala de grises.
   * Compara los canales Rojo-Verde y Rojo-Azul; si la diferencia promedio
   * es menor a 2.0, considera que la imagen es en grises (tolerancia para JPEG).
   * @param {cv.Mat} mat - Matriz de imagen en formato OpenCV
   * @returns {boolean} `true` si la imagen tiene un solo canal o los canales son prácticamente idénticos
   */
  checkIfGrayscale(mat) {
    if (mat.channels() === 1) return true;

    let channels = new cv.MatVector();
    cv.split(mat, channels);

    let diffRG = new cv.Mat();
    let diffRB = new cv.Mat();

    cv.absdiff(channels.get(0), channels.get(1), diffRG);
    cv.absdiff(channels.get(0), channels.get(2), diffRB);

    let meanRG = cv.mean(diffRG)[0];
    let meanRB = cv.mean(diffRB)[0];

    channels.delete();
    diffRG.delete();
    diffRB.delete();

    // Tolerancia de 2.0 para artefactos de compresión JPEG
    return meanRG < 2.0 && meanRB < 2.0;
  }

  /**
   * Extrae el histograma de frecuencias de una matriz de imagen en escala de grises.
   * Utiliza cv.calcHist de OpenCV para calcular las 256 frecuencias de intensidad.
   * @param {cv.Mat} mat - Matriz de imagen en escala de grises (un solo canal)
   * @returns {import('../../domain/models/HistogramModel.js').HistogramModel} Modelo de histograma con 256 frecuencias
   */
  extractHistogram(mat) {
    let mask = new cv.Mat();
    let hist = new cv.Mat();
    let matVec = new cv.MatVector();
    matVec.push_back(mat);

    cv.calcHist(matVec, [0], mask, hist, [256], [0, 255], false);

    let histogramData = [];
    for (let i = 0; i < 256; i++) {
      histogramData.push(hist.floatAt(i, 0));
    }

    mask.delete();
    hist.delete();
    matVec.delete();

    return new HistogramModel(histogramData);
  }

  /**
   * Aplica el algoritmo de ecualización global de histograma (equalizeHist de OpenCV)
   * y renderiza el resultado en el canvas destino.
   * Convierte la imagen a escala de grises si tiene múltiples canales antes de ecualizar.
   * @param {string} sourceId - ID del elemento DOM que contiene la imagen de origen
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará la imagen ecualizada
   * @returns {import('../../domain/models/HistogramModel.js').HistogramModel} Histograma de la imagen ecualizada
   */
  applyEqualization(sourceId, destinationId) {
    let src = cv.imread(sourceId);
    let dst = new cv.Mat();

    let grayMat = new cv.Mat();
    if (src.channels() === 3 || src.channels() === 4) {
      cv.cvtColor(src, grayMat, cv.COLOR_RGBA2GRAY, 0);
    } else {
      src.copyTo(grayMat);
    }

    cv.equalizeHist(grayMat, dst);
    cv.imshow(destinationId, dst);

    let histogramModel = this.extractHistogram(dst);

    src.delete();
    grayMat.delete();
    dst.delete();
    return histogramModel;
  }

  /**
   * Aplica la expansión lineal (normalización Min-Max) del histograma
   * y renderiza el resultado en el canvas destino.
   * Redistribuye las intensidades para aprovechar todo el rango [0, 255].
   * @param {string} sourceId - ID del elemento DOM que contiene la imagen de origen
   * @param {string} destinationId - ID del elemento canvas destino donde se dibujará la imagen expandida
   * @returns {import('../../domain/models/HistogramModel.js').HistogramModel} Histograma de la imagen expandida
   */
  applyExpansion(sourceId, destinationId) {
    let src = cv.imread(sourceId);
    let dst = new cv.Mat();

    let grayMat = new cv.Mat();
    if (src.channels() === 3 || src.channels() === 4) {
      cv.cvtColor(src, grayMat, cv.COLOR_RGBA2GRAY, 0);
    } else {
      src.copyTo(grayMat);
    }

    cv.normalize(grayMat, dst, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
    cv.imshow(destinationId, dst);

    let histogramModel = this.extractHistogram(dst);

    src.delete();
    grayMat.delete();
    dst.delete();
    return histogramModel;
  }
}
