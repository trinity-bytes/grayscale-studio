import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartJsRenderer } from './ChartJsRenderer.js';
import { HistogramModel } from '../../domain/models/HistogramModel.js';
import { HistogramMath } from '../../domain/models/HistogramMath.js';

const frequencies = entries => {
  const values = new Array(256).fill(0);
  for (const [level, count] of entries) values[level] = count;
  return values;
};

let renderer;
let instances;
beforeEach(() => {
  document.body.innerHTML = ['original-histogram-canvas', 'result-histogram-canvas', 'math-eq-canvas', 'math-exp-canvas']
    .map(id => `<canvas id="${id}"></canvas>`).join('');
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () { return { canvas: this }; });
  instances = [];
  vi.stubGlobal('Chart', vi.fn(function (context, config) {
    Object.assign(this, { canvas: context.canvas, config, data: config.data, options: config.options,
      destroy: vi.fn(), update: vi.fn() });
    instances.push(this);
  }));
  renderer = new ChartJsRenderer();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

describe('dark Studio frequency charts', () => {
  it('aggregates all 256 levels into 64 exact four-level step intervals without changing the model', () => {
    const values = frequencies([[0, 2], [3, 3], [4, 7], [254, 11], [255, 13]]);
    const original = values.slice();
    renderer.render('original-histogram-canvas', new HistogramModel(values));
    const chart = instances[0];
    expect(chart.config.type).toBe('line');
    expect(chart.data.datasets[0].data).toHaveLength(64);
    expect(chart.data.datasets[0].data.slice(0, 2)).toEqual([5, 7]);
    expect(chart.data.datasets[0].data[63]).toBe(24);
    expect(chart.data.datasets[0].data.reduce((sum, count) => sum + count, 0)).toBe(36);
    expect(chart.data.labels[63]).toBe('252–255');
    expect(chart.data.datasets[0]).toMatchObject({ stepped: 'middle', tension: 0, fill: true, pointRadius: 0 });
    expect(chart.options.animation).toBe(false);
    expect(values).toEqual(original);
  });

  it('shares a frequency scale across source and result and updates the existing source chart', () => {
    renderer.render('original-histogram-canvas', new HistogramModel(frequencies([[50, 7]])));
    renderer.render('result-histogram-canvas', new HistogramModel(frequencies([[80, 70]])));
    expect(instances[0].options.scales.y.max).toBe(instances[1].options.scales.y.max);
    expect(instances[1].options.scales.y.max).toBeGreaterThanOrEqual(70);
    expect(instances[0].update).toHaveBeenCalledWith('none');
    expect(instances[0].data.datasets[0].borderColor).not.toBe(instances[1].data.datasets[0].borderColor);
  });

  it('resets prior result data and scale on a new original, retaining destructive replacement', () => {
    renderer.render('original-histogram-canvas', new HistogramModel(frequencies([[50, 7]])));
    renderer.render('result-histogram-canvas', new HistogramModel(frequencies([[80, 7000]])));
    renderer.render('original-histogram-canvas', new HistogramModel(frequencies([[1, 2]])));
    expect(instances[0].destroy).toHaveBeenCalledOnce();
    expect(instances[1].destroy).toHaveBeenCalledOnce();
    expect(renderer.chartInstances.has('result-histogram-canvas')).toBe(false);
    expect(instances[2].options.scales.y.max).toBeLessThan(7000);
  });

  it('describes exact interval counts and percentages, including genuine zero data', () => {
    renderer.render('original-histogram-canvas', new HistogramModel(frequencies([[112, 3], [115, 1]])));
    const callbacks = instances[0].options.plugins.tooltip.callbacks;
    expect(callbacks.title([{ dataIndex: 28 }])).toContain('112–115');
    expect(callbacks.label({ dataIndex: 28 })).toContain('4');
    expect(callbacks.label({ dataIndex: 28 })).toContain('100');
    renderer.render('original-histogram-canvas', new HistogramModel(new Array(256).fill(0)));
    expect(instances[1].options.plugins.tooltip.callbacks.label({ dataIndex: 0 })).not.toMatch(/NaN|Infinity/);
    expect(instances[1].options.scales.y.min).toBe(0);
    expect(instances[1].options.scales.y.max).toBeGreaterThan(0);
  });

  it('dispatches the explicitly named first interval level and exposes a nonvisual summary', () => {
    const canvas = document.getElementById('original-histogram-canvas');
    const selected = vi.fn();
    document.body.addEventListener('on-intensity-selected', selected);
    renderer.render(canvas.id, new HistogramModel(frequencies([[115, 4]])));
    instances[0].options.onClick({}, [{ index: 28 }]);
    expect(selected.mock.calls[0][0]).toMatchObject({ detail: { intensity: 112 }, bubbles: true });
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toContain('4');
    expect(canvas.getAttribute('aria-label')).toContain('64');
    expect(instances[0].options.plugins.tooltip.callbacks.footer()).toContain('primer nivel');
  });
});

describe('dark Studio mathematical charts', () => {
  it('plots the raw normalized CDF rather than the quantized equalization LUT', () => {
    const math = new HistogramMath(new HistogramModel(frequencies([[83, 1], [115, 3], [174, 4]])));
    renderer.renderMath('math-eq-canvas', math, 'equalization');
    expect(instances[0].data.datasets).toHaveLength(1);
    expect(instances[0].data.datasets[0].data).toEqual(math.getEqualizationData().cdf);
    expect(instances[0].data.datasets[0]).toMatchObject({ stepped: 'after', tension: 0, pointRadius: 0 });
    expect(instances[0].options.scales.y).toMatchObject({ min: 0, max: 1 });
    expect(instances[0].data.datasets[0].data[83]).toBe(0.125);
  });

  it('retains native expansion LUT values, the 0–255 output scale, and old-instance disposal', () => {
    const math = new HistogramMath(new HistogramModel(frequencies([[10, 3], [90, 4]])));
    renderer.renderMath('math-exp-canvas', math, 'expansion');
    renderer.renderMath('math-exp-canvas', math, 'expansion');
    expect(instances[0].destroy).toHaveBeenCalledOnce();
    expect(instances[1].data.datasets[0].data).toEqual(math.getExpansionData().lut);
    expect(instances[1].options.scales.y).toMatchObject({ min: 0, max: 255 });
    expect(instances[1].options.scales.y2).toBeUndefined();
    expect(instances[1].options.animation).toBe(false);
  });

  it('publishes exact selected intensity from mathematical charts and tolerates missing canvases', () => {
    const math = new HistogramMath(new HistogramModel(frequencies([[10, 3], [90, 4]])));
    const selected = vi.fn();
    document.getElementById('math-eq-canvas').addEventListener('on-intensity-selected', selected);
    renderer.renderMath('math-eq-canvas', math, 'equalization');
    instances[0].options.onClick({}, [{ index: 255 }]);
    expect(selected.mock.calls[0][0].detail.intensity).toBe(255);
    renderer.renderMath('missing', math, 'equalization');
    expect(instances).toHaveLength(1);
  });
});

it('publishes exact source and result frequency tables as nonvisual chart alternatives', () => {
  const body = document.createElement('tbody'); body.id = 'result-histogram-canvas-data'; document.body.append(body);
  renderer.render('result-histogram-canvas', new HistogramModel(frequencies([[0, 2], [3, 5], [255, 9]])));
  expect(body.querySelectorAll('tr')).toHaveLength(64);
  expect(body.querySelector('tr').textContent).toContain('0–3');
  expect(body.querySelector('tr').lastElementChild.textContent).toBe('7');
  expect([...body.querySelectorAll('tr')].reduce((sum, row) => sum + Number(row.lastElementChild.textContent), 0)).toBe(16);
});

it('draws the selected CDF guide and exact point and detaches replaced selection listeners', () => {
  const math = new HistogramMath(new HistogramModel(frequencies([[10, 3], [90, 4]])));
  const canvas = document.getElementById('math-eq-canvas');
  canvas.dataset.selectedIntensity = '90';
  renderer.renderMath(canvas.id, math, 'equalization');
  const chart = instances[0];
  const guide = chart.config.plugins.find(plugin => plugin.id === 'studio-selection');
  const ctx = Object.fromEntries(['save', 'restore', 'setLineDash', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill'].map(method => [method, vi.fn()]));
  guide.afterDatasetsDraw({ canvas, ctx, chartArea: {top: 8, bottom: 120}, getDatasetMeta: () => ({data: Array.from({length:256},()=>({x: 120,y: 8}))}) });
  expect(ctx.moveTo).toHaveBeenCalledWith(120, 8);
  expect(ctx.lineTo).toHaveBeenCalledWith(120, 120);
  expect(ctx.arc).toHaveBeenCalledWith(120, 8, 3, 0, Math.PI * 2);
  canvas.dispatchEvent(new Event('on-inspection-changed'));
  expect(chart.update).toHaveBeenCalledOnce();
  renderer.renderMath(canvas.id, math, 'equalization');
  canvas.dispatchEvent(new Event('on-inspection-changed'));
  expect(chart.update).toHaveBeenCalledOnce();
  expect(instances[1].update).toHaveBeenCalledOnce();
});
