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
  async crawlUrl(
    url: string,
    params?: CrawlParams,
    pollInterval: number = 2
  ): Promise<CrawlStatusResponse | ErrorResponse> {
    const jsonData: any = { url, ...params };
    try {
      const response = await this.request<any>('/api/v1/crawler/crawl', 'POST', jsonData);
      if (response.id) {
        return this.monitorJobStatus(response.id, pollInterval);
      } else {
        throw new ScrapelessError('Failed to start crawl job', 400);
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
  async asyncCrawlUrl(url: string, params?: CrawlParams): Promise<CrawlResponse | ErrorResponse> {
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
   * @param getAllData Whether to fetch all data
   * @param nextURL Pagination cursor for next page
   * @param skip Number of records to skip
   * @param limit Maximum number of records to return
   * @returns Crawl job status and data
   */
  async checkCrawlStatus(
    id?: string,
    getAllData = false,
    nextURL?: string,
    skip?: number,
    limit?: number
  ): Promise<CrawlStatusResponse | ErrorResponse> {
    if (!id) {
      throw new ScrapelessError('No crawl ID provided', 400);
    }
    let url = nextURL ?? `/api/v1/crawler/crawl/${id}`;
    if (skip !== undefined || limit !== undefined) {
      const params = [];
      if (skip !== undefined) params.push(`skip=${skip}`);
      if (limit !== undefined) params.push(`limit=${limit}`);
      url += `?${params.join('&')}`;
    }
    try {
      const response = await this.request<any>(url, 'GET');
      let allData = response.data;
      if (getAllData && response.status === 'completed') {
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
      let resp: CrawlStatusResponse | ErrorResponse = {
        success: response.success,
        status: response.status,
        total: response.total,
        completed: response.completed,
        // next: getAllData ? undefined : response.next,
        expiresAt: new Date(response.expiresAt),
        data: allData
      };
      if (!response.success && response.error) {
        resp = {
          ...resp,
          success: false,
          error: response.error
        } as ErrorResponse;
      }
      // if (response.next) {
      //   (resp as CrawlStatusResponse).next = response.next;
      // }
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
  async checkCrawlErrors(id: string): Promise<CrawlErrorsResponse | ErrorResponse> {
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
