export class WorkspaceDropZone extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    const dropZone = this.querySelector('#drop-area');
    const fileInput = this.querySelector('#file-input');

    // Drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

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

    // Click event
    this.querySelector('#btn-browse').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.emitFile(e.target.files[0]);
      }
    });
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

  render() {
    this.innerHTML = `
      <div id="drop-area" class="glass-panel rounded-lg flex-1 border-2 border-dashed border-outline-variant flex flex-col items-center justify-center relative overflow-hidden group transition-colors">
        
        <!-- Placeholder Content -->
        <div id="placeholder-content" class="flex flex-col items-center gap-sm text-center p-xl z-10">
          <span class="material-symbols-outlined text-[48px] text-secondary mb-sm group-hover:text-primary transition-colors" style="font-variation-settings: 'FILL' 0;">cloud_upload</span>
          <h2 class="font-headline-md text-xl text-on-surface">Upload Image</h2>
          <p class="font-body-sm text-on-surface-variant max-w-[280px]">Drop your grayscale image here, or click to browse files.</p>
          <button id="btn-browse" class="glass-sub-panel border-outline-variant text-on-surface font-label-caps py-sm px-lg rounded mt-sm hover:bg-surface-variant transition-colors">
            Browse Files
          </button>
          <input type="file" id="file-input" class="hidden" accept="image/jpeg, image/png, image/jpg" />
        </div>

        <!-- Canvas Container (Hidden by default) -->
        <div id="canvas-container" class="hidden w-full h-full flex items-center justify-center p-sm z-10 relative">
           <canvas id="main-canvas" class="max-w-full max-h-full object-contain shadow-lg rounded"></canvas>
        </div>

        <!-- Background subtle gradient to indicate dropzone -->
        <div class="absolute inset-0 bg-gradient-to-br from-surface-bright/50 to-surface-variant/20 z-0"></div>
      </div>
    `;
  }
}

customElements.define('workspace-drop-zone', WorkspaceDropZone);
