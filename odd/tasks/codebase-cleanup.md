# Codebase cleanup before interface implementation
Branch: `refactor/codebase-cleanup`. Objective: audit and clean existing code without implementing the new interface.
Delivery: single-pr; integrated feature branch with separate coherent commits, no publishing authorized. Forecast: approximately 800–1400 authored changed lines including tests, provisional. Runner: Vitest; production check: Vite build.

## Specs

S1. Audit scope: "es una auditoria al codigo, su arquitectura, codigo spaguetti, patrones usados y demas."
S2. Cleanup objective and sequencing: "quiero limpiarlo y dejarlo optimizaro y prolijo antes de poner lo nuevo." Preserve observable behavior unless a verified defect is being corrected; no new interface implementation. This preservation boundary is an implementation assumption, not an additional requested feature.
S3. Isolation: "trabaja en una rama aparte"

## Tasks

- T1 [S1,S3] delegated read-only mapping + inline spot check; complete: audit at `docs/audits/codebase-quality.md`, branch created; commit pending delivery decision.
- T2 [S2] delegated (parallel independent history and OpenCV units); pending: safe history rendering and defensive loading with regression tests; Risk item 2 (untrusted HTML). Commit pending.
- T3 [S2] delegated (parallel independent history and OpenCV units); pending: exception-safe OpenCV ownership with regression tests; risk assessed from actual diff. Commit pending.
- T4 [S2] inline; pending: request-owned image loading and decode-error handling with regression tests; Risk item 4 (async ordering). Commit pending.
- T5 [S2] inline; pending: tested controller deduplication and dependency boundaries, characterize shared behavior first; risk assessed from actual diff. Commit pending.
- T6 [S2] inline; pending: theme/startup resilience and histogram ownership characterization; risk assessed from actual diff. Commit pending.
- T7 [S1,S2] delegated verification when named high-risk changes exist; pending: whole-feature verification and numerical-equivalence investigation, no unproven algorithm changes. Commit pending.

## Log

L1. Original request: "va. lo siguiente que queiro que hagas, antes de implemetnar la interfaz. es una auditoria al codigo, su arquitectura, codigo spaguetti, patrones usados y demas. quiero limpiarlo y dejarlo optimizaro y prolijo antes de poner lo nuevo. trabaja en una rama aparte"
L2. 2026-11-09: Branch created. Existing uncommitted README/main/Konami test changes preserved; untracked PRODUCT.md and design-plans/ untouched. RDD remains globally off as previously observed; do not enable it.
L3. Mapping delegated because broad unfamiliar architecture exceeds bounded inline evidence. Explorer returned prioritized path:line evidence and observed 32 passing tests. Parent spot-checked history interpolation/shape handling, OpenCV success-only disposal, and separate histogram math implementations. CodeGraph unavailable; filesystem fallback used.
L4. Audit completed; no cleanup source edits yet. Findings and recommended boundaries in docs/audits/codebase-quality.md. Forecast exceeds 400 lines; chain-strategy choice required before work-unit commits. Local task file and memory mirror support continuation.

L5. User: "mira, si puedes manejarlo todo conjunto pues bien por mi. pero si sientes que lo manejas mejor pr partes pues bien tambien". Selected integrated feature branch and separate work-unit commits; user delegated delivery structure. T2/T3 are independent disjoint writer units with regression tests, launched together; parent owns controller/load work and git. No remote publishing.
