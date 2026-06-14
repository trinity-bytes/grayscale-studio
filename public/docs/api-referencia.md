# Referencia Tecnica

> Interfaces, firmas de metodos, sistema de eventos e internacionalizacion.

---

## Capa de Dominio

### ImageModel

**Ubicacion**: `src/domain/models/ImageModel.js`

Entidad principal que encapsula el estado analitico y metadata de una imagen.

```javascript
class ImageModel {
  /**
   * @param {boolean} isStrictGrayscale - True si la imagen es estrictamente gris
   * @param {Object} metadata - { totalPixels, width, height, minVal, maxVal }
   * @param {HistogramModel} histogramModel - Modelo de histograma asociado
   */
  constructor(isStrictGrayscale, metadata, histogramModel)

  /** @returns {HistogramModel} */
  getHistogram()

  /** @returns {{ totalPixels: number, width: number, height: number, minVal: number, maxVal: number }} */
  getMetadata()
}
```

**Propiedades**:

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `isStrictGrayscale` | `boolean` | Indica si la imagen es estrictamente gris |
| `metadata` | `Object` | Metadata de la imagen |
| `metadata.totalPixels` | `number` | Total de pixeles |
| `metadata.width` | `number` | Ancho en pixeles |
| `metadata.height` | `number` | Alto en pixeles |
| `metadata.minVal` | `number` | Intensidad minima |
| `metadata.maxVal` | `number` | Intensidad maxima |
| `histogramData` | `HistogramModel` | Datos del histograma |

---

### HistogramModel

**Ubicacion**: `src/domain/models/HistogramModel.js`

Value Object que representa las frecuencias de intensidad de una imagen.

```javascript
class HistogramModel {
  /**
   * @param {number[]} frequencies - Arreglo de exactamente 256 posiciones
   * @throws {Error} Si frequencies no tiene 256 elementos
   */
  constructor(frequencies)

  /** @returns {number[]} Frecuencias de intensidad (256 niveles) */
  getFrequencies()

  /** @returns {number[]} Etiquetas 0-255 para el eje X */
  getLabels()
}
```

**Invariantes**:
- `frequencies.length === 256` (obligatorio)
- Cada posicion representa la frecuencia del nivel de intensidad correspondiente (0=negro, 255=blanco)

---

### HistogramMath

**Ubicacion**: `src/domain/models/HistogramMath.js`

Value Object con funciones puras de calculo matematico para visualizacion educativa.

```javascript
class HistogramMath {
  /**
   * @param {HistogramModel} histogramModel - Modelo de histograma de entrada
   */
  constructor(histogramModel)

  /** @returns {{ cdf: number[], lut: number[] }} Datos de ecualizacion */
  getEqualizationData()

  /** @returns {{ lut: number[] }} Datos de expansion */
  getExpansionData()
}
```

**Propiedades calculadas**:

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `frequencies` | `number[]` | Frecuencias originales |
| `labels` | `number[]` | Etiquetas 0-255 |
| `totalPixels` | `number` | Total de pixeles |
| `cdf` | `number[]` | CDF normalizada [0, 1] |
| `equalizationLut` | `number[]` | LUT de ecualizacion [0, 255] |
| `expansionLut` | `number[]` | LUT de expansion [0, 255] |

---

## Capa de Dominio: Servicios (Interfaces)

### ILoadProcessor

**Ubicacion**: `src/domain/services/ImageProcessor.js`

```javascript
class ILoadProcessor {
  executeMathematicalPipeline(sourceId, destinationId)  // -> ImageModel
  checkIfGrayscale(imageMatrix)                         // -> boolean
  extractHistogram(imageMatrix)                         // -> HistogramModel
}
```

### IHistogramProcessor

```javascript
class IHistogramProcessor {
  extractHistogram(imageMatrix)  // -> HistogramModel
}
```

### ITransformProcessor

```javascript
class ITransformProcessor {
  applyEqualization(sourceId, destinationId)  // -> HistogramModel
  applyExpansion(sourceId, destinationId)     // -> HistogramModel
}
```

---

## Capa de Aplicacion: Use Cases

### LoadAndValidateImageUseCase

**Ubicacion**: `src/application/LoadAndValidateImageUseCase.js`

```javascript
class LoadAndValidateImageUseCase {
  constructor(loadProcessor)  // ILoadProcessor

  async execute(rawFile)                      // File -> Promise<string> (base64)
  executeMathematicalExtraction(tempImgId, canvasDestId)  // string, string -> ImageModel
}
```

### EqualizeImageUseCase

**Ubicacion**: `src/application/EqualizeImageUseCase.js`

```javascript
class EqualizeImageUseCase {
  constructor(transformProcessor)  // ITransformProcessor

  execute(sourceId, destinationId)  // string, string -> HistogramModel
}
```

### ExpandImageUseCase

**Ubicacion**: `src/application/ExpandImageUseCase.js`

