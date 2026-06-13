import html from './WorkspaceDropZone.html?raw';
import './WorkspaceDropZone.css';
import '../../../shared/components/EmptyState/EmptyState.js';

export class WorkspaceDropZone extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    const dropZone = this.querySelector('#drop-area');
    const fileInput = this.querySelector('#file-input');
    const dropHint = this.querySelector('#drop-hint-text');
    const placeholder = this.querySelector('#placeholder-content');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-primary');
        dropZone.classList.remove('border-outline-variant');
        dropZone.classList.add('bg-primary/5');
        dropHint.classList.remove('hidden');
        placeholder.style.opacity = '0.6';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-primary');
        dropZone.classList.add('border-outline-variant');
        dropZone.classList.remove('bg-primary/5');
        dropHint.classList.add('hidden');
        placeholder.style.opacity = '';
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        const file = files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          this.showError('Only JPEG and PNG images are accepted.');
          return;
        }
        this.emitFile(file);
      }
    }, false);

    this.querySelector('#btn-browse').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.emitFile(e.target.files[0]);
      }
    });
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  emitFile(file) {
    this.dispatchEvent(new CustomEvent('on-image-selected', {
      bubbles: true,
      composed: true,
      detail: { file }
    }));
  }

  showError(message) {
    this.dispatchEvent(new CustomEvent('on-error', {
      bubbles: true,
      composed: true,
      detail: { message }
    }));
  }

  showCanvas() {
    this.querySelector('#placeholder-content').classList.add('hidden');
    this.querySelector('#canvas-container').classList.remove('hidden');
  }

  showPlaceholder() {
    this.querySelector('#placeholder-content').classList.remove('hidden');
    this.querySelector('#canvas-container').classList.add('hidden');
  }

  getCanvas() {
    return this.querySelector('#main-canvas');
  }
}

customElements.define('workspace-drop-zone', WorkspaceDropZone);
