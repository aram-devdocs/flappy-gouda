import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: ['@repo/engine', '@repo/hooks', '@repo/types', '@repo/ui'] },
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  noExternal: ['@repo/engine', '@repo/hooks', '@repo/types', '@repo/ui'],
});
