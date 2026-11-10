import { HistogramMath } from '../../../domain/models/HistogramMath.js';
import { HistogramModel } from '../../../domain/models/HistogramModel.js';
import html from './AnalysisPanel.html?raw';
import './AnalysisPanel.css';

const decimal = (value, digits = 6) => value.toLocaleString('es', { maximumFractionDigits: digits });

/** Compact inspection of existing domain values; never implements a second transform. */
export class AnalysisPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.operation = 'equalize'; this.intensity = 128; this.expanded = false;
    this.mappings = {};
    this.querySelector('#intensity-input').addEventListener('input', event => this.selectIntensity(Number(event.target.value)));
    this.querySelector('#inspect-lut').addEventListener('click', () => {
      this.expanded = !this.expanded; this.renderSelection();
    });
    this.selectOperation('equalize');
  }

  getMathEqCanvas() { return this.querySelector('#math-eq-canvas'); }
  getMathExpCanvas() { return this.querySelector('#math-exp-canvas'); }
  switchToVisualTab() { /* The calculation rail stays visible beside the image pair. */ }
  switchToMathEqTab() { this.selectOperation('equalize'); }
  switchToMathExpTab() { this.selectOperation('expand'); }
  hideEmptyStates() { this.classList.add('has-calculation'); }
  showEmptyStates() {
    this.math = null; this.mappings = {}; this.expanded = false;
    this.classList.remove('has-calculation'); this.renderSelection();
  }

  selectOperation(operation) {
    this.operation = operation;
    const equalization = operation === 'equalize';
    this.querySelector('#formula-name').textContent = equalization ? 'Ecualización' : 'Expansión';
    this.querySelector('#inspector-kind').textContent = equalization ? 'CDF / LUT' : 'Min–Max / LUT';
    this.querySelector('#mapping-formula').innerHTML = equalization
      ? '<span>s = Q8(255 ×</span><span class="fraction"><span>CDF(r) − CDFmin</span><span>1 − CDFmin</span></span><span>)</span>'
      : '<span>s = Q8(255 ×</span><span class="fraction"><span>r − mín.</span><span>máx. − mín.</span></span><span>)</span>';
    this.querySelector('#eq-chart-block').hidden = !equalization;
    this.querySelector('#exp-chart-block').hidden = equalization;
    this.renderSelection();
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  showEqualizationTable(frequencies, lut) { this.setData(frequencies, lut, 'equalize'); }
  showExpansionProcedure(frequencies, lut) { this.setData(frequencies, lut, 'expand'); }

  setData(frequencies, lut, operation) {
    this.math = new HistogramMath(new HistogramModel(frequencies));
    this.mappings[operation] = lut;
    if (this.math.totalPixels && !this.hasSelection) {
      this.intensity = frequencies.findIndex((count, index) => count && this.math.cdf[index] >= 0.5);
      if (this.intensity < 0) this.intensity = frequencies.findIndex(count => count > 0);
    }
    this.hideEmptyStates(); this.renderSelection();
  }

  selectIntensity(value) {
    if (!Number.isFinite(value)) return;
    this.intensity = Math.min(255, Math.max(0, Math.round(value)));
    this.hasSelection = true; this.renderSelection();
  }

  renderSelection() {
    const math = this.math;
    const lut = this.mappings[this.operation];
    const available = Boolean(math?.totalPixels && lut);
    const range = this.querySelector('#intensity-input');
    range.disabled = !available; range.value = this.intensity;
    this.querySelector('#inspect-lut').disabled = !available;
    this.querySelector('#selected-input').textContent = available ? this.intensity : '—';
    this.querySelector('#selected-output').textContent = available ? lut[this.intensity] : '—';
    for (const canvas of [this.getMathEqCanvas(), this.getMathExpCanvas()]) {
      if (available) canvas.dataset.selectedIntensity = this.intensity;
      else delete canvas.dataset.selectedIntensity;
      canvas.dispatchEvent(new Event('on-inspection-changed'));
    }
    const constants = this.querySelector('#algorithm-constants');
    const substitution = this.querySelector('#numeric-substitution');
    const body = this.querySelector('#lut-body'); body.replaceChildren();
    const toggle = this.querySelector('#inspect-lut');
    toggle.setAttribute('aria-expanded', String(this.expanded));
    toggle.textContent = this.expanded ? 'Volver al detalle' : 'Inspeccionar LUT';
    this.querySelector('#lut-container').classList.toggle('expanded', this.expanded);
    if (!available) {
      constants.textContent = 'N = — · CDFmin = —';
      substitution.textContent = 'Carga una imagen para inspeccionar sus valores.';
      this.querySelector('#lut-caption').textContent = 'Sin datos';
      return;
    }
    const { min, max, scale, shift } = math.getExpansionData();
    const firstCount = math.frequencies[min];
    if (this.operation === 'equalize') {
      constants.textContent = `N = ${math.totalPixels} · CDFmin = ${decimal(firstCount / math.totalPixels)}`;
      const cumulative = math.frequencies.slice(0, this.intensity + 1).reduce((sum, count) => sum + count, 0);
      substitution.textContent = min === max
        ? `Imagen uniforme: conserva la intensidad ${min}.`
        : `k ≈ ${decimal(Math.fround(255 / Math.fround(math.totalPixels - firstCount)), 8)}; Q8(f32(f32(${Math.max(0, cumulative - firstCount)}) × k)) = ${lut[this.intensity]}`;
    } else {
      constants.textContent = `mín. = ${min} · máx. = ${max} · N = ${math.totalPixels}`;
      substitution.textContent = min === max
        ? `Imagen uniforme (${min}): todos los píxeles se normalizan a intensidad 0.`
        : `Q8(f32(f32(${this.intensity} × ${scale}) + (${shift}))) = ${lut[this.intensity]}`;
    }
    const start = this.expanded ? 0 : Math.max(0, Math.min(251, this.intensity - 2));
    const end = this.expanded ? 255 : start + 4;
    this.querySelector('#lut-caption').textContent = this.expanded ? '256 niveles · LUT completa' : `Niveles ${start}–${end} de 256`;
    for (let intensity = start; intensity <= end; intensity++) {
      const row = document.createElement('tr');
      if (intensity === this.intensity) { row.className = 'selected-row'; row.setAttribute('aria-current', 'true'); }
      for (const value of [intensity, math.frequencies[intensity], decimal(math.cdf[intensity], 4), lut[intensity]]) {
        const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
      }
      body.append(row);
    }
  }
}
customElements.define('analysis-panel', AnalysisPanel);
