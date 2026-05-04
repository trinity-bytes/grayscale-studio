import { HistogramModel } from "../../domain/models/HistogramModel.js";
import { ImageModel } from "../../domain/models/ImageModel.js";
import { IImageProcessor } from "../../domain/services/IImageProcessor.js";

/**
 * ==========================================
 * OPENCV IMAGE PROCESSOR
 * ==========================================
 * Clase pura encargada de procesar las matrices matemáticas usando
 * WebAssembly sin interactuar con el árbol del DOM interactivo.
 */
export class OpenCvImageProcessor extends IImageProcessor {
  static executeMathematicalPipeline(sourceId, destinationId) {
    let mat;
    try {
      mat = cv.imread(sourceId); // Lectura cruda desde la ID en RAM
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
      cv.cvtColor(mat, grayMat, cv.COLOR_RGBA2GRAY, 0); // Forzar coerción a un único canal (Gris)
    } else {
      mat.copyTo(grayMat);
    }

    cv.imshow(destinationId, grayMat); // Dibuja la matriz transformada en el lienzo (canvas) destino

    // Cálculo de metadatos solicitados (Pixeles totales y Rango Min/Max de intensidad)
    let minMax = cv.minMaxLoc(grayMat);
    resultData.metadata.totalPixels = grayMat.rows * grayMat.cols;
    resultData.metadata.minVal = Math.round(minMax.minVal);
    resultData.metadata.maxVal = Math.round(minMax.maxVal);

    resultData.histogramData = this.extractHistogram(grayMat);

    // Liberación estricta exigida de la memoria RAM administrada por WebAssembly
    mat.delete();
    grayMat.delete();

    return new ImageModel(
      resultData.isStrictGrayscale,
      resultData.metadata,
      resultData.histogramData,
    );
  }

  static checkIfGrayscale(mat) {
    if (mat.channels() === 1) return true;

    let channels = new cv.MatVector();
    cv.split(mat, channels);

    let diffRG = new cv.Mat();
    let diffRB = new cv.Mat();

    cv.absdiff(channels.get(0), channels.get(1), diffRG);
    cv.absdiff(channels.get(0), channels.get(2), diffRB);

    // Valida la ausencia perfecta de aberraciones cromáticas cruzadas
    let nonZeroRG = cv.countNonZero(diffRG);
    let nonZeroRB = cv.countNonZero(diffRB);

    channels.delete();
    diffRG.delete();
    diffRB.delete();

    return nonZeroRG === 0 && nonZeroRB === 0;
  }

  static extractHistogram(mat) {
    let mask = new cv.Mat();
    let hist = new cv.Mat();
    let matVec = new cv.MatVector();
    matVec.push_back(mat);

    cv.calcHist(matVec, [0], mask, hist, [256], [0, 255], false); // Rango de absorción [0-255]

    let histogramData = [];
    for (let i = 0; i < 256; i++) {
      histogramData.push(hist.floatAt(i, 0));
    }

    mask.delete();
    hist.delete();
    matVec.delete();

    return new HistogramModel(histogramData);
  }

  static applyEqualization(sourceId, destinationId) {
    let src = cv.imread(sourceId);
    let dst = new cv.Mat();

    // La ecualización (equalizeHist) requiere un canal
    let grayMat = new cv.Mat();
    if (src.channels() === 3 || src.channels() === 4) {
      cv.cvtColor(src, grayMat, cv.COLOR_RGBA2GRAY, 0);
    } else {
      src.copyTo(grayMat);
    }

    cv.equalizeHist(grayMat, dst); // Fórmula OpenCV
    cv.imshow(destinationId, dst);

    let histogramModel = this.extractHistogram(dst);

    src.delete();
    grayMat.delete();
    dst.delete();
    return histogramModel;
  }

  static applyExpansion(sourceId, destinationId) {
    let src = cv.imread(sourceId);
    let dst = new cv.Mat();

    let grayMat = new cv.Mat();
    if (src.channels() === 3 || src.channels() === 4) {
      cv.cvtColor(src, grayMat, cv.COLOR_RGBA2GRAY, 0);
    } else {
      src.copyTo(grayMat);
    }

    // Expansión mediante Normalización Min-Max pura de (0 a 255)
    cv.normalize(grayMat, dst, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
    cv.imshow(destinationId, dst);

    let histogramModel = this.extractHistogram(dst);

    src.delete();
    grayMat.delete();
    dst.delete();
    return histogramModel;
  }
}
