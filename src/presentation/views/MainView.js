export class MainView {
  constructor() {
    this.topNavBar = document.querySelector("top-nav-bar");
    this.imageInfoPanel = document.getElementById("image-info-panel");
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
    this.workspace.addEventListener("on-equalize", handler);
  }

  bindExpand(handler) {
    this.workspace.addEventListener("on-expand", handler);
  }

  bindShowMath(handler) {
    this.workspace.addEventListener("on-show-math", handler);
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

  enableControls() {
    this.workspace.enableToolbarButtons();
  }

  disableControls() {
    this.workspace.disableToolbarButtons();
  }

  showMathButton() {
    this.workspace.showMathButton();
  }

  hideMathButton() {
    this.workspace.hideMathButton();
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

  getProcessedCanvasId() {
    return this.workspace.getProcessedCanvas().id;
  }

  showCanvas() {
    this.workspace.showCanvas();
  }

  showProcessedCanvas() {
    this.workspace.showProcessedCanvas();
  }

  hideProcessedCanvas() {
    this.workspace.hideProcessedCanvas();
  }

  resetToOriginal() {
    this.workspace.resetToOriginal();
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

  showMetrics(containerId, metrics) {
    this.analysisPanel.showMetrics(containerId, metrics);
  }

  hideMetrics(containerId) {
    this.analysisPanel.hideMetrics(containerId);
  }

  showResultHistogram() {
    this.analysisPanel.showResultHistogram();
  }

  hideResultHistogram() {
    this.analysisPanel.hideResultHistogram();
  }
}
