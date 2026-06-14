# Guia de Componentes

> Web Components nativos del navegador: propiedades, eventos, metodos y ejemplos de uso.

---

## Arquitectura de Componentes

Todos los componentes extienden `HTMLElement` y se registran con `customElements.define()`. Siguen el patron de **Custom Events** para comunicarse con el Controller.

```
┌─────────────────────────────────────────────────────────┐
│                    LAYOUT DE UI                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  <top-nav-bar>                                   │   │
│  │  Navegacion + Theme Toggle + WASM Status         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┬────────────────────────┬──────────────┐   │
│  │ <image-  │  <workspace-drop-      │  <analysis-  │   │
│  │  info-   │    zone>               │    panel>    │   │
│  │  panel>  │  Canvas + Toolbar      │  Histogramas │   │
│  │ Metadata │  Drop Zone             │  Metricas    │   │
│  └──────────┴────────────────────────┴──────────────┘   │
│         ▲                                               │
│  ┌──────┴──────┐                                        │
│  │ <error-     │                                        │
│  │   alert>    │                                        │
│  └─────────────┘                                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  <history-drawer>                                │   │
│  │  Panel lateral de historial                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Componentes de Presentacion

### `<analysis-panel>`

Panel de analisis con tabs para histogramas, metricas y visualizaciones matematicas.

**Registro**: `analysis-panel`

**Ubicacion**: `src/presentation/components/AnalysisPanel/`

**Archivos**:
- `AnalysisPanel.js` — Logica del componente
- `AnalysisPanel.html` — Template HTML
- `AnalysisPanel.css` — Estilos especificos

#### Metodos Publicos

| Metodo | Parametros | Descripcion |
|--------|------------|-------------|
| `getOriginalCanvas()` | — | Retorna el `<canvas>` del histograma original |
| `getResultCanvas()` | — | Retorna el `<canvas>` del histograma resultado |
| `getMathEqCanvas()` | — | Retorna el `<canvas>` de ecualizacion matematica |
| `getMathExpCanvas()` | — | Retorna el `<canvas>` de expansion matematica |
| `showEmptyStates()` | — | Muestra estados vacios en todos los tabs |
| `hideEmptyStates()` | — | Oculta estados vacios |
| `switchToVisualTab()` | — | Cambia al tab Visual |
| `switchToMathEqTab()` | — | Cambia al tab de Ecuaciones (Ecualizacion) |
| `switchToMathExpTab()` | — | Cambia al tab de Ecuaciones (Expansion) |
| `showMetrics(containerId, metrics)` | `string`, `{min, max, mean, std}` | Muestra metricas estadisticas |
| `hideMetrics(containerId)` | `string` | Oculta metricas de un contenedor |
| `showHistogramContainers()` | — | Muestra contenedores de histogramas |
| `hideHistogramContainers()` | — | Oculta contenedores de histogramas |
| `showResultHistogram()` | — | Muestra el histograma de resultado |
| `hideResultHistogram()` | — | Oculta el histograma de resultado |
| `showEqualizationTable(frequencies, lut)` | `number[]`, `number[]` | Renderiza tabla de conversion de ecualizacion |
| `showExpansionProcedure(frequencies, lut)` | `number[]`, `number[]` | Renderiza procedimiento de expansion |

#### Tabs Disponibles

| Tab | ID | Contenido |
|-----|----|-----------|
| Visual | `tab-visual` | Histogramas original y resultado |
| Ecuaciones | `tab-math-eq` | Grafico dual de ecualizacion (CDF + LUT) |
| Expansion | `tab-math-exp` | Grafico dual de expansion (LUT lineal) |

#### Ejemplo

```html
<analysis-panel id="analysis-panel"></analysis-panel>

<script>
  const panel = document.getElementById('analysis-panel');
  panel.showMetrics('original-metrics', { min: 0, max: 255, mean: 127.5, std: 50.2 });
  panel.switchToVisualTab();
</script>
```

---

### `<error-alert>`

Alerta de error con boton de cierre y auto-ocultado.

**Registro**: `error-alert`

**Ubicacion**: `src/presentation/components/ErrorAlert/`

#### Metodos Publicos

| Metodo | Parametros | Descripcion |
|--------|------------|-------------|
| `show(message)` | `string` | Muestra la alerta con el mensaje indicado |
| `hide()` | — | Oculta la alerta |

#### Ejemplo

```html
<error-alert id="main-error-alert"></error-alert>

