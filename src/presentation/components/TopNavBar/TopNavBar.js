import html from './TopNavBar.html?raw';
import './TopNavBar.css';

export class TopNavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
  }

  setWasmStatus(status) {
    const statusText = this.querySelector('#wasm-status-text');
    const statusDot = this.querySelector('#wasm-status-dot');
    
    if (status === 'Ready') {
      statusText.textContent = 'WASM: Ready';
      statusDot.className = 'size-2 rounded-full bg-primary block';
      this.querySelector('#wasm-badge').className = 'px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-data-mono flex items-center gap-xs';
    } else {
      statusText.textContent = 'WASM: Loading';
      statusDot.className = 'size-2 rounded-full bg-secondary block animate-pulse';
      this.querySelector('#wasm-badge').className = 'px-sm py-xs bg-surface-variant text-on-surface-variant rounded-full text-xs font-data-mono flex items-center gap-xs';
    }
  }
}

customElements.define('top-nav-bar', TopNavBar);
