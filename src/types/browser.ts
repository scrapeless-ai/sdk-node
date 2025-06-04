import { Viewport, Browser, Page, CDPSession } from 'puppeteer-core';
import { Browser as PlaywrightBrowser, Page as PlaywrightPage, BrowserContext } from 'playwright-core';

// ============================================================================
// BROWSER CONFIGURATION INTERFACES
// ============================================================================

/**
 * Browser session creation options
 */
export interface ICreateBrowser {
  session_name?: string;
  session_ttl?: number;
  session_recording?: boolean;
  proxy_country?: string;
  proxy_url?: string;
  fingerprint?: object;
}

/**
 * Browser session creation response
 */
export interface ICreateBrowserResponse {
  browserWSEndpoint: string;
}

/**
 * Base interface for browser launch options
 */
export interface BaseLaunchOptions extends ICreateBrowser {
  defaultViewport?: any | null;
}

/**
 * Puppeteer specific launch options
 */
export interface PuppeteerLaunchOptions extends BaseLaunchOptions {
  defaultViewport?: Viewport | null;
}

/**
 * Playwright specific launch options
 */
export interface PlaywrightLaunchOptions extends BaseLaunchOptions {}

// ============================================================================
// CAPTCHA RELATED INTERFACES
// ============================================================================

/**
 * Captcha detection and solving response
 */
export interface CaptchaCDPResponse {
  success: boolean;
  message: string;
  type?: 'recaptcha' | 'hcaptcha' | 'turnstile' | 'cloudflare';
  token?: string;
}

/**
 * Captcha configuration options
 */
export interface CaptchaOptions {
  type: 'recaptcha' | 'hcaptcha' | 'turnstile' | 'cloudflare';
  disabled: boolean;
}

/**
 * Auto-solve configuration options
 */
export interface SetAutoSolveOptions {
  autoSolve?: boolean;
  options?: CaptchaOptions[];
}

// ============================================================================
// CDP COMMAND INTERFACES
// ============================================================================

/**
 * CDP Agent commands interface
 */
export type AgentCommands = {
  'Agent.liveURL': () => Promise<{ error?: string; liveURL?: string }>;
  'Agent.click': (params: { selector: string }) => Promise<void>;
  'Agent.type': (params: { selector: string; content: string }) => Promise<void>;
  'Captcha.setAutoSolve': (params: { autoSolve: boolean; options?: string }) => Promise<void>;
  'Captcha.solve': (params: { detectTimeout: number; options?: string }) => Promise<CaptchaCDPResponse>;
};

/**
 * CDP Event commands interface
 */
export type EventCommands = {
  'Captcha.detected': (response: CaptchaCDPResponse) => void;
  'Captcha.solveFinished': (response: CaptchaCDPResponse) => void;
  'Captcha.solveFailed': (response: CaptchaCDPResponse) => void;
};

export type CustomCDPCommands = {
  send<T extends keyof AgentCommands>(method: T, ...params: Parameters<AgentCommands[T]>): ReturnType<AgentCommands[T]>;

  on<T extends keyof EventCommands>(event: T, listener: EventCommands[T]): void;
};

/**
 * Common response type for liveURL method
 */
export interface LiveURLResponse {
  error: string | null;
  liveURL: string | null;
}

// ============================================================================
// EXTENDED CDP SESSION INTERFACE
// ============================================================================

/**
 * Extended CDP Session with Scrapeless custom methods
 */
export interface ScrapelessCDPSession extends CDPSession {
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

  /**
   * Set auto solve for a captcha
   * @param options Optional auto solve configuration
   * @throws Error if the operation fails
   */
  setAutoSolve(options?: SetAutoSolveOptions): Promise<void>;

  /**
   * Disable auto solve for a captcha
   * @throws Error if the operation fails
   */
  disableCaptchaAutoSolve(): Promise<void>;

  /**
   * Solve a captcha
   * @param options Optional solve configuration
   * @throws Error if the operation fails
   */
  solveCaptcha(options?: { timeout?: number; options?: CaptchaOptions[] }): Promise<CaptchaCDPResponse>;

  /**
   * Wait for a captcha to be detected
   * @param options Optional wait configuration
   * @throws Error if the operation fails
   */
  waitCaptchaDetected(options?: { timeout?: number }): Promise<CaptchaCDPResponse>;

  /**
   * Wait for a captcha to be solved
   * @param options Optional wait configuration
   * @throws Error if the operation fails
   */
  waitCaptchaSolved(options?: { timeout?: number }): Promise<CaptchaCDPResponse>;
}

// ============================================================================
// PUPPETEER EXTENDED INTERFACES
// ============================================================================

/**
 * Extended Puppeteer Browser with Scrapeless enhancements
 */
export interface ScrapelessPuppeteerBrowser extends Browser {
  newPage: () => Promise<ScrapelessPuppeteerPage>;
}

/**
 * Extended Puppeteer Page with enhanced createCDPSession method
 */
export interface ScrapelessPuppeteerPage extends Page {
  /**
   * Create a CDP session with extended Scrapeless methods
   * @returns Extended CDP session with custom methods
   */
  createCDPSession(): Promise<ScrapelessCDPSession>;
}

// ============================================================================
// PLAYWRIGHT EXTENDED INTERFACES
// ============================================================================

/**
 * Extended Playwright Browser with Scrapeless enhancements
 */
export interface ScrapelessPlaywrightBrowser extends PlaywrightBrowser {
  page: ScrapelessPlaywrightPage;
  newPage: () => Promise<ScrapelessPlaywrightPage>;
  contexts: () => Array<ScrapelessPlaywrightContext>;
}

/**
 * Extended Playwright Context with Scrapeless enhancements
 */
export interface ScrapelessPlaywrightContext extends BrowserContext {
  newPage: () => Promise<ScrapelessPlaywrightPage>;
}

/**
 * Extended Playwright Page with Scrapeless custom methods
 * Note: Playwright uses a different CDP implementation than Puppeteer
 */
export interface ScrapelessPlaywrightPage extends PlaywrightPage {
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

  /**
   * Set auto solve for a captcha
   * @param options Optional auto solve configuration
   * @throws Error if the operation fails
   */
  setAutoSolve(options?: SetAutoSolveOptions): Promise<void>;

  /**
   * Wait for a captcha to be detected
   * @param options Optional wait configuration
   * @throws Error if the operation fails
   */
  waitCaptchaDetected(options?: { timeout?: number }): Promise<CaptchaCDPResponse>;

  /**
   * Wait for a captcha to be solved
   * @param options Optional wait configuration
   * @throws Error if the operation fails
   */
  waitCaptchaSolved(options?: { timeout?: number }): Promise<CaptchaCDPResponse>;
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use ScrapelessCDPSession instead
 * Keep this for backward compatibility
 */
export type CustomPuppeteerCDPSession = ScrapelessCDPSession;