<script>
  const alert = document.getElementById('main-error-alert');
  alert.show('Error al procesar la imagen');
  // Se oculta automaticamente al hacer click en cerrar
</script>
```

---

### `<image-info-panel>`

Panel lateral que muestra metadata de la imagen cargada: resolucion, canales, profundidad de bit y formato.

**Registro**: `image-info-panel`

**Ubicacion**: `src/presentation/components/ImageInfoPanel/`

#### Metodos Publicos

| Metodo | Parametros | Descripcion |
|--------|------------|-------------|
| `updateInfo(resolution, channels, bitDepth, format)` | `string, string, string, string` | Actualiza los valores de metadata |
| `setThumbnail(dataUrl)` | `string` | Establece la miniatura de la imagen |
| `clear()` | — | Limpia toda la informacion mostrada |

#### Ejemplo

```html
<image-info-panel id="image-info-panel"></image-info-panel>

<script>
  const panel = document.getElementById('image-info-panel');
  panel.updateInfo('800 x 600', '1 (Escala de Grises)', '8-bit', 'Cargado desde memoria');
  panel.setThumbnail('data:image/png;base64,...');
</script>
```

---

### `<top-nav-bar>`

Barra de navegacion superior con enlaces de navegacion, toggle de tema y indicador de estado WASM.

**Registro**: `top-nav-bar`

**Ubicacion**: `src/presentation/components/TopNavBar/`

#### Metodos Publicos

| Metodo | Parametros | Descripcion |
|--------|------------|-------------|
| `setWasmStatus(status)` | `'Ready' \| 'Loading'` | Actualiza el indicador de estado de OpenCV |

#### Eventos Emitidos

| Evento | Detail | Descripcion |
|--------|--------|-------------|
| `on-show-workspace` | — | Navegar al area de trabajo |
| `on-show-analysis` | — | Navegar al panel de analisis |
| `on-show-history` | — | Abrir el drawer de historial |

#### Ejemplo

```html
<top-nav-bar></top-nav-bar>

<script>
  const nav = document.querySelector('top-nav-bar');
  nav.setWasmStatus('Ready');
</script>
```

---

### `<workspace-drop-zone>`

Componente principal de trabajo: zona de drag & drop, canvas de imagen original/procesada y toolbar de acciones.

**Registro**: `workspace-drop-zone`

**Ubicacion**: `src/presentation/components/WorkspaceDropZone/`

#### Metodos Publicos

| Metodo | Parametros | Descripcion |
|--------|------------|-------------|
| `showCanvas()` | — | Muestra el canvas y oculta el placeholder |
| `showPlaceholder()` | — | Muestra el placeholder y oculta el canvas |
| `getCanvas()` | — | Retorna el `<canvas>` principal |
| `getProcessedCanvas()` | — | Retorna el `<canvas>` de imagen procesada |
| `showProcessedCanvas()` | — | Muestra el contenedor de imagen procesada |
| `hideProcessedCanvas()` | — | Oculta el contenedor de imagen procesada |
| `resetToOriginal()` | — | Restaura a estado original (oculta procesada) |
| `showToolbar()` | — | Muestra la barra de herramientas |
| `hideToolbar()` | — | Oculta la barra de herramientas |
| `enableToolbarButtons()` | — | Habilita botones Ecualizar y Expandir |
| `disableToolbarButtons()` | — | Deshabilita botones Ecualizar y Expandir |
| `showMathButton()` | — | Muestra el boton "Ver Matematica" |
| `hideMathButton()` | — | Oculta el boton "Ver Matematica" |

#### Eventos Emitidos

| Evento | Detail | Descripcion |
|--------|--------|-------------|
| `on-image-selected` | `{ file: File }` | Archivo seleccionado por el usuario |
| `on-equalize` | — | Solicitud de ecualizacion |
| `on-expand` | — | Solicitud de expansion |
| `on-show-math` | — | Solicitud de ver grafico matematico |
| `on-error` | `{ message: string }` | Error durante la interaccion |

#### Ejemplo

```html
<workspace-drop-zone id="main-workspace"></workspace-drop-zone>

<script>
  const ws = document.getElementById('main-workspace');
  ws.addEventListener('on-image-selected', (e) => {
    console.log('Archivo:', e.detail.file.name);
  });
