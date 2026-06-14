# Sistema de Estilos

> Tailwind CSS, design tokens, modo oscuro/claro, glassmorphism y cursores personalizados.

---

## Arquitectura CSS

```
src/shared/styles/
├── main.css           # Agregador (importa todos los demas)
├── typography.css     # Declaraciones @font-face (Poppins)
├── effects.css        # Glassmorphism + tokens semanticos
├── cursors.css        # Cursores SVG personalizados
└── layout.css         # Layout global, loader, canvas, dark mode
```

**Punto de entrada**: `src/main.js` importa `main.css`, que a su vez importa los demas archivos.

---

## Tailwind CSS

Se usa **Tailwind CSS via CDN** con configuracion personalizada en `index.html`:

```javascript
tailwind.config = {
  darkMode: "class",   // Modo oscuro via clase .dark en <html>
  theme: {
    extend: {
      colors: { /* ... */ },
      borderRadius: { /* ... */ },
      spacing: { /* ... */ },
      fontFamily: { /* ... */ },
      fontSize: { /* ... */ },
    },
  },
};
```

### Dark Mode

Tailwind usa la estrategia `class`:

```html
<!-- Modo claro (default) -->
<html lang="es">

<!-- Modo oscuro -->
<html lang="es" class="dark">
```

Las clases de Tailwind se aplican dinamicamente:

```html
<!-- Claro: texto oscuro sobre fondo claro -->
<div class="bg-surface text-on-surface">

<!-- Oscuro: texto claro sobre fondo oscuro -->
<div class="dark:bg-inverse-surface dark:text-inverse-on-surface">
```

---

## Design Tokens

### Colores semanticos (Light Mode)

| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-bg` | `#f7f9fb` | Fondo principal |
| `--surface-text` | `#191c1e` | Texto principal |
| `--surface-text-muted` | `#737688` | Texto secundario |
| `--canvas-bg` | `transparent` | Fondo de canvas |
| `--chart-grid` | `rgba(0,0,0,0.1)` | Lineas de grilla |
| `--chart-tick` | `#191c1e` | Etiquetas de ejes |
| `--chart-bar` | `rgba(54,162,235,0.6)` | Barras originales |
| `--chart-bar-processed` | `rgba(255,99,132,0.6)` | Barras procesadas |

### Colores semanticos (Dark Mode)

| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-bg` | `#12141a` | Fondo principal |
| `--surface-text` | `#e8eaed` | Texto principal |
| `--surface-text-muted` | `#9aa0ac` | Texto secundario |
| `--canvas-bg` | `#1a1d26` | Fondo de canvas |
| `--chart-grid` | `rgba(255,255,255,0.08)` | Lineas de grilla |
| `--chart-tick` | `#e8eaed` | Etiquetas de ejes |
| `--chart-bar` | `rgba(100,180,255,0.7)` | Barras originales |
| `--chart-bar-processed` | `rgba(255,130,150,0.7)` | Barras procesadas |

### Glassmorphism

| Variable | Light | Dark |
|----------|-------|------|
| `--glass-bg-color` | `255, 255, 255` | `22, 25, 32` |
| `--glass-bg-opacity` | `0.85` | `0.97` |
| `--glass-blur` | `12px` | `12px` |
| `--glass-sub-bg-opacity` | `0.5` | `0.85` |

### Clases de Tailwind Custom

| Clase | Valor |
|-------|-------|
| `text-on-primary` | `#ffffff` |
| `text-primary` | `#0043c8` |
| `text-inverse-primary` | `#b6c4ff` |
| `bg-primary-container` | `#0057ff` |
| `text-on-surface` | `#191c1e` |
| `text-on-surface-variant` | `#434656` |
| `bg-surface-variant` | `#e0e3e5` |
| `text-error` | `#ba1a1a` |
| `bg-error-container` | `#ffdad6` |

---

## Paleta de Colores Material Design 3

El proyecto usa la paleta completa de **Material Design 3**:

```
Primary:        #0043c8    Secondary:      #505f76
Tertiary:       #972800    Error:          #ba1a1a

Surface:        #f7f9fb    Background:     #f7f9fb
On-Surface:     #191c1e    On-Background:  #191c1e

Primary Container:    #0057ff
Secondary Container:  #d0e1fb
Tertiary Container:   #c13600
Error Container:      #ffdad6
```

---

## Tipografia

### Fuente Principal: Poppins

Cargada localmente desde `/assets/fonts/` con `font-display: swap`:

