// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./src/tests/fixtures/setup.fixtures.js'], // ← ini yang benar
  globalSetup: './src/tests/fixtures/global-setup.fixtures.js',
  globalTeardown: './src/tests/fixtures/global-teardown.fixtures.js',
  testTimeout: 30000,
}
