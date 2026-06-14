import html from './TopNavBar.html?raw';
import './TopNavBar.css';
import { ThemeManager } from '../../../shared/utils/ThemeManager.js';
import { strings } from '../../../shared/i18n/strings.js';

export class TopNavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this._syncThemeIcon();

    this.querySelector('#theme-toggle').addEventListener('click', () => {
      ThemeManager.toggle();
      this._syncThemeIcon();
    });

    this.querySelector('#nav-workspace').addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-workspace', { bubbles: true, composed: true }));
    });

    this.querySelector('#nav-analysis').addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-analysis', { bubbles: true, composed: true }));
    });

    this.querySelector('#nav-history').addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-history', { bubbles: true, composed: true }));
    });
  }

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
