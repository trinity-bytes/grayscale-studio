import { BrowserFileReader } from "../infrastructure/file/BrowserFileReader.js";
import { OpenCvImageProcessor } from "../infrastructure/opencv/OpenCvImageProcessor.js";

/**
 * ==========================================
 * LOAD AND VALIDATE IMAGE USE CASE
 * ==========================================
 * Orquesta la carga de la imagen del disco hacia una URL base64 y
 * permite extraer su matriz matemática para verificar la escala de grises.
 */
export class LoadAndValidateImageUseCase {
  /**
   * @param {File} rawFile - Objeto nativo Web API (File) proveído por inputs.
   * @returns {Promise<string>} Promesa de la data codificada en base64 de la imagen subida.
   */
  async execute(rawFile) {
    const imageBase64Data = await BrowserFileReader.readAsDataURL(rawFile);
    return imageBase64Data;
  }

  /**
   * Coordina el análisis matricial de la imagen fuente en OpenCV e invoca su validación inicial.
   * @param {string} tempImgId
   * @param {string} canvasDestId
   * @returns {import('../domain/models/ImageModel.js').ImageModel} Ente dominante con los metadatos e histograma.
   */
  executeMathematicalExtraction(tempImgId, canvasDestId) {
    return OpenCvImageProcessor.executeMathematicalPipeline(
      tempImgId,
      canvasDestId,
    );
  }
}