| Peso | Estilo | Archivo |
|------|--------|---------|
| 300 | Normal | Poppins-Light.ttf |
| 400 | Normal | Poppins-Regular.ttf |
| 400 | Italic | Poppins-Italic.ttf |
| 500 | Normal | Poppins-Medium.ttf |
| 500 | Italic | Poppins-MediumItalic.ttf |
| 600 | Normal | Poppins-SemiBold.ttf |
| 700 | Normal | Poppins-Bold.ttf |
| 800 | Normal | Poppins-ExtraBold.ttf |

### Escala Tipografica (Tailwind)

| Token | Tamano | Linea | Peso | Uso |
|-------|--------|-------|------|-----|
| `font-body-sm` | 14px | 1.5 | 400 | Texto secundario |
| `font-body-md` | 16px | 1.6 | 400 | Texto principal |
| `font-data-mono` | 13px | 1.4 | 500 | Datos, metricas |
| `font-display-lg` | 32px | 1.2 | 600 | Titulos grandes |
| `font-headline-md` | 24px | 1.3 | 500 | Subtitulos |
| `font-label-caps` | 12px | 1.0 | 700 | Etiquetas mayusculas |

---

## Glassmorphism

Efecto de paneles translucidos con `backdrop-filter`:

```css
.glass-panel {
  background: rgba(var(--glass-bg-color), var(--glass-bg-opacity));
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border-light);
  border-left: 1px solid var(--glass-border-light);
  border-bottom: 1px solid var(--glass-border-dark);
  border-right: 1px solid var(--glass-border-dark);
}
```

### Variantes

| Clase | Opacidad | Uso |
|-------|----------|-----|
| `.glass-panel` | 85% (light) / 97% (dark) | Paneles principales |
| `.glass-sub-panel` | 50% (light) / 85% (dark) | Sub-paneles |

---

## Cursores Personalizados

Archivos SVG en `/assets/cursors/`:

| Cursor | Archivo | Hotspot | Uso |
|--------|---------|---------|-----|
| Default | `cursor.svg` | (4, 4) | Elementos generales |
| Pointer | `pointer.svg` | (10, 4) | Enlaces, botones |
| Grab | `grab.svg` | (14, 14) | Elementos arrastrables |

```css
body {
  cursor: url('/assets/cursors/cursor.svg') 4 4, default;
}

a, button, [role="button"] {
  cursor: url('/assets/cursors/pointer.svg') 10 4, pointer;
}

.grab-cursor, [draggable="true"] {
  cursor: url('/assets/cursors/grab.svg') 14 14, grab;
}
```

---

## Layout Global

### Grid Principal

```html
<main class="grid grid-cols-12 gap-sm max-w-[1440px] mx-auto">
  <!-- Izquierda: 2 columnas -->
  <aside class="col-span-2">Metadata</aside>

  <!-- Centro: 7 columnas -->
  <section class="col-span-7">Workspace</section>

  <!-- Derecha: 3 columnas -->
  <aside class="col-span-3">Analisis</aside>
</main>
```

### Background

- **Light**: Imagen de fondo `pok-rie-3.jpg` con `background-size: cover`
- **Dark**: Color solido `#0c0e14` con overlay oscuro `rgba(0,0,0,0.7)`

### Loader Overlay

Animacion de pulso en el isotipo durante la carga de OpenCV:

```css
@keyframes pulse-glow {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(0,67,200,0.3)); }
  50% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(0,67,200,0.6)); }
}

.loader-isotipo {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

---

## Dark Mode: Overrides

Tailwind CDN no procesa clases estaticas en modo oscuro, por lo que se usan overrides con `!important`:

```css
.dark .text-on-surface { color: #e8eaed !important; }
.dark .text-on-surface-variant { color: #9aa0ac !important; }
.dark .text-primary { color: #8ab4ff !important; }
.dark .text-secondary { color: #a0aec0 !important; }
.dark .text-error { color: #f87171 !important; }
.dark .border-outline-variant { border-color: rgba(255,255,255,0.1) !important; }
.dark .bg-surface-variant { background-color: rgba(255,255,255,0.08) !important; }
```

---

## ThemeManager

Singleton para gestionar el tema:

```javascript
// src/shared/utils/ThemeManager.js
export const ThemeManager = {
  init() { /* restaura desde localStorage o detecta preferencia del sistema */ },
  toggle() { /* alterna entre light/dark */ },
  isDark() { /* retorna true si esta en modo oscuro */ },
};
```

**Persistencia**: Clave `gs-theme` en `localStorage`.

---

## Siguiente

- [Referencia Tecnica](./api-referencia.md) — Firma de metodos y eventos
- [Guia para Desarrolladores](./guia-desarrollador.md) — Como extender estilos
