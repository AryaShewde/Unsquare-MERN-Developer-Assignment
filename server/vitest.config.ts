import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Run each test file in its own process so environment variables and
    // module-level singletons (e.g. mongoose connection, process.env) are
    // fully isolated between test suites.
    pool: 'forks',
    // Each test file gets a generous timeout to allow MongoDB Memory Server
    // startup and async verification worker steps.
    hookTimeout: 120_000,
    testTimeout: 60_000,
  },
})
