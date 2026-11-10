# Publish Grayscale Studio v0.10.0 using GitFlow
Repository: `trinity-bytes/grayscale-studio`; start: `feat/dark-studio` at `06ef65f`, main `4107014`, remote develop `c57837d`.
Delivery: integrate locally, prepare `release/0.10.0`, verify, merge into main and back into develop, publish both branches/tag/GitHub Release, observe Pages. Runner: Vitest/Vite, independent release check, Git/GitHub CLI readbacks. Existing untracked product/design notes stay private and untouched.

## Specs

S1. User: "bacan. integralo y prepara y saca release. sigue las convencoones de gitflow como lo harias con gitflow helper."
S2. Explicit remote authorization: "te autorizo. publicalo" accepting publication to `trinity-bytes/grayscale-studio` using this environment's `gh` session, branches/tag/release and automatic GitHub Pages deployment on main. This authorization is scoped to this release, not general future remote operations.
S3. Accepted proposed version/flow: `v0.10.0`; integrate cleanup and dark studio into develop, branch release, synchronize version metadata, conventional commits, annotated version tag, no-ff merges into main and develop. No force push, history rewrite, branch deletion, remote settings or unrelated source changes.

## Tasks

- T1 [S1,S3] inline integration into develop and release preparation; local merges/version/notes complete, checks pending. Risk5: release/environment. No independent writer surface; stateful Git sequence stays parent-owned.
- T2 [S1,S3] independent verification of release candidate after own179-test suite/build, metadata/ancestry/protected-byte readback; pending. Risk5 and existing presentation contracts; one bounded correction/recheck if needed.
- T3 [S1-S3] inline finish GitFlow and publish explicit branch/tag refs, then GitHub Release; pending. Risk5. Preserve existing private untracked notes.
- T4 [S2] inline observe release/ref/Pages readback; pending. Pending external status is not a completed deployment.

## Log

L1. User request and authorization are quoted verbatim in S1/S2. Previous implementation closed at06ef65f with179tests/build, independent functional/visual recheck and real-browser evidence. RDD remains globally off.
L2. Fresh authorized remote fetch confirms origin/main4107014 and origin/developc57837d, latest published releasev0.9.0; new version0.10.0 is free in observed tag/release inventory. Existing history uses release/0.9.0 no-ff merges into main/develop. No gitflow-helper skill/binary installed, so follow repository convention with native Git. No remote settings or ambient SSH channels used.
L3. Source manifests both0.9.0; README badge/link stale0.8.0. Synchronize root metadata only, not dependency versions. Existing deploy workflow triggers push main, uses Node20 and Vite build; inspect exact engine compatibility before publishing, do not change CI without evidence. Preserve PRODUCT.md/design-plans/ as untracked; no force or branch deletion.

L4. Develop integrated cleanup then dark studio using conventional no-ff merge commits; release/0.10.0 created. npm version --no-git-tag-version --ignore-scripts synchronized package/root-lock metadata only; structural JSON comparison confirms every dependency entry unchanged. README release badge/link updated; CHANGELOG.md records actual feature/correction scope. Metadata-only preparation has no meaningful behavioral RED; verify structural version/dependency invariants plus full tests/build.

L5. Parent release candidate checks: full179/179 tests PASS; Vite production build PASS; source/CI/Vite-config bytes match06ef65f; root version/lock metadata0.10.0 and dependency entries unchanged; CRLF-aware diff checkPASS. Preparing immutable metadata/notes commit for independent risk5 check before any push/tag.
