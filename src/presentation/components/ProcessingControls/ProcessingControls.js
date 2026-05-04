import html from './ProcessingControls.html?raw';
import './ProcessingControls.css';
import '../../../shared/components/PrimaryButton/PrimaryButton.js';

export class ProcessingControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
    this.disable(); // Disabled by default until image is loaded
  }

  bindEvents() {
    this.querySelector('#btn-equalize').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-equalize', { bubbles: true, composed: true }));
    });

    this.querySelector('#btn-expand').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-expand', { bubbles: true, composed: true }));
    });
  }

  enable() {
    this.querySelectorAll('primary-button').forEach(btn => {
      btn.removeAttribute('disabled');
    });
  }

  disable() {
    this.querySelectorAll('primary-button').forEach(btn => {
      btn.setAttribute('disabled', 'true');
    });
  }
}

customElements.define('processing-controls', ProcessingControls);
