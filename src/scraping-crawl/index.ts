import { ScrapingCrawlService } from '../services';
import { ScrapingCrawlBaseService } from '../services/crawl/base';
import { CrawlService } from '../services/crawl/crawl';
import { ScrapeService } from '../services/crawl/scrape';
import {
  ScrapeParams,
  CrawlParams,
  ScrapingCrawlConfig,
  ScrapeStatusResponse,
  BatchScrapeStatusResponse,
  ScrapeResponse
} from '../types/scraping-crawl';
import { getEnv, getEnvWithDefault } from '../env';

interface ScrapelessScrapingCrawl extends CrawlService, ScrapeService, ScrapingCrawlBaseService {}

/**
 * High-level ScrapingCrawl SDK class that provides unified access to scraping, crawling services.
 */
export class ScrapingCrawl implements Omit<ScrapelessScrapingCrawl, 'request'> {
  /**
   * Underlying service aggregator for scraping, crawling.
   */
  service: ScrapingCrawlService;

  /**
   * Create a new ScrapingCrawl SDK instance.
   * @param config Configuration for API key, base URL, and timeout.
   */
  constructor(config: ScrapingCrawlConfig) {
    const apiKey = config.apiKey || getEnv('SCRAPELESS_API_KEY');
    const baseUrl = config.baseUrl || getEnvWithDefault('SCRAPELESS_CRAWL_API_URL', 'https://api.scrapeless.com');
    const timeout = config.timeout || 0;
    this.service = new ScrapingCrawlService(apiKey, baseUrl, timeout);
  }

  /**
   * Scrape a single URL.
   * @param url Target URL to scrape
   * @param params Optional scraping parameters
   * @returns Scraped data result
   */
  scrapeUrl(url: string, params?: ScrapeParams) {
    return this.service.scrape.scrapeUrl(url, params);
  }

  /**
   * Asynchronously scrape a single URL (fire-and-forget).
   * @param url Target URL to scrape
   * @param params Optional scraping parameters
   * @returns Job info or error response
   */
  asyncScrapeUrl(url: string, params?: ScrapeParams): Promise<ScrapeResponse> {
    return this.service.scrape.asyncScrapeUrl(url, params);
  }

  /**
   * Check the status of an asynchronous scrape job.
   * @param id Job ID
   * @returns Scrape job status and data or error response
   */
  checkScrapeStatus(id: string): Promise<ScrapeStatusResponse<any>> {
    return this.service.scrape.checkScrapeStatus(id);
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
   * Check the status of a batch scrape job.
   * @param id Batch job ID
   * @returns Batch scrape status or error response
   */
  checkBatchScrapeStatus(id: string): Promise<BatchScrapeStatusResponse> {
    return this.service.scrape.checkBatchScrapeStatus(id);
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
   * @returns Crawl job status and data
   */
  checkCrawlStatus(id?: string) {
    return this.service.crawl.checkCrawlStatus(id);
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
   * Monitor the status of a job with polling.
   * @param id Job ID
   * @param pollInterval Polling interval in milliseconds
   * @returns Job info
   */
  monitorJobStatus(id: string, pollInterval: number) {
    return this.service.crawl.monitorJobStatus(id, pollInterval);
  }
}
