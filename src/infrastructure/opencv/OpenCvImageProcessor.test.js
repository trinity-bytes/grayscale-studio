import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenCvImageProcessor } from './OpenCvImageProcessor.js';

function createOpenCv({ failAt, channelCount = 4, mean = 0 } = {}) {
  const allocated = [];
  const counts = new Map();
  const hit = (name) => {
    const count = (counts.get(name) || 0) + 1;
    counts.set(name, count);
    if (failAt === name || failAt === `${name}:${count}`) throw new Error(`failed ${name}`);
  };
  const resource = (kind) => {
    const object = {
      kind,
      deleted: false,
      rows: 2,
      cols: 2,
      channelCount,
      channels() { hit('channels'); return this.channelCount; },
      copyTo(destination) { hit('copyTo'); destination.channelCount = this.channelCount; },
      floatAt(index) {
        hit('floatAt');
        if (this.deleted) throw new Error('read after delete');
        return index === 0 ? 1 : index === 255 ? 3 : 0;
      },
      delete: vi.fn(function () { this.deleted = true; }),
    };
    allocated.push(object);
    return object;
  };
  const operation = (name, run = () => {}) => vi.fn((...args) => { hit(name); return run(...args); });
  const cv = {
    Mat: vi.fn(function () { hit('Mat'); return resource('Mat'); }),
    MatVector: vi.fn(function () {
      hit('MatVector');
      return Object.assign(resource('MatVector'), {
        get: operation('get', () => resource('channel')),
        push_back: operation('push_back'),
      });
    }),
    imread: operation('imread', () => resource('source')),
    cvtColor: operation('cvtColor', (_, target) => { target.channelCount = 1; }),
    imshow: operation('imshow'),
    split: operation('split'),
    absdiff: operation('absdiff'),
    mean: operation('mean', () => [mean]),
    minMaxLoc: operation('minMaxLoc', () => ({ minVal: 0, maxVal: 255 })),
    calcHist: operation('calcHist'),
    equalizeHist: operation('equalizeHist'),
    normalize: operation('normalize'),
    COLOR_RGBA2GRAY: 11,
    NORM_MINMAX: 32,
    CV_8UC1: 0,
  };
  const borrowed = {
    channelCount,
    channels: () => channelCount,
    delete: vi.fn(),
  };
  vi.stubGlobal('cv', cv);
  return { cv, allocated, borrowed };
}

const frequencies = Array.from({ length: 256 }, (_, i) => i === 0 ? 1 : i === 255 ? 3 : 0);
const expectReleased = ({ allocated, borrowed }) => {
  for (const object of allocated) expect(object.delete, `${object.kind} ownership`).toHaveBeenCalledOnce();
  expect(borrowed.delete).not.toHaveBeenCalled();
};
afterEach(() => vi.unstubAllGlobals());

