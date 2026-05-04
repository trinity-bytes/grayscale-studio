export class AnalysisPanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  getOriginalCanvas() {
    return this.querySelector('#original-histogram-canvas');
  }

  getResultCanvas() {
    return this.querySelector('#result-histogram-canvas');
  }

  render() {
    // Note: The original stitch code used divs for bars. We will provide actual <canvas> elements 
    // for Chart.js to render into, as requested by the original application logic.
    this.className = "flex-1 flex flex-col";
    this.innerHTML = `
      <div class="glass-panel rounded-lg p-md flex flex-col gap-sm flex-1">
        <div class="flex items-center gap-sm border-b border-outline-variant pb-sm mb-sm">
          <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 0;">bar_chart</span>
          <h3 class="font-headline-md text-base">Analysis</h3>
        </div>
        
        <!-- Original Histogram -->
        <div class="flex flex-col gap-xs mb-md flex-1">
          <span class="font-label-caps text-on-surface-variant text-xs">Original Histogram</span>
          <div class="glass-sub-panel rounded relative overflow-hidden flex items-end px-xs pb-xs border-b border-outline-variant h-full min-h-[150px] w-full">
             <canvas id="original-histogram-canvas" class="w-full h-full absolute inset-0"></canvas>
          </div>
        </div>
        
        <!-- Result Histogram -->
        <div class="flex flex-col gap-xs flex-1">
          <span class="font-label-caps text-primary text-xs">Result Histogram</span>
          <div class="glass-sub-panel rounded relative overflow-hidden flex items-end px-xs pb-xs border-b border-primary/30 bg-primary/5 h-full min-h-[150px] w-full">
             <canvas id="result-histogram-canvas" class="w-full h-full absolute inset-0"></canvas>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('analysis-panel', AnalysisPanel);
