import html from './WorkspaceDropZone.html?raw';
import './WorkspaceDropZone.css';
import { strings } from '../../../shared/i18n/strings.js';

/** Owns document controls, image canvases and their associated frequency panels. */
export class WorkspaceDropZone extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.operation = 'equalize';
    this.processed = false;
    this.applyRevision = 0;
    this.hideMetrics('original-metrics');
    this.hideMetrics('result-metrics');
    this.bindEvents();
  }

  bindEvents() {
    const input = this.querySelector('#file-input');
    for (const id of ['btn-browse', 'btn-replace']) {
      this.querySelector(`#${id}`).addEventListener('click', () => input.click());
    }
    input.addEventListener('change', () => {
      if (input.files.length) this.emitFile(input.files[0]);
      input.value = '';
    });
    for (const [id, operation] of [['btn-equalize', 'equalize'], ['btn-expand', 'expand']]) {
      this.querySelector(`#${id}`).addEventListener('click', () => this.selectOperation(operation));
    }
    this.querySelector('#btn-apply').addEventListener('click', () => {
      const revision = ++this.applyRevision;
      const operation = this.operation;
      this.setAttribute('aria-busy', 'true');
      this.querySelector('#btn-apply').disabled = true;
      this.querySelector('#btn-apply').textContent = 'Procesando…';
      this.querySelector('#btn-equalize').disabled = true;
      this.querySelector('#btn-expand').disabled = true;
      this.dispatchEvent(new CustomEvent('on-processing-started', { bubbles: true, detail: { operation } }));
      // Two frames let the pending state paint before synchronous native processing.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revision !== this.applyRevision || !this.isConnected) return;
        this.dispatchEvent(new CustomEvent(`on-${operation}`, { bubbles: true, composed: true }));
        this.finishProcessing();
      }));
    });
    this.querySelector('#btn-show-math').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-show-math', { bubbles: true, composed: true }));
    });
    const zone = this.querySelector('#drop-area');
    for (const name of ['dragenter', 'dragover', 'dragleave', 'drop']) {
      zone.addEventListener(name, event => {
        event.preventDefault(); event.stopPropagation();
        zone.classList.toggle('is-dragging', name === 'dragenter' || name === 'dragover');
      });
    }
    zone.addEventListener('drop', event => {
      const file = event.dataTransfer?.files[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        this.showError(strings.dropzone.invalidType); return;
      }
      this.emitFile(file);
    });
  }

  finishProcessing() {
    this.removeAttribute('aria-busy');
    this.querySelector('#btn-apply').textContent = 'Aplicar';
    this.querySelector('#btn-apply').disabled = this.getCanvas().hidden;
    this.querySelector('#btn-equalize').disabled = false;
    this.querySelector('#btn-expand').disabled = false;
  }

  disconnectedCallback() { this.applyRevision++; }

  selectOperation(operation) {
    this.operation = operation;
    this.querySelector('#btn-equalize').setAttribute('aria-pressed', String(operation === 'equalize'));
    this.querySelector('#btn-expand').setAttribute('aria-pressed', String(operation === 'expand'));
    this.dispatchEvent(new CustomEvent('on-operation-selected', { bubbles: true, detail: { operation } }));
  }

  setView(calculation) {
    if (calculation) document.getElementById('analysis-panel')?.scrollIntoView({ block: 'start' });
  }

  emitFile(file) {
    this.setDocument(file);
    this.dispatchEvent(new CustomEvent('on-image-selected', { bubbles: true, composed: true, detail: { file } }));
  }

  setDocument(file) {
    this.filename = file?.name || 'Sin imagen';
    this.querySelector('#document-name').textContent = this.filename;
    this.querySelector('#file-caption').textContent = this.filename;
    this.querySelector('#document-meta').textContent = 'Cargando imagen…';
    this.setAttribute('aria-busy', 'true');
  }

  setMetadata(width, height) {
    const total = width * height;
    this.querySelector('#document-meta').textContent = `${width} × ${height} · 8 bits · 1 canal`;
    this.querySelector('#pixel-caption').textContent = `${total.toLocaleString('es')} píxeles`;
    this.querySelectorAll('.pixel-count').forEach(el => { el.textContent = `${total.toLocaleString('es')} px`; });
    this.querySelector('#btn-replace').textContent = 'Reemplazar';
    this.removeAttribute('aria-busy');
  }

  showError(message) {
    this.dispatchEvent(new CustomEvent('on-error', { bubbles: true, composed: true, detail: { message } }));
  }
  getCanvas() { return this.querySelector('#main-canvas'); }
  getProcessedCanvas() { return this.querySelector('#processed-canvas'); }
  getOriginalCanvas() { return this.querySelector('#original-histogram-canvas'); }
  getResultCanvas() { return this.querySelector('#result-histogram-canvas'); }
  showCanvas() {
    this.querySelector('#placeholder-content').hidden = true;
    this.querySelector('#original-placeholder').hidden = true;
    this.getCanvas().hidden = false;
  }
  showPlaceholder() {
    this.applyRevision++;
    this.finishProcessing();
    this.disableToolbarButtons();
    this.querySelector('#placeholder-content').hidden = false;
    this.querySelector('#original-placeholder').hidden = false;
    this.getCanvas().hidden = true;
    this.querySelector('#document-meta').textContent = 'PNG o JPG · Escala de grises';
    this.querySelector('#pixel-caption').textContent = '— píxeles';
    this.querySelectorAll('.pixel-count').forEach(el => { el.textContent = '— px'; });
    this.removeAttribute('aria-busy');
    this.hideHistogramContainers(); this.hideProcessedCanvas();
  }
  showProcessedCanvas() {
    this.processed = true;
    this.getProcessedCanvas().hidden = false;
    this.querySelector('#result-placeholder').hidden = true;
  }
  hideProcessedCanvas() {
    this.processed = false;
    this.getProcessedCanvas().hidden = true;
    this.querySelector('#result-placeholder').hidden = false;
    this.querySelector('#result-title').textContent = 'Resultado';
    this.hideResultHistogram(); this.hideMetrics('result-metrics');
  }
  setResultOperation(operation) {
    if (this.processed) this.querySelector('#result-title').textContent = operation === 'expand' ? 'Expansión' : 'Ecualización';
  }
  resetToOriginal() {
    this.applyRevision++;
    this.removeAttribute('aria-busy');
    this.querySelector('#btn-apply').textContent = 'Aplicar';
    this.querySelector('#btn-equalize').disabled = false;
    this.querySelector('#btn-expand').disabled = false;
    this.hideProcessedCanvas(); this.hideMathButton();
  }
  showToolbar() {}
  hideToolbar() {}
  enableToolbarButtons() { this.querySelector('#btn-apply').disabled = false; }
  disableToolbarButtons() { this.querySelector('#btn-apply').disabled = true; }
  showMathButton() { this.querySelector('#btn-show-math').classList.remove('hidden'); }
  hideMathButton() { this.querySelector('#btn-show-math').classList.add('hidden'); }
  showMetrics(id, metrics) {
    const container = this.querySelector(`#${id}`);
    container.replaceChildren();
    for (const [label, value] of [['Mín.', metrics.min], ['Máx.', metrics.max], ['Media', metrics.mean], ['σ', metrics.std]]) {
      const item = document.createElement('div'); item.className = 'metric-item';
      const name = document.createElement('span'); name.className = 'metric-label'; name.textContent = label;
      const number = document.createElement('span'); number.className = 'metric-value';
      number.textContent = typeof value === 'number' ? value.toLocaleString('es', { maximumFractionDigits: 2 }) : value;
      item.append(name, number); container.append(item);
    }
  }
  hideMetrics(id) { this.showMetrics(id, { min: '—', max: '—', mean: '—', std: '—' }); }
  showHistogramContainers() { this.querySelector('#original-pane').classList.add('has-histogram'); }
  hideHistogramContainers() { this.querySelectorAll('.image-pane').forEach(el => el.classList.remove('has-histogram')); }
  showResultHistogram() { this.querySelector('#result-pane').classList.add('has-histogram'); }
  hideResultHistogram() { this.querySelector('#result-pane').classList.remove('has-histogram'); }
}
customElements.define('workspace-drop-zone', WorkspaceDropZone);