```javascript
class ExpandImageUseCase {
  constructor(transformProcessor)  // ITransformProcessor

  execute(sourceId, destinationId)  // string, string -> HistogramModel
}
```

---

## Capa de Infraestructura

### BrowserFileReader

**Ubicacion**: `src/infrastructure/file/BrowserFileReader.js`

```javascript
class BrowserFileReader {
  static validateImageFile(file)         // File -> void (lanza Error)
  static readAsDataURL(file)             // File -> Promise<string> (base64)
  static readAsArrayBuffer(file)         // File -> Promise<ArrayBuffer>
}
```

### OpenCvImageProcessor

**Ubicacion**: `src/infrastructure/opencv/OpenCvImageProcessor.js`

Implementa `ILoadProcessor`, `IHistogramProcessor`, `ITransformProcessor`.

```javascript
class OpenCvImageProcessor {
  executeMathematicalPipeline(sourceId, destinationId)  // -> ImageModel
  checkIfGrayscale(mat)                                 // -> boolean
  extractHistogram(mat)                                 // -> HistogramModel
  applyEqualization(sourceId, destinationId)            // -> HistogramModel
  applyExpansion(sourceId, destinationId)               // -> HistogramModel
}
```

### ChartJsRenderer

**Ubicacion**: `src/infrastructure/chart/ChartJsRenderer.js`

```javascript
class ChartJsRenderer {
  constructor()                          // Inicializa Map de instancias Chart

  getThemeColors()                       // -> { gridColor, tickColor, barColor, ... }
  render(canvasId, histogramModel)       // string, HistogramModel -> void
  renderMath(canvasId, histogramMath, type)  // string, HistogramMath, string -> void
}
```

**Metodo `render()`**:
- Destruye instancia anterior del canvas (previene memory leaks)
- Renderiza histograma de barras con Chart.js
- Usa colores del tema actual

**Metodo `renderMath()`**:
- Renderiza grafico dual (barras + linea)
- `type`: `"equalization"` o `"expansion"`
- Eje Y izquierdo: frecuencias, eje Y derecho: intensidad de salida [0, 255]

---

## Capa de Presentacion

### MainView

**Ubicacion**: `src/presentation/views/MainView.js`

```javascript
class MainView {
  constructor()  // Obtiene referencias a todos los componentes

  // Binding (delega eventos del DOM al Controller)
  bindFileSelected(handler)
  bindEqualize(handler)
  bindExpand(handler)
  bindShowMath(handler)
  bindError(handler)

  // Update methods
  showError(msg)
  hideError()
  updateImageInfo(width, height, channels)
  updateThumbnail(canvasElement)
  enableControls()
  disableControls()
  showMathButton()
  hideMathButton()
  setHiddenImageSrc(base64Data, onLoadCallback)
  showCanvas()
  showProcessedCanvas()
  hideProcessedCanvas()
  resetToOriginal()
  showPlaceholder()

  // Canvas access
  getHiddenImageId()          // -> string (ID del img oculto)
  getWorkspaceCanvasId()      // -> string
  getProcessedCanvasId()      // -> string

  // Analysis panel delegation
  getOriginalHistogramCanvas()  // -> string
  getResultHistogramCanvas()    // -> string
  getMathEqCanvas()             // -> string
  getMathExpCanvas()            // -> string
  switchToVisualTab()
  switchToMathEqTab()
  switchToMathExpTab()
  showMetrics(containerId, metrics)
  hideMetrics(containerId)
  showResultHistogram()
  hideResultHistogram()
  showHistogramContainers()
  hideHistogramContainers()
  hideEmptyStates()
  showEmptyStates()
  showEqualizationTable(frequencies, lut)
  showExpansionProcedure(frequencies, lut)
  focusAnalysisPanel()
  openHistory()
  addHistoryEntry(data)
}
```

### MainController

**Ubicacion**: `src/presentation/controllers/MainController.js`

```javascript
class MainController {
  constructor(view, loadUseCase, equalizeUseCase, expandUseCase, chartRenderer)

  init()                          // Vincula todos los handlers
  computeMetrics(histogram)       // HistogramModel -> { min, max, mean, std }

  // Handlers (bound a eventos de la View)
  async handleFileSelected(file)
  handleEqualize()
  handleExpand()
  handleShowMath()
  handleError(message)
}
```

---

## Sistema de Eventos

### Eventos Emitidos por Componentes

| Evento | Componente | Detail | Descripcion |
|--------|------------|--------|-------------|
| `on-image-selected` | `<workspace-drop-zone>` | `{ file: File }` | Archivo seleccionado |
| `on-equalize` | `<workspace-drop-zone>` | — | Solicitud de ecualizacion |
| `on-expand` | `<workspace-drop-zone>` | — | Solicitud de expansion |
| `on-show-math` | `<workspace-drop-zone>` | — | Ver grafico matematico |
| `on-error` | `<workspace-drop-zone>` | `{ message: string }` | Error de interaccion |
| `on-show-workspace` | `<top-nav-bar>` | — | Navegar al workspace |
| `on-show-analysis` | `<top-nav-bar>` | — | Navegar al analisis |
| `on-show-history` | `<top-nav-bar>` | — | Abrir historial |
| `on-processed-state-changed` | `<workspace-drop-zone>` | `{ processed: boolean }` | Estado de procesamiento |

