import { defineConfig } from '@playwright/test'

/**
 * Browser tests: the built app on a phone-sized screen, with mocked feeds (no network).
 * `npm run test:e2e` builds, starts the preview server and runs e2e/*.spec.ts.
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4174',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: 'en-GB',
    timezoneId: 'Europe/Madrid',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4174 --strictPort',
    url: 'http://localhost:4174',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
