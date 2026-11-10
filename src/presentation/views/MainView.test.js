import { afterEach, describe, expect, it, vi } from 'vitest';
import { MainView } from './MainView.js';

afterEach(() => { document.body.innerHTML = ''; });

describe('hidden image loading', () => {
  it('reports decoding errors without replacing the valid source', () => {
    const view = new MainView();
    const old = view.hiddenImage;
    const loaded = vi.fn();
    const failed = vi.fn();
    view.setHiddenImageSrc('data:image/png;base64,bad', loaded, failed);
    const image = view.pendingImage || view.hiddenImage;
    image.dispatchEvent(new Event('error'));
    expect(failed).toHaveBeenCalledOnce();
    expect(loaded).not.toHaveBeenCalled();
    expect(view.hiddenImage).toBe(old);
    expect(image.onload).toBeNull();
    expect(image.onerror).toBeNull();
  });

  it('isolates decoding requests and only publishes the current loaded image', () => {
    const view = new MainView();
    const oldLoaded = vi.fn();
    const newLoaded = vi.fn();
    view.setHiddenImageSrc('old-data', oldLoaded, vi.fn());
    const old = view.pendingImage || view.hiddenImage;
    view.setHiddenImageSrc('new-data', newLoaded, vi.fn());
    const latest = view.pendingImage || view.hiddenImage;
    old.dispatchEvent(new Event('load'));
    expect(newLoaded).not.toHaveBeenCalled();
    expect(oldLoaded).not.toHaveBeenCalled();
    latest.dispatchEvent(new Event('load'));
    expect(newLoaded).toHaveBeenCalledOnce();
    expect(view.hiddenImage).toBe(latest);
    expect(document.querySelectorAll('#hidden-source-image')).toHaveLength(1);
    expect(latest.onload).toBeNull();
  });
});

it('keeps processed events, thumbnails and ready status behind the view facade', () => {
  const view = new MainView();
  const workspace = document.createElement('div');
  Object.assign(workspace, { getCanvas: () => 'original', getProcessedCanvas: () => 'processed', showProcessedCanvas: vi.fn(), showMathButton: vi.fn(), showResultHistogram: vi.fn() });
  view.workspace = workspace;
  view.analysisPanel = { showResultHistogram: vi.fn() };
  view.imageInfoPanel = { setThumbnailFromCanvas: vi.fn() };
  view.topNavBar = { setWasmStatus: vi.fn() };
  const listener = vi.fn();
  workspace.addEventListener('on-processed-state-changed', listener);
  view.setWasmStatus('Ready');
  view.updateOriginalThumbnail();
  view.showProcessedResult();
  expect(view.topNavBar.setWasmStatus).toHaveBeenCalledWith('Ready');
  expect(view.imageInfoPanel.setThumbnailFromCanvas.mock.calls).toEqual([['original'], ['processed']]);
  expect(workspace.showProcessedCanvas).toHaveBeenCalledOnce();
  expect(workspace.showMathButton).toHaveBeenCalledOnce();
  expect(view.workspace.showResultHistogram).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledOnce();
  expect(listener.mock.calls[0][0]).toMatchObject({ detail: { processed: true }, bubbles: true, composed: true });
});
