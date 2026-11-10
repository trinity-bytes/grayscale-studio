import { beforeEach, expect, it } from 'vitest';
import './AnalysisPanel.js';
import { HistogramMath } from '../../../domain/models/HistogramMath.js';
import { HistogramModel } from '../../../domain/models/HistogramModel.js';
let panel;
beforeEach(() => {
  document.body.innerHTML = '<analysis-panel></analysis-panel>';
  panel = document.querySelector('analysis-panel');
});
const data = () => {
  const frequencies = new Array(256).fill(0); frequencies[10] = 50; frequencies[100] = 150;
  const math = new HistogramMath(new HistogramModel(frequencies));
  panel.showEqualizationTable(frequencies, math.getEqualizationData().lut);
  panel.showExpansionProcedure(frequencies, math.getExpansionData().lut);
  return math;
};
it('starts with unavailable calculations and no tutorial tabs or fabricated measurements', () => {
  expect(panel.querySelector('#selected-output').textContent).toBe('—');
  expect(panel.querySelectorAll('.tab-btn')).toHaveLength(0);
  expect(panel.querySelector('#inspect-lut').disabled).toBe(true);
  expect(panel.getMathEqCanvas().id).toBe('math-eq-canvas');
  expect(panel.getMathExpCanvas().id).toBe('math-exp-canvas');
});
it('inspects the exact existing domain LUT and CDF with a keyboard-operable intensity range', () => {
  const math = data(); panel.switchToMathEqTab();
  const range = panel.querySelector('#intensity-input'); range.value = '100'; range.dispatchEvent(new Event('input'));
  expect(panel.querySelector('#selected-output').textContent).toBe(String(math.getEqualizationData().lut[100]));
  expect(panel.querySelector('#selected-input').textContent).toBe('100');
  expect(panel.querySelector('#numeric-substitution').textContent).toContain('Q8');
  expect(panel.querySelector('#algorithm-constants').textContent).toContain('200');
});
it('shows five neighboring levels then allows inspecting all 256 levels, including zero bins', () => {
  data(); panel.selectIntensity(100);
  expect(panel.querySelectorAll('#lut-body tr')).toHaveLength(5);
  panel.querySelector('#inspect-lut').click();
  expect(panel.querySelectorAll('#lut-body tr')).toHaveLength(256);
  expect(panel.querySelector('#inspect-lut').getAttribute('aria-expanded')).toBe('true');
});
it('switches both operations without changing their numeric mappings', () => {
  const math = data(); panel.selectIntensity(10); panel.switchToMathExpTab();
  expect(panel.querySelector('#selected-output').textContent).toBe(String(math.getExpansionData().lut[10]));
  expect(panel.querySelector('#algorithm-constants').textContent).toContain('100');
  panel.switchToMathEqTab();
  expect(panel.querySelector('#selected-output').textContent).toBe('0');
});
it('preserves ties-to-even and float32 explanation, rather than a contradictory round formula', () => {
  data();
  expect(panel.textContent).toContain('empates al par');
  expect(panel.textContent).toContain('f32');
  expect(panel.textContent).toContain('CDFmin');
  expect(panel.textContent).toContain('f32(N − hmin)');
});
it('explains uniform-image expansion to zero and equalization preserving the original intensity', () => {
  const frequencies = new Array(256).fill(0); frequencies[128] = 3;
  const math = new HistogramMath(new HistogramModel(frequencies));
  panel.showEqualizationTable(frequencies, math.getEqualizationData().lut);
  panel.showExpansionProcedure(frequencies, math.getExpansionData().lut);
  panel.selectIntensity(128); panel.switchToMathExpTab();
  expect(panel.querySelector('#selected-output').textContent).toBe('0');
  expect(panel.querySelector('#numeric-substitution').textContent).toContain('intensidad 0');
  panel.switchToMathEqTab();
  expect(panel.querySelector('#selected-output').textContent).toBe('128');
});
it('clears every derived value after a rejected or missing image', () => {
  data(); panel.showEmptyStates();
  expect(panel.querySelector('#selected-output').textContent).toBe('—');
  expect(panel.querySelector('#algorithm-constants').textContent).not.toContain('200');
  expect(panel.querySelectorAll('#lut-body tr')).toHaveLength(0);
  expect(panel.querySelector('#intensity-input').disabled).toBe(true);
});
