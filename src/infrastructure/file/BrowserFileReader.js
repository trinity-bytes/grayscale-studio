/**
 * ==========================================
 * BROWSER FILE READER ADAPTER
 * ==========================================
 * Adaptador que encapsula la API nativa FileReader del navegador,
 * convirtiéndola en Promesas asíncronas para un consumo más limpio.
 * Proporciona métodos estáticos para leer archivos como data URL (base64)
 * o ArrayBuffer, con validación previa del tipo de archivo.
 *
 * @module src/infrastructure/file/BrowserFileReader
 */
export class BrowserFileReader {
  /**
   * Valida que el archivo proporcionado sea una imagen válida.
   * Verifica que no sea nulo, que tenga tipo MIME definido y que sea de tipo imagen.
   * @param {File} file - Objeto File nativo del navegador a validar
   * @throws {Error} Si el archivo es nulo, está corrupto o no tiene tipo MIME
   * @throws {Error} Si el tipo de archivo no es una imagen (no comienza con "image/")
   */
  static validateImageFile(file) {
    if (!file || !file.type) {
      throw new Error(
        "El archivo proporcionado parece estar corrupto o vacío.",
      );
    }

    if (!file.type.startsWith("image/")) {
      throw new Error(
        `Tipo de archivo no válido (${file.type}). Solo se permite procesar imágenes.`,
      );
    }
  }

  /**
   * Lee un archivo como data URL (cadena base64 codificada).
   * Ideal para cargar imágenes que serán mostradas en elementos <img> o procesadas por OpenCV.
   * @param {File} file - Objeto File nativo del navegador a leer
   * @returns {Promise<string>} Promesa que resuelve con la cadena data URL (ej: "data:image/png;base64,...")
   * @throws {Error} Si el archivo no es una imagen válida
   * @throws {Error} Si ocurre un error de hardware/navegador durante la lectura
   * @throws {Error} Si el navegador aborta inesperadamente la operación de lectura
   */
  static readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      try {
        this.validateImageFile(file);

        const reader = new FileReader();

        reader.onload = (event) => {
          resolve(event.target.result);
        };

        reader.onerror = () => {
          reject(new Error("Error de hardware/navegador al leer el archivo."));
        };

        reader.onabort = () => {
          reject(new Error("El navegador abortó inesperadamente la lectura."));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Lee un archivo como ArrayBuffer (bytes crudos).
   * Útil para procesamiento binario directo de datos de imagen.
   * @param {File} file - Objeto File nativo del navegador a leer
   * @returns {Promise<ArrayBuffer>} Promesa que resuelve con el ArrayBuffer del archivo
   * @throws {Error} Si el archivo no es una imagen válida
   * @throws {Error} Si ocurre un error al extraer los bytes crudos
   * @throws {Error} Si la extracción del buffer de datos fue abortada
   */
  static readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      try {
        this.validateImageFile(file);

        const reader = new FileReader();

        reader.onload = (event) => {
          resolve(event.target.result);
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Error de lectura al extraer los bytes crudos del archivo.",
            ),
          );
        };

        reader.onabort = () => {
          reject(new Error("La extracción del Buffer de datos fue abortada."));
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(error);
      }
    });
  }
}
