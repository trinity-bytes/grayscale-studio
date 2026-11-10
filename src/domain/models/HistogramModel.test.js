import { expect, it } from 'vitest';
import { HistogramModel } from './HistogramModel.js';

it('preserves existing borrowed-array ownership and intensity labels', () => {
  const frequencies = new Array(256).fill(0);
  const model = new HistogramModel(frequencies);
  expect(model.getFrequencies()).toBe(frequencies);
  frequencies[12] = 2;
  expect(model.getFrequencies()[12]).toBe(2);
  expect(model.getLabels()).toEqual(Array.from({ length: 256 }, (_, i) => i));
});

it.each([null, [], new Array(255), new Array(257)])('rejects invalid histogram shape %j', frequencies => {
  expect(() => new HistogramModel(frequencies)).toThrow('El histograma debe contener exactamente 256 niveles de intensidad.');
});
