import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'react/index': './react/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'distributions',
  sourcemap: true,
  external: ['react', '@tanstack/react-query'],
})
