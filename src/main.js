/**
 * ==========================================
 * COMPOSITION ROOT (Entry Point)
 * ==========================================
 * Punto de entrada principal de la aplicación GrayScale Studio.
 * Orquesta la inyección de dependencias siguiendo los principios de
 * Clean Architecture / DDD. Espera a que OpenCV.js (WebAssembly) esté
 * completamente cargado antes de inicializar la aplicación.
 *
 * Flujo de inicialización:
 * 1. ThemeManager.init() — Restaura el tema del usuario
 * 2. Espera a que OpenCV.js esté listo (cv.Mat disponible)
 * 3. Oculta el overlay de carga
 * 4. Inyecta dependencias: View → UseCases → Processor → Controller
 *
 * @module src/main
 */

import { MainView } from "./presentation/views/MainView.js";
import { MainController } from "./presentation/controllers/MainController.js";
import { LoadAndValidateImageUseCase } from "./application/LoadAndValidateImageUseCase.js";
import { EqualizeImageUseCase } from "./application/EqualizeImageUseCase.js";
import { ExpandImageUseCase } from "./application/ExpandImageUseCase.js";
import { ChartJsRenderer } from "./infrastructure/chart/ChartJsRenderer.js";
import { OpenCvImageProcessor } from "./infrastructure/opencv/OpenCvImageProcessor.js";
import { ThemeManager } from "./shared/utils/ThemeManager.js";
import "./presentation/components/index.js";
import "./shared/styles/main.css";
/**
 * Inicializa la aplicación GrayScale Studio.
 * Espera a que OpenCV.js esté completamente cargado en memoria,
 * luego inyecta todas las dependencias y crea el controlador principal.
 */
function bootstrapApp() {
  ThemeManager.init();
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

