import { defineConfig } from 'vite';

export default defineConfig({
  base: '/grayscale-studio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
