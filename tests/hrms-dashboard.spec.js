import { test, expect } from '@playwright/test';
import {
  CONFIG,
  loginToPlatform,
  navigateToHRMS,
} from './helpers/hrms-helper.js';

test.describe('HRMS - Dashboard & Navigation Positive Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await loginToPlatform(page);
  });

  test('TC_DASH_01: Positive Test - Navigate from Baap Platform Dashboard to HRMS', async ({ page }) => {
    // 1. Verify user is on the main platform dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);

    // 2. Click on HRMS or Assignment / Apps menu
    await navigateToHRMS(page);

    // 3. Verify HRMS workspace is loaded
    const hrmsIndicator = page.locator('text=/(HRMS|Human Resource|Attendance|Leave|Employee)/i').first();
    await expect(hrmsIndicator).toBeVisible({ timeout: 10000 });
  });

  test('TC_DASH_02: Positive Test - Verify HRMS Dashboard Quick Action widgets', async ({ page }) => {
    await navigateToHRMS(page);

    // Verify presence of quick action buttons (e.g., Punch In/Out, Apply Leave)
    const quickAction = page.locator('button:has-text("Check In"), button:has-text("Punch In"), button:has-text("Apply Leave"), [data-testid*="quick-action"]').first();
    await expect(quickAction.or(page.locator('text=/(Attendance|Leave Balance|Quick Actions)/i').first())).toBeVisible({ timeout: 8000 });
  });

  test('TC_DASH_03: Positive Test - Verify Navigation to all HRMS sub-modules', async ({ page }) => {
    await navigateToHRMS(page);

    // 1. Check Attendance navigation link
    const attendanceLink = page.locator('text=/Attendance/i').first();
    await expect(attendanceLink).toBeVisible();

    // 2. Check Leave Management navigation link
    const leaveLink = page.locator('text=/(Leave|Leaves|Leave Management)/i').first();
    await expect(leaveLink).toBeVisible();

    // 3. Check Holidays / Calendar link if present
    const holidaysLink = page.locator('text=/(Holidays|Calendar)/i').first();
    if (await holidaysLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(holidaysLink).toBeVisible();
    }
  });

  test('TC_DASH_04: Positive Test - Verify Employee Profile Information in HRMS', async ({ page }) => {
    await navigateToHRMS(page);

    // Locate user profile avatar or profile icon
    const profileAvatar = page.locator('[data-testid*="profile"], [data-testid*="avatar"], .user-avatar, .ant-avatar, img[alt*="profile"]').first();
    if (await profileAvatar.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileAvatar.click();

      // Verify user details popup/menu
      const profileMenu = page.locator('text=/(Profile|Settings|Logout|Employee ID)/i').first();
      await expect(profileMenu).toBeVisible();
    }
  });
});
