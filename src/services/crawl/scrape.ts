import { ScrapelessError } from '../../client';
import * as zt from 'zod';
import {
  BatchScrapeResponse,
  BatchScrapeStatusResponse,
  ScrapeParams,
  ScrapeResponse,
  ScrapeStatusResponse
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
   * * @param pollInterval Optional polling interval for job status (s)
   * @returns Scraped data result
   */
  async scrapeUrl<T extends zt.ZodSchema>(
    url: string,
    params?: ScrapeParams,
    pollInterval: number = 2
  ): Promise<ScrapeStatusResponse<zt.infer<T>>> {
    const jsonData: any = { url, ...params };

    try {
      const response = await this.request<any>('/api/v1/crawler/scrape', 'POST', jsonData, {});
      if (!response.id) {
        throw new ScrapelessError('Failed to start a scrape job', 400);
      }

      while (true) {
        const statusResponse = (await this.checkScrapeStatus(response.id)) as ScrapeStatusResponse<zt.infer<T>>;
        if (statusResponse.status !== 'scraping') {
          return statusResponse;
        }

        pollInterval = Math.max(pollInterval, 2);
        await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));
      }
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Scrape a single URL
   * @param url Target URL to scrape
   * @param params Optional scraping parameters
   * @returns Job info
   */
  async asyncScrapeUrl(url: string, params?: ScrapeParams): Promise<ScrapeResponse> {
    const jsonData: any = { url, ...params };
    try {
      const response = await this.request<any>('/api/v1/crawler/scrape', 'POST', jsonData, {});
      return response;
    } catch (err: any) {
      throw new ScrapelessError(err.message, err.statusCode || 500);
    }
  }

  /**
   * Check the status of a crawl job.
   * @param id Job ID
   * @returns Scraped data result
   */
  async checkScrapeStatus(id: string): Promise<ScrapeStatusResponse<any>> {
    if (!id) {
      throw new ScrapelessError('No scrape ID provided', 400);
    }
    const url = `/api/v1/crawler/scrape/${id}`;
    try {
      const response = await this.request<any>(url, 'GET');
      return response;
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
  ): Promise<BatchScrapeStatusResponse> {
    const jsonData: any = { urls, ignoreInvalidURLs, ...params };

    try {
      const response = await this.request<any>('/api/v1/crawler/scrape/batch', 'POST', jsonData);
      if (!response.id) {
        throw new ScrapelessError('Failed to start a batch scrape job', 400);
      }

      while (true) {
        const statusResponse = await this.checkBatchScrapeStatus(response.id);
        if (statusResponse.status !== 'scraping') {
          return statusResponse;
        }
        pollInterval = Math.max(pollInterval, 2);
        await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));
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
  ): Promise<BatchScrapeResponse> {
    const jsonData: any = { urls, ignoreInvalidURLs, ...params };
    try {
      const response = await this.request<any>('/api/v1/crawler/scrape/batch', 'POST', jsonData);
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Check the status of a batch crawl job.
   * @param id Job ID
   * @returns Scraped data result
   */
  async checkBatchScrapeStatus(id: string): Promise<BatchScrapeStatusResponse> {
    if (!id) {
      throw new ScrapelessError('No scrape ID provided', 400);
    }
    const url = `/api/v1/crawler/scrape/batch/${id}`;
    try {
      const response = await this.request<any>(url, 'GET');
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }
}
