import { chromium, BrowserContext, Browser, Page } from 'playwright-core';
import { BaseBrowser, createLogger } from './base';
import {
  ScrapelessConfig,
  LiveURLResponse,
  PlaywrightLaunchOptions,
  ScrapelessCDPSession,
  CustomCDPCommands,
  CaptchaCDPResponse,
  CaptchaOptions,
  SetAutoSolveOptions
} from '../types';

const logger = createLogger('Playwright');

/**
 * Create a Scrapeless-enhanced CDP session with custom automation methods
 *
 * This function can be used independently to wrap any CDP session with Scrapeless custom methods.
 * It uses the Proxy pattern to seamlessly extend the original CDP session functionality.
 *
 * @example
 * ```typescript
 * import { createPlaywrightCDPSession } from '@scrapeless-ai/sdk';
 *
 * // With regular Playwright
 * const browser = await chromium.connectOverCDP(webSocketDebuggerUrl);
 * const context = await browser.newContext();
 * const page = await context.newPage();
 * const scrapelessCDP = createPlaywrightCDPSession(context, page);
 *
 * // Now you can use enhanced methods
 * await scrapelessCDP.realFill('#email', 'user@example.com');
 * await scrapelessCDP.realClick('#submit');
 * const captchaResult = await scrapelessCDP.solveCaptcha({ timeout: 30000 });
 * ```
 *
 * @param page - Page instance for selector operations (waitForSelector, etc.)
 * @returns Enhanced CDP session with custom Scrapeless methods
 */
