import { BaseService } from '../base';
import { ScrapelessError } from '../../client';
import { CrawlStatusResponse } from '../../types/scraping-crawl';

export class ScrapingCrawlBaseService extends BaseService {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout, res => res);
  }

  /**
   * Monitor the status of a job with polling.
   * @param id Job ID
   * @param pollInterval Polling interval in milliseconds
   * @returns Job info
   */
  async monitorJobStatus(id: string, pollInterval: number): Promise<CrawlStatusResponse> {
    try {
      while (true) {
        let statusResponse = await this.request<any>(`/api/v1/crawler/crawl/${id}`, 'GET');
        if (statusResponse.status === 'completed') {
          if ('data' in statusResponse) {
            let data = statusResponse.data;
            while (typeof statusResponse === 'object' && 'next' in statusResponse) {
              if (data.length === 0) break;
              statusResponse = await this.request<any>(statusResponse.next, 'GET');
              data = data.concat(statusResponse.data);
            }
            statusResponse.data = data;
            return statusResponse;
          } else {
            throw new ScrapelessError('Crawl job completed but no data was returned', 500);
          }
        } else if (['active', 'paused', 'pending', 'queued', 'waiting', 'scraping'].includes(statusResponse.status)) {
          pollInterval = Math.max(pollInterval, 2);
          await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));
        } else {
          throw new ScrapelessError(`Crawl job failed or was stopped. Status: ${statusResponse.status}`, 500);
        }
      }
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }
}