</script>
```

---

### `<history-drawer>`

Drawer lateral que muestra el historial de operaciones (ecualizaciones y expansiones) con persistencia en LocalStorage.

**Registro**: `history-drawer`

**Ubicacion**: `src/presentation/components/HistoryDrawer/`

#### Metodos Publicos

| Metodo | Parametros | Descripcion |
|--------|------------|-------------|
| `open()` | — | Abre el drawer lateral |
| `close()` | — | Cierra el drawer lateral |
| `addEntry(data)` | `{ type, filename, metricsBefore, metricsAfter }` | Agrega una entrada al historial |
| `clear()` | — | Limpia todo el historial |

#### Propiedades Internas

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `entries` | `Array` | Lista de entradas del historial (max 20) |

#### Formato de Entrada

```javascript
{
  id: Date.now(),                    // Identificador unico
  type: 'equalize' | 'expand',      // Tipo de operacion
  filename: string,                  // Nombre del archivo
  timestamp: string,                 // Hora de la operacion
  metricsBefore: { min, max, mean, std },
  metricsAfter: { min, max, mean, std }
}
```

#### Ejemplo

```html
<history-drawer id="history-drawer"></history-drawer>

<script>
  const drawer = document.getElementById('history-drawer');
  drawer.addEntry({
    type: 'equalize',
    filename: 'foto-gris.jpg',
    metricsBefore: { min: 30, max: 200, mean: 115.2, std: 45.1 },
    metricsAfter: { min: 0, max: 255, mean: 127.5, std: 73.8 }
  });
  drawer.open();
</script>
```

---

## Componentes Compartidos

### `<primary-button>`

Boton reutilizable con icono de Material Symbols y texto.

**Registro**: `primary-button`

**Ubicacion**: `src/shared/components/PrimaryButton/`

#### Atributos Observados

| Atributo | Tipo | Default | Descripcion |
|----------|------|---------|-------------|
| `icon` | `string` | `'circle'` | Nombre del icono Material Symbols |
| `text` | `string` | `'Button'` | Texto del boton |
| `disabled` | `boolean` | `false` | Deshabilita el boton |

#### Ejemplo

```html
<primary-button icon="equalizer" text="Ecualizar"></primary-button>
<primary-button icon="expand" text="Expandir" disabled></primary-button>
```

---

### `<empty-state>`

Componente de estado vacio con icono, titulo, descripcion y contenido slot.

**Registro**: `empty-state`

**Ubicacion**: `src/shared/components/EmptyState/`

#### Atributos Observados

| Atributo | Tipo | Default | Descripcion |
|----------|------|---------|-------------|
| `icon` | `string` | — | Nombre del icono Material Symbols |
| `title` | `string` | `''` | Titulo del estado vacio |
| `description` | `string` | `''` | Descripcion del estado vacio |

#### Slots

Los hijos del componente se preservan y se renderizan despues de la descripcion.

#### Ejemplo

```html
<empty-state
  icon="cloud_upload"
  title="Subir Imagen"
  description="Arrastra tu imagen aqui"
>
  <primary-button icon="folder" text="Explorar"></primary-button>
</empty-state>
```

---

## Patron de Eventos

Todos los componentes usan **Custom Events** con `bubbles: true` y `composed: true` para comunicarse a traves del Shadow DOM:

```javascript
// Emision
this.dispatchEvent(new CustomEvent('on-image-selected', {
  bubbles: true,      // Burbujea hacia arriba en el DOM
  composed: true,     // Cruza boundaries de Shadow DOM
  detail: { file }    // Datos adicionales del evento
}));

// Escucha
component.addEventListener('on-image-selected', (e) => {
  console.log(e.detail.file);
});
```

### Convencion de Nombres

Todos los eventos usan prefijo `on-`:

| Evento | Componente Origen |
|--------|-------------------|
| `on-image-selected` | `<workspace-drop-zone>` |
| `on-equalize` | `<workspace-drop-zone>` |
| `on-expand` | `<workspace-drop-zone>` |
| `on-show-math` | `<workspace-drop-zone>` |
| `on-error` | `<workspace-drop-zone>` |
| `on-show-workspace` | `<top-nav-bar>` |
| `on-show-analysis` | `<top-nav-bar>` |
| `on-show-history` | `<top-nav-bar>` |
| `on-processed-state-changed` | `<workspace-drop-zone>` |

---

## Siguiente

- [Casos de Uso](./casos-de-uso.md) — Logica de negocio detallada
- [Guia para Desarrolladores](./guia-desarrollador.md) — Como crear nuevos componentes
