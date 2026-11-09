# Codebase cleanup before interface implementation
Branch: `refactor/codebase-cleanup`. Objective: audit and clean existing code without implementing the new interface.
Delivery: single-pr; integrated feature branch with separate coherent commits, no publishing authorized. Forecast: approximately 800–1400 authored changed lines including tests, provisional. Runner: Vitest; production check: Vite build.

## Specs

S1. Audit scope: "es una auditoria al codigo, su arquitectura, codigo spaguetti, patrones usados y demas."
S2. Cleanup objective and sequencing: "quiero limpiarlo y dejarlo optimizaro y prolijo antes de poner lo nuevo." Preserve observable behavior unless a verified defect is being corrected; no new interface implementation. This preservation boundary is an implementation assumption, not an additional requested feature.
S3. Isolation: "trabaja en una rama aparte"

## Tasks

- T1 [S1,S3] delegated read-only mapping + inline spot check; complete: audit at `docs/audits/codebase-quality.md`, branch created; commit a45e8b0.
- T2 [S2] delegated (parallel independent history and OpenCV units); implemented: safe history rendering/validation; 11 tests GREEN after 7 RED, parent spot check passes. Risk item 2; independent verification pending. Commit 16f258f.
- T3 [S2] delegated (parallel independent history and OpenCV units); implemented: exception-safe scoped ownership; 73 tests GREEN after 58 RED, parent spot check passes; 45 differential scenarios unchanged. Risk item 3; independent verification pending. Commit 492ad38.
- T4 [S2] inline; implemented: request-owned loading/decode errors; 7 controller RED and 2 view RED observed, then 13 GREEN; thumbnails now use actual canvas without encode/decode roundtrip after verified ignored-input bug. Risk item 4. Commit bd84d4b; independent verification pending.
- T5 [S2] inline; implemented: shared operation completion, view façade, pure statistics and injected file reader; valid operations characterized before refactor; 8 baseline differential scenarios identical; 2 injected-reader RED then GREEN. Risk item 3 (shared controller helpers/internal constructor). Commits bd84d4b/ebcbc46; independent verification pending.
- T6 [S2] inline; implemented: denied-storage resilience (2 RED then 4 GREEN), bounded engine wait (1 meaningful RED then 3 GREEN), histogram reference behavior characterized (5 tests) and docs corrected. Risk item 4 for startup ordering; no ownership contract break. Commits ebcbc46/55ea22f; independent verification pending.
- T7 [S1,S2] delegated verification when named high-risk changes exist; pending: whole-feature verification and numerical-equivalence investigation, no unproven algorithm changes. Commit pending.

## Log

L1. Original request: "va. lo siguiente que queiro que hagas, antes de implemetnar la interfaz. es una auditoria al codigo, su arquitectura, codigo spaguetti, patrones usados y demas. quiero limpiarlo y dejarlo optimizaro y prolijo antes de poner lo nuevo. trabaja en una rama aparte"
L2. 2026-11-09: Branch created. Existing uncommitted README/main/Konami test changes preserved; untracked PRODUCT.md and design-plans/ untouched. RDD remains globally off as previously observed; do not enable it.
L3. Mapping delegated because broad unfamiliar architecture exceeds bounded inline evidence. Explorer returned prioritized path:line evidence and observed 32 passing tests. Parent spot-checked history interpolation/shape handling, OpenCV success-only disposal, and separate histogram math implementations. CodeGraph unavailable; filesystem fallback used.
L4. Audit completed; no cleanup source edits yet. Findings and recommended boundaries in docs/audits/codebase-quality.md. Forecast exceeds 400 lines; chain-strategy choice required before work-unit commits. Local task file and memory mirror support continuation.

L5. User: "mira, si puedes manejarlo todo conjunto pues bien por mi. pero si sientes que lo manejas mejor pr partes pues bien tambien". Selected integrated feature branch and separate work-unit commits; user delegated delivery structure. T2/T3 are independent disjoint writer units with regression tests, launched together; parent owns controller/load work and git. No remote publishing.

L6. Separate commits: 35eaaed preserves prior Konami removal; a45e8b0 audit/tracking; 16f258f history (231 changed lines); 492ad38 OpenCV (500 changed lines, coherent ownership+regression unit kept intact rather than splitting behavior from tests). Integrated single-pr structure chosen under user delegation; no PR/push created. Authored cumulative count from commits: 1206 including previous Konami removal/docs. RDD disabled, unmanaged; attempted delegated risk assessment returned unassessable because of unrelated untracked inventory, not a low-risk result. Named risks 2/3 retain independent verifier at feature end.

L7. Parent implementation: latest request owns read/decode callbacks; invalid loads clear processing state. Operations keep shared completion and stats preserve output. MainView owns component transitions. File reader now injected from composition root. Successful-operation differential against baseline 4107014: 8 scenarios identical (mixed/extreme/flat/empty histograms × equalize/expand), including ordered effects, metrics, tables, navigation and final state. First harness failed on sandbox child-process spawn; retried with shell-extracted baseline, passed. Scratch /tmp/grayscale-controller-diff.vtv0km to remove after checks.
L8. Non-obvious thumbnail defect: ImageInfoPanel.setThumbnail ignored supplied data URL and encoded its own existing canvas. Replaced app path with synchronous canvas drawing, retained/fixed data-URL API, tested stale decodes and clearing (2 RED then GREEN). No visual redesign. Denied theme storage and missing engine now have bounded handling. Existing CRLF retained; checks use git -c core.whitespace=cr-at-eol diff --check, not a repository config mutation.
L9. Numerical follow-up: versioned OpenCV 4.8.0 source confirms educational CDF normalization mismatch; real WASM fixture remains unavailable. No mathematical algorithm/parameter changed; evidence and sample in audit. Do not claim numerical engine equivalence from mocks.

L10. Own full checks: npm test -- --maxWorkers=1 -> 149/149 pass across 12 files; npm run build -> pass; git -c core.whitespace=cr-at-eol diff --check -> pass. bd84d4b owns load/controller/thumbnail integration (702 changed lines, coherent behavior retained), ebcbc46 startup/reader injection (138), 55ea22f ownership characterization (22). Cumulative authored count 2068 incl prior Konami and docs; integrated delivery accepted, no artificial slicing. Independent verification now runs against baseline 410701460c7220450c85a8fcf6bbf49ce273d0fe and candidate committed code.
