/** Saturated 8-bit conversion: nearest integer, with exact half ties to even. */
function quantize8(value) {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  const lower = Math.floor(value);
  if (value - lower === 0.5) return lower % 2 === 0 ? lower : lower + 1;
  return Math.round(value);
}

/**
 * ==========================================
 * HISTOGRAM MATH (Domain Value-Object)
 * ==========================================
 * Value-Object que calcula los datos matemáticos para la visualización educativa
 * de las transformaciones de histograma: ecualización (CDF) y expansión (mapeo lineal Min-Max).
 * Implementado en JavaScript puro sin dependencia de OpenCV, permitiendo
 * cálculos independientes del motor de procesamiento de imágenes.
 *
 * @module src/domain/models/HistogramMath
 */
export class HistogramMath {
  /**
   * Crea una instancia de HistogramMath y calcula automáticamente las
   * transformaciones de ecualización y expansión a partir del modelo de histograma.
   * @param {import('./HistogramModel.js').HistogramModel} histogramModel - Modelo de histograma con las frecuencias originales
   */
  constructor(histogramModel) {
    /** @type {number[]} Frecuencias originales del histograma */
    this.frequencies = histogramModel.getFrequencies();

    /** @type {number[]} Etiquetas del eje X (0-255) */
    this.labels = histogramModel.getLabels();

    /** @type {number} Total de píxeles calculado a partir de las frecuencias */
    this.totalPixels = this.frequencies.reduce((sum, val) => sum + val, 0);

    // Calcula ambas transformaciones al instanciar
    this.computeEqualization();
    this.computeExpansion();
  }

  /**
   * Keep the raw normalized CDF for teaching, but normalize the LUT by its
   * first occupied bin. Float32 operation order and ties-to-even match the
   * pinned OpenCV 4.8.0 runtime (verified against real engine fixtures).
   */
  computeEqualization() {
    this.cdf = new Array(256).fill(0);
    this.equalizationLut = new Array(256).fill(0);
    let cumulative = 0;
    for (let i = 0; i < 256; i++) {
      cumulative += this.frequencies[i];
      this.cdf[i] = this.totalPixels > 0 ? cumulative / this.totalPixels : 0;
    }
    if (this.totalPixels === 0) return;
    const first = this.frequencies.findIndex(count => count > 0);
    const firstCount = this.frequencies[first];
    if (firstCount === this.totalPixels) {
      this.equalizationLut = this.labels.slice();
      return;
    }
    const scale = Math.fround(255 / (this.totalPixels - firstCount));
    cumulative = 0;
    for (let i = first + 1; i < 256; i++) {
      cumulative += this.frequencies[i];
      this.equalizationLut[i] = quantize8(Math.fround(Math.fround(cumulative) * scale));
    }
  }

  /**
   * Match native 8-bit Min-Max normalization, including constant images.
   * The shift is rounded from the double-precision scale, not from its
   * float32 representation. Multiply and add each round separately.
   */
  computeExpansion() {
    this.expansionLut = new Array(256).fill(0);
    this.expansionMin = this.frequencies.findIndex(count => count > 0);
    this.expansionMax = this.frequencies.findLastIndex(count => count > 0);
    this.expansionScale = 0;
    this.expansionShift = 0;
    if (this.totalPixels === 0) return;
    const range = this.expansionMax - this.expansionMin;
    const scale = range > 0 ? 255 / range : 0;
    this.expansionScale = Math.fround(scale);
    this.expansionShift = Math.fround(-this.expansionMin * scale);
    for (let i = 0; i < 256; i++) {
      const product = Math.fround(i * this.expansionScale);
      this.expansionLut[i] = quantize8(Math.fround(product + this.expansionShift));
    }
  }

  /**
   * Retorna los datos de ecualización para visualización educativa.
   * @returns {{ cdf: number[], lut: number[] }} Objeto con la CDF normalizada y la LUT de ecualización
   */
  getEqualizationData() {
    return {
      cdf: this.cdf,
      lut: this.equalizationLut
    };
  }

  /**
   * Retorna los datos de expansión para visualización educativa.
   * @returns {{ lut: number[], min: number, max: number, scale: number, shift: number }} LUT y parámetros nativos; min/max son -1 sin píxeles
   */
  getExpansionData() {
    return {
      lut: this.expansionLut,
      min: this.expansionMin,
      max: this.expansionMax,
      scale: this.expansionScale,
      shift: this.expansionShift,
    };
  }
}
