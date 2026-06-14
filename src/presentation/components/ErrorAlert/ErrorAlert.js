import html from './ErrorAlert.html?raw';
import './ErrorAlert.css';

/**
 * ==========================================
 * ERROR ALERT (Presentation Component)
 * ==========================================
 * Componente Web Component que muestra alertas de error al usuario.
 * Se registra como elemento personalizado <error-alert>.
 * Permite mostrar y ocultar mensajes de error con un botón de cierre.
 *
 * @module src/presentation/components/ErrorAlert/ErrorAlert
 * @example
 * <error-alert id="main-error-alert"></error-alert>
 */
export class ErrorAlert extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template, vincula eventos y se oculta inicialmente.
   */
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
    this.hide();
  }

  /**
   * Vincula el evento de clic del botón de cierre para ocultar la alerta.
   */
  bindEvents() {
    this.querySelector('#btn-close').addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Muestra la alerta de error con el mensaje especificado.
   * @param {string} message - Mensaje de error a mostrar al usuario
   */
  show(message) {
    this.querySelector('#error-message').textContent = message;
    this.classList.remove('hidden');
    this.querySelector('#btn-close').focus();
  }

  /**
   * Oculta la alerta de error.
   */
  hide() {
    this.classList.add('hidden');
  }
}

customElements.define('error-alert', ErrorAlert);
