import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  // fixtures/pages.fixture.ts is included here (not via importTestFrom, removed
  // in playwright-bdd 9.x) so bddgen discovers its exported `test` automatically.
  steps: ['steps/**/*.ts', 'fixtures/**/*.ts'],
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], headless: false, viewport: { width: 1280, height: 720 }, video: 'on' } },
    // Install firefox/webkit with `npx playwright install firefox webkit`
    // then uncomment to run cross-browser:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
