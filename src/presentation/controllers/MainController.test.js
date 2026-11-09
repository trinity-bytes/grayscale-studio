import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MainController } from './MainController.js';
import { HistogramModel } from '../../domain/models/HistogramModel.js';
import { ImageModel } from '../../domain/models/ImageModel.js';
import { HistogramMath } from '../../domain/models/HistogramMath.js';
import { strings } from '../../shared/i18n/strings.js';

const histogram = () => {
  const frequencies = new Array(256).fill(0);
  frequencies[10] = 1;
  frequencies[30] = 1;
  return new HistogramModel(frequencies);
};

function fixture() {
  const methods = ['bindFileSelected', 'bindEqualize', 'bindExpand', 'bindShowMath', 'bindError',
    'hideError', 'disableControls', 'hideMathButton', 'resetToOriginal', 'hideResultHistogram',
    'showCanvas', 'showError', 'showPlaceholder', 'updateImageInfo', 'hideHistogramContainers',
    'showEmptyStates', 'updateThumbnail', 'showMetrics', 'showHistogramContainers', 'hideEmptyStates',
    'hideMetrics', 'switchToVisualTab', 'enableControls', 'showProcessedCanvas', 'showMathButton',
    'showResultHistogram', 'showEqualizationTable', 'showExpansionProcedure', 'addHistoryEntry',
    'switchToMathExpTab', 'switchToMathEqTab', 'setWasmStatus', 'cancelPendingImageLoad',
    'updateOriginalThumbnail', 'showProcessedResult'];
  const view = Object.fromEntries(methods.map(name => [name, vi.fn()]));
  view.workspace = { getCanvas: vi.fn(() => 'original'), getProcessedCanvas: vi.fn(() => 'processed'), dispatchEvent: vi.fn() };
  for (const name of ['HiddenImage', 'WorkspaceCanvas', 'ProcessedCanvas']) view[`get${name}Id`] = vi.fn(() => name);
  for (const name of ['OriginalHistogram', 'ResultHistogram', 'MathEq', 'MathExp']) view[`get${name}Canvas`] = vi.fn(() => name);
  view.setHiddenImageSrc = vi.fn();
  const source = histogram();
  const model = new ImageModel(true, { width: 2, height: 1, totalPixels: 2 }, source);
  const load = { execute: vi.fn().mockResolvedValue('data:image/png;base64,test'), executeMathematicalExtraction: vi.fn(() => model) };
  const equalize = { execute: vi.fn(() => source) };
  const expand = { execute: vi.fn(() => source) };
  const charts = { render: vi.fn(), renderMath: vi.fn() };
  const controller = new MainController(view, load, equalize, expand, charts);
  return { view, load, equalize, expand, charts, controller, source, model };
}

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe('existing image and operation behavior', () => {
  it('loads a valid image and publishes metrics and both math charts', async () => {
    const { controller, view, charts, source } = fixture();
    await controller.handleFileSelected({ name: 'gray.png' });
    view.setHiddenImageSrc.mock.calls[0][1]();
    expect(controller.currentFilename).toBe('gray.png');
    expect(controller.currentHistogram).toBe(source);
    expect(view.updateImageInfo).toHaveBeenCalledWith(2, 1, 1);
    expect(view.showMetrics).toHaveBeenCalledWith('original-metrics', { min: 10, max: 30, mean: 20, std: 10 });
    expect(charts.render).toHaveBeenCalledWith('OriginalHistogram', source);
    expect(charts.renderMath.mock.calls.map(call => call[2])).toEqual(['equalization', 'expansion']);
    expect(view.enableControls).toHaveBeenCalledOnce();
  });

  it.each(['equalize', 'expand'])('preserves %s output, metrics, history, math, and navigation', operation => {
    const f = fixture();
    Object.assign(f.controller, { currentHistogram: f.source, currentImageModel: f.model, currentFilename: 'gray.png', histogramMath: new HistogramMath(f.source) });
    f.controller[operation === 'equalize' ? 'handleEqualize' : 'handleExpand']();
    expect(f[operation].execute).toHaveBeenCalledWith('HiddenImage', 'ProcessedCanvas');
    expect(f.charts.render).toHaveBeenCalledWith('ResultHistogram', f.source);
    expect(f.view.showMetrics).toHaveBeenCalledWith('result-metrics', { min: 10, max: 30, mean: 20, std: 10 });
    expect(f.view.addHistoryEntry).toHaveBeenCalledWith({ type: operation, filename: 'gray.png', metricsBefore: { min: 10, max: 30, mean: 20, std: 10 }, metricsAfter: { min: 10, max: 30, mean: 20, std: 10 } });
    expect(f.view[operation === 'equalize' ? 'showEqualizationTable' : 'showExpansionProcedure']).toHaveBeenCalledOnce();
    expect(f.view.switchToVisualTab).toHaveBeenCalledOnce();
    f.controller.handleShowMath();
    expect(f.view[operation === 'equalize' ? 'switchToMathEqTab' : 'switchToMathExpTab']).toHaveBeenCalledOnce();
  });

  it('rejects color images without enabling processing', async () => {
    const f = fixture();
    f.model.isStrictGrayscale = false;
    await f.controller.handleFileSelected({ name: 'color.png' });
    f.view.setHiddenImageSrc.mock.calls[0][1]();
    expect(f.view.showError).toHaveBeenCalledWith(strings.errors.colorImage);
    expect(f.view.enableControls).not.toHaveBeenCalled();
    expect(f.charts.render).not.toHaveBeenCalled();
  });
});

