/**
 * ThemeManager — singleton utility for dark/light theme toggling.
 *
 * Persists user choice to localStorage under key "gs-theme".
 * On init, restores saved preference or detects system preference.
 */
const STORAGE_KEY = 'gs-theme';

export const ThemeManager = {
  /**
   * Initialize theme from localStorage or system preference.
   * Call once at app bootstrap before first paint.
   */
  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  },

  /**
   * Toggle between light and dark themes.
   */
  toggle() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  },

  /**
   * Check if dark mode is currently active.
   * @returns {boolean}
   */
  isDark() {
    return document.documentElement.classList.contains('dark');
  },
};
