import { FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright global setup — runs once before any test worker starts.
 * Use this file for one-time setup tasks: auth state generation,
 * database seeding, feature flag overrides, etc.
 *
 * @param _config - The resolved Playwright configuration (available if needed).
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('========================================================');
  console.log('  Starting Execution: CIBC TestForge AI (GEMS)          ');
  console.log(`  Environment : ${process.env.ENV ?? 'sit1'}             `);
  console.log(`  Mock API    : ${process.env.MOCK_API ?? 'false'}       `);
  console.log('========================================================');
}

export default globalSetup;
