<!-- markdownlint-disable MD033 -->
<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://grayscale.jahattrinidad.com/assets/branding/grayscale-studio-full-logo-negativo.png" />
        <source media="(prefers-color-scheme: light)" srcset="https://grayscale.jahattrinidad.com/assets/branding/grayscale-studio-full-logo.png" />
        <img src="https://grayscale.jahattrinidad.com/assets/branding/grayscale-studio-full-logo.png" alt="Logotipo de Grayscale Studio" width="300">
    </picture>
</div>
<p align="center"><strong>Procesa y mejora imágenes en escala de grises con precisión profesional</strong></p>
<p align="center">
    <a href="https://grayscale.jahattrinidad.com/" target="_blank">
        <img src="https://img.shields.io/badge/Demo%20en%20vivo-0078d4?style=for-the-badge&logo=github&logoColor=white" alt="Abrir demo en vivo" />
    </a>
    <a href="https://github.com/trinity-bytes/grayscale-studio/releases/tag/v0.10.0" target="_blank">
        <img src="https://img.shields.io/badge/release-v0.10.0-0043c8?style=for-the-badge" alt="Último release" />
    </a>
</p>
<!-- markdownlint-enable MD033 -->

> Aplicación web profesional para la expansión y ecualización de histogramas de imágenes en escala de grises, construida bajo los principios de Clean Architecture y Domain-Driven Design (DDD).

