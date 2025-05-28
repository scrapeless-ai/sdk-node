/**
 * Scraping request parameters
 */
export interface ScrapingTaskRequest {
  /**
   * Actor identifier (e.g., "scraper.amazon", "scraper.walmart")
   */
  actor: string;

  /**
   * Input parameters for the scraper
   */
  input: {
    /**
     * Additional input parameters
     */
    [key: string]: any;
  };

  /**
   * Proxy configuration
   */
  proxy?: {
    /**
     * Proxy country code (e.g., "US", "GB")
     */
    country: string;
  };

  /**
   * Whether to execute the task asynchronously
   */
  async?: boolean;

  /**
   * Additional options
   */
  [key: string]: any;
}

/**
 * Task response from API
 */
export interface ScrapingTaskResponse {
  /**
   * Response message
   */
  message: string;

  /**
   * Task ID for tracking the request
   */
  taskId: string;

  [key: string]: any;
}
