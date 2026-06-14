# Guia para Desarrolladores

> Como extender GrayScale Studio: nuevos componentes, use cases, infraestructura y testing.

---

## Convenciones del Proyecto

### Estructura de Archivos

```
src/
├── domain/
│   ├── models/           # Entidades y Value Objects (ClassName.js)
│   └── services/         # Interfaces/Contratos (NombreInterface.js)
├── application/          # Use Cases (NombreUseCase.js)
├── infrastructure/       # Implementaciones (nombre-tecnologia/)
│   ├── file/
│   ├── opencv/
│   └── chart/
├── presentation/
│   ├── views/            # Vistas (MainView.js)
│   ├── controllers/      # Controllers (MainController.js)
│   └── components/       # Web Components (NombreComponente/)
│       ├── NombreComponente.js
│       ├── NombreComponente.html
│       └── NombreComponente.css
└── shared/
    ├── components/       # Componentes reutilizables
    ├── i18n/             # Internacionalizacion
    ├── styles/           # Estilos globales
    └── utils/            # Utilidades
```

### Naming Convention

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Clase | `PascalCase` | `ImageModel`, `LoadAndValidateImageUseCase` |
| Archivo clase | `PascalCase.js` | `HistogramModel.js` |
| Archivo test | `Nombre.test.js` | `HistogramMath.test.js` |
| Web Component | `kebab-case` | `analysis-panel`, `workspace-drop-zone` |
| Directorio componente | `PascalCase/` | `AnalysisPanel/` |
| CSS Custom Property | `--kebab-case` | `--glass-bg-color` |
| Evento Custom | `on-kebab-case` | `on-image-selected` |

### Modulo ES

- Todos los archivos usan `export` / `import` (ES6 Modules).
- El punto de entrada es `src/main.js`.
- Vite resuelve los imports y empaqueta el bundle.

---

## Como Agregar un Nuevo Componente

### Paso 1: Crear la Estructura

```
src/presentation/components/NuevoComponente/
├── NuevoComponente.js
├── NuevoComponente.html
└── NuevoComponente.css
```

### Paso 2: Implementar el Componente

```javascript
// NuevoComponente.js
import html from './NuevoComponente.html?raw';
import './NuevoComponente.css';

export class NuevoComponente extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    // Escuchar eventos internos
  }

  // Metodos publicos
  mi Metodo(param) {
    // Logica
  }

  // Emision de eventos
  _emitChange(data) {
    this.dispatchEvent(new CustomEvent('on-nuevo-cambio', {
      bubbles: true,
      composed: true,
      detail: { data }
    }));
  }
}

customElements.define('nuevo-componente', NuevoComponente);
```

### Paso 3: Crear el Template HTML

```html
<!-- NuevoComponente.html -->
<div class="glass-panel p-md rounded-lg">
  <h3 class="font-headline-md text-on-surface">Titulo</h3>
  <p class="font-body-sm text-on-surface-variant">Descripcion</p>
</div>
```

### Paso 4: Crear los Estilos

```css
/* NuevoComponente.css */
:host {
  display: block;
}
```

### Paso 5: Registrar en el Index

```javascript
// src/presentation/components/index.js
export { NuevoComponente } from './NuevoComponente/NuevoComponente.js';
```

### Paso 6: Usar en el HTML

```html
<!-- index.html -->
<nuevo-componente id="mi-componente"></nuevo-componente>
```

---

## Como Agregar un Nuevo Use Case

### Paso 1: Definir el Contrato en Dominio (si es necesario)

```javascript
// src/domain/services/ImageProcessor.js
export class INuevoProcessor {
  executeOperation(data) {
    throw new Error("El metodo executeOperation debe ser implementado.");
  }
}
```

### Paso 2: Crear el Use Case

```javascript
// src/application/NuevoUseCase.js
export class NuevoUseCase {
  constructor(nuevoProcessor) {
    this.nuevoProcessor = nuevoProcessor;
  }

  execute(param1, param2) {
    return this.nuevoProcessor.executeOperation(param1, param2);
  }
}
```

### Paso 3: Implementar en Infraestructura

```javascript
// src/infrastructure/nuevo/NuevoProcessor.js
import { INuevoProcessor } from '../../domain/services/ImageProcessor.js';

export class NuevoProcessor extends INuevoProcessor {
  executeOperation(data) {
    // Implementacion concreta
    return resultado;
  }
}
```

### Paso 4: Ensamblar en el Composition Root

```javascript
// src/main.js
import { NuevoUseCase } from './application/NuevoUseCase.js';
import { NuevoProcessor } from './infrastructure/nuevo/NuevoProcessor.js';

const nuevoProcessor = new NuevoProcessor();
const nuevoUseCase = new NuevoUseCase(nuevoProcessor);

// Inyectar en el Controller
const appController = new MainController(
  mainView, loadUseCase, equalizeUseCase,
  expandUseCase, chartRenderer, nuevoUseCase  // <-- nueva dependencia
);
```

