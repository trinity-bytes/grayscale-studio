import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { HistogramMath } from '../src/domain/models/HistogramMath.js';
import { HistogramModel } from '../src/domain/models/HistogramModel.js';
import { OpenCvImageProcessor } from '../src/infrastructure/opencv/OpenCvImageProcessor.js';

const EXPECTED_SHA256 = '806cb5646afa6fa946b736afa1beaf1443bdfda718404d75f9794ddc2c10b1cc';
const USAGE = 'Usage: node scripts/verify-opencv.mjs --runtime /absolute/path/to/opencv.cjs';

function frequenciesOf(pixels) {
  const frequencies = new Array(256).fill(0);
  for (const value of pixels) frequencies[value]++;
  return frequencies;
}

async function loadRuntime(path) {
  const digest = createHash('sha256').update(await readFile(path)).digest('hex');
  assert.equal(digest, EXPECTED_SHA256, 'Unexpected OpenCV fixture: do not silently change numerical reference');
  const runtime = createRequire(import.meta.url)(path);
  if (!runtime.Mat) {
    let timer;
    try {
      await new Promise((ready, reject) => {
        timer = setTimeout(() => reject(new Error('OpenCV initialization timed out')), 30_000);
        runtime.onRuntimeInitialized = () => ready();
        runtime.onAbort = reason => reject(new Error(`OpenCV initialization aborted: ${reason}`));
      });
    } finally {
      clearTimeout(timer);
    }
  }
  // This Emscripten object is thenable: never return or await it directly.
  assert.match(runtime.getBuildInformation(), /OpenCV 4\.8\.0/);
  return { runtime, digest };
}

