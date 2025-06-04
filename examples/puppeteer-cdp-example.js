/**
 * Example: Puppeteer CDP Session with Extended Methods
 * Filename: puppeteer-cdp-example.js
 *
 * Environment variables required:
 * - SCRAPELESS_API_KEY: Your Scrapeless API key
 *
 * This example demonstrates how to use the extended CDP session methods
 * for browser automation with Scrapeless API.
 */

import { Puppeteer, createScrapelessCDPSession } from '../dist/index.js';

async function runExample() {
  let browser;
  let page;
  let cdpSession;

  try {
    console.log('Creating Puppeteer browser instance...');
    browser = await Puppeteer.connect({
      session_name: 'cdp-example-session',
      session_ttl: 300,
      proxy_country: 'US'
    });

    console.log('Creating new page...');
    page = await browser.newPage();

    console.log('Creating Scrapeless-enhanced CDP session...');
    cdpSession = await createScrapelessCDPSession(page);

    console.log('Navigating to login page...');
    await page.goto('https://example.com/login');

    console.log('Getting current page URL using CDP...');
    const urlResponse = await cdpSession.liveURL();
    if (urlResponse.error) {
      console.error('Error getting URL:', urlResponse.error);
    } else {
      console.log('Current URL:', urlResponse.liveURL);
    }

    console.log('Setting up captcha auto-solve...');
    await cdpSession.setAutoSolve({
      autoSolve: true,
      options: [
        { type: 'recaptcha', disabled: false },
        { type: 'hcaptcha', disabled: false }
      ]
    });

    console.log('Filling login form using CDP methods...');
    await cdpSession.realFill('#login-email', 'user@example.com');
    await cdpSession.realFill('#login-password', 'password123');

    console.log('Clicking submit button...');
    await cdpSession.realClick('button[type="submit"]');

    console.log('Waiting for potential captcha detection...');
    const captchaResult = await cdpSession.waitCaptchaDetected({ timeout: 10000 });

    if (captchaResult.success) {
      console.log('Captcha detected:', captchaResult.type);
      console.log('Solving captcha...');
      const solveResult = await cdpSession.solveCaptcha({ timeout: 30000 });

      if (solveResult.success) {
        console.log('Captcha solved successfully!');
      } else {
        console.log('Failed to solve captcha:', solveResult.message);
      }
    } else {
      console.log('No captcha detected or timeout reached');
    }

    console.log('Getting final URL...');
    const finalUrlResponse = await cdpSession.liveURL();
    if (!finalUrlResponse.error) {
      console.log('Final URL:', finalUrlResponse.liveURL);
    }

    console.log('Example completed successfully!');
  } catch (error) {
    console.error('Error during example execution:', error.message);
  } finally {
    try {
      if (cdpSession) {
        console.log('Closing CDP session...');
        await cdpSession.detach();
      }
      if (browser) {
        console.log('Closing browser...');
        await browser.close();
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
  }
}

// Run the example
runExample().catch(console.error);
