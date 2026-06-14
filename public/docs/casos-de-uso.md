# Casos de Uso

> Cada Use Case orquesta una operacion de negocio especifica, coordinando modelos del dominio con servicios de infraestructura.

---

## Vision General

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  LoadAndValidateImageUseCase                    │    │
│  │  - Carga archivo desde disco                    │    │
│  │  - Valida escala de grises                      │    │
│  │  - Extrae metadata y histograma                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  EqualizeImageUseCase                           │    │
│  │  - Aplica ecualizacion global de histograma     │    │
│  │  - Retorna histograma ecualizado                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  ExpandImageUseCase                             │    │
│  │  - Aplica expansion Min-Max                     │    │
│  │  - Retorna histograma expandido                 │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## LoadAndValidateImageUseCase

### Proposito

Orquesta la carga de una imagen desde el disco del usuario hacia la memoria del navegador, valida que este en escala de grises y extrae su metadata matematica (histograma, dimensiones, rango de intensidad).

### Ubicacion

`src/application/LoadAndValidateImageUseCase.js`

### Constructor

```javascript
constructor(loadProcessor: ILoadProcessor)
```

Depende de la interfaz `ILoadProcessor`, no de la implementacion concreta.

### Metodos

#### `execute(rawFile)`

Lee el archivo del disco y lo convierte a base64.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `rawFile` | `File` | Objeto nativo Web API File |
| **Retorno** | `Promise<string>` | Datos de la imagen en formato base64 |

**Flujo interno**:
1. Valida que el archivo sea una imagen (`file.type.startsWith('image/')`)
2. Usa `BrowserFileReader.readAsDataURL()` para convertir a base64
3. Retorna la cadena base64

**Errores posibles**:
- `"El archivo proporcionado parece estar corrupto o vacio."` — Archivo sin tipo
- `"Tipo de archivo no valido..."` — No es imagen
- `"Error de hardware/navegador al leer el archivo."` — Error de FileReader

#### `executeMathematicalExtraction(tempImgId, canvasDestId)`

Ejecuta el pipeline matematico completo: lectura con OpenCV, validacion de grises, extraccion de histograma y calculo de metadata.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `tempImgId` | `string` | ID del elemento `<img>` oculto con la imagen base64 |
| `canvasDestId` | `string` | ID del `<canvas>` destino donde dibujar la imagen |
| **Retorno** | `ImageModel` | Entidad de dominio con metadata e histograma |

**Flujo interno**:
1. `cv.imread(tempImgId)` — Lee la imagen en memoria OpenCV
2. `checkIfGrayscale(mat)` — Valida diferencias cromáticas entre canales
3. `cv.cvtColor(...)` — Convierte a escala de grises si es necesario
4. `cv.imshow(canvasDestId, grayMat)` — Dibuja en el canvas
5. `cv.minMaxLoc(grayMat)` — Calcula metadata (min, max, totalPixels)
6. `extractHistogram(grayMat)` — Extrae frecuencias de 256 niveles
7. Retorna `new ImageModel(isStrictGrayscale, metadata, histogramModel)`

**Errores posibles**:
- `"OpenCV no pudo procesar los datos fuente de la imagen asincrona."` — Error de lectura OpenCV

### Flujo Completo

```
File (disco) ──► execute() ──► base64 ──► Hidden <img>
                                               │
                                               ▼
                                        executeMathematicalExtraction()
                                               │
                                               ▼
                              ┌─────────────────────────────┐
                              │  OpenCvImageProcessor       │
                              │  ├── imread()               │
                              │  ├── checkIfGrayscale()     │
                              │  ├── cvtColor()             │
                              │  ├── minMaxLoc()            │
                              │  └── extractHistogram()     │
                              └─────────────────────────────┘
                                               │
                                               ▼
                                        ImageModel
                                        ├── isStrictGrayscale
                                        ├── metadata { totalPixels, width, height, minVal, maxVal }
                                        └── HistogramModel { frequencies[256] }
```

---

## EqualizeImageUseCase

### Proposito

Aplica el algoritmo de **ecualizacion global de histograma** a una imagen en escala de grises. Este algoritmo redistribuye las intensidades para que la distribucion sea lo mas uniforme posible, maximizando el contraste global.

### Ubicacion

`src/application/EqualizeImageUseCase.js`

### Constructor

```javascript
constructor(transformProcessor: ITransformProcessor)
```

Depende de la interfaz `ITransformProcessor`.

### Metodos

#### `execute(sourceId, destinationId)`

Ejecuta la ecualizacion de la imagen.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `sourceId` | `string` | ID del elemento canvas/img de origen |
| `destinationId` | `string` | ID del elemento canvas destino |
| **Retorno** | `HistogramModel` | Datos del histograma ecualizado |

**Flujo interno (OpenCvImageProcessor)**:
1. `cv.imread(sourceId)` — Lee la imagen origen
2. `cv.cvtColor(...)` — Convierte a un solo canal (gris)
3. `cv.equalizeHist(grayMat, dst)` — Aplica ecualizacion
4. `cv.imshow(destinationId, dst)` — Dibuja resultado
5. `extractHistogram(dst)` — Extrae nuevo histograma
6. Libera memoria WebAssembly (`mat.delete()`)
7. Retorna `HistogramModel`

