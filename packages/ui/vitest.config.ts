import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.stories.tsx', 'src/**/index.ts'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 90,
        statements: 80,
      },
    },
  },
});
