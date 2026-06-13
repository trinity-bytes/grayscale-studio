/**
 * ==========================================
 * BROWSER FILE READER ADAPTER
 * ==========================================
 * Encapsula la API nativa FileReader del navegador usando
 * Promesas asíncronas
 */
export class BrowserFileReader {
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

  static readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      try {
        this.validateImageFile(file);

        const reader = new FileReader(); // Instanciación nativa asilada

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