### Algoritmo Matematico

La ecualizacion usa la **Funcion de Distribucion Acumulada (CDF)**:

```
PDF(k) = nk / N           (donde nk = frecuencia del nivel k, N = total pixeles)
CDF(k) = sum(PDF(0..k))   (distribucion acumulada)
LUT(k) = round(CDF(k) * 255)  (mapeo a rango 0-255)
```

### Errores posibles

- `"Error al ecualizar la imagen."` — Error general de OpenCV

### Flujo

```
ImageModel (original) ──► execute() ──► OpenCvImageProcessor.applyEqualization()
                                              │
                                              ▼
                                   cv.equalizeHist(src, dst)
                                              │
                                              ▼
                                   HistogramModel (ecualizado)
                                   + Canvas actualizado
```

---

## ExpandImageUseCase

### Proposito

Aplica el algoritmo de **expansion Min-Max (estiramiento lineal)** al histograma de la imagen. Este algoritmo mapea linealmente el rango de intensidades original [min, max] al rango completo [0, 255], mejorando el contraste de imagenes con rango dinamico reducido.

### Ubicacion

`src/application/ExpandImageUseCase.js`

### Constructor

```javascript
constructor(transformProcessor: ITransformProcessor)
```

Depende de la interfaz `ITransformProcessor`.

### Metodos

#### `execute(sourceId, destinationId)`

Ejecuta la expansion de la imagen.

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `sourceId` | `string` | ID del elemento canvas de origen |
| `destinationId` | `string` | ID del elemento canvas destino |
| **Retorno** | `HistogramModel` | Datos del histograma expandido |

**Flujo interno (OpenCvImageProcessor)**:
1. `cv.imread(sourceId)` — Lee la imagen origen
2. `cv.cvtColor(...)` — Convierte a un solo canal (gris)
3. `cv.normalize(grayMat, dst, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1)` — Normaliza
4. `cv.imshow(destinationId, dst)` — Dibuja resultado
5. `extractHistogram(dst)` — Extrae nuevo histograma
6. Libera memoria WebAssembly
7. Retorna `HistogramModel`

### Algoritmo Matematico

La expansion usa **normalizacion lineal Min-Max**:

```
Para cada nivel i:
  Si i <= min:  LUT(i) = 0
  Si i >= max:  LUT(i) = 255
  Si min < i < max:  LUT(i) = round((i - min) * 255 / (max - min))
```

Donde `min` y `max` son los primeros y ultimos niveles con frecuencia > 0.

### Errores posibles

- `"Error al expandir la imagen."` — Error general de OpenCV

### Flujo

```
ImageModel (original) ──► execute() ──► OpenCvImageProcessor.applyExpansion()
                                              │
                                              ▼
                                   cv.normalize(src, dst, 0, 255, NORM_MINMAX)
                                              │
                                              ▼
                                   HistogramModel (expandido)
                                   + Canvas actualizado
```

---

## HistogramMath (Value Object de Calculo)

### Proposito

Calcula los datos matematicos para la visualizacion educativa de ecualizacion y expansion. Es un **Value Object puro** sin dependencias de OpenCV.

### Ubicacion

`src/domain/models/HistogramMath.js`

### Constructor

```javascript
constructor(histogramModel: HistogramModel)
```

Calcula automaticamente:
- **CDF** (Funcion de Distribucion Acumulada) para ecualizacion
- **LUT de Ecualizacion** (mapeo de entrada a salida)
- **LUT de Expansion** (mapeo lineal Min-Max)

### Metodos

| Metodo | Retorno | Descripcion |
|--------|---------|-------------|
| `getEqualizationData()` | `{ cdf: number[], lut: number[] }` | Datos de ecualizacion |
| `getExpansionData()` | `{ lut: number[] }` | Datos de expansion |

### Propiedades

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `frequencies` | `number[]` | Frecuencias originales (256 niveles) |
| `labels` | `number[]` | Etiquetas 0-255 para el eje X |
| `totalPixels` | `number` | Total de pixeles en la imagen |
| `cdf` | `number[]` | Funcion de distribucion acumulada normalizada [0, 1] |
| `equalizationLut` | `number[]` | LUT de ecualizacion [0, 255] |
| `expansionLut` | `number[]` | LUT de expansion [0, 255] |

---

## Resumen de Errores

| Use Case | Error | Causa |
|----------|-------|-------|
| `LoadAndValidate` | `"El archivo proporcionado parece estar corrupto o vacio."` | Archivo sin tipo MIME |
| `LoadAndValidate` | `"Tipo de archivo no valido..."` | No es imagen |
| `LoadAndValidate` | `"Error de hardware/navegador al leer el archivo."` | FileReader fallo |
| `LoadAndValidate` | `"OpenCV no pudo procesar los datos fuente..."` | Error de imread |
| `Equalize` | `"Error al ecualizar la imagen."` | Error de OpenCV |
| `Expand` | `"Error al expandir la imagen."` | Error de OpenCV |

---

## Siguiente

- [Guia para Desarrolladores](./guia-desarrollador.md) — Como agregar nuevos use cases
- [Referencia Tecnica](./api-referencia.md) — Firma de metodos completa
