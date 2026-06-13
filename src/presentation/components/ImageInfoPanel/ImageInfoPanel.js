import html from './ImageInfoPanel.html?raw';
import './ImageInfoPanel.css';
import '../../../shared/components/EmptyState/EmptyState.js';

export class ImageInfoPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;

    // Browse button dispatches on-image-selected via parent workspace
    const browseBtn = this.querySelector('#btn-browse-info');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        // Find the workspace file input
        const workspace = document.getElementById('main-workspace');
        if (workspace) {
          const fileInput = workspace.querySelector('#file-input');
          if (fileInput) fileInput.click();
        }
      });
    }
  }

  updateInfo(resolution, channels, bitDepth, format) {
    this.querySelector('#res-val').textContent = resolution || '-';
    this.querySelector('#chan-val').textContent = channels || '-';
    this.querySelector('#bit-val').textContent = bitDepth || '-';
    this.querySelector('#fmt-val').textContent = format || '-';

    const allDashes = [resolution, channels, bitDepth, format].every(v => !v || v === '-');
    const emptyState = this.querySelector('#info-empty-state');
    const infoContent = this.querySelector('#info-content');
    const browseBtn = this.querySelector('#btn-browse-info');

    if (allDashes) {
      emptyState.hidden = false;
      infoContent.hidden = true;
      if (browseBtn) browseBtn.classList.add('hidden');
    } else {
      emptyState.hidden = true;
      infoContent.hidden = false;
      if (browseBtn) browseBtn.classList.remove('hidden');
    }
  }

  setThumbnail(dataUrl) {
    const container = this.querySelector('#thumbnail-container');
    const canvas = this.querySelector('#thumbnail-canvas');
    if (!container || !canvas) return;

    if (!dataUrl) {
      container.classList.add('hidden');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        container.classList.add('hidden');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        // Scale down to max 120px wide
        const maxW = 120;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        container.classList.remove('hidden');
      };
      img.src = URL.createObjectURL(blob);
    }, 'image/png');
  }

  clear() {
    this.updateInfo('-', '-', '-', '-');
    const container = this.querySelector('#thumbnail-container');
    if (container) container.classList.add('hidden');
    const browseBtn = this.querySelector('#btn-browse-info');
    if (browseBtn) browseBtn.classList.add('hidden');
  }
}

customElements.define('image-info-panel', ImageInfoPanel);
