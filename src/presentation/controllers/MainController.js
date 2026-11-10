import { computeHistogramMetrics } from '../../domain/models/HistogramMetrics.js';
import { HistogramMath } from '../../domain/models/HistogramMath.js';
import { strings } from '../../shared/i18n/strings.js';

/**
 * ==========================================
 * MAIN CONTROLLER (Presentation - Controller)
 * ==========================================
 * Controlador principal que orquesta la lógica de la aplicación. Sigue el patrón
 * MVC como el "C" (Controlador) que conecta la Vista (MainView) con los casos de uso
 * del dominio. Coordina la carga de imágenes, validación, ecualización, expansión
 * y actualización de la interfaz de usuario.
 *
 * @module src/presentation/controllers/MainController
 */
export class MainController {
  /**
   * Crea una instancia del controlador principal con todas las dependencias inyectadas.
   * @param {import('../views/MainView.js').MainView} view - Vista principal de la aplicación
   * @param {import('../../application/LoadAndValidateImageUseCase.js').LoadAndValidateImageUseCase} loadUseCase - Caso de uso de carga y validación
   * @param {import('../../application/EqualizeImageUseCase.js').EqualizeImageUseCase} equalizeUseCase - Caso de uso de ecualización
   * @param {import('../../application/ExpandImageUseCase.js').ExpandImageUseCase} expandUseCase - Caso de uso de expansión
   * @param {import('../../infrastructure/chart/ChartJsRenderer.js').ChartJsRenderer} chartRenderer - Renderizador de gráficas Chart.js
   */
  constructor(view, loadUseCase, equalizeUseCase, expandUseCase, chartRenderer) {
    /** @type {import('../views/MainView.js').MainView} Vista principal */
    this.view = view;

    /** @type {import('../../application/LoadAndValidateImageUseCase.js').LoadAndValidateImageUseCase} Caso de uso de carga */
    this.loadUseCase = loadUseCase;

    /** @type {import('../../application/EqualizeImageUseCase.js').EqualizeImageUseCase} Caso de uso de ecualización */
    this.equalizeUseCase = equalizeUseCase;

    /** @type {import('../../application/ExpandImageUseCase.js').ExpandImageUseCase} Caso de uso de expansión */
    this.expandUseCase = expandUseCase;

    /** @type {import('../../infrastructure/chart/ChartJsRenderer.js').ChartJsRenderer} Renderizador de gráficas */
    this.chartRenderer = chartRenderer;

    /** @type {import('../../domain/models/ImageModel.js').ImageModel|null} Modelo de la imagen actualmente cargada */
    this.currentImageModel = null;

    /** @type {import('../../domain/models/HistogramModel.js').HistogramModel|null} Histograma de la imagen actual */
    this.currentHistogram = null;

    /** @type {string|null} Nombre del archivo de la imagen cargada */
    this.currentFilename = null;

    /** @type {string|null} Última operación ejecutada ('equalize' o 'expand') */
    this.lastOperation = null;

    this.loadRevision = 0;
    this.histogramMath = null;
    this.init();
  }

  /**
   * Inicializa el controlador vinculando los eventos de la vista a los handlers
   * correspondientes y estableciendo el estado de WASM como listo.
   */
  init() {
    this.view.bindFileSelected(this.handleFileSelected.bind(this));
    this.view.bindEqualize(this.handleEqualize.bind(this));
    this.view.bindExpand(this.handleExpand.bind(this));
    this.view.bindShowMath(this.handleShowMath.bind(this));
    this.view.bindError(this.handleError.bind(this));
    
    this.view.setWasmStatus('Ready');
  }

  /**
   * Calcula las métricas estadísticas del histograma: Mínimo, Máximo, Media y Desviación Estándar.
   * @param {import('../../domain/models/HistogramModel.js').HistogramModel} histogram - Modelo de histograma a analizar
   * @returns {{ min: number, max: number, mean: number, std: number }} Objeto con las métricas calculadas
   */
  computeMetrics(histogram) {
    return computeHistogramMetrics(histogram);
  }

