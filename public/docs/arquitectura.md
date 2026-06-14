# Arquitectura Detallada

> Clean Architecture y Domain-Driven Design aplicados a una aplicacion de procesamiento de imagenes en el navegador.

---

## Principios Fundamentales

GrayScale Studio aplica **Clean Architecture** (Robert C. Martin) con las siguientes reglas:

1. **Las dependencias solo apuntan hacia adentro**: Las capas externas conocen a las internas, nunca al reves.
2. **El Dominio es puro**: Sin dependencias de UI, APIs o librerias externas.
3. **Los Use Cases orquestan**: coordinan la ejecucion sin contener logica de negocio.
4. **La Infraestructura implementa**: resuelve detalles tecnicos detras de interfaces.

---

## Diagrama de Capas

```
┌──────────────────────────────────────────────────────────────┐
│                     PRESENTATION                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  MainView    │  │ MainController│  │  Web Components   │   │
│  │  (Binder)    │  │ (Orchestrator)│  │  (UI Nativa)      │   │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘   │
│         │                │                     │             │
├─────────┼────────────────┼─────────────────────┼─────────────┤
│         │           APPLICATION                │             │
│  ┌──────▼──────────────────────────────────────▼──────────┐  │
│  │  LoadAndValidateImageUseCase                           │  │
│  │  EqualizeImageUseCase                                  │  │
│  │  ExpandImageUseCase                                    │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                     DOMAIN │                                 │
│  ┌────────────────────────▼─────────────────────────────┐   │
│  │  Models                                              │   │
│  │  ├── ImageModel (Entity)                             │   │
│  │  ├── HistogramModel (Value Object)                   │   │
│  │  └── HistogramMath (Value Object - Pure Functions)   │   │
│  │                                                      │   │
│  │  Services (Interfaces)                               │   │
│  │  ├── ILoadProcessor                                  │   │
│  │  ├── IHistogramProcessor                             │   │
│  │  └── ITransformProcessor                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                              │
│  ┌────────────────┐ ┌─────────────────┐ ┌────────────────┐  │
│  │ BrowserFile    │ │ OpenCvImage     │ │ ChartJs        │  │
│  │ Reader         │ │ Processor       │ │ Renderer       │  │
│  │ (File API)     │ │ (WebAssembly)   │ │ (Chart.js)     │  │
│  └────────────────┘ └─────────────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Reglas de Dependencia

```
Presentation ──► Application ──► Domain ◄── Infrastructure
```

| Capa | Puede conocer | No puede conocer |
|------|---------------|------------------|
| **Domain** | Ninguna externa | Application, Presentation, Infrastructure |
| **Application** | Domain | Presentation, Infrastructure (solo interfaces) |
| **Infrastructure** | Domain (interfaces) | Application, Presentation |
| **Presentation** | Application, Domain (modelos) | Infrastructure (directamente) |

### Excepcion: Composition Root

`src/main.js` es el **Composition Root** el unico lugar donde se ensamblan todas las dependencias:

```javascript
// main.js - Composition Root
const processor = new OpenCvImageProcessor();           // Infrastructure
const loadUseCase = new LoadAndValidateImageUseCase(processor);  // Application
const equalizeUseCase = new EqualizeImageUseCase(processor);     // Application
const expandUseCase = new ExpandImageUseCase(processor);         // Application
const chartRenderer = new ChartJsRenderer();                      // Infrastructure

const appController = new MainController(       // Presentation
  mainView, loadUseCase, equalizeUseCase,
  expandUseCase, chartRenderer
);
```

---

## Flujo de Datos: Carga de Imagen

```
Usuario                      Presentation              Application           Domain              Infrastructure
  │                              │                        │                    │                      │
  │  Drag & Drop archivo         │                        │                    │                      │
  ├─────────────────────────────►│                        │                    │                      │
  │                              │  handleFileSelected()  │                    │                      │
  │                              ├───────────────────────►│                    │                      │
  │                              │                        │  execute(file)     │                      │
  │                              │                        ├───────────────────►│ BrowserFileReader    │
  │                              │                        │                    │ .readAsDataURL()     │
  │                              │                        │                    ├─────────────────────►│
  │                              │                        │                    │  base64 data         │
  │                              │                        │                    │◄─────────────────────┤
  │                              │                        │  ImageModel        │                      │
  │                              │                        │◄───────────────────┤                      │
  │                              │  updateUI(model)       │                    │                      │
  │                              │◄───────────────────────┤                    │                      │
  │  Visualiza imagen + datos    │                        │                    │                      │
  │◄─────────────────────────────┤                        │                    │                      │
```

---

## Flujo de Datos: Ecualizacion

```
Usuario              Presentation          Application           Domain              Infrastructure
  │                      │                     │                    │                      │
  │  Click "Ecualizar"   │                     │                    │                      │
  ├─────────────────────►│                     │                    │                      │
  │                      │  handleEqualize()   │                    │                      │
  │                      ├────────────────────►│                    │                      │
  │                      │                     │  execute(src,dst)  │                      │
  │                      │                     ├───────────────────►│ OpenCvImageProcessor │
  │                      │                     │                    │ .applyEqualization() │
  │                      │                     │                    ├─────────────────────►│
  │                      │                     │                    │  HistogramModel      │
  │                      │                     │                    │◄─────────────────────┤
  │                      │                     │  HistogramModel    │                      │
  │                      │                     │◄───────────────────┤                      │
  │                      │  render histograms  │                    │                      │
  │                      │◄────────────────────┤                    │                      │
  │  Visualiza resultado │                     │                    │                      │
  │◄─────────────────────┤                     │                    │                      │
