import html from './TopNavBar.html?raw';
import './TopNavBar.css';

export class TopNavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.querySelector('#nav-history').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-show-history', { bubbles: true, composed: true }));
    });
    this.querySelector('#nav-workspace').addEventListener('click', event => {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent('on-show-workspace', { bubbles: true, composed: true }));
    });
  }
  setWasmStatus(status) {
    this.querySelector('#wasm-status-text').textContent = status === 'Ready' ? 'Listo' : 'Cargando motor…';
  }
}
customElements.define('top-nav-bar', TopNavBar);
