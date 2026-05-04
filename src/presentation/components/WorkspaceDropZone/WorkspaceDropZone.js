import html from './WorkspaceDropZone.html?raw';
import './WorkspaceDropZone.css';

export class WorkspaceDropZone extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    const dropZone = this.querySelector('#drop-area');
    const fileInput = this.querySelector('#file-input');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-primary');
        dropZone.classList.remove('border-outline-variant');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-primary');
        dropZone.classList.add('border-outline-variant');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        this.emitFile(files[0]);
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
