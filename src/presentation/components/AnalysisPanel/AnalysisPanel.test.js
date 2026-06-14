import { describe, it, expect, beforeEach } from 'vitest';
import './AnalysisPanel.js';

/**
 * Helper: create and attach the custom element to the DOM.
 */
function createPanel() {
  const panel = document.createElement('analysis-panel');
  document.body.appendChild(panel);
  return panel;
}

describe('AnalysisPanel — Rendering', () => {
  let panel;

  beforeEach(() => {
    document.body.innerHTML = '';
    panel = createPanel();
  });

  it('renders 3 tabs: Visual, Math: Eq, Math: Exp', () => {
    const tabs = panel.querySelectorAll('.tab-btn');
    expect(tabs).toHaveLength(3);
    expect(tabs[0].textContent.trim()).toBe('Visual');
    expect(tabs[1].textContent.trim()).toBe('Ecuaciones');
    expect(tabs[2].textContent.trim()).toBe('Explicación');
  });

  it('renders 3 tab content panels', () => {
    const contents = panel.querySelectorAll('.tab-content');
    expect(contents).toHaveLength(3);
    expect(panel.querySelector('#tab-visual')).not.toBeNull();
    expect(panel.querySelector('#tab-math-eq')).not.toBeNull();
    expect(panel.querySelector('#tab-math-exp')).not.toBeNull();
  });

  it('first tab (Visual) is active by default', () => {
    const tabs = panel.querySelectorAll('.tab-btn');
    expect(tabs[0].classList.contains('active')).toBe(true);

    // Visual content should be visible (no 'hidden' class)
    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(false);
  });
});

describe('AnalysisPanel — Tab switching', () => {
  let panel;

  beforeEach(() => {
    document.body.innerHTML = '';
    panel = createPanel();
  });

  it('clicking Math: Eq tab shows eq content and hides others', () => {
    const eqTab = panel.querySelector('[data-target="tab-math-eq"]');
    eqTab.click();

    const eqContent = panel.querySelector('#tab-math-eq');
    expect(eqContent.classList.contains('hidden')).toBe(false);

    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(true);

    const expContent = panel.querySelector('#tab-math-exp');
    expect(expContent.classList.contains('hidden')).toBe(true);
  });

  it('clicking Math: Exp tab shows exp content and hides others', () => {
    const expTab = panel.querySelector('[data-target="tab-math-exp"]');
    expTab.click();

    const expContent = panel.querySelector('#tab-math-exp');
    expect(expContent.classList.contains('hidden')).toBe(false);

    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(true);

    const eqContent = panel.querySelector('#tab-math-eq');
    expect(eqContent.classList.contains('hidden')).toBe(true);
  });

  it('clicking Visual tab shows visual content and hides others', () => {
    // First switch away
    panel.querySelector('[data-target="tab-math-eq"]').click();
    // Then switch back
    panel.querySelector('[data-target="tab-visual"]').click();

    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(false);

    const eqContent = panel.querySelector('#tab-math-eq');
    expect(eqContent.classList.contains('hidden')).toBe(true);
  });

  it('only one tab has active class at a time', () => {
    panel.querySelector('[data-target="tab-math-eq"]').click();

    const tabs = panel.querySelectorAll('.tab-btn');
    const activeTabs = Array.from(tabs).filter(t => t.classList.contains('active'));
    expect(activeTabs).toHaveLength(1);
    expect(activeTabs[0].getAttribute('data-target')).toBe('tab-math-eq');
  });
});

describe('AnalysisPanel — switch methods', () => {
  let panel;

  beforeEach(() => {
    document.body.innerHTML = '';
    panel = createPanel();
  });

  it('switchToVisualTab activates the visual tab', () => {
    // Switch away first
    panel.querySelector('[data-target="tab-math-eq"]').click();

    panel.switchToVisualTab();

    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(false);

    const eqContent = panel.querySelector('#tab-math-eq');
    expect(eqContent.classList.contains('hidden')).toBe(true);
  });

  it('switchToMathEqTab activates the eq tab', () => {
    panel.switchToMathEqTab();

    const eqContent = panel.querySelector('#tab-math-eq');
    expect(eqContent.classList.contains('hidden')).toBe(false);

    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(true);
  });

  it('switchToMathExpTab activates the exp tab', () => {
    panel.switchToMathExpTab();

    const expContent = panel.querySelector('#tab-math-exp');
    expect(expContent.classList.contains('hidden')).toBe(false);

    const visualContent = panel.querySelector('#tab-visual');
    expect(visualContent.classList.contains('hidden')).toBe(true);
  });
});

describe('AnalysisPanel — Canvas getters', () => {
  let panel;

  beforeEach(() => {
    document.body.innerHTML = '';
    panel = createPanel();
  });

  it('getMathEqCanvas returns the equalization canvas element', () => {
    const canvas = panel.getMathEqCanvas();
    expect(canvas).not.toBeNull();
    expect(canvas.tagName).toBe('CANVAS');
    expect(canvas.id).toBe('math-eq-canvas');
  });

  it('getMathExpCanvas returns the expansion canvas element', () => {
    const canvas = panel.getMathExpCanvas();
    expect(canvas).not.toBeNull();
    expect(canvas.tagName).toBe('CANVAS');
    expect(canvas.id).toBe('math-exp-canvas');
  });

  it('getOriginalCanvas returns the original histogram canvas', () => {
    const canvas = panel.getOriginalCanvas();
    expect(canvas).not.toBeNull();
    expect(canvas.id).toBe('original-histogram-canvas');
  });

  it('getResultCanvas returns the result histogram canvas', () => {
    const canvas = panel.getResultCanvas();
    expect(canvas).not.toBeNull();
    expect(canvas.id).toBe('result-histogram-canvas');
  });
});

describe('AnalysisPanel — Conversion table and procedure rendering', () => {
  let panel;
  const sampleFreqs = new Array(256).fill(0);
  sampleFreqs[10] = 50;
  sampleFreqs[100] = 150;
  
  const sampleLut = new Array(256).fill(0);
  sampleLut[10] = 0;
  sampleLut[100] = 255;

  beforeEach(() => {
    document.body.innerHTML = '';
    panel = createPanel();
  });

  it('showEqualizationTable renders non-zero intensity levels', () => {
    panel.showEqualizationTable(sampleFreqs, sampleLut);
    
    const rows = panel.querySelectorAll('#eq-conversion-table-body tr');
    expect(rows).toHaveLength(2); // Only intensities 10 and 100 have freqs > 0
    
    const firstRowCols = rows[0].querySelectorAll('td');
    expect(firstRowCols[0].textContent.trim()).toBe('10');
    expect(firstRowCols[1].textContent.trim()).toBe('50');
    expect(firstRowCols[4].textContent.trim()).toBe('0');
  });

  it('showExpansionProcedure renders min, max, range, scale, and mapping details', () => {
    panel.showExpansionProcedure(sampleFreqs, sampleLut);
    
    const minVal = panel.querySelector('#exp-min-val').textContent.trim();
    const maxVal = panel.querySelector('#exp-max-val').textContent.trim();
    const rangeVal = panel.querySelector('#exp-range-val').textContent.trim();
    const scaleVal = panel.querySelector('#exp-scale-val').textContent.trim();
    
    expect(minVal).toBe('10');
    expect(maxVal).toBe('100');
    expect(rangeVal).toBe('90');
    expect(scaleVal).toBe((255 / 90).toFixed(4));
    
    const steps = panel.querySelectorAll('#exp-procedure-steps li');
    expect(steps).toHaveLength(2);
  });
});
