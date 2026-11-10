---
name: Grayscale Studio
description: A dark image workbench with contextual mathematical inspection.
colors:
  ground: "#000000"
  surface: "#111111"
  well: "#191919"
  selected: "#282828"
  divider: "#292929"
  ink: "#F4F4F4"
  secondary: "#B4B4B4"
  muted: "#949494"
  accent: "#88B5FF"
  action: "#F0F0F0"
  action-hover: "#D4D4D4"
  frequency-fill: "rgba(180,180,180,.14)"
  processed-fill: "rgba(136,181,255,.14)"
typography:
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "16px"
    fontWeight: 500
  control:
    fontFamily: "Poppins, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  meta:
    fontFamily: "Poppins, sans-serif"
    fontSize: "11px"
    fontWeight: 400
  data:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
  selected-value:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "26px"
    fontWeight: 500
rounded:
  image: "4px"
  selected-control: "6px"
  control: "8px"
  sheet: "12px"
  primary: "22px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.primary}"
    padding: "12px 22px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-quiet:
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px"
    height: "44px"
  histogram-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "16px"
  formula-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---
# Design System: Grayscale Studio

## Overview

**Creative North Star: "Dark workbench"**

A compact, exclusively dark image workbench: original and processed images lead, their distributions sit directly beneath them, and a persistent calculation rail exposes the actual CDF/LUT mapping. The interface is a working tool, not a tutorial or a course.

Neutral lightness steps establish hierarchy; blue marks processed data and inspection feedback rather than filling navigation. UI labels use local Poppins, while numerical columns and expressions use local IBM Plex Mono. Existing processing and numerical semantics remain outside the visual redesign.

**Key Characteristics:**
- Paired images with directly associated frequency panels.
- A persistent, data-driven calculation inspector.
- Neutral primary actions and blue processed data.
- Opaque, flat surfaces and local typography.

The accepted visual authority is Figma file `vjIA1F1gChibIGuQlnHjcu`: desktop `20:125`, landscape tablet `42:167` and portrait notice `21:1925`. The implementation records the built system rather than the superseded local proposal notes.

## Colors

True black and charcoal surfaces keep the images prominent. The sole data accent is a restrained pale blue.

- **Ground / surface / well / selection:** the four neutral surface levels declared in frontmatter.
- **Ink / secondary / muted:** primary reading, supporting labels and metainformation respectively.
- **Accent:** processed distributions, output values, focus rings and intensity inspection.
- **Action:** neutral inverted primary action; selected controls use the selected surface, not a blue fill.
- **Frequency fills:** low-opacity neutral or blue chart areas; the contour remains unsmoothed.

**The Data Color Rule.** Use blue for processed values and inspection feedback; keep persistent navigation and surfaces neutral.

## Typography

Poppins is loaded locally for UI text at 400/500/600. IBM Plex Mono Regular is loaded locally for figures and expressions; the selected mapping requests weight 500 in CSS. No separate display face is introduced.

| Role | Built use |
| --- | --- |
| Title | 16px/500 inspector and history headings |
| Body | 14px root; document and pane labels |
| Control | 13px/500 primary action; quiet controls use 13px |
| Meta | 11–12px labels, chart axes and supporting status |
| Data | 11–14px chart/table values and expressions |
| Selected value | 26px/500 input and output intensity |

**The Measured Numbers Rule.** Use IBM Plex Mono for numeric columns, measurements and expressions, and Poppins for interface language.

IBM Plex Mono Regular comes from the official IBM Plex repository, `packages/plex-mono/fonts/complete/ttf/IBMPlexMono-Regular.ttf`. Its OFL is retained as `public/assets/fonts/IBM-Plex-LICENSE.txt`; Poppins is the existing local family. No new runtime package was installed.

## Layout

The product bar precedes a document/operation bar. The workbench pairs equal image columns with a 16px gap and associates each image with its own histogram and metrics. Wells use a 3:2 layout with `object-fit: contain`, preserving the entire image rather than cropping its data. A calculation rail stays alongside the pair; content scrolls vertically.

