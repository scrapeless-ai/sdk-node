import { chromium, Browser, BrowserContext, Page } from 'playwright-core';
import { BaseBrowser, createLogger } from './base';
import { ScrapelessConfig, AgentCommands, LiveURLResponse, PlaywrightLaunchOptions } from '../types';

const logger = createLogger('PlaywrightBrowser');

/**
 * Enhanced Playwright browser implementation using Scrapeless API
 * Provides additional automation capabilities and browser control
 */
export class PlaywrightBrowser extends BaseBrowser {
  private browser?: Browser;
  private context?: BrowserContext;

  /**
   * Private constructor - use static connect method instead
   */
  private constructor(config?: ScrapelessConfig) {
    super(config);
  }

  /**
   * Create and connect to a Playwright browser instance
   * @param options Browser session configuration options
   * @param config Optional Scrapeless configuration
   * @returns Connected PlaywrightBrowser instance
   * @throws Error if connection fails
   */
  public static async connect(config: PlaywrightLaunchOptions & ScrapelessConfig = {}): Promise<PlaywrightBrowser> {
    const b = new PlaywrightBrowser(config);
    try {
      const { browserWSEndpoint } = b.browserService.create(config);
      // logger.debug('Connecting to browser: ', { browserWSEndpoint });
      b.browser = await chromium.connectOverCDP({
        wsEndpoint: browserWSEndpoint
      });
      b.context = b.browser.contexts()[0];

      logger.info('Successfully connected to browser');
      return b;
    } catch (error) {
      logger.error('Failed to connect to browser', { error });
      throw new Error(`Failed to connect to browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close the browser instance and clean up resources
   */
  public async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
        logger.info('Browser closed successfully');
      }
    } catch (error) {
      logger.error('Error closing browser', { error });
    }
  }

  /**
   * Create a new browser page with extended methods
   * @returns Extended Page instance
   * @throws Error if browser is not started
   */
  public async newPage(): Promise<Page> {
    if (!this.context) {
      logger.error('Attempted to create page with no browser context');
      throw new Error('Browser context not initialized');
    }

    try {
      const page = await this.context.newPage();
      this.extendPageMethods(page);
      return page;
    } catch (error) {
      logger.error('Failed to create new page', { error });
      throw new Error(`Failed to create new page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the underlying Playwright Browser instance
   * @returns The Playwright Browser instance
   */
  public getBrowser(): Browser | undefined {
    return this.browser;
  }

  /**
   * Get the browser context
   * @returns The Playwright BrowserContext
   */
  public getContext(): BrowserContext | undefined {
    return this.context;
  }

  /**
   * Extend the Page object with additional methods
   * @param page Playwright page instance
   */
  private async extendPageMethods(page: Page): Promise<void> {
    try {
      // Create CDP session for Playwright
      const cdpSession = await page.context().newCDPSession(page);

      // Cast client to include our custom commands
      const client = cdpSession as unknown as {
        send<T extends keyof AgentCommands>(
          method: T,
          ...params: Parameters<AgentCommands[T]>
        ): ReturnType<AgentCommands[T]>;
      };

      // Get current page URL
      page.liveURL = async function (): Promise<LiveURLResponse> {
        try {
          const { error, liveURL } = await client.send('Agent.liveURL');
          return {
            error: error || null,
            liveURL: liveURL || null
          };
        } catch (error) {
          logger.error('Error in liveURL', { error });
          return {
            error: error instanceof Error ? error.message : String(error),
            liveURL: null
          };
        }
      };

      // Perform a realistic click operation
      page.realClick = async function (selector: string, options: { delay?: number } = {}): Promise<void> {
        try {
          await client.send('Agent.click', { selector });
        } catch (error) {
          logger.error('Error in realClick', { selector, error });
          throw new Error(
            `Failed to click element "${selector}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };

      // Type text into a selector
      page.realFill = async function (selector: string, text: string): Promise<void> {
        try {
          await client.send('Agent.type', { selector, content: text });
        } catch (error) {
          logger.error('Error in type', { selector, error });
          throw new Error(
            `Failed to type text into "${selector}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };
    } catch (error) {
      logger.error('Failed to extend page methods', { error });
      throw new Error(`Failed to extend page methods: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
