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
   * Calcula la ecualización global del histograma.
   * Construye la Función de Distribución Acumulada (CDF) normalizada y
   * la tabla de búsqueda (LUT) de ecualización que mapea cada nivel de entrada
   * a su nivel de salida correspondiente.
   * - CDF normalizado: CDF[i] = sumaAcumulada(i) / totalPíxeles (rango [0, 1])
   * - LUT ecualización: round(CDF[i] * 255) (rango [0, 255])
   */
  computeEqualization() {
    /** @type {number[]} Función de Distribución Acumulada normalizada [0, 1] */
    this.cdf = new Array(256).fill(0);

    /** @type {number[]} Tabla de búsqueda de ecualización [0, 255] */
    this.equalizationLut = new Array(256).fill(0);

    let cumulativeSum = 0;
    for (let i = 0; i < 256; i++) {
      cumulativeSum += this.frequencies[i];
      // CDF normalizado [0, 1]
      this.cdf[i] = this.totalPixels > 0 ? cumulativeSum / this.totalPixels : 0;
      // Mapeado a rango [0, 255]
      this.equalizationLut[i] = Math.round(this.cdf[i] * 255);
    }
  }

  /**
   * Calcula la expansión (estiramiento lineal Min-Max) del histograma.
   * Encuentra los valores mínimos y máximos de intensidad con frecuencia no nula,
   * y construye una tabla de búsqueda lineal que redistribuye el rango completo [0, 255].
   * - Para i <= min: LUT[i] = 0
   * - Para i >= max: LUT[i] = 255
   * - Para min < i < max: LUT[i] = round((i - min) * 255 / (max - min))
   */
  computeExpansion() {
    /** @type {number[]} Tabla de búsqueda de expansión [0, 255] */
    this.expansionLut = new Array(256).fill(0);

    // Encuentra el primer nivel de intensidad con frecuencia no nula
    let min = 0;
    while (min < 256 && this.frequencies[min] === 0) min++;

    // Encuentra el último nivel de intensidad con frecuencia no nula
    let max = 255;
    while (max >= 0 && this.frequencies[max] === 0) max--;

    // Caso borde: imagen plana o sin datos
    if (min >= max) {
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
        // Mapeo lineal: (i - min) * 255 / (max - min)
        this.expansionLut[i] = Math.round(((i - min) * 255) / (max - min));
      }
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
   * @returns {{ lut: number[] }} Objeto con la LUT de expansión
   */
  getExpansionData() {
    return {
      lut: this.expansionLut
    };
  }
}
