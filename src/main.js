import { MainView } from "./presentation/views/MainView.js";
import { MainController } from "./presentation/controllers/MainController.js";
import { LoadAndValidateImageUseCase } from "./application/LoadAndValidateImageUseCase.js";
import { EqualizeImageUseCase } from "./application/EqualizeImageUseCase.js";
import { ExpandImageUseCase } from "./application/ExpandImageUseCase.js";
import { ChartJsRenderer } from "./infrastructure/chart/ChartJsRenderer.js";
import { OpenCvImageProcessor } from "./infrastructure/opencv/OpenCvImageProcessor.js";
import "./presentation/components/index.js";
import "./shared/styles/main.css";

/**
 * ==========================================
 * COMPOSITION ROOT (ENTRY POINT BASE)
 * ==========================================
 * Orquesta la inyección de dependencias una vez
 * que WebAssembly (OpenCV.js) asienta en memoria.
 */
function bootstrapApp() {
  console.log("Inicializando aplicación GrayScale Master en capas limpias...");

  const checkOpenCvReady = setInterval(() => {
    if (typeof cv !== "undefined" && cv.Mat) {
      clearInterval(checkOpenCvReady);
      console.log("OpenCV.js Engine 100% activo y puro.");

      const loaderOverlay = document.getElementById("loader-overlay");
      if (loaderOverlay) {
        loaderOverlay.classList.remove("active");
      }

      const mainView = new MainView();

      const processor = new OpenCvImageProcessor();
      const loadAndValidateUseCase = new LoadAndValidateImageUseCase(processor);
      const equalizeUseCase = new EqualizeImageUseCase(processor);
      const expandUseCase = new ExpandImageUseCase(processor);
      const chartRenderer = new ChartJsRenderer();

      const appController = new MainController(
        mainView,
        loadAndValidateUseCase,
        equalizeUseCase,
        expandUseCase,
        chartRenderer,
      );
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", bootstrapApp);
