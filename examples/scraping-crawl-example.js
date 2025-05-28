/**
 * Scrapeless Node SDK - ScrapingCrawl Service Examples (ES Module Version)
 *
 * This example demonstrates how to use the ScrapingCrawl SDK for scraping, crawling, and extraction tasks.
 * Each example uses the same API key, base URL, and utility for saving results to JSON.
 */
import { ScrapingCrawl } from '../dist/index.js';
import { z } from 'zod';
import fs from 'fs';

/**
 * Utility function to save an object to a JSON file.
 * @param {object} obj - The object to save
 * @param {string} filename - The filename to save to
 */
function saveObjectToJson(obj, filename) {
  const jsonString = JSON.stringify(obj, null, 2);
  fs.writeFile(filename, jsonString, 'utf8', err => {
    err ? console.error(err) : console.log(`File saved successfully: ${filename}`);
  });
}

// Shared ScrapingCrawl instance
const client = new ScrapingCrawl({
  apiKey: 'your_api_key',
  baseUrl: 'http://localhost:3007'
});

/**
 * Example: Scrape a single URL and save the result.
 */
async function exampleScrape() {
  try {
    const scrapeResponse = await client.scrapeUrl('https://scrapeless.com/', {
      formats: ['markdown', 'html', 'links', 'screenshot@fullPage'],
      browserOptions: {
        session_name: 'scrapingCrawl_scrapeUrl'
      }
    });
    if (scrapeResponse) {
      saveObjectToJson(scrapeResponse, 'scrapeless-demo-scrape.json');
      console.log(scrapeResponse);
    }
  } catch (error) {
    console.error('❌ Scrape example failed:', error.message);
  }
}

/**
 * Example: Crawl a URL with specific options and save the result.
 */
async function exampleCrawl() {
  try {
    const crawlResult = await client.crawlUrl('https://baidu.com/', {
      limit: 3,
      maxDepth: 1,
      scrapeOptions: {
        formats: ['markdown', 'links', 'html', 'screenshot@fullPage']
      }
    });
    if (crawlResult) {
      saveObjectToJson(crawlResult, 'scrapeless-demo-crawl.json');
      console.log(crawlResult);
    }
  } catch (error) {
    console.error('❌ Crawl example failed:', error.message);
  }
}

/**
 * Example: Extract structured data from a URL using a Zod schema and save the result.
 */
async function exampleExtract() {
  try {
    // Define schema to extract contents into
    const schema = z.object({
      company_mission: z.string(),
      supports_sso: z.boolean(),
      is_open_source: z.boolean(),
      is_in_yc: z.boolean()
    });

    const scrapeResult = await client.extractUrls(['https://scrapeless.com'], {
      prompt:
        'Extract the company mission, whether it supports SSO, whether it is open source, and whether it is in Y Combinator from the page.',
      schema: schema
    });

    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape: ${scrapeResult.error}`);
    }

    saveObjectToJson(scrapeResult.data, 'scrapeless-demo-extract.json');
    console.log(scrapeResult.data);
  } catch (error) {
    console.error('❌ Extract example failed:', error.message);
  }
}

/**
 * Run all ScrapingCrawl examples sequentially.
 */
async function runExamples() {
  console.log('=== Scrapeless ScrapingCrawl Service Examples ===\n');
  await exampleScrape();
  console.log('\n');
  await exampleCrawl();
  console.log('\n');
  await exampleExtract();
  console.log('\n');
  console.log('🎉 All examples completed');
}

// Run the examples
runExamples().catch(console.error);
