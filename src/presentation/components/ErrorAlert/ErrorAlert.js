import html from './ErrorAlert.html?raw';
import './ErrorAlert.css';

export class ErrorAlert extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
    this.hide();
  }

  bindEvents() {
    this.querySelector('#btn-close').addEventListener('click', () => {
      this.hide();
    });
  }

  show(message) {
    this.querySelector('#error-message').textContent = message;
    this.classList.remove('hidden');
  }

  hide() {
    this.classList.add('hidden');
  }
}

customElements.define('error-alert', ErrorAlert);