export async function createPlaywrightCDPSession(page: Page): Promise<ScrapelessCDPSession> {
  const cdpSession = (await page.context().newCDPSession(page)) as CustomCDPCommands;

  const customMethods = {
    /**
     * Get the current page URL using Scrapeless Agent
     * @returns Promise resolving to LiveURLResponse with current URL or error
     */
    liveURL: async (): Promise<LiveURLResponse> => {
      try {
        const { error, liveURL } = await cdpSession.send('Agent.liveURL');
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
    },

    /**
     * Perform a realistic click operation using Scrapeless Agent
     * Waits for the element to be available before clicking
     * @param selector - CSS selector of the element to click
     * @throws Error if the element is not found or click fails
     */
    realClick: async (selector: string): Promise<void> => {
      try {
        await page.waitForSelector(selector);
        await cdpSession.send('Agent.click', { selector });
        logger.debug('Successfully clicked element', { selector });
      } catch (error) {
        logger.error('Error in realClick', { selector, error });
        throw new Error(
          `Failed to click element "${selector}": ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    /**
     * Type text into a form field using Scrapeless Agent
     * Waits for the element to be available before typing
     * @param selector - CSS selector of the input element
     * @param text - Text to type into the element
     * @throws Error if the element is not found or typing fails
     */
    realFill: async (selector: string, text: string): Promise<void> => {
      try {
        await page.waitForSelector(selector);
        await cdpSession.send('Agent.type', { selector, content: text });
        logger.debug('Successfully filled element', { selector, textLength: text.length });
      } catch (error) {
        logger.error('Error in realFill', { selector, error });
        throw new Error(
          `Failed to type text into "${selector}": ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    /**
     * Enable automatic captcha solving with specified options
     * @param options - Configuration for auto-solve behavior
     * @throws Error if setting auto-solve fails
     */
    setAutoSolve: async (options: SetAutoSolveOptions): Promise<void> => {
      try {
        await cdpSession.send('Captcha.setAutoSolve', {
          autoSolve: options.autoSolve ?? true,
          options: JSON.stringify(options.options)
        });
        logger.debug('Auto-solve configured', { options });
      } catch (error) {
        logger.error('Error in setAutoSolve', { options, error });
        throw new Error(`Failed to set auto solve: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

    /**
     * Disable automatic captcha solving
     * @throws Error if disabling auto-solve fails
     */
    disableCaptchaAutoSolve: async (): Promise<void> => {
      try {
        await cdpSession.send('Captcha.setAutoSolve', { autoSolve: false });
        logger.debug('Auto-solve disabled');
      } catch (error) {
        logger.error('Error in disableCaptchaAutoSolve', { error });
        throw new Error(
          `Failed to disable captcha auto solve: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    /**
     * Manually solve a captcha with specified options
     * @param options - Captcha solving configuration including timeout and captcha types
     * @returns Promise resolving to captcha solving result
     * @throws Error if captcha solving fails
     */
    solveCaptcha: async (
      options: { timeout?: number; options?: CaptchaOptions[] } = {}
    ): Promise<CaptchaCDPResponse> => {
      const solveOptions = {
        detectTimeout: options.timeout || 30_000
      } as any;

      if (options.options) {
        solveOptions.options = JSON.stringify(options.options);
      }

      try {
        const result = await cdpSession.send('Captcha.solve', solveOptions);
        logger.debug('Captcha solve attempt completed', { result });
        return result;
      } catch (error) {
        logger.error('Error in solveCaptcha', { options, error });
        throw new Error(`Failed to solve captcha: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

    // ============================================================================
    // EVENT-BASED METHODS
    // ============================================================================

    /**
     * Wait for a captcha to be detected on the page
     * @param options - Configuration including timeout
     * @returns Promise resolving when captcha is detected or timeout occurs
     * @throws Error if waiting fails
     */
    waitCaptchaDetected: async (options: { timeout?: number } = {}): Promise<CaptchaCDPResponse> => {
      const { timeout = 30_000 } = options;
      logger.debug(`Waiting for captcha detected with timeout: ${timeout}ms`);

      try {
        return Promise.race([
          // Timeout promise
          new Promise<CaptchaCDPResponse>(resolve => {
            setTimeout(() => {
              resolve({ success: false, message: 'Timeout waiting for captcha detected' });
            }, timeout);
          }),

          // Captcha detection promise
          new Promise<CaptchaCDPResponse>(resolve => {
            cdpSession.on('Captcha.detected', (response: CaptchaCDPResponse) => {
              logger.debug('Captcha detected event received', { response });
              resolve(response);
            });
          })
        ]);
      } catch (error) {
        logger.error('Error in waitCaptchaDetected', { error });
        throw new Error(
          `Failed to wait for captcha detected: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    /**
     * Wait for a captcha to be solved (either successfully or failed)
     * @param options - Configuration including timeout
     * @returns Promise resolving when captcha solving completes or timeout occurs
     * @throws Error if waiting fails
     */
    waitCaptchaSolved: async (options: { timeout?: number } = {}): Promise<CaptchaCDPResponse> => {
      const { timeout = 30_000 } = options;
      logger.debug(`Waiting for captcha solved with timeout: ${timeout}ms`);

      try {
        return Promise.race([
          // Success promise
          new Promise<CaptchaCDPResponse>(resolve => {
            cdpSession.on('Captcha.solveFinished', (response: CaptchaCDPResponse) => {
              logger.debug('Captcha solve finished event received', { response });
              resolve(response);
            });
          }),

          // Failure promise
          new Promise<CaptchaCDPResponse>(resolve => {
            cdpSession.on('Captcha.solveFailed', (response: CaptchaCDPResponse) => {
              logger.debug('Captcha solve failed event received', { response });
              resolve(response);
            });
          }),

          // Timeout promise
          new Promise<CaptchaCDPResponse>(resolve => {
            setTimeout(() => {
              resolve({ success: false, message: 'Timeout waiting for captcha solved' });
            }, timeout);
          })
        ]);
      } catch (error) {
        logger.error('Error in waitCaptchaSolved', { error });
        throw new Error(`Failed to wait for captcha solved: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  // Use Proxy to seamlessly extend the original CDP session
  return new Proxy(cdpSession, {
    get(target, prop, receiver) {
      // If the property exists in our custom methods, return it
      if (prop in customMethods) {
        return customMethods[prop as keyof typeof customMethods];
      }
      // Otherwise, return the original property from the CDP session
      return Reflect.get(target, prop, receiver);
    }
  }) as ScrapelessCDPSession;
}

/**
 * Enhanced Playwright browser implementation using Scrapeless API
 * Provides additional automation capabilities and browser control
 */
export class ScrapelessPlaywright extends BaseBrowser {
  /**
   * constructor - use static connect method instead
   */
  constructor() {
    super();
  }

  /**
   * Create and connect to a Playwright browser instance
   * @param config Optional Scrapeless configuration
   * @returns Connected Playwright instance
   * @throws Error if connection fails
   */
  public async connect(config: PlaywrightLaunchOptions & ScrapelessConfig = {}): Promise<Browser> {
    super.initBrowserService(config);

    if (!this.browserService) {
      throw new Error('Browser service not initialized');
    }
    try {
      // Create browser session via Scrapeless API
      const { browserWSEndpoint } = this.browserService.create(config);
      logger.debug('Connecting to browser via Scrapeless API', {
        browserWSEndpoint,
        sessionName: config.session_name,
        proxyCountry: config.proxy_country
      });

      // Connect using Playwright
      const browser = await chromium.connectOverCDP(browserWSEndpoint);
      logger.info('Successfully connected to Scrapeless browser', {
        sessionName: config.session_name
      });

      return browser;
    } catch (error) {
      logger.error('Failed to connect to Scrapeless browser', {
        error,
        config: {
          sessionName: config.session_name,
          proxyCountry: config.proxy_country
        }
      });
      throw new Error(`Failed to connect to browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Singleton instance of ScrapelessPlaywright for convenient access
 *
 * @example
 * ```typescript
 * import { Playwright } from '@scrapeless-ai/sdk';
 *
 * const browser = await Playwright.connect({
 *   session_name: 'my-session',
 *   proxy_country: 'US'
 * });
 * ```
 */
export const Playwright = new ScrapelessPlaywright();
