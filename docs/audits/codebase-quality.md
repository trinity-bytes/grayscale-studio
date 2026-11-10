# Code quality audit

The existing layered vanilla JavaScript application is worth preserving. Its main problems are unsafe rendering, incomplete resource ownership, async loading ownership, and orchestration duplication—not a need for a framework rewrite. Cleanup implementation is tracked in `odd/tasks/codebase-cleanup.md`; the findings below describe the audited baseline, not the current fixed state.

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


## Cleanup results

- History external values use text/property assignment, validated reads preserve valid entries and storage format, and no storage rewrite occurs during load.
- OpenCV allocations are scoped and released on success, thrown processing calls and failed later allocations; channel wrappers are independently released and borrowed matrices stay caller-owned.
- Image reads and decodes have request ownership, stale completions cannot replace a later choice, and decode/read/extraction errors clear analytical state.
- Controller operations share one successful-completion path. Statistics live in a pure domain module. The view façade owns component/DOM transitions. File reading is injected at the composition root rather than imported by application code. `LoadAndValidateImageUseCase` now requires `(processor, fileReader)`; the app composition root and tests supply the existing `BrowserFileReader` adapter. This is an internal constructor change, not a new framework.
- Thumbnail audit found the old `setThumbnail(dataUrl)` ignored its argument and encoded its own existing canvas. The application now draws the actual source canvas directly: no full-image PNG encoding, FileReader roundtrip or object URL. The existing data-URL method is retained and correctly uses its input with stale-load protection.
- Theme selection survives denied storage. Startup polling stops after 30 seconds, retains the blocking overlay and shows a reload instruction instead of waiting indefinitely.
- Histogram arrays and metadata retain their existing shared-reference semantics; inaccurate immutability comments were corrected rather than silently breaking consumers.

## Numerical follow-up (not changed in this structural cleanup)

The educational equalization LUT uses raw CDF scaling; the OpenCV 4.8.0 reference implementation subtracts the first occupied-bin count and handles constant images separately. This is confirmed by [the versioned OpenCV source](https://github.com/opencv/opencv/blob/4.8.0/modules/imgproc/src/histogram.cpp#L3239-L3254). For counts 2048/1024/512/512 at intensities 80/112/144/176, the current educational mapping is 128/191/223/255; applying the reference normalization yields 0/128/191/255. These are source-derived expectations, not a measurement of the shipped WebAssembly runtime.

The adapter also retains its baseline `calcHist` range `[0, 255]`. Numerical changes (including endpoint handling and constant-image expansion) need real engine fixtures before claiming agreement between pixels, histogram and educational tables. No local OpenCV runtime/Python cv2 was available for that experiment; no package or binary was installed. Mocked ownership tests and differential adapter tests do NOT establish numerical equivalence. Keep this explicit follow-up separate from adopting the new interface.


## Final verification

Independent isolated verification of candidate `4c801fc` against baseline `4107014` passed all three specs without functional blockers: 149 tests, build, 7 extra component-integration/security probes, 8 controller differentials and 16 adapter differentials. Its documentation advisory was resolved by updating the published constructor/view/thumbnail examples. The integration probes are retained in `src/presentation/Studio.integration.test.js` (commit `a56a823`).

Final suite: **156 tests across 13 files pass**. Production build and CRLF-aware working-tree/full-range whitespace checks pass. No production source changed after the independently verified candidate. Browser pixel rendering and real WASM numerical equivalence were not tested. RDD stayed disabled; functional verification is not a publishing or merge authorization.


## Numerical follow-up resolution

The historical numerical follow-up above is resolved by the subsequent authorized numerical correction. See [the current numerical verification](numerical-consistency.md) for corrected endpoint/CDF/quantization semantics, real WASM fixtures and explicit proof limits. Native transforms remain unchanged because the shipped build lacks cv.LUT.
