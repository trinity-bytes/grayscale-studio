import html from './HistoryDrawer.html?raw';
import './HistoryDrawer.css';

/**
 * ==========================================
 * HISTORY DRAWER (Presentation Component)
 * ==========================================
 * Componente Web Component que implementa un cajón lateral (drawer) para
 * mostrar el historial de operaciones de procesamiento de imágenes.
 * Almacena las entradas en localStorage para persistencia entre sesiones.
 * Muestra tipo de operación, nombre de archivo, timestamp y métricas
 * antes/después de cada operación. Se registra como <history-drawer>.
 *
 * @module src/presentation/components/HistoryDrawer/HistoryDrawer
 */
export class HistoryDrawer extends HTMLElement {
  constructor() {
    super();
    /** @type {Array<{id: number, type: string, filename: string, timestamp: string, metricsBefore: object, metricsAfter: object}>} Lista de entradas del historial */
    this.entries = [];
  }

  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template, referencia elementos internos, vincula eventos
   * y carga el historial desde localStorage.
   */
  connectedCallback() {
    this.innerHTML = html;

    /** @type {HTMLElement} Overlay de fondo del cajón */
    this.overlay = this.querySelector('#history-drawer-overlay');

    /** @type {HTMLElement} Contenedor principal del cajón */
    this.container = this.querySelector('#history-drawer-container');

    /** @type {HTMLButtonElement} Botón de cerrar cajón */
    this.closeBtn = this.querySelector('#history-close-btn');

    /** @type {HTMLButtonElement} Botón de limpiar historial */
    this.clearBtn = this.querySelector('#history-clear-btn');

    /** @type {HTMLElement} Estado vacío del historial */
    this.emptyState = this.querySelector('#history-empty-state');

    /** @type {HTMLElement} Contenedor de la lista de entradas */
    this.listContainer = this.querySelector('#history-list');

    /** @type {HTMLElement} Pie de página del cajón */
    this.footer = this.querySelector('#history-footer');

    // Vincular eventos
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    this.clearBtn.addEventListener('click', () => this.clear());

    // Cargar entradas iniciales desde localStorage
    this.loadHistory();
  }

  /**
   * Abre el cajón lateral con animación y bloquea el scroll del fondo.
   */
  open() {
    this.overlay.classList.add('open');
    this.container.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el cajón lateral y restablece el scroll del fondo.
   */
  close() {
    this.overlay.classList.remove('open');
    this.container.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Carga el historial de operaciones desde localStorage.
   * Si hay datos válidos, los parsea; de lo contrario inicializa un array vacío.
   */
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

  /**
   * Guarda el historial de operaciones en localStorage.
   */
  saveHistory() {
    try {
      localStorage.setItem('grayscale-history', JSON.stringify(this.entries));
    } catch (e) {
      console.error('Error saving history to localStorage', e);
    }
  }

  /**
   * Agrega una nueva entrada al historial de operaciones.
   * Inserta al inicio del array y mantiene un máximo de 20 entradas.
   * @param {{ type: 'equalize'|'expand', filename: string, metricsBefore: {min: number, max: number, mean: number, std: number}, metricsAfter: {min: number, max: number, mean: number, std: number} }} data - Datos de la operación a registrar
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

    // Insertar al inicio del array (más reciente primero)
    this.entries.unshift(entry);

    // Límite máximo de 20 entradas en el historial
    if (this.entries.length > 20) {
      this.entries.pop();
    }

    this.saveHistory();
    this.render();
  }

  /**
   * Limpia todo el historial de operaciones.
   */
  clear() {
    this.entries = [];
    this.saveHistory();
    this.render();
  }

  /**
   * Renderiza la lista de entradas del historial en el DOM.
   * Muestra el estado vacío si no hay entradas.
   */
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
