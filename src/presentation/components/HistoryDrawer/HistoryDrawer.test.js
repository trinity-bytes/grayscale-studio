import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './HistoryDrawer.js';

const metrics = { min: 0, max: 255, mean: 100.25, std: 20 };
const storedEntry = (overrides = {}) => ({
  id: 1, type: 'equalize', filename: 'sample.png', timestamp: '10:20:30',
  metricsBefore: { ...metrics }, metricsAfter: { ...metrics, min: 10 }, ...overrides,
});
const mount = () => {
  const drawer = document.createElement('history-drawer');
  document.body.appendChild(drawer);
  return drawer;
};

beforeEach(() => {
  // The runner exposes no localStorage; model the browser storage boundary.
  const records = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, String(value)),
    clear: () => records.clear(),
  });
  localStorage.clear();
  document.body.innerHTML = '';
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.body.style.overflow = '';
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('HistoryDrawer', () => {
  it('loads existing records without changing storage and keeps their displayed values', () => {
    const entry = storedEntry();
    const raw = JSON.stringify([entry]);
    localStorage.setItem('grayscale-history', raw);
    const drawer = mount();
    expect(drawer.entries).toEqual([entry]);
    expect(drawer.querySelector('.history-card-title').textContent.trim()).toBe(entry.filename);
    expect(drawer.querySelector('.history-card-title').title).toBe(entry.filename);
    expect(drawer.querySelector('.history-time').textContent).toBe(entry.timestamp);
    expect(drawer.querySelector('.history-badge').textContent).toBe('Ecualizar');
    expect([...drawer.querySelectorAll('.history-metric-val')].map(el => el.textContent.trim()))
      .toEqual(['0 → 10', '255 → 255', '100.25 → 100.25', '20 → 20']);
    expect(drawer.querySelector('#history-empty-state').classList.contains('hidden')).toBe(true);
    expect(localStorage.getItem('grayscale-history')).toBe(raw);
  });

  it('adds newest first, limits records to 20, persists the same record shape and clears through the button', () => {
    const drawer = mount();
    for (let i = 0; i < 21; i++) {
      drawer.addEntry({ type: 'expand', filename: `${i}.png`, metricsBefore: metrics, metricsAfter: metrics });
    }
    expect(drawer.entries).toHaveLength(20);
    expect(drawer.entries[0].filename).toBe('20.png');
    expect(drawer.entries.at(-1).filename).toBe('1.png');
    expect(JSON.parse(localStorage.getItem('grayscale-history'))).toEqual(drawer.entries);
    expect(Object.keys(drawer.entries[0]).sort()).toEqual(
      ['id', 'type', 'filename', 'timestamp', 'metricsBefore', 'metricsAfter'].sort(),
    );
    expect(drawer.querySelector('.history-badge').textContent).toBe('Expansión');
    drawer.querySelector('#history-clear-btn').click();
    expect(drawer.entries).toEqual([]);
    expect(localStorage.getItem('grayscale-history')).toBe('[]');
    expect(drawer.querySelectorAll('.history-card')).toHaveLength(0);
    expect(drawer.querySelector('#history-empty-state').classList.contains('hidden')).toBe(false);
  });

  it('treats filenames, timestamps and live metric values as text rather than HTML', () => {
    const payload = '\"><img src=x onerror="alert(1)">';
    const drawer = mount();
    drawer.addEntry({ type: 'equalize', filename: payload, metricsBefore: { ...metrics, min: payload }, metricsAfter: metrics });
    drawer.entries[0].timestamp = payload;
    drawer.render();
    expect(drawer.querySelectorAll('img, script, [onerror]')).toHaveLength(0);
    expect(drawer.querySelector('.history-card-title').textContent).toBe(payload);
    expect(drawer.querySelector('.history-card-title').title).toBe(payload);
    expect(drawer.querySelector('.history-time').textContent).toBe(payload);
    expect(drawer.querySelector('.history-metric-val').textContent).toBe(`${payload} → 0`);
  });

  it('keeps stored malicious filenames and timestamps literal', () => {
    const payload = '<img src=x onerror="alert(1)">';
    localStorage.setItem('grayscale-history', JSON.stringify([storedEntry({ filename: payload, timestamp: payload })]));
    const drawer = mount();
    expect(drawer.querySelectorAll('img, [onerror]')).toHaveLength(0);
    expect(drawer.querySelector('.history-card-title').textContent).toBe(payload);
    expect(drawer.querySelector('.history-time').textContent).toBe(payload);
  });

  it.each(['{}', 'null', '42', '"history"', '{broken'])('handles malformed storage %s without rewriting it', raw => {
    const drawer = mount();
    localStorage.setItem('grayscale-history', raw);
    expect(() => drawer.loadHistory()).not.toThrow();
    expect(drawer.entries).toEqual([]);
    expect(drawer.querySelectorAll('.history-card')).toHaveLength(0);
    expect(localStorage.getItem('grayscale-history')).toBe(raw);
  });

  it('retains valid records while ignoring partial, unsupported or nonnumeric stored records', () => {
    const valid = storedEntry();
    const data = [valid, null, {}, storedEntry({ type: 'delete' }), storedEntry({ filename: {} }),
      storedEntry({ metricsBefore: null }), storedEntry({ metricsAfter: { ...metrics, max: '<img src=x>' } })];
    const raw = JSON.stringify(data);
    const drawer = mount();
    localStorage.setItem('grayscale-history', raw);
    expect(() => drawer.loadHistory()).not.toThrow();
    expect(drawer.entries).toEqual([valid]);
    expect(drawer.querySelectorAll('.history-card')).toHaveLength(1);
    expect(localStorage.getItem('grayscale-history')).toBe(raw);
  });

  it('still works in memory when storage reads and writes are denied', () => {
    const drawer = mount();
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('Denied'); });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('Denied'); });
    expect(() => drawer.loadHistory()).not.toThrow();
    expect(() => drawer.addEntry({ type: 'expand', filename: '', metricsBefore: metrics, metricsAfter: metrics })).not.toThrow();
    expect(drawer.entries[0].filename).toBe('Imagen sin nombre');
    drawer.open();
    expect(document.body.style.overflow).toBe('hidden');
    drawer.querySelector('#history-close-btn').click();
    expect(document.body.style.overflow).toBe('');
    expect(() => drawer.clear()).not.toThrow();
    expect(drawer.entries).toEqual([]);
  });
});
