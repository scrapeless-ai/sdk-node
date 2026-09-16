import { BaseService } from './base';
import { AIScraperTaskRequest, AIScraperTaskResponse, AIScraperTaskResult } from '../types';

/** Extract AI chat content through the v2 Scraper API. */
export class AIScraperService extends BaseService {
  private readonly basePath = '/api/v2/scraper';

  constructor(apiKey: string, baseUrl: string, timeout: number = 30000) {
    super(apiKey, baseUrl, timeout, data => data);
  }

  /** Create a task and return the complete API response without polling. */
  async createTask<T = any>(request: AIScraperTaskRequest): Promise<AIScraperTaskResponse<T>> {
    return this.request<AIScraperTaskResponse<T>>(`${this.basePath}/request`, 'POST', request, {
      'x-api-token': this.apiKey
    });
  }

  /** Retrieve the current status and result, including task failure messages. */
  async getTaskResult<T = any>(taskId: string): Promise<AIScraperTaskResult<T>> {
    return this.request<AIScraperTaskResult<T>>(
      `${this.basePath}/result/${encodeURIComponent(taskId)}`,
      'GET',
      undefined,
      { 'x-api-token': this.apiKey }
    );
  }
}
