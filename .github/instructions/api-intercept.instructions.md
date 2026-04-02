---
applyTo: "**/*.mock.ts"
---

# API Interception Rules for Unstable Banking APIs

These rules apply to all files matching `**/*.mock.ts` within the CIBC TestForge AI framework.
GEMS integrates with several downstream banking services that may be unreliable in SIT/UAT environments.
Use Playwright's network interception layer to isolate test execution from these dependencies.

## When to Mock
- Any downstream service that is not owned by the GEMS team.
- Services with documented instability or rate limits in lower environments.
- APIs required only for test setup/teardown that are not the system under test.

## Pattern: Route-Based Interception

```typescript
// ✅ Standard interception pattern
import { Page } from '@playwright/test';

/**
 * Intercepts the core-banking balance API and returns a controlled fixture.
 * Use this when testing wire-transfer flows without a live core-banking connection.
 *
 * @param page - The Playwright Page instance (from fixture or step context)
 */
export async function mockCoreBankingBalance(page: Page): Promise<void> {
  await page.route('**/api/v1/core-banking/balance', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ balance: 50000.00, currency: 'CAD' }),
    });
  });
}
```

## Rules
1. **Mock files are pure functions** — no class instances, no state.
2. All mock payloads that exceed 3 fields must live in `data/sit1/` or `data/uat/` as JSON files.
   Import them: `import payload from '../../data/sit1/balance-response.json'`.
3. Always use glob patterns (`**`) in route matchers to handle environment URL differences.
4. Mock only the routes necessary for the test — do not blanket-intercept all traffic.
5. Tear down interceptions via `page.unroute()` in `afterEach` if a mock must not bleed into other tests.
6. Document every mock function with JSDoc: what it intercepts, why, and what fixture it returns.