function nativePixels(cv, source, operation) {
  const destination = new cv.Mat();
  try {
    if (operation === 'equalize') cv.equalizeHist(source, destination);
    else cv.normalize(source, destination, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
    return Array.from(destination.data);
  } finally {
    destination.delete();
  }
}

function verifyEducationalMapping(cv, pixels, operation) {
  const math = new HistogramMath(new HistogramModel(frequenciesOf(pixels)));
  const lut = operation === 'equalize' ? math.getEqualizationData().lut : math.getExpansionData().lut;
  const source = cv.matFromArray(1, pixels.length, cv.CV_8UC1, pixels);
  try {
    const expected = nativePixels(cv, source, operation);
    assert.deepEqual(pixels.map(value => lut[value]), expected, `${operation} LUT differs from real engine`);
    return expected;
  } finally {
    source.delete();
  }
}

function verifyAdapter(cv, pixels, channels = 1) {
  const sourceBytes = channels === 1 ? pixels : pixels.flatMap(value => [value, value, value, 255]);
  const source = cv.matFromArray(1, pixels.length, channels === 1 ? cv.CV_8UC1 : cv.CV_8UC4, sourceBytes);
  const originalRead = cv.imread;
  const originalShow = cv.imshow;
  let rendered;
  // Replace DOM I/O only; matrix conversion, transforms and histograms use real WASM.
  cv.imread = () => source.clone();
  cv.imshow = (_, matrix) => { rendered = Array.from(matrix.data); };
  try {
    const processor = new OpenCvImageProcessor();
    const image = processor.executeMathematicalPipeline('source', 'original');
    assert.equal(image.isStrictGrayscale, true);
    assert.deepEqual(rendered, pixels);
    assert.deepEqual(image.getHistogram().getFrequencies(), frequenciesOf(pixels));
    assert.equal(image.getMetadata().totalPixels, pixels.length);
    for (const operation of ['equalize', 'expand']) {
      const expected = verifyEducationalMapping(cv, pixels, operation);
      const histogram = operation === 'equalize'
        ? processor.applyEqualization('source', 'processed')
        : processor.applyExpansion('source', 'processed');
      assert.deepEqual(rendered, expected, `${operation} adapter pixels`);
      assert.deepEqual(histogram.getFrequencies(), frequenciesOf(expected), `${operation} histogram bins`);
      assert.equal(histogram.getFrequencies().reduce((sum, count) => sum + count, 0), pixels.length);
    }
  } finally {
    cv.imread = originalRead;
    cv.imshow = originalShow;
    source.delete();
  }
}

function verifyLargeImagePrecision(cv) {
  const rows = 4096;
  const cols = 4097;
  const size = rows * cols;
  const processor = new OpenCvImageProcessor();
  const source = new cv.Mat(rows, cols, cv.CV_8UC1);
  const output = new cv.Mat();
  let compared = 0;
  try {
    for (const bins of [
      [[0, 4095], [128, 3190961], [255, 13586256]],
      [[128, size - 1], [200, 1]],
    ]) {
      const expected = new Array(256).fill(0);
      let start = 0;
      for (const [value, count] of bins) {
        source.data.fill(value, start, start + count);
        expected[value] = count;
        start += count;
      }
      const histogram = processor.extractHistogram(source);
      assert.deepEqual(histogram.getFrequencies(), expected, 'Large bins must retain exact integer counts');
      const lut = new HistogramMath(histogram).getEqualizationData().lut;
      cv.equalizeHist(source, output);
      const sourceBytes = source.data;
      const outputBytes = output.data;
      for (let i = 0; i < size; i++) {
        if (lut[sourceBytes[i]] !== outputBytes[i]) throw new Error(`Large-image equalization mismatch at pixel ${i}`);
      }
      compared += size;
    }
  } finally {
    source.delete();
    output.delete();
  }
  const padded = new cv.Mat(rows, cols + 1, cv.CV_8UC1);
  let roi;
  try {
    const paddedBytes = padded.data;
    paddedBytes.fill(128);
    for (let row = 0; row < rows; row++) paddedBytes[row * (cols + 1) + cols] = 42;
    paddedBytes[(rows - 1) * (cols + 1) + cols - 1] = 200;
    roi = padded.roi(new cv.Rect(0, 0, cols, rows));
    assert.equal(roi.isContinuous(), false);
    const frequencies = processor.extractHistogram(roi).getFrequencies();
    assert.equal(frequencies[128], size - 1);
    assert.equal(frequencies[200], 1);
    assert.equal(frequencies[42], 0, 'Row padding must not contribute to histogram');
    assert.equal(frequencies.reduce((sum, count) => sum + count, 0), size);
  } finally {
    roi?.delete();
    padded.delete();
  }
  return compared;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log(USAGE);
    return;
  }
  if (args.length !== 2 || args[0] !== '--runtime' || !args[1]) throw new Error(USAGE);
  const { runtime: cv, digest } = await loadRuntime(resolve(args[1]));
  globalThis.cv = cv;
  let expansionRanges = 0;
  let expansionPixels = 0;
  for (let min = 0; min < 256; min++) {
    for (let max = min; max < 256; max++) {
      const pixels = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      verifyEducationalMapping(cv, pixels, 'expand');
      expansionRanges++;
      expansionPixels += pixels.length;
    }
  }
  const sample = [80, 112, 144, 176].flatMap((value, i) => new Array([2048, 1024, 512, 512][i]).fill(value));
  const fixtures = [[], [0], [128], [255], [0, 128, 255], [0, 1, 6], [196, 203, 210], [0, 1, 2, 2, 2, 2, 2], Array.from({ length: 256 }, (_, i) => i), sample];
  let seed = 0x12345678;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let i = 0; i < 1000; i++) {
    const length = 2 + random(1023);
    const pixels = Array.from({ length }, () => random(256));
    fixtures.push(pixels);
  }
  for (const pixels of fixtures) verifyEducationalMapping(cv, pixels, 'equalize');
  let adapterCases = 0;
  for (const pixels of fixtures.filter(values => values.length > 0).slice(0, 25)) {
    for (const channels of [1, 4]) {
      verifyAdapter(cv, pixels, channels);
      adapterCases++;
    }
  }
  const largeImagePixelComparisons = verifyLargeImagePrecision(cv);
  console.log(JSON.stringify({
    status: 'pass', version: '4.8.0', sha256: digest,
    expansionRanges, expansionPixelComparisons: expansionPixels,
    equalizationFixtures: fixtures.length, adapterCases, largeImagePixelComparisons,
    lutExportAvailable: typeof cv.LUT === 'function',
  }));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
