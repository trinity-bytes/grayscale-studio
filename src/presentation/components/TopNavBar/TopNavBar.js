import html from './TopNavBar.html?raw';
import './TopNavBar.css';
import { ThemeManager } from '../../../shared/utils/ThemeManager.js';
import { strings } from '../../../shared/i18n/strings.js';

/**
 * ==========================================
 * TOP NAV BAR (Presentation Component)
 * ==========================================
 * Componente Web Component que renderiza la barra de navegación superior.
 * Contiene enlaces de navegación (Espacio de Trabajo, Análisis, Historial),
 * botón de alternar tema claro/oscuro e indicador de estado de WASM.
 * Despacha eventos personalizados para la navegación entre secciones.
 * Se registra como elemento personalizado <top-nav-bar>.
 *
 * @module src/presentation/components/TopNavBar/TopNavBar
 */
export class TopNavBar extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template, sincroniza el ícono del tema y vincula eventos.
   */
  connectedCallback() {
    this.innerHTML = html;
    this._syncThemeIcon();

    // Botón de alternar tema
    this.querySelector('#theme-toggle').addEventListener('click', () => {
      ThemeManager.toggle();
      this._syncThemeIcon();
    });

    // Navegación: Espacio de Trabajo
    this.querySelector('#nav-workspace').addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-workspace', { bubbles: true, composed: true }));
    });

    // Navegación: Análisis
    this.querySelector('#nav-analysis').addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-analysis', { bubbles: true, composed: true }));
    });

    // Navegación: Historial
    this.querySelector('#nav-history').addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-history', { bubbles: true, composed: true }));
    });
  }

  /**
   * Sincroniza la visibilidad de los íconos de sol/luna según el tema actual.
   */
  _syncThemeIcon() {
    const sun = this.querySelector('#theme-icon-sun');
    const moon = this.querySelector('#theme-icon-moon');
    if (ThemeManager.isDark()) {
      sun.classList.add('hidden');
      moon.classList.remove('hidden');
    } else {
      sun.classList.remove('hidden');
      moon.classList.add('hidden');
    }
  }

  /**
   * Actualiza el indicador de estado de WASM (WebAssembly/OpenCV).
   * @param {string} status - Estado del WASM: 'Ready' (listo) o cualquier otro valor (cargando)
   */
  setWasmStatus(status) {
    const statusText = this.querySelector('#wasm-status-text');
    const statusDot = this.querySelector('#wasm-status-dot');
    
    if (status === 'Ready') {
      statusText.textContent = strings.nav.wasmReady;
      statusDot.className = 'size-2 rounded-full bg-primary block';
      this.querySelector('#wasm-badge').className = 'px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-data-mono flex items-center gap-xs';
    } else {
      statusText.textContent = strings.nav.wasmLoading;
      statusDot.className = 'size-2 rounded-full bg-secondary block animate-pulse';
      this.querySelector('#wasm-badge').className = 'px-sm py-xs bg-surface-variant text-on-surface-variant rounded-full text-xs font-data-mono flex items-center gap-xs';
    }
  }
}

customElements.define('top-nav-bar', TopNavBar);
