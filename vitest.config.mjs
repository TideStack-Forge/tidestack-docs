import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@site': fileURLToPath(new URL('.', import.meta.url)),
      '@theme-original/MDXComponents': fileURLToPath(new URL('./node_modules/@docusaurus/theme-classic/src/theme/MDXComponents/index.tsx', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.jsx', 'config/**/*.test.mjs', 'scripts/**/*.test.mjs'],
    coverage: {
      include: ['src/components/SvgViewer/*.jsx', 'src/theme/MDXComponents/index.jsx', 'config/plugins/external-svg-images.js'],
      exclude: ['**/*.test.jsx'],
      thresholds: {lines: 70, functions: 70, branches: 70, statements: 70},
    },
  },
})
