/**
 * ==========================================
 * CHART.JS EXTERNAL LIBRARY ADAPTER OR WRAPPER
 * ==========================================
 * Clase perteneciente a Infraestructura para inicializar, encapsular
 * y gestionar de manera destructiva para liberar RAM a las gráficas del framework Chart.js
 */
export class ChartJsRenderer {
  constructor() {
    // Almacena un mapa de (ID_LIENZO -> Objeto Chart) para saber cuándo pisarlos.
    this.chartInstances = new Map();
  }

  /**
   * Pinta o re-pinta la gráfica desde frecuencias limpias.
   * @param {string} canvasId - Element ID donde depositar barras.
   * @param {import('../../domain/models/HistogramModel.js').HistogramModel} histogramModel - Carga semántica del valor (0 a 255)
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

    const ctx = canvas.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: histogramModel.getLabels(),
        datasets: [
          {
            label: "Frecuencia de Intensidad",
            data: histogramModel.getFrequencies(),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
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
            title: { display: true, text: "Nivel de Gris (0-255)" },
          },
          y: {
            display: true,
            title: { display: true, text: "Cantidad de Píxeles" },
          },
        },
        animation: {
          duration: 500,
        },
      },
    });

    this.chartInstances.set(canvasId, newChart);
  }
}
