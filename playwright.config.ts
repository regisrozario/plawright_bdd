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
  // Target is live apple.com (read-only). Keep traffic low and human-paced:
  // one worker, no parallelism, no automatic retries (a retry is another hit on
  // a production site, and it would hide bot-detection blocks as "flakes").
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'https://www.apple.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    browserName: 'chromium',
    channel: 'chrome'
  },

  projects: [
    { name: 'smoke', use: { ...devices['Desktop Chrome'], headless: false, viewport: { width: 1280, height: 720 }, video: 'on' } },
    // Install firefox/webkit with `npx playwright install firefox webkit`
    // then uncomment to run cross-browser:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
