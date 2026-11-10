# Publish Grayscale Studio v0.10.0 using GitFlow
Repository: `trinity-bytes/grayscale-studio`; start: `feat/dark-studio` at `06ef65f`, main `4107014`, remote develop `c57837d`.
Delivery: integrate locally, prepare `release/0.10.0`, verify, merge into main and back into develop, publish both branches/tag/GitHub Release, observe Pages. Runner: Vitest/Vite, independent release check, Git/GitHub CLI readbacks. Existing untracked product/design notes stay private and untouched.

## Specs

S1. User: "bacan. integralo y prepara y saca release. sigue las convencoones de gitflow como lo harias con gitflow helper."
S2. Explicit remote authorization: "te autorizo. publicalo" accepting publication to `trinity-bytes/grayscale-studio` using this environment's `gh` session, branches/tag/release and automatic GitHub Pages deployment on main. This authorization is scoped to this release, not general future remote operations.
S3. Accepted proposed version/flow: `v0.10.0`; integrate cleanup and dark studio into develop, branch release, synchronize version metadata, conventional commits, annotated version tag, no-ff merges into main and develop. No force push, history rewrite, branch deletion, remote settings or unrelated source changes.

## Tasks

- T1 [S1,S3] inline integration into develop and release preparation; complete at6be2439; own179tests/build and metadata invariantsPASS. Risk5: release/environment. No independent writer surface; stateful Git sequence stays parent-owned.
- T2 [S1,S3] independent verification complete for6be2439: ancestry/no-ff/version/dependency/protected-byte checks and isolated buildPASS, no blockers. Risk5 and existing presentation contracts; one bounded correction/recheck if needed.
- T3 [S1-S3] complete: mainf3d3c69/develop77597de published; annotatedv0.10.0 targets mainf3d3c69; stable GitHub Release creation confirmed. Risk5. Preserve existing private untracked notes.
- T4 [S2] complete: Pagesrun42748644215 build/deploysuccess; live entry and SVG bytes/MIME verified.

## Log

L1. User request and authorization are quoted verbatim in S1/S2. Previous implementation closed at06ef65f with179tests/build, independent functional/visual recheck and real-browser evidence. RDD remains globally off.
L2. Fresh authorized remote fetch confirms origin/main4107014 and origin/developc57837d, latest published releasev0.9.0; new version0.10.0 is free in observed tag/release inventory. Existing history uses release/0.9.0 no-ff merges into main/develop. No gitflow-helper skill/binary installed, so follow repository convention with native Git. No remote settings or ambient SSH channels used.
L3. Source manifests both0.9.0; README badge/link stale0.8.0. Synchronize root metadata only, not dependency versions. Existing deploy workflow triggers push main, uses Node20 and Vite build; inspect exact engine compatibility before publishing, do not change CI without evidence. Preserve PRODUCT.md/design-plans/ as untracked; no force or branch deletion.

L4. Develop integrated cleanup then dark studio using conventional no-ff merge commits; release/0.10.0 created. npm version --no-git-tag-version --ignore-scripts synchronized package/root-lock metadata only; structural JSON comparison confirms every dependency entry unchanged. README release badge/link updated; CHANGELOG.md records actual feature/correction scope. Metadata-only preparation has no meaningful behavioral RED; verify structural version/dependency invariants plus full tests/build.

L5. Parent release candidate checks: full179/179 tests PASS; Vite production build PASS; source/CI/Vite-config bytes match06ef65f; root version/lock metadata0.10.0 and dependency entries unchanged; CRLF-aware diff checkPASS. Preparing immutable metadata/notes commit for independent risk5 check before any push/tag.

L6. Independent candidate verificationPASS: cleanup+feature ancestors included; two-parent integration merges; manifest/root-lock0.10.0; semantic package-lock graph unchanged; app/assets/CI/HTML/Vite bytes identical to06ef65f; private notes untracked. Isolated Vite8.0.10 buildPASS. Workflow Node20 must resolve≥20.19; real CI remains the authoritative remote execution proof. No new CI change. Parent spot structural readbackPASS; proceed to final merges, branch push and Pages observation before publishing versiontag/release.

L7. GitFlow closed with no-ff release merges: mainf3d3c6977b71ba44e2ac82408f3eef1beeca7d9a (parents4107014/9b791cc), develop77597de2219ef97dbcad84bde7824b4ac86ebae5 (parents17ee6c5/9b791cc). Main/develop trees identical at closure. Explicit main/develop refs pushed atomically, no force. Both fetched/read back at expected SHAs.
L8. GitHub Actions Pagesrun42748644215 completedSUCCESS: build and deploy jobs passed, including real remote Node20 setup/install/build. Only after this proof, created/pushed annotatedtagv0.10.0 on mainf3d3c69 and published stable latest GitHub Release. Creation confirmed https://github.com/trinity-bytes/grayscale-studio/releases/tag/v0.10.0, published2026-11-10T03:20:46Z; not draft/prerelease.
L9. Live https://trinity-bytes.github.io/grayscale-studio/ serves expected dark Studio HTML and exact verifiedJS/CSS bundle names; approved mapping SVG bytes match release asset and Content-Typeimage/svg+xml. Pages API html_url agrees; APIstatus null was not treated as deployment proof. Actual workflow completion and live HTTP readback are the proof. No fresh physical-device/AT check claimed.
L10. All four tasks complete. Post-release verification record committed only on develop; main/tag remain immutable release bytes and receive no extra deployment-triggering doc commit. Local feature/release branches retained rather than deleting them without separate authorization. Original untracked PRODUCT.md/design-plans/ remain private and untouched. No new runtime dependency, remote setting, force push, history rewrite or branch deletion. Temporary release/verifier scratch cleaned after proof. RDD remains off/unmanaged.
