import { ScrapelessConfig, IStorageService } from './types';
import {
  BrowserService,
  ScrapingService,
  DeepSerpService,
  UniversalService,
  ProxiesService,
  ActorService,
  HttpStorageService,
  LocalStorageService,
  ScrapingCrawlService,
  ProfilesService
} from './services';
import { createRoot } from './utils/memory';

import { getEnv, getEnvWithDefault } from './env';

export class ScrapelessError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(`[Scrapeless]: ${message}`);
    this.name = 'ScrapelessError';
  }
}

export class ScrapelessClient {
  public readonly browser: BrowserService;
  public readonly scraping: ScrapingService;
  public readonly deepserp: DeepSerpService;
  public readonly universal: UniversalService;
  public readonly proxies: ProxiesService;
  public readonly actor: ActorService;
  public readonly storage: IStorageService;
  public readonly scrapingCrawl: ScrapingCrawlService;
  public readonly profiles: ProfilesService;

  constructor(config: ScrapelessConfig = {}) {
    const apiKey = config.apiKey || getEnv('SCRAPELESS_API_KEY');
    const timeout = config.timeout || 30000;
    const baseApiURL = config.baseApiUrl || getEnvWithDefault('SCRAPELESS_BASE_API_URL', 'https://api.scrapeless.com');
    const actorURL =
      config.actorApiUrl || getEnvWithDefault('SCRAPELESS_ACTOR_API_URL', 'https://actor.scrapeless.com');
    const storageURL =
      config.storageApiUrl || getEnvWithDefault('SCRAPELESS_STORAGE_API_URL', 'https://storage.scrapeless.com');
    const browserURL =
      config.browserApiUrl || getEnvWithDefault('SCRAPELESS_BROWSER_API_URL', 'https://browser.scrapeless.com');
    const scrapingCrawlURL =
      config.scrapingCrawlApiUrl || getEnvWithDefault('SCRAPELESS_CRAWL_API_URL', 'https://api.scrapeless.com');
    const isOnline = getEnvWithDefault('SCRAPELESS_IS_ONLINE', 'false');

    if (!apiKey) {
      throw new ScrapelessError(
        'API key is required - either pass it in config or set SCRAPELESS_API_KEY environment variable'
      );
    }

    if (isOnline === 'false') {
      // Ensure that the directory exists (create if it does not exist)
      createRoot();
      this.storage = new LocalStorageService();
    } else {
      this.storage = new HttpStorageService(apiKey, storageURL, timeout);
    }

    this.actor = new ActorService(apiKey, actorURL, timeout);
    this.browser = new BrowserService(apiKey, browserURL, timeout);

    this.scraping = new ScrapingService(apiKey, baseApiURL, timeout);
    this.deepserp = new DeepSerpService(apiKey, baseApiURL, timeout);
    this.universal = new UniversalService(apiKey, baseApiURL, timeout);
    this.proxies = new ProxiesService(apiKey, baseApiURL, timeout);
    this.scrapingCrawl = new ScrapingCrawlService(apiKey, scrapingCrawlURL, config.timeout || 0);
    this.profiles = new ProfilesService(apiKey, baseApiURL, timeout);
  }
}
