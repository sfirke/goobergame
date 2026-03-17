import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run in Node — our pure logic modules have zero browser/Phaser dependencies
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
