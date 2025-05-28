import { Viewport } from 'puppeteer-core';

// Extend Puppeteer's Page type with our custom methods
declare module 'puppeteer-core' {
  interface Page {
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
}

// Extend Playwright's Page type with our custom methods
declare module 'playwright-core' {
  interface Page {
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
}

export interface ICreateBrowser {
  session_name?: string;
  session_ttl?: number;
  session_recording?: boolean;
  proxy_country?: string;
  proxy_url?: string;
  fingerprint?: object;
}

export interface ICreateBrowserResponse {
  browserWSEndpoint: string;
}

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
 * Interface for Puppeteer specific launch options
 */
export interface PuppeteerLaunchOptions extends BaseLaunchOptions {
  defaultViewport?: Viewport | null;
}

/**
 * Interface for Playwright specific launch options
 */
export interface PlaywrightLaunchOptions extends BaseLaunchOptions {}
