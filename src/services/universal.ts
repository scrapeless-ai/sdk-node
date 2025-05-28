import { BaseService } from './base';
import { UniversalScrapingRequest } from '../types';

export class UniversalService extends BaseService {
  private basePath = '/api/v1/unlocker';
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Scrape any website using the Universal Scraping API
   * @param request Scraping request
   */
  async scrape<T, R = any>(request: UniversalScrapingRequest<T, R>): Promise<any> {
    return this.request<any>(`${this.basePath}/request`, 'POST', request);
  }
}
