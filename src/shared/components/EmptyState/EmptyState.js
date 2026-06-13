import html from './EmptyState.html?raw';
import './EmptyState.css';

export class EmptyState extends HTMLElement {
  connectedCallback() {
    this.classList.add('empty-state-root');
    this.innerHTML = html;

    const icon = this.getAttribute('icon');
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';

    const iconEl = this.querySelector('.empty-icon');
    if (icon) {
      iconEl.textContent = icon;
    } else {
      iconEl.style.display = 'none';
    }

    this.querySelector('.empty-title').textContent = title;
    this.querySelector('.empty-desc').textContent = description;
  }

  static get observedAttributes() {
    return ['icon', 'title', 'description'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    if (name === 'icon') {
      const iconEl = this.querySelector('.empty-icon');
      if (newValue) {
        iconEl.textContent = newValue;
        iconEl.style.display = '';
      } else {
        iconEl.style.display = 'none';
      }
    } else if (name === 'title') {
      this.querySelector('.empty-title').textContent = newValue || '';
    } else if (name === 'description') {
      this.querySelector('.empty-desc').textContent = newValue || '';
    }
  }
}

customElements.define('empty-state', EmptyState);
