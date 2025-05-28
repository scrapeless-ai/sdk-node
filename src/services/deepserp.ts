import { ScrapingService } from './scraping';
export class DeepSerpService extends ScrapingService {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }
}
