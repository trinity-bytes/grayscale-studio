import { strings } from '../../shared/i18n/strings.js';

/**
 * ==========================================
 * MAIN VIEW (Presentation - View Layer)
 * ==========================================
 * Vista principal de la aplicación que actúa como fachada para todos los
 * componentes de interfaz. Centraliza el acceso a los elementos del DOM,
 * la vinculación de eventos y la actualización de la UI. Sigue el patrón
 * MVC como la "V" (Vista) que el controlador manipula.
 *
 * @module src/presentation/views/MainView
 */
export class MainView {
  constructor() {
    /** @type {import('../components/TopNavBar/TopNavBar.js').TopNavBar} Barra de navegación superior */
    this.topNavBar = document.querySelector("top-nav-bar");

    /** @type {import('../components/ImageInfoPanel/ImageInfoPanel.js').ImageInfoPanel} Panel de información de imagen */
    this.imageInfoPanel = document.getElementById("image-info-panel");

    /** @type {import('../components/WorkspaceDropZone/WorkspaceDropZone.js').WorkspaceDropZone} Zona de trabajo principal */
    this.workspace = document.getElementById("main-workspace");

    /** @type {import('../components/AnalysisPanel/AnalysisPanel.js').AnalysisPanel} Panel de análisis de histogramas */
    this.analysisPanel = document.getElementById("analysis-panel");

    /** @type {import('../components/ErrorAlert/ErrorAlert.js').ErrorAlert} Alerta de errores */
    this.errorAlert = document.getElementById("main-error-alert");

    /** @type {import('../components/HistoryDrawer/HistoryDrawer.js').HistoryDrawer} Cajón de historial */
    this.historyDrawer = document.getElementById("history-drawer");

    // Elemento imagen oculto para que OpenCV lea datos base64
    /** @type {HTMLImageElement} Elemento img oculto utilizado como fuente por OpenCV */
    this.hiddenImage = document.createElement("img");
    this.hiddenImage.id = "hidden-source-image";
    this.hiddenImage.style.display = "none";
    document.body.appendChild(this.hiddenImage);

    this._setupNavListeners();
  }

