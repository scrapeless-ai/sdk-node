import { ScrapelessError } from '../../client';
import * as zt from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  BatchScrapeResponse,
  BatchScrapeStatusResponse,
  ErrorResponse,
  ScrapeParams,
  ScrapeResponse
} from '../../types/scraping-crawl';
import { ScrapingCrawlBaseService } from './base';

export class ScrapeService extends ScrapingCrawlBaseService {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Scrape a single URL
   * @param url Target URL to scrape
   * @param params Optional scraping parameters
   * @returns Scraped data result
   */
  async scrapeUrl<T extends zt.ZodSchema>(
    url: string,
    params?: ScrapeParams
  ): Promise<ScrapeResponse<zt.infer<T>> | ErrorResponse> {
    let jsonData: any = { url, ...params };

    try {
      const response = await this.request<any>('/v1/scrape', 'POST', jsonData, {});
      if (response.success) {
        return {
          success: true,
          warning: response.warning,
          error: response.error,
          ...response.data
        };
      } else {
        throw new ScrapelessError(`Failed to scrape URL. Error: ${response.error}`, 400);
      }
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Batch scrape multiple URLs synchronously.
   * @param urls Array of URLs to scrape
   * @param params Optional scraping parameters
   * @param pollInterval Optional polling interval for job status (ms)
   * @param ignoreInvalidURLs Whether to skip invalid URLs
   * @returns Batch scrape result
   */
  async batchScrapeUrls(
    urls: string[],
    params?: ScrapeParams,
    pollInterval: number = 2,
    ignoreInvalidURLs?: boolean
  ): Promise<BatchScrapeStatusResponse | ErrorResponse> {
    let jsonData: any = { urls, ignoreInvalidURLs, ...params };

    try {
      const response = await this.request<any>('/v1/batch/scrape', 'POST', jsonData);
      if (response.id) {
        return this.monitorJobStatus(response.id, pollInterval);
      } else {
        throw new ScrapelessError('Failed to start batch scrape job', 400);
      }
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Batch scrape multiple URLs asynchronously (fire-and-forget).
   * @param urls Array of URLs to scrape
   * @param params Optional scraping parameters
   * @param ignoreInvalidURLs Whether to skip invalid URLs
   * @returns Job info
   */
  async asyncBatchScrapeUrls(
    urls: string[],
    params?: ScrapeParams,
    ignoreInvalidURLs?: boolean
  ): Promise<BatchScrapeResponse | ErrorResponse> {
    const jsonData: any = { urls, ignoreInvalidURLs, ...params };
    try {
      const response = await this.request<any>('/v1/batch/scrape', 'POST', jsonData);
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }
}
