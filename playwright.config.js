// Root-level Playwright config for browser smoke and live frontend-backend integration tests.
const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node e2e/mock-nasa-server.js',
      url: 'http://127.0.0.1:4100/healthz',
      reuseExistingServer: !process.env.CI,
      env: {
        MOCK_NASA_PORT: '4100',
      },
    },
    {
      command: 'npm --prefix backend run dev',
      url: 'http://127.0.0.1:4101/healthz',
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '4101',
        FRONTEND_ORIGIN: 'http://127.0.0.1:3100',
        NASA_API_BASE_URL: 'http://127.0.0.1:4100',
        NASA_API_KEY: 'DEMO_KEY',
        ENABLE_REDIS_CACHE: 'false',
        OPENAI_API_KEY: '',
      },
    },
    {
      command: 'npm --prefix frontend run dev -- --host 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_DEV_PROXY_TARGET: 'http://127.0.0.1:4101',
      },
    },
  ],
})
