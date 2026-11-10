import { expect, it, vi } from 'vitest';
import { LoadAndValidateImageUseCase } from './LoadAndValidateImageUseCase.js';

it('delegates reading and extraction to injected ports', async () => {
  const file = new File(['image'], 'gray.png', { type: 'image/png' });
  const reader = { readAsDataURL: vi.fn().mockResolvedValue('data:image/png;base64,data') };
  const processor = { executeMathematicalPipeline: vi.fn(() => 'model') };
  const useCase = new LoadAndValidateImageUseCase(processor, reader);
  await expect(useCase.execute(file)).resolves.toBe('data:image/png;base64,data');
  expect(reader.readAsDataURL).toHaveBeenCalledWith(file);
  expect(useCase.executeMathematicalExtraction('image', 'canvas')).toBe('model');
  expect(processor.executeMathematicalPipeline).toHaveBeenCalledWith('image', 'canvas');
});

it('preserves reader errors instead of replacing their cause', async () => {
  const error = new Error('cannot read image');
  const useCase = new LoadAndValidateImageUseCase({}, { readAsDataURL: vi.fn().mockRejectedValue(error) });
  await expect(useCase.execute({})).rejects.toBe(error);
});
