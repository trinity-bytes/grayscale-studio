import { strings } from '../../shared/i18n/strings.js';

/**
 * ==========================================
 * CHART.JS ADAPTER / WRAPPER (Infrastructure)
 * ==========================================
 * Adaptador que encapsula la librería externa Chart.js para renderizar
 * histogramas y gráficas matemáticas. Gestiona de manera destructiva
 * las instancias de Chart para evitar fugas de memoria (memory leaks)
 * al sobrescribir gráficas existentes.
 *
 * @module src/infrastructure/chart/ChartJsRenderer
 */
export class ChartJsRenderer {
  constructor() {
    /** @type {Map<string, Chart>} Mapa de instancias de Chart indexadas por ID de canvas */
    this.chartInstances = new Map();
  }

  /**
   * Lee las propiedades CSS personalizadas del tema actual para aplicar
   * colores consistentes a las gráficas. Soporta temas claro y oscuro.
   * @returns {{ gridColor: string, tickColor: string, barColor: string, barBorderColor: string, barProcessedColor: string, barProcessedBorder: string }} Objeto con los colores del tema activo
   */
  getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const gridColor = styles.getPropertyValue('--chart-grid').trim() || 'rgba(0,0,0,0.1)';
    const tickColor = styles.getPropertyValue('--chart-tick').trim() || '#191c1e';
    const barColor = styles.getPropertyValue('--chart-bar').trim() || 'rgba(54, 162, 235, 0.6)';
    const barProcessedColor = styles.getPropertyValue('--chart-bar-processed').trim() || 'rgba(255, 99, 132, 0.6)';
    return {
      gridColor,
      tickColor,
      barColor,
      barBorderColor: barColor.replace(/[\d.]+\)$/, '1)'),
      barProcessedColor,
      barProcessedBorder: barProcessedColor.replace(/[\d.]+\)$/, '1)'),
    };
  }

  /**
   * Renderiza o re-renderiza un histograma de frecuencias de intensidad.
   * Destruye la instancia anterior del canvas si existe para evitar superposiciones.
   * @param {string} canvasId - ID del elemento canvas donde se dibujará el histograma
   * @param {import('../../domain/models/HistogramModel.js').HistogramModel} histogramModel - Modelo de histograma con las frecuencias y etiquetas
   */
  render(canvasId, histogramModel) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas no encontrado: ${canvasId}`);
      return;
    }

    // Destruir instancia anterior para evitar superposiciones (memory leaks)
    if (this.chartInstances.has(canvasId)) {
      this.chartInstances.get(canvasId).destroy();
      this.chartInstances.delete(canvasId);
    }

    const theme = this.getThemeColors();
    const ctx = canvas.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: histogramModel.getLabels(),
        datasets: [
          {
            label: strings.charts.frequencyIntensity,
            data: histogramModel.getFrequencies(),
            backgroundColor: theme.barColor,
            borderColor: theme.barBorderColor,
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            title: { display: true, text: strings.charts.grayLevel },
            ticks: { color: theme.tickColor },
            grid: { color: theme.gridColor },
          },
          y: {
            display: true,
            title: { display: true, text: strings.charts.pixelCount },
            ticks: { color: theme.tickColor },
            grid: { color: theme.gridColor },
          },
        },
        animation: {
          duration: 500,
        },
      },
    });

    this.chartInstances.set(canvasId, newChart);
  }

  /**
   * Renderiza una gráfica matemática de doble eje (dual-axis) que superpone
   * el histograma original (barras) con la función de mapeo (línea).
   * Utilizada para visualizar educativamente las transformaciones de ecualización y expansión.
   * @param {string} canvasId - ID del elemento canvas donde se dibujará la gráfica
   * @param {import('../../domain/models/HistogramMath.js').HistogramMath} histogramMath - Modelo matemático con los datos de ecualización/expansión
   * @param {string} type - Tipo de transformación: "equalization" o "expansion"
   */
  renderMath(canvasId, histogramMath, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.chartInstances.has(canvasId)) {
      this.chartInstances.get(canvasId).destroy();
      this.chartInstances.delete(canvasId);
    }

    const theme = this.getThemeColors();
    const ctx = canvas.getContext("2d");
    
    let lineData = [];
    let lineLabel = "";
    
    if (type === "equalization") {
      lineData = histogramMath.getEqualizationData().lut;
      lineLabel = strings.charts.lutEqualization;
    } else {
      lineData = histogramMath.getExpansionData().lut;
      lineLabel = strings.charts.lutExpansion;
    }

    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: histogramMath.labels,
        datasets: [
          {
            type: "line",
            label: lineLabel,
            data: lineData,
            borderColor: theme.barProcessedBorder,
            backgroundColor: theme.barProcessedColor,
            borderWidth: 2,
            yAxisID: "y2",
            tension: 0.1,
            pointRadius: 0
          },
          {
            type: "bar",
            label: strings.charts.originalHistogram,
            data: histogramMath.frequencies,
            backgroundColor: theme.barColor,
            borderColor: theme.barBorderColor,
            borderWidth: 1,
            yAxisID: "y",
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: { display: true, text: strings.charts.inputIntensity },
            ticks: { color: theme.tickColor },
            grid: { color: theme.gridColor },
          },
          y: {
            display: true,
            position: 'left',
            title: { display: true, text: strings.charts.pixelCountAxis },
            ticks: { color: theme.tickColor },
            grid: { color: theme.gridColor },
          },
          y2: {
            display: true,
            position: 'right',
            title: { display: true, text: strings.charts.outputIntensity },
            min: 0,
            max: 255,
            ticks: { color: theme.tickColor },
            grid: {
              drawOnChartArea: false
            }
          }
        },
        animation: {
          duration: 500,
        },
      }
    });

    this.chartInstances.set(canvasId, newChart);
  }
}
