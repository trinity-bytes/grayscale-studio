import html from './HistoryDrawer.html?raw';
import './HistoryDrawer.css';

export class HistoryDrawer extends HTMLElement {
  constructor() {
    super();
    this.entries = [];
  }

  connectedCallback() {
    this.innerHTML = html;
    this.overlay = this.querySelector('#history-drawer-overlay');
    this.container = this.querySelector('#history-drawer-container');
    this.closeBtn = this.querySelector('#history-close-btn');
    this.clearBtn = this.querySelector('#history-clear-btn');
    this.emptyState = this.querySelector('#history-empty-state');
    this.listContainer = this.querySelector('#history-list');
    this.footer = this.querySelector('#history-footer');

    // Bind events
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    this.clearBtn.addEventListener('click', () => this.clear());

    // Load initial entries from LocalStorage
    this.loadHistory();
  }

  open() {
    this.overlay.classList.add('open');
    this.container.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  close() {
    this.overlay.classList.remove('open');
    this.container.classList.remove('open');
    document.body.style.overflow = ''; // Restore background scroll
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('grayscale-history');
      if (stored) {
        this.entries = JSON.parse(stored);
      } else {
        this.entries = [];
      }
    } catch (e) {
      console.error('Error loading history from localStorage', e);
      this.entries = [];
    }
    this.render();
  }

  saveHistory() {
    try {
      localStorage.setItem('grayscale-history', JSON.stringify(this.entries));
    } catch (e) {
      console.error('Error saving history to localStorage', e);
    }
  }

  /**
   * Add a new entry to the history list
   * @param {{ type: 'equalize'|'expand', filename: string, metricsBefore: object, metricsAfter: object }} data
   */
  addEntry(data) {
    const time = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const entry = {
      id: Date.now(),
      type: data.type,
      filename: data.filename || 'Imagen sin nombre',
      timestamp: time,
      metricsBefore: data.metricsBefore,
      metricsAfter: data.metricsAfter
    };

    // Insert at the beginning of the array
    this.entries.unshift(entry);

    // Max limit of 20 history entries
    if (this.entries.length > 20) {
      this.entries.pop();
    }

    this.saveHistory();
    this.render();
  }

  clear() {
    this.entries = [];
    this.saveHistory();
    this.render();
  }

  render() {
    if (this.entries.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.listContainer.classList.add('hidden');
      this.listContainer.innerHTML = '';
      this.footer.classList.add('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');
    this.listContainer.classList.remove('hidden');
    this.footer.classList.remove('hidden');

    let html = '';
    this.entries.forEach(entry => {
      const isEq = entry.type === 'equalize';
      const badgeText = isEq ? 'Ecualizar' : 'Expansión';
      const badgeClass = isEq ? 'equalize' : 'expand';

      html += `
        <div class="history-card">
          <div class="history-card-header">
            <span class="history-badge ${badgeClass}">${badgeText}</span>
            <span class="history-time">${entry.timestamp}</span>
          </div>
          <div class="history-card-title text-on-surface" title="${entry.filename}">
            ${entry.filename}
          </div>
          
          <div class="history-metrics-grid">
            <div class="history-metric-col">
              <span class="history-metric-label">Mín</span>
              <span class="history-metric-val text-on-surface">
                ${entry.metricsBefore.min} <span class="history-metric-change">→</span> ${entry.metricsAfter.min}
              </span>
            </div>
            <div class="history-metric-col">
              <span class="history-metric-label">Máx</span>
              <span class="history-metric-val text-on-surface">
                ${entry.metricsBefore.max} <span class="history-metric-change">→</span> ${entry.metricsAfter.max}
              </span>
            </div>
            <div class="history-metric-col">
              <span class="history-metric-label">Media</span>
              <span class="history-metric-val text-on-surface">
                ${entry.metricsBefore.mean} <span class="history-metric-change">→</span> ${entry.metricsAfter.mean}
              </span>
            </div>
            <div class="history-metric-col">
              <span class="history-metric-label">DesvEst</span>
              <span class="history-metric-val text-on-surface">
                ${entry.metricsBefore.std} <span class="history-metric-change">→</span> ${entry.metricsAfter.std}
              </span>
            </div>
          </div>
        </div>
      `;
    });

    this.listContainer.innerHTML = html;
  }
}

customElements.define('history-drawer', HistoryDrawer);
