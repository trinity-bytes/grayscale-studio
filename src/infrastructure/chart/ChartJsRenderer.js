const ORIGINAL_CANVAS = 'original-histogram-canvas';
const RESULT_CANVAS = 'result-histogram-canvas';
const number = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });

/** Draw the selected domain sample, not a smoothed/interpolated position. */
const selectionGuide = {
  id: 'studio-selection',
  afterDatasetsDraw(chart) {
    if (!chart.canvas.hasAttribute('data-selected-intensity')) return;
    const intensity = Number(chart.canvas.dataset.selectedIntensity);
    if (!Number.isInteger(intensity) || intensity < 0 || intensity > 255) return;
    const point = chart.getDatasetMeta(0).data[intensity];
    if (!point || point.skip) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.strokeStyle = '#949494';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(point.x, chartArea.top);
    ctx.lineTo(point.x, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#88b5ff';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

/** Chart.js adapter for exact, unsmoothed Studio distributions and mappings. */
export class ChartJsRenderer {
  constructor() {
    this.chartInstances = new Map();
    this.frequencyPeaks = new Map();
    this.inspectionListeners = new Map();
  }

  getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    return {
      gridColor: read('--chart-grid', '#292929'),
      tickColor: read('--chart-tick', '#949494'),
      barColor: read('--chart-bar', 'rgba(180,180,180,0.14)'),
      barBorderColor: read('--chart-line', '#b4b4b4'),
      barProcessedColor: read('--chart-bar-processed', 'rgba(136,181,255,0.14)'),
      barProcessedBorder: read('--chart-line-processed', '#88b5ff'),
    };
  }

  destroyChart(canvasId) {
    const inspection = this.inspectionListeners.get(canvasId);
    if (inspection) inspection.canvas.removeEventListener('on-inspection-changed', inspection.listener);
    this.inspectionListeners.delete(canvasId);
    this.chartInstances.get(canvasId)?.destroy();
    this.chartInstances.delete(canvasId);
    this.frequencyPeaks.delete(canvasId);
  }

  /** The same frequency bound is applied to both panes, never normalized independently. */
  sharedFrequencyMaximum() {
    const peak = Math.max(1, ...this.frequencyPeaks.values());
    const magnitude = 10 ** Math.floor(Math.log10(peak));
    return Math.ceil(peak / magnitude) * magnitude;
  }

  baseOptions(theme) {
    const font = { family: '"IBM Plex Mono", monospace', size: 11 };
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          backgroundColor: '#191919',
          titleColor: '#f4f4f4',
          bodyColor: '#b4b4b4',
          borderColor: '#292929',
          borderWidth: 1,
          padding: 12,
          titleFont: font,
          bodyFont: font,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: theme.tickColor, font, maxRotation: 0, autoSkip: false },
        },
        y: {
          min: 0,
          grid: { color: theme.gridColor, drawTicks: false },
          border: { display: false },
          ticks: { color: theme.tickColor, font, maxTicksLimit: 4, padding: 8 },
        },
      },
    };
  }

  /** Publish the selected input through the presentation event boundary. */
  selectionHandler(canvas, intervalWidth = 1) {
    return (_event, elements) => {
      if (!elements.length) return;
      const intensity = elements[0].index * intervalWidth;
      canvas.dispatchEvent(new CustomEvent('on-intensity-selected', {
        bubbles: true,
        composed: true,
        detail: { intensity },
      }));
    };
  }

  render(canvasId, histogramModel) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas no encontrado: ${canvasId}`);
      return;
    }

    // A replacement image starts a new comparison; discard the previous result and bound.
    if (canvasId === ORIGINAL_CANVAS) this.destroyChart(RESULT_CANVAS);
    this.destroyChart(canvasId);
    const frequencies = histogramModel.getFrequencies();
    const bins = Array.from({ length: 64 }, (_, index) =>
      frequencies.slice(index * 4, index * 4 + 4).reduce((sum, count) => sum + count, 0));
    const labels = bins.map((_, index) => `${index * 4}–${index * 4 + 3}`);
    const total = bins.reduce((sum, count) => sum + count, 0);
    this.frequencyPeaks.set(canvasId, Math.max(...bins));
    const maximum = this.sharedFrequencyMaximum();
    const theme = this.getThemeColors();
    const processed = canvasId === RESULT_CANVAS;
    const options = this.baseOptions(theme);
    options.scales.x.offset = true;
    options.scales.x.ticks.callback = value => {
      if (value === 63) return '255';
      return value % 16 === 0 ? String(value * 4) : '';
    };
    options.scales.y.max = maximum;
    options.scales.y.ticks.callback = value => value >= 1000 ? `${number.format(value / 1000)}k` : number.format(value);
    options.onClick = this.selectionHandler(canvas, 4);
    options.plugins.tooltip.callbacks = {
      title: items => `Niveles ${labels[items[0].dataIndex]}`,
      label: item => {
        const count = bins[item.dataIndex];
        const percent = total ? count / total * 100 : 0;
        return `${number.format(count)} píxeles · ${number.format(percent)}%`;
      },
      footer: () => 'Clic: inspeccionar el primer nivel del intervalo',
    };
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Histograma ${processed ? 'del resultado' : 'original'}: ${number.format(total)} píxeles; 64 intervalos de 4 niveles. Consulta Ver frecuencias para los valores exactos de esta distribución.`);

    const tableBody = document.getElementById(`${canvasId}-data`);
    if (tableBody) {
      tableBody.replaceChildren();
      bins.forEach((count, index) => {
        const row = document.createElement('tr');
        for (const value of [labels[index], count]) {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.append(cell);
        }
        tableBody.append(row);
      });
    }

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Píxeles · Σh(r)',
          data: bins,
          stepped: 'middle',
          tension: 0,
          fill: true,
          borderWidth: 1.5,
          borderColor: processed ? theme.barProcessedBorder : theme.barBorderColor,
          backgroundColor: processed ? theme.barProcessedColor : theme.barColor,
          pointRadius: 0,
          pointHoverRadius: 3,
        }],
      },
      options,
    });
    this.chartInstances.set(canvasId, chart);
    for (const id of this.frequencyPeaks.keys()) {
      if (id === canvasId) continue;
      const peer = this.chartInstances.get(id);
      peer.options.scales.y.max = maximum;
      peer.update('none');
    }
  }

  renderMath(canvasId, histogramMath, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);
    const theme = this.getThemeColors();
    const isCdf = type === 'equalization';
    const data = isCdf ? histogramMath.getEqualizationData().cdf : histogramMath.getExpansionData().lut;
    const options = this.baseOptions(theme);
    options.scales.x.ticks.callback = value => value % 64 === 0 || value === 255 ? String(value) : '';
    options.scales.y.max = isCdf ? 1 : 255;
    options.scales.y.ticks.maxTicksLimit = 3;
    options.onClick = this.selectionHandler(canvas);
    options.plugins.tooltip.callbacks = {
      title: items => `Entrada r = ${items[0].dataIndex}`,
      label: item => `${isCdf ? 'CDF(r)' : 'Salida s'} = ${isCdf ? data[item.dataIndex].toFixed(6) : data[item.dataIndex]}`,
    };
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', isCdf
      ? 'Distribución acumulada: CDF normalizada de los 256 niveles de entrada. Valores exactos en la tabla de transformación.'
      : 'Expansión: transformación de los 256 niveles de entrada a intensidades entre 0 y 255. Valores exactos en la tabla de transformación.');
    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      plugins: [selectionGuide],
      data: {
        labels: histogramMath.labels,
        datasets: [{
          label: isCdf ? 'CDF(r)' : 'Salida s',
          data,
          stepped: 'after',
          tension: 0,
          fill: true,
          borderColor: theme.barProcessedBorder,
          backgroundColor: theme.barProcessedColor,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 3,
        }],
      },
      options,
    });
    const listener = () => chart.update('none');
    canvas.addEventListener('on-inspection-changed', listener);
    this.inspectionListeners.set(canvasId, { canvas, listener });
    this.chartInstances.set(canvasId, chart);
  }
}
