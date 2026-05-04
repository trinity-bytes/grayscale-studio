export class ImageInfoPanel extends HTMLElement {
  connectedCallback() {
    this.render();
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

  render() {
    this.innerHTML = `
      <div class="glass-panel rounded-lg p-md flex flex-col gap-sm">
        <div class="flex items-center gap-sm border-b border-outline-variant pb-sm">
          <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 0;">info</span>
          <h3 class="font-headline-md text-base">Image Info</h3>
        </div>
        <div class="flex flex-col gap-xs font-data-mono text-sm text-on-surface-variant">
          <div class="flex justify-between">
            <span>Resolution</span>
            <span id="res-val" class="text-on-surface font-medium">-</span>
          </div>
          <div class="flex justify-between">
            <span>Channels</span>
            <span id="chan-val" class="text-on-surface font-medium">-</span>
          </div>
          <div class="flex justify-between">
            <span>Bit Depth</span>
            <span id="bit-val" class="text-on-surface font-medium">-</span>
          </div>
          <div class="flex justify-between">
            <span>Format</span>
            <span id="fmt-val" class="text-on-surface font-medium">-</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('image-info-panel', ImageInfoPanel);
