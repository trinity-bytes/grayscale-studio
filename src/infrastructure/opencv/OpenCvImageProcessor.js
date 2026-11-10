import { HistogramModel } from "../../domain/models/HistogramModel.js";
import { ImageModel } from "../../domain/models/ImageModel.js";

/** Own only handles acquired in this scope; borrowed inputs remain caller-owned. */
function withOwnedResources(operation) {
  const resources = [];
  const own = (resource) => {
    resources.push(resource);
    return resource;
  };
  try {
    return operation(own);
  } finally {
    for (let i = resources.length - 1; i >= 0; i--) {
      resources[i].delete();
    }
  }
}

function copyGrayscale(source, destination) {
  if (source.channels() === 3 || source.channels() === 4) {
    cv.cvtColor(source, destination, cv.COLOR_RGBA2GRAY, 0);
  } else {
    source.copyTo(destination);
  }
}

/**
 * OpenCV.js infrastructure adapter for loading, histogram extraction and transforms.
 * Use cases consume its method contracts through dependency injection; JavaScript
 * does not enforce the separate processor interface classes at runtime.
 * Every acquired WebAssembly handle is scoped to the operation that creates it.
 */
export class OpenCvImageProcessor {
  /**
   * Read, validate and render an image, returning detached domain data.
   * @param {string} sourceId - Source image element ID
   * @param {string} destinationId - Destination canvas ID
   * @returns {ImageModel}
   */
  executeMathematicalPipeline(sourceId, destinationId) {
    return withOwnedResources((own) => {
      let mat;
      try {
        mat = own(cv.imread(sourceId));
      } catch (error) {
        throw new Error(
          "OpenCV no pudo procesar los datos fuente de la imagen asíncrona.",
        );
      }
      const isStrictGrayscale = this.checkIfGrayscale(mat);
      const grayMat = own(new cv.Mat());
      copyGrayscale(mat, grayMat);
      cv.imshow(destinationId, grayMat);

      const minMax = cv.minMaxLoc(grayMat);
      const metadata = {
        totalPixels: grayMat.rows * grayMat.cols,
        width: grayMat.cols,
        height: grayMat.rows,
        minVal: Math.round(minMax.minVal),
        maxVal: Math.round(minMax.maxVal),
      };
      return new ImageModel(isStrictGrayscale, metadata, this.extractHistogram(grayMat));
    });
  }

  /**
   * Compare RGB channels with the existing JPEG tolerance of less than 2.0.
   * @param {cv.Mat} mat - Borrowed source matrix
   * @returns {boolean}
   */
  checkIfGrayscale(mat) {
    if (mat.channels() === 1) return true;
    return withOwnedResources((own) => {
      const channels = own(new cv.MatVector());
      cv.split(mat, channels);
      const diffRG = own(new cv.Mat());
      const diffRB = own(new cv.Mat());
      // MatVector.get creates handles that must be released independently.
      const red = own(channels.get(0));
      const green = own(channels.get(1));
      const blue = own(channels.get(2));
      cv.absdiff(red, green, diffRG);
      cv.absdiff(red, blue, diffRB);
      const meanRG = cv.mean(diffRG)[0];
      const meanRB = cv.mean(diffRB)[0];
      return meanRG < 2.0 && meanRB < 2.0;
    });
  }

  /**
   * Copy the 256 histogram frequencies into a domain model before releasing handles.
   * @param {cv.Mat} mat - Borrowed single-channel matrix
   * @returns {HistogramModel}
   */
  extractHistogram(mat) {
    return withOwnedResources((own) => {
      const mask = own(new cv.Mat());
      const hist = own(new cv.Mat());
      const matVec = own(new cv.MatVector());
      matVec.push_back(mat);
      cv.calcHist(matVec, [0], mask, hist, [256], [0, 256], false);
      const frequencies = Array.from({ length: 256 }, (_, i) => hist.floatAt(i, 0));
      // calcHist returns float32 counts. A bin at/above 2^24 may have lost
      // integer units; recount only that exceptional case from 8-bit pixels.
      if (frequencies.some(count => count >= 2 ** 24)) {
        frequencies.fill(0);
        if (mat.isContinuous()) {
          const pixels = mat.data;
          for (let i = 0; i < mat.rows * mat.cols; i++) frequencies[pixels[i]]++;
        } else {
          // ucharPtr includes row padding: count columns, not the whole view.
          for (let row = 0; row < mat.rows; row++) {
            const pixels = mat.ucharPtr(row);
            for (let col = 0; col < mat.cols; col++) frequencies[pixels[col]]++;
          }
        }
      }
      return new HistogramModel(frequencies);
    });
  }

  /**
   * Equalize and render the source image with OpenCV's existing algorithm.
   * @param {string} sourceId - Source image element ID
   * @param {string} destinationId - Destination canvas ID
   * @returns {HistogramModel}
   */
  applyEqualization(sourceId, destinationId) {
    return this.#applyTransform(sourceId, destinationId, (source, destination) => {
      cv.equalizeHist(source, destination);
    });
  }

  /**
   * Apply the existing Min-Max normalization and render the result.
   * @param {string} sourceId - Source image element ID
   * @param {string} destinationId - Destination canvas ID
   * @returns {HistogramModel}
   */
  applyExpansion(sourceId, destinationId) {
    return this.#applyTransform(sourceId, destinationId, (source, destination) => {
      cv.normalize(source, destination, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
    });
  }

  #applyTransform(sourceId, destinationId, transform) {
    return withOwnedResources((own) => {
      const source = own(cv.imread(sourceId));
      const destination = own(new cv.Mat());
      const grayMat = own(new cv.Mat());
      copyGrayscale(source, grayMat);
      transform(grayMat, destination);
      cv.imshow(destinationId, destination);
      return this.extractHistogram(destination);
    });
  }
}
