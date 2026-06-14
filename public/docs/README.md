# GrayScale Studio — Documentacion Principal

> Aplicacion web profesional para ecualizacion y expansion de histogramas de imagen en escala de grises, construida con Clean Architecture y Domain-Driven Design (DDD).

---

## Inicio Rapido

```bash
# 1. Clonar el repositorio
git clone https://github.com/trinity-bytes/grayscale-studio.git
cd grayscale-studio

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# La URL se mostrara en la terminal (ej: http://localhost:5173)
```

### Comandos Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Genera el build de produccion en `dist/` |
| `npm run preview` | Previsualiza el build de produccion localmente |
| `npm run test` | Ejecuta los tests con Vitest |
| `npm run test:watch` | Ejecuta tests en modo watch |

---

## Descripcion del Proyecto

**GrayScale Studio** es una herramienta web disenada para procesar imagenes en escala de grises. Valida matematicamente que la imagen carezca de canales de color, extrae las frecuencias de intensidades (0-255), renderiza el histograma original y permite aplicar transformaciones de contraste:

- **Ecualizacion de Histograma**: Redistribucion uniforme de intensidades usando `cv.equalizeHist`.
- **Expansion de Histograma (Min-Max)**: Estiramiento lineal del rango dinamico usando `cv.normalize`.

---

## Arquitectura del Proyecto

El proyecto sigue los principios de **Clean Architecture** y **DDD**, organizado en capas con dependencias que apuntan hacia adentro:

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION                        │
│   Web Components, Views, Controllers                 │
├─────────────────────────────────────────────────────┤
│                  APPLICATION                         │
│   Use Cases (LoadAndValidate, Equalize, Expand)      │
├─────────────────────────────────────────────────────┤
│                    DOMAIN                            │
│   Models (ImageModel, HistogramModel, HistogramMath) │
│   Services (ImageProcessor interfaces)               │
├─────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE                       │
│   OpenCV.js, Chart.js, BrowserFileReader             │
└─────────────────────────────────────────────────────┘
```

Para mas detalles, ver [Arquitectura Detallada](./arquitectura.md).

---

## Estructura de Directorios

```
grayscale-studio/
├── index.html                          # Entry point HTML
├── package.json                        # Dependencias y scripts
├── vite.config.js                      # Configuracion de Vite
├── vitest.config.js                    # Configuracion de tests
├── public/
│   ├── assets/                         # Recursos estaticos
│   │   ├── branding/                   # Logos e isotipos
│   │   ├── cursors/                    # Cursores SVG personalizados
│   │   ├── fonts/                      # Fuentes Poppins (locales)
│   │   └── images/                     # Imagenes de fondo
│   └── docs/                           # Esta documentacion
├── src/
│   ├── main.js                         # Composition Root
│   ├── domain/                         # Capa de Dominio
│   │   ├── models/                     # Entidades y Value Objects
│   │   │   ├── ImageModel.js
│   │   │   ├── HistogramModel.js
│   │   │   └── HistogramMath.js
│   │   └── services/                   # Contratos/Interfaces
│   │       └── ImageProcessor.js
│   ├── application/                    # Capa de Aplicacion
│   │   ├── LoadAndValidateImageUseCase.js
│   │   ├── EqualizeImageUseCase.js
│   │   └── ExpandImageUseCase.js
│   ├── infrastructure/                 # Capa de Infraestructura
│   │   ├── file/
│   │   │   └── BrowserFileReader.js
│   │   ├── opencv/
│   │   │   └── OpenCvImageProcessor.js
│   │   └── chart/
│   │       └── ChartJsRenderer.js
│   ├── presentation/                   # Capa de Presentacion
│   │   ├── views/
│   │   │   └── MainView.js
│   │   ├── controllers/
│   │   │   └── MainController.js
│   │   └── components/                 # Web Components
│   │       ├── AnalysisPanel/
│   │       ├── ErrorAlert/
│   │       ├── HistoryDrawer/
│   │       ├── ImageInfoPanel/
│   │       ├── TopNavBar/
│   │       └── WorkspaceDropZone/
│   └── shared/                         # Recursos compartidos
│       ├── components/
│       │   ├── PrimaryButton/
│       │   └── EmptyState/
│       ├── i18n/
│       │   └── strings.js
│       ├── styles/
│       │   ├── main.css
│       │   ├── typography.css
│       │   ├── effects.css
│       │   ├── cursors.css
│       │   └── layout.css
│       └── utils/
│           └── ThemeManager.js
```

---

## Stack Tecnologico

| Tecnologia | Rol |
|------------|-----|
| **Vanilla JavaScript (ES6 Modules)** | Lenguaje principal, todas las capas |
| **Vite** | Servidor de desarrollo, bundler y build de produccion |
| **OpenCV.js (WebAssembly)** | Motor de procesamiento de imagenes |
| **Chart.js** | Renderizado interactivo de histogramas |
| **Tailwind CSS (CDN)** | Sistema de estilos utility-first |
| **Web Components API** | Componentes de UI nativos del navegador |
| **Vitest** | Framework de testing |

---

## Caracteristicas Principales

- **Carga por Drag & Drop**: Interfaz intuitiva para subir imagenes
- **Validacion Estricta de Grises**: Rechaza imagenes a color automaticamente
- **Ecualizacion de Histograma**: Redistribucion uniforme de intensidades
- **Expansion Min-Max**: Estiramiento lineal del rango dinamico
- **Visualizacion Matematica**: Graficos duales con histograma + LUT
- **Metricas Estadisticas**: Min, Max, Media y Desviacion Estandar
- **Historial de Operaciones**: Registro persistente en LocalStorage
- **Modo Oscuro / Claro**: Tema adaptable con persistencia
- **Optimizado para Escritorio**: Diseno responsive con guardia movil

---

## Documentacion Relacionada

| Documento | Descripcion |
|-----------|-------------|
| [Arquitectura Detallada](./arquitectura.md) | Clean Architecture, DDD, flujo de datos |
| [Guia de Componentes](./componentes.md) | Web Components: propiedades, eventos, uso |
| [Casos de Uso](./casos-de-uso.md) | Use Cases: proposito, entradas/salidas, errores |
| [Guia para Desarrolladores](./guia-desarrollador.md) | Como extender, testear y contribuir |
| [Sistema de Estilos](./estilos-y-tema.md) | Tailwind, tokens, temas, CSS |
| [Referencia Tecnica](./api-referencia.md) | Clases, interfaces, metodos, eventos |

---

## Licencia

ISC

---

## Creditos

- **OpenCV.js**: Motor de procesamiento de imagenes via WebAssembly
- **Chart.js**: Renderizado de graficos de histograma
- **Tailwind CSS**: Framework de estilos utility-first
- **Poppins**: Familia tipografica utilizada en toda la interfaz
