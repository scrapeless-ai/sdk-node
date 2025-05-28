import { ICreateBrowser, ScrapelessConfig } from '../types';
import { BrowserService } from '../services';
import { getEnv, getEnvWithDefault } from '../env';
import { log as Log } from '../utils';

// Create a base logger that can be extended by specific implementations
export const createLogger = (prefix: string) => Log.withPrefix(prefix);

/**
 * Common response type for liveURL method
 */
export interface LiveURLResponse {
  error: string | null;
  liveURL: string | null;
}

/**
 * Base interface for browser launch options
 */
export interface BaseLaunchOptions extends ICreateBrowser {
  defaultViewport?: any | null;
}

/**
 * CDP Agent commands interface
 */
export type AgentCommands = {
  'Agent.liveURL': () => Promise<{ error?: string; liveURL?: string }>;
  'Agent.click': (params: { selector: string }) => Promise<void>;
  'Agent.type': (params: { selector: string; content: string }) => Promise<void>;
};

/**
 * Base browser service configuration
 */
export abstract class BaseBrowser {
  protected browserService: BrowserService;

  /**
   * Create a browser instance with Scrapeless configuration
   * @param config Optional Scrapeless configuration
   */
  protected constructor(config?: ScrapelessConfig) {
    const apiKey = config?.apiKey || getEnv('SCRAPELESS_API_KEY');
    const browserURL =
      config?.baseApiUrl || getEnvWithDefault('SCRAPELESS_BROWSER_API_URL', 'https://browser.scrapeless.com');

    this.browserService = new BrowserService(apiKey, browserURL, config?.timeout);
  }
}

/**
 * Extended page functionality interface
 * This defines the common methods that both Puppeteer and Playwright pages should implement
 */
export interface ExtendedPageFunctions {
  /**
   * Get the current page URL
   * @returns Object containing the current page URL or error
   */
  liveURL(): Promise<LiveURLResponse>;

  /**
   * Type text into a specified selector
   * @param selector The element selector to type into
   * @param text The text to type
   * @throws Error if the operation fails
   */
  realFill(selector: string, text: string): Promise<void>;

  /**
   * Perform a realistic click operation on the selected element
   * @param selector The element selector to click
   * @param options Optional click configuration
   * @throws Error if the element is not found or the operation fails
   */
  realClick(selector: string, options?: { delay?: number }): Promise<void>;

  // TODO: other CDP
}
