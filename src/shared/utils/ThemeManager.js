/**
 * ==========================================
 * THEME MANAGER (Shared Utility)
 * ==========================================
 * Singleton que gestiona el tema claro/oscuro de la aplicación.
 * Persiste la preferencia del usuario en localStorage bajo la clave "gs-theme".
 * Al inicializar, restaura la preferencia guardada o detecta la preferencia
 * del sistema operativo del usuario.
 *
 * @module src/shared/utils/ThemeManager
 */
const STORAGE_KEY = 'gs-theme';

export const ThemeManager = {
  /**
   * Inicializa el tema desde localStorage o la preferencia del sistema.
   * Debe llamarse una sola vez al arrancar la aplicación, antes del primer paint.
   * Agrega o remueve la clase "dark" en el elemento raíz (<html>).
   */
  init() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Theme selection must remain available when browser storage is denied.
    }
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  },

  /**
   * Alterna entre los temas claro y oscuro.
   * Actualiza la clase CSS en el elemento raíz y persiste la elección en localStorage.
   */
  toggle() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // The in-memory preference still applies for this session.
    }
  },

  /**
   * Verifica si el modo oscuro está actualmente activo.
   * @returns {boolean} `true` si el tema oscuro está activo, `false` en caso contrario
   */
  isDark() {
    return document.documentElement.classList.contains('dark');
  },
};
