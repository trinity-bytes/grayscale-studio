import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import './components/index.js';
import { MainView } from './views/MainView.js';
import { MainController } from './controllers/MainController.js';
import { HistogramModel } from '../domain/models/HistogramModel.js';
import { ImageModel } from '../domain/models/ImageModel.js';
import { ThemeManager } from '../shared/utils/ThemeManager.js';

const metrics = { min: 0, max: 255, mean: 130, std: 7 };
const entry = {
  id: 1,
  type: 'expand',
  filename: '\"/><svg onload=alert(1)>',
  timestamp: '<img src=x onerror=alert(1)>',
  metricsBefore: metrics,
  metricsAfter: metrics,
};
const storageHash = () => createHash('sha256')
  .update(localStorage.getItem('grayscale-history') || '').digest('hex');

beforeEach(() => {
  const store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.documentElement.classList.remove('dark');
});

it('renders external history fields as text without rewriting rejected storage', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const partial = { ...entry, metricsBefore: { ...metrics, mean: '<img src=x>' } };
  for (const value of ['null', '{}', 'bad json', JSON.stringify([entry, null, partial])]) {
    localStorage.setItem('grayscale-history', value);
    const before = storageHash();
    document.body.innerHTML = '<history-drawer></history-drawer>';
    const drawer = document.querySelector('history-drawer');
    expect(storageHash()).toBe(before);
    expect(drawer.querySelectorAll('svg,img,script')).toHaveLength(0);
    if (value.startsWith('[')) {
      expect(drawer.entries).toHaveLength(1);
      expect(drawer.querySelector('.history-card-title').textContent).toBe(entry.filename);
      expect(drawer.querySelector('.history-time').textContent).toBe(entry.timestamp);
    }
  }
  const drawer = document.querySelector('history-drawer');
  for (let i = 0; i < 25; i++) drawer.addEntry({ ...entry, filename: `${i}.png` });
  const stored = JSON.parse(localStorage.getItem('grayscale-history'));
  expect(stored).toHaveLength(20);
  expect(stored.map(record => record.filename)).toEqual(Array.from({ length: 20 }, (_, i) => `${24 - i}.png`));
  expect(Object.keys(stored[0]).sort()).toEqual(Object.keys(entry).sort());
});

function setupStudio() {
  document.body.innerHTML = `
    <top-nav-bar></top-nav-bar>
    <image-info-panel id="image-info-panel"></image-info-panel>
    <workspace-drop-zone id="main-workspace"></workspace-drop-zone>
    <analysis-panel id="analysis-panel"></analysis-panel>
    <error-alert id="main-error-alert"></error-alert>
    <history-drawer id="history-drawer"></history-drawer>
  `;
  const draws = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
    return { drawImage: (...args) => draws.push([this.id, ...args]), clearRect() {} };
  });
  const view = new MainView();
  const frequencies = new Array(256).fill(0);
  frequencies[20] = 4;
  frequencies[200] = 4;
  const histogram = new HistogramModel(frequencies);
  let grayscale = true;
  const extraction = vi.fn(() => {
    view.workspace.getCanvas().width = 8;
    view.workspace.getCanvas().height = 1;
    return new ImageModel(grayscale, { width: 8, height: 1, totalPixels: 8 }, histogram);
  });
  const load = { execute: vi.fn().mockResolvedValue('data:image/png;base64,test'), executeMathematicalExtraction: extraction };
  const equalize = { execute: vi.fn(() => histogram) };
  const expand = { execute: vi.fn(() => histogram) };
  const charts = { render: vi.fn(), renderMath: vi.fn() };
  const controller = new MainController(view, load, equalize, expand, charts);
  return { view, controller, load, equalize, expand, charts, extraction, draws, setGrayscale: value => { grayscale = value; } };
}

it('owns late decode callbacks across the real controller/view and draws the correct canvas', async () => {
  const f = setupStudio();
  await f.controller.handleFileSelected({ name: 'first.png' });
  const old = f.view.pendingImage;
  const lateSuccess = old.onload;
  const lateFailure = old.onerror;
  await f.controller.handleFileSelected({ name: 'latest.png' });
  const latest = f.view.pendingImage;
  latest.onload();
  expect(f.controller.currentFilename).toBe('latest.png');
  expect(document.getElementById('hidden-source-image')).toBe(latest);
  lateSuccess();
  lateFailure();
  expect(f.extraction).toHaveBeenCalledTimes(1);
  expect(f.draws.at(-1)[1]).toBe(f.view.workspace.getCanvas());
  f.controller.handleEqualize();
  expect(f.draws.at(-1)[1]).toBe(f.view.workspace.getProcessedCanvas());
  expect(f.view.historyDrawer.entries[0].filename).toBe('latest.png');
  expect(f.controller.lastOperation).toBe('equalize');
});

it.each(['read', 'decode', 'color', 'render'])('clears usable state without changing history after %s rejection', async stage => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const f = setupStudio();
  await f.controller.handleFileSelected({ name: 'valid.png' });
  f.view.pendingImage.onload();
  f.controller.handleExpand();
  if (stage === 'read') f.load.execute.mockRejectedValueOnce(new Error('read failure'));
  if (stage === 'color') f.setGrayscale(false);
  if (stage === 'render') f.charts.render.mockImplementationOnce(() => { throw new Error('chart failure'); });
  const before = storageHash();
  await f.controller.handleFileSelected({ name: 'rejected.png' });
  if (f.view.pendingImage) f.view.pendingImage[stage === 'decode' ? 'onerror' : 'onload']();
  expect(f.controller.currentHistogram).toBeNull();
  expect(f.controller.histogramMath).toBeNull();
  expect(f.controller.currentImageModel).toBeNull();
  expect(f.controller.lastOperation).toBeNull();
  f.equalize.execute.mockClear();
  f.expand.execute.mockClear();
  f.controller.handleEqualize();
  f.controller.handleExpand();
  expect(f.equalize.execute).not.toHaveBeenCalled();
  expect(f.expand.execute).not.toHaveBeenCalled();
  expect(storageHash()).toBe(before);
});

it('keeps theme controls usable when accessing localStorage itself is denied', () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  expect(() => ThemeManager.init()).not.toThrow();
  expect(ThemeManager.isDark()).toBe(true);
  expect(() => ThemeManager.toggle()).not.toThrow();
  expect(ThemeManager.isDark()).toBe(false);
});
