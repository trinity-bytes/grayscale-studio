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
    
    // Establecer estado de WASM como listo
    const topNavBar = document.querySelector('top-nav-bar');
    if (topNavBar) {
      topNavBar.setWasmStatus('Ready');
    }
  }

  /**
   * Calcula las métricas estadísticas del histograma: Mínimo, Máximo, Media y Desviación Estándar.
   * @param {import('../../domain/models/HistogramModel.js').HistogramModel} histogram - Modelo de histograma a analizar
   * @returns {{ min: number, max: number, mean: number, std: number }} Objeto con las métricas calculadas
   */
  computeMetrics(histogram) {
    const freq = histogram.getFrequencies();
    const totalPixels = freq.reduce((sum, v) => sum + v, 0);
    if (totalPixels === 0) return { min: 0, max: 0, mean: 0, std: 0 };

    // Encontrar niveles de intensidad mínimos y máximos con frecuencia no nula
    let min = 0;
    let max = 255;
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) { min = i; break; }
    }
    for (let i = 255; i >= 0; i--) {
      if (freq[i] > 0) { max = i; break; }
    }

    // Media ponderada
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * freq[i];
    }
    const mean = sum / totalPixels;

    // Desviación estándar ponderada
    let varianceSum = 0;
    for (let i = 0; i < 256; i++) {
      varianceSum += freq[i] * (i - mean) ** 2;
    }
    const std = Math.sqrt(varianceSum / totalPixels);

    return {
      min,
      max,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
    };
  }

  /**
   * Maneja la selección de un archivo de imagen por parte del usuario.
   * Orquesta el flujo completo: carga, validación de grises, extracción de metadata,
   * renderizado de histogramas y cálculos matemáticos.
   * @param {File} file - Archivo de imagen seleccionado por el usuario
   */
  async handleFileSelected(file) {
    try {
      this.view.hideError();
      this.view.disableControls();
      this.view.hideMathButton();
      this.view.resetToOriginal();
      this.view.hideResultHistogram();
      this.lastOperation = null;
      this.currentFilename = file.name;
      
      // Cargar archivo como base64
      const base64Data = await this.loadUseCase.execute(file);
      
      // Esperar a que la imagen oculta cargue los datos base64 para procesarlos
      this.view.setHiddenImageSrc(base64Data, () => {
        try {
          this.view.showCanvas();
          
          // Ejecutar extracción y validación usando el caso de uso
          this.currentImageModel = this.loadUseCase.executeMathematicalExtraction(
            this.view.getHiddenImageId(),
            this.view.getWorkspaceCanvasId()
          );

          if (!this.currentImageModel.isStrictGrayscale) {
            this.view.showError(strings.errors.colorImage);
            this.view.showPlaceholder();
            this.view.updateImageInfo();
            this.view.hideHistogramContainers();
            this.view.showEmptyStates();
            return;
          }

          // Imagen en grises válida
          const metadata = this.currentImageModel.getMetadata();
          this.view.updateImageInfo(
             metadata.width,
             metadata.height,
             1 // Canales
          );

          // Actualizar miniatura desde el canvas del workspace
          const workspaceCanvas = this.view.workspace.getCanvas();
          this.view.updateThumbnail(workspaceCanvas);

          // Renderizar histograma original
          this.currentHistogram = this.currentImageModel.getHistogram();
          this.chartRenderer.render(
            this.view.getOriginalHistogramCanvas(),
            this.currentHistogram
          );

          // Mostrar métricas del histograma original
          const originalMetrics = this.computeMetrics(this.currentHistogram);
          this.view.showMetrics('original-metrics', originalMetrics);

          // Mostrar contenedores de histogramas y ocultar estado vacío
          this.view.showHistogramContainers();
          this.view.hideEmptyStates();

          // Ocultar métricas de resultado (sin procesamiento aún)
          this.view.hideMetrics('result-metrics');

          // Calcular visualizaciones matemáticas
          this.histogramMath = new HistogramMath(this.currentHistogram);
          
          this.chartRenderer.renderMath(
            this.view.getMathEqCanvas(),
            this.histogramMath,
            "equalization"
          );

          this.chartRenderer.renderMath(
            this.view.getMathExpCanvas(),
            this.histogramMath,
            "expansion"
          );

          this.view.switchToVisualTab();

          this.view.enableControls();
        } catch (error) {
          console.error(error);
          this.view.showError(strings.errors.processingFailed);
        }
      });
      
    } catch (error) {
      console.error(error);
      this.view.showError(strings.errors.loadFailed);
    }
  }

  /**
   * Maneja la ecualización del histograma de la imagen cargada.
   * Ejecuta el caso de uso de ecualización, actualiza la UI con el resultado,
   * renderiza el histograma de resultado y registra la operación en el historial.
   */
  handleEqualize() {
    try {
      this.lastOperation = 'equalize';

      const newHistogram = this.equalizeUseCase.execute(
        this.view.getHiddenImageId(),
        this.view.getProcessedCanvasId()
      );

      this.view.showProcessedCanvas();
      this.view.showMathButton();
      this.view.showResultHistogram();

      // Despachar evento de cambio de estado procesado
      this.view.workspace.dispatchEvent(new CustomEvent('on-processed-state-changed', {
        bubbles: true,
        composed: true,
        detail: { processed: true }
      }));

      // Actualizar miniatura desde el canvas procesado
      const processedCanvas = this.view.workspace.getProcessedCanvas();
      this.view.updateThumbnail(processedCanvas);

      this.chartRenderer.render(
        this.view.getResultHistogramCanvas(),
        newHistogram
      );

      // Mostrar métricas del histograma de resultado
      const resultMetrics = this.computeMetrics(newHistogram);
      this.view.showMetrics('result-metrics', resultMetrics);

      // Renderizar tabla de conversión
      const eqData = this.histogramMath.getEqualizationData();
      this.view.showEqualizationTable(this.currentHistogram.getFrequencies(), eqData.lut);

      // Agregar entrada al historial
      const originalMetrics = this.computeMetrics(this.currentHistogram);
      this.view.addHistoryEntry({
        type: 'equalize',
        filename: this.currentFilename,
        metricsBefore: originalMetrics,
        metricsAfter: resultMetrics
      });
      
      this.view.switchToVisualTab();
    } catch (error) {
      console.error(error);
      this.view.showError(strings.errors.equalizeFailed);
    }
  }

  /**
   * Maneja la expansión (normalización Min-Max) del histograma de la imagen cargada.
   * Ejecuta el caso de uso de expansión, actualiza la UI con el resultado,
   * renderiza el histograma de resultado y registra la operación en el historial.
   */
  handleExpand() {
    try {
      this.lastOperation = 'expand';

      const newHistogram = this.expandUseCase.execute(
        this.view.getHiddenImageId(),
        this.view.getProcessedCanvasId()
      );

      this.view.showProcessedCanvas();
      this.view.showMathButton();
      this.view.showResultHistogram();

      // Despachar evento de cambio de estado procesado
      this.view.workspace.dispatchEvent(new CustomEvent('on-processed-state-changed', {
        bubbles: true,
        composed: true,
        detail: { processed: true }
      }));

      // Actualizar miniatura desde el canvas procesado
      const processedCanvas = this.view.workspace.getProcessedCanvas();
      this.view.updateThumbnail(processedCanvas);

      this.chartRenderer.render(
        this.view.getResultHistogramCanvas(),
        newHistogram
      );

      // Mostrar métricas del histograma de resultado
      const resultMetrics = this.computeMetrics(newHistogram);
      this.view.showMetrics('result-metrics', resultMetrics);

      // Renderizar detalles del procedimiento de expansión
      const expData = this.histogramMath.getExpansionData();
      this.view.showExpansionProcedure(this.currentHistogram.getFrequencies(), expData.lut);

      // Agregar entrada al historial
      const originalMetrics = this.computeMetrics(this.currentHistogram);
      this.view.addHistoryEntry({
        type: 'expand',
        filename: this.currentFilename,
        metricsBefore: originalMetrics,
        metricsAfter: resultMetrics
      });

      this.view.switchToVisualTab();
    } catch (error) {
      console.error(error);
      this.view.showError(strings.errors.expandFailed);
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
