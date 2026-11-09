import html from './ImageInfoPanel.html?raw';
import './ImageInfoPanel.css';
import '../../../shared/components/EmptyState/EmptyState.js';

/**
 * ==========================================
 * IMAGE INFO PANEL (Presentation Component)
 * ==========================================
 * Componente Web Component que muestra la información técnica de la imagen cargada:
 * resolución, canales, profundidad de bit y formato. Incluye una miniatura
 * de la imagen y un estado vacío cuando no hay imagen cargada.
 * Se registra como elemento personalizado <image-info-panel>.
 *
 * @module src/presentation/components/ImageInfoPanel/ImageInfoPanel
 */
export class ImageInfoPanel extends HTMLElement {
  /**
   * Se ejecuta cuando el componente se conecta al DOM.
   * Renderiza el template HTML y configura el botón de explorar archivos.
   */
  connectedCallback() {
    this.innerHTML = html;

    // El botón de explorar dispara on-image-selected a través del workspace padre
    const browseBtn = this.querySelector('#btn-browse-info');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        const workspace = document.getElementById('main-workspace');
        if (workspace) {
          const fileInput = workspace.querySelector('#file-input');
          if (fileInput) fileInput.click();
        }
      });
    }
  }

  /**
   * Actualiza la información técnica de la imagen en los campos del panel.
   * Muestra el estado vacío si todos los valores son guiones.
   * @param {string} resolution - Resolución de la imagen (ej: "800 x 600")
   * @param {string} channels - Cantidad de canales (ej: "1 (Escala de Grises)")
   * @param {string} bitDepth - Profundidad de bit (ej: "8-bit")
   * @param {string} format - Formato de carga (ej: "Cargado desde memoria")
   */
  updateInfo(resolution, channels, bitDepth, format) {
    this.querySelector('#res-val').textContent = resolution || '-';
    this.querySelector('#chan-val').textContent = channels || '-';
    this.querySelector('#bit-val').textContent = bitDepth || '-';
    this.querySelector('#fmt-val').textContent = format || '-';

    const allDashes = [resolution, channels, bitDepth, format].every(v => !v || v === '-');
    const emptyState = this.querySelector('#info-empty-state');
    const infoContent = this.querySelector('#info-content');
    const browseBtn = this.querySelector('#btn-browse-info');

    if (allDashes) {
      emptyState.hidden = false;
      infoContent.hidden = true;
      if (browseBtn) browseBtn.classList.add('hidden');
    } else {
      emptyState.hidden = true;
      infoContent.hidden = false;
      if (browseBtn) browseBtn.classList.remove('hidden');
    }
  }

  /**
   * Establece la miniatura de la imagen en el contenedor.
   * Escala la imagen para que quepa en un ancho máximo de 120px.
   * @param {string} dataUrl - Cadena data URL de la imagen a mostrar como miniatura
   */
  setThumbnail(dataUrl) {
    const revision = this.thumbnailRevision = (this.thumbnailRevision || 0) + 1;
    const container = this.querySelector('#thumbnail-container');
    if (!container) return;
    if (!dataUrl) {
      container.classList.add('hidden');
      return;
    }
    const image = new Image();
    image.onload = () => {
      if (revision !== this.thumbnailRevision) return;
      this.setThumbnailFromCanvas(image);
    };
    image.onerror = () => {
      if (revision === this.thumbnailRevision) container.classList.add('hidden');
    };
    image.src = dataUrl;
  }

  /** Draw an existing image/canvas directly; avoid encoding, FileReader and object URLs. */
  setThumbnailFromCanvas(source) {
    this.thumbnailRevision = (this.thumbnailRevision || 0) + 1;
    const container = this.querySelector('#thumbnail-container');
    const canvas = this.querySelector('#thumbnail-canvas');
    if (!container || !canvas) return;
    if (!source || !source.width || !source.height) {
      container.classList.add('hidden');
      return;
    }
    const scale = Math.min(1, 120 / source.width);
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    container.classList.remove('hidden');
  }

  /**
   * Limpia toda la información del panel y oculta la miniatura.
   * Restaura el estado vacío inicial.
   */
  clear() {
    this.thumbnailRevision = (this.thumbnailRevision || 0) + 1;
    this.updateInfo('-', '-', '-', '-');
    const container = this.querySelector('#thumbnail-container');
    if (container) container.classList.add('hidden');
    const browseBtn = this.querySelector('#btn-browse-info');
    if (browseBtn) browseBtn.classList.add('hidden');
  }
}

customElements.define('image-info-panel', ImageInfoPanel);