The main container is at most 1440px with a 376px rail. Between 1024 and 1279px, it centers at at most 1024px with a 328px rail. Common spacing steps are declared in frontmatter; desktop workbench padding is 20px 24px 28px, and the inspector uses 20px 20px 28px.

Landscape tablets are supported. Portrait touch/coarse-pointer tablets ask to rotate; phones below 768px ask for a larger device. Non-portrait windows below 1024px ask to maximize. `ScreenGuard` uses viewport geometry and touch capability, not user-agent strings. No mobile-processing scope is added.

## Elevation & Depth

Opaque lightness steps and quiet dividers establish depth. The history sheet uses a fixed opaque surface over a 65%-black overlay; the resting workbench has no decorative shadow vocabulary. Focus uses a 2px accent outline with 4px offset globally, and 3px offset inside history.

**The Flat Surfaces Rule.** Separate resting regions through lightness and quiet rules, not decorative shadows or glass.

Chart animation is disabled. Applying yields two animation frames so a pending state can paint before synchronous native processing; this is scheduling, not decorative motion. `prefers-reduced-motion` disables optional animation, transition and smooth scrolling.

## Shapes

Images use 4px corners; selected operation controls use 6px; panel/control containers use 8px. The primary action has a 22px radius and 44px minimum height. The history sheet uses 12px corners and a quiet 1px border. Its width is `min(420px, calc(100vw - 24px))`, inset 12px from viewport edges.

## Components

### Document controls

Selecting an operation changes the inspected calculation, not the existing result's identity. Applying is explicit. Primary actions use the inverted neutral treatment; disabled actions reduce opacity to .45 and show a not-allowed cursor. Replacement invalidates queued processing and duplicate processing cannot queue. The document name truncates safely while data panels preserve their meaning.

### Images and frequency panels

`WorkspaceDropZone` owns document controls, image/frequency canvases and metrics. Frequency plots sum four actual levels into each of 64 intervals, including 252–255. Both panes share one count scale, reset on a new source. Tooltips disclose exact interval counts; each distribution also has its own native frequency table. Upload/empty wells retain their geometry without showing fixture measurements.

### Calculation inspector

`AnalysisPanel` owns the inspector. CDF uses 256 actual normalized cumulative values; expansion uses the existing native-compatible LUT. A keyboard-operable native range selects the input intensity. The table shows five neighboring levels or all 256, including zero bins. Compact formulas express the conceptual transform; Precision discloses float32 ordering, operand conversion and ties-to-even. Actual output always comes from HistogramMath, never a rounded display calculation.

### History and recovery

History traps focus, restores its trigger and prior inert/scroll state, and dismisses with Escape. Clearing requires confirmation without changing its stored record format. Errors remain recoverable; engine timeout offers reload. There is no claim of formal accessibility certification or physical-device testing.

### Assets and implementation boundaries

The existing negative logo/symbol PNGs in `public/assets/branding/` remain unchanged. Upload and rotate SVGs are local exports of the approved Figma; uploaded images and chart geometry remain dynamic, never screenshots of the design.

`MainView` retains the controller-facing facade and presentation wiring. `ChartJsRenderer` owns chart lifetime, exact aggregation and accessible frequency tables. Domain, application use cases and OpenCV processing are unchanged.

## Do's and Don'ts

### Do
- **Do** preserve the original project logo and symbol assets.
- **Do** render image, histogram, CDF and LUT values from runtime data.
- **Do** keep original and result histogram scales identical within a comparison.
- **Do** show zero counts as zero and unavailable measurements as an em dash.
- **Do** retain keyboard inspection, explicit processing actions and recoverable errors.

### Don't
- **Don't** introduce a light-theme toggle, glass surfaces or a tutorial stepper.
- **Don't** smooth frequency or cumulative data into invented intermediate values.
- **Don't** replace the original mark with a reconstructed or generated logo.
- **Don't** claim screenshots establish accessibility certification or physical-device behavior.
