/**
 * Example: Using Scrapeless SDK's Playwright Integration
 *
 * This example demonstrates how to use the Playwright class for browser automation
 * including page navigation and extended page methods
 */
import { Playwright, createPlaywrightCDPSession, log as Log, sleep } from '@scrapeless-ai/sdk';
const logger = Log.withPrefix('playwright-example');

async function runExample() {
  logger.debug('Starting browser...');
  // Launch browser instance

  const browser = await Playwright.connect({
    sessionName: 'sdk-playwright-example',
    sessionTTL: 180,
    proxyCountry: 'US',
    // proxyURL: '',
    sessionRecording: true,
    viewport: null
  });
  try {
    const context = browser.contexts()[0];
    logger.debug('Creating new page...');
    // Create a new page
    const page = await context.newPage();

    const cdpSession = await createPlaywrightCDPSession(context, page);
    await cdpSession.disableCaptchaAutoSolve();

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

    await cdpSession.realFill('#login-email', email);
    await cdpSession.realFill('#login-password', password);

    // Wait to observe the result
    await sleep(5_000);

    logger.debug('Solving captcha...');
    const captcha = await cdpSession.solveCaptcha();
    if (captcha.success) {
      logger.info('Captcha detected:', captcha);
    } else {
      logger.error('Failed to detect captcha:', captcha.message);
      return;
    }
    // await cdpSession.realClick('button[type="submit"]');
    await sleep(10_000);
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
