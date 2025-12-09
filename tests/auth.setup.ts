import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const storageStatePath = path.join(
  __dirname,
  'playwright/.auth/user.json'
);

test('login and save storage state', async ({ page }) => {

  test.skip(
    fs.existsSync(storageStatePath) && !process.env.FORCE_AUTH_SETUP,
    'Auth storage state already exists, skipping login.'
  );

  test.setTimeout(5 * 60 * 1000); // 5 minutes


  await page.goto('http://127.0.0.1:3000/');

  // adjust selector for  NextAuth button
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('http://127.0.0.1:3000/api/auth/signin**');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  console.log('Please complete the OAuth login in the opened browser window...');

  // manually complete OAuth; wait until you're back on  app

  await new Promise((resolve) => setTimeout(resolve, 45000));
  console.log('Assuming login completed, saving storage state...');
  await page.context().storageState({
    path: storageStatePath,
  });
});
