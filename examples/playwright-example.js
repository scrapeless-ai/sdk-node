/**
 * Example: Using Scrapeless SDK's Playwright Integration
 *
 * This example demonstrates how to use the Playwright class for browser automation
 * including page navigation and extended page methods
 */
import { Playwright, log as Log, sleep } from '@scrapeless-ai/sdk';
const logger = Log.withPrefix('playwright-example');

async function runExample() {
  let browser;

  try {
    logger.debug('Starting browser...');
    // Launch browser instance
    browser = await Playwright.connect({
      session_name: 'sdk-playwright-example',
      session_ttl: 180,
      proxy_country: 'US',
      // proxy_url: '',
      session_recording: true,
      viewport: null
    });

    logger.debug('Creating new page...');
    // Create a new page
    const page = await browser.newPage();

    // Navigate to target website
    logger.debug('Navigating to target website...');
    await page.goto('https://prenotami.esteri.it/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    const { error, liveURL } = await page.liveURL();
    if (error) {
      logger.error('Failed to get current page URL:', error);
    } else {
      logger.info('Current page URL:', liveURL);
    }

    const email = 'xxx.mel@yqdfw.org';
    const password = 'xxx*';

    await page.waitForSelector('#login-email');
    await page.waitForSelector('#login-password');

    await sleep(10_000);

    await page.realFill('#login-email', email);
    await page.realFill('#login-password', password);

    // Use realClick for more realistic interaction
    await page.realClick('button[type="submit"]');

    // Wait to observe the result
    await sleep(10_000);

    // Demonstrate waitForReady (Playwright-specific method)
    logger.debug('Demonstrating waitForReady method...');
    try {
      await page.waitForReady('a.button', 5000);
      logger.info('Button is ready for interaction');
    } catch {
      logger.warn('Could not find button or timed out waiting for it');
    }
  } catch (error) {
    console.error('Error running example:', error);
  } finally {
    if (browser) {
      logger.debug('Closing browser...');
      await browser.close();
    }
  }
}

// Run the example
runExample().catch(console.error);
