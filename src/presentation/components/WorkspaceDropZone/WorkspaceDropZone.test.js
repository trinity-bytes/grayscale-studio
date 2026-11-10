import { afterEach, expect, it, vi } from 'vitest';
import './WorkspaceDropZone.js';
const create = () => {
  document.body.innerHTML = '<workspace-drop-zone></workspace-drop-zone>';
  return document.querySelector('workspace-drop-zone');
};
afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals(); });
it('selects an operation without processing, then applies only the selected operation', () => {
  vi.stubGlobal('requestAnimationFrame', callback => callback());
  const workspace = create();
  const eq = vi.fn(); const exp = vi.fn();
  workspace.addEventListener('on-equalize', eq);
  workspace.addEventListener('on-expand', exp);
  workspace.enableToolbarButtons();
  workspace.querySelector('#btn-expand').click();
  expect(exp).not.toHaveBeenCalled();
  expect(workspace.querySelector('#btn-expand').getAttribute('aria-pressed')).toBe('true');
  workspace.querySelector('#btn-apply').click();
  expect(exp).toHaveBeenCalledOnce();
  expect(eq).not.toHaveBeenCalled();
});
it('keeps replacement available after load and clears the previous result on replacement', () => {
  const workspace = create();
  workspace.showCanvas(); workspace.showProcessedCanvas();
  const browse = vi.spyOn(workspace.querySelector('#file-input'), 'click');
  workspace.querySelector('#btn-replace').click();
  expect(browse).toHaveBeenCalledOnce();
  workspace.resetToOriginal();
  expect(workspace.querySelector('#result-placeholder').hidden).toBe(false);
  expect(workspace.querySelector('#processed-canvas').hidden).toBe(true);
  expect(workspace.querySelector('#result-metrics').textContent).not.toMatch(/\d/);
});
it('owns histogram canvases beneath their respective image panes and uses unavailable empty metrics', () => {
  const workspace = create();
  expect(workspace.querySelector('#original-pane #original-histogram-canvas')).not.toBeNull();
  expect(workspace.querySelector('#result-pane #result-histogram-canvas')).not.toBeNull();
  expect(workspace.querySelector('#original-metrics').textContent).toContain('—');
  expect(workspace.querySelector('#btn-apply').disabled).toBe(true);
});
it('preserves file selection events and rejects non-image drops', () => {
  const workspace = create(); const selected = vi.fn(); const error = vi.fn();
  workspace.addEventListener('on-image-selected', selected);
  workspace.addEventListener('on-error', error);
  const file = new File(['x'], 'gray.png', { type: 'image/png' });
  workspace.emitFile(file);
  expect(selected.mock.calls[0][0].detail.file).toBe(file);
  const drop = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', { value: { files: [new File(['x'], 'x.txt', {type:'text/plain'})] } });
  workspace.querySelector('#drop-area').dispatchEvent(drop);
  expect(error).toHaveBeenCalledOnce(); expect(selected).toHaveBeenCalledOnce();
});

it('paints a pending state before processing and cancels queued work when an image is replaced', () => {
  const frames = []; vi.stubGlobal('requestAnimationFrame', callback => frames.push(callback));
  const workspace = create(); const eq = vi.fn();
  workspace.addEventListener('on-equalize', eq);
  workspace.showCanvas(); workspace.enableToolbarButtons();
  workspace.querySelector('#btn-apply').click();
  expect(workspace.getAttribute('aria-busy')).toBe('true');
  expect(workspace.querySelector('#btn-apply').disabled).toBe(true);
  expect(eq).not.toHaveBeenCalled();
  workspace.resetToOriginal();
  while (frames.length) frames.shift()();
  expect(eq).not.toHaveBeenCalled();
});
