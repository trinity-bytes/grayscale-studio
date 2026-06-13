/**
 * ==========================================
 * HISTOGRAM MATH (Domain Value-Object)
 * ==========================================
 * Educational visualization data for histogram equalization (CDF) and expansion (Linear Mapping).
 * Pure JS, no OpenCV dependency.
 */
export class HistogramMath {
  /**
   * Computes math mapping from a histogram
   * @param {import('./HistogramModel.js').HistogramModel} histogramModel 
   */
  constructor(histogramModel) {
    this.frequencies = histogramModel.getFrequencies();
    this.labels = histogramModel.getLabels();
    this.totalPixels = this.frequencies.reduce((sum, val) => sum + val, 0);
    
    this.computeEqualization();
    this.computeExpansion();
  }

  computeEqualization() {
    this.cdf = new Array(256).fill(0);
    this.equalizationLut = new Array(256).fill(0);
    
    let cumulativeSum = 0;
    for (let i = 0; i < 256; i++) {
      cumulativeSum += this.frequencies[i];
      // Normalized CDF [0, 1]
      this.cdf[i] = this.totalPixels > 0 ? cumulativeSum / this.totalPixels : 0;
      // Mapped to 0-255
      this.equalizationLut[i] = Math.round(this.cdf[i] * 255);
    }
  }

  computeExpansion() {
    this.expansionLut = new Array(256).fill(0);
    
    // Find min and max non-zero intensities
    let min = 0;
    while (min < 256 && this.frequencies[min] === 0) min++;
    
    let max = 255;
    while (max >= 0 && this.frequencies[max] === 0) max--;

    if (min >= max) {
      // Edge case: flat image or all zeros
      for (let i = 0; i < 256; i++) {
        this.expansionLut[i] = i;
      }
      return;
    }

    for (let i = 0; i < 256; i++) {
      if (i <= min) {
        this.expansionLut[i] = 0;
      } else if (i >= max) {
        this.expansionLut[i] = 255;
      } else {
        // Linear mapping: (i - min) * 255 / (max - min)
        this.expansionLut[i] = Math.round(((i - min) * 255) / (max - min));
      }
    }
  }

  getEqualizationData() {
    return {
      cdf: this.cdf,
      lut: this.equalizationLut
    };
  }

  getExpansionData() {
    return {
      lut: this.expansionLut
    };
  }
}
