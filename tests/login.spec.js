
import { test, expect } from '@playwright/test';
/*
test('Negative Test - Both fields empty', async ({ page }) => {
  await page.goto('https://platform.baap.company/');

  await page.getByPlaceholder('Enter your email or phone number').fill('');

  await page.getByPlaceholder('Password').fill('');

 await page.getByTestId('SI-submit-button-show').click();
 await expect(page).toHaveURL('https://platform.baap.company/choose-group');
});*/

/*test('Negative Test - Email entered, password empty', async ({ page }) => {
  await page.goto('https://platform.baap.company/');

  await page.getByPlaceholder('Enter your email or phone number').fill('sangaleritesh2809+1@gmail.com');

  await page.getByPlaceholder('Password').fill('');

  await page.getByTestId('SI-submit-button-show').click();

  // Verify that login page remains visible
   await expect(page).toHaveURL('https://platform.baap.company/choose-group');
});
*/
test('Positive Test - Valid login', async ({ page }) => {
  await page.goto('https://platform.baap.company/');

  await page.getByPlaceholder('Enter your email or phone number')
    .fill('sangaleritesh2809+1@gmail.com');

  await page.getByPlaceholder('Password').fill('Ritesh@1234');

  await page.getByTestId('SI-submit-button-show').click();
  // Verify successful login
  await expect(page).toHaveURL('https://platform.baap.company/choose-group');
  await page.getByPlaceholder('Search organizations')
    .fill('Baap Demo Account');
  await page.getByTestId(
    'CG-org-card-f93b85d2-8b9c-4c41-9746-395e9d93cfa3'
  ).click();
  await expect(page).toHaveURL('https://platform.baap.company/dashboard');
  // Click on Assignment menu
  await page.getByTestId('menu-item-assignment').click();
});
