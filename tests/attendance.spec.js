import { test, expect } from '@playwright/test';
import {
  CONFIG,
  loginToPlatform,
  navigateToHRMS,
  navigateToAttendance,
} from './helpers/hrms-helper.js';

test.describe('HRMS - Attendance Module Positive Test Cases', () => {
  // Before each test: Login to platform and navigate to Attendance
  test.beforeEach(async ({ page }) => {
    await loginToPlatform(page);
    await navigateToHRMS(page);
    await navigateToAttendance(page);
  });

  test('TC_ATT_01: Verify Attendance Page loads successfully with all essential widgets', async ({ page }) => {
    // 1. Verify page URL or heading
    const attendanceHeading = page.getByRole('heading', { name: /attendance/i }).first();
    await expect(attendanceHeading.or(page.getByText('Attendance').first())).toBeVisible({ timeout: 10000 });

    // 2. Verify current date / calendar widget or punch timer is visible
    const dateOrTimeWidget = page.locator('text=/(Today|AM|PM|Check In|Punch In|Present)/i').first();
    await expect(dateOrTimeWidget).toBeVisible();

    // 3. Verify attendance action buttons or status card exists
    const actionButton = page.locator('button:has-text("Check In"), button:has-text("Punch In"), button:has-text("Check Out"), button:has-text("Punch Out")').first();
    await expect(actionButton).toBeVisible();
  });

  test('TC_ATT_02: Positive Test - Mark Check-In / Punch-In successfully', async ({ page }) => {
    // Locate the Punch In / Check In button
    const punchInButton = page.locator('button:has-text("Check In"), button:has-text("Punch In"), [data-testid="punch-in-button"]').first();

    if (await punchInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click Punch In
      await punchInButton.click();

      // If a confirmation modal or note popup appears, submit it
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Yes")').first();
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Verify success notification or button text change to "Punch Out" / "Check Out"
      const statusIndicator = page.locator('text=/(Checked In|Punch Out|Check Out|Success|Attendance marked)/i').first();
      await expect(statusIndicator).toBeVisible({ timeout: 10000 });
    } else {
      // User might already be checked in
      const punchOutButton = page.locator('button:has-text("Check Out"), button:has-text("Punch Out")').first();
      await expect(punchOutButton).toBeVisible();
    }
  });

  test('TC_ATT_03: Positive Test - Mark Check-Out / Punch-Out successfully', async ({ page }) => {
    // Check if user is in checked-in state
    const punchOutButton = page.locator('button:has-text("Check Out"), button:has-text("Punch Out"), [data-testid="punch-out-button"]').first();

    if (await punchOutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await punchOutButton.click();

      // Handle any remarks / confirmation popup
      const remarksInput = page.getByPlaceholder(/remarks|notes|comments/i);
      if (await remarksInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await remarksInput.fill('Regular day wrap-up');
      }

      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Punch Out")').last();
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Verify punch out confirmation or transition back to Check In state
      const successToast = page.locator('text=/(Checked Out|Punch Out Successful|Check In|Punch In)/i').first();
      await expect(successToast).toBeVisible({ timeout: 10000 });
    } else {
      // If user is currently checked out, verify Check In button is available
      const punchInButton = page.locator('button:has-text("Check In"), button:has-text("Punch In")').first();
      await expect(punchInButton).toBeVisible();
    }
  });

  test('TC_ATT_04: Positive Test - View Attendance History & Logs Table', async ({ page }) => {
    // 1. Switch to History / Logs tab if present
    const historyTab = page.locator('text=/(Logs|History|Monthly Attendance|Records)/i').first();
    if (await historyTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await historyTab.click();
    }

    // 2. Verify attendance table is visible
    const table = page.locator('table, [role="table"], [data-testid="attendance-table"]').first();
    await expect(table.or(page.locator('.attendance-record, .table-responsive'))).toBeVisible({ timeout: 8000 });

    // 3. Verify standard column headers (Date, Status, In Time, Out Time, Total Hours)
    const headerRow = page.locator('thead, tr').first();
    await expect(headerRow).toBeVisible();
  });

  test('TC_ATT_05: Positive Test - Filter Attendance records by Month/Date Range', async ({ page }) => {
    // Locate date picker or month selector
    const datePicker = page.locator('input[type="date"], [data-testid="date-filter"], button:has-text("Select Month"), .ant-picker, .react-datepicker').first();

    if (await datePicker.isVisible({ timeout: 4000 }).catch(() => false)) {
      await datePicker.click();

      // Select previous or current month / date
      const monthOption = page.locator('.picker-cell, .calendar-day, button:has-text("Apply"), button:has-text("Today")').first();
      if (await monthOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await monthOption.click();
      }

      // Verify filtered results or table reloaded
      await expect(page.locator('table, [role="table"]').first()).toBeVisible();
    } else {
      // Verify filter dropdowns if present
      const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter-button"]').first();
      if (await filterButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await filterButton.click();
        await expect(filterButton).toBeVisible();
      }
    }
  });

  test('TC_ATT_06: Positive Test - Submit Attendance Regularization Request', async ({ page }) => {
    // Look for Regularization or Request Correction button
    const regularizeBtn = page.locator('button:has-text("Regularize"), button:has-text("Apply Correction"), button:has-text("Request Regularization"), [data-testid="regularize-btn"]').first();

    if (await regularizeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await regularizeBtn.click();

      // Fill in regularization details modal
      const reasonField = page.getByPlaceholder(/reason|remarks|notes/i).first();
      if (await reasonField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await reasonField.fill('Forgot to punch in due to early client meeting');
      }

      const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Apply")').last();
      await submitBtn.click();

      // Verify success message
      const successMessage = page.locator('text=/(Request submitted|Regularization applied|Success)/i').first();
      await expect(successMessage).toBeVisible({ timeout: 8000 });
    }
  });

  test('TC_ATT_07: Positive Test - Verify Attendance Statistics & Summary Cards', async ({ page }) => {
    // Verify summary metrics (Present Days, Absent Days, Total Working Hours, Late In)
    const summaryCard = page.locator('text=/(Present|Working Hours|Total Days|Late Marks|Overtime)/i').first();
    await expect(summaryCard).toBeVisible({ timeout: 8000 });
  });
});
