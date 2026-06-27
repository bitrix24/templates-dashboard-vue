import { defineConfig } from 'vitest/config'

// Standalone config for unit tests of pure business logic (formatters, helpers,
// utils). It intentionally does NOT load the app's vite.config.ts / Bitrix24 UI
// plugin — these tests need no SFC compilation, only a DOM for DOMParser.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    globals: false
  }
})
