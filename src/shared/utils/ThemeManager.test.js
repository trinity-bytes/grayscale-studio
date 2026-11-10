import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeManager } from './ThemeManager.js';

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
});
afterEach(() => vi.unstubAllGlobals());

it.each(['dark', 'light'])('restores saved %s preference and toggles persistently', theme => {
  localStorage.getItem.mockReturnValue(theme);
  ThemeManager.init();
  expect(ThemeManager.isDark()).toBe(theme === 'dark');
  ThemeManager.toggle();
  expect(ThemeManager.isDark()).toBe(theme !== 'dark');
  expect(localStorage.setItem).toHaveBeenCalledWith('gs-theme', theme === 'dark' ? 'light' : 'dark');
});

it('uses the system theme when storage is denied and still toggles locally', () => {
  localStorage.getItem.mockImplementation(() => { throw new Error('denied'); });
  localStorage.setItem.mockImplementation(() => { throw new Error('denied'); });
  matchMedia.mockReturnValue({ matches: true });
  expect(() => ThemeManager.init()).not.toThrow();
  expect(ThemeManager.isDark()).toBe(true);
  expect(() => ThemeManager.toggle()).not.toThrow();
  expect(ThemeManager.isDark()).toBe(false);
});

it('remains light without a stored preference or matchMedia support', () => {
  vi.stubGlobal('matchMedia', undefined);
  expect(() => ThemeManager.init()).not.toThrow();
  expect(ThemeManager.isDark()).toBe(false);
});
