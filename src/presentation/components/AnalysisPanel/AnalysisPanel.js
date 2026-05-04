import html from './AnalysisPanel.html?raw';
import './AnalysisPanel.css';

export class AnalysisPanel extends HTMLElement {
  connectedCallback() {
    this.className = "flex-1 flex flex-col";
    this.innerHTML = html;
  }

  getOriginalCanvas() {
    return this.querySelector('#original-histogram-canvas');
  }

  getResultCanvas() {
    return this.querySelector('#result-histogram-canvas');
  }
}

customElements.define('analysis-panel', AnalysisPanel);