describe('OpenCV allocation ownership', () => {
  it('returns detached pipeline data and releases every temporary including channel wrappers', () => {
    const context = createOpenCv();
    const result = new OpenCvImageProcessor().executeMathematicalPipeline('source', 'target');
    expect(result.isStrictGrayscale).toBe(true);
    expect(result.getMetadata()).toEqual({ width: 2, height: 2, totalPixels: 4, minVal: 0, maxVal: 255 });
    expectReleased(context);
    expect(result.getHistogram().getFrequencies()).toEqual(frequencies);
    expect(context.cv.imshow).toHaveBeenCalledWith('target', expect.any(Object));
    expect(context.cv.calcHist).toHaveBeenCalledWith(expect.any(Object), [0], expect.any(Object), expect.any(Object), [256], [0, 255], false);
  });

  it.each(['applyEqualization', 'applyExpansion'])('%s preserves transform parameters and returns usable histogram data', (method) => {
    const context = createOpenCv();
    const result = new OpenCvImageProcessor()[method]('source', 'target');
    expectReleased(context);
    expect(result.getFrequencies()).toEqual(frequencies);
    expect(context.cv.imread).toHaveBeenCalledWith('source');
    expect(context.cv.cvtColor).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), context.cv.COLOR_RGBA2GRAY, 0);
    if (method === 'applyEqualization') {
      expect(context.cv.equalizeHist).toHaveBeenCalledOnce();
      expect(context.cv.normalize).not.toHaveBeenCalled();
    } else {
      expect(context.cv.normalize).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), 0, 255, context.cv.NORM_MINMAX, context.cv.CV_8UC1);
      expect(context.cv.equalizeHist).not.toHaveBeenCalled();
    }
  });

  it('extracts a histogram without deleting its borrowed matrix', () => {
    const context = createOpenCv();
    const result = new OpenCvImageProcessor().extractHistogram(context.borrowed);
    expectReleased(context);
    expect(result.getFrequencies()).toEqual(frequencies);
    expect(context.cv.calcHist.mock.calls[0][4]).toEqual([256]);
  });

  it.each([0, 1.99, 2])('preserves grayscale tolerance for mean %s', (mean) => {
    const context = createOpenCv({ mean });
    expect(new OpenCvImageProcessor().checkIfGrayscale(context.borrowed)).toBe(mean < 2);
    expectReleased(context);
  });

  it('does not allocate or delete a borrowed single-channel matrix', () => {
    const context = createOpenCv({ channelCount: 1 });
    expect(new OpenCvImageProcessor().checkIfGrayscale(context.borrowed)).toBe(true);
    expect(context.allocated).toHaveLength(0);
    expectReleased(context);
  });

  it.each(['executeMathematicalPipeline', 'applyEqualization', 'applyExpansion'])('%s preserves the single-channel copy path', (method) => {
    const context = createOpenCv({ channelCount: 1 });
    new OpenCvImageProcessor()[method]('source', 'target');
    expect(context.cv.cvtColor).not.toHaveBeenCalled();
    expectReleased(context);
  });

  it.each(['executeMathematicalPipeline', 'applyEqualization', 'applyExpansion'])('%s releases matrices if copying a single-channel source fails', (method) => {
    const context = createOpenCv({ channelCount: 1, failAt: 'copyTo' });
    expect(() => new OpenCvImageProcessor()[method]('source', 'target')).toThrow('failed copyTo');
    expectReleased(context);
  });

  const failures = {
    executeMathematicalPipeline: ['imread', 'MatVector:1', 'split', 'Mat:1', 'Mat:2', 'get:1', 'get:2', 'get:3', 'absdiff', 'mean', 'Mat:3', 'cvtColor', 'imshow', 'minMaxLoc', 'Mat:4', 'Mat:5', 'MatVector:2', 'push_back', 'calcHist', 'floatAt'],
    checkIfGrayscale: ['MatVector', 'split', 'Mat:1', 'Mat:2', 'get:1', 'get:2', 'get:3', 'absdiff', 'mean'],
    extractHistogram: ['Mat:1', 'Mat:2', 'MatVector', 'push_back', 'calcHist', 'floatAt'],
    applyEqualization: ['imread', 'Mat:1', 'Mat:2', 'cvtColor', 'equalizeHist', 'imshow', 'Mat:3', 'Mat:4', 'MatVector', 'push_back', 'calcHist', 'floatAt'],
    applyExpansion: ['imread', 'Mat:1', 'Mat:2', 'cvtColor', 'normalize', 'imshow', 'Mat:3', 'Mat:4', 'MatVector', 'push_back', 'calcHist', 'floatAt'],
  };
  for (const [method, points] of Object.entries(failures)) {
    it.each(points)(`${method} releases acquired resources when %s fails`, (failAt) => {
      const context = createOpenCv({ failAt });
      const run = () => new OpenCvImageProcessor()[method](context.borrowed, 'target');
      const message = method === 'executeMathematicalPipeline' && failAt === 'imread'
        ? 'OpenCV no pudo procesar los datos fuente de la imagen asíncrona.'
        : `failed ${failAt.split(':')[0]}`;
      expect(run).toThrow(message);
      expectReleased(context);
    });
  }
});
