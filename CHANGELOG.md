# Changelog

## [0.10.0] — 2026-11-09

### Added
- Dark image workbench based on the approved Studio design, with paired images, associated histograms and a persistent mathematical inspector.
- Exact stepped frequency charts with shared scales, CDF inspection, a full 256-level LUT and accessible frequency tables.
- Explicit operation selection and Apply controls, visible file replacement and recoverable loading/error states.
- Landscape-tablet support with rotation, phone and narrow-window guidance.
- Accessible history dialog with clear confirmation, focus restoration and unchanged storage format.
- Local IBM Plex Mono and approved SVG assets, plus current design-system documentation.

### Fixed
- Native-compatible educational calculations: histogram endpoint, CDF-min normalization, float32 operation order and ties-to-even conversion.
- Large-image histogram count conservation, including noncontinuous matrices.
- OpenCV resource ownership, stale file/decode callbacks, safe history rendering and startup/storage failure handling.
- File-loading busy announcements and synchronized selected-sample markers.

### Removed
- Konami/Snake easter egg and obsolete tutorial-style interface.
- Light-theme controls and external Tailwind/Material styling resources from the running studio.

### Verification
- 179 automated tests and production build passed before release preparation.
- Real OpenCV browser checks and bounded independent functional/visual correction rechecks passed.
- No physical-device or assistive-technology certification is claimed.

[0.10.0]: https://github.com/trinity-bytes/grayscale-studio/compare/v0.9.0...v0.10.0
