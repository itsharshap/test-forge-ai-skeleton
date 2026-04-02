import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.ENV ?? 'sit1';

const BASE_URLS: Record<string, string> = {
  sit1: process.env.BASE_URL_SIT1 ?? 'https://gems-sit1.cibc.internal',
  uat:  process.env.BASE_URL_UAT  ?? 'https://gems-uat.cibc.internal',
};

const testDir = defineBddConfig({
  features: 'tests/features/**/*.feature',
  steps:    'tests/steps/**/*.steps.ts',
});

export default defineConfig({
  testDir,
  globalSetup: './src/utils/global-setup.ts',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['./src/utils/ALMReporter.ts'],
  ],
  use: {
    baseURL:     BASE_URLS[ENV],
    trace:       'on-first-retry',
    screenshot:  'only-on-failure',
    video:       'retain-on-failure',
    actionTimeout: 30_000,
  },
  projects: [
    {
      name: 'sit1-chromium',
      use:  { ...devices['Desktop Chrome'], baseURL: BASE_URLS['sit1'] },
    },
    {
      name: 'uat-chromium',
      use:  { ...devices['Desktop Chrome'], baseURL: BASE_URLS['uat'] },
    },
  ],
  retries:   process.env.CI ? 2 : 0,
  workers:   process.env.CI ? 4 : undefined,
  timeout:   60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
});
