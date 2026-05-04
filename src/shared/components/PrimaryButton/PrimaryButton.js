import html from './PrimaryButton.html?raw';
import './PrimaryButton.css';

export class PrimaryButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    
    const icon = this.getAttribute('icon') || 'circle';
    const text = this.getAttribute('text') || 'Button';
    
    this.querySelector('.btn-icon').textContent = icon;
    this.querySelector('.btn-text').textContent = text;

    this.buttonEl = this.querySelector('button');
  }

  static get observedAttributes() {
    return ['disabled', 'icon', 'text'];
  }

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

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }
}

customElements.define('primary-button', PrimaryButton);
