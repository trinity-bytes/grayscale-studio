import html from './AnalysisPanel.html?raw';
import './AnalysisPanel.css';
import '../../../shared/components/EmptyState/EmptyState.js';
import { strings } from '../../../shared/i18n/strings.js';

/**
 * ==========================================
 * ANALYSIS PANEL (Presentation Component)
 * ==========================================
 * Componente Web Component que muestra el panel de análisis de histogramas.
 * Contiene tres pestañas: Visual (histogramas), Ecuaciones (CDF/LUT)
 * y Explicación. Soporta navegación por teclado (WAI-ARIA Tabs pattern)
 * y gestiona la visualización de métricas estadísticas, tablas de conversión
 * y gráficas matemáticas.
 *
 * @module src/presentation/components/AnalysisPanel/AnalysisPanel
 */
export class AnalysisPanel extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template HTML y configura las pestañas.
   */
  connectedCallback() {
    this.className = "flex-1 flex flex-col";
    this.innerHTML = html;
    this.setupTabs();
  }

  /**
   * Configura el sistema de pestañas con navegación por clic y teclado.
   * Implementa el patrón WAI-ARIA Tabs para accesibilidad.
   */
  setupTabs() {
    const tabList = this.querySelector('#analysis-tabs');
    const tabs = this.querySelectorAll('.tab-btn');
    const contents = this.querySelectorAll('.tab-content');

    const activateTab = (tab) => {
      tabs.forEach(t => {
        t.classList.remove('active', 'text-primary', 'bg-primary/10');
        t.classList.add('text-on-surface-variant');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      contents.forEach(c => {
        c.classList.add('hidden');
        c.classList.remove('flex');
      });

      tab.classList.add('active', 'text-primary', 'bg-primary/10');
      tab.classList.remove('text-on-surface-variant');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      
      const targetId = tab.getAttribute('data-target');
      const targetContent = this.querySelector(`#${targetId}`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('flex');
        // Forzar a Chart.js recalcular tamaños de canvas después de que la pestaña sea visible
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
    });

    // Navegación por teclado (patrón WAI-ARIA Tabs)
    tabList.addEventListener('keydown', (e) => {
      const tabArray = Array.from(tabs);
      const currentIndex = tabArray.indexOf(document.activeElement);

      let nextIndex = -1;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabArray.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabArray.length - 1;
      }

      if (nextIndex >= 0) {
        e.preventDefault();
        activateTab(tabArray[nextIndex]);
        tabArray[nextIndex].focus();
      }
    });

    // Inicializar primera pestaña
    if (tabs.length > 0) {
      tabs[0].click();
    }
  }

  /**
   * Retorna el elemento canvas del histograma original.
   * @returns {HTMLCanvasElement} Elemento canvas del histograma original
   */
  getOriginalCanvas() {
    return this.querySelector('#original-histogram-canvas');
  }

  /**
   * Retorna el elemento canvas del histograma de resultado.
   * @returns {HTMLCanvasElement} Elemento canvas del histograma de resultado
   */
  getResultCanvas() {
    return this.querySelector('#result-histogram-canvas');
  }

  /**
   * Retorna el elemento canvas de las ecuaciones de ecualización.
   * @returns {HTMLCanvasElement} Elemento canvas de ecuaciones de ecualización
   */
  getMathEqCanvas() {
    return this.querySelector('#math-eq-canvas');
  }

  /**
   * Retorna el elemento canvas de las ecuaciones de expansión.
   * @returns {HTMLCanvasElement} Elemento canvas de ecuaciones de expansión
   */
  getMathExpCanvas() {
    return this.querySelector('#math-exp-canvas');
  }

  /**
   * Muestra todos los estados vacíos de las pestañas.
   */
  showEmptyStates() {
    this.querySelectorAll('.tab-empty-state').forEach(el => {
      el.hidden = false;
    });
  }

  /**
   * Oculta todos los estados vacíos de las pestañas.
   */
  hideEmptyStates() {
    this.querySelectorAll('.tab-empty-state').forEach(el => {
      el.hidden = true;
    });
  }

  /**
   * Cambia a la pestaña visual (histogramas).
   */
  switchToVisualTab() {
    const visualTab = this.querySelector('[data-target="tab-visual"]');
    if (visualTab) visualTab.click();
  }

  /**
   * Cambia a la pestaña de ecuaciones de ecualización.
   */
  switchToMathEqTab() {
    const eqTab = this.querySelector('[data-target="tab-math-eq"]');
    if (eqTab) eqTab.click();
  }

  /**
   * Cambia a la pestaña de ecuaciones de expansión.
   */
  switchToMathExpTab() {
    const expTab = this.querySelector('[data-target="tab-math-exp"]');
    if (expTab) expTab.click();
  }

  /**
   * Muestra las métricas estadísticas del histograma en el contenedor especificado.
   * @param {string} containerId - ID del contenedor ('original-metrics' o 'result-metrics')
   * @param {{ min: number, max: number, mean: number, std: number }} metrics - Objeto con las métricas a mostrar
   */
  showMetrics(containerId, metrics) {
    const container = this.querySelector(`#${containerId}`);
    if (!container) return;
    container.innerHTML = `
      <div class="metric-item">
        <span class="metric-label">${strings.analysis.metricsMin}</span>
        <span class="metric-value">${metrics.min}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">${strings.analysis.metricsMax}</span>
        <span class="metric-value">${metrics.max}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">${strings.analysis.metricsMean}</span>
        <span class="metric-value">${metrics.mean}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">${strings.analysis.metricsStd}</span>
        <span class="metric-value">${metrics.std}</span>
      </div>
    `;
    container.classList.remove('hidden');
  }

  /**
   * Limpia y oculta las métricas del contenedor especificado.
   * @param {string} containerId - ID del contenedor de métricas a limpiar
   */
  hideMetrics(containerId) {
    const container = this.querySelector(`#${containerId}`);
    if (!container) return;
    container.innerHTML = '';
    container.classList.add('hidden');
  }

  /**
   * Muestra los contenedores de histogramas y oculta el estado vacío principal.
   * Se llama cuando se carga una imagen.
   */
  showHistogramContainers() {
    const containers = this.querySelector('#histogram-containers');
    if (containers) containers.classList.remove('hidden');
  }

  /**
   * Oculta los contenedores de histogramas y muestra el estado vacío principal.
   * Se llama al restablecer al estado inicial.
   */
  hideHistogramContainers() {
    const containers = this.querySelector('#histogram-containers');
    if (containers) containers.classList.add('hidden');
  }

  /**
   * Muestra el canvas del histograma de resultado y oculta su estado vacío.
   * Se llama después de completar un procesamiento.
   */
  showResultHistogram() {
    const emptyState = this.querySelector('#result-empty-state');
    const histogramContainer = this.querySelector('#result-histogram-container');
    if (emptyState) emptyState.classList.add('hidden');
    if (histogramContainer) histogramContainer.classList.remove('hidden');
  }

  /**
   * Restaura el histograma de resultado a su estado vacío.
   * Se llama al cargar una nueva imagen.
   */
  hideResultHistogram() {
    const emptyState = this.querySelector('#result-empty-state');
    const histogramContainer = this.querySelector('#result-histogram-container');
    if (emptyState) emptyState.classList.remove('hidden');
    if (histogramContainer) histogramContainer.classList.add('hidden');

    const eqTableContainer = this.querySelector('#eq-conversion-table-container');
    const expProcContainer = this.querySelector('#exp-procedure-container');
    if (eqTableContainer) eqTableContainer.classList.add('hidden');
    if (expProcContainer) expProcContainer.classList.add('hidden');
  }

  /**
   * Renderiza la tabla de conversión paso a paso para el proceso de ecualización.
   * Muestra nivel de entrada, frecuencia, PDF, CDF y nivel de salida para cada intensidad.
   * @param {number[]} frequencies - Frecuencias originales del histograma (256 niveles)
   * @param {number[]} lut - Tabla de búsqueda de ecualización (256 niveles)
   */
  showEqualizationTable(frequencies, lut) {
    const tableBody = this.querySelector('#eq-conversion-table-body');
    const container = this.querySelector('#eq-conversion-table-container');
    if (!tableBody || !container) return;

    const totalPixels = frequencies.reduce((a, b) => a + b, 0);
    let cumulativeSum = 0;
    let html = '';

    for (let i = 0; i < 256; i++) {
      const freq = frequencies[i];
      cumulativeSum += freq;
      
      if (freq > 0) {
        const pdf = totalPixels > 0 ? (freq / totalPixels) : 0;
        const cdf = totalPixels > 0 ? (cumulativeSum / totalPixels) : 0;
        const mapped = lut[i];

        html += `
          <tr class="hover:bg-surface-variant/40">
            <td class="font-semibold text-on-surface p-2">${i}</td>
            <td class="p-2">${freq}</td>
            <td class="p-2">${pdf.toFixed(4)}</td>
            <td class="p-2">${cdf.toFixed(4)}</td>
            <td class="font-semibold text-primary dark:text-inverse-primary p-2">${mapped}</td>
          </tr>
        `;
      }
    }

    tableBody.innerHTML = html;
    container.classList.remove('hidden');
  }

  /**
   * Renderiza los detalles del procedimiento de expansión paso a paso.
   * Muestra los valores mínimos, máximos, rango, factor de escala y
   * la fórmula de mapeo para cada nivel de intensidad.
   * @param {number[]} frequencies - Frecuencias originales del histograma (256 niveles)
   * @param {number[]} lut - Tabla de búsqueda de expansión (256 niveles)
   */
  showExpansionProcedure(frequencies, lut) {
    const minValEl = this.querySelector('#exp-min-val');
    const maxValEl = this.querySelector('#exp-max-val');
    const rangeValEl = this.querySelector('#exp-range-val');
    const scaleValEl = this.querySelector('#exp-scale-val');
    const stepsEl = this.querySelector('#exp-procedure-steps');
    const container = this.querySelector('#exp-procedure-container');

    if (!minValEl || !maxValEl || !rangeValEl || !scaleValEl || !stepsEl || !container) return;

    let min = 0;
    while (min < 256 && frequencies[min] === 0) min++;

    let max = 255;
    while (max >= 0 && frequencies[max] === 0) max--;

    if (min >= max) {
      minValEl.textContent = min;
      maxValEl.textContent = min;
      rangeValEl.textContent = '0';
      scaleValEl.textContent = '1.0000';
      stepsEl.innerHTML = `<li>La imagen tiene intensidad uniforme (${min}). No requiere expansión.</li>`;
      container.classList.remove('hidden');
      return;
    }

    const range = max - min;
    const factor = 255 / range;

    minValEl.textContent = min;
    maxValEl.textContent = max;
    rangeValEl.textContent = range;
    scaleValEl.textContent = factor.toFixed(4);

    let html = '';
    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const mapped = lut[i];
        html += `
          <li>
            Nivel <span class="font-semibold">${i}</span>: 
            round((${i} - ${min}) × ${factor.toFixed(4)}) = 
            <span class="font-semibold text-primary dark:text-inverse-primary">${mapped}</span>
          </li>
        `;
      }
    }

    stepsEl.innerHTML = html;
    container.classList.remove('hidden');
  }
}

customElements.define('analysis-panel', AnalysisPanel);
