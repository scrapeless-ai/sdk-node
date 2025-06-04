/**
 * Example: Using Scrapeless SDK's Puppeteer Integration
 *
 * This example demonstrates how to use the Puppeteer class for browser automation
 * including page navigation and extended CDP session methods
 */
import { Puppeteer, createScrapelessCDPSession, log as Log, sleep } from '../dist/index.js';

const logger = Log.withPrefix('puppeteer-example');

async function runExample() {
  logger.debug('Starting browser...');
  // Launch browser instance
  const browser = await Puppeteer.connect({
    session_name: 'sdk-puppeteer-example',
    session_ttl: 180,
    proxy_country: 'US',
    session_recording: true,
    defaultViewport: null
  });
  try {
    logger.debug('Creating new page...');
    // Create a new page
    const page = await browser.newPage();

    logger.debug('Creating CDP session with extended methods...');

    // Navigate to target website
    logger.debug('Navigating to target website...');

    // if cookies.json exists, read it and set cookies
    // if (fs.existsSync('./cookies.json')) {
    //   const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf8'));
    //   // filter out invalid cookies
    //   const validCookies = cookies.filter(cookie => cookie.domain && cookie.name && cookie.value);
    //   await browser.setCookie(...validCookies);
    // } else {
    //   await page.goto('https://www.google.com/', { waitUntil: 'networkidle0' });
    //   const cookies = await browser.cookies();
    //   fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
    // }
    await page.goto('https://www.google.com/', { waitUntil: 'networkidle0' });
    const cdpSession = await createScrapelessCDPSession(page);
    await cdpSession.disableCaptchaAutoSolve();

    await page.goto('https://prenotami.esteri.it/');

    // await page.goto('https://patrickhlauke.github.io/recaptcha/', { waitUntil: 'domcontentloaded' });

    const email = '19374294169.mel@yqdfw.org';
    const password = 'niuniuZHOU1986*';

    await sleep(10_000);
    logger.debug('Filling form using CDP methods...');
    await cdpSession.realFill('#login-email', email);
    await cdpSession.realFill('#login-password', password);

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
