import './EmptyState.css';

/**
 * ==========================================
 * EMPTY STATE (Shared Web Component)
 * ==========================================
 * Componente Web Component para mostrar estados vacíos o placeholders
 * cuando no hay datos disponibles. Preserva los hijos sloteados (botones,
 * enlaces, etc.) y los renderiza después de la descripción.
 * Se registra como elemento personalizado <empty-state>.
 *
 * Atributos observados:
 * - `icon`: Nombre del icono Material Symbols a mostrar
 * - `text`: Texto principal del estado vacío
 * - `description`: Descripción secundaria
 *
 * @module src/shared/components/EmptyState/EmptyState
 * @example
 * <empty-state icon="cloud_upload" title="Subir" description="Arrastra aquí">
 *   <button>Explorar</button>
 * </empty-state>
 */
export class EmptyState extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Construye la estructura del estado vacío preservando los hijos sloteados.
   */
  connectedCallback() {
    // Guardar hijos sloteados ANTES de setting innerHTML (innerHTML los destruye)
    const slottedChildren = [...this.childNodes];

    this.classList.add('empty-state-root');

    // Construir template manualmente (sin innerHTML — preserva hijos)
    this.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center justify-center gap-sm py-lg text-center';

    // Icono
    const iconEl = document.createElement('span');
    iconEl.className = 'material-symbols-outlined text-[40px] text-secondary empty-icon';
    iconEl.style.fontVariationSettings = "'FILL' 0";
    const icon = this.getAttribute('icon');
    if (icon) {
      iconEl.textContent = icon;
    } else {
      iconEl.style.display = 'none';
    }
    wrapper.appendChild(iconEl);

    // Título
    const titleEl = document.createElement('h3');
    titleEl.className = 'font-headline-md text-base text-on-surface empty-title';
    titleEl.textContent = this.getAttribute('title') || '';
    wrapper.appendChild(titleEl);

    // Descripción
    const descEl = document.createElement('p');
    descEl.className = 'font-body-sm text-on-surface-variant max-w-[260px] empty-desc';
    descEl.textContent = this.getAttribute('description') || '';
    wrapper.appendChild(descEl);

    // Re-insertar hijos sloteados (botones, enlaces, etc.)
    slottedChildren.forEach(child => wrapper.appendChild(child));

    this.appendChild(wrapper);
  }

  /**
   * Define los atributos que el componente observa para reaccionar a cambios.
   * @returns {string[]} Lista de atributos observados
   */
  static get observedAttributes() {
    return ['icon', 'title', 'description'];
  }

  /**
   * Se ejecuta cuando un atributo observado cambia de valor.
   * Actualiza dinámicamente el contenido del componente sin reconstruir todo el DOM.
   * @param {string} name - Nombre del atributo que cambió
   * @param {string|null} oldValue - Valor anterior del atributo
   * @param {string|null} newValue - Nuevo valor del atributo
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    if (name === 'icon') {
      const iconEl = this.querySelector('.empty-icon');
      if (iconEl) {
        if (newValue) {
          iconEl.textContent = newValue;
          iconEl.style.display = '';
        } else {
          iconEl.style.display = 'none';
        }
      }
    } else if (name === 'title') {
      const titleEl = this.querySelector('.empty-title');
      if (titleEl) titleEl.textContent = newValue || '';
    } else if (name === 'description') {
      const descEl = this.querySelector('.empty-desc');
      if (descEl) descEl.textContent = newValue || '';
    }
  }
}

customElements.define('empty-state', EmptyState);
