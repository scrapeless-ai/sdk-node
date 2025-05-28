/**
 * Simple Actor Script Example
 * This example demonstrates how to create a basic web scraping script using Actor
 */
import puppeteer from 'puppeteer-core';
import { Actor, log as Log } from '@scrapeless-ai/sdk';

const log = Log.withPrefix('actor-simple-example');

// Mock environment variables
process.env.SCRAPELESS_INPUT = JSON.stringify({
  url: 'https://www.scrapeless.com',
  selectors: {
    title: 'h1',
    description: 'p',
    links: 'a'
  }
});

/**
 * Main function: Run the Actor script
 */
async function main() {
  // Initialize Actor
  const actor = new Actor();
  log.debug('Actor initialized');
  let browser;
  try {
    // Get input parameters
    const input = actor.input();
    log.debug(`Ready input: {0}`, input);

    // Use browser service for web scraping
    // Note: In a real environment, the commented code below should be used
    // Create a browser session
    const { browserWSEndpoint } = actor.browser.create({
      session_ttl: 180,
      proxy_url: 'gw-us.scrapeless.io:8789:29812093F9FC-proxy-country_US-r_10m-s_Xsge8XYsRs:2MxGBhJD'
    });
    log.debug('Browser session created: {0}', browserWSEndpoint);

    browser = await puppeteer.connect({
      browserWSEndpoint: browserWSEndpoint,
      defaultViewport: null
    });
    const page = await browser.newPage();
    // Navigate to the target page
    await page.goto(input.url, { waitUntil: 'networkidle2' });
    log.debug('Navigated to target page: {0}', input.url);
    const pageData = await page.evaluate(selectors => {
      const result = {};
      // Extract title
      if (selectors.title) {
        const titleEl = document.querySelector(selectors.title);
        result.title = titleEl ? titleEl.innerText.trim() : null;
      }

      // Extract description
      if (selectors.description) {
        const descEl = document.querySelector(selectors.description);
        result.description = descEl ? descEl.innerText.trim() : null;
      }

      // Extract links
      if (selectors.links) {
        result.links = Array.from(document.querySelectorAll(selectors.links))
          .map(a => ({
            text: a.innerText.trim(),
            url: a.href
          }))
          .filter(link => link.text && link.url);
      }
      return result;
    }, input.selectors);
    log.info('Extracted data: {0}', pageData);

    await page.screenshot({ path: 'actor-simple-example.png', fullPage: true });
    log.debug('Screenshot saved to actor-simple-example.png');
    // Save extracted data to dataset
    await actor.addItems([
      {
        url: input.url,
        ...pageData,
        extracted_at: new Date().toISOString()
      }
    ]);
    log.debug('Data saved to dataset');
  } catch (error) {
    console.error('Error during script execution:', error);
    log.error('Actor script execution error:', error);
  } finally {
    log.debug('Actor script execution completed');
    if (browser) {
      await browser.close();
    }
  }
}

// Execute main function
main().catch(console.error);
