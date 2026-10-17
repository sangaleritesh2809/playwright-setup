import { expect } from '@playwright/test';

/**
 * Default test configuration and credentials
 */
export const CONFIG = {
  baseUrl: 'https://platform.baap.company',
  dashboardUrl: 'https://platform.baap.company/dashboard',
  email: process.env.USER_EMAIL || 'sangaleritesh2809+1@gmail.com',
  password: process.env.USER_PASSWORD || 'Ritesh@1234',
  organizationName: 'Baap Demo Account',
  orgCardTestId: 'CG-org-card-f93b85d2-8b9c-4c41-9746-395e9d93cfa3',
};

/**
 * Reusable login helper function
 * Logs into the Baap platform and navigates to the dashboard
 */
export async function loginToPlatform(page) {
  await page.goto(CONFIG.baseUrl);

  // Fill credentials
  await page.getByPlaceholder('Enter your email or phone number').fill(CONFIG.email);
  await page.getByPlaceholder('Password').fill(CONFIG.password);

  // Click Sign In
  await page.getByTestId('SI-submit-button-show').click();

  // Handle Organization selection if redirected to choose-group
  try {
    await page.waitForURL('**/choose-group', { timeout: 10000 });
    await page.getByPlaceholder('Search organizations').fill(CONFIG.organizationName);

    // Try org card by test ID, fallback to text/role
    const orgCard = page.getByTestId(CONFIG.orgCardTestId);
    if (await orgCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      await orgCard.click();
    } else {
      await page.getByText(CONFIG.organizationName).first().click();
    }
  } catch {
    // If directly redirected to dashboard or already logged in
  }

  // Ensure user lands on dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page).toHaveURL(/.*dashboard.*/);
}

/**
 * Navigates to HRMS module from the dashboard
 */
export async function navigateToHRMS(page) {
  const hrmsMenuLocators = [
    page.getByTestId('menu-item-hrms'),
    page.getByTestId('menu-item-assignment'),
    page.getByRole('link', { name: /hrms/i }),
    page.getByText('HRMS', { exact: false }),
    page.getByRole('button', { name: /hrms/i }),
  ];

  let clicked = false;
  for (const locator of hrmsMenuLocators) {
    if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
      await locator.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    await page.goto(`${CONFIG.baseUrl}/hrms`).catch(() => {});
  }

  await page.waitForLoadState('networkidle').catch(() => {});
}

/**
 * Navigates to Attendance sub-module
 */
export async function navigateToAttendance(page) {
  const attendanceLocators = [
    page.getByTestId('menu-item-attendance'),
    page.getByRole('link', { name: /attendance/i }),
    page.getByText('Attendance', { exact: false }),
    page.getByRole('tab', { name: /attendance/i }),
  ];

  for (const locator of attendanceLocators) {
    if (await locator.isVisible({ timeout: 2500 }).catch(() => false)) {
      await locator.click();
      return;
    }
  }

  await page.goto(`${CONFIG.baseUrl}/hrms/attendance`).catch(() => {});
}

/**
 * Navigates to Leave Management sub-module
 */
export async function navigateToLeaveManagement(page) {
  const leaveLocators = [
    page.getByTestId('menu-item-leave'),
    page.getByTestId('menu-item-leaves'),
    page.getByRole('link', { name: /leave/i }),
    page.getByText('Leave Management', { exact: false }),
    page.getByText('Leaves', { exact: false }),
    page.getByRole('tab', { name: /leave/i }),
  ];

  for (const locator of leaveLocators) {
    if (await locator.isVisible({ timeout: 2500 }).catch(() => false)) {
      await locator.click();
      return;
    }
  }

  await page.goto(`${CONFIG.baseUrl}/hrms/leaves`).catch(() => {});
}
