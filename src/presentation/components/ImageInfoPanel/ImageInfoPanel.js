import html from './ImageInfoPanel.html?raw';
import './ImageInfoPanel.css';
import '../../../shared/components/EmptyState/EmptyState.js';

export class ImageInfoPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
  }

  updateInfo(resolution, channels, bitDepth, format) {
    this.querySelector('#res-val').textContent = resolution || '-';
    this.querySelector('#chan-val').textContent = channels || '-';
    this.querySelector('#bit-val').textContent = bitDepth || '-';
    this.querySelector('#fmt-val').textContent = format || '-';

    const allDashes = [resolution, channels, bitDepth, format].every(v => !v || v === '-');
    const emptyState = this.querySelector('#info-empty-state');
    const infoContent = this.querySelector('#info-content');

    if (allDashes) {
      emptyState.hidden = false;
      infoContent.hidden = true;
    } else {
      emptyState.hidden = true;
      infoContent.hidden = false;
    }
  }

  clear() {
    this.updateInfo('-', '-', '-', '-');
  }
}

customElements.define('image-info-panel', ImageInfoPanel);
