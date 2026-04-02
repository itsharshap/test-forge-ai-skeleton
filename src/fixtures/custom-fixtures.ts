import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Authenticated browser contexts for the Maker/Checker dual-role workflow.
 * Both contexts are isolated so session cookies never bleed between roles.
 */
export type GEMSFixtures = {
  /** Browser context pre-authenticated as the Maker (initiator) role. */
  makerContext: BrowserContext;
  /** Browser page belonging to the Maker context. */
  makerPage: Page;
  /** Browser context pre-authenticated as the Checker (approver) role. */
  checkerContext: BrowserContext;
  /** Browser page belonging to the Checker context. */
  checkerPage: Page;
};

/**
 * Performs a storage-state login for a given GEMS role.
 * Replace this stub with your actual authentication flow (e.g., API token exchange,
 * SAML SSO callback, or cookie injection from a pre-saved storageState file).
 *
 * @param browser - The shared Playwright Browser instance.
 * @param role    - GEMS role identifier ('maker' | 'checker').
 * @returns An isolated BrowserContext authenticated for the given role.
 */
async function createAuthenticatedContext(
  browser: Browser,
  role: 'maker' | 'checker',
): Promise<BrowserContext> {
  const storageStatePath = process.env[`STORAGE_STATE_${role.toUpperCase()}`];

  if (storageStatePath) {
    // Fast path: reuse a pre-saved authentication state (recommended for CI).
    return browser.newContext({ storageState: storageStatePath });
  }

  // Slow path: perform a fresh login for this role.
  const context = await browser.newContext();
  const page = await context.newPage();

  // TODO: Replace with actual GEMS login flow.
  // Example:
  //   await page.goto('/login');
  //   await page.getByTestId('username-input').fill(process.env[`GEMS_${role.toUpperCase()}_USER`]!);
  //   await page.getByTestId('password-input').fill(process.env[`GEMS_${role.toUpperCase()}_PASS`]!);
  //   await page.getByTestId('login-submit').click();
  //   await page.waitForURL('**/dashboard');

  await page.close();
  return context;
}

export const test = base.extend<GEMSFixtures>({
  makerContext: async ({ browser }, use) => {
    const ctx = await createAuthenticatedContext(browser, 'maker');
    await use(ctx);
    await ctx.close();
  },

  makerPage: async ({ makerContext }, use) => {
    const page = await makerContext.newPage();
    await use(page);
    await page.close();
  },

  checkerContext: async ({ browser }, use) => {
    const ctx = await createAuthenticatedContext(browser, 'checker');
    await use(ctx);
    await ctx.close();
  },

  checkerPage: async ({ checkerContext }, use) => {
    const page = await checkerContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
