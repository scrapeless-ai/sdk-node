import puppeteer from 'puppeteer-core';
import { BaseBrowser, createLogger } from './base';
import {
  CaptchaCDPResponse,
  CaptchaOptions,
  CustomPuppeteerCDPSession,
  LiveURLResponse,
  PuppeteerLaunchOptions,
  ScrapelessConfig,
  ScrapelessPuppeteerBrowser,
  ScrapelessPuppeteerPage,
  SetAutoSolveOptions
} from '../types';

const logger = createLogger('Puppeteer');

/**
 * Enhanced Puppeteer browser implementation using Scrapeless API
 * Provides additional automation capabilities and browser control
 */
export class Puppeteer extends BaseBrowser {
  private browser?: ScrapelessPuppeteerBrowser;

  private cdpSession?: CustomPuppeteerCDPSession;

  private currentPage?: ScrapelessPuppeteerPage;

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
   * @returns Connected Puppeteer instance
   * @throws Error if connection fails
   */
  public static async connect(config: PuppeteerLaunchOptions & ScrapelessConfig = {}): Promise<Puppeteer> {
    const browser = new Puppeteer(config);
    try {
      const { browserWSEndpoint } = browser.browserService.create(config);
      logger.debug('Connecting to browser: ', { browserWSEndpoint });
      browser.browser = (await puppeteer.connect({
        browserWSEndpoint,
        defaultViewport: config.defaultViewport ?? null
      })) as ScrapelessPuppeteerBrowser;

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
  public async newPage(): Promise<ScrapelessPuppeteerPage> {
    if (!this.browser) {
      logger.error('Attempted to create page with no browser instance');
      throw new Error('Browser not started');
    }

    try {
      this.currentPage = await this.browser.newPage();
      await this.setupCustomPageMethods();
      return this.currentPage;
    } catch (error) {
      logger.error('Failed to create new page', { error });
      throw new Error(`Failed to create new page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the underlying Puppeteer Browser instance
   * @returns The Puppeteer Browser instance
   */
  public getBrowser(): ScrapelessPuppeteerBrowser | undefined {
    return this.browser;
  }

  public refreshCDPSession(): Promise<void> {
    if (!this.currentPage) {
      logger.error('Attempted to refresh CDP with no current page');
      throw new Error('No current page available');
    }
    return this.setupCustomPageMethods();
  }

  /**
   * Extend the Page object with additional methods
   * @param page Puppeteer page instance
   */
  private async setupCustomPageMethods(): Promise<void> {
    if (!this.currentPage) {
      logger.error('Attempted to setup custom page methods with no current page');
      throw new Error('No current page available');
    }
    try {
      this.cdpSession = (await this.currentPage.createCDPSession()) as CustomPuppeteerCDPSession;

      // Get current page URL
      this.currentPage.liveURL = async (): Promise<LiveURLResponse> => {
        if (!this.cdpSession) {
          logger.error(`liveURL: CDP Session is not available`);
          throw new Error('CDP Session is not available');
        }
        try {
          const { error, liveURL } = await this.cdpSession.send('Agent.liveURL');
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
      this.currentPage.realClick = async (selector: string): Promise<void> => {
        if (!this.cdpSession) {
          logger.error(`realClick: CDP Session is not available`);
          throw new Error('CDP Session is not available');
        }
        try {
          await this.cdpSession.send('Agent.click', { selector });
        } catch (error) {
          logger.error('Error in realClick', { selector, error });
          throw new Error(
            `Failed to click element "${selector}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };

      // Type text into a selector
      this.currentPage.realFill = async (selector: string, text: string): Promise<void> => {
        if (!this.cdpSession) {
          logger.error(`realFill: CDP Session is not available`);
          throw new Error('CDP Session is not available');
        }
        try {
          await this.cdpSession.send('Agent.type', { selector, content: text });
        } catch (error) {
          logger.error('Error in type', { selector, error });
          throw new Error(
            `Failed to type text into "${selector}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };

      this.currentPage.setAutoSolve = async (options: SetAutoSolveOptions): Promise<void> => {
        if (!this.cdpSession) {
          logger.error(`setAutoSolve: CDP Session is not available`);
          throw new Error('CDP Session is not available');
        }
        try {
          return this.cdpSession.send('Captcha.setAutoSolve', {
            autoSolve: options.autoSolve ?? true,
            options: JSON.stringify(options.options)
          });
        } catch (error) {
          logger.error('Error in setAutoSolve', { options, error });
          throw new Error(`Failed to set auto solve: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      this.currentPage.disableCaptchaAutoSolve = async (): Promise<void> => {
        if (!this.cdpSession) {
          logger.error(`disableAutoSolve: CDP Session is not available`);
          throw new Error('CDP Session is not available');
        }
        try {
          return this.cdpSession.send('Captcha.setAutoSolve', { autoSolve: false });
        } catch (error) {
          logger.error('Error in disableCaptchaAutoSolve', { error });
          throw new Error(
            `Failed to disable captcha auto solve: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };

      this.currentPage.solveCaptcha = async (options: {
        timeout?: number;
        options?: CaptchaOptions[];
      }): Promise<CaptchaCDPResponse> => {
        if (!this.cdpSession) {
          logger.error(`solveCaptcha: CDP Session is not available`);
          throw new Error('CDP Session is not available');
        }
        try {
          return this.cdpSession.send('Captcha.solve', {
            detectTimeout: options.timeout ?? 30_000,
            options: JSON.stringify(options.options)
          });
        } catch (error) {
          logger.error('Error in solveCaptcha', { options, error });
          throw new Error(`Failed to solve captcha: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      //=================================== event =================================== //
      this.currentPage.waitCaptchaDetected = async (options: { timeout?: number }): Promise<CaptchaCDPResponse> => {
        const { timeout = 30_000 } = options || {};
        logger.debug(`Waiting for captcha detected with timeout: ${timeout}ms`);
        try {
          return Promise.race([
            new Promise<CaptchaCDPResponse>(resolve => {
              setTimeout(() => {
                resolve({ success: false, message: 'Timeout waiting for captcha detected' });
              }, timeout);
            }),

            new Promise<CaptchaCDPResponse>(resolve => {
              if (!this.cdpSession) {
                logger.error(`waitCaptchaDetected: CDP Session is not available`);
                throw new Error('CDP Session is not available');
              }
              this.cdpSession.on('Captcha.detected', response => {
                resolve(response as CaptchaCDPResponse);
              });
            })
          ]);
        } catch (error) {
          logger.error('Error in waitCaptchaDetected', error);
          throw new Error(
            `Failed to wait for captcha detected: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };

      this.currentPage.waitCaptchaSolved = async (options: { timeout?: number }): Promise<CaptchaCDPResponse> => {
        const { timeout = 30_000 } = options || {};
        logger.debug(`Waiting for captcha solved with timeout: ${timeout}ms`);
        try {
          return Promise.race([
            new Promise<CaptchaCDPResponse>(resolve => {
              if (!this.cdpSession) {
                logger.error(`waitCaptchaSolved: CDP Session is not available`);
                throw new Error('CDP Session is not available');
              }
              this.cdpSession.on('Captcha.solveFinished', response => {
                resolve(response as CaptchaCDPResponse);
              });
            }),
            new Promise<CaptchaCDPResponse>(resolve => {
              if (!this.cdpSession) {
                logger.error(`waitCaptchaSolved: CDP Session is not available`);
                throw new Error('CDP Session is not available');
              }
              this.cdpSession.on('Captcha.solveFailed', response => {
                resolve(response as CaptchaCDPResponse);
              });
            }),
            new Promise<CaptchaCDPResponse>(resolve => {
              setTimeout(() => {
                resolve({ success: false, message: 'Timeout waiting for captcha solved' });
              }, timeout);
            })
          ]);
        } catch (error) {
          logger.error('Error in waitCaptchaSolved', error);
          throw new Error(
            `Failed to wait for captcha solved: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      };
    } catch (error) {
      logger.error('Failed to extend page methods', { error });
      throw new Error(`Failed to extend page methods: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
