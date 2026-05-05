<!-- markdownlint-disable MD033 -->
<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://trinity-bytes.github.io/grayscale-studio/assets/branding/grayscale-studio-full-logo-negativo.png" />
        <source media="(prefers-color-scheme: light)" srcset="https://trinity-bytes.github.io/grayscale-studio/assets/branding/grayscale-studio-full-logo.png" />
        <img src="https://trinity-bytes.github.io/grayscale-studio/assets/branding/grayscale-studio-full-logo.png" alt="Logotipo de Grayscale Studio" width="300">
    </picture>
</div>
<p align="center"><strong>Procesa y mejora imágenes en escala de grises con precisión profesional</strong></p>
<p align="center">
    <a href="https://trinity-bytes.github.io/grayscale-studio/" target="_blank">
        <img src="https://img.shields.io/badge/Demo%20en%20vivo-0078d4?style=for-the-badge&logo=github&logoColor=white" alt="Abrir demo en vivo" />
    </a>
</p>
<!-- markdownlint-enable MD033 -->

> Aplicación web profesional para la expansión y ecualización de histogramas de imágenes en escala de grises, construida bajo los principios de Clean Architecture y Domain-Driven Design (DDD).

## Tabla de contenidos

- [Tabla de contenidos](#tabla-de-contenidos)
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características Implementadas](#características-implementadas)
- [Tecnologías y Librerías](#tecnologías-y-librerías)
- [Arquitectura del Proyecto (DDD + SOLID)](#arquitectura-del-proyecto-ddd--solid)
- [Inicio Rápido (Desarrollo)](#inicio-rápido-desarrollo)
- [Instrucciones de Uso](#instrucciones-de-uso)

---

## Descripción del Proyecto

**GrayScale Studio** es una moderna herramienta web diseñada para procesar imágenes en blanco y negro (JPG/JPEG). Validando matemáticamente que la imagen carezca de canales de color, el sistema extrae las frecuencias de intensidades (0-255), renderiza el histograma original y permite aplicar transformaciones de contraste no lineales (Ecualización) y lineales (Expansión Min-Max).

El proyecto destaca por su rigurosa arquitectura de software basada en Vanilla JavaScript y ahora utiliza **Vite** como servidor de desarrollo y bundler, separando la lógica de negocio pura de las implementaciones de UI (DOM) y de las librerías matemáticas y gráficas.

---

## Características Implementadas

- **Carga Intuitiva:** Interfaz Drag & Drop o selección manual clásica para archivos locales.
- **Validación Estricta de Color:** Uso de OpenCV.js para verificar las diferencias cromáticas entre canales. Las imágenes con color son rechazadas instantáneamente protegiendo la integridad de la lógica de grises.
- **Procesamiento Asíncrono:** Bloqueo de UI coordinado. El usuario no puede interactuar hasta que el motor WebAssembly de OpenCV esté montado.
- **Ecualización de Histograma:** Redistribución plana de intensidades mediante `cv.equalizeHist`.
- **Expansión de Histograma (Min-Max):** Estiramiento lineal del rango dinámico utilizando `cv.normalize`.
- **Renderizado de Gráficos:** Visualización de Histogramas comparativos en tiempo real (Original vs Procesado) renderizados eficientemente con **Chart.js**, evitando fugas de memoria mediante la gestión de ciclo de vida de los lienzos.

---

## Tecnologías y Librerías

| Tecnología | Rol en la Arquitectura |
|---|---|
| **HTML5 / CSS3** | Capa de Presentación (UI y estructura) |
| **Vanilla JavaScript (ES6 Modules)** | Capas de Dominio, Aplicación e Infraestructura |
| **Vite** | Servidor de desarrollo local, bundler y build optimizado para distribución |
| **[OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) (CDN)** | Motor matemático (Infraestructura). Inyectado mediante WebAssembly. |
| **[Chart.js](https://www.chartjs.org/) (CDN)** | Renderizado interactivo de datos de histograma (Infraestructura). |

---

## Arquitectura del Proyecto (DDD + SOLID)

El proyecto está organizado como un solo árbol visual, desde los recursos públicos hasta las capas internas de la app:

```text
grayscale-studio/
├─ index.html
├─ public/
│  ├─ assets/
│  │  ├─ branding/
│  │  ├─ cursors/
│  │  ├─ fonts/
│  │  └─ images/
│  └─ docs/
├─ src/
│  ├─ main.js                        # Composition Root y punto de arranque
│  ├─ application/
│  │  ├─ LoadAndValidateImageUseCase.js
│  │  ├─ EqualizeImageUseCase.js
│  │  └─ ExpandImageUseCase.js       # Casos de uso de la aplicación
│  ├─ domain/
│  │  ├─ models/
│  │  │  ├─ ImageModel.js
│  │  │  └─ HistogramModel.js
│  │  └─ services/
│  │     └─ ImageProcessor.js        # Contrato de dominio
│  ├─ infrastructure/
│  │  ├─ file/
│  │  │  └─ BrowserFileReader.js
│  │  ├─ opencv/
│  │  │  └─ OpenCvImageProcessor.js   # Procesamiento matemático con OpenCV.js
│  │  └─ chart/
│  │     └─ ChartJsRenderer.js       # Renderizado de histogramas con Chart.js
│  ├─ presentation/
│  │  ├─ views/
│  │  │  └─ MainView.js
│  │  ├─ controllers/
│  │  │  └─ MainController.js
│  │  └─ components/
│  │     ├─ AnalysisPanel/
│  │     ├─ ErrorAlert/
│  │     ├─ ImageInfoPanel/
│  │     ├─ ProcessingControls/
│  │     ├─ TopNavBar/
│  │     └─ WorkspaceDropZone/
│  └─ shared/
│     ├─ components/
│     │  └─ PrimaryButton/
│     └─ styles/
└─ stitch_assets/
   └─ workspace_main.html
```

Este diseño mantiene el flujo principal bien delimitado: `MainView` captura la interacción, `MainController` coordina la experiencia, los `UseCase` ejecutan la intención de negocio, el dominio conserva las reglas puras y la infraestructura resuelve los detalles externos sin contaminar las capas superiores.

---

## Inicio Rápido (Desarrollo)

Esta aplicación ahora está integrada con **Vite** para un flujo de desarrollo moderno y un build optimizado.

1. Asegúrate de tener instalado `Node.js` (recomendado `>=16`).
2. Abre la carpeta del proyecto en tu terminal.
3. Instala las dependencias:
   - `npm install`
4. Inicia el servidor de desarrollo:
   - `npm run dev`
5. Abre la URL local que muestra Vite en la terminal, por ejemplo `http://localhost:5173`.

Para generar la versión de producción:

- `npm run build`

Para previsualizar el build de producción localmente:

- `npm run preview`

---

## Instrucciones de Uso

1. Arrastra una fotografía **exclusivamente en escala de grises** (.jpg / .jpeg) a la zona delimitada.
2. Si subes una imagen con color, el panel de notificaciones bloqueará la operación con un recuadro de Error nativo.
3. Al aceptar una imagen válida, el área de trabajo se revelará mostrando tu fotografía original, sus metadatos (píxeles, rango) y su gráfico dinámico correspondiente.
4. Utiliza los controles superiores para ejecutar **"Ecualizar Histograma"** o **"Expandir Histograma"**.
5. Disfruta de la métrica comparativa renderizada al lado derecho de la pantalla. Puedes alternar repetidamente entre las operaciones.

---

