# Componentes del estudio oscuro

La interfaz conserva Web Components con DOM ligero y la fachada `MainView`. El controlador no necesita conocer la ubicación de las gráficas.

| Componente | Responsabilidad |
| --- | --- |
| `TopNavBar` | Logo original, estado del motor y acceso al historial. Sin selector de tema. |
| `WorkspaceDropZone` | Archivo, selección de operación, acción Aplicar, reemplazo, imágenes, histogramas y métricas. |
| `AnalysisPanel` | Fórmula, entrada/salida, CDF o mapa lineal, sustitución y LUT inspeccionable. No utiliza las antiguas tres pestañas. |
| `HistoryDrawer` | Últimas 20 operaciones, persistencia segura, foco modal y confirmación de borrado. |
| `ErrorAlert` | Mensaje de error anunciado y acción para cerrar. |
| `ImageInfoPanel` | Compatibilidad interna de metadatos/miniatura; ya no ocupa una columna visible. |

## WorkspaceDropZone

Mantiene `getCanvas`, `getProcessedCanvas`, `showCanvas`, `showProcessedCanvas`, `showPlaceholder`, `resetToOriginal`, los métodos de habilitación y los eventos `on-image-selected`, `on-equalize`, `on-expand`, `on-show-math` y `on-error`.

Los selectores cambian la operación, pero no procesan ni modifican el título del resultado existente. Aplicar espera dos fotogramas antes del trabajo nativo síncrono; reemplazar el archivo invalida cualquier operación pendiente. `on-operation-selected` y `on-processing-started` son eventos de presentación internos.

Los canvas de frecuencia y los métodos `getOriginalCanvas`, `getResultCanvas`, `showMetrics`, `hideMetrics`, `showResultHistogram`, `hideResultHistogram`, `showHistogramContainers` y `hideHistogramContainers` ahora pertenecen al workspace. `MainView` conserva las llamadas del controlador.

## AnalysisPanel

`getMathEqCanvas` y `getMathExpCanvas` conservan sus IDs. `showEqualizationTable(frequencies, lut)` y `showExpansionProcedure(frequencies, lut)` reciben los valores del dominio; no recalculan una transformación alternativa. `selectOperation` cambia el cálculo y `selectIntensity` inspecciona un nivel. El rango nativo permite navegación por teclado; la tabla muestra cinco vecinos o los 256 niveles.

Los métodos de navegación matemática se conservan como adaptadores; `switchToVisualTab` es compatibilidad sin una pestaña visual real. `showEmptyStates` elimina todos los valores derivados cuando falta una imagen válida.

## Gráficas y eventos

`ChartJsRenderer.render` y `renderMath` mantienen sus firmas. Los histogramas agrupan cuatro niveles exactos, comparten escala y publican `on-intensity-selected` con `{ intensity }`; un clic en histograma elige el primer nivel del intervalo, como indica el tooltip. La selección matemática utiliza el nivel exacto.

Cada histograma incluye una tabla de sus propias frecuencias, no una referencia incorrecta a las frecuencias del original. El renderer destruye las instancias reemplazadas y borra el resultado anterior al cargar un original nuevo.

## Historial

`open`, `close`, `addEntry` y `clear` conservan sus contratos internos. El botón de limpiar abre una confirmación; cancelar o Escape conservan el almacenamiento sin modificaciones. El cierre restaura foco, `inert` y scroll previos. La clave `grayscale-history`, la forma de registro y el límite de 20 entradas no cambian.
