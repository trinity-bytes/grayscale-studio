import html from './ImageInfoPanel.html?raw';
import './ImageInfoPanel.css';

export class ImageInfoPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
  }

  updateInfo(resolution, channels, bitDepth, format) {
    this.querySelector('#res-val').textContent = resolution || '-';
    this.querySelector('#chan-val').textContent = channels || '-';
    this.querySelector('#bit-val').textContent = bitDepth || '-';
    this.querySelector('#fmt-val').textContent = format || '-';
  }

  clear() {
    this.updateInfo('-', '-', '-', '-');
  }
}

customElements.define('image-info-panel', ImageInfoPanel);
