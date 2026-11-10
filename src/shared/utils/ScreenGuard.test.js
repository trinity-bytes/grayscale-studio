import { expect, it } from 'vitest';
import { getScreenState } from './ScreenGuard.js';
it('retains phone limitation and asks portrait tablets to rotate', () => {
  expect(getScreenState(390,844,true)).toBe('phone');
  expect(getScreenState(768,1024,true)).toBe('portrait');
  expect(getScreenState(820,1180,true)).toBe('portrait');
});
it('allows landscape tablets and desktops, but asks narrow desktop windows to maximize', () => {
  expect(getScreenState(1024,768,true)).toBe('ready');
  expect(getScreenState(1180,820,true)).toBe('ready');
  expect(getScreenState(1440,900,false)).toBe('ready');
  expect(getScreenState(800,600,false)).toBe('narrow');
});
