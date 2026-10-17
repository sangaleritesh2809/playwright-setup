import { test, expect } from '@playwright/test';
import {
  CONFIG,
  loginToPlatform,
  navigateToHRMS,
  navigateToLeaveManagement,
} from './helpers/hrms-helper.js';

test.describe('HRMS - Leave Management Positive Test Cases', () => {
  // Before each test: Login to platform and navigate to Leave Management
  test.beforeEach(async ({ page }) => {
    await loginToPlatform(page);
    await navigateToHRMS(page);
    await navigateToLeaveManagement(page);
  });

  test('TC_LEAVE_01: Verify Leave Management Page and Leave Balances are displayed', async ({ page }) => {
    // 1. Verify Page Heading
    const leaveHeading = page.locator('h1, h2, h3, h4, [role="heading"]').filter({ hasText: /leave/i }).first();
    await expect(leaveHeading.or(page.getByText('Leave Management').first())).toBeVisible({ timeout: 10000 });

    // 2. Verify Leave Quota / Balance Cards (e.g. Casual Leave, Sick Leave, Paid Leave)
    const balanceCard = page.locator('text=/(Casual Leave|Sick Leave|Paid Leave|Leave Balance|Available Leaves)/i').first();
    await expect(balanceCard).toBeVisible({ timeout: 8000 });

    // 3. Verify Apply Leave button exists
    const applyBtn = page.locator('button:has-text("Apply Leave"), button:has-text("Request Leave"), button:has-text("New Leave"), [data-testid="apply-leave-btn"]').first();
    await expect(applyBtn).toBeVisible();
  });

  test('TC_LEAVE_02: Positive Test - Apply for Casual Leave with valid details', async ({ page }) => {
    // 1. Click on "Apply Leave" button
    const applyBtn = page.locator('button:has-text("Apply Leave"), button:has-text("Request Leave"), button:has-text("New Leave"), [data-testid="apply-leave-btn"]').first();
    await applyBtn.click();

    // 2. Select Leave Type (e.g. Casual Leave)
    const leaveTypeDropdown = page.locator('select[name*="type"], [data-testid="leave-type-select"], [role="combobox"]').first();
    if (await leaveTypeDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      if ((await leaveTypeDropdown.getAttribute('role')) === 'combobox') {
        await leaveTypeDropdown.click();
        await page.locator('text=/(Casual Leave|Sick Leave|General)/i').first().click();
      } else {
        await leaveTypeDropdown.selectOption({ index: 1 });
      }
    }

    // 3. Fill in Dates (From Date and To Date)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];

    const fromDateInput = page.locator('input[name*="from"], input[placeholder*="From Date"], input[placeholder*="Start Date"], [data-testid="leave-from-date"]').first();
    if (await fromDateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fromDateInput.fill(dateString);
    }

    const toDateInput = page.locator('input[name*="to"], input[placeholder*="To Date"], input[placeholder*="End Date"], [data-testid="leave-to-date"]').first();
    if (await toDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toDateInput.fill(dateString);
    }

    // 4. Fill in Reason
    const reasonInput = page.locator('textarea, input[name*="reason"], input[placeholder*="reason"], [data-testid="leave-reason"]').first();
    if (await reasonInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reasonInput.fill('Personal family commitment');
    }

    // 5. Submit Leave Request
    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Apply"), button:has-text("Save"), [data-testid="submit-leave-btn"]').last();
    await submitBtn.click();

    // 6. Verify Confirmation message / Notification
    const successToast = page.locator('text=/(Leave applied successfully|Request submitted|Success)/i').first();
    await expect(successToast).toBeVisible({ timeout: 8000 });
  });

  test('TC_LEAVE_03: Positive Test - Apply for Half-Day Leave', async ({ page }) => {
    // 1. Open Apply Leave Modal
    const applyBtn = page.locator('button:has-text("Apply Leave"), button:has-text("Request Leave"), [data-testid="apply-leave-btn"]').first();
    await applyBtn.click();

    // 2. Select Half Day checkbox / toggle if available
    const halfDayOption = page.locator('input[type="checkbox"][name*="half"], label:has-text("Half Day"), button:has-text("Half Day")').first();
    if (await halfDayOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await halfDayOption.click();

      // Select Session 1 (Morning) or Session 2 (Afternoon)
      const sessionOption = page.locator('input[value*="first"], label:has-text("First Half"), label:has-text("Morning")').first();
      if (await sessionOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sessionOption.click();
      }
    }

    // 3. Enter Reason
    const reasonInput = page.locator('textarea, input[placeholder*="reason"]').first();
    if (await reasonInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reasonInput.fill('Doctor consultation in morning session');
    }

    // 4. Submit
    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Apply")').last();
    await submitBtn.click();

    // 5. Verify success
    const confirmation = page.locator('text=/(success|submitted|applied)/i').first();
    await expect(confirmation).toBeVisible({ timeout: 8000 });
  });

  test('TC_LEAVE_04: Positive Test - View Leave Applications History & Status', async ({ page }) => {
    // 1. Click on "Leave History" or "My Applications" tab
    const historyTab = page.locator('text=/(Leave History|My Leaves|My Applications|Past Leaves)/i').first();
    if (await historyTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await historyTab.click();
    }

    // 2. Verify Leave Requests table / list
    const leaveTable = page.locator('table, [role="table"], [data-testid="leave-history-table"], .leave-list').first();
    await expect(leaveTable).toBeVisible({ timeout: 8000 });

    // 3. Verify status badges (Pending, Approved, or Rejected)
    const statusBadge = page.locator('text=/(Pending|Approved|Rejected|Submitted)/i').first();
    await expect(statusBadge).toBeVisible();
  });

  test('TC_LEAVE_05: Positive Test - Filter Leave Applications by Status', async ({ page }) => {
    // 1. Locate status filter dropdown
    const statusFilter = page.locator('select[name*="status"], [data-testid="status-filter"], button:has-text("Filter"), button:has-text("All Status")').first();

    if (await statusFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusFilter.click();

      // Select 'Pending' or 'Approved'
      const pendingOption = page.locator('text=/(Pending|Approved)/i').first();
      if (await pendingOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pendingOption.click();
      }

      // Verify filtered table is displayed
      await expect(page.locator('table, [role="table"]').first()).toBeVisible();
    }
  });

  test('TC_LEAVE_06: Positive Test - Cancel / Withdraw a Pending Leave Request', async ({ page }) => {
    // 1. Navigate to history
    const historyTab = page.locator('text=/(Leave History|My Leaves|My Applications)/i').first();
    if (await historyTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await historyTab.click();
    }

    // 2. Locate Cancel or Withdraw action for a pending leave
    const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Withdraw"), [title="Cancel Leave"]').first();

    if (await cancelBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await cancelBtn.click();

      // Confirm in dialog if prompted
      const confirmDialogBtn = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Withdraw")').last();
      if (await confirmDialogBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmDialogBtn.click();
      }

      // Verify cancellation confirmation
      const toast = page.locator('text=/(Cancelled|Withdrawn|Success)/i').first();
      await expect(toast).toBeVisible({ timeout: 8000 });
    }
  });

  test('TC_LEAVE_07: Positive Test - View Company Holiday Calendar', async ({ page }) => {
    // Navigate to Holidays tab
    const holidayTab = page.locator('text=/(Holidays|Holiday Calendar|Upcoming Holidays)/i').first();

    if (await holidayTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await holidayTab.click();

      // Verify holiday list or calendar view
      const holidayContent = page.locator('text=/(Holiday|Date|Festival|Republic Day|Diwali|Independence)/i').first();
      await expect(holidayContent).toBeVisible({ timeout: 8000 });
    }
  });
});
