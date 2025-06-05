import { ScrapelessConfig } from '../types';
import { BrowserService } from '../services';
import { getEnv, getEnvWithDefault } from '../env';
import { log as Log } from '../utils';

// Create a base logger that can be extended by specific implementations
export const createLogger = (prefix: string) => Log.withPrefix(prefix);

/**
 * Base browser service configuration
 */
export abstract class BaseBrowser {
  protected browserService?: BrowserService;

  /**
   * Base constructor for browser implementations
   */
  constructor() {
    // Base initialization if needed
  }

  /**
   * Initialize browser service with Scrapeless configuration
   * @param config Optional Scrapeless configuration
   */
  protected initBrowserService(config?: ScrapelessConfig) {
    const apiKey = config?.apiKey || getEnv('SCRAPELESS_API_KEY');
    const browserURL =
      config?.baseApiUrl || getEnvWithDefault('SCRAPELESS_BROWSER_API_URL', 'https://browser.scrapeless.com');

    this.browserService = new BrowserService(apiKey, browserURL, config?.timeout);
  }
}
