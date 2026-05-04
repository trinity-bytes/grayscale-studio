export class ProcessingControls extends HTMLElement {
  connectedCallback() {
    this.render();
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
    this.querySelectorAll('button').forEach(btn => {
      btn.removeAttribute('disabled');
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.classList.add('hover:bg-primary-container');
    });
  }

  disable() {
    this.querySelectorAll('button').forEach(btn => {
      btn.setAttribute('disabled', 'true');
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      btn.classList.remove('hover:bg-primary-container');
    });
  }

  render() {
    this.innerHTML = `
      <div class="glass-panel rounded-lg p-md flex flex-col gap-sm">
        <div class="flex items-center gap-sm border-b border-outline-variant pb-sm">
          <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 0;">tune</span>
          <h3 class="font-headline-md text-base">Processing Controls</h3>
        </div>
        <div class="flex flex-col gap-sm pt-xs">
          <button id="btn-equalize" class="bg-primary text-on-primary font-label-caps py-sm px-md rounded transition-colors shadow-sm flex items-center justify-center gap-sm w-full">
            <span class="material-symbols-outlined text-[18px]">equalizer</span>
            Ecualizar Histograma
          </button>
          <button id="btn-expand" class="bg-primary text-on-primary font-label-caps py-sm px-md rounded transition-colors shadow-sm flex items-center justify-center gap-sm w-full">
            <span class="material-symbols-outlined text-[18px]">expand</span>
            Expansión Min-Max
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('processing-controls', ProcessingControls);