---

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Inicio rápido](#inicio-rápido)
- [Uso](#uso)
- [Testing](#testing)
- [Documentación](#documentación)

---

## Descripción del proyecto

**GrayScale Studio** es una herramienta web diseñada para procesar imágenes en blanco y negro (JPG/JPEG/PNG). Validando matemáticamente que la imagen carezca de canales de color, el sistema extrae las frecuencias de intensidades (0-255), renderiza el histograma original y permite aplicar transformaciones de contraste:

- **Ecualización** (no lineal): redistribución mediante CDF normalizada por el primer acumulado no nulo.
- **Expansión** (lineal): estiramiento del rango dinámico Min-Max.

El proyecto está construido con **Vanilla JavaScript** (Web Components), **OpenCV.js** para procesamiento de imagen, **Chart.js** para visualización de histogramas, **CSS nativo** para estilos, y **Vite** como bundler.

---

## Características

### Procesamiento de imagen
- **Carga por drag & Drop** o selección manual de archivos.
- **Validación estricta de color** con OpenCV.js — imágenes con color son rechazadas.
- **Ecualización de histograma** redistribución CDF con tabla de conversión paso a paso.
- **Expansión Min-Max** estiramiento lineal del rango dinámico con procedimiento explicado.

### Interfaz
- **Estudio oscuro** con imágenes e histogramas asociados y un inspector matemático persistente (CDF/LUT).
- **Operación explícita** — selecciona Ecualización o Expansión y pulsa Aplicar; Reemplazar permite cargar otra imagen.
- **Inspección accesible** — selección de intensidad por teclado, LUT de 256 niveles y tablas de frecuencias por distribución.
- **Métricas comparativas** — Mín, Máx, Media, Desviación Estándar del histograma.
- **Historial de operaciones** — drawer lateral con las últimas 20 operaciones persistidas en localStorage.
- **Modo exclusivamente oscuro** con superficies neutras y fuentes locales Poppins/IBM Plex Mono.
- **Navegación activa** con indicador de estado WASM.
- **Dispositivos** — escritorio y tablet horizontal; tablet vertical pide girar, teléfono requiere otro dispositivo y escritorio estrecho pide maximizar.

---

## Tecnologías

| Tecnología | Rol |
|---|---|
| **Vanilla JavaScript (ES6 Modules)** | Capas de Dominio, Aplicación, Infraestructura y Presentación |
| **Web Components** | Componentes de UI custom (Custom Elements) |
| **Vite** | Servidor de desarrollo, bundler y build de producción |
| **[OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)** | Motor de procesamiento de imagen (WebAssembly) |
| **[Chart.js](https://www.chartjs.org/)** | Renderizado interactivo de histogramas |
| **CSS nativo** | Tokens y estilos de componentes, sin CDN de estilos |
| **[Poppins](https://fonts.google.com/specimen/Poppins)** | Familia tipográfica (carga local) |

---

## Arquitectura

Proyecto estructurado bajo **Clean Architecture** y **Domain-Driven Design**:

```text
grayscale-studio/
├─ index.html                          # Entry point HTML
├─ public/
│  ├─ assets/                          # Branding, fuentes, cursores, imágenes
│  └─ docs/                            # Documentación completa del proyecto
├─ src/
│  ├─ main.js                          # Composition Root (inyección de dependencias)
│  ├─ domain/                          # Capa de Dominio (reglas puras)
│  │  ├─ models/
│  │  │  ├─ ImageModel.js              # Entidad de imagen
│  │  │  ├─ HistogramModel.js          # Modelo de histograma
│  │  │  └─ HistogramMath.js           # Funciones puras (CDF, LUT, métricas)
│  │  └─ services/
│  │     └─ ImageProcessor.js          # Contrato de dominio (interfaz)
│  ├─ application/                     # Capa de Aplicación (casos de uso)
│  │  ├─ LoadAndValidateImageUseCase.js
│  │  ├─ EqualizeImageUseCase.js
│  │  └─ ExpandImageUseCase.js
│  ├─ infrastructure/                  # Capa de Infraestructura (implementaciones)
│  │  ├─ file/BrowserFileReader.js     # Lectura de archivos via File API
│  │  ├─ opencv/OpenCvImageProcessor.js # Implementación con OpenCV.js
│  │  └─ chart/ChartJsRenderer.js      # Renderizado con Chart.js
│  ├─ presentation/                    # Capa de Presentación (UI)
│  │  ├─ views/MainView.js
│  │  ├─ controllers/MainController.js
│  │  └─ components/
│  │     ├─ AnalysisPanel/             # Panel de análisis con 3 pestañas
│  │     ├─ ErrorAlert/                # Alerta de errores inline
│  │     ├─ HistoryDrawer/             # Drawer de historial de operaciones
│  │     ├─ ImageInfoPanel/            # Panel de metadatos de imagen
│  │     ├─ TopNavBar/                 # Barra de navegación superior
│  │     └─ WorkspaceDropZone/         # Zona de arrastre + canvas
│  └─ shared/                          # Código compartido
│     ├─ components/
│     │  ├─ PrimaryButton/             # Botón reutilizable
│     │  └─ EmptyState/                # Placeholder de estado vacío
│     ├─ i18n/strings.js               # Cadena de textos (i18n)
│     ├─ utils/ThemeManager.js         # Gestor de tema claro/oscuro
│     └─ styles/                       # CSS global (tipografía, efectos, cursores, layout)
└─ package.json
```

**Flujo de datos:**
`Usuario` → `MainView` → `MainController` → `UseCase` → `Domain` → `Infrastructure` → `Chart.js / OpenCV`

Las dependencias apuntan hacia adentro: la infraestructura implementa contratos del dominio, los casos de uso orquestan la lógica, y el controller coordina la UI sin conocer los detalles de procesamiento.

---

## Inicio rápido

Requisitos: [Node.js](https://nodejs.org/) >= 16

```bash
# Clonar el repositorio
git clone https://github.com/trinity-bytes/grayscale-studio.git
cd grayscale-studio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir la URL que muestra Vite en la terminal (generalmente `http://localhost:5173`).

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Preview del build de producción |
| `npm run test` | Ejecutar tests (Vitest) |
| `npm run test:watch` | Tests en modo watch |

---

## Uso

1. Arrastra una imagen PNG/JPG en escala de grises o pulsa **Seleccionar archivo**. Las imágenes con color se rechazan sin registrar operaciones.
2. Compara la imagen original y su histograma; los metadatos aparecen junto al nombre del archivo.
3. Selecciona **Ecualización** o **Expansión** y pulsa **Aplicar**. Cambiar la selección por sí solo no procesa la imagen.
4. Inspecciona la intensidad de entrada, la CDF/LUT y sus valores reales; **Inspeccionar LUT** muestra los 256 niveles. **Ver frecuencias** expone los datos de cada histograma.
5. Usa **Reemplazar** para otra imagen y **Historial** para consultar las últimas operaciones. El borrado solicita confirmación.
6. Utiliza escritorio o tablet horizontal. La interfaz es exclusivamente oscura.

---

## Testing

```bash
npm run test         # Ejecutar una vez
npm run test:watch   # Modo watch (re-ejecuta al guardar)
```

Los tests cubren la lógica matemática del dominio (CDF, LUT, métricas de histograma).

---

## Documentación

El sistema visual actual y la procedencia de sus recursos están en [DESIGN.md](DESIGN.md).


La documentación completa del proyecto está en [`public/docs/`](public/docs/):

| Documento | Contenido |
|---|---|
| [README.md](public/docs/README.md) | Hub principal, quick start, stack |
| [arquitectura.md](public/docs/arquitectura.md) | Clean Architecture, DDD, diagramas ASCII, SOLID |
| [componentes.md](public/docs/componentes.md) | Guía de los 8 componentes Web Components |
| [casos-de-uso.md](public/docs/casos-de-uso.md) | 3 use cases con algoritmos matemáticos |
| [guia-desarrollador.md](public/docs/guia-desarrollador.md) | Cómo extender el proyecto |
| [estilos-y-tema.md](public/docs/estilos-y-tema.md) | Sistema de diseño, Tailwind, dark mode |
| [api-referencia.md](public/docs/api-referencia.md) | Referencia técnica de todas las clases |

---

## Licencia

ISC


### Verificación matemática con OpenCV real

La suite de Vitest no sustituye la comparación numérica con el motor. Ejecute el verificador explícito con el fixture oficial OpenCV.js 4.8.0 guardado fuera del repositorio:

```bash
node scripts/verify-opencv.mjs --runtime /absolute/path/to/opencv.cjs
```

No instala dependencias ni descarga archivos automáticamente. Rechaza un fixture con hash distinto y falla si hay diferencias de píxeles o histogramas. Instrucciones, hash y alcance en [la verificación numérica](docs/audits/numerical-consistency.md).
