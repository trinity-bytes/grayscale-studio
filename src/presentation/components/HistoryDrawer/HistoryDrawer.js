import html from './HistoryDrawer.html?raw';
import './HistoryDrawer.css';

const METRICS = [['min', 'Mín'], ['max', 'Máx'], ['mean', 'Media'], ['std', 'DesvEst']];

// Storage is an external input boundary; parsing JSON alone does not validate it.
function isHistoryEntry(entry) {
  const validMetrics = value => value && METRICS.every(([key]) => Number.isFinite(value[key]));
  return entry && Number.isFinite(entry.id)
    && (entry.type === 'equalize' || entry.type === 'expand')
    && typeof entry.filename === 'string' && typeof entry.timestamp === 'string'
    && validMetrics(entry.metricsBefore) && validMetrics(entry.metricsAfter);
}

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
    this.clearBtn.addEventListener('click', () => this.requestClear());
    this.querySelector('#history-cancel-clear-btn').addEventListener('click', () => this.cancelClear());
    this.querySelector('#history-confirm-clear-btn').addEventListener('click', () => {
      this.clear();
      this.cancelClear(false);
      this.closeBtn.focus();
    });
    this.handleKeydown = event => this.onKeydown(event);
    this.handleFocus = event => {
      if (this.isOpen && !this.activeFocusRegion().contains(event.target)) this.focusFirst();
    };

    // Cargar entradas iniciales desde localStorage
    this.loadHistory();
  }

  /** Open a modal sheet without losing the background's existing state. */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.returnFocus = document.activeElement;
    this.previousOverflow = document.body.style.overflow;
    this.backgroundStates = [];
    // Handle both direct body placement and a drawer nested in a shell wrapper.
    let branch = this;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) continue;
        this.backgroundStates.push([sibling, sibling.hasAttribute('inert')]);
        sibling.setAttribute('inert', '');
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    this.overlay.hidden = false;
    this.container.hidden = false;
    this.overlay.classList.add('open');
    this.container.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('focusin', this.handleFocus);
    this.closeBtn.focus({ preventScroll: true });
  }

  /** Release focus and inert state exactly as they were before opening. */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleFocus);
    this.cancelClear(false);
    this.overlay.classList.remove('open');
    this.container.classList.remove('open');
    this.overlay.hidden = true;
    this.container.hidden = true;
    document.body.style.overflow = this.previousOverflow;
    for (const [element, wasInert] of this.backgroundStates) {
      if (!wasInert) element.removeAttribute('inert');
    }
    this.backgroundStates = [];
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
  }

  disconnectedCallback() {
    this.close();
  }

  requestClear() {
    if (!this.entries.length) return;
    this.confirmingClear = true;
    this.querySelector('#history-main').hidden = true;
    this.querySelector('.history-header').hidden = true;
    this.querySelector('#history-clear-confirmation').hidden = false;
    this.container.setAttribute('aria-labelledby', 'history-confirm-title');
    this.container.setAttribute('aria-describedby', 'history-confirm-description');
    this.querySelector('#history-cancel-clear-btn').focus({ preventScroll: true });
  }

  cancelClear(restoreFocus = true) {
    this.confirmingClear = false;
    this.querySelector('#history-clear-confirmation').hidden = true;
    this.querySelector('#history-main').hidden = false;
    this.querySelector('.history-header').hidden = false;
    this.container.setAttribute('aria-labelledby', 'history-title');
    this.container.removeAttribute('aria-describedby');
    if (restoreFocus) this.clearBtn.focus({ preventScroll: true });
  }

  activeFocusRegion() {
    return this.confirmingClear ? this.querySelector('#history-clear-confirmation') : this.container;
  }

  focusableElements() {
    return [...this.activeFocusRegion().querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')]
      .filter(element => !element.closest('[hidden], .hidden, [inert]'));
  }

  focusFirst() {
    (this.focusableElements()[0] || this.container).focus({ preventScroll: true });
  }

  onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.confirmingClear) this.cancelClear();
      else this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = this.focusableElements();
    const first = elements[0];
    const last = elements.at(-1);
    if (!first) {
      event.preventDefault();
      this.container.focus();
    } else if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Carga el historial de operaciones desde localStorage.
   * Si hay datos válidos, los parsea; de lo contrario inicializa un array vacío.
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem('grayscale-history');
      const parsed = stored ? JSON.parse(stored) : [];
      this.entries = Array.isArray(parsed) ? parsed.filter(isHistoryEntry).slice(0, 20) : [];
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

    const cards = document.createDocumentFragment();
    this.entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.setAttribute('role', 'listitem');
      // Only trusted, static markup is parsed as HTML. All external values are text.
      card.innerHTML = `
        <div class="history-card-header">
          <span class="history-badge"></span>
          <span class="history-time"></span>
        </div>
        <div class="history-card-title text-on-surface"></div>
        <div class="history-metrics-grid"></div>
      `;
      const badge = card.querySelector('.history-badge');
      const isEqualize = entry.type === 'equalize';
      badge.classList.add(isEqualize ? 'equalize' : 'expand');
      badge.textContent = isEqualize ? 'Ecualizar' : 'Expansión';
      card.querySelector('.history-time').textContent = entry.timestamp;
      const title = card.querySelector('.history-card-title');
      title.title = entry.filename;
      title.textContent = entry.filename;

      const grid = card.querySelector('.history-metrics-grid');
      for (const [key, label] of METRICS) {
        const column = document.createElement('div');
        column.className = 'history-metric-col';
        column.innerHTML = `
          <span class="history-metric-label"></span>
          <span class="history-metric-val text-on-surface"></span>
        `;
        column.querySelector('.history-metric-label').textContent = label;
        const change = document.createElement('span');
        change.className = 'history-metric-change';
        change.textContent = '→';
        column.querySelector('.history-metric-val').append(
          document.createTextNode(`${entry.metricsBefore[key]} `),
          change,
          document.createTextNode(` ${entry.metricsAfter[key]}`),
        );
        grid.appendChild(column);
      }
      cards.appendChild(card);
    });
    this.listContainer.replaceChildren(cards);
  }
}

customElements.define('history-drawer', HistoryDrawer);