---

## Como Agregar Nueva Infraestructura

### Patron: Adapter

Cada implementacion de infraestructura es un **Adapter** que implementa una interfaz de dominio:

```
Dominio (Interfaz)          Infraestructura (Implementacion)
INuevoProcessor      ◄──    NuevoProcessor (usa tecnologia X)
```

### Ejemplo: Nuevo Adaptador de Procesamiento

```javascript
// src/infrastructure/nuevo/NuevoProcessor.js
export class NuevoProcessor {
  executeMathematicalPipeline(sourceId, destinationId) {
    // 1. Leer imagen con la nueva tecnologia
    // 2. Procesar
    // 3. Extraer histograma
    // 4. Retornar ImageModel
  }

  checkIfGrayscale(matrix) {
    // Implementacion con la nueva tecnologia
  }

  extractHistogram(matrix) {
    // Retornar new HistogramModel(frequencies)
  }
}
```

### Reglas

1. La infraestructura solo conoce al Dominio (modelos e interfaces).
2. Nunca importar desde Application o Presentation.
3. Siempre implementar la interfaz completa.
4. Liberar recursos correctamente (memoria, suscripciones, etc.).

---

## Testing

### Configuracion

El proyecto usa **Vitest** con entorno `jsdom`:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### Ejecutar Tests

```bash
npm run test          # Ejecucion unica
npm run test:watch    # Modo watch
```

### Estructura de Tests

Los tests se colocan junto a los archivos que testean:

```
src/domain/models/
├── HistogramMath.js
└── HistogramMath.test.js
```

### Ejemplo de Test

```javascript
// HistogramMath.test.js
import { describe, it, expect } from 'vitest';
import { HistogramMath } from './HistogramMath.js';
import { HistogramModel } from './HistogramModel.js';

describe('HistogramMath', () => {
  it('debe calcular CDF correctamente', () => {
    const frequencies = new Array(256).fill(0);
    frequencies[100] = 100;
    frequencies[200] = 100;

    const model = new HistogramModel(frequencies);
    const math = new HistogramMath(model);

    const { cdf } = math.getEqualizationData();
    expect(cdf[99]).toBe(0);
    expect(cdf[100]).toBeCloseTo(0.5, 2);
    expect(cdf[200]).toBeCloseTo(1.0, 2);
  });

  it('debe calcular expansion lineal', () => {
    const frequencies = new Array(256).fill(0);
    frequencies[50] = 10;
    frequencies[150] = 10;

    const model = new HistogramModel(frequencies);
    const math = new HistogramMath(model);

    const { lut } = math.getExpansionData();
    expect(lut[50]).toBe(0);
    expect(lut[150]).toBe(255);
  });
});
```

### Que Testear

| Capa | Tipo de Test | Ejemplo |
|------|-------------|---------|
| **Domain** | Unitarios puros | HistogramMath, HistogramModel |
| **Application** | Unitarios con mocks | Use Cases con mocked processors |
| **Infrastructure** | Integracion | BrowserFileReader con jsdom |
| **Presentation** | Componentes | Web Components con testing library |

---

## Estilos y Tema

Ver [Sistema de Estilos](./estilos-y-tema.md) para detalles completos.

### Reglas Rapidas

1. Usar clases de Tailwind siempre que sea posible.
2. Tokens CSS para colores semanticos (modo oscuro/claro).
3. Componentes CSS propios solo cuando Tailwind no alcanza.
4. Los Web Components usan `:host` para estilos del contenedor.

---

## Internacionalizacion (i18n)

Todos los textos visibles estan en `src/shared/i18n/strings.js`:

```javascript
import { strings } from '../../shared/i18n/strings.js';

// En un componente
this.querySelector('#title').textContent = strings.analysis.title;
```

### Para Agregar un Nuevo Texto

```javascript
// strings.js
export const strings = {
  // ...existentes
  nuevoModulo: {
    titulo: 'Titulo en Espanol',
    descripcion: 'Descripcion en Espanol',
  },
};
```

---

## Git y Commits

### Formato de Commits

```
tipo(alcance): descripcion corta

Tipos: feat, fix, docs, style, refactor, test, chore
Alcance: domain, application, infrastructure, presentation, shared
```

### Ejemplos

```
feat(domain): add HistogramMath value object
fix(opencv): release memory after equalization
docs(components): add AnalysisPanel documentation
test(models): add HistogramMath CDF tests
```

---

## Siguiente

- [Sistema de Estilos](./estilos-y-tema.md) — Tokens, temas y CSS
- [Referencia Tecnica](./api-referencia.md) — Firma de metodos completa