  /**
   * Configura los listeners de eventos de navegación desde la barra superior.
   * Vincula los eventos personalizados on-show-analysis, on-show-history
   * y on-show-workspace a las acciones correspondientes de la vista.
   */
  _setupNavListeners() {
    if (this.topNavBar) {
      this.topNavBar.addEventListener('on-show-analysis', () => {
        this.focusAnalysisPanel();
      });
      this.topNavBar.addEventListener('on-show-history', () => {
        this.openHistory();
      });
      this.topNavBar.addEventListener('on-show-workspace', () => {
        if (this.workspace) {
          this.workspace.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  // --- Métodos de enlace de eventos (Binding) ---

  /**
   * Vincula el evento de selección de archivo desde el workspace.
   * @param {function(File): void} handler - Callback que recibe el archivo seleccionado
   */
  bindFileSelected(handler) {
    this.workspace.addEventListener("on-image-selected", (e) => {
      handler(e.detail.file);
    });
  }

  /**
   * Vincula el evento de ecualización desde el workspace.
   * @param {function(): void} handler - Callback que se ejecuta al solicitar ecualización
   */
  bindEqualize(handler) {
    this.workspace.addEventListener("on-equalize", handler);
  }

  /**
   * Vincula el evento de expansión desde el workspace.
   * @param {function(): void} handler - Callback que se ejecuta al solicitar expansión
   */
  bindExpand(handler) {
    this.workspace.addEventListener("on-expand", handler);
  }

  /**
   * Vincula el evento de mostrar ecuaciones matemáticas.
   * @param {function(): void} handler - Callback que se ejecuta al solicitar ver las ecuaciones
   */
  bindShowMath(handler) {
    this.workspace.addEventListener("on-show-math", handler);
  }

  /**
   * Vincula el evento de error desde el workspace.
   * @param {function(string): void} handler - Callback que recibe el mensaje de error
   */
  bindError(handler) {
    this.workspace.addEventListener("on-error", (e) => {
      handler(e.detail.message);
    });
  }

  // --- Métodos de actualización de UI ---

  /**
   * Muestra un mensaje de error en la alerta.
   * @param {string} msg - Mensaje de error a mostrar
   */
  showError(msg) {
    this.errorAlert.show(msg);
  }

  /**
   * Oculta la alerta de error.
   */
  hideError() {
    this.errorAlert.hide();
  }

  /**
   * Actualiza la información de la imagen en el panel de detalles.
   * @param {number} width - Ancho de la imagen en píxeles
   * @param {number} height - Alto de la imagen en píxeles
   * @param {number} channels - Cantidad de canales (1 = grises, 3 = color)
   */
  updateImageInfo(width, height, channels) {
    const res = width && height ? `${width} x ${height}` : "-";
    const ch = channels
      ? channels === 1
        ? strings.imageInfo.grayscale
        : `${channels} ${strings.imageInfo.color}`
      : "-";
    const depth = channels ? strings.imageInfo.bitDepthValue : "-";
    const fmt = channels ? strings.imageInfo.loadedFromMemory : "-";
    this.imageInfoPanel.updateInfo(res, ch, depth, fmt);
  }

  /**
   * Actualiza la miniatura de la imagen en el panel de información.
   * @param {HTMLCanvasElement} canvasElement - Elemento canvas con la imagen a miniaturizar
   */
  updateThumbnail(canvasElement) {
    if (!canvasElement) return;
    canvasElement.toBlob((blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imageInfoPanel.setThumbnail(reader.result);
      };
      reader.readAsDataURL(blob);
    }, 'image/png');
  }

  /**
   * Habilita los controles de procesamiento (botones de ecualizar y expandir).
   */
  enableControls() {
    this.workspace.enableToolbarButtons();
  }

  /**
   * Deshabilita los controles de procesamiento.
   */
  disableControls() {
    this.workspace.disableToolbarButtons();
  }

  /**
   * Muestra el botón de ver ecuaciones matemáticas.
   */
  showMathButton() {
    this.workspace.showMathButton();
  }

  /**
   * Oculta el botón de ver ecuaciones matemáticas.
   */
  hideMathButton() {
    this.workspace.hideMathButton();
  }

  /**
   * Establece la fuente de la imagen oculta en base64 y ejecuta un callback al cargar.
   * @param {string} base64Data - Cadena data URL de la imagen en base64
   * @param {function(): void} onLoadCallback - Callback a ejecutar cuando la imagen termine de cargar
   */
  setHiddenImageSrc(base64Data, onLoadCallback) {
    this.hiddenImage.onload = onLoadCallback;
    this.hiddenImage.src = base64Data;
  }

  /**
   * Retorna el ID del elemento imagen oculta utilizado por OpenCV.
   * @returns {string} ID del elemento img oculto
   */
  getHiddenImageId() {
    return this.hiddenImage.id;
  }

  /**
   * Retorna el ID del canvas principal del workspace.
   * @returns {string} ID del canvas original
   */
  getWorkspaceCanvasId() {
    return this.workspace.getCanvas().id;
  }

  /**
   * Retorna el ID del canvas de imagen procesada.
   * @returns {string} ID del canvas procesado
   */
  getProcessedCanvasId() {
    return this.workspace.getProcessedCanvas().id;
  }

  /**
   * Muestra el canvas principal del workspace.
   */
  showCanvas() {
    this.workspace.showCanvas();
  }

  /**
   * Muestra el canvas de imagen procesada.
   */
  showProcessedCanvas() {
    this.workspace.showProcessedCanvas();
  }

  /**
   * Oculta el canvas de imagen procesada.
   */
  hideProcessedCanvas() {
    this.workspace.hideProcessedCanvas();
  }

  /**
   * Restaura el workspace al estado original (oculta imagen procesada).
   */
  resetToOriginal() {
    this.workspace.resetToOriginal();
  }

  /**
   * Muestra el placeholder del workspace (cuando no hay imagen cargada).
   */
  showPlaceholder() {
    this.workspace.showPlaceholder();
  }

  /**
   * Retorna el ID del canvas del histograma original.
   * @returns {string} ID del canvas de histograma original
   */
  getOriginalHistogramCanvas() {
    return this.analysisPanel.getOriginalCanvas().id;
  }

  /**
   * Retorna el ID del canvas del histograma de resultado.
   * @returns {string} ID del canvas de histograma de resultado
   */
  getResultHistogramCanvas() {
    return this.analysisPanel.getResultCanvas().id;
  }

  /**
   * Retorna el ID del canvas de ecuaciones de ecualización.
   * @returns {string} ID del canvas de ecuaciones de ecualización
   */
  getMathEqCanvas() {
    return this.analysisPanel.getMathEqCanvas().id;
  }

  /**
   * Retorna el ID del canvas de ecuaciones de expansión.
   * @returns {string} ID del canvas de ecuaciones de expansión
   */
  getMathExpCanvas() {
    return this.analysisPanel.getMathExpCanvas().id;
  }

  /**
   * Cambia a la pestaña visual del panel de análisis.
   */
  switchToVisualTab() {
    this.analysisPanel.switchToVisualTab();
  }

  /**
   * Cambia a la pestaña de ecuaciones de ecualización.
   */
  switchToMathEqTab() {
    this.analysisPanel.switchToMathEqTab();
  }

  /**
   * Cambia a la pestaña de ecuaciones de expansión.
   */
  switchToMathExpTab() {
    this.analysisPanel.switchToMathExpTab();
  }

  /**
   * Muestra las métricas estadísticas del histograma en el contenedor especificado.
   * @param {string} containerId - ID del contenedor de métricas ('original-metrics' o 'result-metrics')
   * @param {{ min: number, max: number, mean: number, std: number }} metrics - Objeto con las métricas a mostrar
   */
  showMetrics(containerId, metrics) {
    this.analysisPanel.showMetrics(containerId, metrics);
  }

  /**
   * Oculta y limpia las métricas del contenedor especificado.
   * @param {string} containerId - ID del contenedor de métricas
   */
  hideMetrics(containerId) {
    this.analysisPanel.hideMetrics(containerId);
  }

  /**
   * Muestra el histograma de resultado y oculta su estado vacío.
   */
  showResultHistogram() {
    this.analysisPanel.showResultHistogram();
  }

  /**
   * Restaura el histograma de resultado a su estado vacío.
   */
  hideResultHistogram() {
    this.analysisPanel.hideResultHistogram();
  }

  /**
   * Oculta todos los estados vacíos de las pestañas del análisis.
   */
  hideEmptyStates() {
    this.analysisPanel.hideEmptyStates();
  }

  /**
   * Muestra todos los estados vacíos de las pestañas del análisis.
   */
  showEmptyStates() {
    this.analysisPanel.showEmptyStates();
  }

  /**
   * Muestra los contenedores de histogramas (original y resultado).
   */
  showHistogramContainers() {
    this.analysisPanel.showHistogramContainers();
  }

  /**
   * Oculta los contenedores de histogramas.
   */
  hideHistogramContainers() {
    this.analysisPanel.hideHistogramContainers();
  }

  /**
   * Muestra la tabla de conversión paso a paso para ecualización.
   * @param {number[]} frequencies - Frecuencias originales del histograma
   * @param {number[]} lut - Tabla de búsqueda de ecualización
   */
  showEqualizationTable(frequencies, lut) {
    this.analysisPanel.showEqualizationTable(frequencies, lut);
  }

  /**
   * Muestra el procedimiento detallado de expansión paso a paso.
   * @param {number[]} frequencies - Frecuencias originales del histograma
   * @param {number[]} lut - Tabla de búsqueda de expansión
   */
  showExpansionProcedure(frequencies, lut) {
    this.analysisPanel.showExpansionProcedure(frequencies, lut);
  }

  /**
   * Desplaza suavemente la vista hacia el panel de análisis y aplica un efecto de pulso.
   */
  focusAnalysisPanel() {
    if (this.analysisPanel) {
      this.analysisPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.analysisPanel.classList.add('animate-pulse-highlight');
      setTimeout(() => {
        this.analysisPanel.classList.remove('animate-pulse-highlight');
      }, 1500);
    }
  }

  /**
   * Abre el cajón de historial de operaciones.
   */
  openHistory() {
    if (this.historyDrawer) {
      this.historyDrawer.open();
    }
  }

  /**
   * Agrega una entrada al historial de operaciones.
   * @param {{ type: string, filename: string, metricsBefore: object, metricsAfter: object }} data - Datos de la operación realizada
   */
  addHistoryEntry(data) {
    if (this.historyDrawer) {
      this.historyDrawer.addEntry(data);
    }
  }
}
