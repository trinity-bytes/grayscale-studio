export class MainController {
  constructor(view, loadUseCase, equalizeUseCase, expandUseCase, chartRenderer) {
    this.view = view;
    this.loadUseCase = loadUseCase;
    this.equalizeUseCase = equalizeUseCase;
    this.expandUseCase = expandUseCase;
    this.chartRenderer = chartRenderer;

    this.currentImageModel = null;
    this.currentHistogram = null;

    this.init();
  }

  init() {
    this.view.bindFileSelected(this.handleFileSelected.bind(this));
    this.view.bindEqualize(this.handleEqualize.bind(this));
    this.view.bindExpand(this.handleExpand.bind(this));
    
    // Set WASM status to ready
    const topNavBar = document.querySelector('top-nav-bar');
    if (topNavBar) {
      topNavBar.setWasmStatus('Ready');
    }
  }

  async handleFileSelected(file) {
    try {
      this.view.hideError();
      this.view.disableControls();
      
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

          if (!this.currentImageModel.isGrayscale) {
            this.view.showError("Color image detected. Please upload a grayscale image.");
            this.view.showPlaceholder();
            this.view.updateImageInfo();
            return;
          }

          // Valid Grayscale image
          this.view.updateImageInfo(
             this.currentImageModel.metadata.totalPixels, // Wait, width/height is not in metadata directly
             // The OpenCvImageProcessor returns totalPixels, minVal, maxVal.
             // We can just show total pixels for now or estimate resolution
             Math.sqrt(this.currentImageModel.metadata.totalPixels).toFixed(0), // Approx width
             1 // Channels
          );

          // Render Original Histogram
          this.currentHistogram = this.currentImageModel.histogram;
          this.chartRenderer.render(
            this.view.getOriginalHistogramCanvas(),
            this.currentHistogram.data,
            "Original Histogram",
            "#54647a"
          );

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
      const newHistogram = this.equalizeUseCase.execute(
        this.view.getWorkspaceCanvasId(),
        this.view.getWorkspaceCanvasId()
      );

      this.chartRenderer.render(
        this.view.getResultHistogramCanvas(),
        newHistogram.data,
        "Equalized Histogram",
        "#0043c8"
      );
    } catch (error) {
      console.error(error);
      this.view.showError("Error equalizing the image.");
    }
  }

  handleExpand() {
    try {
      const newHistogram = this.expandUseCase.execute(
        this.view.getWorkspaceCanvasId(),
        this.view.getWorkspaceCanvasId()
      );

      this.chartRenderer.render(
        this.view.getResultHistogramCanvas(),
        newHistogram.data,
        "Expanded Histogram",
        "#0043c8"
      );
    } catch (error) {
      console.error(error);
      this.view.showError("Error expanding the image.");
    }
  }
}
