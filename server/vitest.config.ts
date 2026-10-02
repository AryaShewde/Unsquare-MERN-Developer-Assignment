import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Run each test file in its own process so environment variables and
    // module-level singletons (e.g. mongoose connection, process.env) are
    // fully isolated between test suites.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Increased timeouts to accommodate slower resource allocation 
    // on the current machine for MongoDB instances.
    hookTimeout: 120_000,
    testTimeout: 60_000,
  },
})
