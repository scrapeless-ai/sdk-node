import { ScrapelessError } from '../../client';
import {
  CrawlErrorsResponse,
  CrawlParams,
  CrawlResponse,
  CrawlStatusResponse,
  ErrorResponse
} from '../../types/scraping-crawl';
import { ScrapingCrawlBaseService } from './base';

export class CrawlService extends ScrapingCrawlBaseService {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Crawl a single URL and follow links according to crawl parameters.
   * @param url Target URL to crawl
   * @param params Optional crawl parameters
   * @param pollInterval Optional polling interval for job status (s)
   * @returns Crawl result
   */
  async crawlUrl(url: string, params?: CrawlParams, pollInterval: number = 2): Promise<CrawlStatusResponse> {
    const jsonData: any = { url, ...params };
    try {
      const response = await this.request<any>('/api/v1/crawler/crawl', 'POST', jsonData);
      if (response.id) {
        return this.monitorJobStatus(response.id, pollInterval);
      } else {
        throw new ScrapelessError('Failed to start a crawl job', 400);
      }
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Start an asynchronous crawl job for a single URL.
   * @param url Target URL to crawl
   * @param params Optional crawl parameters
   * @returns Job info
   */
  async asyncCrawlUrl(url: string, params?: CrawlParams): Promise<CrawlResponse> {
    const jsonData: any = { url, ...params };
    try {
      const response = await this.request<any>('/api/v1/crawler/crawl', 'POST', jsonData);
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Check the status of a crawl job.
   * @param id Job ID
   * @returns Crawl job status and data
   */
  async checkCrawlStatus(id?: string): Promise<CrawlStatusResponse> {
    if (!id) {
      throw new ScrapelessError('No crawl ID provided', 400);
    }
    const url = `/api/v1/crawler/crawl/${id}`;
    try {
      const response = await this.request<any>(url, 'GET');
      let allData = response.data;
      if (response.status === 'completed') {
        let statusData = response;
        if ('data' in statusData) {
          let data = statusData.data;
          while (typeof statusData === 'object' && 'next' in statusData) {
            if (data.length === 0) break;
            statusData = await this.request<any>(statusData.next, 'GET');
            data = data.concat(statusData.data);
          }
          allData = data;
        }
      }
      let resp: CrawlStatusResponse = {
        success: response.success,
        status: response.status,
        total: response.total,
        completed: response.completed,
        data: allData
      };
      if (!response.success && response.error) {
        resp = {
          ...resp,
          success: false,
          error: response.error
        };
      }
      return resp;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Get crawl errors for a specific job.
   * @param id Job ID
   * @returns List of crawl errors
   */
  async checkCrawlErrors(id: string): Promise<CrawlErrorsResponse> {
    try {
      const response = await this.request<any>(`/api/v1/crawler/crawl/${id}/errors`, 'DELETE');
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Cancel an ongoing crawl job.
   * @param id Job ID
   * @returns Operation result
   */
  async cancelCrawl(id: string): Promise<ErrorResponse> {
    try {
      const response = await this.request<any>(`/api/v1/crawler/crawl/${id}`, 'DELETE');
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }
}
