import puppeteer, { Browser, Page } from 'puppeteer-core';
import { BaseBrowser, createLogger } from './base';
import { ScrapelessConfig, LiveURLResponse, AgentCommands, PuppeteerLaunchOptions } from '../types';

const logger = createLogger('PuppeteerBrowser');

/**
 * Enhanced Puppeteer browser implementation using Scrapeless API
 * Provides additional automation capabilities and browser control
 */
export class PuppeteerBrowser extends BaseBrowser {
  private browser?: Browser;

  /**
   * Private constructor - use static connect method instead
   */
  private constructor(config?: ScrapelessConfig) {
    super(config);
  }

  /**
   * Create and connect to a Puppeteer browser instance
   * @param options Browser session configuration options
   * @param config Optional Scrapeless configuration
   * @returns Connected PuppeteerBrowser instance
   * @throws Error if connection fails
   */
  public static async connect(config: PuppeteerLaunchOptions & ScrapelessConfig = {}): Promise<PuppeteerBrowser> {
    const browser = new PuppeteerBrowser(config);
    try {
      const { browserWSEndpoint } = browser.browserService.create(config);
      logger.debug('Connecting to browser: ', { browserWSEndpoint });
      browser.browser = await puppeteer.connect({
        browserWSEndpoint,
        defaultViewport: config.defaultViewport ?? null
      });

      logger.info('Successfully connected to browser');
      return browser;
    } catch (error) {
      logger.error('Failed to connect to browser', { error });
      throw new Error(`Failed to connect to browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close the browser instance and clean up resources
   */
  public async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        logger.info('Browser closed successfully');
      } catch (error) {
        logger.error('Error closing browser', { error });
      }
    }
  }

  /**
   * Create a new browser page with extended methods
   * @returns Extended Page instance
   * @throws Error if browser is not started
   */
  public async newPage(): Promise<Page> {
    if (!this.browser) {
      logger.error('Attempted to create page with no browser instance');
      throw new Error('Browser not started');
    }

    try {
      const page = await this.browser.newPage();
      await this.extendPageMethods(page);
      return page;
    } catch (error) {
      logger.error('Failed to create new page', { error });
      throw new Error(`Failed to create new page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the underlying Puppeteer Browser instance
   * @returns The Puppeteer Browser instance
   */
  public getBrowser(): Browser | undefined {
    return this.browser;
  }

  /**
   * Extend the Page object with additional methods
   * @param page Puppeteer page instance
   */
  private async extendPageMethods(page: Page): Promise<void> {
    try {
      const cdpSession = await page.createCDPSession();
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
      page.realClick = async function (selector: string): Promise<void> {
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
