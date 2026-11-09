import { expect, it } from 'vitest';
import { HistogramModel } from './HistogramModel.js';
import { computeHistogramMetrics } from './HistogramMetrics.js';

it.each([
  [[], { min: 0, max: 0, mean: 0, std: 0 }],
  [[[42, 3]], { min: 42, max: 42, mean: 42, std: 0 }],
  [[[0, 1], [255, 1]], { min: 0, max: 255, mean: 127.5, std: 127.5 }],
  [[[10, 1], [30, 2]], { min: 10, max: 30, mean: 23.33, std: 9.43 }],
])('calculates population statistics for %j without mutating frequencies', (bins, expected) => {
  const frequencies = new Array(256).fill(0);
  bins.forEach(([intensity, count]) => { frequencies[intensity] = count; });
  const original = [...frequencies];
  expect(computeHistogramMetrics(new HistogramModel(frequencies))).toEqual(expected);
  expect(frequencies).toEqual(original);
});
