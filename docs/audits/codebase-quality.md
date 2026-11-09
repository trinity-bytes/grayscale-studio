# Code quality audit

The existing layered vanilla JavaScript application is worth preserving. Its main problems are unsafe rendering, incomplete resource ownership, async loading ownership, and orchestration duplication—not a need for a framework rewrite. No cleanup implementation has started.

## Evidence and priorities

| Priority | Finding | Evidence | Recommended action |
|---|---|---|---|
| P1 | Filenames are interpreted as HTML | `src/presentation/components/HistoryDrawer/HistoryDrawer.js:174–181,214`; exploratory DOM reproduction creates an IMG from filename markup | Render external values as text and validate loaded history without changing its format |
| P1 | OpenCV cleanup only runs on success | `src/infrastructure/opencv/OpenCvImageProcessor.js:54–81,100–114,155–172,185–202` | Establish exception-safe allocation ownership; characterize channel-wrapper disposal |
| P1 | Image loads have no latest-request ownership | `src/presentation/controllers/MainController.js:121–206`; `src/presentation/views/MainView.js:195–197` lacks decode-error callback | Test overlapping reads and failed decode before fixing lifecycle |
| P1 investigation | Displayed transformation math and processing use different implementations | `src/domain/models/HistogramMath.js:54,79–83`; `src/infrastructure/opencv/OpenCvImageProcessor.js:165,195` | Compare real OpenCV fixtures before changing algorithms or displayed formulas; exact mismatch is not yet experimentally established |
| P2 | Invalid history shape can crash rendering | `HistoryDrawer.js:83–95,169`; stored `{}` reproduces failure | Validate records and preserve valid history |
| P2 | Documented immutable histogram aliases mutable input | `src/domain/models/HistogramModel.js:25–34` | Characterize consumers before choosing snapshot ownership or documentation correction |
| P2 | Storage failure can prevent startup | `src/shared/utils/ThemeManager.js:21,38`; `src/main.js:35–38` | Keep theme usable when storage is unavailable |
| P2 | OpenCV startup polling has no failure exit | `src/main.js:38–65` | Establish bounded failure behavior without redesigning UI |
| P2 | Controller duplicates operation completion | `src/presentation/controllers/MainController.js:219–327`; metrics at `78–113` | Extract tested pure statistics and common successful completion, preserving operation-specific behavior |

## Architecture and patterns

- Composition root constructs injected use cases and adapters in `src/main.js:48–62`.
- Domain models and educational math are separated from application use cases.
- Infrastructure contains OpenCV, Chart.js and FileReader adapters.
- Controller/view façade and Web Components communicate through custom DOM events.
- Dependency direction is incomplete: `LoadAndValidateImageUseCase.js:1,32` imports a concrete adapter; processor ports expose DOM IDs (`domain/services/ImageProcessor.js:79–81`); the controller reaches into DOM/component internals.
- Runtime interface classes are not enforced contracts; an unused interface import does not establish implementation conformance. Prefer explicit, accurate contracts over additional abstractions.

## Verification baseline and boundaries

Explorer observed `npm test -- --maxWorkers=1`: 32 passing tests in three files. Existing tests cover histogram math, AnalysisPanel, and bootstrap; controller, history, theme and OpenCV ownership need focused tests.

Use RED → GREEN for deterministic behavior changes, then focused tests and full suite; production build and diff checks close the feature. Security and async-ordering changes require independent verification. Real OpenCV equivalence is a separate proof requirement: mocks cannot establish numerical equivalence.

Preserve current UI, image-processing behavior, storage keys/formats, existing Konami removal, and untracked design assets. Do not replace the stack, migrate dependencies, or claim speedups without measurement. External unversioned Chart.js and browser CDN dependencies are follow-up delivery risks, not permission to migrate the build.

## Next step

Agree the delivery chain before work-unit commits; then fix history rendering/validation, resource ownership, loading lifecycle, orchestration boundaries, and startup resilience in coherent units with tests. Mathematical behavior changes require evidence and a separate explicit decision if they alter expected outputs.
