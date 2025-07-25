/**
 * Scrapeless Node SDK - ScrapingCrawl Service Examples (ES Module Version)
 *
 * This example demonstrates how to use the ScrapingCrawl SDK for scraping, crawling.
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
  apiKey: 'your_api_key'
});

/**
 * Example: Scrape a single URL and save the result.
 */
async function exampleScrape() {
  try {
    const scrapeResponse = await client.scrapeUrl('https://example.com/', {
      formats: ['markdown', 'html', 'links', 'screenshot@fullPage']
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
 * Example: Scrape a single URL and save the result.
 */
async function exampleBatchScrape() {
  try {
    const scrapeResponse = await client.batchScrapeUrls(['https://example.com/', 'https://example.com/'], {
      formats: ['markdown', 'html', 'links', 'screenshot@fullPage'],
      browserOptions: {
        sessionName: 'scrapingCrawl_batchScrape'
      }
    });
    if (scrapeResponse) {
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
    const crawlResult = await client.crawlUrl('https://example.com/', {
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
 * Run all ScrapingCrawl examples sequentially.
 */
async function runExamples() {
  console.log('=== Scrapeless ScrapingCrawl Service Examples ===\n');
  await exampleScrape();
  console.log('\n');
  await exampleBatchScrape();
  console.log('\n');
  await exampleCrawl();
  console.log('\n');
  console.log('🎉 All examples completed');
}

// Run the examples
runExamples().catch(console.error);
