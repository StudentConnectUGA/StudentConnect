// playwright.config.ts
import { defineConfig } from '@playwright/test';
import path from 'path';

const storageStatePath = path.join(
  __dirname,
  'tests/playwright/.auth/user.json'
);

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,

  // Global defaults (no storageState here)
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    trace: 'on-first-retry',
  },

  projects: [
    // 1) Runs ONCE: creates the auth state file
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 2) All tests that require login, in tests/logged_in/
    {
      name: 'logged-in',
      testMatch: /logged_in\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: storageStatePath,
      },
    },

    // 3) Tests that should run without being logged in
    {
      name: 'unauth',
      testMatch: /auth-protection\.spec\.ts/,
    },
  ],
});
