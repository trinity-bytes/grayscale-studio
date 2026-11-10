import { afterEach, expect, it, vi } from 'vitest';

vi.mock('./presentation/views/MainView.js', () => ({ MainView: vi.fn() }));
vi.mock('./presentation/controllers/MainController.js', () => ({ MainController: vi.fn() }));
vi.mock('./application/LoadAndValidateImageUseCase.js', () => ({ LoadAndValidateImageUseCase: vi.fn() }));
vi.mock('./application/EqualizeImageUseCase.js', () => ({ EqualizeImageUseCase: vi.fn() }));
vi.mock('./application/ExpandImageUseCase.js', () => ({ ExpandImageUseCase: vi.fn() }));
vi.mock('./infrastructure/chart/ChartJsRenderer.js', () => ({ ChartJsRenderer: vi.fn() }));
vi.mock('./infrastructure/opencv/OpenCvImageProcessor.js', () => ({ OpenCvImageProcessor: vi.fn() }));
vi.mock('./shared/utils/ThemeManager.js', () => ({ ThemeManager: { init: vi.fn() } }));
vi.mock('./presentation/components/index.js', () => ({}));

import { MainController } from './presentation/controllers/MainController.js';
import { ThemeManager } from './shared/utils/ThemeManager.js';
import { strings } from './shared/i18n/strings.js';
import { LoadAndValidateImageUseCase } from './application/LoadAndValidateImageUseCase.js';
import { BrowserFileReader } from './infrastructure/file/BrowserFileReader.js';

let bootstrapApp;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

it('boots the image studio without registering an easter-egg keyboard listener', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('cv', { Mat: vi.fn() });
  document.body.innerHTML = '<div id="loader-overlay" class="active"></div><main>Studio</main>';
  const addEventListener = vi.spyOn(document, 'addEventListener');
  ({ bootstrapApp } = await import('./main.js'));
  document.dispatchEvent(new Event('DOMContentLoaded'));
  vi.advanceTimersByTime(100);

  expect(ThemeManager.init).toHaveBeenCalledOnce();
  expect(MainController).toHaveBeenCalledOnce();
  expect(LoadAndValidateImageUseCase).toHaveBeenCalledWith(expect.anything(), BrowserFileReader);
  expect(document.getElementById('loader-overlay').classList.contains('active')).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
  expect(addEventListener.mock.calls.filter(([type]) => type === 'keydown')).toEqual([]);
});

it('stops waiting and reports a failed engine load after 30 seconds', () => {
  vi.useFakeTimers();
  vi.stubGlobal('cv', undefined);
  document.body.innerHTML = '<div id="loader-overlay" class="active"><p>Loading</p><div class="animate-pulse"></div></div>';
  bootstrapApp();
  vi.advanceTimersByTime(30_000);
  expect(vi.getTimerCount()).toBe(0);
  expect(MainController).not.toHaveBeenCalled();
  const overlay = document.getElementById('loader-overlay');
  expect(overlay.getAttribute('role')).toBe('alert');
  expect(overlay.querySelector('p').textContent).toBe(strings.errors.engineUnavailable);
  expect(overlay.querySelector('.animate-pulse')).toBeNull();
  vi.stubGlobal('cv', { Mat: vi.fn() });
  vi.advanceTimersByTime(1000);
  expect(MainController).not.toHaveBeenCalled();
});

it('initializes once when the engine becomes ready before the deadline', () => {
  vi.useFakeTimers();
  vi.stubGlobal('cv', undefined);
  document.body.innerHTML = '<div id="loader-overlay" class="active"><p>Loading</p></div>';
  bootstrapApp();
  vi.advanceTimersByTime(29_800);
  vi.stubGlobal('cv', { Mat: vi.fn() });
  vi.advanceTimersByTime(1000);
  expect(MainController).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  expect(document.getElementById('loader-overlay').classList.contains('active')).toBe(false);
});