  /**
   * Maneja la selección de un archivo de imagen por parte del usuario.
   * Orquesta el flujo completo: carga, validación de grises, extracción de metadata,
   * renderizado de histogramas y cálculos matemáticos.
   * @param {File} file - Archivo de imagen seleccionado por el usuario
   */
  async handleFileSelected(file) {
    const revision = ++this.loadRevision;
    this.view.cancelPendingImageLoad();
    this.clearImageState();
    this.view.hideError();
    this.view.disableControls();
    this.view.hideMathButton();
    this.view.resetToOriginal();
    this.view.hideResultHistogram();
    this.currentFilename = file?.name ?? null;

    const fail = message => {
      if (revision !== this.loadRevision) return;
      this.clearImageState();
      this.view.showPlaceholder();
      this.view.updateImageInfo();
      this.view.hideHistogramContainers();
      this.view.showEmptyStates();
      this.view.hideMetrics('original-metrics');
      this.view.hideMetrics('result-metrics');
      this.view.showError(message);
    };

    try {
      const base64Data = await this.loadUseCase.execute(file);
      if (revision !== this.loadRevision) return;
      this.view.setHiddenImageSrc(base64Data, () => {
        if (revision !== this.loadRevision) return;
        try {
          this.view.showCanvas();
          const image = this.loadUseCase.executeMathematicalExtraction(
            this.view.getHiddenImageId(), this.view.getWorkspaceCanvasId()
          );
          if (!image.isStrictGrayscale) {
            fail(strings.errors.colorImage);
            return;
          }
          this.currentImageModel = image;
          const metadata = image.getMetadata();
          this.view.updateImageInfo(metadata.width, metadata.height, 1);
          this.view.updateOriginalThumbnail();
          this.currentHistogram = image.getHistogram();
          this.chartRenderer.render(this.view.getOriginalHistogramCanvas(), this.currentHistogram);
          this.view.showMetrics('original-metrics', this.computeMetrics(this.currentHistogram));
          this.view.showHistogramContainers();
          this.view.hideEmptyStates();
          this.view.hideMetrics('result-metrics');
          this.histogramMath = new HistogramMath(this.currentHistogram);
          this.chartRenderer.renderMath(this.view.getMathEqCanvas(), this.histogramMath, 'equalization');
          this.chartRenderer.renderMath(this.view.getMathExpCanvas(), this.histogramMath, 'expansion');
          this.view.switchToVisualTab();
          this.view.enableControls();
        } catch (error) {
          console.error(error);
          fail(strings.errors.processingFailed);
        }
      }, () => fail(strings.errors.loadFailed));
    } catch (error) {
      if (revision !== this.loadRevision) return;
      console.error(error);
      fail(strings.errors.loadFailed);
    }
  }

  /** Invalidate analytical state before a new load or after a rejected image. */
  clearImageState() {
    this.currentImageModel = null;
    this.currentHistogram = null;
    this.histogramMath = null;
    this.lastOperation = null;
  }

  /**
   * Maneja la ecualización del histograma de la imagen cargada.
   * Ejecuta el caso de uso de ecualización, actualiza la UI con el resultado,
   * renderiza el histograma de resultado y registra la operación en el historial.
   */
  handleEqualize() {
    this.runOperation('equalize', this.equalizeUseCase, strings.errors.equalizeFailed);
  }

  /**
   * Maneja la expansión (normalización Min-Max) del histograma de la imagen cargada.
   * Ejecuta el caso de uso de expansión, actualiza la UI con el resultado,
   * renderiza el histograma de resultado y registra la operación en el historial.
   */
  handleExpand() {
    this.runOperation('expand', this.expandUseCase, strings.errors.expandFailed);
  }

  /** Keep successful-operation publication shared; preserve operation-specific math and errors. */
  runOperation(operation, useCase, errorMessage) {
    if (!this.currentHistogram || !this.histogramMath) return;
    try {
      const newHistogram = useCase.execute(
        this.view.getHiddenImageId(), this.view.getProcessedCanvasId()
      );
      this.view.showProcessedResult();
      this.chartRenderer.render(this.view.getResultHistogramCanvas(), newHistogram);
      const resultMetrics = this.computeMetrics(newHistogram);
      this.view.showMetrics('result-metrics', resultMetrics);
      const frequencies = this.currentHistogram.getFrequencies();
      if (operation === 'equalize') {
        this.view.showEqualizationTable(frequencies, this.histogramMath.getEqualizationData().lut);
      } else {
        this.view.showExpansionProcedure(frequencies, this.histogramMath.getExpansionData().lut);
      }
      this.view.addHistoryEntry({
        type: operation,
        filename: this.currentFilename,
        metricsBefore: this.computeMetrics(this.currentHistogram),
        metricsAfter: resultMetrics,
      });
      this.view.switchToVisualTab();
      this.lastOperation = operation;
    } catch (error) {
      console.error(error);
      this.view.showError(errorMessage);
    }
  }

  /**
   * Maneja la solicitud de mostrar ecuaciones matemáticas.
   * Cambia a la pestaña correspondiente según la última operación ejecutada.
   */
  handleShowMath() {
    if (this.lastOperation === 'expand') {
      this.view.switchToMathExpTab();
    } else {
      this.view.switchToMathEqTab();
    }
  }

  /**
   * Maneja la visualización de errores delegando a la vista.
   * @param {string} message - Mensaje de error a mostrar
   */
  handleError(message) {
    this.view.showError(message);
  }
}
