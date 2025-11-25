import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,

  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    storageState: path.join(__dirname, 'tests/playwright/.auth/user.json'),
    trace: 'on-first-retry',
  },

  
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   timeout: 120_000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
