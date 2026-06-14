export const strings = {
  nav: {
    workspace: 'Espacio de Trabajo',
    analysis: 'Análisis',
    history: 'Historial',
    toggleDarkMode: 'Alternar modo oscuro',
    toggleTheme: 'Alternar tema',
    wasmReady: 'WASM: Listo',
    wasmLoading: 'WASM: Cargando',
  },

  dropzone: {
    uploadTitle: 'Subir Imagen',
    uploadDescription: 'Arrastra tu imagen aquí, o haz clic para explorar archivos.',
    browseFiles: 'Explorar Archivos',
    dropHint: 'Soltar imagen aquí',
    original: 'Original',
    processed: 'Procesado',
    loadImageFirst: 'Carga una imagen primero',
    invalidType: 'Solo se aceptan imágenes JPEG y PNG.',
  },

  imageInfo: {
    title: 'Información de Imagen',
    resolution: 'Resolución',
    channels: 'Canales',
    bitDepth: 'Profundidad de Bit',
    format: 'Formato',
    emptyTitle: 'Sin Imagen Cargada',
    emptyDescription: 'Sube una imagen para ver su información',
    browseFiles: 'Explorar Archivos',
    grayscale: '1 (Escala de Grises)',
    color: '(Color)',
    loadedFromMemory: 'Cargado desde memoria',
    bitDepthValue: '8-bit',
  },

  analysis: {
    title: 'Análisis',
    tabVisual: 'Visual',
    tabEquations: 'Ecuaciones',
    tabExplanation: 'Explicación',
    noDataTitle: 'Sin Datos Aún',
    noDataHistogram: 'Carga una imagen para ver los datos del histograma',
    noDataEqualization: 'Procesa una imagen para ver la matemática de ecualización',
    noDataExpansion: 'Procesa una imagen para ver la explicación de expansión',
    awaitingProcessingTitle: 'Esperando Procesamiento',
    awaitingProcessingDesc: 'Ejecuta Ecualizar o Expansión para ver el histograma de resultado',
    originalHistogram: 'Histograma Original',
    resultHistogram: 'Histograma de Resultado',
    metricsMin: 'Mín',
    metricsMax: 'Máx',
    metricsMean: 'Media',
    metricsStd: 'DesvEst',
  },

  errors: {
    colorImage: 'Imagen a color detectada. Por favor sube una imagen en escala de grises.',
    processingFailed: 'Error al procesar imagen con OpenCV.',
    loadFailed: 'No se pudo cargar el archivo.',
    equalizeFailed: 'Error al ecualizar la imagen.',
    expandFailed: 'Error al expandir la imagen.',
  },

  common: {
    browseFiles: 'Explorar Archivos',
    dismissError: 'Cerrar error',
  },

  charts: {
    frequencyIntensity: 'Frecuencia de Intensidad',
    grayLevel: 'Nivel de Gris (0-255)',
    pixelCount: 'Cantidad de Píxeles',
    lutEqualization: 'LUT (Ecualización)',
    lutExpansion: 'LUT (Expansión)',
    originalHistogram: 'Histograma Original',
    inputIntensity: 'Intensidad de Entrada (0-255)',
    pixelCountAxis: 'Cantidad de Píxeles',
    outputIntensity: 'Intensidad de Salida (0-255)',
  },

  aria: {
    dismissError: 'Cerrar error',
    toggleTheme: 'Alternar tema',
    analysisTabs: 'Pestañas de análisis',
  },

  index: {
    title: 'GrayScale Studio - Espacio de Trabajo',
    description: 'Aplicación web profesional para ecualización y expansión de histogramas de imagen en escala de grises, construida con Clean Architecture y DDD.',
    loaderText: 'CARGANDO MOTOR OPENCV',
    mobileTitle: 'Se Requiere Pantalla Grande',
    mobileDescription: 'Grayscale Studio es una herramienta profesional optimizada para análisis preciso de histogramas y manipulación de imágenes. Por favor accede desde una tablet o escritorio.',
  },
};
