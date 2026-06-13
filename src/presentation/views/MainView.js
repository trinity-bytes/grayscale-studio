export class MainView {
  constructor() {
    this.topNavBar = document.querySelector("top-nav-bar");
    this.imageInfoPanel = document.getElementById("image-info-panel");
    this.processingControls = document.getElementById("processing-controls");
    this.workspace = document.getElementById("main-workspace");
    this.analysisPanel = document.getElementById("analysis-panel");
    this.errorAlert = document.getElementById("main-error-alert");

    // Create a hidden image element for OpenCV to read base64 data
    this.hiddenImage = document.createElement("img");
    this.hiddenImage.id = "hidden-source-image";
    this.hiddenImage.style.display = "none";
    document.body.appendChild(this.hiddenImage);
  }

  // Bind methods
  bindFileSelected(handler) {
    this.workspace.addEventListener("on-image-selected", (e) => {
      handler(e.detail.file);
    });
  }

  bindEqualize(handler) {
    this.processingControls.addEventListener("on-equalize", handler);
  }

  bindExpand(handler) {
    this.processingControls.addEventListener("on-expand", handler);
  }

  bindError(handler) {
    this.workspace.addEventListener("on-error", (e) => {
      handler(e.detail.message);
    });
  }

  // Update methods
  showError(msg) {
    this.errorAlert.show(msg);
  }

  hideError() {
    this.errorAlert.hide();
  }

  updateImageInfo(width, height, channels) {
    const res = width && height ? `${width} x ${height}` : "-";
    const ch = channels
      ? channels === 1
        ? "1 (Grayscale)"
        : `${channels} (Color)`
      : "-";
    const depth = channels ? "8-bit" : "-";
    const fmt = channels ? "Loaded from memory" : "-";
    this.imageInfoPanel.updateInfo(res, ch, depth, fmt);
  }

  enableControls() {
    this.processingControls.enable();
  }

  disableControls() {
    this.processingControls.disable();
  }

  setHiddenImageSrc(base64Data, onLoadCallback) {
    this.hiddenImage.onload = onLoadCallback;
    this.hiddenImage.src = base64Data;
  }

  getHiddenImageId() {
    return this.hiddenImage.id;
  }

  getWorkspaceCanvasId() {
    return this.workspace.getCanvas().id;
  }

  showCanvas() {
    this.workspace.showCanvas();
  }

  showPlaceholder() {
    this.workspace.showPlaceholder();
  }

  getOriginalHistogramCanvas() {
    return this.analysisPanel.getOriginalCanvas().id;
  }

  getResultHistogramCanvas() {
    return this.analysisPanel.getResultCanvas().id;
  }

  getMathEqCanvas() {
    return this.analysisPanel.getMathEqCanvas().id;
  }

  getMathExpCanvas() {
    return this.analysisPanel.getMathExpCanvas().id;
  }

  switchToVisualTab() {
    this.analysisPanel.switchToVisualTab();
  }

  switchToMathEqTab() {
    this.analysisPanel.switchToMathEqTab();
  }

  switchToMathExpTab() {
    this.analysisPanel.switchToMathExpTab();
  }
}
