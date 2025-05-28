import { ZodType } from 'zod';
import { ScrapingCrawlService } from '../services';
import { ScrapingCrawlBaseService } from '../services/crawl/base';
import { CrawlService } from '../services/crawl/crawl';
import { ExtractService } from '../services/crawl/extract';
import { ScrapeService } from '../services/crawl/scrape';
import { ScrapeParams, CrawlParams, ExtractParams, ScrapingCrawlConfig } from '../types/scraping-crawl';
import { getEnv, getEnvWithDefault } from '../env';

interface ScrapelessScrapingCrawl extends CrawlService, ScrapeService, ExtractService, ScrapingCrawlBaseService {}

/**
 * High-level ScrapingCrawl SDK class that provides unified access to scraping, crawling, and extraction services.
 */
export class ScrapingCrawl implements Omit<ScrapelessScrapingCrawl, 'request'> {
  /**
   * Underlying service aggregator for scraping, crawling, and extraction.
   */
  service: ScrapingCrawlService;

  /**
   * Create a new ScrapingCrawl SDK instance.
   * @param config Configuration for API key, base URL, and timeout.
   */
  constructor(config: ScrapingCrawlConfig) {
    const apiKey = config.apiKey || getEnv('SCRAPELESS_API_KEY');
    const baseUrl = config.baseUrl || getEnvWithDefault('SCRAPELESS_CRAWL_API_URL', 'https://crawl.scrapeless.com');
    const timeout = config.timeout || 0;
    this.service = new ScrapingCrawlService(apiKey, baseUrl, timeout);
  }

  /**
   * Scrape a single URL and extract structured data.
   * @param url Target URL to scrape
   * @param params Optional scraping parameters
   * @returns Scraped data result
   */
  scrapeUrl(url: string, params?: ScrapeParams) {
    return this.service.scrape.scrapeUrl(url, params);
  }

  /**
   * Batch scrape multiple URLs synchronously.
   * @param urls Array of URLs to scrape
   * @param params Optional scraping parameters
   * @param pollInterval Optional polling interval for job status (ms)
   * @param ignoreInvalidURLs Whether to skip invalid URLs
   * @returns Batch scrape result
   */
  batchScrapeUrls(urls: string[], params?: ScrapeParams, pollInterval?: number, ignoreInvalidURLs?: boolean) {
    return this.service.scrape.batchScrapeUrls(urls, params, pollInterval, ignoreInvalidURLs);
  }

  /**
   * Batch scrape multiple URLs asynchronously (fire-and-forget).
   * @param urls Array of URLs to scrape
   * @param params Optional scraping parameters
   * @param ignoreInvalidURLs Whether to skip invalid URLs
   * @returns Job info
   */
  asyncBatchScrapeUrls(urls: string[], params?: ScrapeParams, ignoreInvalidURLs?: boolean) {
    return this.service.scrape.asyncBatchScrapeUrls(urls, params, ignoreInvalidURLs);
  }

  /**
   * Crawl a single URL and follow links according to crawl parameters.
   * @param url Target URL to crawl
   * @param params Optional crawl parameters
   * @param pollInterval Optional polling interval for job status (ms)
   * @returns Crawl result
   */
  crawlUrl(url: string, params?: CrawlParams, pollInterval?: number) {
    return this.service.crawl.crawlUrl(url, params, pollInterval);
  }

  /**
   * Start an asynchronous crawl job for a single URL.
   * @param url Target URL to crawl
   * @param params Optional crawl parameters
   * @returns Job info
   */
  asyncCrawlUrl(url: string, params?: CrawlParams) {
    return this.service.crawl.asyncCrawlUrl(url, params);
  }

  /**
   * Check the status of a crawl job.
   * @param id Job ID
   * @param getAllData Whether to fetch all data
   * @param nextURL Pagination cursor for next page
   * @param skip Number of records to skip
   * @param limit Maximum number of records to return
   * @returns Crawl job status and data
   */
  checkCrawlStatus(id?: string, getAllData?: boolean, nextURL?: string, skip?: number, limit?: number) {
    return this.service.crawl.checkCrawlStatus(id, getAllData, nextURL, skip, limit);
  }

  /**
   * Get crawl errors for a specific job.
   * @param id Job ID
   * @returns List of crawl errors
   */
  checkCrawlErrors(id: string) {
    return this.service.crawl.checkCrawlErrors(id);
  }

  /**
   * Cancel an ongoing crawl job.
   * @param id Job ID
   * @returns Operation result
   */
  cancelCrawl(id: string) {
    return this.service.crawl.cancelCrawl(id);
  }

  /**
   * Extract structured data from one or more URLs using a Zod schema.
   * @param urls Array of URLs to extract from
   * @param params Extraction parameters, including Zod schema
   * @returns Extracted data
   */
  extractUrls<T extends ZodType = any>(urls?: string[], params?: ExtractParams<T>) {
    return this.service.extract.extractUrls(urls, params);
  }

  /**
   * Start an asynchronous extraction job for multiple URLs.
   * @param urls Array of URLs to extract from
   * @param params Extraction parameters
   * @returns Job info
   */
  asyncExtractUrls(urls: string[], params?: ExtractParams) {
    return this.service.extract.asyncExtractUrls(urls, params);
  }

  /**
   * Get the status of an extraction job.
   * @param jobId Extraction job ID
   * @returns Extraction job status and data
   */
  getExtractStatus(jobId: string) {
    return this.service.extract.getExtractStatus(jobId);
  }

  /**
   * Monitor the status of a job with polling.
   * @param id Job ID
   * @param pollInterval Polling interval in milliseconds
   * @returns Job info
   */
  monitorJobStatus(id: string, pollInterval: number) {
    return this.service.crawl.monitorJobStatus(id, pollInterval);
  }
}
