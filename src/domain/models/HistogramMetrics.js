/** Calculate population statistics for an intensity histogram without UI dependencies. */
export function computeHistogramMetrics(histogram) {
  const freq = histogram.getFrequencies();
  const totalPixels = freq.reduce((sum, v) => sum + v, 0);
  if (totalPixels === 0) return { min: 0, max: 0, mean: 0, std: 0 };

  // Locate occupied intensity bounds.
  let min = 0;
  let max = 255;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) { min = i; break; }
  }
  for (let i = 255; i >= 0; i--) {
    if (freq[i] > 0) { max = i; break; }
  }

  // Weighted population mean.
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * freq[i];
  }
  const mean = sum / totalPixels;

  // Weighted population standard deviation.
  let varianceSum = 0;
  for (let i = 0; i < 256; i++) {
    varianceSum += freq[i] * (i - mean) ** 2;
  }
  const std = Math.sqrt(varianceSum / totalPixels);

  return {
    min,
    max,
    mean: Math.round(mean * 100) / 100,
    std: Math.round(std * 100) / 100,
  };
}
