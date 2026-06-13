import { HistogramMath } from '../../domain/models/HistogramMath.js';

export class MainController {
  constructor(view, loadUseCase, equalizeUseCase, expandUseCase, chartRenderer) {
    this.view = view;
    this.loadUseCase = loadUseCase;
    this.equalizeUseCase = equalizeUseCase;
    this.expandUseCase = expandUseCase;
    this.chartRenderer = chartRenderer;

    this.currentImageModel = null;
    this.currentHistogram = null;
    this.lastOperation = null;

    this.init();
  }

  init() {
    this.view.bindFileSelected(this.handleFileSelected.bind(this));
    this.view.bindEqualize(this.handleEqualize.bind(this));
    this.view.bindExpand(this.handleExpand.bind(this));
    this.view.bindShowMath(this.handleShowMath.bind(this));
    this.view.bindError(this.handleError.bind(this));
    
    // Set WASM status to ready
    const topNavBar = document.querySelector('top-nav-bar');
    if (topNavBar) {
      topNavBar.setWasmStatus('Ready');
    }
  }

  /**
   * Compute histogram statistics (Min, Max, Mean, Std Dev) from frequencies.
   * @param {import('../../domain/models/HistogramModel.js').HistogramModel} histogram
   * @returns {{ min: number, max: number, mean: number, std: number }}
   */
  computeMetrics(histogram) {
    const freq = histogram.getFrequencies();
    const totalPixels = freq.reduce((sum, v) => sum + v, 0);
    if (totalPixels === 0) return { min: 0, max: 0, mean: 0, std: 0 };

    // Find min/max intensity levels with non-zero frequency
    let min = 0;
    let max = 255;
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) { min = i; break; }
    }
    for (let i = 255; i >= 0; i--) {
      if (freq[i] > 0) { max = i; break; }
    }

    // Weighted mean
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * freq[i];
    }
    const mean = sum / totalPixels;

    // Weighted standard deviation
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

  async handleFileSelected(file) {
    try {
      this.view.hideError();
      this.view.disableControls();
      this.view.hideMathButton();
      this.view.resetToOriginal();
      this.lastOperation = null;
      
      // Load file as base64
      const base64Data = await this.loadUseCase.execute(file);
      
      // We must wait for the hidden image to load the base64 data to process it
      this.view.setHiddenImageSrc(base64Data, () => {
        try {
          this.view.showCanvas();
          
          // Execute extraction and validation using the use case
          this.currentImageModel = this.loadUseCase.executeMathematicalExtraction(
            this.view.getHiddenImageId(),
            this.view.getWorkspaceCanvasId()
          );

          if (!this.currentImageModel.isStrictGrayscale) {
            this.view.showError("Color image detected. Please upload a grayscale image.");
            this.view.showPlaceholder();
            this.view.updateImageInfo();
            return;
          }

          // Valid Grayscale image
          const metadata = this.currentImageModel.getMetadata();
          this.view.updateImageInfo(
             metadata.width,
             metadata.height,
             1 // Channels
          );

          // Update thumbnail from workspace canvas
          const workspaceCanvas = this.view.workspace.getCanvas();
          this.view.updateThumbnail(workspaceCanvas);

          // Render Original Histogram
          this.currentHistogram = this.currentImageModel.getHistogram();
          this.chartRenderer.render(
            this.view.getOriginalHistogramCanvas(),
            this.currentHistogram
          );

          // Show original histogram metrics
          const originalMetrics = this.computeMetrics(this.currentHistogram);
          this.view.showMetrics('original-metrics', originalMetrics);

          // Hide result metrics (no processing yet)
          this.view.hideMetrics('result-metrics');

          // Compute Math Visualizations
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
          this.view.showError("Error processing image with OpenCV.");
        }
      });
      
    } catch (error) {
      console.error(error);
      this.view.showError("Could not load the file.");
    }
  }

  handleEqualize() {
    try {
      this.lastOperation = 'equalize';

      const newHistogram = this.equalizeUseCase.execute(
        this.view.getHiddenImageId(),
        this.view.getProcessedCanvasId()
      );

      this.view.showProcessedCanvas();
      this.view.showMathButton();

      // Update thumbnail from processed canvas
      const processedCanvas = this.view.workspace.getProcessedCanvas();
      this.view.updateThumbnail(processedCanvas);

      this.chartRenderer.render(
        this.view.getResultHistogramCanvas(),
        newHistogram
      );

      // Show result histogram metrics
      const resultMetrics = this.computeMetrics(newHistogram);
      this.view.showMetrics('result-metrics', resultMetrics);
      
      this.view.switchToVisualTab();
    } catch (error) {
      console.error(error);
      this.view.showError("Error equalizing the image.");
    }
  }

  handleExpand() {
    try {
      this.lastOperation = 'expand';

      const newHistogram = this.expandUseCase.execute(
        this.view.getHiddenImageId(),
        this.view.getProcessedCanvasId()
      );

      this.view.showProcessedCanvas();
      this.view.showMathButton();

      // Update thumbnail from processed canvas
      const processedCanvas = this.view.workspace.getProcessedCanvas();
      this.view.updateThumbnail(processedCanvas);

      this.chartRenderer.render(
        this.view.getResultHistogramCanvas(),
        newHistogram
      );

      // Show result histogram metrics
      const resultMetrics = this.computeMetrics(newHistogram);
      this.view.showMetrics('result-metrics', resultMetrics);

      this.view.switchToVisualTab();
    } catch (error) {
      console.error(error);
      this.view.showError("Error expanding the image.");
    }
  }

  handleShowMath() {
    if (this.lastOperation === 'expand') {
      this.view.switchToMathExpTab();
    } else {
      this.view.switchToMathEqTab();
    }
  }

  handleError(message) {
    this.view.showError(message);
  }
}
