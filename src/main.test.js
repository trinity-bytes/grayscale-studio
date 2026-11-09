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

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

it('boots the image studio without registering an easter-egg keyboard listener', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('cv', { Mat: vi.fn() });
  document.body.innerHTML = '<div id="loader-overlay" class="active"></div><main>Studio</main>';
  const addEventListener = vi.spyOn(document, 'addEventListener');
  await import('./main.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  vi.advanceTimersByTime(100);

  expect(ThemeManager.init).toHaveBeenCalledOnce();
  expect(MainController).toHaveBeenCalledOnce();
  expect(document.getElementById('loader-overlay').classList.contains('active')).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
  expect(addEventListener.mock.calls.filter(([type]) => type === 'keydown')).toEqual([]);
});
