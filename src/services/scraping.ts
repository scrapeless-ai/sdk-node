import { BaseService } from './base';
import { sleep } from '../utils';
import { ScrapingTaskRequest, ScrapingTaskResponse, ResponseWithStatus } from '../types';

export class ScrapingService extends BaseService {
  private basePath = '/api/v1/scraper';

  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Create a scraping request to extract data from websites
   * @param request Scraping request parameters including actor, input, and proxy settings
   * @returns Task ID and status information for the scraping task
   */
  async createTask(request: ScrapingTaskRequest): Promise<ResponseWithStatus<ScrapingTaskResponse>> {
    const requestWithSync = {
      ...request,
      async: true
    };

    return await this.request<ScrapingTaskResponse, true>(
      `${this.basePath}/request`,
      'POST',
      requestWithSync,
      {},
      true
    );
  }

  /**
   * Get the result of a scraping task
   * @param taskId The ID of the scraping task
   * @returns The scraped data and task status
   */
  async getTaskResult<T>(taskId: string): Promise<ResponseWithStatus<T>> {
    return this.request<T, true>(`${this.basePath}/result/${taskId}`, 'GET', undefined, {}, true);
  }

  /**
   * Perform a scraping operation and wait for the result
   * @param request Scraping request parameters
   * @returns The scraped data result
   */
  async scrape<T>(request: ScrapingTaskRequest): Promise<T> {
    // Set async too false to wait for result
    const requestWithSync = {
      ...request,
      async: false
    };

    const response = await this.createTask(requestWithSync);
    if (response.status === 200) return response.data as T;

    while (true) {
      await sleep(1000);
      const result = await this.getTaskResult<T>(response.data.taskId);
      if (result.status === 200) {
        return result.data;
      }
    }
  }
}
