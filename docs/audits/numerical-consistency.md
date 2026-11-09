# Align educational mathematics with OpenCV pixels

The raw CDF remains a probability distribution. The equalization LUT now removes the first occupied cumulative bin, and both educational LUTs reproduce the byte quantization of the app's official OpenCV.js 4.8.0 fixture. Native `equalizeHist` and `normalize` processing are retained: this build does not export `cv.LUT`, and no unbenchmarked JavaScript pixel loop or rebuilt engine was substituted.

## Reproduce the real-engine check

Requires the project's existing Node environment. No dependency installation or browser is required. Fetch only the same public runtime URL already used by `index.html`, into temporary storage outside the repository:

```bash
fixture_dir=$(mktemp -d)
curl --fail --location --max-time 90 \
  https://docs.opencv.org/4.8.0/opencv.js \
  --output "$fixture_dir/opencv.cjs"
node scripts/verify-opencv.mjs --runtime "$fixture_dir/opencv.cjs"
# Remove the temporary fixture directory after verification.
```

Expected runtime: 9,991,739 bytes; SHA256 `806cb5646afa6fa946b736afa1beaf1443bdfda718404d75f9794ddc2c10b1cc`. The command validates the hash before executing the fixture, waits for initialization, verifies version 4.8.0, and exits nonzero on missing/changed fixtures, invalid arguments, initialization failure, or a numerical mismatch. `--help` prints usage. It does not silently skip, install, download, or fall back to mocks.

## Exact semantics

- **Histogram:** 256 bins over `[0,256)`, including white pixels at 255. Native float32 bins at/above 2^24 trigger an exact recount from grayscale pixels, preserving integer mass even for large images. Noncontinuous matrices are read row-by-row without including padding. Smaller histograms keep the native fast path.
- **Equalization:** with integer cumulative count H, first occupied count Hmin and total N, scale is `f32(255/f32(N-Hmin))`. The output is `Q8(f32(f32(H-Hmin)*scale))`, with zero below the first occupied intensity. Constant images retain their original intensity. Empty data yields a zero LUT.
- **Expansion:** compute double scale `255/(max-min)`, then float32 scale and shift `f32(-min*doubleScale)`. Evaluate `Q8(f32(f32(input*scale)+shift))`. Constant images normalize to zero; empty educational data has no occupied min/max.
- **Quantization:** Q8 saturates to [0,255] and rounds nearest with exact half ties to the even integer. `Math.round`, reordered arithmetic and rounding a displayed four-digit factor are not equivalent to this engine.

The native transform signatures and algorithms are unchanged. HistogramMath supplies expansion parameters to the educational procedure, avoiding a separate presentation-layer approximation. Existing layout remains unchanged; only mathematical explanations/results were corrected.

## Observed regression examples

| Input pixels | Native operation | Output pixels |
|---|---|---|
| 0, 1, 6 | expansion | 0, 42, 255 |
| 196, 203, 210 | expansion | 0, 127, 255 |
| 0, 1, 2, 2, 2, 2, 2 | equalization | 0, 42, 255, 255, 255, 255, 255 |
| 128 | equalization | 128 |
| 128 | expansion | 0 |

Counts 2048/1024/512/512 at 80/112/144/176 yield equalization 0/128/191/255 and expansion 0/85/170/255. `[0,128,255]` produces three histogram counts, including one in bin255; the old endpoint range lost the white pixel.

## Proof boundary

The real-engine command compares every supported occupied intensity for every 8-bit expansion min/max pair: 32,896 ranges including flats and 2,829,056 pixel comparisons. Equalization is checked against 1,010 deterministic fixtures (edge cases, dense ramp, published example and seeded random images); it is not exhaustive over all histograms. Fifty real adapter cases cover single-channel and grayscale RGBA inputs, rendered bytes, original/transformed histogram bins and conserved histogram mass.

Only DOM `imread`/`imshow` boundaries are replaced in the adapter harness; matrices, grayscale conversion, channel checks, equalization, normalization and histogram extraction execute the actual WebAssembly runtime. This is not a browser screenshot/rendering proof or a guarantee about other OpenCV builds. Existing unit ownership tests continue to cover cleanup on failures.

References: [versioned equalizeHist implementation](https://github.com/opencv/opencv/blob/4.8.0/modules/imgproc/src/histogram.cpp#L3239-L3254), [official histogram range documentation](https://docs.opencv.org/4.8.0/d1/db7/tutorial_py_histogram_begins.html).


## Independent large-image correction

Independent verification found a 4096×4097 fixture with counts 4095/3190961/13586256 at 0/128/255. Native OpenCV maps 128 to49; converting the denominator to float32 only after division incorrectly produced48. The corrected expression converts `N-Hmin` before division and now matches49.

The same check exposed float32 histogram-bin precision: 16,781,311 pixels at128 plus one at200 yielded native histogram mass16,781,313 rather than16,781,312. The exceptional-bin recount now preserves the actual integer frequencies. The real checker covers both contiguous data and padded ROI rows, and compares33,562,624 additional large-image equalization pixels without creating boxed arrays of that size.
