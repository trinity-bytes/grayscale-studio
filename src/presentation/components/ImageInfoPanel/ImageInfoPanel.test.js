import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import './ImageInfoPanel.js';

let panel;
let drawImage;
beforeEach(() => {
  document.body.innerHTML = '<image-info-panel></image-info-panel>';
  panel = document.querySelector('image-info-panel');
  drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

it('draws the supplied source canvas directly without image encoding', () => {
  const source = document.createElement('canvas');
  source.width = 400;
  source.height = 200;
  const toBlob = vi.spyOn(source, 'toBlob');
  panel.setThumbnailFromCanvas(source);
  const canvas = panel.querySelector('#thumbnail-canvas');
  expect([canvas.width, canvas.height]).toEqual([120, 60]);
  expect(drawImage).toHaveBeenCalledWith(source, 0, 0, 120, 60);
  expect(toBlob).not.toHaveBeenCalled();
  expect(panel.querySelector('#thumbnail-container').classList.contains('hidden')).toBe(false);
});

it('uses the supplied data URL for the existing thumbnail method and ignores stale decodes', () => {
  const images = [];
  vi.stubGlobal('Image', class { constructor() { this.width = 100; this.height = 50; images.push(this); } });
  panel.setThumbnail('first-data');
  panel.setThumbnail('latest-data');
  expect(images.map(image => image.src)).toEqual(['first-data', 'latest-data']);
  images[0].onload();
  expect(drawImage).not.toHaveBeenCalled();
  images[1].onload();
  expect(drawImage).toHaveBeenCalledWith(images[1], 0, 0, 100, 50);
  panel.clear();
  images[1].onload();
  expect(drawImage).toHaveBeenCalledTimes(1);
  expect(panel.querySelector('#thumbnail-container').classList.contains('hidden')).toBe(true);
});
