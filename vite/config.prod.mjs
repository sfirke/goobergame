import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the project at /goobergame/ — this prefix must match
  base: '/goobergame/',
  logLevel: 'warn',
  build: {
    // Phaser is ~1 MB minified — raise the limit so the build doesn't warn about it
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
      format: { comments: false },
    },
  },
});