describe('load ownership and failures', () => {
  it('ignores an older read resolving after a newer selection', async () => {
    const f = fixture();
    let finishOld;
    f.load.execute.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
    const old = f.controller.handleFileSelected({ name: 'old.png' });
    await f.controller.handleFileSelected({ name: 'new.png' });
    finishOld('old-data');
    await old;
    expect(f.view.setHiddenImageSrc).toHaveBeenCalledOnce();
    expect(f.view.setHiddenImageSrc.mock.calls[0][0]).not.toBe('old-data');
  });

  it('ignores stale decode callbacks and read failures', async () => {
    const f = fixture();
    await f.controller.handleFileSelected({ name: 'old.png' });
    const oldCallback = f.view.setHiddenImageSrc.mock.calls[0][1];
    await f.controller.handleFileSelected({ name: 'new.png' });
    oldCallback();
    expect(f.load.executeMathematicalExtraction).not.toHaveBeenCalled();
    f.view.setHiddenImageSrc.mock.calls[1][1]();
    expect(f.load.executeMathematicalExtraction).toHaveBeenCalledOnce();
    let rejectOld;
    f.load.execute.mockImplementationOnce(() => new Promise((_, reject) => { rejectOld = reject; }));
    const old = f.controller.handleFileSelected({ name: 'bad-old.png' });
    await f.controller.handleFileSelected({ name: 'latest.png' });
    rejectOld(new Error('stale read'));
    await old;
    expect(f.view.showError).not.toHaveBeenCalled();
  });

  it('reports decode failure and clears stale analytical state', async () => {
    const f = fixture();
    Object.assign(f.controller, { currentHistogram: f.source, currentImageModel: f.model, histogramMath: new HistogramMath(f.source) });
    await f.controller.handleFileSelected({ name: 'corrupt.png' });
    const onError = f.view.setHiddenImageSrc.mock.calls[0][2];
    expect(onError).toBeTypeOf('function');
    onError(new Error('decode failed'));
    expect(f.view.showError).toHaveBeenCalledWith(strings.errors.loadFailed);
    expect(f.view.showPlaceholder).toHaveBeenCalled();
    expect(f.view.hideHistogramContainers).toHaveBeenCalled();
    expect(f.controller.currentHistogram).toBeNull();
    expect(f.controller.currentImageModel).toBeNull();
    expect(f.controller.histogramMath).toBeNull();
    f.controller.handleEqualize();
    f.controller.handleExpand();
    expect(f.equalize.execute).not.toHaveBeenCalled();
    expect(f.expand.execute).not.toHaveBeenCalled();
  });

  it.each(['read', 'processing'])('clears stale state on %s failure', async stage => {
    const f = fixture();
    f.controller.currentHistogram = f.source;
    if (stage === 'read') f.load.execute.mockRejectedValueOnce(new Error(stage));
    else f.load.executeMathematicalExtraction.mockImplementationOnce(() => { throw new Error(stage); });
    await f.controller.handleFileSelected({ name: 'bad.png' });
    if (stage === 'processing') f.view.setHiddenImageSrc.mock.calls[0][1]();
    expect(f.controller.currentHistogram).toBeNull();
    expect(f.view.showPlaceholder).toHaveBeenCalled();
    expect(f.view.showError).toHaveBeenCalledWith(stage === 'read' ? strings.errors.loadFailed : strings.errors.processingFailed);
    expect(f.view.enableControls).not.toHaveBeenCalled();
  });

  it.each(['equalize', 'expand'])('does not mark a failed %s as successful', operation => {
    const f = fixture();
    Object.assign(f.controller, { currentHistogram: f.source, currentImageModel: f.model, histogramMath: new HistogramMath(f.source), lastOperation: 'previous' });
    f[operation].execute.mockImplementation(() => { throw new Error('processing failed'); });
    f.controller[operation === 'equalize' ? 'handleEqualize' : 'handleExpand']();
    expect(f.controller.lastOperation).toBe('previous');
    expect(f.view.addHistoryEntry).not.toHaveBeenCalled();
    expect(f.view.showError).toHaveBeenCalledWith(strings.errors[`${operation}Failed`]);
  });
});