```

---

## Patrones DDD Utilizados

### Entidades

**ImageModel** — Entidad con identidad y ciclo de vida:

```javascript
class ImageModel {
  constructor(isStrictGrayscale, metadata, histogramModel) {
    this.isStrictGrayscale = isStrictGrayscale;
    this.metadata = { totalPixels, width, height, minVal, maxVal };
    this.histogramData = histogramModel;
  }
}
```

- Tiene estado mutable (se crea durante la carga y se consume durante el procesamiento).
- Encapsula la relacion entre metadata de imagen y datos de histograma.

### Value Objects

**HistogramModel** — Objeto valor inmutable:

```javascript
class HistogramModel {
  constructor(frequencies) {
    if (frequencies.length !== 256) throw new Error("...");
    this.frequencies = frequencies;  // Inmutables despues de construccion
  }
}
```

- Representa un concepto matematico puro (256 niveles de intensidad).
- Sin identidad: dos histogramas con las mismas frecuencias son equivalentes.
- Validacion en el constructor (invariante de dominio).

**HistogramMath** — Objeto valor con logica pura:

```javascript
class HistogramMath {
  constructor(histogramModel) {
    this.computeEqualization();  // CDF + LUT
    this.computeExpansion();     // Linear mapping
  }
}
```

- Contiene funciones puras de calculo matematico.
- Sin dependencias de OpenCV ni del DOM.

### Services (Interfaces)

**ImageProcessor** — Contrato de dominio:

```javascript
class ILoadProcessor {
  executeMathematicalPipeline(sourceId, destinationId) { throw new Error("..."); }
  checkIfGrayscale(imageMatrix) { throw new Error("..."); }
  extractHistogram(imageMatrix) { throw new Error("..."); }
}

class ITransformProcessor {
  applyEqualization(sourceId, destinationId) { throw new Error("..."); }
  applyExpansion(sourceId, destinationId) { throw new Error("..."); }
}
```

- Definen que puede hacer la capa de infraestructura.
- El dominio no conoce la implementacion (OpenCV.js).

### Use Cases

**Orquestadores de negocio** que coordinan modelos y servicios:

```javascript
class EqualizeImageUseCase {
  constructor(transformProcessor) {  // Depende de la interfaz
    this.transformProcessor = transformProcessor;
  }
  execute(sourceId, destinationId) {
    return this.transformProcessor.applyEqualization(sourceId, destinationId);
  }
}
```

---

## Arquitectura de Componentes (Web Components)

Los componentes usan la **Web Components API** nativa:

```
<top-nav-bar>                 ─── Navegacion + Theme Toggle
<main>
  ├── <image-info-panel>      ─── Metadata de imagen
  ├── <workspace-drop-zone>   ─── Area de trabajo + Drop + Canvas
  ├── <error-alert>           ─── Notificaciones de error
  └── <analysis-panel>        ─── Histogramas + Metricas + Tabs
<history-drawer>              ─── Historial lateral
```

### Patron de Comunicacion

```
Custom Events (bubbles + composed)
Component ──Event──► Controller ──Method──► View ──DOM──► Component
```

Los componentes se comunican exclusivamente a traves de **Custom Events**:

```javascript
// Componente emite
this.dispatchEvent(new CustomEvent('on-image-selected', {
  bubbles: true,
  composed: true,
  detail: { file }
}));

// View escucha
this.workspace.addEventListener('on-image-selected', (e) => {
  handler(e.detail.file);
});
```

---

## Separacion de Responsabilidades

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Domain** | Reglas de negocio puras | Validacion de 256 niveles, calculo de CDF |
| **Application** | Orquestacion de operaciones | Coordinar carga + validacion + extraccion |
| **Infrastructure** | Implementacion tecnica | OpenCV.js, FileReader, Chart.js |
| **Presentation** | Interfaz de usuario | Web Components, eventos, binding |
| **Shared** | Recursos transversales | i18n, temas, estilos globales |

---

## Principios SOLID Aplicados

- **S** (Single Responsibility): Cada clase tiene una unica razon para cambiar.
- **O** (Open/Closed): Las interfaces permiten agregar nuevas implementaciones sin modificar existentes.
- **L** (Liskov Substitution): `OpenCvImageProcessor` cumple todos los contratos de `ILoadProcessor` e `ITransformProcessor`.
- **I** (Interface Segregation): Tres interfaces separadas (`ILoadProcessor`, `IHistogramProcessor`, `ITransformProcessor`).
- **D** (Dependency Inversion): Los use cases dependen de interfaces, no de implementaciones concretas.

---

## Siguiente

- [Guia de Componentes](./componentes.md) — Detalle de cada Web Component
- [Casos de Uso](./casos-de-uso.md) — Logica de negocio de cada Use Case
