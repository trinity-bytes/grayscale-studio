import html from './WorkspaceDropZone.html?raw';
import './WorkspaceDropZone.css';
import '../../../shared/components/EmptyState/EmptyState.js';
import { strings } from '../../../shared/i18n/strings.js';

/**
 * ==========================================
 * WORKSPACE DROP ZONE (Presentation Component)
 * ==========================================
 * Componente Web Component que implementa la zona de trabajo principal.
 * Permite arrastrar y soltar imágenes o seleccionarlas desde el explorador.
 * Contiene los canvas para la imagen original y procesada, así como la barra
 * de herramientas con botones de ecualizar, expandir y ver ecuaciones.
 * Se registra como elemento personalizado <workspace-drop-zone>.
 *
 * Eventos despachados:
 * - `on-image-selected`: Cuando se selecciona un archivo de imagen
 * - `on-equalize`: Cuando se solicita ecualizar la imagen
 * - `on-expand`: Cuando se solicita expandir la imagen
 * - `on-show-math`: Cuando se solicita ver las ecuaciones matemáticas
 * - `on-error`: Cuando ocurre un error (tipo de archivo inválido)
 *
 * @module src/presentation/components/WorkspaceDropZone/WorkspaceDropZone
 */
export class WorkspaceDropZone extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template HTML y vincula todos los eventos.
   */
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
  }

  /**
   * Vincula todos los eventos de interacción: drag-and-drop, selección de archivo,
   * clic en botones de la barra de herramientas.
   */
  bindEvents() {
    const dropZone = this.querySelector('#drop-area');
    const fileInput = this.querySelector('#file-input');
    const dropHint = this.querySelector('#drop-hint-text');
    const placeholder = this.querySelector('#placeholder-content');

    // Prevenir comportamientos por defecto de drag-and-drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    // Efecto visual al arrastrar sobre la zona
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-primary');
        dropZone.classList.remove('border-outline-variant');
        dropZone.classList.add('bg-primary/5');
        dropHint.classList.remove('hidden');
        placeholder.style.opacity = '0.6';
      }, false);
    });

    // Restablecer efecto visual al salir de la zona
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-primary');
        dropZone.classList.add('border-outline-variant');
        dropZone.classList.remove('bg-primary/5');
        dropHint.classList.add('hidden');
        placeholder.style.opacity = '';
      }, false);
    });

    // Manejar la imagen soltada
    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        const file = files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          this.showError(strings.dropzone.invalidType);
          return;
        }
        this.emitFile(file);
      }
    }, false);

    // Botón de explorar archivos
    this.querySelector('#btn-browse').addEventListener('click', () => {
      fileInput.click();
    });

    // Cambio en el input de archivos
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.emitFile(e.target.files[0]);
      }
    });

    // Botones de la barra de herramientas
    this.querySelector('#btn-equalize').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-equalize', { bubbles: true, composed: true }));
    });

    this.querySelector('#btn-expand').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-expand', { bubbles: true, composed: true }));
    });

    this.querySelector('#btn-show-math').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('on-show-math', { bubbles: true, composed: true }));
    });
  }

  /**
   * Previene el comportamiento por defecto de eventos de drag-and-drop.
   * @param {DragEvent} e - Evento de drag-and-drop
   */
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Emite un evento personalizado con el archivo de imagen seleccionado.
   * @param {File} file - Archivo de imagen a emitir
   */
  emitFile(file) {
    this.dispatchEvent(new CustomEvent('on-image-selected', {
      bubbles: true,
      composed: true,
      detail: { file }
    }));
  }

  /**
   * Emite un evento de error con el mensaje especificado.
   * @param {string} message - Mensaje de error a emitir
   */
  showError(message) {
    this.dispatchEvent(new CustomEvent('on-error', {
      bubbles: true,
      composed: true,
      detail: { message }
    }));
  }

  /**
   * Muestra el canvas y oculta el placeholder.
   */
  showCanvas() {
    this.querySelector('#placeholder-content').classList.add('hidden');
    this.querySelector('#canvas-container').classList.remove('hidden');
    this.showToolbar();
  }

  /**
   * Muestra el placeholder y oculta el canvas.
   */
  showPlaceholder() {
    this.querySelector('#placeholder-content').classList.remove('hidden');
    this.querySelector('#canvas-container').classList.add('hidden');
    this.hideToolbar();
  }

  /**
   * Retorna el elemento canvas principal de la imagen original.
   * @returns {HTMLCanvasElement} Elemento canvas principal
   */
  getCanvas() {
    return this.querySelector('#main-canvas');
  }

  /**
   * Retorna el elemento canvas de la imagen procesada.
   * @returns {HTMLCanvasElement} Elemento canvas de imagen procesada
   */
  getProcessedCanvas() {
    return this.querySelector('#processed-canvas');
  }

  /**
   * Muestra el contenedor de la imagen procesada.
   */
  showProcessedCanvas() {
    this.querySelector('#processed-container').classList.remove('hidden');
  }

  /**
   * Oculta el contenedor de la imagen procesada.
   */
  hideProcessedCanvas() {
    this.querySelector('#processed-container').classList.add('hidden');
  }

  /**
   * Restaura el workspace al estado original: oculta imagen procesada y botón de ecuaciones.
   */
  resetToOriginal() {
    this.hideProcessedCanvas();
    this.hideMathButton();
  }

  // --- Métodos de la barra de herramientas ---

  /**
   * Muestra la barra de herramientas del workspace.
   */
  showToolbar() {
    const toolbar = this.querySelector('#workspace-toolbar');
    if (toolbar) toolbar.classList.remove('hidden');
  }

  /**
   * Oculta la barra de herramientas del workspace.
   */
  hideToolbar() {
    const toolbar = this.querySelector('#workspace-toolbar');
    if (toolbar) toolbar.classList.add('hidden');
  }

  /**
   * Habilita los botones de ecualizar y expandir de la barra de herramientas.
   */
  enableToolbarButtons() {
    const btnEqualize = this.querySelector('#btn-equalize');
    const btnExpand = this.querySelector('#btn-expand');
    if (btnEqualize) {
      btnEqualize.disabled = false;
      btnEqualize.removeAttribute('title');
    }
    if (btnExpand) {
      btnExpand.disabled = false;
      btnExpand.removeAttribute('title');
    }
  }

  /**
   * Deshabilita los botones de ecualizar y expandir de la barra de herramientas.
   * Muestra un tooltip indicando que se debe cargar una imagen primero.
   */
  disableToolbarButtons() {
    const btnEqualize = this.querySelector('#btn-equalize');
    const btnExpand = this.querySelector('#btn-expand');
    if (btnEqualize) {
      btnEqualize.disabled = true;
      btnEqualize.setAttribute('title', strings.dropzone.loadImageFirst);
    }
    if (btnExpand) {
      btnExpand.disabled = true;
      btnExpand.setAttribute('title', strings.dropzone.loadImageFirst);
    }
  }

  /**
   * Muestra el botón de ver ecuaciones matemáticas.
   */
  showMathButton() {
    const btn = this.querySelector('#btn-show-math');
    if (btn) btn.classList.remove('hidden');
  }

  /**
   * Oculta el botón de ver ecuaciones matemáticas.
   */
  hideMathButton() {
    const btn = this.querySelector('#btn-show-math');
    if (btn) btn.classList.add('hidden');
  }
}

customElements.define('workspace-drop-zone', WorkspaceDropZone);
