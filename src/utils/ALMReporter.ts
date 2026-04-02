import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

/**
 * ALMReporter — Playwright Custom Reporter for Micro Focus ALM (Application Lifecycle Management).
 *
 * PURPOSE:
 *   Automatically logs test defects and execution results to the CIBC ALM instance
 *   at the end of each Playwright test run.
 *
 * AUTHENTICATION MODEL — DUAL COOKIE:
 *   ALM uses a two-cookie authentication scheme:
 *   1. `LWSSO_COOKIE_KEY` — obtained from the ALM REST `/authentication-point/authenticate`
 *      endpoint by posting Base64-encoded credentials.
 *   2. `QCSession`         — obtained by calling `/rest/site-session` with the LWSSO cookie.
 *   Both cookies must be included in every subsequent ALM API request.
 *
 *   TODO: Implement `authenticateToALM()` helper below using Node.js `fetch` (or `axios`).
 *         Store credentials in environment variables — never hardcode them:
 *           ALM_URL      → base URL, e.g. https://alm.cibc.internal/qcbin
 *           ALM_DOMAIN   → e.g. CIBC
 *           ALM_PROJECT  → e.g. GEMS-Automation
 *           ALM_USER     → service account username
 *           ALM_PASSWORD → service account password (inject via CI secret)
 *
 * DEFECT LOGGING MODEL — HTTP POST:
 *   After authentication, post a new defect via:
 *     POST {ALM_URL}/rest/domains/{ALM_DOMAIN}/projects/{ALM_PROJECT}/defects
 *   Content-Type: application/json
 *   Body fields to populate per CIBC ALM schema:
 *     - name          → test case title
 *     - description   → error message + stack trace (truncate to 4000 chars)
 *     - status        → "New"
 *     - severity      → map from Playwright status: failed→"2-Medium", timedOut→"1-High"
 *     - detected-by   → ALM_USER
 *     - environment   → process.env.ENV (sit1 | uat)
 *
 *   TODO: Implement `logDefectToALM(testTitle, errorMessage, severity)` helper below.
 */

class ALMReporter implements Reporter {
  private config!: FullConfig;

  /**
   * Called once before the test run starts.
   * Use this hook to authenticate to ALM and cache session cookies.
   *
   * @param config - The resolved Playwright configuration.
   * @param _suite - The root test suite (not used here).
   */
  onBegin(config: FullConfig, _suite: Suite): void {
    this.config = config;
    console.log(`[ALMReporter] Test run started. Target environment: ${process.env.ENV ?? 'sit1'}`);
    // TODO: Call authenticateToALM() here and store the returned cookies in an instance variable.
    //       Example:
    //         this.almCookies = await authenticateToALM();
  }

  /**
   * Called after each individual test finishes.
   * Failed and timed-out tests will be logged as defects in ALM.
   *
   * @param test   - The Playwright TestCase object (contains title, location, etc.).
   * @param result - The TestResult object (contains status, errors, duration).
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed' || result.status === 'skipped') return;

    const errorMessage = result.errors.map((e) => e.message ?? '').join('\n');
    const severity = result.status === 'timedOut' ? '1-High' : '2-Medium';

    console.log(
      `[ALMReporter] FAIL detected — "${test.title}" (${result.status}). ` +
      `Severity: ${severity}. Queuing ALM defect...`,
    );

    // TODO: Call logDefectToALM(test.title, errorMessage, severity) here.
    //       This should be an async call; buffer results and flush in onEnd() if needed.
  }

  /**
   * Called once after all tests complete.
   * Use this to flush any buffered defect payloads and log a run summary.
   *
   * @param result - Contains the overall status: 'passed' | 'failed' | 'interrupted' | 'timedout'.
   */
  onEnd(result: FullResult): void {
    console.log(`[ALMReporter] Test run complete. Overall status: ${result.status}`);
    // TODO: Flush any pending ALM HTTP POSTs and log the defect IDs returned by ALM.
    //       Example output:
    //         [ALMReporter] Logged 3 defect(s) to ALM: DEF-1001, DEF-1002, DEF-1003
  }
}

export default ALMReporter;