### Flujo de Eventos

```
Componente ──CustomEvent──► MainView ──handler──► MainController ──useCase──► Infrastructure
     ▲                                                                        │
     │                          ◄─────── View.update*() ──────────────────────┘
     └──────────────────────────────────────────────────────────────────────────
```

---

## Sistema de Internacionalizacion (i18n)

### Ubicacion

`src/shared/i18n/strings.js`

### Estructura

```javascript
export const strings = {
  nav: { /* Navegacion */ },
  dropzone: { /* Zona de trabajo */ },
  imageInfo: { /* Panel de info */ },
  analysis: { /* Panel de analisis */ },
  errors: { /* Mensajes de error */ },
  common: { /* Textos comunes */ },
  charts: { /* Graficos */ },
  aria: { /* Accesibilidad */ },
  index: { /* Meta info */ },
};
```

### Uso

```javascript
import { strings } from '../../shared/i18n/strings.js';

// En un componente
element.textContent = strings.analysis.originalHistogram;

// En un error
this.view.showError(strings.errors.colorImage);
```

### Claves Disponibles

| Seccion | Clave | Texto |
|---------|-------|-------|
| `nav.workspace` | — | "Espacio de Trabajo" |
| `nav.analysis` | — | "Analisis" |
| `nav.history` | — | "Historial" |
| `nav.wasmReady` | — | "WASM: Listo" |
| `dropzone.uploadTitle` | — | "Subir Imagen" |
| `dropzone.browseFiles` | — | "Explorar Archivos" |
| `imageInfo.title` | — | "Informacion de Imagen" |
| `imageInfo.grayscale` | — | "1 (Escala de Grises)" |
| `analysis.originalHistogram` | — | "Histograma Original" |
| `analysis.resultHistogram` | — | "Histograma de Resultado" |
| `errors.colorImage` | — | "Imagen a color detectada..." |
| `errors.loadFailed` | — | "No se pudo cargar el archivo." |
| `charts.frequencyIntensity` | — | "Frecuencia de Intensidad" |
| `charts.grayLevel` | — | "Nivel de Gris (0-255)" |

---

## ThemeManager

**Ubicacion**: `src/shared/utils/ThemeManager.js`

```javascript
export const ThemeManager = {
  init(),      // Restaura tema desde localStorage o detecta preferencia del sistema
  toggle(),    // Alterna entre light y dark
  isDark(),    // -> boolean
};
```

**Persistencia**: Clave `gs-theme` en `localStorage` (`'dark'` | `'light'`).

**Deteccion inicial**:
1. Si hay valor guardado en `localStorage`, lo usa.
2. Si no, detecta `prefers-color-scheme: dark` del sistema.
3. Por defecto, modo claro.

---

## Tabla de Metodos Rapida

| Clase | Metodo | Parametros | Retorno |
|-------|--------|------------|---------|
| `ImageModel` | `getHistogram()` | — | `HistogramModel` |
| `ImageModel` | `getMetadata()` | — | `Object` |
| `HistogramModel` | `getFrequencies()` | — | `number[]` |
| `HistogramModel` | `getLabels()` | — | `number[]` |
| `HistogramMath` | `getEqualizationData()` | — | `{ cdf, lut }` |
| `HistogramMath` | `getExpansionData()` | — | `{ lut }` |
| `LoadAndValidateImageUseCase` | `execute()` | `File` | `Promise<string>` |
| `LoadAndValidateImageUseCase` | `executeMathematicalExtraction()` | `string, string` | `ImageModel` |
| `EqualizeImageUseCase` | `execute()` | `string, string` | `HistogramModel` |
| `ExpandImageUseCase` | `execute()` | `string, string` | `HistogramModel` |
| `BrowserFileReader` | `readAsDataURL()` | `File` | `Promise<string>` |
| `BrowserFileReader` | `readAsArrayBuffer()` | `File` | `Promise<ArrayBuffer>` |
| `ChartJsRenderer` | `render()` | `string, HistogramModel` | `void` |
| `ChartJsRenderer` | `renderMath()` | `string, HistogramMath, string` | `void` |
| `ThemeManager` | `init()` | — | `void` |
| `ThemeManager` | `toggle()` | — | `void` |
| `ThemeManager` | `isDark()` | — | `boolean` |

---

## Siguiente

- [Guia para Desarrolladores](./guia-desarrollador.md) — Como extender el proyecto
- [Sistema de Estilos](./estilos-y-tema.md) — Tokens y temas
