import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '#': resolve(__dirname, '../src')
    }
  },
  test: {
    exclude: [...configDefaults.exclude, 'build/**/*'],
    coverage: {
      provider: 'v8',
      exclude: [...coverageConfigDefaults.exclude, 'build/**/*']
    },
  },
})
