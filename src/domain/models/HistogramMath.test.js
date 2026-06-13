import { describe, it, expect } from 'vitest';
import { HistogramMath } from './HistogramMath.js';
import { HistogramModel } from './HistogramModel.js';

/**
 * Helper: create a HistogramModel with a custom frequency array.
 * The array must be exactly 256 numbers.
 */
function makeModel(frequencies) {
  return new HistogramModel(frequencies);
}

/**
 * Helper: uniform distribution — every bin gets the same count.
 */
function uniformFrequencies(countPerBin = 10) {
  return Array.from({ length: 256 }, () => countPerBin);
}

/**
 * Helper: all intensity concentrated at one bin (flat image).
 */
function flatFrequencies(intensity = 128, totalPixels = 2560) {
  const freq = new Array(256).fill(0);
  freq[intensity] = totalPixels;
  return freq;
}

// ──────────────────────────────────────────────
// CDF Tests
// ──────────────────────────────────────────────
describe('HistogramMath — CDF computation', () => {
  it('CDF is a normalized cumulative sum of frequencies (0 to 1)', () => {
    const freq = uniformFrequencies(10); // 256 bins × 10 = 2560 total
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { cdf } = math.getEqualizationData();

    expect(cdf).toHaveLength(256);

    // CDF starts at 0 (cumulative before any bin) — actually it's cumulative
    // INCLUDING the current bin, so cdf[0] = 10/2560
    expect(cdf[0]).toBeCloseTo(10 / 2560, 6);

    // CDF ends at 1.0 (all pixels accumulated)
    expect(cdf[255]).toBeCloseTo(1.0, 6);

    // CDF is monotonically non-decreasing
    for (let i = 1; i < 256; i++) {
      expect(cdf[i]).toBeGreaterThanOrEqual(cdf[i - 1]);
    }
  });

  it('CDF handles non-uniform distribution correctly', () => {
    const freq = new Array(256).fill(0);
    freq[0] = 50;   // 50 pixels at intensity 0
    freq[255] = 50; // 50 pixels at intensity 255
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { cdf } = math.getEqualizationData();

    // After intensity 0: 50 / 100 = 0.5
    expect(cdf[0]).toBeCloseTo(0.5, 6);

    // All bins 1–254 stay at 0.5 (no pixels there)
    expect(cdf[128]).toBeCloseTo(0.5, 6);

    // After intensity 255: 100 / 100 = 1.0
    expect(cdf[255]).toBeCloseTo(1.0, 6);
  });

  it('CDF is all zeros when totalPixels is zero', () => {
    const freq = new Array(256).fill(0);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { cdf } = math.getEqualizationData();

    for (let i = 0; i < 256; i++) {
      expect(cdf[i]).toBe(0);
    }
  });
});

// ──────────────────────────────────────────────
// Equalization LUT Tests
// ──────────────────────────────────────────────
describe('HistogramMath — Equalization LUT', () => {
  it('equalization LUT = round(CDF * 255) for all 256 bins', () => {
    const freq = uniformFrequencies(10);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { cdf, lut } = math.getEqualizationData();

    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBe(Math.round(cdf[i] * 255));
    }
  });

  it('equalization LUT values are in range 0–255', () => {
    const freq = uniformFrequencies(10);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getEqualizationData();

    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBeGreaterThanOrEqual(0);
      expect(lut[i]).toBeLessThanOrEqual(255);
    }
  });

  it('equalization LUT for uniform distribution is approximately linear', () => {
    const freq = uniformFrequencies(10);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getEqualizationData();

    // With uniform distribution, CDF(i) ≈ (i+1)/256
    // So lut[i] ≈ round((i+1)/256 * 255) ≈ i for most values
    for (let i = 0; i < 256; i++) {
      const expected = Math.round(((i + 1) / 256) * 255);
      expect(lut[i]).toBe(expected);
    }
  });

  it('equalization LUT ends at 255', () => {
    const freq = uniformFrequencies(10);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getEqualizationData();

    expect(lut[255]).toBe(255);
  });
});

// ──────────────────────────────────────────────
// Expansion LUT Tests
// ──────────────────────────────────────────────
describe('HistogramMath — Expansion LUT', () => {
  it('expansion LUT = linear min-max mapping for all 256 bins', () => {
    // Frequencies only at bins 50 and 200 → min=50, max=200
    const freq = new Array(256).fill(0);
    freq[50] = 100;
    freq[200] = 100;
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    // Bins <= min → 0
    expect(lut[0]).toBe(0);
    expect(lut[50]).toBe(0);

    // Bins >= max → 255
    expect(lut[200]).toBe(255);
    expect(lut[255]).toBe(255);

    // Midpoint between min and max: (125 - 50) * 255 / (200 - 50) = 75 * 255 / 150 = 127.5 → 128
    expect(lut[125]).toBe(Math.round((125 - 50) * 255 / (200 - 50)));
  });

  it('expansion LUT values are in range 0–255', () => {
    const freq = new Array(256).fill(0);
    freq[10] = 50;
    freq[240] = 50;
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBeGreaterThanOrEqual(0);
      expect(lut[i]).toBeLessThanOrEqual(255);
    }
  });

  it('expansion LUT is monotonically non-decreasing', () => {
    const freq = new Array(256).fill(0);
    freq[30] = 20;
    freq[180] = 80;
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    for (let i = 1; i < 256; i++) {
      expect(lut[i]).toBeGreaterThanOrEqual(lut[i - 1]);
    }
  });

  it('expansion LUT for full-range image maps input to output linearly', () => {
    // Every bin has frequency → min=0, max=255
    const freq = uniformFrequencies(1);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    // With min=0, max=255: lut[i] = round((i-0)*255/255) = i
    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBe(i);
    }
  });
});

// ──────────────────────────────────────────────
// Edge Case: Flat Image
// ──────────────────────────────────────────────
describe('HistogramMath — Edge case: flat image', () => {
  it('returns identity LUT for expansion when all pixels have same intensity', () => {
    const freq = flatFrequencies(128, 2560);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    // min == max → identity LUT
    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBe(i);
    }
  });

  it('returns identity LUT for expansion when all pixels are intensity 0', () => {
    const freq = flatFrequencies(0, 1000);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBe(i);
    }
  });

  it('returns identity LUT for expansion when all pixels are intensity 255', () => {
    const freq = flatFrequencies(255, 1000);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { lut } = math.getExpansionData();

    for (let i = 0; i < 256; i++) {
      expect(lut[i]).toBe(i);
    }
  });

  it('CDF for flat image is 0 until the intensity bin, then 1', () => {
    const freq = flatFrequencies(100, 500);
    const model = makeModel(freq);
    const math = new HistogramMath(model);
    const { cdf } = math.getEqualizationData();

    // All bins before 100 → CDF = 0
    for (let i = 0; i < 100; i++) {
      expect(cdf[i]).toBe(0);
    }

    // Bin 100 and after → CDF = 1
    for (let i = 100; i < 256; i++) {
      expect(cdf[i]).toBeCloseTo(1.0, 6);
    }
  });
});
