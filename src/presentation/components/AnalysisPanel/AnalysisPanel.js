import html from './AnalysisPanel.html?raw';
import './AnalysisPanel.css';
import '../../../shared/components/EmptyState/EmptyState.js';

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
        <span class="metric-label">Min</span>
        <span class="metric-value">${metrics.min}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Max</span>
        <span class="metric-value">${metrics.max}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Mean</span>
        <span class="metric-value">${metrics.mean}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Std</span>
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
  }
}

customElements.define('analysis-panel', AnalysisPanel);
