import html from './AnalysisPanel.html?raw';
import './AnalysisPanel.css';
import '../../../shared/components/EmptyState/EmptyState.js';
import { strings } from '../../../shared/i18n/strings.js';

export class AnalysisPanel extends HTMLElement {
  connectedCallback() {
    this.className = "flex-1 flex flex-col";
    this.innerHTML = html;
    this.setupTabs();
  }

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
        // Force Chart.js to recalculate canvas sizes after the tab becomes visible
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
    });

    // Keyboard navigation (WAI-ARIA Tabs pattern)
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

    // Initialize first tab
    if (tabs.length > 0) {
      tabs[0].click();
    }
  }

  getOriginalCanvas() {
    return this.querySelector('#original-histogram-canvas');
  }

  getResultCanvas() {
    return this.querySelector('#result-histogram-canvas');
  }

  getMathEqCanvas() {
    return this.querySelector('#math-eq-canvas');
  }

  getMathExpCanvas() {
    return this.querySelector('#math-exp-canvas');
  }

  showEmptyStates() {
    this.querySelectorAll('.tab-empty-state').forEach(el => {
      el.hidden = false;
    });
  }

  hideEmptyStates() {
    this.querySelectorAll('.tab-empty-state').forEach(el => {
      el.hidden = true;
    });
  }

  switchToVisualTab() {
    const visualTab = this.querySelector('[data-target="tab-visual"]');
    if (visualTab) visualTab.click();
  }

  switchToMathEqTab() {
    const eqTab = this.querySelector('[data-target="tab-math-eq"]');
    if (eqTab) eqTab.click();
  }

  switchToMathExpTab() {
    const expTab = this.querySelector('[data-target="tab-math-exp"]');
    if (expTab) expTab.click();
  }

  /**
   * Display histogram metrics (Min, Max, Mean, Std) in the metrics grid.
   * @param {string} containerId - 'original-metrics' or 'result-metrics'
   * @param {{ min: number, max: number, mean: number, std: number }} metrics
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
   * Clear metrics display for a container.
   * @param {string} containerId
   */
  hideMetrics(containerId) {
    const container = this.querySelector(`#${containerId}`);
    if (!container) return;
    container.innerHTML = '';
    container.classList.add('hidden');
  }

  /**
   * Show histogram containers and hide the main empty state.
   * Called when an image is loaded.
   */
  showHistogramContainers() {
    const containers = this.querySelector('#histogram-containers');
    if (containers) containers.classList.remove('hidden');
  }

  /**
   * Hide histogram containers and show the main empty state.
   * Called when resetting to initial state.
   */
  hideHistogramContainers() {
    const containers = this.querySelector('#histogram-containers');
    if (containers) containers.classList.add('hidden');
  }

  /**
   * Show the result histogram canvas and hide its empty state.
   * Called after processing completes.
   */
  showResultHistogram() {
    const emptyState = this.querySelector('#result-empty-state');
    const histogramContainer = this.querySelector('#result-histogram-container');
    if (emptyState) emptyState.classList.add('hidden');
    if (histogramContainer) histogramContainer.classList.remove('hidden');
  }

  /**
   * Reset result histogram to empty state.
   * Called when a new image is loaded.
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
   * Render the step-by-step conversion table for equalization.
   * @param {number[]} frequencies
   * @param {number[]} lut
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
   * Render the step-by-step expansion procedure details.
   * @param {number[]} frequencies
   * @param {number[]} lut
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
