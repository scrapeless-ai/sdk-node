/**
 * Example: Demonstrating how to use the Scrapeless SDK browser module
 * Filename: browser-example.js
 *
 * Environment variables required:
 * - SCRAPELESS_API_KEY: Your Scrapeless API key
 *
 * Optional environment variables:
 * - SCRAPELESS_API_HOST: API host (defaults to https://api.scrapeless.com)
 * - SCRAPELESS_SCRAPING_BROWSER_HOST: Browser service host (defaults to https://browser.scrapeless.com)
 */
import { ScrapelessClient } from '@scrapeless-ai/sdk';
import puppeteer from 'puppeteer-core';

/**
 * Demonstrates how to create a browser session and navigate to a website
 */
async function runExample() {
  try {
    // Initialize the client with API key from environment
    const client = new ScrapelessClient({
      apiKey: process.env.SCRAPELESS_API_KEY
    });

    console.log('Creating browser session...');

    // Create browser session and get WebSocket endpoint
    const { browserWSEndpoint } = await client.browser.createSession({
      session_name: 'sdk_test',
      session_ttl: 180,
      proxy_country: 'US',
      session_recording: true
    });

    console.log('Browser WebSocket endpoint created:', browserWSEndpoint);

    // Connect to browser using puppeteer
    const browser = await puppeteer.connect({
      browserWSEndpoint: browserWSEndpoint
    });

    // Open new page and navigate to website
    const page = await browser.newPage();
    await page.goto('https://www.scrapeless.com');
    console.log('Page title:', await page.title());

    // Take screenshot
    await page.screenshot({ path: './browser-example.png', fullPage: true });

    // Close browser
    await browser.close();

    console.log('Example completed successfully');
  } catch (error) {
    console.error('Example error:', error);
  }
}

// Run the example
runExample().catch(console.error);
