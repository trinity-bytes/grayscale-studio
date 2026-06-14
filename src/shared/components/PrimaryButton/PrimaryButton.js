import html from './PrimaryButton.html?raw';
import './PrimaryButton.css';

/**
 * ==========================================
 * PRIMARY BUTTON (Shared Web Component)
 * ==========================================
 * Componente Web Component reutilizable para botones principales.
 * Soporta atributos para icono, texto y estado deshabilitado.
 * Se registra como elemento personalizado <primary-button>.
 *
 * Atributos observados:
 * - `disabled`: Deshabilita el botón y aplica estilos de opacidad
 * - `icon`: Texto del icono Material Symbols
 * - `text`: Texto del botón
 *
 * @module src/shared/components/PrimaryButton/PrimaryButton
 * @example
 * <primary-button icon="upload" text="Subir"></primary-button>
 * <primary-button disabled icon="save" text="Guardar"></primary-button>
 */
export class PrimaryButton extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template HTML y configura los atributos iniciales.
   */
  connectedCallback() {
    this.innerHTML = html;
    
    const icon = this.getAttribute('icon') || 'circle';
    const text = this.getAttribute('text') || 'Button';
    
    this.querySelector('.btn-icon').textContent = icon;
    this.querySelector('.btn-text').textContent = text;

    /** @type {HTMLButtonElement} Referencia al elemento button interno */
    this.buttonEl = this.querySelector('button');
  }

  /**
   * Define los atributos que el componente observa para reaccionar a cambios.
   * @returns {string[]} Lista de atributos observados
   */
  static get observedAttributes() {
    return ['disabled', 'icon', 'text'];
  }

  /**
   * Se ejecuta cuando un atributo observado cambia de valor.
   * Actualiza el DOM del botón según el atributo modificado.
   * @param {string} name - Nombre del atributo que cambió
   * @param {string|null} oldValue - Valor anterior del atributo
   * @param {string|null} newValue - Nuevo valor del atributo
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.buttonEl) return;
    
    if (name === 'disabled') {
      if (newValue !== null) {
        this.buttonEl.setAttribute('disabled', 'true');
        this.buttonEl.classList.add('opacity-50', 'cursor-not-allowed');
        this.buttonEl.classList.remove('hover:bg-primary-container');
      } else {
        this.buttonEl.removeAttribute('disabled');
        this.buttonEl.classList.remove('opacity-50', 'cursor-not-allowed');
        this.buttonEl.classList.add('hover:bg-primary-container');
      }
    } else if (name === 'icon') {
      this.querySelector('.btn-icon').textContent = newValue;
    } else if (name === 'text') {
      this.querySelector('.btn-text').textContent = newValue;
    }
  }

  /**
   * Setter programático para el estado deshabilitado.
   * @param {boolean} val - `true` para deshabilitar, `false` para habilitar
   */
  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  /**
   * Getter programático para el estado deshabilitado.
   * @returns {boolean} `true` si el botón está deshabilitado
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }
}

customElements.define('primary-button', PrimaryButton);
