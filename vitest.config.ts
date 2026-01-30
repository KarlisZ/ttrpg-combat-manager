import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      },
      include: ['src/models/**/*.ts', 'src/services/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/components/**', 'src/contexts/**', 'src/style.css']
    },
  },
})
