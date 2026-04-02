import { Given, When, Then } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../src/fixtures/custom-fixtures';

/**
 * Wire Transfer step definitions — Maker/Checker workflow.
 *
 * Architectural notes:
 * - All locators use `getByTestId()` where DOM supports `data-testid` attributes.
 * - Assertions live exclusively here, never inside Page Object files.
 * - JSON payloads (e.g., bulk transfer data) must be imported from `data/` — not inlined.
 *
 * @see tests/features/wire-transfer.feature
 * @see src/fixtures/custom-fixtures.ts  — for makerPage / checkerPage contexts
 */

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given('the Maker is logged into GEMS', async ({ makerPage }) => {
  // Authentication is handled by the custom fixture (createAuthenticatedContext).
  // This step validates the session is active on the dashboard.
  await makerPage.goto('/dashboard');
  await expect(makerPage.getByTestId('user-role-badge')).toContainText('Maker');
});

Given('the Checker is logged into GEMS in a separate session', async ({ checkerPage }) => {
  await checkerPage.goto('/dashboard');
  await expect(checkerPage.getByTestId('user-role-badge')).toContainText('Checker');
});

// ---------------------------------------------------------------------------
// Maker — Initiating a wire transfer
// ---------------------------------------------------------------------------

When('the Maker navigates to the Wire Transfer page', async ({ makerPage }) => {
  await makerPage.getByTestId('nav-wire-transfer').click();
  await makerPage.waitForURL('**/wire-transfer/new');
});

When(
  'the Maker fills in the recipient account number {string}',
  async ({ makerPage }, accountNumber: string) => {
    await makerPage.getByTestId('recipient-account-input').fill(accountNumber);
  },
);

When(
  'the Maker fills in the transfer amount {string} CAD',
  async ({ makerPage }, amount: string) => {
    await makerPage.getByTestId('transfer-amount-input').fill(amount);
    await makerPage.getByTestId('currency-select').selectOption('CAD');
  },
);

When(
  'the Maker adds the memo {string}',
  async ({ makerPage }, memo: string) => {
    await makerPage.getByTestId('transfer-memo-input').fill(memo);
  },
);

When('the Maker submits the wire transfer for approval', async ({ makerPage }) => {
  await makerPage.getByTestId('submit-for-approval-btn').click();
  // Wait for the confirmation modal to confirm submission succeeded.
  await expect(makerPage.getByTestId('submission-success-modal')).toBeVisible();
  await makerPage.getByTestId('modal-close-btn').click();
});

// ---------------------------------------------------------------------------
// Status assertions
// ---------------------------------------------------------------------------

Then(
  'the wire transfer status should be {string}',
  async ({ makerPage }, expectedStatus: string) => {
    await expect(makerPage.getByTestId('transfer-status-badge')).toHaveText(expectedStatus);
  },
);

// ---------------------------------------------------------------------------
// Checker — Approvals queue
// ---------------------------------------------------------------------------

When('the Checker navigates to the Pending Approvals queue', async ({ checkerPage }) => {
  await checkerPage.getByTestId('nav-pending-approvals').click();
  await checkerPage.waitForURL('**/approvals/pending');
});

When(
  'the Checker opens the wire transfer for {string}',
  async ({ checkerPage }, accountNumber: string) => {
    await checkerPage
      .getByTestId(`approval-row-${accountNumber}`)
      .getByTestId('view-details-btn')
      .click();
    await checkerPage.waitForURL('**/approvals/**');
  },
);

When('the Checker approves the wire transfer', async ({ checkerPage }) => {
  await checkerPage.getByTestId('approve-transfer-btn').click();
  await checkerPage.getByTestId('confirm-approval-btn').click();
});

When(
  'the Checker rejects the wire transfer with reason {string}',
  async ({ checkerPage }, reason: string) => {
    await checkerPage.getByTestId('reject-transfer-btn').click();
    await checkerPage.getByTestId('rejection-reason-input').fill(reason);
    await checkerPage.getByTestId('confirm-rejection-btn').click();
  },
);

// ---------------------------------------------------------------------------
// Notification assertions
// ---------------------------------------------------------------------------

Then('the Maker should see a confirmation notification', async ({ makerPage }) => {
  // Polling for notification is intentional — asynchronous approval pipeline.
  await makerPage.reload();
  await expect(makerPage.getByTestId('notification-banner')).toContainText('approved');
});

Then(
  'the Maker should see a rejection notification with the reason {string}',
  async ({ makerPage }, reason: string) => {
    await makerPage.reload();
    await expect(makerPage.getByTestId('notification-banner')).toContainText('rejected');
    await expect(makerPage.getByTestId('rejection-reason-text')).toHaveText(reason);
  },
);

// ---------------------------------------------------------------------------
// Negative — Self-approval prevention
// ---------------------------------------------------------------------------

Then(
  'the Maker should not see an Approve button for this transfer',
  async ({ makerPage }) => {
    await makerPage.getByTestId('nav-pending-approvals').click();
    await expect(makerPage.getByTestId('approve-transfer-btn')).not.toBeVisible();
  },
);
