export class ErrorAlert extends HTMLElement {
  connectedCallback() {
    this.render();
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

  render() {
    this.innerHTML = `
      <div class="bg-error-container text-on-error-container rounded-lg p-sm flex items-center justify-between border border-error/20 mb-md shadow-sm">
        <div class="flex items-center gap-sm">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">error</span>
          <p id="error-message" class="font-body-sm font-medium">Color image detected. Please upload a grayscale image.</p>
        </div>
        <button id="btn-close" class="text-on-error-container hover:bg-error/10 p-xs rounded transition-colors">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    `;
  }
}

customElements.define('error-alert', ErrorAlert);
