import { CrawlService } from './crawl';
import { ScrapeService } from './scrape';

export class ScrapingCrawlService {
  public readonly scrape: ScrapeService;
  public readonly crawl: CrawlService;

  /**
   * Create a new StorageService instance
   * @param apiKey API key for authentication
   * @param baseUrl Base URL for the API
   * @param timeout Request timeout in milliseconds
   */
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    this.scrape = new ScrapeService(apiKey, baseUrl, timeout);
    this.crawl = new CrawlService(apiKey, baseUrl, timeout);
  }
}
