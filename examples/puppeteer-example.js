/**
 * Example: Using Scrapeless SDK's Puppeteer Integration
 *
 * This example demonstrates how to use the Puppeteer class for browser automation
 * including page navigation and extended page methods
 */
import { Puppeteer, log as Log, sleep } from '@scrapeless-ai/sdk';
const logger = Log.withPrefix('puppeteer-example');

async function runExample() {
  let browser;

  try {
    logger.debug('Starting browser...');
    // Launch browser instance
    browser = await Puppeteer.connect({
      session_name: 'sdk-puppeteer-example',
      session_ttl: 180,
      proxy_country: 'US',
      proxy_url: 'gw-us.scrapeless.io:8789:29812093F9FC-proxy-country_ANY-r_10m-s_Xsge8XYsRs:2MxGBhJD',
      session_recording: true,
      defaultViewport: null
    });

    logger.debug('Creating new page...');
    // Create a new page
    const page = await browser.newPage();
    // Navigate to target website
    logger.debug('Navigating to target website...');
    await page.goto('https://prenotami.esteri.it/', {
      waitUntil: 'networkidle0'
    });
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

    await page.realClick('button[type="submit"]');
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
