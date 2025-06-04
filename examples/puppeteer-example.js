/**
 * Example: Using Scrapeless SDK's Puppeteer Integration
 *
 * This example demonstrates how to use the Puppeteer class for browser automation
 * including page navigation and extended page methods
 */
import { Puppeteer, log as Log, sleep } from '../dist/index.js';

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
      proxy_url: 'http://9277031AE836-proxy-country_ANY-r_10m-s_zLyezOnqcF:F2DxIbVE@gw-us.scrapeless.io:8789',
      session_recording: true,
      defaultViewport: null
    });

    logger.debug('Creating new page...');
    // Create a new page
    const page = await browser.newPage();
    // Navigate to target website
    logger.debug('Navigating to target website...');
    await page.goto('https://www.google.com/', { waitUntil: 'domcontentloaded' });
    await page.disableCaptchaAutoSolve();
    await page.goto('https://prenotami.esteri.it/');
    const userAgent = await page.evaluate(() => navigator.userAgent);
    logger.debug('User Agent:', userAgent);
    // await page.goto('https://patrickhlauke.github.io/recaptcha/', { waitUntil: 'domcontentloaded' });

    // await browser.refreshCDPSession()

    // const detected = await page.waitCaptchaDetected();
    // if (detected.success) {
    //   logger.info('Captcha detected:', detected.message);
    // } else {
    //   logger.error('Failed to detect captcha:', detected.message);
    //   return;
    // }

    const email = '19374294169.mel@yqdfw.org';
    const password = 'niuniuZHOU1986*';

    await page.waitForSelector('#login-email');
    await page.waitForSelector('#login-password');

    await sleep(10_000);

    await page.realFill('#login-email', email);
    await page.realFill('#login-password', password);

    await sleep(5_000);
    logger.debug('Solving captcha...');
    const captcha = await page.solveCaptcha({
      timeout: 30_000,
      options: [
        {
          type: 'recaptcha',
          disabled: false
        }
      ]
    });
    if (captcha.success) {
      logger.info('Captcha detected:', captcha);
    } else {
      logger.error('Failed to detect captcha:', captcha.message);
      return;
    }
    // await page.realClick('button[type="submit"]');
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
