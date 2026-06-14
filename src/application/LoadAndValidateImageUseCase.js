import { BrowserFileReader } from "../infrastructure/file/BrowserFileReader.js";

/**
 * ==========================================
 * LOAD AND VALIDATE IMAGE USE CASE
 * ==========================================
 * Caso de uso que orquesta la carga de una imagen desde el disco del usuario
 * hacia una URL base64, y coordina la extracción de su matriz matemática
 * para verificar si está en escala de grises. Actúa como punto de entrada
 * principal para el flujo de carga de imágenes en la aplicación.
 *
 * @module src/application/LoadAndValidateImageUseCase
 */
export class LoadAndValidateImageUseCase {
  /**
   * Crea una instancia del caso de uso de carga y validación.
   * @param {import('../domain/services/ImageProcessor.js').ILoadProcessor} loadProcessor - Procesador de carga que ejecuta el pipeline matemático
   */
  constructor(loadProcessor) {
    /** @type {import('../domain/services/ImageProcessor.js').ILoadProcessor} Procesador inyectado para operaciones de carga */
    this.loadProcessor = loadProcessor;
  }

  /**
   * Lee un archivo de imagen del sistema de archivos del navegador y lo convierte
   * a una cadena de datos base64 Utiliza BrowserFileReader internamente.
   * @param {File} rawFile - Objeto nativo Web API (File) proporcionado por inputs o drag-and-drop
   * @returns {Promise<string>} Promesa que resuelve con la cadena base64 de la imagen (data URL)
   * @throws {Error} Si el archivo es inválido, corrupto o no se puede leer
   */
  async execute(rawFile) {
    const imageBase64Data = await BrowserFileReader.readAsDataURL(rawFile);
    return imageBase64Data;
  }

  /**
   * Coordina el análisis matricial de la imagen fuente usando OpenCV y construye
   * el modelo de dominio completo (ImageModel) con metadata, histograma y estado de grises.
   * Este método delega la ejecución al procesador de carga inyectado.
   * @param {string} tempImgId - ID del elemento DOM temporal que contiene la imagen en base64
   * @param {string} canvasDestId - ID del elemento canvas destino donde se dibujará la imagen procesada
   * @returns {import('../domain/models/ImageModel.js').ImageModel} Modelo de dominio con metadata, histograma y flag de escala de grises
   */
  executeMathematicalExtraction(tempImgId, canvasDestId) {
    return this.loadProcessor.executeMathematicalPipeline(
      tempImgId,
      canvasDestId,
    );
  }
}
